import { THERAPY_AREAS } from '@/lib/data/therapy-areas';
import type {
  ScoringInput,
  ScoringResult,
  ScoreBucket,
  ScoreBreakdown,
} from '@/types/scoring';

const CORE_TA_IDS = new Set(THERAPY_AREAS.map((ta) => ta.id));

// ---------------------------------------------------------------------------
// Score maps
// ---------------------------------------------------------------------------

const STAGE_SCORES: Record<string, number> = {
  seed: 8,
  series_a: 15,
  series_b: 20,
  series_c: 25,
  growth: 18,
  public: 10,
};

const PHASE_SCORES: Record<string, number> = {
  preclinical: 5,
  phase_1: 10,
  phase_1_2: 15,
  phase_2: 20,
  phase_2_3: 22,
  phase_3: 25,
  approved: 18,
};

const RELATIONSHIP_SCORES: Record<string, number> = {
  warm_intro: 25,
  direct: 18,
  met_once: 10,
  cold: 3,
};

const BUCKET_COLORS: Record<string, string> = {
  hot_lead: '#34d399',
  warm: '#5fd4e3',
  cold: '#94a3b8',
  follow_up: '#fbbf24',
  strategic_watch: '#9499d1',
  nurture: '#60a5fa',
};

const BUCKET_LABELS: Record<string, string> = {
  hot_lead: 'Hot Lead',
  warm: 'Warm',
  cold: 'Cold',
  follow_up: 'Follow Up',
  strategic_watch: 'Strategic Watch',
  nurture: 'Nurture',
};

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function clamp(value: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, value));
}

function fundingScore(totalFunding: number | null): number {
  if (totalFunding == null) return 0;
  if (totalFunding > 200_000_000) return 10;
  if (totalFunding > 100_000_000) return 8;
  if (totalFunding > 50_000_000) return 5;
  return 0;
}

function hasCoreTAOverlap(therapyAreas: string[]): boolean {
  return therapyAreas.some((ta) => CORE_TA_IDS.has(ta));
}

// ---------------------------------------------------------------------------
// Dimension calculators
// ---------------------------------------------------------------------------

function scoreCompanyFit(input: ScoringInput): { score: number; reasons: string[] } {
  const reasons: string[] = [];
  const components: number[] = [];

  // Stage score
  const stageVal = STAGE_SCORES[input.companyStage ?? ''] ?? 0;
  if (stageVal > 0) {
    components.push(stageVal);
    reasons.push(`Company stage (${input.companyStage}) contributes ${stageVal} pts`);
  }

  // Lead asset phase
  const phaseVal = PHASE_SCORES[input.leadAssetPhase ?? ''] ?? 0;
  if (phaseVal > 0) {
    components.push(phaseVal);
    reasons.push(`Lead asset phase (${input.leadAssetPhase}) contributes ${phaseVal} pts`);
  }

  // Therapy area alignment
  if (hasCoreTAOverlap(input.therapyAreas)) {
    components.push(5);
    reasons.push('Therapy areas align with Ambrosia core focus (+5)');
  }

  // Funding
  const fScore = fundingScore(input.totalFunding);
  if (fScore > 0) {
    components.push(fScore);
    reasons.push(
      `Total funding $${((input.totalFunding ?? 0) / 1_000_000).toFixed(0)}M (+${fScore})`
    );
  }

  // Average the components, normalize to 0-25
  const avg = components.length > 0 ? components.reduce((a, b) => a + b, 0) / components.length : 0;
  const normalized = clamp(Math.round(avg), 0, 25);
  return { score: normalized, reasons };
}

function scoreRelationship(input: ScoringInput): { score: number; reasons: string[] } {
  const reasons: string[] = [];
  let total = 0;

  // Base relationship score
  const relVal = RELATIONSHIP_SCORES[input.relationshipStrength] ?? 3;
  total += relVal;
  reasons.push(`Relationship strength (${input.relationshipStrength}): ${relVal} pts`);

  // Existing contacts bonus
  if (input.hasExistingContacts) {
    total += 5;
    reasons.push('Has existing contacts at company (+5)');
  }

  // Recency bonus
  if (input.lastContactedDaysAgo != null) {
    if (input.lastContactedDaysAgo < 7) {
      total += 5;
      reasons.push('Last contacted within 7 days (+5)');
    } else if (input.lastContactedDaysAgo <= 30) {
      total += 2;
      reasons.push('Last contacted within 30 days (+2)');
    }
    // >30 days: +0
  } else {
    total -= 3;
    reasons.push('Never contacted (-3)');
  }

  return { score: clamp(total, 0, 25), reasons };
}

function scoreMarketTiming(input: ScoringInput): { score: number; reasons: string[] } {
  const reasons: string[] = [];
  let total = 0;

  // Upcoming catalysts
  if (input.upcomingCatalysts) {
    total += 15;
    reasons.push('Upcoming catalysts identified (+15)');
  }

  // Recent news sentiment
  if (input.recentNews === 'positive') {
    total += 10;
    reasons.push('Recent positive news (+10)');
  } else if (input.recentNews === 'neutral') {
    total += 3;
    reasons.push('Recent neutral news (+3)');
  } else if (input.recentNews === 'negative') {
    total -= 5;
    reasons.push('Recent negative news (-5)');
  }

  // Competitive density
  if (input.competitiveDensity === 'low') {
    total += 8;
    reasons.push('Low competitive density (+8)');
  } else if (input.competitiveDensity === 'medium') {
    total += 5;
    reasons.push('Medium competitive density (+5)');
  } else if (input.competitiveDensity === 'high') {
    total += 2;
    reasons.push('High competitive density (+2)');
  }

  // Young company bonus
  if (input.foundedYear != null) {
    const age = new Date().getFullYear() - input.foundedYear;
    if (age < 5) {
      total += 3;
      reasons.push(`Founded ${age} years ago, likely needs advisory (+3)`);
    }
  }

  return { score: clamp(total, 0, 25), reasons };
}

function scoreAdvisoryOpportunity(input: ScoringInput): { score: number; reasons: string[] } {
  const reasons: string[] = [];
  let total = 0;

  // Service needs: +5 each, max 15
  const servicePoints = Math.min(input.likelyServiceNeed.length * 5, 15);
  if (servicePoints > 0) {
    total += servicePoints;
    reasons.push(
      `${input.likelyServiceNeed.length} likely service need(s): ${input.likelyServiceNeed.join(', ')} (+${servicePoints})`
    );
  }

  // Deal readiness signals: +4 each, max 20
  const signalPoints = Math.min(input.dealReadinessSignals.length * 4, 20);
  if (signalPoints > 0) {
    total += signalPoints;
    reasons.push(
      `${input.dealReadinessSignals.length} deal readiness signal(s): ${input.dealReadinessSignals.join(', ')} (+${signalPoints})`
    );
  }

  return { score: clamp(total, 0, 25), reasons };
}

// ---------------------------------------------------------------------------
// Bucket classification
// ---------------------------------------------------------------------------

function classifyBucket(
  score: number,
  input: ScoringInput,
  therapyAreasInCore: boolean
): { bucket: ScoreBucket; followUpDate: string | null; suggestedAction: string } {
  // Follow-up takes priority when there are upcoming catalysts and score is decent
  if (input.upcomingCatalysts && score >= 50) {
    const followUpDate = new Date();
    followUpDate.setDate(followUpDate.getDate() + 30);
    return {
      bucket: 'follow_up',
      followUpDate: followUpDate.toISOString().split('T')[0],
      suggestedAction: 'Monitor upcoming catalyst and schedule pre-event outreach',
    };
  }

  if (score >= 80) {
    return {
      bucket: 'hot_lead',
      followUpDate: null,
      suggestedAction: 'Reach out this week',
    };
  }

  if (score >= 60) {
    return {
      bucket: 'warm',
      followUpDate: null,
      suggestedAction: 'Nurture relationship, schedule check-in',
    };
  }

  if (score >= 40) {
    return {
      bucket: 'cold',
      followUpDate: null,
      suggestedAction: 'Add to monitoring list',
    };
  }

  // Sub-40 but in a core TA
  if (therapyAreasInCore) {
    return {
      bucket: 'strategic_watch',
      followUpDate: null,
      suggestedAction: 'Monitor for signals',
    };
  }

  return {
    bucket: 'nurture',
    followUpDate: null,
    suggestedAction: 'Long-term relationship building',
  };
}

// ---------------------------------------------------------------------------
// Main scoring function
// ---------------------------------------------------------------------------

export function calculateScore(input: ScoringInput): ScoringResult {
  const companyFit = scoreCompanyFit(input);
  const relationship = scoreRelationship(input);
  const marketTiming = scoreMarketTiming(input);
  const advisory = scoreAdvisoryOpportunity(input);

  const breakdown: ScoreBreakdown = {
    companyFit: companyFit.score,
    relationshipStrength: relationship.score,
    marketTiming: marketTiming.score,
    advisoryOpportunity: advisory.score,
  };

  const totalScore = clamp(
    breakdown.companyFit +
      breakdown.relationshipStrength +
      breakdown.marketTiming +
      breakdown.advisoryOpportunity,
    0,
    100
  );

  const therapyAreasInCore = hasCoreTAOverlap(input.therapyAreas);
  const { bucket, followUpDate, suggestedAction } = classifyBucket(
    totalScore,
    input,
    therapyAreasInCore
  );

  const reasoning = [
    ...companyFit.reasons,
    ...relationship.reasons,
    ...marketTiming.reasons,
    ...advisory.reasons,
  ];

  return {
    score: totalScore,
    bucket,
    followUpDate,
    reasoning,
    breakdown,
    suggestedAction,
  };
}

// ---------------------------------------------------------------------------
// Display helpers
// ---------------------------------------------------------------------------

export function getBucketColor(bucket: string): string {
  return BUCKET_COLORS[bucket] ?? '#94a3b8';
}

export function getBucketLabel(bucket: string): string {
  return BUCKET_LABELS[bucket] ?? 'Unknown';
}
