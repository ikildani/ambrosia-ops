'use client';

import { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import {
  Plus,
  Briefcase,
  Users,
  TrendingUp,
  Target,
  ArrowRight,
  ArrowUpRight,
  Sparkles,
  Zap,
  ChevronRight,
  Activity,
  Flame,
  DollarSign,
  Building2,
  Shield,
  CheckCircle2,
  Rocket,
  BookOpen,
  UserPlus,
  FolderPlus,
  ChevronDown,
  MessageSquare,
} from 'lucide-react';

/* ══════════════════════════════════════════════════════════════════
   CONFIG — flip this to see empty vs populated state
   ══════════════════════════════════════════════════════════════════ */
const HAS_DATA = false; // Set to true to see the populated dashboard

/* ══════════════════════════════════════════════════════════════════
   MOCK DATA (only used when HAS_DATA = true)
   ══════════════════════════════════════════════════════════════════ */

const STAGES: { id: string; label: string; count: number; value: number; color: string }[] = [];

const MANDATES: { id: string; codename: string; client: string; stage: string; stageColor: string; ev: number; type: string; priority: string; days: number }[] = [];

const FEED: { id: string; text: string; by: string; time: string; accent: boolean }[] = [];

/* ══════════════════════════════════════════════════════════════════
   ONBOARDING WIZARD
   ══════════════════════════════════════════════════════════════════ */

const WIZARD_STEPS = [
  {
    id: 'companies',
    number: '01',
    title: 'Add Your First Company',
    description: 'Start by adding a biotech, investor, or partner your team works with. Our intelligence engine will begin scoring and monitoring them automatically.',
    cta: 'Add Company',
    href: '/crm/companies/new',
    icon: Building2,
    accent: '#5fd4e3',
  },
  {
    id: 'contacts',
    number: '02',
    title: 'Build Your Network',
    description: 'Add the founders, executives, and investors behind those companies. The platform will track relationship health and surface follow-up recommendations.',
    cta: 'Add Contact',
    href: '/crm/contacts/new',
    icon: Users,
    accent: '#9499d1',
  },
  {
    id: 'mandate',
    number: '03',
    title: 'Create a Mandate',
    description: 'Start tracking an advisory engagement through your deal pipeline — from sourcing through close.',
    cta: 'Create Mandate',
    href: '/deals/new',
    icon: Briefcase,
    accent: '#fbbf24',
  },
  {
    id: 'research',
    number: '04',
    title: 'Generate Intelligence',
    description: 'Use AI to create a deep-dive research memo on a target company, pulling data from Terrain, Benchmarker, and ClinicalTrials.gov.',
    cta: 'Try AI Deep Dive',
    href: '/research/new',
    icon: Sparkles,
    accent: '#60a5fa',
  },
];

function OnboardingWizard() {
  const [completedSteps, setCompletedSteps] = useState<string[]>([]);
  const [expandedStep, setExpandedStep] = useState<string | null>('companies');

  return (
    <div style={{ animation: 'fadeIn 0.8s ease-out' }}>
      {/* Welcome */}
      <div className="text-center mb-20" style={{ animation: 'slideUp 0.6s ease-out' }}>
        {/* Ambrosia icon */}
        <div className="flex justify-center mb-10 pt-4">
          <img src="/icon-white.png" alt="" className="w-16 h-auto opacity-40" />
        </div>

        <h1 style={{
          fontFamily: 'var(--font-cormorant), "Cormorant Garamond", Georgia, serif',
          fontSize: '42px',
          fontWeight: 600,
          color: '#f0f4f8',
          lineHeight: 1.15,
          letterSpacing: '-0.01em',
        }}>
          Welcome to Ambrosia Ops
        </h1>
        <p className="mt-4 max-w-md mx-auto leading-relaxed" style={{ fontSize: '15px', color: '#64748b' }}>
          Your team&apos;s command center for mandates, relationships, and market intelligence.
          Let&apos;s get you set up in four steps.
        </p>

        {/* Progress */}
        <div className="flex items-center justify-center gap-2 mt-8">
          {WIZARD_STEPS.map((step) => (
            <div
              key={step.id}
              className="h-[3px] rounded-full transition-all duration-500"
              style={{
                width: completedSteps.includes(step.id) ? '40px' : '24px',
                background: completedSteps.includes(step.id)
                  ? 'linear-gradient(90deg, #5fd4e3, #9499d1)'
                  : '#1e293b',
              }}
            />
          ))}
        </div>
      </div>

      {/* Steps */}
      <div className="max-w-xl mx-auto space-y-4">
        {WIZARD_STEPS.map((step, i) => {
          const isComplete = completedSteps.includes(step.id);
          const isExpanded = expandedStep === step.id;
          const Icon = step.icon;

          return (
            <div
              key={step.id}
              className="rounded-xl transition-all duration-300"
              style={{
                background: isExpanded ? '#0a1628' : '#07101e',
                border: `1px solid ${isExpanded ? 'rgba(95,212,227,0.12)' : 'rgba(100,116,139,0.08)'}`,
                animation: `slideUp 0.5s ease-out ${200 + i * 80}ms both`,
              }}
            >
              {/* Header */}
              <button
                className="w-full flex items-center gap-4 px-5 py-4 text-left transition-colors"
                onClick={() => setExpandedStep(isExpanded ? null : step.id)}
              >
                <div
                  className="w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0"
                  style={{
                    background: isComplete ? `${step.accent}12` : 'rgba(100,116,139,0.06)',
                    border: `1px solid ${isComplete ? `${step.accent}25` : 'rgba(100,116,139,0.1)'}`,
                  }}
                >
                  {isComplete ? (
                    <CheckCircle2 className="w-4 h-4" style={{ color: step.accent }} />
                  ) : (
                    <span style={{ fontFamily: 'var(--font-mono)', fontSize: '12px', fontWeight: 600, color: '#475569' }}>
                      {step.number}
                    </span>
                  )}
                </div>

                <p className="flex-1 text-[14px] font-medium" style={{
                  color: isComplete ? '#64748b' : '#e2e8f0',
                  textDecoration: isComplete ? 'line-through' : 'none',
                }}>
                  {step.title}
                </p>

                <ChevronDown
                  className="w-4 h-4 flex-shrink-0 transition-transform duration-200"
                  style={{ color: '#475569', transform: isExpanded ? 'rotate(180deg)' : 'rotate(0)' }}
                />
              </button>

              {/* Expanded content */}
              {isExpanded && !isComplete && (
                <div className="px-5 pb-5" style={{ animation: 'fadeIn 0.3s ease-out', paddingLeft: '56px' }}>
                  <p className="text-[13px] leading-relaxed mb-5" style={{ color: '#64748b' }}>
                    {step.description}
                  </p>
                  <div className="flex items-center gap-3">
                    <Link
                      href={step.href}
                      className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg text-[13px] font-semibold transition-all"
                      style={{ background: step.accent, color: '#04080f' }}
                    >
                      <Icon className="w-4 h-4" />
                      {step.cta}
                    </Link>
                    <button
                      className="text-[12px] font-medium transition-colors px-3 py-2.5"
                      style={{ color: '#475569' }}
                      onClick={(e) => {
                        e.stopPropagation();
                        setCompletedSteps(prev => [...prev, step.id]);
                        const nextIdx = WIZARD_STEPS.findIndex(s => s.id === step.id) + 1;
                        if (nextIdx < WIZARD_STEPS.length) {
                          setExpandedStep(WIZARD_STEPS[nextIdx].id);
                        } else {
                          setExpandedStep(null);
                        }
                      }}
                      onMouseEnter={e => { e.currentTarget.style.color = '#94a3b8'; }}
                      onMouseLeave={e => { e.currentTarget.style.color = '#475569'; }}
                    >
                      Skip for now
                    </button>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Bottom help text */}
      <div className="text-center mt-14" style={{ animation: 'slideUp 0.5s ease-out 800ms both' }}>
        <p className="text-[12px]" style={{ color: '#334155' }}>
          You can always access these steps from Settings.
        </p>
      </div>
    </div>
  );
}

/* ══════════════════════════════════════════════════════════════════
   POPULATED DASHBOARD
   ══════════════════════════════════════════════════════════════════ */

function PopulatedDashboard() {
  const [date, setDate] = useState('');

  useEffect(() => {
    setDate(new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' }));
  }, []);

  const greeting = useMemo(() => {
    const h = new Date().getHours();
    if (h < 12) return 'Good morning';
    if (h < 17) return 'Good afternoon';
    return 'Good evening';
  }, []);

  const totalValue = STAGES.reduce((s, st) => s + st.value, 0);
  const totalDeals = STAGES.reduce((s, st) => s + st.count, 0);

  return (
    <>
      {/* ── HEADER ── */}
      <div className="flex items-end justify-between mb-12">
        <div>
          <p style={{ fontFamily: 'var(--font-mono)', fontSize: '11px', letterSpacing: '0.12em', color: '#5fd4e3', textTransform: 'uppercase' }}>
            {date}
          </p>
          <h1 style={{
            fontFamily: 'var(--font-cormorant), "Cormorant Garamond", Georgia, serif',
            fontSize: '38px', fontWeight: 600, color: '#f0f4f8', letterSpacing: '-0.01em', lineHeight: 1.15, marginTop: '6px',
          }}>
            {greeting}
          </h1>
        </div>
        <Link href="/deals/new" className="flex items-center gap-2 px-5 py-2.5 rounded-lg text-[13px] font-semibold transition-all"
          style={{ background: 'linear-gradient(135deg, #5fd4e3, #9499d1)', color: '#04080f' }}>
          <Plus className="w-4 h-4" /> New Mandate
        </Link>
      </div>

      {/* ── HEADLINE METRICS ── */}
      <div className="grid grid-cols-4 gap-10 mb-14" style={{ animation: 'slideUp 0.5s ease-out 100ms both' }}>
        {[
          { label: 'Active Mandates', value: String(totalDeals), delta: '+2 this month', deltaColor: '#5fd4e3' },
          { label: 'Pipeline Value', value: `$${(totalValue / 1000).toFixed(1)}B`, delta: '+$275M vs Q4', deltaColor: '#34d399' },
          { label: 'Win Rate', value: '67%', delta: '2 of 3 closed · Q1', deltaColor: '#94a3b8' },
          { label: 'Avg. Days to Close', value: '94', delta: '−12d vs benchmark', deltaColor: '#34d399' },
        ].map((m, i) => (
          <div key={m.label}>
            <p style={{ fontSize: '11px', fontWeight: 500, letterSpacing: '0.1em', textTransform: 'uppercase', color: '#475569', marginBottom: '10px' }}>
              {m.label}
            </p>
            <p style={{
              fontFamily: 'var(--font-cormorant), "Cormorant Garamond", Georgia, serif',
              fontSize: '42px', fontWeight: 600, color: i === 1 ? '#5fd4e3' : '#f0f4f8', lineHeight: 1,
            }}>
              {m.value}
            </p>
            <p className="flex items-center gap-1 mt-2" style={{ fontFamily: 'var(--font-mono)', fontSize: '11px', color: m.deltaColor }}>
              {m.deltaColor === '#34d399' && <TrendingUp className="w-3 h-3" />}
              {m.delta}
            </p>
          </div>
        ))}
      </div>

      {/* ── MANDATE PIPELINE ── */}
      <div className="mb-14">
        <div className="flex items-center justify-between mb-6">
          <h2 style={{ fontFamily: 'var(--font-cormorant), "Cormorant Garamond", Georgia, serif', fontSize: '24px', fontWeight: 600, color: '#e2e8f0' }}>
            Mandate Pipeline
          </h2>
          <Link href="/deals" className="flex items-center gap-1.5 text-[12px] font-medium transition-colors" style={{ color: '#64748b' }}
            onMouseEnter={e => { e.currentTarget.style.color = '#5fd4e3'; }}
            onMouseLeave={e => { e.currentTarget.style.color = '#64748b'; }}>
            Full pipeline <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        <div className="flex gap-3">
          {STAGES.map((stage, i) => (
            <div key={stage.id} className="flex-1 relative group rounded-xl px-5 py-5 transition-all duration-300"
              style={{ background: '#07101e', border: `1px solid ${stage.color}12`, animation: `slideUp 0.4s ease-out ${i * 50}ms both` }}
              onMouseEnter={e => { e.currentTarget.style.borderColor = `${stage.color}30`; }}
              onMouseLeave={e => { e.currentTarget.style.borderColor = `${stage.color}12`; }}>
              <div className="absolute top-0 left-5 right-5 h-[2px] rounded-b-full opacity-0 group-hover:opacity-100 transition-opacity" style={{ background: stage.color }} />
              <div className="flex items-center gap-2 mb-4">
                <div className="w-[6px] h-[6px] rounded-full" style={{ background: stage.color }} />
                <span style={{ fontSize: '10px', fontWeight: 600, letterSpacing: '0.1em', textTransform: 'uppercase', color: '#64748b' }}>{stage.label}</span>
              </div>
              <p style={{ fontFamily: 'var(--font-cormorant)', fontSize: '34px', fontWeight: 600, color: '#f0f4f8', lineHeight: 1 }}>{stage.count}</p>
              <p style={{ fontFamily: 'var(--font-mono)', fontSize: '12px', color: '#475569', marginTop: '4px' }}>${stage.value}M</p>
              {i < STAGES.length - 1 && <div className="absolute -right-[8px] top-1/2 -translate-y-1/2 z-10"><ChevronRight className="w-3 h-3" style={{ color: '#1e293b' }} /></div>}
            </div>
          ))}
        </div>
      </div>

      {/* ── TWO-COLUMN: MANDATES + INTELLIGENCE ── */}
      <div className="grid grid-cols-2 gap-8">

        {/* Left: Active Mandates */}
        <div>
          <h2 style={{ fontFamily: 'var(--font-cormorant)', fontSize: '24px', fontWeight: 600, color: '#e2e8f0', marginBottom: '20px' }}>
            Active Mandates
          </h2>
          <div className="space-y-3">
            {MANDATES.map((m, i) => (
              <Link key={m.id} href={`/deals/${m.id}`}
                className="flex items-center justify-between rounded-xl px-6 py-5 transition-all duration-200 group"
                style={{ background: '#07101e', border: '1px solid rgba(100,116,139,0.08)', animation: `slideUp 0.4s ease-out ${200 + i * 70}ms both` }}
                onMouseEnter={e => { e.currentTarget.style.borderColor = 'rgba(95,212,227,0.12)'; }}
                onMouseLeave={e => { e.currentTarget.style.borderColor = 'rgba(100,116,139,0.08)'; }}>
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    {m.priority === 'high' && <Flame className="w-3.5 h-3.5" style={{ color: '#fbbf24' }} />}
                    <span className="text-[15px] font-medium group-hover:text-[#5fd4e3] transition-colors" style={{ color: '#f0f4f8' }}>{m.codename}</span>
                    <span className="px-2 py-[2px] rounded text-[9px] font-semibold uppercase tracking-wider" style={{ background: `${m.stageColor}12`, color: m.stageColor }}>{m.stage}</span>
                  </div>
                  <div className="flex items-center gap-3 mt-1">
                    <span className="text-[12px]" style={{ color: '#64748b' }}>{m.client}</span>
                    <span style={{ color: '#1e293b' }}>·</span>
                    <span className="text-[11px] uppercase tracking-wider" style={{ color: '#475569' }}>{m.type}</span>
                    <span style={{ color: '#1e293b' }}>·</span>
                    <span style={{ fontFamily: 'var(--font-mono)', fontSize: '10px', color: '#475569' }}>{m.days}d in stage</span>
                  </div>
                </div>
                <span style={{ fontFamily: 'var(--font-mono)', fontSize: '16px', fontWeight: 600, color: '#5fd4e3' }}>${m.ev}M</span>
              </Link>
            ))}
          </div>
        </div>

        {/* Right: Activity + Intelligence */}
        <div className="space-y-8">

          {/* Activity */}
          <div>
            <div className="flex items-center gap-3 mb-5">
              <h2 style={{ fontFamily: 'var(--font-cormorant)', fontSize: '24px', fontWeight: 600, color: '#e2e8f0' }}>Team Activity</h2>
              <span className="relative flex h-[5px] w-[5px]">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full opacity-75" style={{ background: '#5fd4e3' }} />
                <span className="relative inline-flex rounded-full h-[5px] w-[5px]" style={{ background: '#5fd4e3' }} />
              </span>
            </div>
            <div className="space-y-0">
              {FEED.map((item, i) => (
                <div key={item.id} className="flex items-start gap-3 py-3 group cursor-pointer" style={{ animation: `slideUp 0.3s ease-out ${300 + i * 50}ms both` }}>
                  <div className="w-[6px] h-[6px] rounded-full flex-shrink-0 mt-[7px]" style={{ background: item.accent ? '#5fd4e3' : '#334155' }} />
                  <div className="flex-1">
                    <p className="text-[13px] leading-relaxed group-hover:text-slate-100 transition-colors" style={{ color: '#94a3b8' }}>{item.text}</p>
                    <p className="mt-1" style={{ fontSize: '11px', color: '#334155' }}>{item.by} · {item.time}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Separator */}
          <div className="h-px" style={{ background: 'rgba(100,116,139,0.06)' }} />

          {/* Quick actions */}
          <div className="grid grid-cols-3 gap-3">
            {[
              { label: 'AI Deep Dive', href: '/research/new', icon: Sparkles, color: '#5fd4e3' },
              { label: 'Add Company', href: '/crm/companies/new', icon: Building2, color: '#9499d1' },
              { label: 'View Pipeline', href: '/deals', icon: Target, color: '#60a5fa' },
            ].map((action) => {
              const Icon = action.icon;
              return (
                <Link key={action.label} href={action.href}
                  className="flex flex-col items-center gap-2 rounded-xl py-4 transition-all duration-200"
                  style={{ background: '#07101e', border: '1px solid rgba(100,116,139,0.08)' }}
                  onMouseEnter={e => { e.currentTarget.style.borderColor = `${action.color}25`; }}
                  onMouseLeave={e => { e.currentTarget.style.borderColor = 'rgba(100,116,139,0.08)'; }}>
                  <Icon className="w-5 h-5" style={{ color: action.color }} />
                  <span className="text-[11px] font-medium" style={{ color: '#64748b' }}>{action.label}</span>
                </Link>
              );
            })}
          </div>
        </div>
      </div>
    </>
  );
}

/* ══════════════════════════════════════════════════════════════════
   PAGE
   ══════════════════════════════════════════════════════════════════ */

export default function DashboardPage() {
  return (
    <div style={{ animation: 'fadeIn 0.6s ease-out' }}>
      {HAS_DATA ? <PopulatedDashboard /> : <OnboardingWizard />}
    </div>
  );
}
