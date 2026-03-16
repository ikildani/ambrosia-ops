'use client';

import { useState, useMemo, useCallback } from 'react';
import Link from 'next/link';
import {
  ArrowLeft,
  AlertTriangle,
  CheckCircle2,
  Sparkles,
  FileText,
  XCircle,
} from 'lucide-react';
import { Card } from '@/components/ui/Card';
import { THERAPY_AREAS } from '@/lib/data/therapy-areas';
import { DEAL_TYPES } from '@/lib/data/constants';
import {
  screenOpportunity,
  type ScreeningInput,
  type ScreeningResult,
} from '@/lib/scoring/opportunity-screening';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

type ScreeningField = keyof ScreeningInput;

interface PillOption<V extends string = string> {
  value: V;
  label: string;
}

// ---------------------------------------------------------------------------
// Option definitions
// ---------------------------------------------------------------------------

const TA_ALIGNMENT_OPTIONS: PillOption[] = [
  { value: 'core', label: 'Core' },
  { value: 'adjacent', label: 'Adjacent' },
  { value: 'outside', label: 'Outside' },
];

const EXPERIENCE_OPTIONS: PillOption[] = [
  { value: 'extensive', label: 'Extensive' },
  { value: 'some', label: 'Some' },
  { value: 'none', label: 'None' },
];

const CLIENT_OPTIONS: PillOption[] = [
  { value: 'ideal', label: 'Ideal' },
  { value: 'good', label: 'Good' },
  { value: 'marginal', label: 'Marginal' },
];

const YES_NO_OPTIONS: PillOption[] = [
  { value: 'yes', label: 'Yes' },
  { value: 'no', label: 'No' },
];

const SUCCESS_FEE_OPTIONS: PillOption[] = [
  { value: 'high', label: 'High' },
  { value: 'medium', label: 'Medium' },
  { value: 'low', label: 'Low' },
];

const RELATIONSHIP_OPTIONS: PillOption[] = [
  { value: 'strong', label: 'Strong' },
  { value: 'moderate', label: 'Moderate' },
  { value: 'none', label: 'None' },
];

const COMPETITIVE_OPTIONS: PillOption[] = [
  { value: 'sole_source', label: 'Sole Source' },
  { value: 'limited', label: 'Limited' },
  { value: 'bakeoff', label: 'Bake-off' },
];

const REFERRAL_OPTIONS: PillOption[] = [
  { value: 'board_member', label: 'Board Member' },
  { value: 'partner_referral', label: 'Partner Referral' },
  { value: 'direct', label: 'Direct' },
  { value: 'cold', label: 'Cold' },
];

const CAPACITY_OPTIONS: PillOption[] = [
  { value: 'available', label: 'Available' },
  { value: 'manageable', label: 'Manageable' },
  { value: 'stretched', label: 'Stretched' },
];

const COMPLEXITY_OPTIONS: PillOption[] = [
  { value: 'straightforward', label: 'Straightforward' },
  { value: 'moderate', label: 'Moderate' },
  { value: 'novel', label: 'Novel' },
];

const TIMELINE_OPTIONS: PillOption[] = [
  { value: 'comfortable', label: 'Comfortable' },
  { value: 'tight', label: 'Tight' },
  { value: 'aggressive', label: 'Aggressive' },
];

// ---------------------------------------------------------------------------
// Pill Button Component
// ---------------------------------------------------------------------------

function PillGroup({
  field,
  options,
  value,
  onChange,
}: {
  field: ScreeningField;
  options: PillOption[];
  value: string | undefined;
  onChange: (field: ScreeningField, value: string) => void;
}) {
  return (
    <div className="flex flex-wrap gap-2">
      {options.map((opt) => {
        const isActive = value === opt.value;
        return (
          <button
            key={opt.value}
            type="button"
            onClick={() => onChange(field, opt.value)}
            className="px-4 py-1.5 rounded-full text-[12.5px] font-medium transition-all duration-150 border cursor-pointer"
            style={{
              background: isActive ? 'rgba(0, 201, 167, 0.18)' : 'var(--bg-elevated)',
              borderColor: isActive ? 'rgba(0, 201, 167, 0.4)' : 'var(--border-subtle)',
              color: isActive ? '#00e4bf' : 'var(--text-secondary)',
              boxShadow: isActive ? '0 0 12px rgba(0, 201, 167, 0.12)' : 'none',
            }}
          >
            {opt.label}
          </button>
        );
      })}
    </div>
  );
}

// ---------------------------------------------------------------------------
// Toggle Button Component
// ---------------------------------------------------------------------------

function ToggleButton({
  field,
  label,
  value,
  onChange,
}: {
  field: ScreeningField;
  label: string;
  value: boolean;
  onChange: (field: ScreeningField, value: boolean) => void;
}) {
  return (
    <button
      type="button"
      onClick={() => onChange(field, !value)}
      className="px-4 py-1.5 rounded-full text-[12.5px] font-medium transition-all duration-150 border cursor-pointer"
      style={{
        background: value ? 'rgba(0, 201, 167, 0.18)' : 'var(--bg-elevated)',
        borderColor: value ? 'rgba(0, 201, 167, 0.4)' : 'var(--border-subtle)',
        color: value ? '#00e4bf' : 'var(--text-secondary)',
        boxShadow: value ? '0 0 12px rgba(0, 201, 167, 0.12)' : 'none',
      }}
    >
      {value && <span className="mr-1">&#10003;</span>}
      {label}
    </button>
  );
}

// ---------------------------------------------------------------------------
// Dimension Score Badge
// ---------------------------------------------------------------------------

function DimensionBadge({ score }: { score: number }) {
  const color =
    score >= 4 ? '#34d399' : score >= 3 ? '#5fd4e3' : score >= 2 ? '#fbbf24' : '#f87171';
  return (
    <div
      className="flex items-center justify-center w-9 h-9 rounded-full font-mono text-sm font-semibold"
      style={{
        background: `${color}20`,
        color,
        border: `1.5px solid ${color}40`,
      }}
    >
      {score}
    </div>
  );
}

// ---------------------------------------------------------------------------
// Score Bar
// ---------------------------------------------------------------------------

function ScoreBar({
  label,
  score,
  max,
}: {
  label: string;
  score: number;
  max: number;
}) {
  const pct = (score / max) * 100;
  const color =
    score >= 4 ? '#34d399' : score >= 3 ? '#5fd4e3' : score >= 2 ? '#fbbf24' : '#f87171';

  return (
    <div className="flex items-center gap-3">
      <span className="text-[12px] text-[var(--text-secondary)] w-[120px] shrink-0">
        {label}
      </span>
      <div
        className="flex-1 h-2 rounded-full overflow-hidden"
        style={{ background: 'var(--bg-elevated)' }}
      >
        <div
          className="h-full rounded-full transition-all duration-500 ease-out"
          style={{ width: `${pct}%`, background: color }}
        />
      </div>
      <span className="font-mono text-[12px] w-8 text-right" style={{ color }}>
        {score}/{max}
      </span>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Main Page
// ---------------------------------------------------------------------------

interface ContextState {
  opportunityName: string;
  companyName: string;
  therapyArea: string;
  dealType: string;
  estimatedDealSize: string;
}

type PartialScreeningInput = Partial<
  Omit<ScreeningInput, 'estimatedDealSize' | 'opensNewTA' | 'marqueeClient' | 'crossSellPotential' | 'relationshipBuilding' | 'repeatBusinessLikely'>
> & {
  estimatedDealSize?: number;
  opensNewTA: boolean;
  marqueeClient: boolean;
  crossSellPotential: boolean;
  relationshipBuilding: boolean;
  repeatBusinessLikely: boolean;
};

export default function OpportunityScreeningPage() {
  const [context, setContext] = useState<ContextState>({
    opportunityName: '',
    companyName: '',
    therapyArea: '',
    dealType: '',
    estimatedDealSize: '',
  });

  const [screening, setScreening] = useState<PartialScreeningInput>({
    opensNewTA: false,
    marqueeClient: false,
    crossSellPotential: false,
    relationshipBuilding: false,
    repeatBusinessLikely: false,
  });

  const handlePillChange = useCallback(
    (field: ScreeningField, value: string) => {
      setScreening((prev) => ({ ...prev, [field]: value }));
    },
    []
  );

  const handleToggleChange = useCallback(
    (field: ScreeningField, value: boolean) => {
      setScreening((prev) => ({ ...prev, [field]: value }));
    },
    []
  );

  // Parse deal size from context into screening
  const dealSizeM = useMemo(() => {
    const raw = context.estimatedDealSize.replace(/[^0-9.]/g, '');
    return parseFloat(raw) || 0;
  }, [context.estimatedDealSize]);

  // Check if all required fields are filled
  const isComplete = useMemo(() => {
    const requiredPills: (keyof PartialScreeningInput)[] = [
      'therapyAreaAlignment',
      'dealTypeExperience',
      'clientProfile',
      'retainerLikelihood',
      'successFeeProbability',
      'relationshipWithDecisionMaker',
      'competitiveSituation',
      'referralQuality',
      'teamCapacity',
      'complexity',
      'timeline',
    ];
    return requiredPills.every((f) => screening[f] !== undefined) && dealSizeM > 0;
  }, [screening, dealSizeM]);

  // Compute result live
  const result: ScreeningResult | null = useMemo(() => {
    if (!isComplete) return null;
    return screenOpportunity({
      ...(screening as Omit<ScreeningInput, 'estimatedDealSize'>),
      estimatedDealSize: dealSizeM,
    });
  }, [screening, dealSizeM, isComplete]);

  // Compute individual dimension scores for live display
  const dimensionScores = useMemo(() => {
    // Strategic Fit
    const sfScores = [
      screening.therapyAreaAlignment ? { core: 5, adjacent: 3, outside: 1 }[screening.therapyAreaAlignment] : 0,
      screening.dealTypeExperience ? { extensive: 5, some: 3, none: 1 }[screening.dealTypeExperience] : 0,
      screening.clientProfile ? { ideal: 5, good: 3, marginal: 1 }[screening.clientProfile] : 0,
    ].filter((s) => s > 0);
    const sf = sfScores.length > 0 ? Math.round(sfScores.reduce((a, b) => a + b, 0) / sfScores.length) : 0;

    // Fee Potential (simplified live preview)
    let fp = 0;
    if (dealSizeM > 0 && screening.successFeeProbability) {
      if (dealSizeM >= 100) fp = 4;
      else if (dealSizeM >= 50) fp = 3;
      else if (dealSizeM >= 10) fp = 2;
      else fp = 1;
      const spAdj = { high: 5, medium: 3, low: 1 }[screening.successFeeProbability];
      fp = Math.round((fp + spAdj) / 2);
      fp = Math.min(5, Math.max(1, fp));
    }

    // Win Probability
    const wpScores = [
      screening.relationshipWithDecisionMaker ? { strong: 5, moderate: 3, none: 1 }[screening.relationshipWithDecisionMaker] : 0,
      screening.competitiveSituation ? { sole_source: 5, limited: 3, bakeoff: 1 }[screening.competitiveSituation] : 0,
      screening.referralQuality ? { board_member: 5, partner_referral: 4, direct: 2, cold: 1 }[screening.referralQuality] : 0,
    ].filter((s) => s > 0);
    const wp = wpScores.length > 0 ? Math.round(wpScores.reduce((a, b) => a + b, 0) / wpScores.length) : 0;

    // Execution Risk
    const erScores = [
      screening.teamCapacity ? { available: 5, manageable: 3, stretched: 1 }[screening.teamCapacity] : 0,
      screening.complexity ? { straightforward: 5, moderate: 3, novel: 1 }[screening.complexity] : 0,
      screening.timeline ? { comfortable: 5, tight: 3, aggressive: 1 }[screening.timeline] : 0,
    ].filter((s) => s > 0);
    const er = erScores.length > 0 ? Math.round(erScores.reduce((a, b) => a + b, 0) / erScores.length) : 0;

    // Strategic Value
    const sv = [
      screening.opensNewTA,
      screening.marqueeClient,
      screening.crossSellPotential,
      screening.relationshipBuilding,
      screening.repeatBusinessLikely,
    ].filter(Boolean).length;

    return { sf, fp, wp, er, sv: Math.max(sv, 0) };
  }, [screening, dealSizeM]);

  // Format currency input
  const handleDealSizeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const raw = e.target.value.replace(/[^0-9.]/g, '');
    setContext((prev) => ({ ...prev, estimatedDealSize: raw }));
  };

  const formatDealSizeDisplay = (val: string): string => {
    const num = parseFloat(val);
    if (isNaN(num)) return '';
    return num.toLocaleString('en-US');
  };

  return (
    <div className="page-content" style={{ maxWidth: 960 }}>
      {/* Header */}
      <div className="flex items-start justify-between mb-8">
        <div>
          <h1
            className="font-display text-[28px] leading-tight"
            style={{ color: 'var(--text-primary)' }}
          >
            Opportunity Screening
          </h1>
          <p className="text-[13.5px] mt-1" style={{ color: 'var(--text-secondary)' }}>
            Structured assessment for incoming mandates
          </p>
        </div>
        <Link
          href="/deals"
          className="btn btn-ghost text-[13px] flex items-center gap-1.5"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Pipeline
        </Link>
      </div>

      {/* Opportunity Context */}
      <Card
        className="mb-6"
        style={{
          animation: 'slideUp 0.4s ease-out',
          animationFillMode: 'backwards',
        }}
      >
        <div className="label mb-4">Opportunity Context</div>
        <div className="grid grid-cols-2 gap-4">
          <div className="col-span-2">
            <label className="input-label">Opportunity Name</label>
            <input
              type="text"
              className="input font-display text-lg"
              placeholder="e.g. Project Atlas — Oncology Platform Acquisition"
              value={context.opportunityName}
              onChange={(e) =>
                setContext((p) => ({ ...p, opportunityName: e.target.value }))
              }
            />
          </div>
          <div>
            <label className="input-label">Company Name</label>
            <input
              type="text"
              className="input"
              placeholder="Target or client company"
              value={context.companyName}
              onChange={(e) =>
                setContext((p) => ({ ...p, companyName: e.target.value }))
              }
            />
          </div>
          <div>
            <label className="input-label">Therapy Area</label>
            <div className="relative">
              <select
                className="input appearance-none pr-10"
                value={context.therapyArea}
                onChange={(e) =>
                  setContext((p) => ({ ...p, therapyArea: e.target.value }))
                }
              >
                <option value="">Select therapy area</option>
                {THERAPY_AREAS.map((ta) => (
                  <option key={ta.id} value={ta.id}>
                    {ta.label}
                  </option>
                ))}
              </select>
              <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-3">
                <svg className="h-4 w-4 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                </svg>
              </div>
            </div>
          </div>
          <div>
            <label className="input-label">Deal Type</label>
            <div className="relative">
              <select
                className="input appearance-none pr-10"
                value={context.dealType}
                onChange={(e) =>
                  setContext((p) => ({ ...p, dealType: e.target.value }))
                }
              >
                <option value="">Select deal type</option>
                {DEAL_TYPES.map((dt) => (
                  <option key={dt.id} value={dt.id}>
                    {dt.label}
                  </option>
                ))}
              </select>
              <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-3">
                <svg className="h-4 w-4 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                </svg>
              </div>
            </div>
          </div>
          <div>
            <label className="input-label">Estimated Deal Size ($M)</label>
            <input
              type="text"
              className="input font-mono"
              placeholder="e.g. 150"
              value={formatDealSizeDisplay(context.estimatedDealSize)}
              onChange={handleDealSizeChange}
            />
          </div>
        </div>
      </Card>

      {/* Dimension Cards */}
      <div className="flex flex-col gap-4 mb-8">
        {/* 1. Strategic Fit */}
        <DimensionCard
          title="Strategic Fit"
          score={dimensionScores.sf}
          index={0}
        >
          <SubQuestion label="Therapy Area Alignment">
            <PillGroup
              field="therapyAreaAlignment"
              options={TA_ALIGNMENT_OPTIONS}
              value={screening.therapyAreaAlignment}
              onChange={handlePillChange}
            />
          </SubQuestion>
          <SubQuestion label="Deal Type Experience">
            <PillGroup
              field="dealTypeExperience"
              options={EXPERIENCE_OPTIONS}
              value={screening.dealTypeExperience}
              onChange={handlePillChange}
            />
          </SubQuestion>
          <SubQuestion label="Client Profile">
            <PillGroup
              field="clientProfile"
              options={CLIENT_OPTIONS}
              value={screening.clientProfile}
              onChange={handlePillChange}
            />
          </SubQuestion>
        </DimensionCard>

        {/* 2. Fee Potential */}
        <DimensionCard
          title="Fee Potential"
          score={dimensionScores.fp}
          index={1}
        >
          <SubQuestion label="Deal Size">
            <span className="font-mono text-[13px]" style={{ color: 'var(--text-secondary)' }}>
              {dealSizeM > 0
                ? `$${dealSizeM.toLocaleString()}M — from context above`
                : 'Enter deal size above'}
            </span>
          </SubQuestion>
          <SubQuestion label="Retainer Likelihood">
            <PillGroup
              field="retainerLikelihood"
              options={YES_NO_OPTIONS}
              value={screening.retainerLikelihood}
              onChange={handlePillChange}
            />
          </SubQuestion>
          <SubQuestion label="Success Fee Probability">
            <PillGroup
              field="successFeeProbability"
              options={SUCCESS_FEE_OPTIONS}
              value={screening.successFeeProbability}
              onChange={handlePillChange}
            />
          </SubQuestion>
        </DimensionCard>

        {/* 3. Win Probability */}
        <DimensionCard
          title="Win Probability"
          score={dimensionScores.wp}
          index={2}
        >
          <SubQuestion label="Relationship with Decision-Maker">
            <PillGroup
              field="relationshipWithDecisionMaker"
              options={RELATIONSHIP_OPTIONS}
              value={screening.relationshipWithDecisionMaker}
              onChange={handlePillChange}
            />
          </SubQuestion>
          <SubQuestion label="Competitive Situation">
            <PillGroup
              field="competitiveSituation"
              options={COMPETITIVE_OPTIONS}
              value={screening.competitiveSituation}
              onChange={handlePillChange}
            />
          </SubQuestion>
          <SubQuestion label="Referral Quality">
            <PillGroup
              field="referralQuality"
              options={REFERRAL_OPTIONS}
              value={screening.referralQuality}
              onChange={handlePillChange}
            />
          </SubQuestion>
        </DimensionCard>

        {/* 4. Execution Risk */}
        <DimensionCard
          title="Execution Risk"
          score={dimensionScores.er}
          index={3}
        >
          <SubQuestion label="Team Capacity">
            <PillGroup
              field="teamCapacity"
              options={CAPACITY_OPTIONS}
              value={screening.teamCapacity}
              onChange={handlePillChange}
            />
          </SubQuestion>
          <SubQuestion label="Complexity">
            <PillGroup
              field="complexity"
              options={COMPLEXITY_OPTIONS}
              value={screening.complexity}
              onChange={handlePillChange}
            />
          </SubQuestion>
          <SubQuestion label="Timeline">
            <PillGroup
              field="timeline"
              options={TIMELINE_OPTIONS}
              value={screening.timeline}
              onChange={handlePillChange}
            />
          </SubQuestion>
        </DimensionCard>

        {/* 5. Strategic Value */}
        <DimensionCard
          title="Strategic Value"
          score={dimensionScores.sv}
          index={4}
        >
          <div className="flex flex-wrap gap-2">
            <ToggleButton
              field="opensNewTA"
              label="Opens New TA"
              value={screening.opensNewTA}
              onChange={handleToggleChange}
            />
            <ToggleButton
              field="marqueeClient"
              label="Marquee Client"
              value={screening.marqueeClient}
              onChange={handleToggleChange}
            />
            <ToggleButton
              field="crossSellPotential"
              label="Cross-Sell Potential"
              value={screening.crossSellPotential}
              onChange={handleToggleChange}
            />
            <ToggleButton
              field="relationshipBuilding"
              label="Relationship Building"
              value={screening.relationshipBuilding}
              onChange={handleToggleChange}
            />
            <ToggleButton
              field="repeatBusinessLikely"
              label="Repeat Business Likely"
              value={screening.repeatBusinessLikely}
              onChange={handleToggleChange}
            />
          </div>
        </DimensionCard>
      </div>

      {/* Results Section */}
      {result ? (
        <div
          className="mt-2"
          style={{
            animation: 'slideUp 0.5s ease-out',
            animationFillMode: 'backwards',
            animationDelay: '0.1s',
          }}
        >
          {/* Verdict */}
          <Card className="mb-6 relative overflow-hidden">
            {/* Background glow */}
            <div
              className="absolute inset-0 opacity-[0.06]"
              style={{
                background: `radial-gradient(ellipse at center, ${result.recommendationColor} 0%, transparent 70%)`,
              }}
            />

            <div className="relative z-10">
              {/* Recommendation badge + score */}
              <div className="flex items-center justify-between mb-8">
                <div
                  className="inline-flex items-center gap-2.5 px-5 py-2.5 rounded-lg text-[13px] font-semibold tracking-wider uppercase"
                  style={{
                    background:
                      result.recommendation === 'pursue_aggressively' || result.recommendation === 'pursue_selectively'
                        ? 'linear-gradient(135deg, rgba(95, 212, 227, 0.2), rgba(148, 153, 209, 0.2))'
                        : `${result.recommendationColor}20`,
                    color: result.recommendationColor,
                    border: `1px solid ${result.recommendationColor}40`,
                    boxShadow: `0 0 24px ${result.recommendationColor}15`,
                  }}
                >
                  {result.recommendation === 'pursue_aggressively' && <Sparkles className="w-4 h-4" />}
                  {result.recommendation === 'pursue_selectively' && <CheckCircle2 className="w-4 h-4" />}
                  {result.recommendation === 'monitor' && <AlertTriangle className="w-4 h-4" />}
                  {result.recommendation === 'pass' && <XCircle className="w-4 h-4" />}
                  {result.recommendationLabel}
                </div>

                <div className="text-right">
                  <div
                    className="font-display text-[48px] leading-none"
                    style={{ color: result.recommendationColor }}
                  >
                    {result.score}
                  </div>
                  <div className="text-[12px] mt-1" style={{ color: 'var(--text-muted)' }}>
                    out of 25
                  </div>
                </div>
              </div>

              {/* Score breakdown */}
              <div className="flex flex-col gap-2.5 mb-8">
                <ScoreBar
                  label="Strategic Fit"
                  score={result.dimensions.strategicFit.score}
                  max={5}
                />
                <ScoreBar
                  label="Fee Potential"
                  score={result.dimensions.feePotential.score}
                  max={5}
                />
                <ScoreBar
                  label="Win Probability"
                  score={result.dimensions.winProbability.score}
                  max={5}
                />
                <ScoreBar
                  label="Execution Risk"
                  score={result.dimensions.executionRisk.score}
                  max={5}
                />
                <ScoreBar
                  label="Strategic Value"
                  score={result.dimensions.strategicValue.score}
                  max={5}
                />
              </div>

              {/* Fee estimate */}
              <div
                className="p-4 rounded-lg mb-6"
                style={{
                  background: 'var(--bg-elevated)',
                  border: '1px solid var(--border-subtle)',
                }}
              >
                <div className="label mb-2">Estimated Advisory Fee</div>
                <div
                  className="font-mono text-xl font-semibold"
                  style={{ color: '#5fd4e3' }}
                >
                  {result.estimatedFeeRange.low} &mdash; {result.estimatedFeeRange.high}
                </div>
                <div
                  className="text-[11.5px] mt-1"
                  style={{ color: 'var(--text-muted)' }}
                >
                  Modified Lehman formula
                  {screening.retainerLikelihood === 'yes' ? ' + retainer' : ''}
                </div>
              </div>

              {/* Next Steps */}
              <div className="mb-6">
                <div className="label mb-3">Suggested Next Steps</div>
                <ol className="flex flex-col gap-2">
                  {result.suggestedNextSteps.map((step, i) => (
                    <li
                      key={i}
                      className="flex items-start gap-3 text-[13px]"
                      style={{ color: 'var(--text-secondary)' }}
                    >
                      <span
                        className="font-mono text-[11px] w-5 h-5 rounded-full flex items-center justify-center shrink-0 mt-0.5"
                        style={{
                          background: 'var(--bg-elevated)',
                          color: 'var(--text-muted)',
                          border: '1px solid var(--border-subtle)',
                        }}
                      >
                        {i + 1}
                      </span>
                      {step}
                    </li>
                  ))}
                </ol>
              </div>

              {/* Risk Factors */}
              {result.riskFactors.length > 0 && (
                <div className="mb-6">
                  <div className="label mb-3">Risk Factors</div>
                  <div className="flex flex-col gap-2">
                    {result.riskFactors.map((risk, i) => (
                      <div
                        key={i}
                        className="flex items-start gap-2.5 p-3 rounded-lg text-[12.5px]"
                        style={{
                          background: 'rgba(251, 191, 36, 0.06)',
                          border: '1px solid rgba(251, 191, 36, 0.2)',
                          color: '#fbbf24',
                        }}
                      >
                        <AlertTriangle className="w-3.5 h-3.5 shrink-0 mt-0.5" />
                        {risk}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Action Buttons */}
              <div
                className="flex items-center gap-3 pt-5"
                style={{ borderTop: '1px solid var(--border-subtle)' }}
              >
                <Link
                  href={`/deals/new?title=${encodeURIComponent(context.opportunityName)}&company=${encodeURIComponent(context.companyName)}&therapy_area=${context.therapyArea}&deal_type=${context.dealType}&estimated_value=${dealSizeM}`}
                  className="btn btn-primary btn-lg"
                  style={{
                    background: 'linear-gradient(135deg, #5fd4e3, #9499d1)',
                    color: '#04080f',
                  }}
                >
                  <FileText className="w-4 h-4" />
                  Create Mandate
                </Link>
                <button className="btn btn-secondary">Save Screening</button>
                <button className="btn btn-ghost">Decline & Note</button>
              </div>
            </div>
          </Card>
        </div>
      ) : (
        <Card className="text-center py-12">
          <div
            className="text-[13.5px]"
            style={{ color: 'var(--text-muted)' }}
          >
            Complete all assessment dimensions above to see the screening result.
          </div>
          <div className="font-mono text-[11px] mt-2" style={{ color: 'var(--text-muted)' }}>
            {(() => {
              const filled = [
                screening.therapyAreaAlignment,
                screening.dealTypeExperience,
                screening.clientProfile,
                screening.retainerLikelihood,
                screening.successFeeProbability,
                screening.relationshipWithDecisionMaker,
                screening.competitiveSituation,
                screening.referralQuality,
                screening.teamCapacity,
                screening.complexity,
                screening.timeline,
              ].filter(Boolean).length + (dealSizeM > 0 ? 1 : 0);
              return `${filled}/12 fields completed`;
            })()}
          </div>
        </Card>
      )}
    </div>
  );
}

// ---------------------------------------------------------------------------
// Dimension Card wrapper
// ---------------------------------------------------------------------------

function DimensionCard({
  title,
  score,
  index,
  children,
}: {
  title: string;
  score: number;
  index: number;
  children: React.ReactNode;
}) {
  const borderColor =
    score === 0
      ? 'var(--border-subtle)'
      : score >= 4
        ? '#34d399'
        : score >= 3
          ? '#5fd4e3'
          : score >= 2
            ? '#fbbf24'
            : '#f87171';

  return (
    <Card
      style={{
        borderLeft: `3px solid ${borderColor}`,
        animation: 'slideUp 0.4s ease-out',
        animationFillMode: 'backwards',
        animationDelay: `${(index + 1) * 0.06}s`,
      }}
    >
      <div className="flex items-center justify-between mb-5">
        <h3
          className="text-[16px] font-medium"
          style={{ color: 'var(--text-primary)' }}
        >
          {title}
        </h3>
        {score > 0 && <DimensionBadge score={score} />}
      </div>
      <div className="flex flex-col gap-4">{children}</div>
    </Card>
  );
}

// ---------------------------------------------------------------------------
// Sub-question wrapper
// ---------------------------------------------------------------------------

function SubQuestion({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <div
        className="text-[12px] font-medium mb-2"
        style={{ color: 'var(--text-secondary)' }}
      >
        {label}
      </div>
      {children}
    </div>
  );
}
