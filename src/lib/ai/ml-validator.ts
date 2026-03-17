// ---------------------------------------------------------------------------
// ML Cross-Validator
// Checks AI scores against statistical baselines, flags outliers,
// and applies hard business rules
// ---------------------------------------------------------------------------

export interface ValidationResult {
  isValid: boolean;
  adjustedScores: Record<string, number>;
  flags: string[];
  confidenceMultiplier: number; // 0-1, reduces confidence if scores seem off
}

// Historical calibration data — these update as outcomes are tracked
// For now: industry benchmarks for life sciences advisory
const BENCHMARKS = {
  // Average conversion rates by referral type
  referralConversion: {
    board_referral: 0.65,
    partner_referral: 0.50,
    conference: 0.25,
    inbound: 0.40,
    cold: 0.08,
  },

  // Average fee as % of deal size by sector
  feeRatio: {
    biotech: 0.028,
    pharma: 0.022,
    medtech: 0.025,
    diagnostics: 0.025,
    digital_health: 0.030,
    healthcare: 0.020,
    nutraceuticals: 0.022,
  },

  // Typical score ranges (mean ± 1 std dev)
  scoreRanges: {
    strategicFit: { mean: 3.2, stdDev: 1.1 },
    feePotential: { mean: 2.8, stdDev: 1.3 },
    winProbability: { mean: 2.5, stdDev: 1.2 },
    executionRisk: { mean: 3.5, stdDev: 0.9 },
    strategicValue: { mean: 2.3, stdDev: 1.0 },
  },

  // Hard business rules
  minimumDealSize: 10, // $10M minimum for advisory engagement
  maximumActiveDeals: 12, // team capacity ceiling
};

export function validateScreening(
  aiScores: Record<string, number>,
  context: {
    dealSize: number;
    sector: string;
    referralSource: string;
    companyStage: string;
  }
): ValidationResult {
  const flags: string[] = [];
  const adjustedScores = { ...aiScores };
  let confidenceMultiplier = 1.0;

  // ─── Rule 1: Deal size minimum ───
  if (context.dealSize > 0 && context.dealSize < BENCHMARKS.minimumDealSize) {
    flags.push(`Deal size ($${context.dealSize}M) is below $${BENCHMARKS.minimumDealSize}M minimum threshold for advisory engagements`);
    adjustedScores.feePotential = Math.min(adjustedScores.feePotential || 1, 1);
  }

  // ─── Rule 2: Statistical outlier detection ───
  for (const [dim, range] of Object.entries(BENCHMARKS.scoreRanges)) {
    const score = aiScores[dim];
    if (score !== undefined) {
      const zScore = Math.abs(score - range.mean) / range.stdDev;
      if (zScore > 2.0) {
        flags.push(`${dim} score (${score}) is a statistical outlier (${zScore.toFixed(1)}σ from mean) — review rationale carefully`);
        confidenceMultiplier *= 0.85;
      }
    }
  }

  // ─── Rule 3: Cross-dimensional consistency ───
  // High win probability with no strategic fit is suspicious
  if ((aiScores.winProbability || 0) >= 4 && (aiScores.strategicFit || 0) <= 2) {
    flags.push('High win probability but low strategic fit — verify this aligns with Ambrosia\'s positioning');
    confidenceMultiplier *= 0.9;
  }

  // High fee potential with low win probability may not be worth pursuing
  if ((aiScores.feePotential || 0) >= 4 && (aiScores.winProbability || 0) <= 2) {
    flags.push('High fee potential but low win probability — consider ROI of business development investment');
  }

  // ─── Rule 4: Sector-adjusted fee sanity check ───
  const sectorFeeRatio = BENCHMARKS.feeRatio[context.sector as keyof typeof BENCHMARKS.feeRatio] || 0.025;
  const expectedFee = context.dealSize * sectorFeeRatio;
  if (context.dealSize > 0 && expectedFee < 0.5) {
    flags.push(`Expected fee (~$${(expectedFee).toFixed(1)}M) is low for advisory engagement — consider retainer-heavy structure`);
  }

  // ─── Rule 5: Stage-based reality check ───
  if (context.companyStage === 'seed' && context.dealSize > 100) {
    flags.push('Seed-stage company with $100M+ deal size is unusual — verify deal size estimate');
    confidenceMultiplier *= 0.8;
  }

  if (context.companyStage === 'public' && (aiScores.strategicFit || 0) >= 4) {
    // Ambrosia focuses on early-stage — public company high fit score needs justification
    flags.push('Public company scoring high on strategic fit — Ambrosia typically focuses on Series A-C');
    confidenceMultiplier *= 0.9;
  }

  return {
    isValid: flags.length <= 2, // more than 2 flags = review carefully
    adjustedScores,
    flags,
    confidenceMultiplier: Math.max(confidenceMultiplier, 0.5),
  };
}

// ---------------------------------------------------------------------------
// Ensemble Scorer — combines AI + ML + validation
// ---------------------------------------------------------------------------

export function ensembleScore(
  aiScore: number,
  mlBaseScore: number,
  validationMultiplier: number,
  // Weights: how much to trust each layer
  weights = { ai: 0.6, ml: 0.25, validation: 0.15 }
): number {
  // Weighted combination of AI and ML scores
  const blended = (aiScore * weights.ai) + (mlBaseScore * weights.ml);

  // Apply validation confidence
  const validated = blended * (1 - weights.validation + weights.validation * validationMultiplier);

  return Math.max(1, Math.min(5, Math.round(validated)));
}
