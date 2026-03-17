import Anthropic from '@anthropic-ai/sdk';
import { researchCompany, type WebResearchResult } from './web-research';
import { getCRMContext, type CRMContext } from './crm-context';
import { validateScreening, ensembleScore } from './ml-validator';
import { generateEmbedding, findSimilar, storeEmbedding, buildScreeningEmbeddingText, type SimilarEntity } from './embeddings';

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
  score: number;
  confidence: number;
  rationale: string;
  keyFactors: string[];
}

export interface AIScreeningResult {
  overallScore: number;
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
  keyQuestions: string[];
  // Metadata about what layers were used
  meta: {
    aiPowered: boolean;
    webResearchUsed: boolean;
    crmContextUsed: boolean;
    validationFlags: string[];
    confidenceMultiplier: number;
    webResearch: WebResearchResult | null;
    crmContext: CRMContext | null;
  };
}

// ---------------------------------------------------------------------------
// Domain Priors (ML Layer)
// ---------------------------------------------------------------------------

const SECTOR_PRIORS: Record<string, { fitWeight: number; feeMultiplier: number; complexityBase: number }> = {
  biotech:         { fitWeight: 1.0,  feeMultiplier: 1.0,  complexityBase: 0.7 },
  pharma:          { fitWeight: 0.95, feeMultiplier: 1.1,  complexityBase: 0.6 },
  medtech:         { fitWeight: 0.75, feeMultiplier: 0.9,  complexityBase: 0.65 },
  diagnostics:     { fitWeight: 0.7,  feeMultiplier: 0.85, complexityBase: 0.6 },
  digital_health:  { fitWeight: 0.6,  feeMultiplier: 0.75, complexityBase: 0.5 },
  healthcare:      { fitWeight: 0.5,  feeMultiplier: 0.8,  complexityBase: 0.55 },
  nutraceuticals:  { fitWeight: 0.45, feeMultiplier: 0.7,  complexityBase: 0.4 },
};

const STAGE_PRIORS: Record<string, { dealProbability: number; advisoryNeed: number }> = {
  seed:      { dealProbability: 0.3,  advisoryNeed: 0.4 },
  series_a:  { dealProbability: 0.5,  advisoryNeed: 0.7 },
  series_b:  { dealProbability: 0.7,  advisoryNeed: 0.9 },
  series_c:  { dealProbability: 0.8,  advisoryNeed: 0.95 },
  growth:    { dealProbability: 0.75, advisoryNeed: 0.85 },
  public:    { dealProbability: 0.6,  advisoryNeed: 0.7 },
};

function calculateLehmanFee(dealSizeM: number): { low: number; high: number; base: number } {
  let fee = 0;
  if (dealSizeM <= 10) fee = dealSizeM * 0.05;
  else if (dealSizeM <= 50) fee = 0.5 + (dealSizeM - 10) * 0.04;
  else if (dealSizeM <= 100) fee = 0.5 + 1.6 + (dealSizeM - 50) * 0.03;
  else if (dealSizeM <= 250) fee = 0.5 + 1.6 + 1.5 + (dealSizeM - 100) * 0.02;
  else fee = 0.5 + 1.6 + 1.5 + 3.0 + (dealSizeM - 250) * 0.01;
  return { low: Math.round(fee * 0.7 * 10) / 10, high: Math.round(fee * 1.3 * 10) / 10, base: Math.round(fee * 10) / 10 };
}

function formatFee(m: number): string {
  return m >= 1 ? `$${m.toFixed(1)}M` : `$${Math.round(m * 1000)}K`;
}

function computeMLBaseScores(ctx: OpportunityContext) {
  const sectorPrior = SECTOR_PRIORS[ctx.sector] || SECTOR_PRIORS.biotech;
  const stagePrior = STAGE_PRIORS[ctx.companyStage] || STAGE_PRIORS.series_b;
  return {
    strategicFit: Math.min(5, Math.round(sectorPrior.fitWeight * stagePrior.advisoryNeed * 5)),
    feePotential: ctx.dealSize >= 500 ? 5 : ctx.dealSize >= 200 ? 4 : ctx.dealSize >= 100 ? 3 : ctx.dealSize >= 50 ? 2 : 1,
    winProbability: Math.min(5, Math.round(stagePrior.dealProbability * 5)),
    executionRisk: Math.min(5, Math.round((1 - sectorPrior.complexityBase) * 5)),
    strategicValue: sectorPrior.fitWeight < 0.7 ? 3 : 2,
  };
}

// ---------------------------------------------------------------------------
// Main Analyzer — 4-Layer Ensemble
// ---------------------------------------------------------------------------

export async function analyzeOpportunity(ctx: OpportunityContext): Promise<AIScreeningResult> {
  const fee = calculateLehmanFee(ctx.dealSize || 50);
  const mlBase = computeMLBaseScores(ctx);

  // ─── Layer 1: Web Research + CRM RAG + Embeddings (all parallel) ───
  const embeddingText = buildScreeningEmbeddingText({
    companyName: ctx.companyName,
    sector: ctx.sector,
    therapyArea: ctx.therapyArea,
    companyStage: ctx.companyStage,
    description: ctx.description,
    dealSize: ctx.dealSize,
  });

  const [webResearch, crmContext, queryEmbedding] = await Promise.all([
    researchCompany(ctx.companyName, ctx.sector, ctx.description).catch(() => null),
    getCRMContext(ctx.companyName, ctx.sector, ctx.therapyArea).catch(() => ({
      similarCompanies: [], existingContacts: [], relatedDeals: [],
      sectorStats: { totalCompanies: 0, totalDeals: 0, avgDealSize: null },
      hasExistingRelationship: false,
    } as CRMContext)),
    generateEmbedding(embeddingText).catch(() => null),
  ]);

  // Find semantically similar past screenings and companies
  let similarEntities: SimilarEntity[] = [];
  if (queryEmbedding) {
    similarEntities = await findSimilar(queryEmbedding, null, 5).catch(() => []);
  }

  // ─── Layer 3: Claude AI Analysis ───
  const apiKey = process.env.ANTHROPIC_API_KEY;
  let aiResult: AIScreeningResult | null = null;

  if (apiKey) {
    aiResult = await runClaudeAnalysis(ctx, mlBase, fee, webResearch, crmContext, similarEntities);
  }

  // ─── Layer 4: ML Cross-Validation ───
  const aiScores = aiResult ? {
    strategicFit: aiResult.dimensions.strategicFit.score,
    feePotential: aiResult.dimensions.feePotential.score,
    winProbability: aiResult.dimensions.winProbability.score,
    executionRisk: aiResult.dimensions.executionRisk.score,
    strategicValue: aiResult.dimensions.strategicValue.score,
  } : mlBase;

  const validation = validateScreening(aiScores, {
    dealSize: ctx.dealSize,
    sector: ctx.sector,
    referralSource: ctx.referralSource,
    companyStage: ctx.companyStage,
  });

  // ─── Ensemble: Merge all layers ───
  if (aiResult) {
    // Apply ensemble scoring: blend AI + ML + validation
    const ensembledDimensions = { ...aiResult.dimensions };

    for (const dim of ['strategicFit', 'winProbability', 'executionRisk', 'strategicValue'] as const) {
      const aiScore = aiResult.dimensions[dim].score;
      const mlScore = mlBase[dim];
      ensembledDimensions[dim] = {
        ...aiResult.dimensions[dim],
        score: ensembleScore(aiScore, mlScore, validation.confidenceMultiplier),
      };
    }

    // Fee potential uses the adjusted score too
    ensembledDimensions.feePotential = {
      ...aiResult.dimensions.feePotential,
      score: ensembleScore(aiResult.dimensions.feePotential.score, mlBase.feePotential, validation.confidenceMultiplier),
    };

    const overallScore = Object.values(ensembledDimensions).reduce((s, d) => s + d.score, 0);
    const rec = getRecommendation(overallScore);

    // Merge validation flags into risk factors
    const allRisks = [...(aiResult.riskFactors || []), ...validation.flags];
    const uniqueRisks = [...new Set(allRisks)];

    // Store embedding for future similarity searches (fire and forget)
    if (queryEmbedding) {
      storeEmbedding('screening', `screening-${Date.now()}`, embeddingText, queryEmbedding).catch(() => {});
    }

    return {
      ...aiResult,
      overallScore,
      ...rec,
      dimensions: ensembledDimensions,
      riskFactors: uniqueRisks,
      meta: {
        aiPowered: true,
        webResearchUsed: !!webResearch,
        crmContextUsed: crmContext.similarCompanies.length > 0 || crmContext.existingContacts.length > 0,
        validationFlags: validation.flags,
        confidenceMultiplier: validation.confidenceMultiplier,
        webResearch,
        crmContext,
      },
    };
  }

  // Store embedding for future similarity searches (fire and forget)
  if (queryEmbedding) {
    storeEmbedding('screening', `screening-${Date.now()}`, embeddingText, queryEmbedding).catch(() => {});
  }

  // Fallback: ML-only
  return buildMLFallback(ctx, mlBase, fee, validation, webResearch, crmContext);
}

// ---------------------------------------------------------------------------
// Claude Analysis
// ---------------------------------------------------------------------------

async function runClaudeAnalysis(
  ctx: OpportunityContext,
  mlBase: ReturnType<typeof computeMLBaseScores>,
  fee: ReturnType<typeof calculateLehmanFee>,
  webResearch: WebResearchResult | null,
  crmContext: CRMContext,
  similarEntities: SimilarEntity[] = []
): Promise<AIScreeningResult | null> {
  const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY! });

  // Build enriched context from all intelligence layers
  let enrichedContext = '';

  if (webResearch) {
    enrichedContext += `\n\nREAL-TIME MARKET INTELLIGENCE:
Company Intel: ${webResearch.companyIntel}
Recent News: ${webResearch.recentNews.join(' | ')}
Funding: ${webResearch.fundingHistory}
Competitive Landscape: ${webResearch.competitiveLandscape}
Key People: ${webResearch.keyPeople}
Clinical Pipeline: ${webResearch.clinicalPipeline}`;
  }

  if (crmContext.existingContacts.length > 0 || crmContext.similarCompanies.length > 0 || crmContext.relatedDeals.length > 0) {
    enrichedContext += '\n\nINTERNAL CRM DATA:';
    if (crmContext.existingContacts.length > 0) {
      enrichedContext += `\nExisting contacts at this company: ${crmContext.existingContacts.map(c => `${c.name} (${c.title}, relationship: ${c.relationship})`).join(', ')}`;
    }
    if (crmContext.similarCompanies.length > 0) {
      enrichedContext += `\nSimilar companies we track: ${crmContext.similarCompanies.slice(0, 5).map(c => `${c.name} (${c.type}, score: ${c.score || 'N/A'})`).join(', ')}`;
    }
    if (crmContext.relatedDeals.length > 0) {
      enrichedContext += `\nRelated past/active deals: ${crmContext.relatedDeals.map(d => `${d.title} (${d.stage}, $${d.value}M, ${d.type})`).join(', ')}`;
    }
    enrichedContext += `\nPortfolio stats: ${crmContext.sectorStats.totalCompanies} companies, ${crmContext.sectorStats.totalDeals} deals in our CRM`;
    if (crmContext.sectorStats.avgDealSize) {
      enrichedContext += `, avg deal size $${Math.round(crmContext.sectorStats.avgDealSize)}M`;
    }
  }

  if (similarEntities.length > 0) {
    enrichedContext += `\n\nSEMANTICALLY SIMILAR PAST OPPORTUNITIES (from our embedding index):`;
    for (const entity of similarEntities) {
      enrichedContext += `\n- ${entity.name} (${entity.type}, ${Math.round(entity.similarity * 100)}% similar): ${entity.context}`;
    }
  }

  const systemPrompt = `You are a senior M&A advisory partner at Ambrosia Ventures, a boutique life sciences strategy and M&A advisory firm. Ambrosia advises early-stage life sciences companies (Series A through C, with occasional growth and public company mandates) across biotech, pharma, medtech, diagnostics, digital health, healthcare services, and nutraceuticals. Ambrosia also works with investors including family offices, VCs, and PEs.

You are evaluating an inbound advisory opportunity. Your assessment will be presented to the partnership.

ANALYTICAL FRAMEWORK — Use chain-of-thought reasoning:

STEP 1: UNDERSTAND THE OPPORTUNITY
- What does this company actually do? What stage are they at?
- What specific advisory need are they expressing (or implying)?
- What type of engagement would this be? (M&A, Licensing, Partnership, Fundraising, Strategic)

STEP 2: ASSESS STRATEGIC FIT (score 1-5)
- How well does this align with Ambrosia's core expertise?
- Do we have relevant sector and therapeutic area knowledge?
- Is this the type of client (stage, size, complexity) where we add the most value?
- Consider: what would a competing advisor (Lazard, Centerview, Piper Sandler) offer that we couldn't?

STEP 3: EVALUATE FEE POTENTIAL (score 1-5)
- Modified Lehman formula gives base fee of ${formatFee(fee.base)} (range: ${formatFee(fee.low)}-${formatFee(fee.high)})
- Is the deal size realistic? Is the fee worth the partner time investment?
- Should this be retainer-heavy or success-fee-heavy?

STEP 4: ESTIMATE WIN PROBABILITY (score 1-5)
- How warm is the referral? Inbound > warm intro > conference > cold
- Do we have existing relationships that give us an edge?
- Are we likely competing against other advisors?
- What is the decision-maker's likely selection criteria?

STEP 5: ASSESS EXECUTION RISK (score 1-5, higher = lower risk)
- Do we have bandwidth to take this on?
- Is the timeline realistic or compressed?
- Is the deal structure standard or novel/complex?
- What could go wrong during execution?

STEP 6: EVALUATE STRATEGIC VALUE (score 1-5)
- Even if the fee is modest, does this open a new sector or build a marquee credential?
- Is there cross-sell potential or repeat business likelihood?
- Would winning this strengthen our market position?

STEP 7: CONSIDER THE CONTRARIAN VIEW
- What is the strongest argument AGAINST pursuing this opportunity?
- What assumption in the above analysis is most likely wrong?
- Factor this into your confidence scores.

STEP 8: SYNTHESIZE
- Sum dimension scores for overall (5-25)
- Determine recommendation: 20+ pursue aggressively, 15-19 pursue selectively, 10-14 monitor, <10 pass
- Draft a 2-3 sentence executive summary suitable for a partner meeting

ML MODEL BASE SCORES (statistical priors from our calibrated model — you may adjust ±2 based on your deeper analysis):
- Strategic Fit: ${mlBase.strategicFit}/5
- Fee Potential: ${mlBase.feePotential}/5
- Win Probability: ${mlBase.winProbability}/5
- Execution Risk: ${mlBase.executionRisk}/5
- Strategic Value: ${mlBase.strategicValue}/5

Respond ONLY with valid JSON (no markdown, no commentary outside the JSON):
{
  "overallScore": <number 5-25>,
  "engagementType": "<M&A Advisory | Licensing Advisory | Partnership Advisory | Fundraising Advisory | Strategic Advisory>",
  "engagementTypeRationale": "<1 sentence explaining why this engagement type>",
  "executiveSummary": "<2-3 sentences — the quality you'd present in a Monday morning partner meeting>",
  "dimensions": {
    "strategicFit": { "score": <1-5>, "confidence": <0.0-1.0>, "rationale": "<2-3 sentences with specific reasoning>", "keyFactors": ["<factor>", "<factor>"] },
    "feePotential": { "score": <1-5>, "confidence": <0.0-1.0>, "rationale": "<2-3 sentences>", "keyFactors": ["<factor>", "<factor>"], "estimatedFee": "${formatFee(fee.low)} – ${formatFee(fee.high)}" },
    "winProbability": { "score": <1-5>, "confidence": <0.0-1.0>, "rationale": "<2-3 sentences>", "keyFactors": ["<factor>", "<factor>"] },
    "executionRisk": { "score": <1-5>, "confidence": <0.0-1.0>, "rationale": "<2-3 sentences>", "keyFactors": ["<factor>", "<factor>"] },
    "strategicValue": { "score": <1-5>, "confidence": <0.0-1.0>, "rationale": "<2-3 sentences>", "keyFactors": ["<factor>", "<factor>"] }
  },
  "suggestedNextSteps": ["<specific, actionable step>", "<step>", "<step>", "<step>"],
  "riskFactors": ["<specific risk with context>", "<risk>"],
  "competitiveInsights": ["<insight about the competitive dynamics of this opportunity>", "<insight>"],
  "keyQuestions": ["<specific question the team should investigate before proceeding>", "<question>"]
}`;

  const userPrompt = `OPPORTUNITY SCREENING:

COMPANY: ${ctx.companyName}
SECTOR: ${ctx.sector}
THERAPY AREA: ${ctx.therapyArea || 'Not specified'}
STAGE: ${ctx.companyStage || 'Not specified'}
ESTIMATED DEAL SIZE: $${ctx.dealSize || 'TBD'}M

DESCRIPTION: ${ctx.description}

REFERRAL SOURCE: ${ctx.referralSource || 'Not specified'}
EXISTING CONTACTS: ${ctx.knownContacts || 'None'}
TIMELINE/URGENCY: ${ctx.urgency || 'Not specified'}
ADDITIONAL NOTES: ${ctx.additionalNotes || 'None'}
${enrichedContext}

Provide your structured assessment.`;

  try {
    const response = await anthropic.messages.create({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 2000,
      system: systemPrompt,
      messages: [{ role: 'user', content: userPrompt }],
    });

    const text = response.content[0].type === 'text' ? response.content[0].text : '';
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (!jsonMatch) return null;

    const parsed = JSON.parse(jsonMatch[0]);
    const rec = getRecommendation(parsed.overallScore);

    return {
      ...rec,
      overallScore: parsed.overallScore,
      engagementType: parsed.engagementType,
      engagementTypeRationale: parsed.engagementTypeRationale,
      executiveSummary: parsed.executiveSummary,
      dimensions: parsed.dimensions,
      suggestedNextSteps: parsed.suggestedNextSteps || [],
      estimatedFeeRange: { low: formatFee(fee.low), high: formatFee(fee.high) },
      riskFactors: parsed.riskFactors || [],
      competitiveInsights: parsed.competitiveInsights || [],
      keyQuestions: parsed.keyQuestions || [],
      meta: { aiPowered: true, webResearchUsed: false, crmContextUsed: false, validationFlags: [], confidenceMultiplier: 1, webResearch: null, crmContext: null },
    };
  } catch (error) {
    console.error('[Claude Analysis] Error:', error);
    return null;
  }
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function getRecommendation(score: number) {
  if (score >= 20) return { recommendation: 'pursue_aggressively' as const, recommendationLabel: 'Pursue Aggressively', recommendationColor: '#34d399' };
  if (score >= 15) return { recommendation: 'pursue_selectively' as const, recommendationLabel: 'Pursue Selectively', recommendationColor: '#5fd4e3' };
  if (score >= 10) return { recommendation: 'monitor' as const, recommendationLabel: 'Monitor & Revisit', recommendationColor: '#fbbf24' };
  return { recommendation: 'pass' as const, recommendationLabel: 'Decline or Refer', recommendationColor: '#f87171' };
}

function buildMLFallback(
  ctx: OpportunityContext,
  ml: ReturnType<typeof computeMLBaseScores>,
  fee: ReturnType<typeof calculateLehmanFee>,
  validation: ReturnType<typeof validateScreening>,
  webResearch: WebResearchResult | null,
  crmContext: CRMContext
): AIScreeningResult {
  const total = Object.values(ml).reduce((s, v) => s + v, 0);
  const rec = getRecommendation(total);

  return {
    ...rec,
    overallScore: total,
    engagementType: 'Strategic Advisory',
    engagementTypeRationale: 'Engagement type inferred from ML model. Connect Claude API for deeper analysis.',
    executiveSummary: `${ctx.companyName} is a ${ctx.companyStage?.replace('_', ' ') || ''} ${ctx.sector} company${ctx.dealSize ? ` with an estimated deal size of $${ctx.dealSize}M` : ''}. Based on our analysis, a ${rec.recommendationLabel.toLowerCase()} approach is recommended.`,
    dimensions: {
      strategicFit: { score: ml.strategicFit, confidence: 0.6, rationale: 'Scored by ML model based on sector and stage alignment.', keyFactors: [ctx.sector, ctx.companyStage || 'unknown'] },
      feePotential: { score: ml.feePotential, confidence: 0.8, rationale: `Deal size of $${ctx.dealSize}M implies a Lehman fee of ${formatFee(fee.base)}.`, keyFactors: [`$${ctx.dealSize}M`, `${formatFee(fee.low)}-${formatFee(fee.high)}`], estimatedFee: `${formatFee(fee.low)} – ${formatFee(fee.high)}` },
      winProbability: { score: ml.winProbability, confidence: 0.5, rationale: 'Stage-based conversion prior. Full context analysis requires Claude.', keyFactors: ['Stage prior only'] },
      executionRisk: { score: ml.executionRisk, confidence: 0.5, rationale: 'Sector complexity baseline. Narrative analysis requires Claude.', keyFactors: ['Sector baseline'] },
      strategicValue: { score: ml.strategicValue, confidence: 0.4, rationale: 'ML-assessed. Full strategic analysis requires Claude.', keyFactors: ['ML prior'] },
    },
    suggestedNextSteps: ['Review opportunity in next team meeting', 'Assess team capacity for this sector', 'Schedule introductory call if pursuing'],
    estimatedFeeRange: { low: formatFee(fee.low), high: formatFee(fee.high) },
    riskFactors: validation.flags.length > 0 ? validation.flags : [],
    competitiveInsights: webResearch?.competitiveLandscape ? [webResearch.competitiveLandscape] : [],
    keyQuestions: ['Is the deal size estimate reliable?', 'Do we have sector expertise for this engagement?'],
    meta: {
      aiPowered: false,
      webResearchUsed: !!webResearch,
      crmContextUsed: crmContext.similarCompanies.length > 0,
      validationFlags: validation.flags,
      confidenceMultiplier: validation.confidenceMultiplier,
      webResearch,
      crmContext,
    },
  };
}
