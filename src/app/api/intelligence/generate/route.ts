import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { randomUUID } from 'crypto';

/* ══════════════════════════════════════════════════════════════════
   POST /api/intelligence/generate
   Accepts analysis configuration and returns mock report data.
   ══════════════════════════════════════════════════════════════════ */

interface GenerateRequest {
  companyName: string;
  therapyArea: string;
  indication: string;
  analyses: string[];
  outputFormat: 'pdf' | 'pptx' | 'in_app';
  confidentiality: 'confidential' | 'highly_confidential';
}

const ANALYSIS_META: Record<string, { title: string }> = {
  market_sizing:          { title: 'Market Sizing' },
  competitive_landscape:  { title: 'Competitive Landscape' },
  regulatory_pathway:     { title: 'Regulatory Pathway' },
  deal_valuation:         { title: 'Deal Valuation' },
  sensitivity_analysis:   { title: 'Sensitivity Analysis' },
  clinical_pipeline:      { title: 'Clinical Pipeline' },
  partner_discovery:      { title: 'Partner Discovery' },
  pricing_intelligence:   { title: 'Pricing Intelligence' },
  patent_ip_landscape:    { title: 'Patent & IP Landscape' },
  company_deep_dive:      { title: 'Company Deep Dive' },
};

function generateMockSection(analysisType: string, companyName: string) {
  const meta = ANALYSIS_META[analysisType];
  if (!meta) return null;

  const sectionData: Record<string, { content: string; metrics: Record<string, string | number> }> = {
    market_sizing: {
      content: `The total addressable market for ${companyName}'s lead indication is estimated at $14.2B globally, with the serviceable addressable market at $4.8B across the US and EU5. Patient funnel analysis indicates approximately 2.4M diagnosed patients with a treatment-seeking rate of 67%. Geographic breakdown shows 58% US, 28% EU5, 14% ROW. Growth is driven by increasing diagnosis rates and novel treatment modalities.`,
      metrics: { tam: '$14.2B', sam: '$4.8B', som_y5: '$1.2B', patient_population: '2.4M', cagr: '12.3%' },
    },
    competitive_landscape: {
      content: `The competitive landscape includes 12 active programs across all clinical stages. Four competitors have Phase 3 or approved assets. White space analysis reveals moderate opportunity in combination therapy approaches. ${companyName}'s mechanism of action provides strong differentiation versus current standard of care, with potential for best-in-class efficacy profile.`,
      metrics: { total_competitors: 12, phase3_plus: 4, white_space: 'Moderate', differentiation: 'Strong' },
    },
    regulatory_pathway: {
      content: `Recommended regulatory pathway is 505(b)(2) with potential for Fast Track designation based on unmet medical need criteria. Estimated timeline to NDA submission is 24 months from Phase 3 initiation. Key risk factors include endpoint selection and comparator arm design. Orphan Drug Designation may be applicable depending on indication refinement.`,
      metrics: { primary_path: '505(b)(2)', designation: 'Fast Track', est_timeline_months: 24, risk_level: 'Moderate' },
    },
    deal_valuation: {
      content: `Based on 8 comparable transactions in the last 24 months, expected deal terms include an upfront payment of $180M (median), development and commercial milestones totaling $750M, and tiered royalties of 12-18% on net sales. Total potential deal value of $930M positions this in the upper quartile for the therapeutic area.`,
      metrics: { upfront: '$180M', milestones: '$750M', royalties: '12-18%', total_value: '$930M' },
    },
    sensitivity_analysis: {
      content: `Sensitivity analysis across pricing (±20%), market share (15-35%), and launch timing (±12 months) scenarios. Base case NPV of $2.1B with probability-adjusted value of $1.4B. Key value driver is peak market share assumption, contributing 42% of variance. Downside protection is strong with bear case still showing positive NPV.`,
      metrics: { base_npv: '$2.1B', bull_case: '$3.8B', bear_case: '$680M', prob_adjusted: '$1.4B' },
    },
    clinical_pipeline: {
      content: `Three active clinical trials identified: one Phase 2b (78% enrolled, readout Q3 2026), one Phase 1b expansion (recruiting), and one investigator-sponsored study. Competitive trial landscape shows 8 trials in similar indications with 3 expected readouts in the next 12 months. Enrollment pace is on track with protocol amendments incorporated.`,
      metrics: { active_trials: 3, enrollment: '78%', next_readout: 'Q3 2026', success_probability: '64%' },
    },
    partner_discovery: {
      content: `Eight potential partners identified through strategic fit analysis. Four rank as high-fit based on therapeutic area overlap, pipeline gaps, and geographic presence. Three companies are actively seeking assets in this space based on public commentary and conference presentations. Top match shows 89% strategic alignment score.`,
      metrics: { top_matches: 8, high_fit: 4, active_seekers: 3, avg_premium: '45%' },
    },
    pricing_intelligence: {
      content: `Comparable drug pricing analysis indicates WAC range of $85,000-$145,000 annually. Net pricing after rebates estimated at $62,000-$98,000. Gross-to-net discounts of 28-35% expected. Payer mix analysis shows 72% commercial, 18% Medicare, 10% Medicaid. Value-based contracting may offer upside.`,
      metrics: { wac_range: '$85K-$145K', net_price: '$62K-$98K', gtn: '28-35%', payer_mix_commercial: '72%' },
    },
    patent_ip_landscape: {
      content: `Six key patents identified covering composition of matter, methods of use, and formulation. Earliest patent expiration in 2034 with regulatory exclusivity extending to 2037. Freedom-to-operate analysis indicates low risk with no blocking patents identified in current landscape. Patent term extensions may be available.`,
      metrics: { key_patents: 6, earliest_expiry: '2034', fto_risk: 'Low', exclusivity_until: '2037' },
    },
    company_deep_dive: {
      content: `${companyName} is a clinical-stage company with 85 employees and $210M in cash, providing approximately 18 months of runway at current burn rate. Leadership team includes former executives from major pharma companies. Three institutional investors hold 65% of equity. Recent hires in commercial and regulatory affairs signal preparation for late-stage development.`,
      metrics: { founded: '2019', employees: 85, cash_position: '$210M', runway_months: 18 },
    },
  };

  const data = sectionData[analysisType] || {
    content: `Analysis for ${companyName} is being compiled from proprietary data sources.`,
    metrics: {},
  };

  return {
    type: analysisType,
    title: meta.title,
    content: data.content,
    metrics: data.metrics,
  };
}

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body: GenerateRequest = await request.json();

    // Validate required fields
    if (!body.companyName || !body.analyses || body.analyses.length === 0) {
      return NextResponse.json(
        { error: 'companyName and at least one analysis type are required.' },
        { status: 400 },
      );
    }

    // Validate analysis types
    const validTypes = Object.keys(ANALYSIS_META);
    const invalidTypes = body.analyses.filter(a => !validTypes.includes(a));
    if (invalidTypes.length > 0) {
      return NextResponse.json(
        { error: `Invalid analysis types: ${invalidTypes.join(', ')}` },
        { status: 400 },
      );
    }

    // Simulate processing delay
    await new Promise(resolve => setTimeout(resolve, 1500));

    // Build report
    const sections = body.analyses
      .map(type => generateMockSection(type, body.companyName))
      .filter(Boolean);

    const report = {
      reportId: randomUUID(),
      title: `${body.companyName} — Advisory Intelligence Report`,
      sections,
      generatedAt: new Date().toISOString(),
      estimatedConfidence: body.analyses.length >= 5 ? 'high' : 'medium',
    };

    return NextResponse.json(report);
  } catch {
    return NextResponse.json(
      { error: 'Failed to generate report. Please try again.' },
      { status: 500 },
    );
  }
}
