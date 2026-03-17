// ---------------------------------------------------------------------------
// Opportunity Screening Engine
// AI-driven assessment: user provides context, engine infers scores
// ---------------------------------------------------------------------------

export interface OpportunityContext {
  companyName: string;
  sector: string;       // biotech, pharma, medtech, diagnostics, digital_health, healthcare, nutraceuticals
  therapyArea: string;  // optional — from THERAPY_AREAS
  companyStage: string; // seed, series_a, series_b, series_c, growth, public
  dealSize: number;     // estimated deal size in millions USD
  description: string;  // what the company does, what they need
  referralSource: string; // how you heard about this opportunity
  knownContacts: string;  // any existing contacts or relationships
  urgency: string;      // any timeline pressure or catalysts
  additionalNotes: string;
}

export interface DimensionScore {
  score: number;
  max: 5;
  rationale: string;
}

export interface ScreeningResult {
  score: number; // 5-25
  recommendation: 'pursue_aggressively' | 'pursue_selectively' | 'monitor' | 'pass';
  recommendationLabel: string;
  recommendationColor: string;
  engagementType: string; // what type of mandate this would be
  dimensions: {
    strategicFit: DimensionScore;
    feePotential: DimensionScore & { estimatedFee: string };
    winProbability: DimensionScore;
    executionRisk: DimensionScore;
    strategicValue: DimensionScore;
  };
  suggestedNextSteps: string[];
  estimatedFeeRange: { low: string; high: string };
  riskFactors: string[];
}

// ---------------------------------------------------------------------------
// Ambrosia's core expertise — used to assess strategic fit
// ---------------------------------------------------------------------------

const CORE_SECTORS = ['biotech', 'pharma'];
const ADJACENT_SECTORS = ['medtech', 'diagnostics', 'digital_health'];
const EXTENDED_SECTORS = ['healthcare', 'nutraceuticals'];

const SWEET_SPOT_STAGES = ['series_a', 'series_b', 'series_c'];
const GOOD_STAGES = ['growth', 'seed'];

// Keywords that signal specific engagement types
const MA_SIGNALS = ['acquisition', 'acquire', 'sell', 'sale', 'exit', 'buyout', 'merger', 'divest', 'spin-off', 'carve-out'];
const LICENSING_SIGNALS = ['license', 'licensing', 'out-license', 'in-license', 'rights', 'territory'];
const PARTNERSHIP_SIGNALS = ['partner', 'partnership', 'co-develop', 'collaboration', 'alliance', 'joint venture'];
const FUNDRAISING_SIGNALS = ['fundrais', 'raise', 'series', 'round', 'capital', 'investor', 'financing', 'ipo'];
const STRATEGY_SIGNALS = ['strategy', 'strategic', 'assessment', 'review', 'advisory', 'consult', 'roadmap', 'positioning'];

// Keywords that signal relationship warmth
const WARM_REFERRAL_SIGNALS = ['board', 'introduced', 'referred', 'former colleague', 'partner referral', 'existing relationship'];
const DIRECT_SIGNALS = ['reached out', 'direct', 'conference', 'met at', 'inbound', 'contacted us'];

// Risk signals
const URGENCY_SIGNALS = ['urgent', 'immediately', 'asap', 'compressed', 'tight timeline', 'quickly'];
const COMPLEXITY_SIGNALS = ['complex', 'novel', 'unprecedented', 'cross-border', 'multi-party', 'restructuring'];

// ---------------------------------------------------------------------------
// Modified Lehman formula
// ---------------------------------------------------------------------------

function calculateLehmanFee(dealSizeM: number): { low: number; high: number } {
  let fee = 0;
  const size = dealSizeM;

  if (size <= 10) fee = size * 0.05;
  else if (size <= 50) fee = 0.5 + (size - 10) * 0.04;
  else if (size <= 100) fee = 0.5 + 1.6 + (size - 50) * 0.03;
  else if (size <= 250) fee = 0.5 + 1.6 + 1.5 + (size - 100) * 0.02;
  else fee = 0.5 + 1.6 + 1.5 + 3.0 + (size - 250) * 0.01;

  return {
    low: Math.round(fee * 0.7 * 10) / 10,
    high: Math.round(fee * 1.3 * 10) / 10,
  };
}

function formatFee(m: number): string {
  if (m >= 1) return `$${m.toFixed(1)}M`;
  return `$${Math.round(m * 1000)}K`;
}

// ---------------------------------------------------------------------------
// AI Inference Engine
// ---------------------------------------------------------------------------

function containsAny(text: string, keywords: string[]): boolean {
  const lower = text.toLowerCase();
  return keywords.some(k => lower.includes(k));
}

function inferEngagementType(ctx: OpportunityContext): string {
  const allText = `${ctx.description} ${ctx.additionalNotes} ${ctx.urgency}`.toLowerCase();

  const scores = [
    { type: 'M&A Advisory', score: MA_SIGNALS.filter(s => allText.includes(s)).length * 3 },
    { type: 'Licensing Advisory', score: LICENSING_SIGNALS.filter(s => allText.includes(s)).length * 3 },
    { type: 'Partnership Advisory', score: PARTNERSHIP_SIGNALS.filter(s => allText.includes(s)).length * 3 },
    { type: 'Fundraising Advisory', score: FUNDRAISING_SIGNALS.filter(s => allText.includes(s)).length * 3 },
    { type: 'Strategic Advisory', score: STRATEGY_SIGNALS.filter(s => allText.includes(s)).length * 3 },
  ];

  // Stage-based inference
  if (['seed', 'series_a', 'series_b'].includes(ctx.companyStage)) {
    scores.find(s => s.type === 'Fundraising Advisory')!.score += 2;
  }
  if (['growth', 'public'].includes(ctx.companyStage)) {
    scores.find(s => s.type === 'M&A Advisory')!.score += 2;
  }
  if (ctx.dealSize > 200) {
    scores.find(s => s.type === 'M&A Advisory')!.score += 2;
  }

  scores.sort((a, b) => b.score - a.score);

  if (scores[0].score === 0) return 'Strategic Advisory';
  return scores[0].type;
}

function inferStrategicFit(ctx: OpportunityContext): DimensionScore {
  let score = 0;
  const reasons: string[] = [];

  // Sector alignment
  if (CORE_SECTORS.includes(ctx.sector)) {
    score += 2;
    reasons.push(`${ctx.sector} is a core sector for Ambrosia`);
  } else if (ADJACENT_SECTORS.includes(ctx.sector)) {
    score += 1;
    reasons.push(`${ctx.sector} is adjacent to our core expertise`);
  } else if (EXTENDED_SECTORS.includes(ctx.sector)) {
    score += 0.5;
    reasons.push(`${ctx.sector} is outside primary focus but within life sciences`);
  }

  // Stage alignment
  if (SWEET_SPOT_STAGES.includes(ctx.companyStage)) {
    score += 2;
    reasons.push(`${ctx.companyStage.replace('_', ' ')} is in our sweet spot`);
  } else if (GOOD_STAGES.includes(ctx.companyStage)) {
    score += 1;
    reasons.push(`${ctx.companyStage} stage is workable`);
  } else {
    score += 0.5;
    reasons.push('Company stage is outside typical range');
  }

  // Therapy area alignment
  if (ctx.therapyArea) {
    score += 1;
    reasons.push(`Active in ${ctx.therapyArea}`);
  }

  return {
    score: Math.min(Math.round(score), 5),
    max: 5,
    rationale: reasons.join('. ') + '.',
  };
}

function inferFeePotential(ctx: OpportunityContext): DimensionScore & { estimatedFee: string } {
  const fee = calculateLehmanFee(ctx.dealSize);
  let score = 0;
  const reasons: string[] = [];

  if (ctx.dealSize >= 500) { score = 5; reasons.push('Large transaction with significant fee potential'); }
  else if (ctx.dealSize >= 200) { score = 4; reasons.push('Meaningful deal size with strong fee upside'); }
  else if (ctx.dealSize >= 100) { score = 3; reasons.push('Mid-size transaction with moderate fee potential'); }
  else if (ctx.dealSize >= 50) { score = 2; reasons.push('Smaller deal — fee may require retainer supplement'); }
  else { score = 1; reasons.push('Small deal size — retainer-driven economics'); }

  if (ctx.dealSize >= 50) {
    reasons.push(`Estimated success fee: ${formatFee(fee.low)} – ${formatFee(fee.high)}`);
  }

  return {
    score: Math.min(score, 5),
    max: 5,
    rationale: reasons.join('. ') + '.',
    estimatedFee: `${formatFee(fee.low)} – ${formatFee(fee.high)}`,
  };
}

function inferWinProbability(ctx: OpportunityContext): DimensionScore {
  let score = 1;
  const reasons: string[] = [];
  const allText = `${ctx.referralSource} ${ctx.knownContacts} ${ctx.description}`.toLowerCase();

  if (containsAny(allText, WARM_REFERRAL_SIGNALS)) {
    score += 2;
    reasons.push('Warm referral increases win probability');
  } else if (containsAny(allText, DIRECT_SIGNALS)) {
    score += 1;
    reasons.push('Direct contact — moderate conversion likelihood');
  } else {
    reasons.push('Cold or unknown referral source — lower conversion expected');
  }

  if (ctx.knownContacts.trim().length > 10) {
    score += 1;
    reasons.push('Existing contacts at the company improve access');
  }

  // Inbound signals are strong
  if (allText.includes('inbound') || allText.includes('contacted us') || allText.includes('reached out to us')) {
    score += 1;
    reasons.push('Inbound interest signals high intent');
  }

  return {
    score: Math.min(Math.round(score), 5),
    max: 5,
    rationale: reasons.join('. ') + '.',
  };
}

function inferExecutionRisk(ctx: OpportunityContext): DimensionScore {
  let score = 4; // start optimistic (low risk = high score)
  const reasons: string[] = [];
  const allText = `${ctx.description} ${ctx.urgency} ${ctx.additionalNotes}`.toLowerCase();

  if (containsAny(allText, URGENCY_SIGNALS)) {
    score -= 1;
    reasons.push('Compressed timeline increases execution risk');
  }

  if (containsAny(allText, COMPLEXITY_SIGNALS)) {
    score -= 1;
    reasons.push('Deal complexity adds execution challenges');
  }

  if (ctx.dealSize > 500) {
    score -= 0.5;
    reasons.push('Large deal size requires senior bandwidth');
  }

  if (reasons.length === 0) {
    reasons.push('No significant execution risk factors identified');
  }

  return {
    score: Math.max(Math.min(Math.round(score), 5), 1),
    max: 5,
    rationale: reasons.join('. ') + '.',
  };
}

function inferStrategicValue(ctx: OpportunityContext): DimensionScore {
  let score = 1;
  const reasons: string[] = [];
  const allText = `${ctx.description} ${ctx.additionalNotes}`.toLowerCase();

  // New sector/TA expansion
  if (ADJACENT_SECTORS.includes(ctx.sector) || EXTENDED_SECTORS.includes(ctx.sector)) {
    score += 1;
    reasons.push('Could expand our sector coverage');
  }

  // Large or notable company
  if (ctx.dealSize > 300 || allText.includes('marquee') || allText.includes('well-known') || allText.includes('leading')) {
    score += 1;
    reasons.push('Potential marquee client for the portfolio');
  }

  // Cross-sell potential
  if (allText.includes('multiple') || allText.includes('ongoing') || allText.includes('long-term') || allText.includes('additional')) {
    score += 1;
    reasons.push('Cross-sell potential for future engagements');
  }

  // Relationship building
  if (allText.includes('investor') || allText.includes('fund') || allText.includes('family office')) {
    score += 1;
    reasons.push('Opportunity to build valuable investor relationships');
  }

  if (reasons.length === 0) {
    reasons.push('Standard engagement — no exceptional strategic value signals');
  }

  return {
    score: Math.min(Math.round(score), 5),
    max: 5,
    rationale: reasons.join('. ') + '.',
  };
}

// ---------------------------------------------------------------------------
// Main screening function
// ---------------------------------------------------------------------------

export function screenOpportunity(ctx: OpportunityContext): ScreeningResult {
  const strategicFit = inferStrategicFit(ctx);
  const feePotential = inferFeePotential(ctx);
  const winProbability = inferWinProbability(ctx);
  const executionRisk = inferExecutionRisk(ctx);
  const strategicValue = inferStrategicValue(ctx);

  const totalScore = strategicFit.score + feePotential.score + winProbability.score + executionRisk.score + strategicValue.score;

  const engagementType = inferEngagementType(ctx);

  // Recommendation
  let recommendation: ScreeningResult['recommendation'];
  let recommendationLabel: string;
  let recommendationColor: string;

  if (totalScore >= 20) {
    recommendation = 'pursue_aggressively';
    recommendationLabel = 'Pursue Aggressively';
    recommendationColor = '#34d399';
  } else if (totalScore >= 15) {
    recommendation = 'pursue_selectively';
    recommendationLabel = 'Pursue Selectively';
    recommendationColor = '#5fd4e3';
  } else if (totalScore >= 10) {
    recommendation = 'monitor';
    recommendationLabel = 'Monitor & Revisit';
    recommendationColor = '#fbbf24';
  } else {
    recommendation = 'pass';
    recommendationLabel = 'Decline or Refer';
    recommendationColor = '#f87171';
  }

  // Next steps
  const nextSteps: Record<string, string[]> = {
    pursue_aggressively: [
      'Assign senior partner within 24 hours',
      `Prepare ${engagementType.toLowerCase()} credential deck`,
      'Schedule management meeting this week',
      'Draft engagement letter with fee proposal',
    ],
    pursue_selectively: [
      'Prepare preliminary analysis',
      'Schedule introductory call within the week',
      'Assess team capacity before committing',
    ],
    monitor: [
      "Add to pipeline as 'Watching'",
      'Set reminder to revisit in 30 days',
      'Maintain relationship contact',
    ],
    pass: [
      'Draft polite decline note',
      'Offer referral to trusted firm if appropriate',
      'Log for future reference',
    ],
  };

  // Risk factors
  const risks: string[] = [];
  const allText = `${ctx.description} ${ctx.urgency} ${ctx.additionalNotes}`.toLowerCase();

  if (containsAny(allText, URGENCY_SIGNALS)) risks.push('Compressed timeline may affect deliverable quality');
  if (containsAny(allText, COMPLEXITY_SIGNALS)) risks.push('Novel deal structure requires additional research and preparation');
  if (winProbability.score <= 2) risks.push('Weak relationship with decision-maker — longer sales cycle expected');
  if (executionRisk.score <= 2) risks.push('Multiple execution risk factors identified — monitor closely');
  if (!CORE_SECTORS.includes(ctx.sector) && !ADJACENT_SECTORS.includes(ctx.sector)) {
    risks.push('Outside core sector — may require external expertise');
  }

  const fee = calculateLehmanFee(ctx.dealSize);

  return {
    score: totalScore,
    recommendation,
    recommendationLabel,
    recommendationColor,
    engagementType,
    dimensions: {
      strategicFit,
      feePotential,
      winProbability,
      executionRisk,
      strategicValue,
    },
    suggestedNextSteps: nextSteps[recommendation],
    estimatedFeeRange: { low: formatFee(fee.low), high: formatFee(fee.high) },
    riskFactors: risks,
  };
}
