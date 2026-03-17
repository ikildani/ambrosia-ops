'use client';

import { useState, useCallback } from 'react';
import {
  BarChart3,
  Target,
  Shield,
  DollarSign,
  TrendingUp,
  Activity,
  Users,
  Tag,
  FileText,
  Building2,
  Sparkles,
  Search,
  Check,
  CheckSquare,
  Square,
  Clock,
  Download,
  Save,
  Share2,
  ChevronRight,
  ChevronDown,
  Loader2,
  Zap,
  ArrowLeft,
  RefreshCw,
} from 'lucide-react';
import { THERAPY_AREAS } from '@/lib/data/therapy-areas';
import { ORG_TYPES } from '@/lib/data/constants';

/* ══════════════════════════════════════════════════════════════════
   ANALYSIS TYPES
   ══════════════════════════════════════════════════════════════════ */

interface AnalysisType {
  id: string;
  name: string;
  description: string;
  icon: React.ElementType;
  color: string;
  estimatedTime: string;
}

const ANALYSIS_TYPES: AnalysisType[] = [
  {
    id: 'market_sizing',
    name: 'Market Sizing',
    description: 'TAM/SAM/SOM for the target indication. Total addressable revenue opportunity with patient funnel and geographic breakdown.',
    icon: BarChart3,
    color: '#5fd4e3',
    estimatedTime: '~30 seconds',
  },
  {
    id: 'competitive_landscape',
    name: 'Competitive Landscape',
    description: 'Pipeline density, competitor positioning, white space analysis, differentiation opportunities.',
    icon: Target,
    color: '#60a5fa',
    estimatedTime: '~45 seconds',
  },
  {
    id: 'regulatory_pathway',
    name: 'Regulatory Pathway',
    description: 'FDA/EMA pathway analysis, designation eligibility, timeline estimates, key risks.',
    icon: Shield,
    color: '#fbbf24',
    estimatedTime: '~25 seconds',
  },
  {
    id: 'deal_valuation',
    name: 'Deal Valuation',
    description: 'Comparable transactions, expected deal terms, upfront/milestone/royalty benchmarks.',
    icon: DollarSign,
    color: '#34d399',
    estimatedTime: '~35 seconds',
  },
  {
    id: 'sensitivity_analysis',
    name: 'Sensitivity Analysis',
    description: 'Scenario modeling across pricing, market share, and timing assumptions.',
    icon: TrendingUp,
    color: '#a78bfa',
    estimatedTime: '~20 seconds',
  },
  {
    id: 'clinical_pipeline',
    name: 'Clinical Pipeline',
    description: 'Active trials, enrollment status, readout timelines, competitive trial landscape.',
    icon: Activity,
    color: '#f87171',
    estimatedTime: '~40 seconds',
  },
  {
    id: 'partner_discovery',
    name: 'Partner Discovery',
    description: 'Potential acquirers, licensees, or investors ranked by strategic fit.',
    icon: Users,
    color: '#9499d1',
    estimatedTime: '~30 seconds',
  },
  {
    id: 'pricing_intelligence',
    name: 'Pricing Intelligence',
    description: 'Comparable drug/device pricing, payer dynamics, reimbursement landscape.',
    icon: Tag,
    color: '#fbbf24',
    estimatedTime: '~25 seconds',
  },
  {
    id: 'patent_ip_landscape',
    name: 'Patent & IP Landscape',
    description: 'Key patents, expiration dates, freedom-to-operate considerations.',
    icon: FileText,
    color: '#94a3b8',
    estimatedTime: '~35 seconds',
  },
  {
    id: 'company_deep_dive',
    name: 'Company Deep Dive',
    description: 'Comprehensive company profile combining all available data sources.',
    icon: Building2,
    color: '#5fd4e3',
    estimatedTime: '~50 seconds',
  },
];

/* ══════════════════════════════════════════════════════════════════
   DATA CONFIDENCE & PREVIEW TOOLTIPS
   ══════════════════════════════════════════════════════════════════ */

const CONFIDENCE_LEVELS: Record<string, { label: string; color: string; dotColor: string }> = {
  market_sizing:       { label: 'High Confidence',  color: '#34d399', dotColor: '#34d399' },
  competitive_landscape: { label: 'High Confidence',  color: '#34d399', dotColor: '#34d399' },
  clinical_pipeline:   { label: 'High Confidence',  color: '#34d399', dotColor: '#34d399' },
  regulatory_pathway:  { label: 'High Confidence',  color: '#34d399', dotColor: '#34d399' },
  deal_valuation:      { label: 'Moderate',          color: '#fbbf24', dotColor: '#fbbf24' },
  partner_discovery:   { label: 'Moderate',          color: '#fbbf24', dotColor: '#fbbf24' },
  pricing_intelligence:{ label: 'Moderate',          color: '#fbbf24', dotColor: '#fbbf24' },
  patent_ip_landscape: { label: 'Limited Data',      color: '#94a3b8', dotColor: '#94a3b8' },
  sensitivity_analysis:{ label: 'Limited Data',      color: '#94a3b8', dotColor: '#94a3b8' },
  company_deep_dive:   { label: 'High Confidence',  color: '#34d399', dotColor: '#34d399' },
};

const PREVIEW_CONTENTS: Record<string, string[]> = {
  market_sizing:       ['TAM/SAM/SOM', 'Patient funnel', 'Geography breakdown', '10-year revenue projection', 'Pricing benchmarks'],
  competitive_landscape: ['Pipeline map', 'Competitor profiles', 'Differentiation analysis', 'White space identification', 'Market share estimates'],
  regulatory_pathway:  ['FDA/EMA pathway selection', 'Designation eligibility', 'Timeline estimates', 'Risk assessment', 'Comparable approvals'],
  deal_valuation:      ['Comparable transactions', 'Upfront/milestone/royalty benchmarks', 'Deal structure analysis', 'Scenario modeling'],
  sensitivity_analysis:['Bull/base/bear scenarios', 'Key variable sensitivity', 'Monte Carlo simulation', 'Probability-weighted outcomes'],
  clinical_pipeline:   ['Active trials', 'Enrollment status', 'Readout calendar', 'Endpoint analysis', 'Competitor trial landscape'],
  partner_discovery:   ['Strategic fit scoring', 'BD contact mapping', 'Deal history analysis', 'Capability assessment'],
  pricing_intelligence:['WAC/net price benchmarks', 'Payer dynamics', 'Reimbursement landscape', 'Launch pricing strategy'],
  patent_ip_landscape: ['Key patent landscape', 'Expiration timeline', 'Freedom-to-operate', 'Litigation risk'],
  company_deep_dive:   ['All analyses combined', 'Executive summary', 'Investment thesis', 'Risk assessment', 'Recommended actions'],
};

/* ══════════════════════════════════════════════════════════════════
   MOCK DATA
   ══════════════════════════════════════════════════════════════════ */

interface MockCompany {
  id: string;
  name: string;
  type: string;
  therapyArea: string;
  stage: string;
  score: number;
}

const MOCK_COMPANIES: MockCompany[] = [
  { id: '1', name: 'NeuroGen Therapeutics', type: 'Biotech', therapyArea: 'neurology', stage: 'Phase 2', score: 87 },
  { id: '2', name: 'PharmaLink Oncology', type: 'Pharma', therapyArea: 'oncology', stage: 'Phase 3', score: 92 },
  { id: '3', name: 'CardioVista', type: 'Biotech', therapyArea: 'cardiovascular', stage: 'Phase 1', score: 74 },
  { id: '4', name: 'MedVance Surgical', type: 'MedTech / Devices', therapyArea: '', stage: 'Commercial', score: 79 },
  { id: '5', name: 'RarePath Sciences', type: 'Biotech', therapyArea: 'rare_disease', stage: 'Phase 2', score: 81 },
  { id: '6', name: 'Clarity Dx', type: 'Diagnostics', therapyArea: 'oncology', stage: 'Growth', score: 76 },
  { id: '7', name: 'Vitara Health', type: 'Digital Health', therapyArea: '', stage: 'Series B', score: 71 },
  { id: '8', name: 'NutriGen Labs', type: 'Nutraceuticals / Consumer Health', therapyArea: '', stage: 'Growth', score: 65 },
];

interface RecentReport {
  id: string;
  title: string;
  company: string;
  analyses: string[];
  date: string;
  author: string;
}

const MOCK_RECENT_REPORTS: RecentReport[] = [
  {
    id: 'r1',
    title: 'NeuroGen Therapeutics — Advisory Intelligence Report',
    company: 'NeuroGen Therapeutics',
    analyses: ['market_sizing', 'competitive_landscape', 'deal_valuation'],
    date: '2026-03-13T14:30:00Z',
    author: 'Sarah Chen',
  },
  {
    id: 'r2',
    title: 'PharmaLink Oncology — Full Landscape Analysis',
    company: 'PharmaLink Oncology',
    analyses: ['market_sizing', 'clinical_pipeline', 'regulatory_pathway', 'pricing_intelligence'],
    date: '2026-03-11T09:15:00Z',
    author: 'James Rivera',
  },
  {
    id: 'r3',
    title: 'RarePath Sciences — Deal Thesis Package',
    company: 'RarePath Sciences',
    analyses: ['deal_valuation', 'sensitivity_analysis', 'partner_discovery'],
    date: '2026-03-08T16:45:00Z',
    author: 'Michael Torres',
  },
];

/* ══════════════════════════════════════════════════════════════════
   MOCK REPORT SECTIONS
   ══════════════════════════════════════════════════════════════════ */

function getMockReportSection(analysisId: string, companyName: string) {
  const sections: Record<string, { metrics: Record<string, string>; content: string }> = {
    market_sizing: {
      metrics: { 'TAM': '$14.2B', 'SAM': '$4.8B', 'SOM (Y5)': '$1.2B', 'Patient Pop.': '2.4M', 'CAGR': '12.3%' },
      content: `The total addressable market for ${companyName}'s lead indication is estimated at $14.2B globally, with the serviceable addressable market at $4.8B across the US and EU5. Patient funnel analysis indicates approximately 2.4M diagnosed patients with a treatment-seeking rate of 67%. Geographic breakdown shows 58% US, 28% EU5, 14% ROW.`,
    },
    competitive_landscape: {
      metrics: { 'Competitors': '12', 'Phase 3+': '4', 'White Space': 'Moderate', 'Differentiation': 'Strong' },
      content: `The competitive landscape includes 12 active programs across all clinical stages. Four competitors have Phase 3 or approved assets. White space analysis reveals moderate opportunity in combination therapy approaches. ${companyName}'s mechanism of action provides strong differentiation vs. current standard of care.`,
    },
    regulatory_pathway: {
      metrics: { 'Primary Path': '505(b)(2)', 'Designation': 'Fast Track', 'Est. Timeline': '24 mo', 'Risk Level': 'Moderate' },
      content: `Recommended regulatory pathway is 505(b)(2) with potential for Fast Track designation based on unmet medical need criteria. Estimated timeline to NDA submission is 24 months from Phase 3 initiation. Key risk factors include endpoint selection and comparator arm design.`,
    },
    deal_valuation: {
      metrics: { 'Upfront': '$180M', 'Milestones': '$750M', 'Royalties': '12-18%', 'Total Value': '$930M' },
      content: `Based on 8 comparable transactions in the last 24 months, expected deal terms include an upfront payment of $180M (median), development and commercial milestones totaling $750M, and tiered royalties of 12-18% on net sales. Total potential deal value of $930M.`,
    },
    sensitivity_analysis: {
      metrics: { 'Base NPV': '$2.1B', 'Bull Case': '$3.8B', 'Bear Case': '$680M', 'Prob. Adj.': '$1.4B' },
      content: `Sensitivity analysis across pricing (±20%), market share (15-35%), and launch timing (±12 months) scenarios. Base case NPV of $2.1B with probability-adjusted value of $1.4B. Key value driver is peak market share assumption, contributing 42% of variance.`,
    },
    clinical_pipeline: {
      metrics: { 'Active Trials': '3', 'Enrollment': '78%', 'Next Readout': 'Q3 2026', 'Success Prob.': '64%' },
      content: `Three active clinical trials identified: one Phase 2b (78% enrolled, readout Q3 2026), one Phase 1b expansion (recruiting), and one investigator-sponsored study. Competitive trial landscape shows 8 trials in similar indications with 3 expected readouts in the next 12 months.`,
    },
    partner_discovery: {
      metrics: { 'Top Matches': '8', 'Strategic Fit': '4 High', 'Active Seekers': '3', 'Avg. Premium': '45%' },
      content: `Eight potential partners identified through strategic fit analysis. Four rank as high-fit based on therapeutic area overlap, pipeline gaps, and geographic presence. Three companies are actively seeking assets in this space based on public commentary and conference presentations.`,
    },
    pricing_intelligence: {
      metrics: { 'WAC Range': '$85K-$145K', 'Net Price': '$62K-$98K', 'GTN': '28-35%', 'Payer Mix': '72% Comm.' },
      content: `Comparable drug pricing analysis indicates WAC range of $85,000-$145,000 annually. Net pricing after rebates estimated at $62,000-$98,000. Gross-to-net discounts of 28-35% expected. Payer mix analysis shows 72% commercial, 18% Medicare, 10% Medicaid.`,
    },
    patent_ip_landscape: {
      metrics: { 'Key Patents': '6', 'Earliest Exp.': '2034', 'FTO Risk': 'Low', 'Exclusivity': '2037' },
      content: `Six key patents identified covering composition of matter, methods of use, and formulation. Earliest patent expiration in 2034 with regulatory exclusivity extending to 2037. Freedom-to-operate analysis indicates low risk with no blocking patents identified in current landscape.`,
    },
    company_deep_dive: {
      metrics: { 'Founded': '2019', 'Employees': '85', 'Cash': '$210M', 'Runway': '18 mo' },
      content: `${companyName} is a clinical-stage company with 85 employees and $210M in cash, providing approximately 18 months of runway at current burn rate. Leadership team includes former executives from major pharma companies. Three institutional investors hold 65% of equity.`,
    },
  };
  return sections[analysisId] || { metrics: {}, content: 'Analysis data is being compiled.' };
}

/* ══════════════════════════════════════════════════════════════════
   HELPERS
   ══════════════════════════════════════════════════════════════════ */

function formatRelativeDate(date: string): string {
  const now = new Date();
  const d = new Date(date);
  const diffMs = now.getTime() - d.getTime();
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
  if (diffDays === 0) return 'Today';
  if (diffDays === 1) return 'Yesterday';
  if (diffDays < 7) return `${diffDays}d ago`;
  return `${Math.floor(diffDays / 7)}w ago`;
}

function therapyAreaLabel(id: string): string {
  const ta = THERAPY_AREAS.find(t => t.id === id);
  return ta?.label || id.split('_').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');
}

function getAnalysisName(id: string): string {
  return ANALYSIS_TYPES.find(a => a.id === id)?.name || id;
}

/* ══════════════════════════════════════════════════════════════════
   PAGE COMPONENT
   ══════════════════════════════════════════════════════════════════ */

export default function IntelligencePage() {
  // Step management
  const [currentStep, setCurrentStep] = useState(1);

  // Step 1: Subject
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCompany, setSelectedCompany] = useState<MockCompany | null>(null);
  const [isNewCompany, setIsNewCompany] = useState(false);
  const [newCompanyName, setNewCompanyName] = useState('');
  const [newSector, setNewSector] = useState('');
  const [newTherapyArea, setNewTherapyArea] = useState('');
  const [newIndication, setNewIndication] = useState('');

  // Step 2: Analyses
  const [selectedAnalyses, setSelectedAnalyses] = useState<Set<string>>(new Set());

  // Step 3: Configuration
  const [reportTitle, setReportTitle] = useState('');
  const [outputFormat, setOutputFormat] = useState<'pdf' | 'pptx' | 'in_app'>('in_app');
  const [confidentiality, setConfidentiality] = useState<'confidential' | 'highly_confidential'>('confidential');

  // Step 2: Preview expansion
  const [expandedPreviews, setExpandedPreviews] = useState<Set<string>>(new Set());

  // Step 3→4: Generation progress
  const [showGenerationProgress, setShowGenerationProgress] = useState(false);
  const [generationStatuses, setGenerationStatuses] = useState<Record<string, 'queued' | 'processing' | 'complete'>>({});
  const [generationProgress, setGenerationProgress] = useState(0);

  // Step 4: Generated
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedReport, setGeneratedReport] = useState<{
    reportId: string;
    title: string;
    sections: Array<{ type: string; title: string; content: string; metrics: Record<string, string> }>;
    generatedAt: string;
    estimatedConfidence: string;
  } | null>(null);

  // Search filtering
  const filteredCompanies = searchQuery.length > 0
    ? MOCK_COMPANIES.filter(c =>
        c.name.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : [];

  // Handlers
  const toggleAnalysis = useCallback((id: string) => {
    setSelectedAnalyses(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }, []);

  const togglePreview = useCallback((id: string) => {
    setExpandedPreviews(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }, []);

  // AI-Suggested analyses based on company profile
  const getRecommendedAnalyses = useCallback((): string[] => {
    const recommended = ['market_sizing', 'competitive_landscape'];
    const cType = (selectedCompany?.type || newSector || '').toLowerCase();
    const searchLower = searchQuery.toLowerCase();

    // Biotech/Pharma: clinical pipeline + deal valuation
    if (cType.includes('biotech') || cType.includes('pharma')) {
      recommended.push('deal_valuation', 'clinical_pipeline');
    }
    // MedTech/Devices & Diagnostics: patent landscape + deal valuation
    if (cType.includes('medtech') || cType.includes('device') || cType.includes('diagnostics')) {
      recommended.push('deal_valuation', 'patent_ip_landscape');
    }
    // Digital health: company deep dive + partner discovery
    if (cType.includes('digital') || cType.includes('health')) {
      if (!recommended.includes('deal_valuation')) recommended.push('deal_valuation');
      recommended.push('company_deep_dive');
    }
    // Nutraceuticals: pricing intelligence + company deep dive
    if (cType.includes('nutraceutical') || cType.includes('consumer')) {
      recommended.push('pricing_intelligence');
      if (!recommended.includes('company_deep_dive')) recommended.push('company_deep_dive');
    }
    // Search-based hints
    if (searchLower.includes('bio') || searchLower.includes('pharma') || searchLower.includes('therapeutics')) {
      if (!recommended.includes('deal_valuation')) recommended.push('deal_valuation');
      if (!recommended.includes('clinical_pipeline')) recommended.push('clinical_pipeline');
    }
    // Deduplicate
    return [...new Set(recommended)];
  }, [selectedCompany, newSector, searchQuery]);

  const selectRecommended = useCallback(() => {
    const recommended = getRecommendedAnalyses();
    setSelectedAnalyses(new Set(recommended));
  }, [getRecommendedAnalyses]);

  const selectAll = useCallback(() => {
    if (selectedAnalyses.size === ANALYSIS_TYPES.length) {
      setSelectedAnalyses(new Set());
    } else {
      setSelectedAnalyses(new Set(ANALYSIS_TYPES.map(a => a.id)));
    }
  }, [selectedAnalyses.size]);

  const companyName = selectedCompany?.name || newCompanyName;

  const estimatedTotalTime = selectedAnalyses.size * 8; // rough seconds

  const handleGenerate = async () => {
    const analysisList = Array.from(selectedAnalyses);

    // Initialize generation progress screen
    setShowGenerationProgress(true);
    setIsGenerating(true);
    setGenerationProgress(0);

    const initialStatuses: Record<string, 'queued' | 'processing' | 'complete'> = {};
    analysisList.forEach(id => { initialStatuses[id] = 'queued'; });
    setGenerationStatuses(initialStatuses);

    // Animate through analyses sequentially
    for (let i = 0; i < analysisList.length; i++) {
      await new Promise(resolve => setTimeout(resolve, 400));
      setGenerationStatuses(prev => ({ ...prev, [analysisList[i]]: 'processing' }));
      await new Promise(resolve => setTimeout(resolve, 800));
      setGenerationStatuses(prev => ({ ...prev, [analysisList[i]]: 'complete' }));
      setGenerationProgress(Math.round(((i + 1) / analysisList.length) * 100));
    }

    // Brief pause then transition to results
    await new Promise(resolve => setTimeout(resolve, 600));

    // Build mock report
    const sections = analysisList.map(id => {
      const analysis = ANALYSIS_TYPES.find(a => a.id === id);
      const mockData = getMockReportSection(id, companyName);
      return {
        type: id,
        title: analysis?.name || id,
        content: mockData.content,
        metrics: mockData.metrics,
      };
    });

    setGeneratedReport({
      reportId: `RPT-${Date.now().toString(36).toUpperCase()}`,
      title: effectiveTitle || `${companyName} — Advisory Intelligence Report`,
      sections,
      generatedAt: new Date().toISOString(),
      estimatedConfidence: 'High',
    });

    setShowGenerationProgress(false);
    setIsGenerating(false);
    setCurrentStep(4);
  };

  const handleReset = () => {
    setCurrentStep(1);
    setSelectedCompany(null);
    setIsNewCompany(false);
    setNewCompanyName('');
    setNewSector('');
    setNewTherapyArea('');
    setNewIndication('');
    setSelectedAnalyses(new Set());
    setReportTitle('');
    setOutputFormat('in_app');
    setConfidentiality('confidential');
    setGeneratedReport(null);
    setSearchQuery('');
  };

  // Auto-set report title
  const effectiveTitle = reportTitle || (companyName ? `${companyName} — Advisory Intelligence Report` : '');

  const canProceedStep1 = selectedCompany || (isNewCompany && newCompanyName && newSector);
  const canProceedStep2 = selectedAnalyses.size > 0;

  return (
    <div style={{ animation: 'fadeIn 0.6s ease-out' }}>
      {/* Header */}
      <div className="flex items-start justify-between mb-10" style={{ animation: 'slideUp 0.5s ease-out' }}>
        <div>
          <h1 style={{
            fontFamily: 'var(--font-cormorant), "Cormorant Garamond", Georgia, serif',
            fontSize: '32px',
            fontWeight: 600,
            color: '#f0f4f8',
            lineHeight: 1.15,
            letterSpacing: '-0.01em',
          }}>
            Intelligence Workbench
          </h1>
          <p className="mt-2" style={{ fontSize: '14px', color: '#64748b' }}>
            Generate custom advisory reports powered by proprietary data engines
          </p>
        </div>

        {currentStep > 1 && currentStep < 4 && (
          <button
            onClick={() => setCurrentStep(prev => prev - 1)}
            className="flex items-center gap-2 px-4 py-2 rounded-lg text-[13px] font-medium transition-all"
            style={{ color: '#64748b', background: 'rgba(100,116,139,0.06)', border: '1px solid rgba(100,116,139,0.08)' }}
            onMouseEnter={e => { e.currentTarget.style.color = '#94a3b8'; e.currentTarget.style.borderColor = 'rgba(100,116,139,0.2)'; }}
            onMouseLeave={e => { e.currentTarget.style.color = '#64748b'; e.currentTarget.style.borderColor = 'rgba(100,116,139,0.08)'; }}
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            Back
          </button>
        )}
      </div>

      {/* Progress Steps */}
      {currentStep < 4 && (
        <div className="flex items-center gap-3 mb-10" style={{ animation: 'slideUp 0.5s ease-out 100ms both' }}>
          {[
            { step: 1, label: 'Select Subject' },
            { step: 2, label: 'Choose Analyses' },
            { step: 3, label: 'Configure & Generate' },
          ].map((s, i) => (
            <div key={s.step} className="flex items-center gap-3">
              {i > 0 && <div className="w-8 h-px" style={{ background: currentStep >= s.step ? 'rgba(95,212,227,0.3)' : '#1e293b' }} />}
              <div className="flex items-center gap-2.5">
                <div
                  className="w-7 h-7 rounded-full flex items-center justify-center text-[11px] font-semibold transition-all duration-300"
                  style={{
                    background: currentStep > s.step
                      ? 'rgba(95,212,227,0.15)'
                      : currentStep === s.step
                        ? 'linear-gradient(135deg, #5fd4e3, #9499d1)'
                        : 'rgba(100,116,139,0.06)',
                    color: currentStep > s.step ? '#5fd4e3' : currentStep === s.step ? '#04080f' : '#475569',
                    border: `1px solid ${currentStep >= s.step ? 'rgba(95,212,227,0.2)' : 'rgba(100,116,139,0.1)'}`,
                  }}
                >
                  {currentStep > s.step ? <Check className="w-3.5 h-3.5" /> : s.step}
                </div>
                <span
                  className="text-[12px] font-medium tracking-wide"
                  style={{ color: currentStep >= s.step ? '#94a3b8' : '#334155' }}
                >
                  {s.label}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}

      <div className="grid grid-cols-1 xl:grid-cols-[1fr_340px] gap-8">
        {/* ── MAIN CONTENT ── */}
        <div>
          {/* ════════════════ STEP 1: SELECT SUBJECT ════════════════ */}
          {currentStep === 1 && (
            <div style={{ animation: 'slideUp 0.4s ease-out' }}>
              <div className="rounded-xl overflow-hidden" style={{ background: '#07101e', border: '1px solid rgba(100,116,139,0.08)' }}>
                <div className="px-6 py-5 border-b" style={{ borderColor: 'rgba(100,116,139,0.06)' }}>
                  <h2 style={{ fontFamily: 'var(--font-cormorant), "Cormorant Garamond", Georgia, serif', fontSize: '22px', fontWeight: 600, color: '#e2e8f0' }}>
                    Select Subject
                  </h2>
                  <p className="mt-1" style={{ fontSize: '13px', color: '#475569' }}>
                    Search for an existing company or enter a new one
                  </p>
                </div>

                <div className="p-6">
                  {/* Toggle */}
                  <div className="flex items-center gap-2 mb-6">
                    <button
                      onClick={() => { setIsNewCompany(false); setSelectedCompany(null); }}
                      className="px-4 py-2 rounded-lg text-[12px] font-semibold transition-all"
                      style={{
                        background: !isNewCompany ? 'rgba(95,212,227,0.1)' : 'transparent',
                        color: !isNewCompany ? '#5fd4e3' : '#475569',
                        border: `1px solid ${!isNewCompany ? 'rgba(95,212,227,0.2)' : 'rgba(100,116,139,0.08)'}`,
                      }}
                    >
                      Search CRM
                    </button>
                    <button
                      onClick={() => { setIsNewCompany(true); setSelectedCompany(null); setSearchQuery(''); }}
                      className="px-4 py-2 rounded-lg text-[12px] font-semibold transition-all"
                      style={{
                        background: isNewCompany ? 'rgba(95,212,227,0.1)' : 'transparent',
                        color: isNewCompany ? '#5fd4e3' : '#475569',
                        border: `1px solid ${isNewCompany ? 'rgba(95,212,227,0.2)' : 'rgba(100,116,139,0.08)'}`,
                      }}
                    >
                      New Company
                    </button>
                  </div>

                  {!isNewCompany ? (
                    <div>
                      {/* Search Input */}
                      <div className="relative mb-4">
                        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2" style={{ color: '#475569' }} />
                        <input
                          type="text"
                          className="input pl-10"
                          placeholder="Search companies in your CRM..."
                          value={searchQuery}
                          onChange={e => { setSearchQuery(e.target.value); setSelectedCompany(null); }}
                        />
                      </div>

                      {/* Search Results */}
                      {filteredCompanies.length > 0 && !selectedCompany && (
                        <div className="rounded-lg overflow-hidden" style={{ border: '1px solid rgba(100,116,139,0.08)' }}>
                          {filteredCompanies.map((company, i) => (
                            <button
                              key={company.id}
                              onClick={() => { setSelectedCompany(company); setSearchQuery(company.name); }}
                              className="w-full flex items-center justify-between px-4 py-3 text-left transition-all"
                              style={{
                                background: '#0a1628',
                                borderBottom: i < filteredCompanies.length - 1 ? '1px solid rgba(100,116,139,0.06)' : 'none',
                              }}
                              onMouseEnter={e => { e.currentTarget.style.background = '#0d1b2e'; }}
                              onMouseLeave={e => { e.currentTarget.style.background = '#0a1628'; }}
                            >
                              <div className="flex items-center gap-3">
                                <Building2 className="w-4 h-4 flex-shrink-0" style={{ color: '#475569' }} />
                                <div>
                                  <p className="text-[13px] font-medium" style={{ color: '#e2e8f0' }}>{company.name}</p>
                                  <p className="text-[11px]" style={{ color: '#475569' }}>{company.type}{company.therapyArea ? ` · ${therapyAreaLabel(company.therapyArea)}` : ''}</p>
                                </div>
                              </div>
                              <div className="flex items-center gap-2">
                                <span className="text-[11px] px-2 py-0.5 rounded" style={{ background: 'rgba(95,212,227,0.08)', color: '#5fd4e3' }}>
                                  {company.stage}
                                </span>
                              </div>
                            </button>
                          ))}
                        </div>
                      )}

                      {/* Selected Company Card */}
                      {selectedCompany && (
                        <div
                          className="rounded-xl p-5 mt-2 transition-all"
                          style={{
                            background: '#0a1628',
                            border: '1px solid rgba(95,212,227,0.15)',
                            animation: 'slideUp 0.3s ease-out',
                          }}
                        >
                          <div className="flex items-start justify-between">
                            <div className="flex items-center gap-4">
                              <div className="w-12 h-12 rounded-xl flex items-center justify-center" style={{ background: 'rgba(95,212,227,0.08)', border: '1px solid rgba(95,212,227,0.12)' }}>
                                <Building2 className="w-6 h-6" style={{ color: '#5fd4e3' }} />
                              </div>
                              <div>
                                <h3 className="text-[16px] font-semibold" style={{ color: '#f0f4f8' }}>{selectedCompany.name}</h3>
                                <div className="flex items-center gap-3 mt-1">
                                  <span className="text-[12px]" style={{ color: '#64748b' }}>{selectedCompany.type}</span>
                                  <span style={{ color: '#1e293b' }}>·</span>
                                  <span className="text-[12px]" style={{ color: '#64748b' }}>{selectedCompany.therapyArea ? therapyAreaLabel(selectedCompany.therapyArea) : selectedCompany.type}</span>
                                  <span style={{ color: '#1e293b' }}>·</span>
                                  <span className="text-[12px]" style={{ color: '#64748b' }}>{selectedCompany.stage}</span>
                                </div>
                              </div>
                            </div>
                            <div className="text-right">
                              <p style={{ fontFamily: 'var(--font-mono)', fontSize: '11px', letterSpacing: '0.08em', color: '#475569', textTransform: 'uppercase' }}>Score</p>
                              <p style={{
                                fontFamily: 'var(--font-cormorant), "Cormorant Garamond", Georgia, serif',
                                fontSize: '28px',
                                fontWeight: 600,
                                color: selectedCompany.score >= 80 ? '#5fd4e3' : selectedCompany.score >= 60 ? '#fbbf24' : '#f87171',
                                lineHeight: 1,
                              }}>
                                {selectedCompany.score}
                              </p>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  ) : (
                    /* New Company Form */
                    <div className="space-y-4">
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="input-label">Company Name</label>
                          <input
                            type="text"
                            className="input"
                            placeholder="e.g., BioNova Therapeutics"
                            value={newCompanyName}
                            onChange={e => setNewCompanyName(e.target.value)}
                          />
                        </div>
                        <div>
                          <label className="input-label">Sector</label>
                          <select
                            className="input"
                            value={newSector}
                            onChange={e => setNewSector(e.target.value)}
                          >
                            <option value="">Select sector...</option>
                            {ORG_TYPES.filter(t => !['family_office', 'angel', 'vc', 'pe', 'cro', 'advisory', 'other'].includes(t.id)).map(t => (
                              <option key={t.id} value={t.id}>{t.label}</option>
                            ))}
                            <option value="other">Other</option>
                          </select>
                        </div>
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="input-label">Therapy Area <span className="text-[11px] font-normal" style={{ color: '#475569' }}>(optional)</span></label>
                          <select
                            className="input"
                            value={newTherapyArea}
                            onChange={e => setNewTherapyArea(e.target.value)}
                          >
                            <option value="">Select...</option>
                            {THERAPY_AREAS.map(ta => (
                              <option key={ta.id} value={ta.id}>{ta.label}</option>
                            ))}
                          </select>
                        </div>
                        <div>
                          <label className="input-label">Indication <span className="text-[11px] font-normal" style={{ color: '#475569' }}>(optional)</span></label>
                          <input
                            type="text"
                            className="input"
                            placeholder="e.g., Non-Small Cell Lung Cancer"
                            value={newIndication}
                            onChange={e => setNewIndication(e.target.value)}
                          />
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Next Button */}
                  <div className="mt-6 flex justify-end">
                    <button
                      onClick={() => setCurrentStep(2)}
                      disabled={!canProceedStep1}
                      className="flex items-center gap-2 px-6 py-2.5 rounded-lg text-[13px] font-semibold transition-all disabled:opacity-30 disabled:cursor-not-allowed"
                      style={{
                        background: canProceedStep1 ? 'linear-gradient(135deg, #5fd4e3, #9499d1)' : '#1e293b',
                        color: canProceedStep1 ? '#04080f' : '#475569',
                      }}
                    >
                      Continue
                      <ChevronRight className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ════════════════ STEP 2: CHOOSE ANALYSES ════════════════ */}
          {currentStep === 2 && (
            <div style={{ animation: 'slideUp 0.4s ease-out' }}>
              <div className="rounded-xl overflow-hidden" style={{ background: '#07101e', border: '1px solid rgba(100,116,139,0.08)' }}>
                <div className="px-6 py-5 border-b flex items-center justify-between" style={{ borderColor: 'rgba(100,116,139,0.06)' }}>
                  <div>
                    <h2 style={{ fontFamily: 'var(--font-cormorant), "Cormorant Garamond", Georgia, serif', fontSize: '22px', fontWeight: 600, color: '#e2e8f0' }}>
                      Choose Analyses
                    </h2>
                    <p className="mt-1" style={{ fontSize: '13px', color: '#475569' }}>
                      Select the analyses to include in your report for <span style={{ color: '#5fd4e3' }}>{companyName}</span>
                    </p>
                  </div>
                  <button
                    onClick={selectAll}
                    className="flex items-center gap-2 px-3 py-1.5 rounded-lg text-[11px] font-semibold tracking-wide uppercase transition-all"
                    style={{ color: '#64748b', background: 'rgba(100,116,139,0.06)', border: '1px solid rgba(100,116,139,0.08)' }}
                    onMouseEnter={e => { e.currentTarget.style.color = '#5fd4e3'; e.currentTarget.style.borderColor = 'rgba(95,212,227,0.2)'; }}
                    onMouseLeave={e => { e.currentTarget.style.color = '#64748b'; e.currentTarget.style.borderColor = 'rgba(100,116,139,0.08)'; }}
                  >
                    {selectedAnalyses.size === ANALYSIS_TYPES.length ? (
                      <><CheckSquare className="w-3.5 h-3.5" /> Deselect All</>
                    ) : (
                      <><Square className="w-3.5 h-3.5" /> Select All</>
                    )}
                  </button>
                </div>

                <div className="p-6">
                  {/* AI Recommendation Card */}
                  {companyName && (
                    <div
                      className="rounded-xl p-5 mb-6"
                      style={{
                        background: '#0a1628',
                        border: '2px solid transparent',
                        borderImage: 'linear-gradient(135deg, #5fd4e3, #9499d1, #a78bfa) 1',
                        borderImageSlice: 1,
                        animation: 'slideUp 0.35s ease-out',
                      }}
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <Sparkles className="w-4 h-4" style={{ color: '#a78bfa' }} />
                            <span className="text-[13px] font-semibold" style={{ color: '#e2e8f0' }}>
                              Recommended for this company
                            </span>
                          </div>
                          <p className="text-[12px] leading-relaxed mb-3" style={{ color: '#64748b' }}>
                            Based on {companyName}&apos;s profile as a {selectedCompany?.stage || 'clinical-stage'} {selectedCompany?.type || newSector || 'company'}{selectedCompany?.therapyArea ? ` in ${therapyAreaLabel(selectedCompany.therapyArea)}` : newTherapyArea ? ` in ${therapyAreaLabel(newTherapyArea)}` : ''}, we recommend these analyses:
                          </p>
                          <div className="flex flex-wrap gap-1.5 mb-3">
                            {getRecommendedAnalyses().map(id => {
                              const analysis = ANALYSIS_TYPES.find(a => a.id === id);
                              if (!analysis) return null;
                              const isChecked = selectedAnalyses.has(id);
                              return (
                                <span
                                  key={id}
                                  className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[11px] font-medium"
                                  style={{
                                    background: isChecked ? `${analysis.color}15` : 'rgba(100,116,139,0.08)',
                                    color: isChecked ? analysis.color : '#64748b',
                                    border: `1px solid ${isChecked ? `${analysis.color}30` : 'rgba(100,116,139,0.1)'}`,
                                  }}
                                >
                                  {isChecked && <Check className="w-3 h-3" />}
                                  {analysis.name}
                                </span>
                              );
                            })}
                          </div>
                        </div>
                        <button
                          onClick={selectRecommended}
                          className="flex items-center gap-1.5 px-4 py-2 rounded-lg text-[11px] font-semibold tracking-wide transition-all flex-shrink-0 ml-4"
                          style={{
                            background: 'linear-gradient(135deg, rgba(95,212,227,0.12), rgba(167,139,250,0.12))',
                            color: '#a78bfa',
                            border: '1px solid rgba(167,139,250,0.2)',
                          }}
                          onMouseEnter={e => { e.currentTarget.style.background = 'linear-gradient(135deg, rgba(95,212,227,0.2), rgba(167,139,250,0.2))'; }}
                          onMouseLeave={e => { e.currentTarget.style.background = 'linear-gradient(135deg, rgba(95,212,227,0.12), rgba(167,139,250,0.12))'; }}
                        >
                          <Sparkles className="w-3 h-3" />
                          Select Recommended
                        </button>
                      </div>
                    </div>
                  )}

                  <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3">
                    {ANALYSIS_TYPES.map((analysis, i) => {
                      const Icon = analysis.icon;
                      const isSelected = selectedAnalyses.has(analysis.id);

                      return (
                        <button
                          key={analysis.id}
                          onClick={() => toggleAnalysis(analysis.id)}
                          className="relative rounded-xl p-5 text-left transition-all duration-200 group"
                          style={{
                            background: isSelected ? '#0a1628' : '#07101e',
                            border: `1px solid ${isSelected ? `${analysis.color}30` : 'rgba(100,116,139,0.06)'}`,
                            animation: `slideUp 0.35s ease-out ${i * 40}ms both`,
                          }}
                          onMouseEnter={e => {
                            if (!isSelected) e.currentTarget.style.borderColor = `${analysis.color}18`;
                          }}
                          onMouseLeave={e => {
                            if (!isSelected) e.currentTarget.style.borderColor = 'rgba(100,116,139,0.06)';
                          }}
                        >
                          {/* Selection indicator */}
                          <div
                            className="absolute top-0 left-0 right-0 h-[2px] rounded-t-xl transition-opacity duration-200"
                            style={{ background: analysis.color, opacity: isSelected ? 1 : 0 }}
                          />

                          {/* Check */}
                          <div className="absolute top-4 right-4">
                            {isSelected ? (
                              <div
                                className="w-5 h-5 rounded flex items-center justify-center"
                                style={{ background: `${analysis.color}20`, border: `1px solid ${analysis.color}40` }}
                              >
                                <Check className="w-3 h-3" style={{ color: analysis.color }} />
                              </div>
                            ) : (
                              <div
                                className="w-5 h-5 rounded transition-all"
                                style={{ border: '1px solid rgba(100,116,139,0.15)' }}
                              />
                            )}
                          </div>

                          {/* Icon */}
                          <div
                            className="w-10 h-10 rounded-lg flex items-center justify-center mb-3 transition-all duration-200"
                            style={{
                              background: `${analysis.color}08`,
                              border: `1px solid ${analysis.color}${isSelected ? '20' : '10'}`,
                            }}
                          >
                            <Icon className="w-5 h-5" style={{ color: analysis.color }} />
                          </div>

                          {/* Text */}
                          <h3 className="text-[14px] font-medium mb-1.5 pr-6" style={{ color: isSelected ? '#f0f4f8' : '#cbd5e1' }}>
                            {analysis.name}
                          </h3>
                          <p className="text-[12px] leading-relaxed mb-3" style={{ color: '#475569' }}>
                            {analysis.description}
                          </p>

                          {/* Data Confidence Indicator */}
                          {CONFIDENCE_LEVELS[analysis.id] && (
                            <div className="flex items-center gap-1.5 mb-2">
                              <div
                                className="w-1.5 h-1.5 rounded-full flex-shrink-0"
                                style={{ background: CONFIDENCE_LEVELS[analysis.id].dotColor }}
                              />
                              <span style={{ fontFamily: 'var(--font-mono)', fontSize: '10px', color: CONFIDENCE_LEVELS[analysis.id].color }}>
                                {CONFIDENCE_LEVELS[analysis.id].label}
                              </span>
                            </div>
                          )}

                          {/* Time */}
                          <div className="flex items-center gap-1.5 mb-2">
                            <Clock className="w-3 h-3" style={{ color: '#334155' }} />
                            <span style={{ fontFamily: 'var(--font-mono)', fontSize: '10px', color: '#334155' }}>
                              {analysis.estimatedTime}
                            </span>
                          </div>

                          {/* Preview Tooltip */}
                          {PREVIEW_CONTENTS[analysis.id] && (
                            <div
                              className="mt-1"
                              onClick={(e) => { e.stopPropagation(); togglePreview(analysis.id); }}
                            >
                              <div className="flex items-center gap-1 cursor-pointer group/preview">
                                <ChevronDown
                                  className="w-3 h-3 transition-transform duration-200"
                                  style={{
                                    color: '#475569',
                                    transform: expandedPreviews.has(analysis.id) ? 'rotate(0deg)' : 'rotate(-90deg)',
                                  }}
                                />
                                <span style={{ fontFamily: 'var(--font-mono)', fontSize: '10px', color: '#475569' }}>
                                  What&apos;s included {expandedPreviews.has(analysis.id) ? '' : '\u2192'}
                                </span>
                              </div>
                              {expandedPreviews.has(analysis.id) && (
                                <ul className="mt-1.5 ml-4 space-y-0.5" style={{ animation: 'slideUp 0.2s ease-out' }}>
                                  {PREVIEW_CONTENTS[analysis.id].map((item, idx) => (
                                    <li key={idx} className="flex items-center gap-1.5">
                                      <span className="w-1 h-1 rounded-full flex-shrink-0" style={{ background: '#334155' }} />
                                      <span style={{ fontFamily: 'var(--font-mono)', fontSize: '9px', color: '#475569' }}>{item}</span>
                                    </li>
                                  ))}
                                </ul>
                              )}
                            </div>
                          )}
                        </button>
                      );
                    })}
                  </div>

                  {/* Footer */}
                  <div className="mt-6 flex items-center justify-between">
                    <p style={{ fontFamily: 'var(--font-mono)', fontSize: '12px', color: '#475569' }}>
                      {selectedAnalyses.size} of {ANALYSIS_TYPES.length} analyses selected
                    </p>
                    <button
                      onClick={() => {
                        setReportTitle(`${companyName} — Advisory Intelligence Report`);
                        setCurrentStep(3);
                      }}
                      disabled={!canProceedStep2}
                      className="flex items-center gap-2 px-6 py-2.5 rounded-lg text-[13px] font-semibold transition-all disabled:opacity-30 disabled:cursor-not-allowed"
                      style={{
                        background: canProceedStep2 ? 'linear-gradient(135deg, #5fd4e3, #9499d1)' : '#1e293b',
                        color: canProceedStep2 ? '#04080f' : '#475569',
                      }}
                    >
                      Continue
                      <ChevronRight className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ════════════════ STEP 3: CONFIGURE & GENERATE ════════════════ */}
          {currentStep === 3 && (
            <div style={{ animation: 'slideUp 0.4s ease-out' }}>
              <div className="rounded-xl overflow-hidden" style={{ background: '#07101e', border: '1px solid rgba(100,116,139,0.08)' }}>
                <div className="px-6 py-5 border-b" style={{ borderColor: 'rgba(100,116,139,0.06)' }}>
                  <h2 style={{ fontFamily: 'var(--font-cormorant), "Cormorant Garamond", Georgia, serif', fontSize: '22px', fontWeight: 600, color: '#e2e8f0' }}>
                    Configure & Generate
                  </h2>
                  <p className="mt-1" style={{ fontSize: '13px', color: '#475569' }}>
                    Final configuration before generating your intelligence report
                  </p>
                </div>

                <div className="p-6 space-y-6">
                  {/* Report Title */}
                  <div>
                    <label className="input-label">Report Title</label>
                    <input
                      type="text"
                      className="input"
                      value={reportTitle}
                      onChange={e => setReportTitle(e.target.value)}
                      placeholder={effectiveTitle}
                    />
                  </div>

                  {/* Options Row */}
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="input-label">Output Format</label>
                      <div className="flex gap-2">
                        {(['in_app', 'pdf', 'pptx'] as const).map(fmt => (
                          <button
                            key={fmt}
                            onClick={() => setOutputFormat(fmt)}
                            className="flex-1 px-3 py-2.5 rounded-lg text-[12px] font-semibold transition-all"
                            style={{
                              background: outputFormat === fmt ? 'rgba(95,212,227,0.1)' : 'rgba(100,116,139,0.04)',
                              color: outputFormat === fmt ? '#5fd4e3' : '#475569',
                              border: `1px solid ${outputFormat === fmt ? 'rgba(95,212,227,0.2)' : 'rgba(100,116,139,0.08)'}`,
                            }}
                          >
                            {fmt === 'in_app' ? 'In-App' : fmt.toUpperCase()}
                          </button>
                        ))}
                      </div>
                    </div>
                    <div>
                      <label className="input-label">Confidentiality Level</label>
                      <div className="flex gap-2">
                        {(['confidential', 'highly_confidential'] as const).map(level => (
                          <button
                            key={level}
                            onClick={() => setConfidentiality(level)}
                            className="flex-1 px-3 py-2.5 rounded-lg text-[12px] font-semibold transition-all"
                            style={{
                              background: confidentiality === level ? 'rgba(95,212,227,0.1)' : 'rgba(100,116,139,0.04)',
                              color: confidentiality === level ? '#5fd4e3' : '#475569',
                              border: `1px solid ${confidentiality === level ? 'rgba(95,212,227,0.2)' : 'rgba(100,116,139,0.08)'}`,
                            }}
                          >
                            {level === 'confidential' ? 'Confidential' : 'Highly Confidential'}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Summary */}
                  <div className="rounded-xl p-5" style={{ background: '#0a1628', border: '1px solid rgba(100,116,139,0.06)' }}>
                    <p className="text-[11px] font-semibold tracking-wider uppercase mb-4" style={{ color: '#475569' }}>Report Summary</p>
                    <div className="grid grid-cols-3 gap-6">
                      <div>
                        <p className="text-[11px] mb-1" style={{ color: '#334155' }}>Subject</p>
                        <p className="text-[13px] font-medium" style={{ color: '#e2e8f0' }}>{companyName}</p>
                      </div>
                      <div>
                        <p className="text-[11px] mb-1" style={{ color: '#334155' }}>Analyses</p>
                        <p style={{ fontFamily: 'var(--font-mono)', fontSize: '13px', color: '#5fd4e3' }}>{selectedAnalyses.size} selected</p>
                      </div>
                      <div>
                        <p className="text-[11px] mb-1" style={{ color: '#334155' }}>Est. Generation Time</p>
                        <p style={{ fontFamily: 'var(--font-mono)', fontSize: '13px', color: '#e2e8f0' }}>~{estimatedTotalTime}s</p>
                      </div>
                    </div>

                    {/* Analysis badges */}
                    <div className="flex flex-wrap gap-1.5 mt-4 pt-4" style={{ borderTop: '1px solid rgba(100,116,139,0.06)' }}>
                      {Array.from(selectedAnalyses).map(id => {
                        const analysis = ANALYSIS_TYPES.find(a => a.id === id);
                        if (!analysis) return null;
                        return (
                          <span
                            key={id}
                            className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-medium"
                            style={{ background: `${analysis.color}10`, color: analysis.color, border: `1px solid ${analysis.color}20` }}
                          >
                            {analysis.name}
                          </span>
                        );
                      })}
                    </div>
                  </div>

                  {/* Generate Button */}
                  <div className="flex justify-end">
                    <button
                      onClick={handleGenerate}
                      disabled={isGenerating}
                      className="flex items-center gap-2.5 px-8 py-3 rounded-xl text-[14px] font-bold transition-all disabled:opacity-60"
                      style={{
                        background: 'linear-gradient(135deg, #5fd4e3, #9499d1)',
                        color: '#04080f',
                        boxShadow: '0 0 30px rgba(95,212,227,0.2)',
                      }}
                      onMouseEnter={e => { if (!isGenerating) e.currentTarget.style.boxShadow = '0 0 40px rgba(95,212,227,0.35)'; }}
                      onMouseLeave={e => { e.currentTarget.style.boxShadow = '0 0 30px rgba(95,212,227,0.2)'; }}
                    >
                      {isGenerating ? (
                        <>
                          <Loader2 className="w-4 h-4 animate-spin" />
                          Generating Report...
                        </>
                      ) : (
                        <>
                          <Sparkles className="w-4 h-4" />
                          Generate Report
                        </>
                      )}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ════════════════ GENERATION PROGRESS SCREEN ════════════════ */}
          {showGenerationProgress && (
            <div style={{ animation: 'slideUp 0.4s ease-out' }}>
              <div className="rounded-xl overflow-hidden" style={{ background: '#07101e', border: '1px solid rgba(95,212,227,0.1)' }}>
                <div className="px-8 py-12 flex flex-col items-center">
                  {/* Ambrosia Icon */}
                  <div
                    className="w-16 h-16 rounded-2xl flex items-center justify-center mb-6"
                    style={{
                      background: 'linear-gradient(135deg, rgba(95,212,227,0.1), rgba(148,153,209,0.1))',
                      border: '1px solid rgba(95,212,227,0.15)',
                    }}
                  >
                    <Sparkles className="w-8 h-8 animate-pulse" style={{ color: '#5fd4e3' }} />
                  </div>

                  <h2 style={{
                    fontFamily: 'var(--font-cormorant), "Cormorant Garamond", Georgia, serif',
                    fontSize: '26px',
                    fontWeight: 600,
                    color: '#f0f4f8',
                    marginBottom: '6px',
                  }}>
                    Generating Intelligence Report
                  </h2>
                  <p className="mb-8" style={{ fontSize: '13px', color: '#475569' }}>
                    Assembling data from proprietary engines for <span style={{ color: '#5fd4e3' }}>{companyName}</span>
                  </p>

                  {/* Progress Bar */}
                  <div className="w-full max-w-md mb-8">
                    <div className="flex items-center justify-between mb-2">
                      <span style={{ fontFamily: 'var(--font-mono)', fontSize: '11px', color: '#64748b' }}>Progress</span>
                      <span style={{ fontFamily: 'var(--font-mono)', fontSize: '11px', color: '#5fd4e3' }}>{generationProgress}%</span>
                    </div>
                    <div className="w-full h-1.5 rounded-full overflow-hidden" style={{ background: '#1e293b' }}>
                      <div
                        className="h-full rounded-full transition-all duration-500 ease-out"
                        style={{
                          width: `${generationProgress}%`,
                          background: 'linear-gradient(90deg, #5fd4e3, #9499d1)',
                        }}
                      />
                    </div>
                  </div>

                  {/* Analysis Status List */}
                  <div className="w-full max-w-md space-y-2">
                    {Array.from(selectedAnalyses).map(id => {
                      const analysis = ANALYSIS_TYPES.find(a => a.id === id);
                      if (!analysis) return null;
                      const Icon = analysis.icon;
                      const status = generationStatuses[id] || 'queued';

                      return (
                        <div
                          key={id}
                          className="flex items-center justify-between px-4 py-3 rounded-lg transition-all duration-300"
                          style={{
                            background: status === 'processing' ? '#0d1b2e' : status === 'complete' ? 'rgba(52,211,153,0.04)' : '#0a1628',
                            border: `1px solid ${status === 'processing' ? 'rgba(95,212,227,0.15)' : status === 'complete' ? 'rgba(52,211,153,0.1)' : 'rgba(100,116,139,0.04)'}`,
                          }}
                        >
                          <div className="flex items-center gap-3">
                            <Icon className="w-4 h-4" style={{ color: status === 'complete' ? '#34d399' : status === 'processing' ? analysis.color : '#334155' }} />
                            <span className="text-[13px] font-medium" style={{ color: status === 'complete' ? '#cbd5e1' : status === 'processing' ? '#e2e8f0' : '#475569' }}>
                              {analysis.name}
                            </span>
                          </div>
                          <span style={{ fontFamily: 'var(--font-mono)', fontSize: '10px', color: status === 'complete' ? '#34d399' : status === 'processing' ? '#5fd4e3' : '#334155' }}>
                            {status === 'complete' ? 'Complete \u2713' : status === 'processing' ? 'Processing...' : 'Queued'}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ════════════════ STEP 4: REPORT PREVIEW ════════════════ */}
          {currentStep === 4 && generatedReport && (
            <div style={{ animation: 'slideUp 0.4s ease-out' }}>
              {/* Report Header */}
              <div className="rounded-xl overflow-hidden mb-6" style={{ background: '#07101e', border: '1px solid rgba(95,212,227,0.1)' }}>
                <div
                  className="px-6 py-6"
                  style={{
                    background: 'linear-gradient(135deg, rgba(95,212,227,0.06) 0%, rgba(148,153,209,0.04) 100%)',
                    borderBottom: '1px solid rgba(95,212,227,0.08)',
                  }}
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <div className="flex items-center gap-2 mb-2">
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-semibold tracking-wider uppercase" style={{ background: 'rgba(52,211,153,0.1)', color: '#34d399', border: '1px solid rgba(52,211,153,0.2)' }}>
                          <Check className="w-3 h-3" />
                          Generated
                        </span>
                        <span className="text-[10px] font-medium tracking-wider uppercase" style={{ color: '#475569' }}>
                          {confidentiality === 'highly_confidential' ? 'HIGHLY CONFIDENTIAL' : 'CONFIDENTIAL'}
                        </span>
                      </div>
                      <h2 style={{
                        fontFamily: 'var(--font-cormorant), "Cormorant Garamond", Georgia, serif',
                        fontSize: '26px',
                        fontWeight: 600,
                        color: '#f0f4f8',
                        lineHeight: 1.2,
                      }}>
                        {generatedReport.title}
                      </h2>
                      <p className="mt-2" style={{ fontFamily: 'var(--font-mono)', fontSize: '11px', color: '#475569' }}>
                        ID: {generatedReport.reportId} · Generated {new Date(generatedReport.generatedAt).toLocaleString()}
                      </p>
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => { setCurrentStep(3); setGeneratedReport(null); }}
                        className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-[12px] font-medium transition-all"
                        style={{ color: '#64748b', background: 'rgba(100,116,139,0.06)', border: '1px solid rgba(100,116,139,0.08)' }}
                        onMouseEnter={e => { e.currentTarget.style.borderColor = 'rgba(95,212,227,0.2)'; e.currentTarget.style.color = '#94a3b8'; }}
                        onMouseLeave={e => { e.currentTarget.style.borderColor = 'rgba(100,116,139,0.08)'; e.currentTarget.style.color = '#64748b'; }}
                      >
                        <RefreshCw className="w-3.5 h-3.5" />
                        Regenerate
                      </button>
                      <button
                        className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-[12px] font-medium transition-all"
                        style={{ color: '#64748b', background: 'rgba(100,116,139,0.06)', border: '1px solid rgba(100,116,139,0.08)' }}
                        onMouseEnter={e => { e.currentTarget.style.borderColor = 'rgba(95,212,227,0.2)'; e.currentTarget.style.color = '#94a3b8'; }}
                        onMouseLeave={e => { e.currentTarget.style.borderColor = 'rgba(100,116,139,0.08)'; e.currentTarget.style.color = '#64748b'; }}
                      >
                        <Download className="w-3.5 h-3.5" />
                        Export
                      </button>
                      <button
                        className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-[12px] font-medium transition-all"
                        style={{ color: '#64748b', background: 'rgba(100,116,139,0.06)', border: '1px solid rgba(100,116,139,0.08)' }}
                        onMouseEnter={e => { e.currentTarget.style.borderColor = 'rgba(95,212,227,0.2)'; e.currentTarget.style.color = '#94a3b8'; }}
                        onMouseLeave={e => { e.currentTarget.style.borderColor = 'rgba(100,116,139,0.08)'; e.currentTarget.style.color = '#64748b'; }}
                      >
                        <Save className="w-3.5 h-3.5" />
                        Save to Profile
                      </button>
                      <button
                        className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-[12px] font-medium transition-all"
                        style={{ color: '#64748b', background: 'rgba(100,116,139,0.06)', border: '1px solid rgba(100,116,139,0.08)' }}
                        onMouseEnter={e => { e.currentTarget.style.borderColor = 'rgba(95,212,227,0.2)'; e.currentTarget.style.color = '#94a3b8'; }}
                        onMouseLeave={e => { e.currentTarget.style.borderColor = 'rgba(100,116,139,0.08)'; e.currentTarget.style.color = '#64748b'; }}
                      >
                        <Share2 className="w-3.5 h-3.5" />
                        Share
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              {/* Report Confidence Badge */}
              <div
                className="rounded-xl px-5 py-4 mb-6 flex items-center justify-between"
                style={{
                  background: '#07101e',
                  border: '1px solid rgba(95,212,227,0.15)',
                }}
              >
                <div className="flex items-center gap-3">
                  <div className="w-2 h-2 rounded-full" style={{ background: '#34d399' }} />
                  <span className="text-[13px] font-semibold" style={{ color: '#e2e8f0' }}>
                    High Confidence
                  </span>
                  <span className="text-[12px]" style={{ color: '#64748b' }}>
                    — 8 of 10 data sources available
                  </span>
                </div>
                <span style={{ fontFamily: 'var(--font-mono)', fontSize: '11px', color: '#475569' }}>
                  Generated {new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })} at {new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}
                </span>
              </div>

              {/* Report Sections */}
              <div className="space-y-4">
                {generatedReport.sections.map((section, i) => {
                  const analysis = ANALYSIS_TYPES.find(a => a.id === section.type);
                  const Icon = analysis?.icon || FileText;
                  const color = analysis?.color || '#94a3b8';

                  return (
                    <div
                      key={section.type}
                      className="rounded-xl overflow-hidden"
                      style={{
                        background: '#07101e',
                        border: '1px solid rgba(100,116,139,0.08)',
                        animation: `slideUp 0.4s ease-out ${i * 80}ms both`,
                      }}
                    >
                      {/* Section header accent bar */}
                      <div className="h-[2px]" style={{ background: `linear-gradient(90deg, ${color}, transparent)` }} />

                      <div className="p-6">
                        <div className="flex items-center gap-3 mb-5">
                          <div
                            className="w-8 h-8 rounded-lg flex items-center justify-center"
                            style={{ background: `${color}10`, border: `1px solid ${color}15` }}
                          >
                            <Icon className="w-4 h-4" style={{ color }} />
                          </div>
                          <h3 className="text-[16px] font-semibold" style={{ color: '#e2e8f0' }}>
                            {section.title}
                          </h3>
                        </div>

                        {/* Metrics Grid */}
                        {Object.keys(section.metrics).length > 0 && (
                          <div className="grid grid-cols-5 gap-4 mb-5 p-4 rounded-lg" style={{ background: '#0a1628', border: '1px solid rgba(100,116,139,0.04)' }}>
                            {Object.entries(section.metrics).map(([key, value]) => (
                              <div key={key}>
                                <p className="text-[10px] font-medium tracking-wider uppercase mb-1" style={{ color: '#334155' }}>{key}</p>
                                <p style={{ fontFamily: 'var(--font-mono)', fontSize: '15px', fontWeight: 600, color: '#5fd4e3', lineHeight: 1.2 }}>
                                  {value}
                                </p>
                              </div>
                            ))}
                          </div>
                        )}

                        {/* Content */}
                        <p className="text-[13px] leading-relaxed" style={{ color: '#94a3b8' }}>
                          {section.content}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* New Report Button */}
              <div className="mt-8 flex justify-center">
                <button
                  onClick={handleReset}
                  className="flex items-center gap-2 px-6 py-2.5 rounded-lg text-[13px] font-semibold transition-all"
                  style={{ color: '#64748b', background: 'rgba(100,116,139,0.06)', border: '1px solid rgba(100,116,139,0.08)' }}
                  onMouseEnter={e => { e.currentTarget.style.color = '#5fd4e3'; e.currentTarget.style.borderColor = 'rgba(95,212,227,0.2)'; }}
                  onMouseLeave={e => { e.currentTarget.style.color = '#64748b'; e.currentTarget.style.borderColor = 'rgba(100,116,139,0.08)'; }}
                >
                  <Zap className="w-4 h-4" />
                  Generate Another Report
                </button>
              </div>

              {/* Confidential Footer */}
              <div className="mt-6 text-center">
                <p style={{ fontFamily: 'var(--font-mono)', fontSize: '10px', color: '#334155', lineHeight: 1.6 }}>
                  This report was generated using proprietary Ambrosia Ventures data engines. Confidential — do not distribute.
                </p>
              </div>
            </div>
          )}
        </div>

        {/* ── SIDEBAR: RECENT REPORTS ── */}
        <div style={{ animation: 'slideUp 0.5s ease-out 200ms both' }}>
          <div className="rounded-xl overflow-hidden sticky top-[76px]" style={{ background: '#07101e', border: '1px solid rgba(100,116,139,0.08)' }}>
            <div className="px-5 py-4 border-b" style={{ borderColor: 'rgba(100,116,139,0.06)' }}>
              <h3 className="text-[13px] font-semibold tracking-wide" style={{ color: '#94a3b8' }}>Recent Reports</h3>
            </div>

            {MOCK_RECENT_REPORTS.length > 0 ? (
              <div>
                {MOCK_RECENT_REPORTS.map((report, i) => (
                  <div
                    key={report.id}
                    className="px-5 py-4 cursor-pointer transition-all"
                    style={{
                      borderBottom: i < MOCK_RECENT_REPORTS.length - 1 ? '1px solid rgba(100,116,139,0.04)' : 'none',
                    }}
                    onMouseEnter={e => { e.currentTarget.style.background = '#0a1628'; }}
                    onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; }}
                  >
                    <p className="text-[13px] font-medium mb-1.5 leading-snug" style={{ color: '#cbd5e1' }}>
                      {report.title}
                    </p>
                    <div className="flex flex-wrap gap-1 mb-2">
                      {report.analyses.map(id => (
                        <span
                          key={id}
                          className="px-1.5 py-0.5 rounded text-[9px] font-medium"
                          style={{ background: 'rgba(100,116,139,0.08)', color: '#475569' }}
                        >
                          {getAnalysisName(id)}
                        </span>
                      ))}
                    </div>
                    <div className="flex items-center gap-2 text-[11px]" style={{ color: '#334155' }}>
                      <span>{report.author}</span>
                      <span>·</span>
                      <span>{formatRelativeDate(report.date)}</span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="px-5 py-10 text-center">
                <Sparkles className="w-8 h-8 mx-auto mb-3" style={{ color: '#1e293b' }} />
                <p className="text-[14px] font-medium mb-1" style={{ color: '#475569' }}>
                  Generate your first intelligence report
                </p>
                <p className="text-[12px] leading-relaxed" style={{ color: '#334155' }}>
                  Select a company and choose which analyses to include. Reports are assembled from proprietary data engines in under 60 seconds.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
