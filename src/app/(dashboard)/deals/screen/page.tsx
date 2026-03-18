'use client';

import { useState } from 'react';
import Link from 'next/link';
import {
  ArrowLeft,
  ArrowRight,
  Sparkles,
  AlertTriangle,
  CheckCircle2,
  Target,
  DollarSign,
  TrendingUp,
  Shield,
  Briefcase,
  Loader2,
} from 'lucide-react';
import { THERAPY_AREAS } from '@/lib/data/therapy-areas';
import type { AIScreeningResult, OpportunityContext } from '@/lib/ai/opportunity-analyzer';

const SECTORS = [
  { id: 'biotech', label: 'Biotech' },
  { id: 'pharma', label: 'Pharma' },
  { id: 'medtech', label: 'MedTech / Devices' },
  { id: 'diagnostics', label: 'Diagnostics' },
  { id: 'digital_health', label: 'Digital Health' },
  { id: 'healthcare', label: 'Healthcare Services' },
  { id: 'nutraceuticals', label: 'Nutraceuticals' },
];

const STAGES = [
  { id: 'seed', label: 'Seed' },
  { id: 'series_a', label: 'Series A' },
  { id: 'series_b', label: 'Series B' },
  { id: 'series_c', label: 'Series C' },
  { id: 'growth', label: 'Growth' },
  { id: 'public', label: 'Public' },
];

const DIMENSION_META = {
  strategicFit: { label: 'Strategic Fit', icon: Target, color: '#5fd4e3' },
  feePotential: { label: 'Fee Potential', icon: DollarSign, color: '#34d399' },
  winProbability: { label: 'Win Probability', icon: TrendingUp, color: '#60a5fa' },
  executionRisk: { label: 'Execution Risk', icon: Shield, color: '#fbbf24' },
  strategicValue: { label: 'Strategic Value', icon: Sparkles, color: '#9499d1' },
};

export default function OpportunityScreeningPage() {
  const [form, setForm] = useState<OpportunityContext>({
    companyName: '',
    sector: '',
    therapyArea: '',
    companyStage: '',
    dealSize: 0,
    description: '',
    referralSource: '',
    knownContacts: '',
    urgency: '',
    additionalNotes: '',
  });

  const [result, setResult] = useState<AIScreeningResult | null>(null);
  const [analyzing, setAnalyzing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const canAnalyze = form.companyName.trim() && form.sector && form.description.trim();

  async function handleAnalyze() {
    if (!canAnalyze) return;
    setAnalyzing(true);
    setResult(null);
    setError(null);

    try {
      const res = await fetch('/api/screening', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || 'Analysis failed');
      }

      const data = await res.json();
      setResult(data.result);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Analysis failed');
    } finally {
      setAnalyzing(false);
    }
  }

  return (
    <div style={{ animation: 'fadeIn 0.5s ease-out' }}>
      {/* Header */}
      <div className="flex items-center justify-between mb-10">
        <div>
          <Link href="/deals" className="flex items-center gap-1.5 text-[12px] font-medium mb-3 transition-colors"
            style={{ color: '#475569' }}
            onMouseEnter={e => { e.currentTarget.style.color = '#5fd4e3'; }}
            onMouseLeave={e => { e.currentTarget.style.color = '#475569'; }}>
            <ArrowLeft className="w-3.5 h-3.5" /> Back to Pipeline
          </Link>
          <h1 style={{
            fontFamily: 'var(--font-cormorant), "Cormorant Garamond", Georgia, serif',
            fontSize: '30px', fontWeight: 600, color: '#f0f4f8',
          }}>
            Opportunity Screening
          </h1>
          <p className="mt-2 text-[14px]" style={{ color: '#64748b' }}>
            Describe the opportunity and our AI engine will assess strategic fit, fee potential, and win probability.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
        {/* LEFT: Input Form */}
        <div>
          <h2 className="text-[11px] font-semibold uppercase tracking-[0.1em] mb-6" style={{ color: '#475569' }}>
            Opportunity Context
          </h2>

          <div className="space-y-6">
            {/* Company Name */}
            <div>
              <label className="block text-[12px] font-medium mb-2" style={{ color: '#94a3b8' }}>Company Name *</label>
              <input
                type="text"
                value={form.companyName}
                onChange={e => setForm(f => ({ ...f, companyName: e.target.value }))}
                placeholder="Enter company name"
                className="input"
              />
            </div>

            {/* Sector */}
            <div>
              <label className="block text-[12px] font-medium mb-2" style={{ color: '#94a3b8' }}>Sector *</label>
              <div className="flex flex-wrap gap-2">
                {SECTORS.map(s => (
                  <button key={s.id} type="button"
                    onClick={() => setForm(f => ({ ...f, sector: s.id }))}
                    className="px-3.5 py-2 rounded-lg text-[12px] font-medium transition-all"
                    style={{
                      background: form.sector === s.id ? 'rgba(95,212,227,0.12)' : '#0d1b2e',
                      border: `1px solid ${form.sector === s.id ? 'rgba(95,212,227,0.3)' : 'rgba(100,116,139,0.1)'}`,
                      color: form.sector === s.id ? '#5fd4e3' : '#94a3b8',
                    }}>
                    {s.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Stage + Deal Size */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-[12px] font-medium mb-2" style={{ color: '#94a3b8' }}>Company Stage</label>
                <select
                  value={form.companyStage}
                  onChange={e => setForm(f => ({ ...f, companyStage: e.target.value }))}
                  className="input"
                >
                  <option value="">Select stage</option>
                  {STAGES.map(s => <option key={s.id} value={s.id}>{s.label}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-[12px] font-medium mb-2" style={{ color: '#94a3b8' }}>Estimated Deal Size ($M)</label>
                <input
                  type="number"
                  value={form.dealSize || ''}
                  onChange={e => setForm(f => ({ ...f, dealSize: parseFloat(e.target.value) || 0 }))}
                  placeholder="e.g., 200"
                  className="input"
                  style={{ fontFamily: 'var(--font-mono)' }}
                />
              </div>
            </div>

            {/* Therapy Area */}
            <div>
              <label className="block text-[12px] font-medium mb-2" style={{ color: '#94a3b8' }}>
                Therapy Area <span style={{ color: '#334155' }}>(optional)</span>
              </label>
              <select
                value={form.therapyArea}
                onChange={e => setForm(f => ({ ...f, therapyArea: e.target.value }))}
                className="input"
              >
                <option value="">Select if applicable</option>
                {THERAPY_AREAS.map(ta => <option key={ta.id} value={ta.id}>{ta.label}</option>)}
              </select>
            </div>

            {/* Description */}
            <div>
              <label className="block text-[12px] font-medium mb-2" style={{ color: '#94a3b8' }}>
                What does this company do and what do they need? *
              </label>
              <textarea
                value={form.description}
                onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
                placeholder="Describe the company, their situation, and what advisory services they might need..."
                className="input"
                style={{ minHeight: '120px', resize: 'vertical' }}
              />
            </div>

            {/* Referral Source */}
            <div>
              <label className="block text-[12px] font-medium mb-2" style={{ color: '#94a3b8' }}>How did you hear about this opportunity?</label>
              <input
                type="text"
                value={form.referralSource}
                onChange={e => setForm(f => ({ ...f, referralSource: e.target.value }))}
                placeholder="e.g., Board member referral, met at JPM, inbound inquiry..."
                className="input"
              />
            </div>

            {/* Known Contacts */}
            <div>
              <label className="block text-[12px] font-medium mb-2" style={{ color: '#94a3b8' }}>Existing contacts or relationships</label>
              <input
                type="text"
                value={form.knownContacts}
                onChange={e => setForm(f => ({ ...f, knownContacts: e.target.value }))}
                placeholder="e.g., Know the CEO from prior deal, introduced by partner at Apex..."
                className="input"
              />
            </div>

            {/* Urgency */}
            <div>
              <label className="block text-[12px] font-medium mb-2" style={{ color: '#94a3b8' }}>Timeline or urgency</label>
              <input
                type="text"
                value={form.urgency}
                onChange={e => setForm(f => ({ ...f, urgency: e.target.value }))}
                placeholder="e.g., Looking to close by Q2, no rush, urgent — need advisor ASAP..."
                className="input"
              />
            </div>

            {/* Additional Notes */}
            <div>
              <label className="block text-[12px] font-medium mb-2" style={{ color: '#94a3b8' }}>Additional notes</label>
              <textarea
                value={form.additionalNotes}
                onChange={e => setForm(f => ({ ...f, additionalNotes: e.target.value }))}
                placeholder="Anything else relevant — competitive dynamics, strategic context..."
                className="input"
                style={{ minHeight: '80px', resize: 'vertical' }}
              />
            </div>

            {/* Analyze Button */}
            <button
              onClick={handleAnalyze}
              disabled={!canAnalyze || analyzing}
              className="w-full flex items-center justify-center gap-2 py-3 rounded-lg text-[14px] font-semibold transition-all"
              style={{
                background: canAnalyze ? 'linear-gradient(135deg, #5fd4e3, #9499d1)' : '#1e293b',
                color: canAnalyze ? '#04080f' : '#475569',
                opacity: analyzing ? 0.7 : 1,
              }}
            >
              {analyzing ? (
                <><Loader2 className="w-4 h-4 animate-spin" /> Analyzing opportunity...</>
              ) : (
                <><Sparkles className="w-4 h-4" /> Analyze Opportunity</>
              )}
            </button>
          </div>
        </div>

        {/* RIGHT: AI Assessment */}
        <div>
          {error && (
            <div className="rounded-xl p-4 mb-6" style={{ background: 'rgba(248,113,113,0.06)', border: '1px solid rgba(248,113,113,0.15)' }}>
              <p className="text-[13px]" style={{ color: '#f87171' }}>{error}</p>
            </div>
          )}

          {!result && !analyzing && (
            <div className="flex flex-col items-center justify-center h-full text-center px-4 overflow-hidden" style={{ minHeight: '400px' }}>
              <Sparkles className="w-10 h-10 mb-4" style={{ color: '#1e293b' }} />
              <p className="text-[15px] font-medium mb-2" style={{ color: '#334155' }}>AI Assessment</p>
              <p className="text-[13px] max-w-xs" style={{ color: '#1e293b' }}>
                Fill in the opportunity context and click Analyze. Our engine will score strategic fit, fee potential, win probability, execution risk, and strategic value.
              </p>
            </div>
          )}

          {analyzing && (
            <div className="flex flex-col items-center justify-center h-full text-center" style={{ minHeight: '400px' }}>
              <div className="w-16 h-16 rounded-2xl flex items-center justify-center mb-6" style={{ background: 'rgba(95,212,227,0.06)', border: '1px solid rgba(95,212,227,0.1)' }}>
                <Sparkles className="w-7 h-7 animate-pulse" style={{ color: '#5fd4e3' }} />
              </div>
              <p className="text-[15px] font-medium mb-2" style={{ color: '#e2e8f0' }}>Analyzing opportunity...</p>
              <p className="text-[13px]" style={{ color: '#475569' }}>Evaluating strategic fit, fee potential, and win probability</p>
            </div>
          )}

          {result && (
            <div style={{ animation: 'slideUp 0.5s ease-out' }}>
              <h2 className="text-[11px] font-semibold uppercase tracking-[0.1em] mb-6" style={{ color: '#475569' }}>
                AI Assessment
              </h2>

              {/* Recommendation Badge */}
              <div className="rounded-xl p-6 mb-6" style={{
                background: `${result.recommendationColor}08`,
                border: `1px solid ${result.recommendationColor}20`,
              }}>
                <div className="flex items-center justify-between mb-3">
                  <span className="text-[10px] font-semibold uppercase tracking-[0.1em]" style={{ color: '#475569' }}>Recommendation</span>
                  <span style={{ fontFamily: 'var(--font-mono)', fontSize: '14px', fontWeight: 700, color: result.recommendationColor }}>
                    {result.overallScore}/25
                  </span>
                </div>
                <p style={{
                  fontFamily: 'var(--font-cormorant), "Cormorant Garamond", Georgia, serif',
                  fontSize: '28px', fontWeight: 600, color: result.recommendationColor,
                }}>
                  {result.recommendationLabel}
                </p>
                <div className="flex items-center gap-2 mt-2">
                  <Briefcase className="w-3.5 h-3.5" style={{ color: '#475569' }} />
                  <span className="text-[13px]" style={{ color: '#94a3b8' }}>
                    Suggested engagement: <strong style={{ color: '#e2e8f0' }}>{result.engagementType}</strong>
                  </span>
                </div>
                {result.engagementTypeRationale && (
                  <p className="text-[12px] mt-1" style={{ color: '#475569' }}>{result.engagementTypeRationale}</p>
                )}
              </div>

              {/* Executive Summary */}
              {result.executiveSummary && (
                <div className="rounded-xl p-5 mb-6" style={{ background: '#07101e', border: '1px solid rgba(95,212,227,0.1)' }}>
                  <span className="text-[10px] font-semibold uppercase tracking-[0.1em]" style={{ color: '#5fd4e3' }}>Executive Summary</span>
                  <p className="mt-2 text-[13px] leading-relaxed" style={{ color: '#cbd5e1' }}>{result.executiveSummary}</p>
                </div>
              )}

              {/* Fee Estimate */}
              <div className="rounded-xl p-5 mb-6" style={{ background: '#07101e', border: '1px solid rgba(100,116,139,0.1)' }}>
                <span className="text-[10px] font-semibold uppercase tracking-[0.1em]" style={{ color: '#475569' }}>Estimated Advisory Fee</span>
                <p className="mt-1" style={{ fontFamily: 'var(--font-mono)', fontSize: '22px', fontWeight: 600, color: '#5fd4e3' }}>
                  {result.estimatedFeeRange.low} – {result.estimatedFeeRange.high}
                </p>
              </div>

              {/* Dimension Scores */}
              <div className="space-y-4 mb-6">
                {(Object.entries(result.dimensions) as [keyof typeof DIMENSION_META, typeof result.dimensions.strategicFit][]).map(([key, dim]) => {
                  const meta = DIMENSION_META[key];
                  const Icon = meta.icon;
                  const confidence = 'confidence' in dim ? (dim as { confidence?: number }).confidence : null;
                  return (
                    <div key={key} className="rounded-xl p-5" style={{ background: '#07101e', border: '1px solid rgba(100,116,139,0.08)' }}>
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center gap-2">
                          <Icon className="w-4 h-4" style={{ color: meta.color }} />
                          <span className="text-[13px] font-medium" style={{ color: '#e2e8f0' }}>{meta.label}</span>
                          {confidence != null && (
                            <span style={{ fontFamily: 'var(--font-mono)', fontSize: '10px', color: '#475569' }}>
                              {Math.round(confidence * 100)}% conf.
                            </span>
                          )}
                        </div>
                        <span style={{ fontFamily: 'var(--font-mono)', fontSize: '13px', fontWeight: 600, color: meta.color }}>
                          {dim.score}/5
                        </span>
                      </div>
                      <div className="h-1.5 rounded-full mb-3" style={{ background: 'rgba(100,116,139,0.08)' }}>
                        <div className="h-full rounded-full transition-all duration-700" style={{
                          width: `${(dim.score / 5) * 100}%`,
                          background: meta.color,
                        }} />
                      </div>
                      <p className="text-[12px] leading-relaxed" style={{ color: '#64748b' }}>{dim.rationale}</p>
                      {'keyFactors' in dim && Array.isArray((dim as { keyFactors?: string[] }).keyFactors) && (
                        <div className="flex flex-wrap gap-1.5 mt-2">
                          {((dim as { keyFactors: string[] }).keyFactors).map((f: string, i: number) => (
                            <span key={i} className="px-2 py-0.5 rounded text-[10px]" style={{ background: 'rgba(100,116,139,0.06)', color: '#64748b' }}>{f}</span>
                          ))}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>

              {/* Competitive Insights */}
              {result.competitiveInsights && result.competitiveInsights.length > 0 && (
                <div className="mb-6">
                  <h3 className="text-[11px] font-semibold uppercase tracking-[0.1em] mb-3" style={{ color: '#475569' }}>Competitive Insights</h3>
                  <div className="space-y-2">
                    {result.competitiveInsights.map((insight: string, i: number) => (
                      <div key={i} className="flex items-start gap-2.5 rounded-lg p-3" style={{ background: 'rgba(95,212,227,0.03)', border: '1px solid rgba(95,212,227,0.08)' }}>
                        <TrendingUp className="w-3.5 h-3.5 flex-shrink-0 mt-0.5" style={{ color: '#5fd4e3' }} />
                        <span className="text-[12px] leading-relaxed" style={{ color: '#94a3b8' }}>{insight}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Key Questions */}
              {result.keyQuestions && result.keyQuestions.length > 0 && (
                <div className="mb-6">
                  <h3 className="text-[11px] font-semibold uppercase tracking-[0.1em] mb-3" style={{ color: '#475569' }}>Key Questions to Resolve</h3>
                  <div className="space-y-2">
                    {result.keyQuestions.map((q: string, i: number) => (
                      <div key={i} className="flex items-start gap-2.5">
                        <span className="text-[12px] font-medium" style={{ fontFamily: 'var(--font-mono)', color: '#475569' }}>{String(i + 1).padStart(2, '0')}</span>
                        <span className="text-[12px] leading-relaxed" style={{ color: '#94a3b8' }}>{q}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Risk Factors */}
              {result.riskFactors.length > 0 && (
                <div className="mb-6">
                  <h3 className="text-[11px] font-semibold uppercase tracking-[0.1em] mb-3" style={{ color: '#475569' }}>Risk Factors</h3>
                  <div className="space-y-2">
                    {result.riskFactors.map((risk, i) => (
                      <div key={i} className="flex items-start gap-2.5 rounded-lg p-3" style={{ background: 'rgba(251,191,36,0.04)', border: '1px solid rgba(251,191,36,0.1)' }}>
                        <AlertTriangle className="w-3.5 h-3.5 flex-shrink-0 mt-0.5" style={{ color: '#fbbf24' }} />
                        <span className="text-[12px] leading-relaxed" style={{ color: '#94a3b8' }}>{risk}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Next Steps */}
              <div className="mb-6">
                <h3 className="text-[11px] font-semibold uppercase tracking-[0.1em] mb-3" style={{ color: '#475569' }}>Suggested Next Steps</h3>
                <div className="space-y-2">
                  {result.suggestedNextSteps.map((step, i) => (
                    <div key={i} className="flex items-start gap-2.5">
                      <CheckCircle2 className="w-3.5 h-3.5 flex-shrink-0 mt-0.5" style={{ color: '#5fd4e3' }} />
                      <span className="text-[13px]" style={{ color: '#94a3b8' }}>{step}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Actions */}
              <div className="flex items-center gap-3">
                <Link href="/deals/new"
                  className="flex items-center gap-2 px-5 py-2.5 rounded-lg text-[13px] font-semibold transition-all"
                  style={{ background: 'linear-gradient(135deg, #5fd4e3, #9499d1)', color: '#04080f' }}>
                  <Briefcase className="w-4 h-4" /> Create Mandate
                </Link>
                <button
                  onClick={() => { setResult(null); setForm({ companyName: '', sector: '', therapyArea: '', companyStage: '', dealSize: 0, description: '', referralSource: '', knownContacts: '', urgency: '', additionalNotes: '' }); }}
                  className="px-4 py-2.5 rounded-lg text-[13px] font-medium transition-colors"
                  style={{ color: '#64748b', border: '1px solid rgba(100,116,139,0.1)' }}>
                  Screen Another
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
