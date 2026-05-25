import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import Anthropic from '@anthropic-ai/sdk';

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { companyName, companyType } = await request.json();

    if (!companyName) {
      return NextResponse.json({ error: 'Company name is required' }, { status: 400 });
    }

    const perplexityKey = process.env.PERPLEXITY_API_KEY;
    const anthropicKey = process.env.ANTHROPIC_API_KEY;

    if (!perplexityKey || !anthropicKey) {
      return NextResponse.json({ error: 'Enrichment service not configured' }, { status: 503 });
    }

    const perplexityRes = await fetch('https://api.perplexity.ai/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${perplexityKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'sonar',
        messages: [
          {
            role: 'user',
            content: `Research this company thoroughly for M&A advisory evaluation. Return ONLY factual, verifiable information with specific numbers, dates, and names.

Company: ${companyName}
${companyType ? `Sector: ${companyType}` : ''}

I need:
1. Company overview — what they do, year founded, headquarters city and country, approximate employee count
2. Total funding raised and last funding round details (amount, date, lead investors)
3. Lead product/asset name and its clinical development phase
4. Key therapy areas and indications
5. Recent news from the last 6 months — any deals, partnerships, clinical readouts, or regulatory events
6. Competitive landscape — who are their main competitors
7. Any upcoming catalysts (clinical data readouts, regulatory decisions, conference presentations)
8. Market sentiment — is the company viewed positively or facing challenges

Be specific with dollar amounts, dates, and names. If information is not available, say "Not found" for that field.`,
          },
        ],
        max_tokens: 2000,
        temperature: 0.1,
      }),
    });

    if (!perplexityRes.ok) {
      console.error('[Enrichment] Perplexity API error:', perplexityRes.status);
      return NextResponse.json({ error: 'Research service unavailable' }, { status: 502 });
    }

    const perplexityData = await perplexityRes.json();
    const rawResearch = perplexityData.choices?.[0]?.message?.content || '';
    const citations = perplexityData.citations || [];

    const anthropic = new Anthropic({ apiKey: anthropicKey });

    const parseResponse = await anthropic.messages.create({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 1500,
      system: 'You are a data extraction assistant. Parse unstructured company research into a structured JSON object. Return ONLY valid JSON with no explanation or markdown.',
      messages: [{
        role: 'user',
        content: `Parse this company research into structured fields. Return a JSON object with these exact keys. Use null for any field where the information was not found or is uncertain.

Research data:
${rawResearch}

Required JSON structure:
{
  "website": "string or null — company website URL",
  "hq_city": "string or null",
  "hq_country": "string or null",
  "founded_year": "number or null",
  "employee_range": "string or null — e.g. '51-200', '201-500', '501-1000'",
  "stage": "string or null — one of: seed, series_a, series_b, series_c, growth, public",
  "total_funding": "number or null — total funding in USD (just the number, no currency symbol)",
  "last_funding_date": "string or null — ISO date format YYYY-MM-DD",
  "lead_asset": "string or null — name of lead product/drug candidate",
  "lead_asset_phase": "string or null — e.g. 'Phase 1', 'Phase 2', 'Phase 3', 'Approved', 'Preclinical'",
  "therapy_areas": ["array of strings — e.g. 'oncology', 'neurology', 'immunology'"],
  "indications": ["array of strings — specific disease indications"],
  "description": "string — 2-3 sentence company description",
  "has_catalysts": true/false,
  "catalyst_description": "string or null — describe upcoming catalysts",
  "market_position": "string or null — one of: 'low', 'moderate', 'high' competition",
  "news_sentiment": "string or null — one of: 'positive', 'neutral', 'negative'",
  "recent_news": ["array of strings — recent headlines"],
  "competitors": ["array of strings — competitor company names"],
  "key_people": ["array of strings — key executive names and titles"]
}`,
      }],
    });

    const parseText = parseResponse.content[0].type === 'text' ? parseResponse.content[0].text : '';

    let enrichedData;
    try {
      const jsonMatch = parseText.match(/\{[\s\S]*\}/);
      enrichedData = jsonMatch ? JSON.parse(jsonMatch[0]) : null;
    } catch {
      enrichedData = null;
    }

    if (!enrichedData) {
      return NextResponse.json({ error: 'Failed to parse research data' }, { status: 500 });
    }

    await supabase.from('enrichment_cache').upsert({
      entity_type: 'organization',
      entity_name: companyName.toLowerCase(),
      data: { ...enrichedData, raw_research: rawResearch, citations },
      expires_at: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
    }, { onConflict: 'entity_type,entity_name' }).select();

    return NextResponse.json({
      data: enrichedData,
      sources: citations,
      timestamp: new Date().toISOString(),
    });
  } catch (err) {
    console.error('[Enrichment] Error:', err);
    return NextResponse.json({ error: 'Enrichment failed' }, { status: 500 });
  }
}
