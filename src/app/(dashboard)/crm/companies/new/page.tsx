'use client';

import { useState, useCallback, useMemo, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import {
  Building2,
  Globe,
  MapPin,
  ArrowRight,
  ArrowLeft,
  Check,
  Sparkles,
  Users,
  FlaskConical,
  Handshake,
  Target,
  ChevronRight,
  Calendar,
  DollarSign,
  Pencil,
  Search,
} from 'lucide-react';
import { THERAPY_AREAS } from '@/lib/data/therapy-areas';
import { ORG_TYPES } from '@/lib/data/constants';

/* ============================================
   TYPES
   ============================================ */

interface FormData {
  // Step 1: Identity
  name: string;
  type: string;
  website: string;
  hq_city: string;
  hq_country: string;
  // Step 2: Profile
  stage: string;
  founded_year: string;
  employee_range: string;
  total_funding: string;
  last_funding_date: string;
  // Step 3: Therapeutic Focus
  therapy_areas: string[];
  lead_asset: string;
  lead_asset_phase: string;
  indications: string;
  // Step 4: Relationship
  relationship_source: string;
  has_contacts: string;
  relationship_owner: string;
  // Step 5: Opportunity
  services_needed: string[];
  deal_signals: string[];
  has_catalysts: boolean;
  catalyst_description: string;
  market_position: string;
  news_sentiment: string;
  // Step 6: Notes
  description: string;
}

interface ScoreBreakdown {
  companyFit: number;
  relationship: number;
  marketTiming: number;
  advisoryOpportunity: number;
}

/* ============================================
   CONSTANTS
   ============================================ */

const STEPS = [
  { id: 1, label: 'Identity', icon: Building2 },
  { id: 2, label: 'Profile', icon: Users },
  { id: 3, label: 'Therapeutics', icon: FlaskConical },
  { id: 4, label: 'Relationship', icon: Handshake },
  { id: 5, label: 'Opportunity', icon: Target },
  { id: 6, label: 'Score & Confirm', icon: Sparkles },
];

const COMPANY_STAGES = [
  { id: 'seed', label: 'Seed' },
  { id: 'series_a', label: 'Series A' },
  { id: 'series_b', label: 'Series B' },
  { id: 'series_c', label: 'Series C' },
  { id: 'growth', label: 'Growth' },
  { id: 'public', label: 'Public' },
];

const EMPLOYEE_RANGES = [
  { id: '1-10', label: '1-10' },
  { id: '11-50', label: '11-50' },
  { id: '51-200', label: '51-200' },
  { id: '201-500', label: '201-500' },
  { id: '500+', label: '500+' },
];

const LEAD_ASSET_PHASES = [
  { id: 'preclinical', label: 'Preclinical' },
  { id: 'phase_1', label: 'Phase 1' },
  { id: 'phase_1_2', label: 'Phase 1/2' },
  { id: 'phase_2', label: 'Phase 2' },
  { id: 'phase_2_3', label: 'Phase 2/3' },
  { id: 'phase_3', label: 'Phase 3' },
  { id: 'approved', label: 'Approved' },
];

const RELATIONSHIP_SOURCES = [
  { id: 'warm_intro', label: 'Warm Introduction' },
  { id: 'direct_outreach', label: 'Direct Outreach' },
  { id: 'conference', label: 'Met at Conference' },
  { id: 'inbound', label: 'Inbound Inquiry' },
  { id: 'cold', label: 'Cold \u2014 No Prior Contact' },
];

const SERVICES = [
  { id: 'ma_advisory', label: 'M&A Advisory' },
  { id: 'licensing', label: 'Licensing' },
  { id: 'partnership', label: 'Partnership' },
  { id: 'fundraising', label: 'Fundraising' },
  { id: 'strategy', label: 'Strategy' },
];

const DEAL_SIGNALS = [
  { id: 'hiring_bd', label: 'Hiring BD Team' },
  { id: 'board_changes', label: 'Board Changes' },
  { id: 'new_cfo', label: 'New CFO' },
  { id: 'pipeline_readout', label: 'Pipeline Readout' },
  { id: 'restructuring', label: 'Restructuring' },
  { id: 'active_fundraising', label: 'Active Fundraising' },
  { id: 'none', label: 'None' },
];

const TEAM_MEMBERS = [
  { id: 'issa_kildani', label: 'Issa Kildani' },
  { id: 'partner_2', label: 'Nate Bishop' },
  { id: 'vp_1', label: 'Sarah Chen' },
  { id: 'analyst_1', label: 'Marcus Rivera' },
  { id: 'associate_1', label: 'Priya Sharma' },
];

const MARKET_POSITIONS = [
  { id: 'low', label: 'Low Competition' },
  { id: 'moderate', label: 'Moderate Competition' },
  { id: 'high', label: 'High Competition' },
];

const NEWS_SENTIMENTS = [
  { id: 'positive', label: 'Positive Momentum' },
  { id: 'neutral', label: 'Neutral' },
  { id: 'negative', label: 'Negative / Challenges' },
];

const INITIAL_FORM: FormData = {
  name: '',
  type: '',
  website: '',
  hq_city: '',
  hq_country: '',
  stage: '',
  founded_year: '',
  employee_range: '',
  total_funding: '',
  last_funding_date: '',
  therapy_areas: [],
  lead_asset: '',
  lead_asset_phase: '',
  indications: '',
  relationship_source: '',
  has_contacts: '',
  relationship_owner: '',
  services_needed: [],
  deal_signals: [],
  has_catalysts: false,
  catalyst_description: '',
  market_position: '',
  news_sentiment: '',
  description: '',
};

/* ============================================
   SCORING ENGINE
   ============================================ */

function calculateScore(data: FormData): { total: number; breakdown: ScoreBreakdown; bucket: string; bucketColor: string; action: string } {
  // Company Fit (0-25)
  let companyFit = 0;
  const isBiotechPharma = data.type === 'biotech' || data.type === 'pharma';
  if (isBiotechPharma) companyFit += 8;
  else if (['vc', 'pe', 'family_office'].includes(data.type)) companyFit += 5;
  else if (data.type) companyFit += 2;

  if (data.therapy_areas.length > 0) companyFit += Math.min(data.therapy_areas.length * 2, 6);
  if (data.lead_asset_phase) {
    const phaseScores: Record<string, number> = {
      approved: 3, phase_3: 5, phase_2_3: 5, phase_2: 4, phase_1_2: 3, phase_1: 2, preclinical: 1,
    };
    companyFit += phaseScores[data.lead_asset_phase] || 0;
  }
  if (data.employee_range) companyFit += 2;
  if (data.stage) companyFit += 2;
  if (data.website) companyFit += 1;
  if (data.lead_asset) companyFit += 1;
  companyFit = Math.min(companyFit, 25);

  // Relationship (0-25)
  let relationship = 0;
  const sourceScores: Record<string, number> = {
    warm_intro: 12, inbound: 10, conference: 7, direct_outreach: 5, cold: 2,
  };
  relationship += sourceScores[data.relationship_source] || 0;
  if (data.has_contacts === 'yes') relationship += 8;
  else if (data.has_contacts === 'no') relationship += 2;
  if (data.relationship_owner) relationship += 5;
  relationship = Math.min(relationship, 25);

  // Market Timing (0-25)
  let marketTiming = 0;
  if (data.market_position === 'low') marketTiming += 10;
  else if (data.market_position === 'moderate') marketTiming += 6;
  else if (data.market_position === 'high') marketTiming += 3;

  if (data.news_sentiment === 'positive') marketTiming += 8;
  else if (data.news_sentiment === 'neutral') marketTiming += 4;
  else if (data.news_sentiment === 'negative') marketTiming += 1;

  if (data.has_catalysts) marketTiming += 7;
  marketTiming = Math.min(marketTiming, 25);

  // Advisory Opportunity (0-25)
  let advisoryOpportunity = 0;
  advisoryOpportunity += Math.min(data.services_needed.length * 4, 12);
  const signalCount = data.deal_signals.filter(s => s !== 'none').length;
  advisoryOpportunity += Math.min(signalCount * 3, 9);
  if (data.deal_signals.includes('none') && data.deal_signals.length === 1) advisoryOpportunity += 0;
  if (isBiotechPharma && data.services_needed.includes('ma_advisory')) advisoryOpportunity += 4;
  advisoryOpportunity = Math.min(advisoryOpportunity, 25);

  const total = companyFit + relationship + marketTiming + advisoryOpportunity;

  let bucket: string;
  let bucketColor: string;
  let action: string;

  if (total >= 80) {
    bucket = 'Hot Lead';
    bucketColor = '#f87171';
    action = 'Schedule introductory call within 48 hours. Assign to senior partner.';
  } else if (total >= 60) {
    bucket = 'Warm Prospect';
    bucketColor = '#fbbf24';
    action = 'Send personalized outreach this week. Prepare company brief.';
  } else if (total >= 40) {
    bucket = 'Nurture';
    bucketColor = '#60a5fa';
    action = 'Add to monthly newsletter. Monitor for deal signals.';
  } else {
    bucket = 'Cold';
    bucketColor = '#94a3b8';
    action = 'Log for reference. Revisit in next quarterly review.';
  }

  return {
    total,
    breakdown: { companyFit, relationship, marketTiming, advisoryOpportunity },
    bucket,
    bucketColor,
    action,
  };
}

/* ============================================
   SUB-COMPONENTS
   ============================================ */

function PillButton({
  selected,
  onClick,
  children,
  size = 'default',
}: {
  selected: boolean;
  onClick: () => void;
  children: React.ReactNode;
  size?: 'default' | 'lg';
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`
        rounded-full border px-5 font-sans transition-all duration-200 cursor-pointer select-none
        ${size === 'lg' ? 'py-3 text-sm' : 'py-2.5 text-[13px]'}
        ${selected
          ? 'border-teal-400/50 bg-teal-500/15 text-teal-300 shadow-[0_0_16px_rgba(0,201,167,0.12)]'
          : 'border-slate-700/60 bg-navy-800/60 text-slate-400 hover:border-slate-600 hover:text-slate-300 hover:bg-navy-700/40'
        }
      `}
    >
      {children}
    </button>
  );
}

function MultiPillButton({
  selected,
  onClick,
  children,
}: {
  selected: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`
        rounded-lg border px-5 py-3.5 text-sm font-sans transition-all duration-200 cursor-pointer select-none
        flex items-center gap-2.5
        ${selected
          ? 'border-teal-400/50 bg-teal-500/15 text-teal-300 shadow-[0_0_16px_rgba(0,201,167,0.12)]'
          : 'border-slate-700/60 bg-navy-800/60 text-slate-400 hover:border-slate-600 hover:text-slate-300 hover:bg-navy-700/40'
        }
      `}
    >
      <span className={`
        w-5 h-5 rounded border flex items-center justify-center flex-shrink-0 transition-all duration-200
        ${selected
          ? 'border-teal-400 bg-teal-500/30'
          : 'border-slate-600 bg-transparent'
        }
      `}>
        {selected && <Check className="w-3.5 h-3.5 text-teal-300" />}
      </span>
      {children}
    </button>
  );
}

function StepHeading({ children }: { children: React.ReactNode }) {
  return (
    <h2
      className="text-3xl font-normal text-slate-100 tracking-tight mb-2"
      style={{ fontFamily: 'var(--font-cormorant), Georgia, serif' }}
    >
      {children}
    </h2>
  );
}

function StepSubheading({ children }: { children: React.ReactNode }) {
  return <p className="text-slate-400 text-[14px] leading-relaxed">{children}</p>;
}

function FieldLabel({ children, optional }: { children: React.ReactNode; optional?: boolean }) {
  return (
    <label className="input-label flex items-center gap-2">
      {children}
      {optional && <span className="text-slate-600 text-[10px] font-normal tracking-normal normal-case">Optional</span>}
    </label>
  );
}

function ScoreRing({ score, color }: { score: number; color: string }) {
  const radius = 72;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (score / 100) * circumference;

  return (
    <div className="relative w-48 h-48 mx-auto">
      <svg className="w-48 h-48 -rotate-90" viewBox="0 0 192 192">
        <circle
          cx="96"
          cy="96"
          r={radius}
          fill="none"
          stroke="rgba(100,116,139,0.15)"
          strokeWidth="8"
        />
        <circle
          cx="96"
          cy="96"
          r={radius}
          fill="none"
          stroke="url(#scoreGradient)"
          strokeWidth="8"
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          className="transition-all duration-1000 ease-out"
        />
        <defs>
          <linearGradient id="scoreGradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#5fd4e3" />
            <stop offset="100%" stopColor="#9499d1" />
          </linearGradient>
        </defs>
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span
          className="text-5xl font-light text-slate-100 tabular-nums"
          style={{ fontFamily: 'var(--font-dm-mono), monospace' }}
        >
          {score}
        </span>
        <span className="text-[11px] font-medium tracking-widest uppercase mt-1" style={{ color }}>
          / 100
        </span>
      </div>
    </div>
  );
}

function ScoreBar({ label, value, max }: { label: string; value: number; max: number }) {
  const pct = Math.round((value / max) * 100);
  return (
    <div className="space-y-1.5">
      <div className="flex items-center justify-between">
        <span className="text-[12px] text-slate-400">{label}</span>
        <span
          className="text-[12px] text-slate-300 tabular-nums"
          style={{ fontFamily: 'var(--font-dm-mono), monospace' }}
        >
          {value}/{max}
        </span>
      </div>
      <div className="h-2 rounded-full bg-slate-800/80 overflow-hidden">
        <div
          className="h-full rounded-full transition-all duration-700 ease-out"
          style={{
            width: `${pct}%`,
            background: 'linear-gradient(90deg, #5fd4e3, #9499d1)',
          }}
        />
      </div>
    </div>
  );
}

function MiniScoreRing({ score, size = 36, strokeWidth = 3 }: { score: number; size?: number; strokeWidth?: number }) {
  const radius = (size - strokeWidth * 2) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (score / 100) * circumference;

  return (
    <svg className="-rotate-90" width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
      <circle
        cx={size / 2}
        cy={size / 2}
        r={radius}
        fill="none"
        stroke="rgba(100,116,139,0.2)"
        strokeWidth={strokeWidth}
      />
      <circle
        cx={size / 2}
        cy={size / 2}
        r={radius}
        fill="none"
        stroke="url(#miniGrad)"
        strokeWidth={strokeWidth}
        strokeLinecap="round"
        strokeDasharray={circumference}
        strokeDashoffset={offset}
        className="transition-all duration-700 ease-out"
      />
      <defs>
        <linearGradient id="miniGrad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#5fd4e3" />
          <stop offset="100%" stopColor="#9499d1" />
        </linearGradient>
      </defs>
    </svg>
  );
}

function FloatingScorePreview({
  score,
  bucket,
  bucketColor,
  onClick,
}: {
  score: number;
  bucket: string;
  bucketColor: string;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="fixed bottom-5 left-5 z-50 flex items-center gap-3 rounded-xl px-4 py-3 cursor-pointer
        border border-slate-700/40 shadow-lg
        transition-all duration-300 hover:scale-105 hover:border-teal-500/30
        animate-[fadeIn_0.4s_ease-out]"
      style={{
        background: 'rgba(7,16,30,0.85)',
        backdropFilter: 'blur(16px)',
        WebkitBackdropFilter: 'blur(16px)',
      }}
      title="View full score"
    >
      <MiniScoreRing score={score} size={36} strokeWidth={3} />
      <div className="flex flex-col items-start">
        <span
          className="text-2xl font-light text-slate-100 tabular-nums leading-none transition-all duration-500"
          style={{ fontFamily: 'var(--font-dm-mono), monospace' }}
        >
          {score}
        </span>
        <span className="text-[10px] font-medium tracking-wider uppercase leading-none mt-1" style={{ color: bucketColor }}>
          {bucket}
        </span>
      </div>
    </button>
  );
}

function IntelligenceTip({ text }: { text: string }) {
  return (
    <div
      className="rounded-lg border-l-2 border-teal-500 bg-navy-800/40 px-4 py-3 mt-4 animate-[slideUp_0.4s_ease-out]"
    >
      <div className="flex items-center gap-1.5 mb-1">
        <Sparkles className="w-3 h-3 text-teal-400" />
        <span className="text-[10px] font-semibold tracking-widest uppercase text-teal-400/70">Intelligence</span>
      </div>
      <p className="text-[12px] leading-relaxed" style={{ color: '#94a3b8' }}>{text}</p>
    </div>
  );
}

function NetworkComparison({ score }: { score: number }) {
  const percentile = score >= 80 ? 'top 5%' : score >= 60 ? 'top 15%' : score >= 40 ? 'top 40%' : 'bottom 50%';
  const mockCompanies = [
    { name: 'NeuroGen Therapeutics', score: 87, bucket: 'Warm', color: '#fbbf24' },
    { name: 'BioVantage Inc.', score: 62, bucket: 'Nurture', color: '#60a5fa' },
  ];

  return (
    <div className="rounded-xl border border-slate-700/40 bg-navy-800/50 p-6 space-y-4 animate-[slideUp_0.4s_ease-out]">
      <h3 className="text-[11px] font-semibold tracking-widest uppercase text-slate-500">Network Comparison</h3>
      <p className="text-sm text-slate-300">
        Compared to 48 companies in your CRM, this scores in the <strong className="text-slate-100">{percentile}</strong>
      </p>
      <div className="flex gap-3">
        {mockCompanies.map(c => (
          <div
            key={c.name}
            className="flex items-center gap-2.5 rounded-lg border border-slate-700/40 bg-navy-900/60 px-3 py-2 flex-1"
          >
            <MiniScoreRing score={c.score} size={28} strokeWidth={2.5} />
            <div className="min-w-0">
              <p className="text-[12px] text-slate-200 truncate">{c.name}</p>
              <p className="text-[10px] font-medium tracking-wider uppercase" style={{ color: c.color }}>{c.bucket}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ============================================
   MAIN COMPONENT
   ============================================ */

export default function NewCompanyPage() {
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState(1);
  const [direction, setDirection] = useState<'forward' | 'backward'>('forward');
  const [animKey, setAnimKey] = useState(0);
  const [submitting, setSubmitting] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);
  const [form, setForm] = useState<FormData>(INITIAL_FORM);

  const isBiotechPharma = form.type === 'biotech' || form.type === 'pharma';

  // Calculate total steps (skip step 3 if not biotech/pharma)
  const activeSteps = useMemo(() => {
    if (isBiotechPharma) return STEPS;
    return STEPS.filter(s => s.id !== 3);
  }, [isBiotechPharma]);

  const activeStepIndex = activeSteps.findIndex(s => s.id === currentStep);
  const isLastStep = activeStepIndex === activeSteps.length - 1;
  const isFirstStep = activeStepIndex === 0;

  const update = useCallback(<K extends keyof FormData>(key: K, value: FormData[K]) => {
    setForm(prev => ({ ...prev, [key]: value }));
  }, []);

  const toggleArray = useCallback((key: 'therapy_areas' | 'services_needed' | 'deal_signals', id: string) => {
    setForm(prev => {
      const arr = prev[key] as string[];
      if (key === 'deal_signals' && id === 'none') {
        return { ...prev, [key]: arr.includes('none') ? [] : ['none'] };
      }
      if (key === 'deal_signals' && arr.includes('none')) {
        return { ...prev, [key]: [id] };
      }
      return {
        ...prev,
        [key]: arr.includes(id) ? arr.filter(v => v !== id) : [...arr, id],
      };
    });
  }, []);

  function goNext() {
    if (isLastStep) return;
    setDirection('forward');
    setAnimKey(k => k + 1);
    const nextStep = activeSteps[activeStepIndex + 1];
    setCurrentStep(nextStep.id);
  }

  function goBack() {
    if (isFirstStep) return;
    setDirection('backward');
    setAnimKey(k => k + 1);
    const prevStep = activeSteps[activeStepIndex - 1];
    setCurrentStep(prevStep.id);
  }

  function goToStep(stepId: number) {
    const targetIndex = activeSteps.findIndex(s => s.id === stepId);
    if (targetIndex < 0) return;
    setDirection(targetIndex > activeStepIndex ? 'forward' : 'backward');
    setAnimKey(k => k + 1);
    setCurrentStep(stepId);
  }

  const canAdvance = useMemo(() => {
    switch (currentStep) {
      case 1: return form.name.trim().length > 0 && form.type.length > 0;
      case 2: return true;
      case 3: return true;
      case 4: return form.relationship_source.length > 0;
      case 5: return form.services_needed.length > 0;
      case 6: return true;
      default: return true;
    }
  }, [currentStep, form]);

  const score = useMemo(() => calculateScore(form), [form]);

  // Counting animation for Step 6
  const [animatedScore, setAnimatedScore] = useState(0);
  const hasAnimatedRef = useRef(false);

  useEffect(() => {
    if (currentStep === 6 && !hasAnimatedRef.current) {
      hasAnimatedRef.current = true;
      const target = score.total;
      const duration = 1500;
      const startTime = performance.now();

      function animate(now: number) {
        const elapsed = now - startTime;
        const progress = Math.min(elapsed / duration, 1);
        // Ease-out cubic
        const eased = 1 - Math.pow(1 - progress, 3);
        setAnimatedScore(Math.round(eased * target));
        if (progress < 1) {
          requestAnimationFrame(animate);
        }
      }
      requestAnimationFrame(animate);
    }
    if (currentStep !== 6) {
      hasAnimatedRef.current = false;
      setAnimatedScore(0);
    }
  }, [currentStep, score.total]);

  async function handleSubmit() {
    setSubmitting(true);
    setServerError(null);

    const payload: Record<string, unknown> = {
      name: form.name,
      type: form.type,
      website: form.website || undefined,
      hq_city: form.hq_city || undefined,
      hq_country: form.hq_country || undefined,
      stage: form.stage || undefined,
      founded_year: form.founded_year ? parseInt(form.founded_year, 10) : undefined,
      employee_count_range: form.employee_range || undefined,
      total_funding: form.total_funding || undefined,
      last_funding_date: form.last_funding_date || undefined,
      therapy_areas: form.therapy_areas.length > 0 ? form.therapy_areas : undefined,
      lead_asset: form.lead_asset || undefined,
      lead_asset_phase: form.lead_asset_phase || undefined,
      indications: form.indications || undefined,
      relationship_source: form.relationship_source || undefined,
      has_contacts: form.has_contacts === 'yes',
      relationship_owner: form.relationship_owner || undefined,
      services_needed: form.services_needed.length > 0 ? form.services_needed : undefined,
      deal_signals: form.deal_signals.length > 0 ? form.deal_signals : undefined,
      has_catalysts: form.has_catalysts,
      catalyst_description: form.catalyst_description || undefined,
      market_position: form.market_position || undefined,
      news_sentiment: form.news_sentiment || undefined,
      description: form.description || undefined,
      score: score.total,
      score_bucket: score.bucket,
      score_breakdown: score.breakdown,
    };

    // Remove undefined values
    for (const key of Object.keys(payload)) {
      if (payload[key] === undefined) delete payload[key];
    }

    try {
      const res = await fetch('/api/organizations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const result = await res.json();

      if (!res.ok) {
        setServerError(result.error || 'Failed to create company');
        setSubmitting(false);
        return;
      }

      router.push('/crm/companies');
    } catch {
      setServerError('An unexpected error occurred');
      setSubmitting(false);
    }
  }

  /* ============================================
     STEP RENDERERS
     ============================================ */

  function renderStep1() {
    return (
      <div className="space-y-8">
        <div>
          <StepHeading>Who is this company?</StepHeading>
          <StepSubheading>Let&apos;s start with the basics. Tell us about the organization you&apos;re adding.</StepSubheading>
        </div>

        <div className="space-y-6">
          {/* Company Name */}
          <div>
            <FieldLabel>Company Name</FieldLabel>
            <input
              type="text"
              value={form.name}
              onChange={e => update('name', e.target.value)}
              placeholder="Enter company name..."
              className="input text-lg py-3.5 px-4"
              style={{ fontFamily: 'var(--font-cormorant), Georgia, serif', fontSize: '20px' }}
              autoFocus
            />
            {form.name.trim().length >= 3 && (
              <div
                className="mt-3 rounded-lg border border-dashed border-slate-700/60 bg-navy-800/30 px-4 py-3 animate-[fadeIn_0.4s_ease-out]"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Search className="w-3.5 h-3.5 text-slate-500" />
                    <span className="text-[12px] text-slate-500">
                      Auto-enrichment available — We can pull company data from public sources automatically.
                    </span>
                  </div>
                  <button
                    type="button"
                    disabled
                    className="btn btn-sm text-[11px] text-slate-600 border border-slate-700/40 bg-navy-800/50 cursor-not-allowed opacity-50"
                  >
                    Coming Soon
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Company Type */}
          <div>
            <FieldLabel>Company Type</FieldLabel>
            <div className="flex flex-wrap gap-2.5 mt-1">
              {ORG_TYPES.map(t => (
                <PillButton
                  key={t.id}
                  selected={form.type === t.id}
                  onClick={() => update('type', t.id)}
                  size="lg"
                >
                  {t.label}
                </PillButton>
              ))}
            </div>
          </div>

          {/* Website */}
          <div>
            <FieldLabel optional>Website</FieldLabel>
            <div className="relative">
              <Globe className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
              <input
                type="url"
                value={form.website}
                onChange={e => update('website', e.target.value)}
                placeholder="https://example.com"
                className="input pl-10"
              />
            </div>
          </div>

          {/* HQ Location */}
          <div>
            <FieldLabel optional>Headquarters</FieldLabel>
            <div className="grid grid-cols-2 gap-3">
              <div className="relative">
                <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                <input
                  type="text"
                  value={form.hq_city}
                  onChange={e => update('hq_city', e.target.value)}
                  placeholder="City"
                  className="input pl-10"
                />
              </div>
              <input
                type="text"
                value={form.hq_country}
                onChange={e => update('hq_country', e.target.value)}
                placeholder="Country"
                className="input"
              />
            </div>
          </div>
        </div>
      </div>
    );
  }

  function renderStep2() {
    return (
      <div className="space-y-8">
        <div>
          <StepHeading>Company profile</StepHeading>
          <StepSubheading>
            {isBiotechPharma
              ? 'Funding stage, size, and maturity help us prioritize the right opportunities.'
              : 'Size and history help us understand the organization better.'}
          </StepSubheading>
        </div>

        <div className="space-y-6">
          {/* Stage (only biotech/pharma) */}
          {isBiotechPharma && (
            <div>
              <FieldLabel>Funding Stage</FieldLabel>
              <div className="flex flex-wrap gap-2.5 mt-1">
                {COMPANY_STAGES.map(s => (
                  <PillButton
                    key={s.id}
                    selected={form.stage === s.id}
                    onClick={() => update('stage', s.id)}
                    size="lg"
                  >
                    {s.label}
                  </PillButton>
                ))}
              </div>
            </div>
          )}

          {/* Founded Year */}
          <div>
            <FieldLabel optional>Founded Year</FieldLabel>
            <div className="relative max-w-[200px]">
              <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
              <input
                type="number"
                value={form.founded_year}
                onChange={e => update('founded_year', e.target.value)}
                placeholder="e.g., 2019"
                min={1800}
                max={new Date().getFullYear()}
                className="input pl-10 font-mono tabular-nums"
              />
            </div>
          </div>

          {/* Employee Range */}
          <div>
            <FieldLabel>Team Size</FieldLabel>
            <div className="flex flex-wrap gap-2.5 mt-1">
              {EMPLOYEE_RANGES.map(r => (
                <PillButton
                  key={r.id}
                  selected={form.employee_range === r.id}
                  onClick={() => update('employee_range', r.id)}
                >
                  {r.label}
                </PillButton>
              ))}
            </div>
          </div>

          {/* Total Funding */}
          <div>
            <FieldLabel optional>Total Funding Raised</FieldLabel>
            <div className="relative max-w-[300px]">
              <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
              <input
                type="text"
                value={form.total_funding}
                onChange={e => update('total_funding', e.target.value)}
                placeholder="e.g., 45M"
                className="input pl-10 font-mono"
              />
            </div>
          </div>

          {/* Last Funding Date */}
          <div>
            <FieldLabel optional>Last Funding Date</FieldLabel>
            <div className="relative max-w-[220px]">
              <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
              <input
                type="date"
                value={form.last_funding_date}
                onChange={e => update('last_funding_date', e.target.value)}
                className="input pl-10 font-mono text-slate-300"
              />
            </div>
          </div>
        </div>
      </div>
    );
  }

  function renderStep3() {
    return (
      <div className="space-y-8">
        <div>
          <StepHeading>Therapeutic focus</StepHeading>
          <StepSubheading>What areas of medicine is this company working in? Select all that apply.</StepSubheading>
        </div>

        <div className="space-y-6">
          {/* Therapy Areas Grid */}
          <div>
            <FieldLabel>Therapy Areas</FieldLabel>
            <div className="grid grid-cols-3 gap-2 mt-1">
              {THERAPY_AREAS.map(ta => (
                <button
                  key={ta.id}
                  type="button"
                  onClick={() => toggleArray('therapy_areas', ta.id)}
                  className={`
                    rounded-lg border px-3.5 py-2.5 text-[13px] text-left font-sans transition-all duration-200 cursor-pointer select-none
                    flex items-center gap-2
                    ${form.therapy_areas.includes(ta.id)
                      ? 'border-teal-400/50 bg-teal-500/15 text-teal-300'
                      : 'border-slate-700/60 bg-navy-800/60 text-slate-400 hover:border-slate-600 hover:text-slate-300'
                    }
                  `}
                >
                  <span className={`
                    w-4 h-4 rounded-sm border flex items-center justify-center flex-shrink-0 transition-all
                    ${form.therapy_areas.includes(ta.id)
                      ? 'border-teal-400 bg-teal-500/30'
                      : 'border-slate-600'
                    }
                  `}>
                    {form.therapy_areas.includes(ta.id) && <Check className="w-3 h-3 text-teal-300" />}
                  </span>
                  {ta.label}
                </button>
              ))}
            </div>
          </div>

          {/* Lead Asset */}
          <div>
            <FieldLabel optional>Lead Asset Name</FieldLabel>
            <input
              type="text"
              value={form.lead_asset}
              onChange={e => update('lead_asset', e.target.value)}
              placeholder="e.g., AMB-0147"
              className="input"
            />
          </div>

          {/* Lead Asset Phase */}
          <div>
            <FieldLabel optional>Lead Asset Phase</FieldLabel>
            <div className="flex flex-wrap gap-2.5 mt-1">
              {LEAD_ASSET_PHASES.map(p => (
                <PillButton
                  key={p.id}
                  selected={form.lead_asset_phase === p.id}
                  onClick={() => update('lead_asset_phase', p.id)}
                >
                  {p.label}
                </PillButton>
              ))}
            </div>
          </div>

          {/* Indications */}
          <div>
            <FieldLabel optional>Indications</FieldLabel>
            <input
              type="text"
              value={form.indications}
              onChange={e => update('indications', e.target.value)}
              placeholder="e.g., NSCLC, Triple-negative breast cancer"
              className="input"
            />
            <p className="text-[11px] text-slate-600 mt-1">Comma-separated list of target indications</p>
          </div>
        </div>
      </div>
    );
  }

  function renderStep4() {
    return (
      <div className="space-y-8">
        <div>
          <StepHeading>Your relationship</StepHeading>
          <StepSubheading>Understanding how you know this company helps us gauge outreach strategy.</StepSubheading>
          {form.type === 'biotech' && (form.stage === 'series_b' || form.stage === 'series_c') && (
            <IntelligenceTip text="Series B/C biotechs in your portfolio typically convert to mandates 3x more often with a warm introduction." />
          )}
          {(form.type === 'vc' || form.type === 'pe') && (
            <IntelligenceTip text="Investor relationships built through co-investment history have the highest conversion rates." />
          )}
        </div>

        <div className="space-y-6">
          {/* Relationship Source */}
          <div>
            <FieldLabel>How do you know this company?</FieldLabel>
            <div className="grid grid-cols-1 gap-2.5 mt-1">
              {RELATIONSHIP_SOURCES.map(rs => (
                <button
                  key={rs.id}
                  type="button"
                  onClick={() => update('relationship_source', rs.id)}
                  className={`
                    rounded-lg border px-5 py-4 text-left font-sans transition-all duration-200 cursor-pointer select-none
                    flex items-center gap-3 group
                    ${form.relationship_source === rs.id
                      ? 'border-teal-400/50 bg-teal-500/12 text-teal-300'
                      : 'border-slate-700/60 bg-navy-800/60 text-slate-400 hover:border-slate-600 hover:text-slate-300'
                    }
                  `}
                >
                  <span className={`
                    w-5 h-5 rounded-full border-2 flex items-center justify-center flex-shrink-0 transition-all
                    ${form.relationship_source === rs.id
                      ? 'border-teal-400 bg-teal-500/30'
                      : 'border-slate-600 group-hover:border-slate-500'
                    }
                  `}>
                    {form.relationship_source === rs.id && (
                      <span className="w-2 h-2 rounded-full bg-teal-400" />
                    )}
                  </span>
                  <span className="text-sm">{rs.label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Existing Contacts */}
          <div>
            <FieldLabel>Do you have existing contacts there?</FieldLabel>
            <div className="flex gap-3 mt-1">
              {[
                { id: 'yes', label: 'Yes' },
                { id: 'no', label: 'Not Yet' },
              ].map(opt => (
                <PillButton
                  key={opt.id}
                  selected={form.has_contacts === opt.id}
                  onClick={() => update('has_contacts', opt.id)}
                  size="lg"
                >
                  {opt.label}
                </PillButton>
              ))}
            </div>
          </div>

          {/* Relationship Owner */}
          <div>
            <FieldLabel>Who owns this relationship?</FieldLabel>
            <select
              value={form.relationship_owner}
              onChange={e => update('relationship_owner', e.target.value)}
              className="input appearance-none pr-10 max-w-[320px]"
            >
              <option value="" disabled>Select team member</option>
              {TEAM_MEMBERS.map(tm => (
                <option key={tm.id} value={tm.id}>{tm.label}</option>
              ))}
            </select>
          </div>
        </div>
      </div>
    );
  }

  function renderStep5() {
    return (
      <div className="space-y-8">
        <div>
          <StepHeading>Advisory opportunity</StepHeading>
          <StepSubheading>Assess the potential for an advisory engagement with this company.</StepSubheading>
          {form.therapy_areas.includes('oncology') && (
            <IntelligenceTip text="Oncology represents 45% of all life sciences M&A activity. High advisory demand." />
          )}
          {(form.lead_asset_phase === 'phase_2' || form.lead_asset_phase === 'phase_2_3') && (
            <IntelligenceTip text="Phase 2 assets are the most active stage for licensing transactions. Consider Partnership or Licensing services." />
          )}
        </div>

        <div className="space-y-6">
          {/* Services Needed */}
          <div>
            <FieldLabel>What services might they need?</FieldLabel>
            <div className="grid grid-cols-2 gap-2.5 mt-1">
              {SERVICES.map(s => (
                <MultiPillButton
                  key={s.id}
                  selected={form.services_needed.includes(s.id)}
                  onClick={() => toggleArray('services_needed', s.id)}
                >
                  {s.label}
                </MultiPillButton>
              ))}
            </div>
          </div>

          {/* Deal Signals */}
          <div>
            <FieldLabel>Deal readiness signals</FieldLabel>
            <div className="grid grid-cols-2 gap-2.5 mt-1">
              {DEAL_SIGNALS.map(ds => (
                <MultiPillButton
                  key={ds.id}
                  selected={form.deal_signals.includes(ds.id)}
                  onClick={() => toggleArray('deal_signals', ds.id)}
                >
                  {ds.label}
                </MultiPillButton>
              ))}
            </div>
          </div>

          {/* Catalysts */}
          <div>
            <FieldLabel>Upcoming catalysts?</FieldLabel>
            <div className="flex gap-3 mt-1">
              <PillButton
                selected={form.has_catalysts}
                onClick={() => update('has_catalysts', true)}
                size="lg"
              >
                Yes
              </PillButton>
              <PillButton
                selected={!form.has_catalysts}
                onClick={() => {
                  update('has_catalysts', false);
                  update('catalyst_description', '');
                }}
                size="lg"
              >
                No
              </PillButton>
            </div>
            {form.has_catalysts && (
              <div className="mt-3 animate-[slideUp_0.3s_ease-out]">
                <input
                  type="text"
                  value={form.catalyst_description}
                  onChange={e => update('catalyst_description', e.target.value)}
                  placeholder="Describe briefly, e.g., Phase 3 readout Q2 2026"
                  className="input"
                  autoFocus
                />
              </div>
            )}
          </div>

          {/* Market Position */}
          <div>
            <FieldLabel>Market position</FieldLabel>
            <div className="flex flex-wrap gap-2.5 mt-1">
              {MARKET_POSITIONS.map(mp => (
                <PillButton
                  key={mp.id}
                  selected={form.market_position === mp.id}
                  onClick={() => update('market_position', mp.id)}
                  size="lg"
                >
                  {mp.label}
                </PillButton>
              ))}
            </div>
          </div>

          {/* News Sentiment */}
          <div>
            <FieldLabel>Recent news sentiment</FieldLabel>
            <div className="flex flex-wrap gap-2.5 mt-1">
              {NEWS_SENTIMENTS.map(ns => (
                <PillButton
                  key={ns.id}
                  selected={form.news_sentiment === ns.id}
                  onClick={() => update('news_sentiment', ns.id)}
                  size="lg"
                >
                  {ns.label}
                </PillButton>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  function renderStep6() {
    return (
      <div className="space-y-8">
        <div className="text-center">
          <StepHeading>Company Score</StepHeading>
          <StepSubheading>
            AI-powered assessment based on company fit, relationship strength, market timing, and opportunity.
          </StepSubheading>
        </div>

        {/* Score Ring */}
        <div className="py-4">
          <ScoreRing score={animatedScore} color={score.bucketColor} />

          {/* Bucket Badge */}
          <div className="flex justify-center mt-5">
            <span
              className="inline-flex items-center gap-2 rounded-full px-5 py-2 text-sm font-medium"
              style={{
                color: score.bucketColor,
                backgroundColor: `${score.bucketColor}18`,
                border: `1px solid ${score.bucketColor}40`,
              }}
            >
              <Sparkles className="w-4 h-4" />
              {score.bucket}
            </span>
          </div>
        </div>

        {/* Score Breakdown */}
        <div className="rounded-xl border border-slate-700/40 bg-navy-800/50 p-6 space-y-4">
          <h3 className="text-[11px] font-semibold tracking-widest uppercase text-slate-500 mb-4">Score Breakdown</h3>
          <ScoreBar label="Company Fit" value={score.breakdown.companyFit} max={25} />
          <ScoreBar label="Relationship" value={score.breakdown.relationship} max={25} />
          <ScoreBar label="Market Timing" value={score.breakdown.marketTiming} max={25} />
          <ScoreBar label="Advisory Opportunity" value={score.breakdown.advisoryOpportunity} max={25} />
        </div>

        {/* Suggested Action */}
        <div className="rounded-xl border border-teal-500/20 bg-teal-500/5 p-5">
          <div className="flex items-start gap-3">
            <Target className="w-5 h-5 text-teal-400 flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-[11px] font-semibold tracking-widest uppercase text-teal-400/80 mb-1">Suggested Action</p>
              <p className="text-sm text-slate-300 leading-relaxed">{score.action}</p>
            </div>
          </div>
        </div>

        {/* Network Comparison */}
        <NetworkComparison score={score.total} />

        {/* Internal Notes */}
        <div>
          <FieldLabel optional>Internal Notes</FieldLabel>
          <textarea
            value={form.description}
            onChange={e => update('description', e.target.value)}
            placeholder="Any additional context or notes about this company..."
            className="input min-h-[100px] w-full resize-y"
          />
        </div>

        {serverError && (
          <div className="rounded-lg border border-red-500/30 bg-red-500/10 p-3 text-sm text-red-400">
            {serverError}
          </div>
        )}
      </div>
    );
  }

  const stepRenderers: Record<number, () => React.ReactNode> = {
    1: renderStep1,
    2: renderStep2,
    3: renderStep3,
    4: renderStep4,
    5: renderStep5,
    6: renderStep6,
  };

  return (
    <div className="min-h-[calc(100vh-var(--topbar-height))] flex flex-col">
      {/* Step Indicator */}
      <div className="border-b border-slate-700/30 bg-navy-900/50 px-6 py-4">
        <div className="max-w-2xl mx-auto">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
            {activeSteps.map((step, idx) => {
              const StepIcon = step.icon;
              const isActive = step.id === currentStep;
              const isCompleted = activeSteps.findIndex(s => s.id === currentStep) > idx;

              return (
                <div key={step.id} className="flex items-center">
                  <button
                    type="button"
                    onClick={() => goToStep(step.id)}
                    className={`
                      flex items-center gap-2 rounded-full px-3 py-1.5 text-[12px] font-medium transition-all duration-200 cursor-pointer
                      ${isActive
                        ? 'bg-teal-500/15 text-teal-300 border border-teal-400/30'
                        : isCompleted
                          ? 'text-teal-400/60 hover:text-teal-300'
                          : 'text-slate-600 hover:text-slate-500'
                      }
                    `}
                  >
                    {isCompleted && !isActive ? (
                      <Check className="w-3.5 h-3.5" />
                    ) : (
                      <StepIcon className="w-3.5 h-3.5" />
                    )}
                    <span className="hidden sm:inline">{step.label}</span>
                  </button>
                  {idx < activeSteps.length - 1 && (
                    <ChevronRight className={`w-4 h-4 mx-1 ${isCompleted ? 'text-teal-500/40' : 'text-slate-700/60'}`} />
                  )}
                </div>
              );
            })}
            </div>
            <span className="text-[11px] text-slate-600 tabular-nums hidden sm:inline" style={{ fontFamily: 'var(--font-dm-mono), monospace' }}>
              ~3 min
            </span>
          </div>
        </div>
      </div>

      {/* Floating Score Preview */}
      {currentStep > 1 && currentStep < 6 && (
        <FloatingScorePreview
          score={score.total}
          bucket={score.bucket}
          bucketColor={score.bucketColor}
          onClick={() => goToStep(6)}
        />
      )}

      {/* Step Content */}
      <div className="flex-1 flex items-start justify-center px-6 py-10">
        <div className="w-full max-w-2xl">
          <div
            key={animKey}
            className={direction === 'forward' ? 'animate-[slideUp_0.35s_ease-out]' : 'animate-[fadeIn_0.3s_ease-out]'}
          >
            {stepRenderers[currentStep]?.()}
          </div>
        </div>
      </div>

      {/* Bottom Navigation */}
      <div className="border-t border-slate-700/30 bg-navy-900/50 px-6 py-4">
        <div className="max-w-2xl mx-auto flex items-center justify-between">
          <div>
            {!isFirstStep && (
              <button
                type="button"
                onClick={goBack}
                className="btn btn-ghost gap-2 text-slate-400 hover:text-slate-200"
              >
                <ArrowLeft className="w-4 h-4" />
                Back
              </button>
            )}
          </div>

          <div className="flex items-center gap-3">
            {isLastStep ? (
              <>
                <button
                  type="button"
                  onClick={() => goToStep(1)}
                  className="btn btn-secondary gap-2"
                >
                  <Pencil className="w-4 h-4" />
                  Edit Details
                </button>
                <button
                  type="button"
                  onClick={handleSubmit}
                  disabled={submitting}
                  className="btn btn-lg gap-2 text-navy-950 font-semibold"
                  style={{
                    background: 'linear-gradient(135deg, #5fd4e3, #9499d1)',
                  }}
                >
                  {submitting ? (
                    <>
                      <span className="w-4 h-4 border-2 border-navy-900/30 border-t-navy-900 rounded-full animate-spin" />
                      Adding...
                    </>
                  ) : (
                    <>
                      <Check className="w-4 h-4" />
                      Add to CRM
                    </>
                  )}
                </button>
              </>
            ) : (
              <button
                type="button"
                onClick={goNext}
                disabled={!canAdvance}
                className="btn btn-primary btn-lg gap-2"
              >
                Next
                <ArrowRight className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
