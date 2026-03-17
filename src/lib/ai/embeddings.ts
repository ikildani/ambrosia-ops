// ---------------------------------------------------------------------------
// Embeddings Layer — Perplexity pplx-embed-v1-4b
// Vector similarity for finding related companies, deals, and screenings
// ---------------------------------------------------------------------------

import { createClient } from '@supabase/supabase-js';

export interface EmbeddingResult {
  embedding: number[];
  text: string;
}

export interface SimilarEntity {
  id: string;
  name: string;
  type: string;
  similarity: number; // 0-1
  context: string;
}

// ---------------------------------------------------------------------------
// Generate embeddings via Perplexity
// ---------------------------------------------------------------------------

export async function generateEmbedding(text: string): Promise<number[] | null> {
  const apiKey = process.env.PERPLEXITY_API_KEY;
  if (!apiKey) return null;

  try {
    const response = await fetch('https://api.perplexity.ai/v1/embeddings', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        input: [text.slice(0, 2000)], // limit input length
        model: 'pplx-embed-v1-4b',
      }),
    });

    if (!response.ok) {
      console.error('[Embeddings] API error:', response.status);
      return null;
    }

    const data = await response.json();
    return data.data?.[0]?.embedding || null;
  } catch (error) {
    console.error('[Embeddings] Error:', error);
    return null;
  }
}

export async function generateEmbeddings(texts: string[]): Promise<(number[] | null)[]> {
  const apiKey = process.env.PERPLEXITY_API_KEY;
  if (!apiKey) return texts.map(() => null);

  try {
    const response = await fetch('https://api.perplexity.ai/v1/embeddings', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        input: texts.map(t => t.slice(0, 2000)),
        model: 'pplx-embed-v1-4b',
      }),
    });

    if (!response.ok) return texts.map(() => null);

    const data = await response.json();
    return data.data?.map((d: { embedding: number[] }) => d.embedding) || texts.map(() => null);
  } catch {
    return texts.map(() => null);
  }
}

// ---------------------------------------------------------------------------
// Cosine Similarity
// ---------------------------------------------------------------------------

function cosineSimilarity(a: number[], b: number[]): number {
  if (a.length !== b.length) return 0;

  let dotProduct = 0;
  let normA = 0;
  let normB = 0;

  for (let i = 0; i < a.length; i++) {
    dotProduct += a[i] * b[i];
    normA += a[i] * a[i];
    normB += b[i] * b[i];
  }

  const denominator = Math.sqrt(normA) * Math.sqrt(normB);
  if (denominator === 0) return 0;

  return dotProduct / denominator;
}

// ---------------------------------------------------------------------------
// Store and retrieve embeddings from Supabase
// ---------------------------------------------------------------------------

export async function storeEmbedding(
  entityType: 'organization' | 'deal' | 'screening' | 'contact',
  entityId: string,
  text: string,
  embedding: number[]
): Promise<void> {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!supabaseUrl || !serviceKey) return;

  const supabase = createClient(supabaseUrl, serviceKey);

  await supabase.from('embeddings').upsert({
    entity_type: entityType,
    entity_id: entityId,
    text_content: text.slice(0, 5000),
    embedding: JSON.stringify(embedding),
    updated_at: new Date().toISOString(),
  }, {
    onConflict: 'entity_type,entity_id',
  });
}

export async function findSimilar(
  embedding: number[],
  entityType: 'organization' | 'deal' | 'screening' | 'contact' | null,
  limit: number = 5
): Promise<SimilarEntity[]> {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!supabaseUrl || !serviceKey) return [];

  const supabase = createClient(supabaseUrl, serviceKey);

  let query = supabase.from('embeddings').select('entity_type, entity_id, text_content, embedding');

  if (entityType) {
    query = query.eq('entity_type', entityType);
  }

  const { data } = await query.limit(100); // fetch candidates

  if (!data || data.length === 0) return [];

  // Compute similarities in memory (for small-medium datasets this is fine)
  const scored = data
    .map(row => {
      let storedEmbedding: number[];
      try {
        storedEmbedding = typeof row.embedding === 'string'
          ? JSON.parse(row.embedding)
          : row.embedding;
      } catch {
        return null;
      }

      if (!Array.isArray(storedEmbedding)) return null;

      return {
        id: row.entity_id,
        type: row.entity_type,
        context: row.text_content?.slice(0, 200) || '',
        similarity: cosineSimilarity(embedding, storedEmbedding),
      };
    })
    .filter((x): x is NonNullable<typeof x> => x !== null && x.similarity > 0.3)
    .sort((a, b) => b.similarity - a.similarity)
    .slice(0, limit);

  // Fetch names for the similar entities
  const results: SimilarEntity[] = [];

  for (const item of scored) {
    let name = item.context.slice(0, 50);

    const supabase2 = createClient(supabaseUrl, serviceKey);

    if (item.type === 'organization') {
      const { data: org } = await supabase2.from('organizations').select('name').eq('id', item.id).single();
      if (org) name = org.name;
    } else if (item.type === 'deal') {
      const { data: deal } = await supabase2.from('deals').select('title').eq('id', item.id).single();
      if (deal) name = deal.title;
    } else if (item.type === 'screening') {
      const { data: screen } = await supabase2.from('screenings').select('company_name').eq('id', item.id).single();
      if (screen) name = screen.company_name;
    } else if (item.type === 'contact') {
      const { data: contact } = await supabase2.from('contacts').select('first_name, last_name').eq('id', item.id).single();
      if (contact) name = `${contact.first_name} ${contact.last_name}`;
    }

    results.push({
      id: item.id,
      name,
      type: item.type,
      similarity: Math.round(item.similarity * 100) / 100,
      context: item.context,
    });
  }

  return results;
}

// ---------------------------------------------------------------------------
// Build text representation for embedding
// ---------------------------------------------------------------------------

export function buildCompanyEmbeddingText(company: {
  name: string;
  type: string;
  stage?: string | null;
  therapy_areas?: string[];
  description?: string | null;
  lead_asset?: string | null;
  lead_asset_phase?: string | null;
}): string {
  const parts = [
    company.name,
    `Type: ${company.type}`,
    company.stage ? `Stage: ${company.stage}` : '',
    company.therapy_areas?.length ? `Therapy areas: ${company.therapy_areas.join(', ')}` : '',
    company.description || '',
    company.lead_asset ? `Lead asset: ${company.lead_asset} (${company.lead_asset_phase || 'unknown phase'})` : '',
  ].filter(Boolean);

  return parts.join('. ');
}

export function buildScreeningEmbeddingText(screening: {
  companyName: string;
  sector: string;
  therapyArea?: string;
  companyStage?: string;
  description: string;
  dealSize?: number;
}): string {
  const parts = [
    screening.companyName,
    `Sector: ${screening.sector}`,
    screening.therapyArea ? `Therapy area: ${screening.therapyArea}` : '',
    screening.companyStage ? `Stage: ${screening.companyStage}` : '',
    `Deal size: $${screening.dealSize || 0}M`,
    screening.description,
  ].filter(Boolean);

  return parts.join('. ');
}

export function buildDealEmbeddingText(deal: {
  title: string;
  deal_type: string;
  therapy_area?: string | null;
  indication?: string | null;
  estimated_value?: number | null;
  notes?: string | null;
}): string {
  const parts = [
    deal.title,
    `Type: ${deal.deal_type}`,
    deal.therapy_area ? `Therapy area: ${deal.therapy_area}` : '',
    deal.indication ? `Indication: ${deal.indication}` : '',
    deal.estimated_value ? `Value: $${deal.estimated_value}M` : '',
    deal.notes || '',
  ].filter(Boolean);

  return parts.join('. ');
}
