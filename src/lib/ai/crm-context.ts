import { createClient } from '@supabase/supabase-js';

// ---------------------------------------------------------------------------
// RAG Pipeline — Pull relevant context from CRM
// ---------------------------------------------------------------------------

export interface CRMContext {
  similarCompanies: { name: string; type: string; score: number | null; stage: string | null }[];
  existingContacts: { name: string; title: string | null; relationship: string }[];
  relatedDeals: { title: string; stage: string; value: number | null; type: string }[];
  sectorStats: { totalCompanies: number; totalDeals: number; avgDealSize: number | null };
  hasExistingRelationship: boolean;
}

export async function getCRMContext(
  companyName: string,
  sector: string,
  therapyArea: string
): Promise<CRMContext> {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  const emptyContext: CRMContext = {
    similarCompanies: [],
    existingContacts: [],
    relatedDeals: [],
    sectorStats: { totalCompanies: 0, totalDeals: 0, avgDealSize: null },
    hasExistingRelationship: false,
  };

  if (!supabaseUrl || !serviceKey) {
    return emptyContext;
  }

  try {
    const supabase = createClient(supabaseUrl, serviceKey);

    // 1. Find similar companies (same sector or therapy area)
    const { data: similarOrgs } = await supabase
      .from('organizations')
      .select('name, type, targeting_score, stage')
      .or(`type.eq.${sector}${therapyArea ? `,therapy_areas.cs.{${therapyArea}}` : ''}`)
      .limit(10);

    // 2. Check if this company already exists in CRM
    const { data: existingOrg } = await supabase
      .from('organizations')
      .select('id, name')
      .ilike('name', `%${companyName}%`)
      .limit(1);

    let existingContacts: CRMContext['existingContacts'] = [];
    if (existingOrg && existingOrg.length > 0) {
      const { data: contacts } = await supabase
        .from('contacts')
        .select('first_name, last_name, title, relationship_strength')
        .eq('organization_id', existingOrg[0].id)
        .limit(5);

      if (contacts) {
        existingContacts = contacts.map(c => ({
          name: `${c.first_name} ${c.last_name}`,
          title: c.title,
          relationship: c.relationship_strength,
        }));
      }
    }

    // 3. Find related deals (same sector/therapy area)
    const { data: deals } = await supabase
      .from('deals')
      .select('title, stage, estimated_value, deal_type')
      .or(`therapy_area.eq.${therapyArea || 'none'}`)
      .not('stage', 'in', '(closed_lost)')
      .limit(5);

    // 4. Sector stats
    const { count: companyCount } = await supabase
      .from('organizations')
      .select('id', { count: 'exact', head: true })
      .eq('type', sector);

    const { data: dealStats } = await supabase
      .from('deals')
      .select('estimated_value')
      .not('estimated_value', 'is', null);

    const avgDeal = dealStats && dealStats.length > 0
      ? dealStats.reduce((s, d) => s + (d.estimated_value || 0), 0) / dealStats.length
      : null;

    return {
      similarCompanies: (similarOrgs || []).map(o => ({
        name: o.name,
        type: o.type,
        score: o.targeting_score,
        stage: o.stage,
      })),
      existingContacts,
      relatedDeals: (deals || []).map(d => ({
        title: d.title,
        stage: d.stage,
        value: d.estimated_value,
        type: d.deal_type,
      })),
      sectorStats: {
        totalCompanies: companyCount || 0,
        totalDeals: dealStats?.length || 0,
        avgDealSize: avgDeal,
      },
      hasExistingRelationship: existingContacts.length > 0,
    };
  } catch (error) {
    console.error('[CRM Context] Error fetching context:', error);
    return emptyContext;
  }
}
