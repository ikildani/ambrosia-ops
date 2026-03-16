// ---------------------------------------------------------------------------
// Opportunity Screening Engine
// Structured framework for evaluating inbound M&A advisory mandates
// ---------------------------------------------------------------------------

export interface ScreeningInput {
  // Strategic Fit
  therapyAreaAlignment: 'core' | 'adjacent' | 'outside';
  dealTypeExperience: 'extensive' | 'some' | 'none';
  clientProfile: 'ideal' | 'good' | 'marginal';

  // Fee Potential
  estimatedDealSize: number; // in millions USD
  retainerLikelihood: 'yes' | 'no';
  successFeeProbability: 'high' | 'medium' | 'low';

  // Win Probability
  relationshipWithDecisionMaker: 'strong' | 'moderate' | 'none';
  competitiveSituation: 'sole_source' | 'limited' | 'bakeoff';
  referralQuality: 'board_member' | 'partner_referral' | 'direct' | 'cold';

  // Execution Risk
  teamCapacity: 'available' | 'manageable' | 'stretched';
  complexity: 'straightforward' | 'moderate' | 'novel';
  timeline: 'comfortable' | 'tight' | 'aggressive';

  // Strategic Value
  opensNewTA: boolean;
  marqueeClient: boolean;
  crossSellPotential: boolean;
  relationshipBuilding: boolean;
  repeatBusinessLikely: boolean;
}

export interface DimensionScore {
  score: number;
  max: 5;
  rationale: string;
  estimatedFee?: string;
}

export interface ScreeningResult {
  score: number;
  recommendation: 'pursue_aggressively' | 'pursue_selectively' | 'monitor' | 'pass';
  recommendationLabel: string;
  recommendationColor: string;
  dimensions: {
    strategicFit: DimensionScore;
    feePotential: DimensionScore;
    winProbability: DimensionScore;
    executionRisk: DimensionScore;
    strategicValue: DimensionScore;
  };
  suggestedNextSteps: string[];
  estimatedFeeRange: { low: string; high: string };
  riskFactors: string[];
}

// ---------------------------------------------------------------------------
// Score maps
// ---------------------------------------------------------------------------

const TA_ALIGNMENT_SCORES: Record<string, number> = {
  core: 5,
  adjacent: 3,
  outside: 1,
};

const DEAL_EXPERIENCE_SCORES: Record<string, number> = {
  extensive: 5,
  some: 3,
  none: 1,
};

const CLIENT_PROFILE_SCORES: Record<string, number> = {
  ideal: 5,
  good: 3,
  marginal: 1,
};

const SUCCESS_FEE_SCORES: Record<string, number> = {
  high: 5,
  medium: 3,
  low: 1,
};

const RELATIONSHIP_SCORES: Record<string, number> = {
  strong: 5,
  moderate: 3,
  none: 1,
};

const COMPETITIVE_SCORES: Record<string, number> = {
  sole_source: 5,
  limited: 3,
  bakeoff: 1,
};

const REFERRAL_SCORES: Record<string, number> = {
  board_member: 5,
  partner_referral: 4,
  direct: 2,
  cold: 1,
};

const CAPACITY_SCORES: Record<string, number> = {
  available: 5,
  manageable: 3,
  stretched: 1,
};

const COMPLEXITY_SCORES: Record<string, number> = {
  straightforward: 5,
  moderate: 3,
  novel: 1,
};

const TIMELINE_SCORES: Record<string, number> = {
  comfortable: 5,
  tight: 3,
  aggressive: 1,
};

// ---------------------------------------------------------------------------
// Modified Lehman formula
// ---------------------------------------------------------------------------

function calculateLehmanFee(dealSizeM: number): number {
  if (dealSizeM <= 0) return 0;

  let fee = 0;
  const size = dealSizeM;

  // First $10M at 5%
  fee += Math.min(size, 10) * 0.05;
  if (size <= 10) return fee;

  // $10M–$50M at 4%
  fee += Math.min(size - 10, 40) * 0.04;
  if (size <= 50) return fee;

  // $50M–$100M at 3%
  fee += Math.min(size - 50, 50) * 0.03;
  if (size <= 100) return fee;

  // $100M–$250M at 2%
  fee += Math.min(size - 100, 150) * 0.02;
  if (size <= 250) return fee;

  // $250M+ at 1%
  fee += (size - 250) * 0.01;

  return fee;
}

function formatFee(feeM: number): string {
  if (feeM >= 1) {
    return `$${feeM.toFixed(1)}M`;
  }
  return `$${(feeM * 1000).toFixed(0)}K`;
}

// ---------------------------------------------------------------------------
// Recommendation mapping
// ---------------------------------------------------------------------------

const NEXT_STEPS: Record<string, string[]> = {
  pursue_aggressively: [
    'Assign senior partner within 24 hours',
    'Prepare credential deck',
    'Schedule management meeting this week',
    'Draft engagement letter',
  ],
  pursue_selectively: [
    'Prepare preliminary analysis',
    'Schedule introductory call',
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

// ---------------------------------------------------------------------------
// Core screening function
// ---------------------------------------------------------------------------

export function screenOpportunity(input: ScreeningInput): ScreeningResult {
  // 1. Strategic Fit (average of 3 sub-scores, mapped to 1–5)
  const sfRaw =
    (TA_ALIGNMENT_SCORES[input.therapyAreaAlignment] +
      DEAL_EXPERIENCE_SCORES[input.dealTypeExperience] +
      CLIENT_PROFILE_SCORES[input.clientProfile]) /
    3;
  const strategicFitScore = Math.round(sfRaw);

  const sfRationale = buildStrategicFitRationale(input);

  // 2. Fee Potential
  const lehmanFee = calculateLehmanFee(input.estimatedDealSize);
  const retainerAdd =
    input.retainerLikelihood === 'yes'
      ? input.estimatedDealSize >= 100
        ? 0.15
        : input.estimatedDealSize >= 50
          ? 0.1
          : 0.05
      : 0;

  // Score fee potential based on total expected fee
  const totalExpectedFee = lehmanFee + retainerAdd;
  let feeScore: number;
  if (totalExpectedFee >= 5) feeScore = 5;
  else if (totalExpectedFee >= 2) feeScore = 4;
  else if (totalExpectedFee >= 0.8) feeScore = 3;
  else if (totalExpectedFee >= 0.3) feeScore = 2;
  else feeScore = 1;

  // Adjust for success fee probability
  const successFeeAdj = SUCCESS_FEE_SCORES[input.successFeeProbability];
  feeScore = Math.round((feeScore + successFeeAdj) / 2);
  feeScore = Math.min(5, Math.max(1, feeScore));

  const feeRationale = buildFeeRationale(input, lehmanFee, retainerAdd);

  // Fee range
  const lowFee = lehmanFee * 0.7 + (input.retainerLikelihood === 'yes' ? 0.05 : 0);
  const highFee = lehmanFee * 1.3 + (input.retainerLikelihood === 'yes' ? 0.15 : 0);

  // 3. Win Probability
  const wpRaw =
    (RELATIONSHIP_SCORES[input.relationshipWithDecisionMaker] +
      COMPETITIVE_SCORES[input.competitiveSituation] +
      REFERRAL_SCORES[input.referralQuality]) /
    3;
  const winProbScore = Math.round(wpRaw);

  const wpRationale = buildWinProbRationale(input);

  // 4. Execution Risk (higher score = lower risk = better)
  const erRaw =
    (CAPACITY_SCORES[input.teamCapacity] +
      COMPLEXITY_SCORES[input.complexity] +
      TIMELINE_SCORES[input.timeline]) /
    3;
  const executionRiskScore = Math.round(erRaw);

  const erRationale = buildExecRiskRationale(input);

  // 5. Strategic Value (count of true booleans, capped at 5)
  const svCount = [
    input.opensNewTA,
    input.marqueeClient,
    input.crossSellPotential,
    input.relationshipBuilding,
    input.repeatBusinessLikely,
  ].filter(Boolean).length;
  const strategicValueScore = Math.min(5, Math.max(1, svCount));

  const svRationale = buildStrategicValueRationale(input, svCount);

  // Total score
  const totalScore =
    strategicFitScore + feeScore + winProbScore + executionRiskScore + strategicValueScore;

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

  // Risk factors
  const riskFactors: string[] = [];
  if (input.competitiveSituation === 'bakeoff') {
    riskFactors.push('Competitive pitch process — higher business development cost');
  }
  if (input.teamCapacity === 'stretched') {
    riskFactors.push('Team capacity constraints may affect deliverable quality');
  }
  if (input.timeline === 'aggressive') {
    riskFactors.push('Compressed timeline increases execution risk');
  }
  if (input.complexity === 'novel') {
    riskFactors.push('Novel deal structure requires additional research and preparation');
  }
  if (input.relationshipWithDecisionMaker === 'none') {
    riskFactors.push(
      'No existing relationship with decision-maker — longer sales cycle expected'
    );
  }

  return {
    score: totalScore,
    recommendation,
    recommendationLabel,
    recommendationColor,
    dimensions: {
      strategicFit: { score: strategicFitScore, max: 5, rationale: sfRationale },
      feePotential: {
        score: feeScore,
        max: 5,
        rationale: feeRationale,
        estimatedFee: formatFee(lehmanFee),
      },
      winProbability: { score: winProbScore, max: 5, rationale: wpRationale },
      executionRisk: { score: executionRiskScore, max: 5, rationale: erRationale },
      strategicValue: { score: strategicValueScore, max: 5, rationale: svRationale },
    },
    suggestedNextSteps: NEXT_STEPS[recommendation],
    estimatedFeeRange: { low: formatFee(lowFee), high: formatFee(highFee) },
    riskFactors,
  };
}

// ---------------------------------------------------------------------------
// Rationale builders
// ---------------------------------------------------------------------------

function buildStrategicFitRationale(input: ScreeningInput): string {
  const parts: string[] = [];

  if (input.therapyAreaAlignment === 'core') parts.push('Core therapy area with deep expertise');
  else if (input.therapyAreaAlignment === 'adjacent')
    parts.push('Adjacent TA with transferable knowledge');
  else parts.push('Outside core competencies');

  if (input.dealTypeExperience === 'extensive') parts.push('extensive deal-type track record');
  else if (input.dealTypeExperience === 'some') parts.push('some relevant experience');
  else parts.push('limited deal-type experience');

  if (input.clientProfile === 'ideal') parts.push('ideal client profile');
  else if (input.clientProfile === 'good') parts.push('good client fit');
  else parts.push('marginal client alignment');

  return parts.join('; ') + '.';
}

function buildFeeRationale(
  input: ScreeningInput,
  lehmanFee: number,
  retainerAdd: number
): string {
  const parts: string[] = [];

  parts.push(`${formatFee(input.estimatedDealSize)} deal size`);
  parts.push(`Lehman fee: ${formatFee(lehmanFee)}`);

  if (input.retainerLikelihood === 'yes')
    parts.push(`retainer likely (+${formatFee(retainerAdd)})`);
  else parts.push('no retainer expected');

  if (input.successFeeProbability === 'high') parts.push('high probability of success fee');
  else if (input.successFeeProbability === 'medium') parts.push('moderate success fee outlook');
  else parts.push('low success fee probability');

  return parts.join('; ') + '.';
}

function buildWinProbRationale(input: ScreeningInput): string {
  const parts: string[] = [];

  if (input.relationshipWithDecisionMaker === 'strong')
    parts.push('Strong existing DM relationship');
  else if (input.relationshipWithDecisionMaker === 'moderate')
    parts.push('Moderate DM relationship');
  else parts.push('No existing DM relationship');

  if (input.competitiveSituation === 'sole_source') parts.push('sole-source engagement');
  else if (input.competitiveSituation === 'limited') parts.push('limited competition');
  else parts.push('competitive bake-off');

  if (input.referralQuality === 'board_member') parts.push('board member referral');
  else if (input.referralQuality === 'partner_referral') parts.push('partner referral');
  else if (input.referralQuality === 'direct') parts.push('direct outreach');
  else parts.push('cold inbound');

  return parts.join('; ') + '.';
}

function buildExecRiskRationale(input: ScreeningInput): string {
  const parts: string[] = [];

  if (input.teamCapacity === 'available') parts.push('Team has available capacity');
  else if (input.teamCapacity === 'manageable') parts.push('Manageable with current workload');
  else parts.push('Team is stretched thin');

  if (input.complexity === 'straightforward') parts.push('straightforward deal structure');
  else if (input.complexity === 'moderate') parts.push('moderate complexity');
  else parts.push('novel/complex deal structure');

  if (input.timeline === 'comfortable') parts.push('comfortable timeline');
  else if (input.timeline === 'tight') parts.push('tight but feasible timeline');
  else parts.push('aggressive timeline');

  return parts.join('; ') + '.';
}

function buildStrategicValueRationale(input: ScreeningInput, count: number): string {
  if (count === 0) return 'No additional strategic value identified.';

  const parts: string[] = [];
  if (input.opensNewTA) parts.push('opens new therapy area');
  if (input.marqueeClient) parts.push('marquee client');
  if (input.crossSellPotential) parts.push('cross-sell potential');
  if (input.relationshipBuilding) parts.push('relationship building opportunity');
  if (input.repeatBusinessLikely) parts.push('repeat business likely');

  return `Strategic upside: ${parts.join(', ')}.`;
}
