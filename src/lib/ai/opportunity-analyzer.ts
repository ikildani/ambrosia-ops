import Anthropic from '@anthropic-ai/sdk';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface OpportunityContext {
  companyName: string;
  sector: string;
  therapyArea: string;
  companyStage: string;
  dealSize: number;
  description: string;
  referralSource: string;
  knownContacts: string;
  urgency: string;
  additionalNotes: string;
}

export interface DimensionAssessment {
  score: number;        // 1-5
  confidence: number;   // 0-1
  rationale: string;
  keyFactors: string[];
}

export interface AIScreeningResult {
  overallScore: number; // 5-25
  recommendation: 'pursue_aggressively' | 'pursue_selectively' | 'monitor' | 'pass';
  recommendationLabel: string;
  recommendationColor: string;
  engagementType: string;
  engagementTypeRationale: string;
  executiveSummary: string;
  dimensions: {
    strategicFit: DimensionAssessment;
    feePotential: DimensionAssessment & { estimatedFee: string };
    winProbability: DimensionAssessment;
    executionRisk: DimensionAssessment;
    strategicValue: DimensionAssessment;
  };
  suggestedNextSteps: string[];
  estimatedFeeRange: { low: string; high: string };
  riskFactors: string[];
  competitiveInsights: string[];
  keyQuestions: string[]; // questions the team should answer before proceeding
}

// ---------------------------------------------------------------------------
// ML Scoring Layer — domain-calibrated Bayesian model
// ---------------------------------------------------------------------------

// Ambrosia's domain priors — calibrated from life sciences M&A advisory patterns
const SECTOR_PRIORS: Record<string, { fitWeight: number; feeMultiplier: number; complexityBase: number }> = {
  biotech:         { fitWeight: 1.0,  feeMultiplier: 1.0,  complexityBase: 0.7 },
  pharma:          { fitWeight: 0.95, feeMultiplier: 1.1,  complexityBase: 0.6 },
  medtech:         { fitWeight: 0.75, feeMultiplier: 0.9,  complexityBase: 0.65 },
  diagnostics:     { fitWeight: 0.7,  feeMultiplier: 0.85, complexityBase: 0.6 },
  digital_health:  { fitWeight: 0.6,  feeMultiplier: 0.75, complexityBase: 0.5 },
  healthcare:      { fitWeight: 0.5,  feeMultiplier: 0.8,  complexityBase: 0.55 },
  nutraceuticals:  { fitWeight: 0.45, feeMultiplier: 0.7,  complexityBase: 0.4 },
};

const STAGE_PRIORS: Record<string, { dealProbability: number; avgDealMultiple: number; advisoryNeed: number }> = {
  seed:      { dealProbability: 0.3,  avgDealMultiple: 0.5,  advisoryNeed: 0.4 },
  series_a:  { dealProbability: 0.5,  avgDealMultiple: 0.8,  advisoryNeed: 0.7 },
  series_b:  { dealProbability: 0.7,  avgDealMultiple: 1.0,  advisoryNeed: 0.9 },
  series_c:  { dealProbability: 0.8,  avgDealMultiple: 1.2,  advisoryNeed: 0.95 },
  growth:    { dealProbability: 0.75, avgDealMultiple: 1.5,  advisoryNeed: 0.85 },
  public:    { dealProbability: 0.6,  avgDealMultiple: 2.0,  advisoryNeed: 0.7 },
};

// Modified Lehman fee calculation
function calculateLehmanFee(dealSizeM: number): { low: number; high: number; base: number } {
  let fee = 0;
  const size = dealSizeM;
  if (size <= 10) fee = size * 0.05;
  else if (size <= 50) fee = 0.5 + (size - 10) * 0.04;
  else if (size <= 100) fee = 0.5 + 1.6 + (size - 50) * 0.03;
  else if (size <= 250) fee = 0.5 + 1.6 + 1.5 + (size - 100) * 0.02;
  else fee = 0.5 + 1.6 + 1.5 + 3.0 + (size - 250) * 0.01;

  return { low: Math.round(fee * 0.7 * 10) / 10, high: Math.round(fee * 1.3 * 10) / 10, base: Math.round(fee * 10) / 10 };
}

function formatFee(m: number): string {
  return m >= 1 ? `$${m.toFixed(1)}M` : `$${Math.round(m * 1000)}K`;
}

// ML base scores — used as priors that Claude adjusts
function computeMLBaseScores(ctx: OpportunityContext) {
  const sectorPrior = SECTOR_PRIORS[ctx.sector] || SECTOR_PRIORS.biotech;
  const stagePrior = STAGE_PRIORS[ctx.companyStage] || STAGE_PRIORS.series_b;
  const fee = calculateLehmanFee(ctx.dealSize || 50);

  return {
    strategicFitBase: Math.round(sectorPrior.fitWeight * stagePrior.advisoryNeed * 5),
    feePotentialBase: ctx.dealSize >= 500 ? 5 : ctx.dealSize >= 200 ? 4 : ctx.dealSize >= 100 ? 3 : ctx.dealSize >= 50 ? 2 : 1,
    winProbabilityBase: Math.round(stagePrior.dealProbability * 5),
    executionRiskBase: Math.round((1 - sectorPrior.complexityBase) * 5),
    strategicValueBase: sectorPrior.fitWeight < 0.7 ? 3 : 2, // outside core = more strategic expansion value
    fee,
    sectorPrior,
    stagePrior,
  };
}

// ---------------------------------------------------------------------------
// Claude AI Layer — deep reasoning
// ---------------------------------------------------------------------------

export async function analyzeOpportunity(ctx: OpportunityContext): Promise<AIScreeningResult> {
  const apiKey = process.env.ANTHROPIC_API_KEY;
  const mlBase = computeMLBaseScores(ctx);
  const fee = mlBase.fee;

  // If no API key, fall back to ML-only scoring
  if (!apiKey) {
    return fallbackMLScoring(ctx, mlBase);
  }

  const anthropic = new Anthropic({ apiKey });

  const systemPrompt = `You are an elite M&A advisory analyst at Ambrosia Ventures, a boutique life sciences strategy and M&A advisory firm. You specialize in advising early-stage biotech (Series A/B/C), pharma, medtech, diagnostics, digital health, healthcare, and nutraceutical companies, as well as their investors (family offices, VCs, PEs).

Your task is to analyze an inbound opportunity and provide a structured assessment. You must be sharp, decisive, and commercially minded — like a senior partner evaluating whether to pursue a mandate.

IMPORTANT SCORING CONTEXT:
- Our ML model has computed base scores as priors. You should adjust these based on your deeper analysis of the context. The ML base scores are:
  - Strategic Fit: ${mlBase.strategicFitBase}/5
  - Fee Potential: ${mlBase.feePotentialBase}/5
  - Win Probability: ${mlBase.winProbabilityBase}/5
  - Execution Risk: ${mlBase.executionRiskBase}/5 (higher = lower risk)
  - Strategic Value: ${mlBase.strategicValueBase}/5

- Fee calculation (Modified Lehman): base=${formatFee(fee.base)}, range=${formatFee(fee.low)}-${formatFee(fee.high)}
- Sector prior weight: ${mlBase.sectorPrior.fitWeight} (1.0 = core, <0.5 = outside expertise)
- Stage deal probability: ${mlBase.stagePrior.dealProbability} (historical conversion rate)

You may adjust any score ±2 from the ML base based on contextual factors the model cannot capture (narrative quality, specific relationship dynamics, market timing signals, etc).

Respond ONLY with valid JSON matching this exact schema:
{
  "overallScore": <number 5-25>,
  "engagementType": "<M&A Advisory | Licensing Advisory | Partnership Advisory | Fundraising Advisory | Strategic Advisory>",
  "engagementTypeRationale": "<1 sentence>",
  "executiveSummary": "<2-3 sentence assessment suitable for a partner meeting>",
  "dimensions": {
    "strategicFit": { "score": <1-5>, "confidence": <0-1>, "rationale": "<2 sentences>", "keyFactors": ["<factor1>", "<factor2>"] },
    "feePotential": { "score": <1-5>, "confidence": <0-1>, "rationale": "<2 sentences>", "keyFactors": ["<factor1>", "<factor2>"], "estimatedFee": "<fee range string>" },
    "winProbability": { "score": <1-5>, "confidence": <0-1>, "rationale": "<2 sentences>", "keyFactors": ["<factor1>", "<factor2>"] },
    "executionRisk": { "score": <1-5>, "confidence": <0-1>, "rationale": "<2 sentences>", "keyFactors": ["<factor1>", "<factor2>"] },
    "strategicValue": { "score": <1-5>, "confidence": <0-1>, "rationale": "<2 sentences>", "keyFactors": ["<factor1>", "<factor2>"] }
  },
  "suggestedNextSteps": ["<step1>", "<step2>", "<step3>", "<step4>"],
  "riskFactors": ["<risk1>", "<risk2>"],
  "competitiveInsights": ["<insight1>", "<insight2>"],
  "keyQuestions": ["<question the team should answer before proceeding>", "<question2>"]
}`;

  const userPrompt = `Analyze this inbound opportunity for Ambrosia Ventures:

COMPANY: ${ctx.companyName}
SECTOR: ${ctx.sector}
THERAPY AREA: ${ctx.therapyArea || 'Not specified'}
STAGE: ${ctx.companyStage || 'Not specified'}
ESTIMATED DEAL SIZE: $${ctx.dealSize || 'Unknown'}M

DESCRIPTION:
${ctx.description}

REFERRAL SOURCE: ${ctx.referralSource || 'Not specified'}
EXISTING CONTACTS: ${ctx.knownContacts || 'None mentioned'}
TIMELINE/URGENCY: ${ctx.urgency || 'Not specified'}
ADDITIONAL NOTES: ${ctx.additionalNotes || 'None'}

Provide your structured assessment.`;

  try {
    const response = await anthropic.messages.create({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 2000,
      messages: [
        { role: 'user', content: userPrompt },
      ],
      system: systemPrompt,
    });

    const text = response.content[0].type === 'text' ? response.content[0].text : '';

    // Extract JSON from response
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      return fallbackMLScoring(ctx, mlBase);
    }

    const parsed = JSON.parse(jsonMatch[0]);

    // Determine recommendation from overall score
    const score = parsed.overallScore;
    let recommendation: AIScreeningResult['recommendation'];
    let recommendationLabel: string;
    let recommendationColor: string;

    if (score >= 20) {
      recommendation = 'pursue_aggressively';
      recommendationLabel = 'Pursue Aggressively';
      recommendationColor = '#34d399';
    } else if (score >= 15) {
      recommendation = 'pursue_selectively';
      recommendationLabel = 'Pursue Selectively';
      recommendationColor = '#5fd4e3';
    } else if (score >= 10) {
      recommendation = 'monitor';
      recommendationLabel = 'Monitor & Revisit';
      recommendationColor = '#fbbf24';
    } else {
      recommendation = 'pass';
      recommendationLabel = 'Decline or Refer';
      recommendationColor = '#f87171';
    }

    return {
      overallScore: score,
      recommendation,
      recommendationLabel,
      recommendationColor,
      engagementType: parsed.engagementType || 'Strategic Advisory',
      engagementTypeRationale: parsed.engagementTypeRationale || '',
      executiveSummary: parsed.executiveSummary || '',
      dimensions: {
        strategicFit: parsed.dimensions.strategicFit,
        feePotential: {
          ...parsed.dimensions.feePotential,
          estimatedFee: parsed.dimensions.feePotential?.estimatedFee || `${formatFee(fee.low)} – ${formatFee(fee.high)}`,
        },
        winProbability: parsed.dimensions.winProbability,
        executionRisk: parsed.dimensions.executionRisk,
        strategicValue: parsed.dimensions.strategicValue,
      },
      suggestedNextSteps: parsed.suggestedNextSteps || [],
      estimatedFeeRange: { low: formatFee(fee.low), high: formatFee(fee.high) },
      riskFactors: parsed.riskFactors || [],
      competitiveInsights: parsed.competitiveInsights || [],
      keyQuestions: parsed.keyQuestions || [],
    };
  } catch (error) {
    console.error('[AI Analyzer] Claude API error:', error);
    return fallbackMLScoring(ctx, mlBase);
  }
}

// ---------------------------------------------------------------------------
// Fallback: ML-only scoring when Claude is unavailable
// ---------------------------------------------------------------------------

function fallbackMLScoring(
  ctx: OpportunityContext,
  ml: ReturnType<typeof computeMLBaseScores>
): AIScreeningResult {
  const totalScore = ml.strategicFitBase + ml.feePotentialBase + ml.winProbabilityBase + ml.executionRiskBase + ml.strategicValueBase;

  let recommendation: AIScreeningResult['recommendation'];
  let recommendationLabel: string;
  let recommendationColor: string;

  if (totalScore >= 20) {
    recommendation = 'pursue_aggressively'; recommendationLabel = 'Pursue Aggressively'; recommendationColor = '#34d399';
  } else if (totalScore >= 15) {
    recommendation = 'pursue_selectively'; recommendationLabel = 'Pursue Selectively'; recommendationColor = '#5fd4e3';
  } else if (totalScore >= 10) {
    recommendation = 'monitor'; recommendationLabel = 'Monitor & Revisit'; recommendationColor = '#fbbf24';
  } else {
    recommendation = 'pass'; recommendationLabel = 'Decline or Refer'; recommendationColor = '#f87171';
  }

  return {
    overallScore: totalScore,
    recommendation,
    recommendationLabel,
    recommendationColor,
    engagementType: 'Strategic Advisory',
    engagementTypeRationale: 'Engagement type inferred from ML model (AI analysis unavailable).',
    executiveSummary: `${ctx.companyName} is a ${ctx.companyStage?.replace('_', ' ') || ''} ${ctx.sector} company. ML-based scoring suggests a ${recommendationLabel.toLowerCase()} approach based on sector alignment and deal characteristics. Full AI analysis unavailable — connect your Anthropic API key for deeper assessment.`,
    dimensions: {
      strategicFit: { score: ml.strategicFitBase, confidence: 0.6, rationale: `Sector weight: ${ml.sectorPrior.fitWeight}. Stage advisory need: ${ml.stagePrior.advisoryNeed}.`, keyFactors: [ctx.sector, ctx.companyStage || 'unknown stage'] },
      feePotential: { score: ml.feePotentialBase, confidence: 0.8, rationale: `Deal size of $${ctx.dealSize}M implies a Lehman fee of ${formatFee(ml.fee.base)}.`, keyFactors: [`$${ctx.dealSize}M deal`, `${formatFee(ml.fee.low)}-${formatFee(ml.fee.high)} fee range`], estimatedFee: `${formatFee(ml.fee.low)} – ${formatFee(ml.fee.high)}` },
      winProbability: { score: ml.winProbabilityBase, confidence: 0.5, rationale: `Stage-based conversion rate: ${(ml.stagePrior.dealProbability * 100).toFixed(0)}%.`, keyFactors: ['Stage-based prior', 'No referral context analyzed'] },
      executionRisk: { score: ml.executionRiskBase, confidence: 0.5, rationale: `Sector complexity base: ${ml.sectorPrior.complexityBase}.`, keyFactors: ['Sector complexity baseline'] },
      strategicValue: { score: ml.strategicValueBase, confidence: 0.4, rationale: 'ML-assessed strategic value based on sector positioning.', keyFactors: ['Sector expansion potential'] },
    },
    suggestedNextSteps: [
      'Connect Anthropic API key for full AI-powered analysis',
      'Review opportunity in next team meeting',
      'Assess team capacity for this sector',
    ],
    estimatedFeeRange: { low: formatFee(ml.fee.low), high: formatFee(ml.fee.high) },
    riskFactors: ['AI analysis unavailable — assessment based on ML priors only'],
    competitiveInsights: [],
    keyQuestions: ['What is the competitive landscape for advisory mandates in this space?', 'Do we have relevant sector expertise on the team?'],
  };
}
