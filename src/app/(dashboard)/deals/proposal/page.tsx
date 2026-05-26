'use client';

import { useState, useRef } from 'react';
import {
  Upload,
  X,
  FileText,
  Loader2,
  Briefcase,
  Clock,
  DollarSign,
  AlertTriangle,
  ArrowRight,
  CheckCircle2,
  Building2,
} from 'lucide-react';
import { THERAPY_AREAS } from '@/lib/data/therapy-areas';

/* ── Types ──────────────────────────────────────────── */

interface ProposalSection {
  title: string;
  content: string;
}

/* ── Constants ──────────────────────────────────────── */

const SECTORS = ['Biotech', 'Pharma', 'MedTech', 'Digital Health', 'Other'] as const;
const ENGAGEMENT_TYPES = ['Sell-Side Advisory', 'Buy-Side Advisory', 'Licensing', 'Fundraising', 'Strategy'] as const;

const SECTION_ICONS: Record<string, React.ElementType> = {
  'Executive Summary': Briefcase,
  'Scope of Work': CheckCircle2,
  'Timeline': Clock,
  'Commercial Terms': DollarSign,
  'Key Assumptions & Risks': AlertTriangle,
  'Next Steps': ArrowRight,
};

const ACCEPTED_TYPES = [
  'application/pdf',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  'application/vnd.openxmlformats-officedocument.presentationml.presentation',
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
];

const ACCEPTED_EXTENSIONS = '.pdf,.docx,.pptx,.xlsx';

/* ── Helpers ────────────────────────────────────────── */

function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

/* ── Styles ─────────────────────────────────────────── */

const styles = {
  page: {
    maxWidth: '1400px',
    margin: '0 auto',
    padding: '0 8px',
  } as React.CSSProperties,

  header: {
    marginBottom: '48px',
  } as React.CSSProperties,

  title: {
    fontFamily: 'var(--font-cormorant), "Cormorant Garamond", Georgia, serif',
    fontSize: '40px',
    fontWeight: 600,
    color: '#f0f4f8',
    lineHeight: 1.2,
    letterSpacing: '-0.015em',
    marginBottom: '12px',
  } as React.CSSProperties,

  subtitle: {
    fontSize: '15px',
    lineHeight: 1.85,
    color: '#64748b',
    maxWidth: '600px',
  } as React.CSSProperties,

  layout: {
    display: 'grid',
    gridTemplateColumns: '1fr 1fr',
    gap: '36px',
    alignItems: 'start',
  } as React.CSSProperties,

  card: {
    background: '#07101e',
    border: '1px solid rgba(100,116,139,0.1)',
    borderRadius: '14px',
    padding: '32px',
  } as React.CSSProperties,

  sectionHeading: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    marginBottom: '24px',
  } as React.CSSProperties,

  accentBar: {
    width: '4px',
    height: '24px',
    borderRadius: '2px',
    background: 'linear-gradient(180deg, #5fd4e3, #9499d1)',
  } as React.CSSProperties,

  sectionTitle: {
    fontFamily: 'var(--font-cormorant), "Cormorant Garamond", Georgia, serif',
    fontSize: '22px',
    fontWeight: 600,
    color: '#e2e8f0',
  } as React.CSSProperties,

  label: {
    display: 'block',
    fontSize: '12px',
    fontWeight: 600,
    color: '#94a3b8',
    textTransform: 'uppercase' as const,
    letterSpacing: '0.08em',
    marginBottom: '10px',
  } as React.CSSProperties,

  input: {
    width: '100%',
    padding: '12px 16px',
    background: '#0d1b2e',
    border: '1px solid rgba(100,116,139,0.15)',
    borderRadius: '10px',
    color: '#e2e8f0',
    fontSize: '15px',
    lineHeight: '1.5',
    outline: 'none',
    transition: 'border-color 0.15s ease',
    fontFamily: 'inherit',
  } as React.CSSProperties,

  select: {
    width: '100%',
    padding: '12px 16px',
    background: '#0d1b2e',
    border: '1px solid rgba(100,116,139,0.15)',
    borderRadius: '10px',
    color: '#e2e8f0',
    fontSize: '15px',
    lineHeight: '1.5',
    outline: 'none',
    cursor: 'pointer',
    appearance: 'none' as const,
    backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 24 24' fill='none' stroke='%2364748b' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpath d='m6 9 6 6 6-6'/%3E%3C/svg%3E")`,
    backgroundRepeat: 'no-repeat',
    backgroundPosition: 'right 16px center',
    paddingRight: '40px',
  } as React.CSSProperties,

  textarea: {
    width: '100%',
    padding: '14px 16px',
    background: '#0d1b2e',
    border: '1px solid rgba(100,116,139,0.15)',
    borderRadius: '10px',
    color: '#e2e8f0',
    fontSize: '15px',
    lineHeight: 1.85,
    outline: 'none',
    resize: 'vertical' as const,
    minHeight: '140px',
    fontFamily: 'inherit',
    transition: 'border-color 0.15s ease',
  } as React.CSSProperties,

  pillGroup: {
    display: 'flex',
    flexWrap: 'wrap' as const,
    gap: '10px',
  } as React.CSSProperties,

  pill: (active: boolean) => ({
    padding: '9px 18px',
    borderRadius: '9999px',
    fontSize: '13px',
    fontWeight: 500,
    cursor: 'pointer',
    border: active ? '1px solid transparent' : '1px solid rgba(100,116,139,0.2)',
    background: active ? 'linear-gradient(135deg, #5fd4e3, #9499d1)' : '#0d1b2e',
    color: active ? '#04080f' : '#94a3b8',
    transition: 'all 0.2s ease',
    whiteSpace: 'nowrap' as const,
  }) as React.CSSProperties,

  dropzone: (dragging: boolean) => ({
    border: `2px dashed ${dragging ? '#5fd4e3' : 'rgba(100,116,139,0.2)'}`,
    borderRadius: '12px',
    padding: '36px 24px',
    textAlign: 'center' as const,
    cursor: 'pointer',
    background: dragging ? 'rgba(95,212,227,0.04)' : '#0a1524',
    transition: 'all 0.2s ease',
  }) as React.CSSProperties,

  fileList: {
    marginTop: '16px',
    display: 'flex',
    flexDirection: 'column' as const,
    gap: '8px',
  } as React.CSSProperties,

  fileItem: {
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
    padding: '10px 14px',
    background: '#0d1b2e',
    borderRadius: '8px',
    border: '1px solid rgba(100,116,139,0.08)',
  } as React.CSSProperties,

  generateBtn: {
    width: '100%',
    padding: '16px 32px',
    borderRadius: '12px',
    border: 'none',
    background: 'linear-gradient(135deg, #5fd4e3, #9499d1)',
    color: '#04080f',
    fontSize: '16px',
    fontWeight: 700,
    cursor: 'pointer',
    transition: 'all 0.2s ease',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '10px',
    letterSpacing: '0.01em',
  } as React.CSSProperties,

  generateBtnDisabled: {
    opacity: 0.5,
    cursor: 'not-allowed',
  } as React.CSSProperties,

  /* Proposal sidebar styles */
  proposalCard: {
    background: '#07101e',
    border: '1px solid rgba(100,116,139,0.1)',
    borderRadius: '14px',
    overflow: 'hidden',
    position: 'sticky' as const,
    top: '24px',
  } as React.CSSProperties,

  proposalHeader: {
    padding: '24px 32px',
    borderBottom: '1px solid rgba(100,116,139,0.06)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
  } as React.CSSProperties,

  proposalSection: {
    padding: '28px 32px',
    borderBottom: '1px solid rgba(100,116,139,0.04)',
  } as React.CSSProperties,

  proposalSectionTitle: {
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
    marginBottom: '16px',
  } as React.CSSProperties,

  proposalContent: {
    fontSize: '15px',
    lineHeight: 1.85,
    color: '#94a3b8',
    letterSpacing: '0.015em',
    whiteSpace: 'pre-wrap' as const,
  } as React.CSSProperties,

  loadingContainer: {
    display: 'flex',
    flexDirection: 'column' as const,
    alignItems: 'center',
    justifyContent: 'center',
    padding: '80px 32px',
    textAlign: 'center' as const,
  } as React.CSSProperties,

  emptyState: {
    display: 'flex',
    flexDirection: 'column' as const,
    alignItems: 'center',
    justifyContent: 'center',
    padding: '80px 32px',
    textAlign: 'center' as const,
  } as React.CSSProperties,
};

/* ── Component ──────────────────────────────────────── */

export default function ProposalGeneratorPage() {
  /* Form state */
  const [companyName, setCompanyName] = useState('');
  const [sector, setSector] = useState('');
  const [therapyArea, setTherapyArea] = useState('');
  const [dealSize, setDealSize] = useState('');
  const [files, setFiles] = useState<File[]>([]);
  const [notes, setNotes] = useState('');
  const [engagementType, setEngagementType] = useState('');

  /* Generation state */
  const [proposal, setProposal] = useState<ProposalSection[] | null>(null);
  const [generatedAt, setGeneratedAt] = useState<string | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  /* Drag state */
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  /* ── File handlers ────────────────────────────────── */

  function handleDrop(e: React.DragEvent) {
    e.preventDefault();
    setIsDragging(false);
    const dropped = Array.from(e.dataTransfer.files).filter(f =>
      ACCEPTED_TYPES.includes(f.type)
    );
    setFiles(prev => [...prev, ...dropped]);
  }

  function handleFileSelect(e: React.ChangeEvent<HTMLInputElement>) {
    if (e.target.files) {
      const selected = Array.from(e.target.files).filter(f =>
        ACCEPTED_TYPES.includes(f.type)
      );
      setFiles(prev => [...prev, ...selected]);
    }
    if (fileInputRef.current) fileInputRef.current.value = '';
  }

  function removeFile(index: number) {
    setFiles(prev => prev.filter((_, i) => i !== index));
  }

  /* ── Generate ─────────────────────────────────────── */

  async function handleGenerate() {
    if (!companyName || !sector || !engagementType || !dealSize) return;

    setIsGenerating(true);
    setError(null);
    setProposal(null);

    try {
      // Build document summaries from file names (actual parsing would need server-side processing)
      const documentSummaries = files.length > 0
        ? files.map(f => `- ${f.name} (${formatFileSize(f.size)})`).join('\n')
        : '';

      const res = await fetch('/api/proposal/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          companyName,
          sector,
          therapyArea,
          dealSize: parseFloat(dealSize),
          notes,
          engagementType,
          documentSummaries,
        }),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => null);
        throw new Error(data?.error || `Request failed (${res.status})`);
      }

      const data = await res.json();
      setProposal(data.proposal);
      setGeneratedAt(data.generatedAt);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to generate proposal');
    } finally {
      setIsGenerating(false);
    }
  }

  const canGenerate = companyName && sector && engagementType && dealSize && !isGenerating;

  /* ── Render ───────────────────────────────────────── */

  return (
    <div style={styles.page}>
      {/* Header */}
      <div style={styles.header}>
        <h1 style={styles.title}>Proposal Generator</h1>
        <p style={styles.subtitle}>
          Upload supporting materials and we&apos;ll generate a preliminary engagement proposal
        </p>
      </div>

      {/* Two-column layout */}
      <div style={styles.layout}>

        {/* ── LEFT COLUMN: Input ──────────────────── */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '36px' }}>

          {/* Section 1: Company Context */}
          <div style={styles.card}>
            <div style={styles.sectionHeading}>
              <div style={styles.accentBar} />
              <h2 style={styles.sectionTitle}>Company Context</h2>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
              {/* Company Name */}
              <div>
                <label style={styles.label}>Company Name</label>
                <input
                  type="text"
                  value={companyName}
                  onChange={e => setCompanyName(e.target.value)}
                  placeholder="e.g., Astellia Therapeutics"
                  style={styles.input}
                  onFocus={e => { e.target.style.borderColor = '#5fd4e3'; }}
                  onBlur={e => { e.target.style.borderColor = 'rgba(100,116,139,0.15)'; }}
                />
              </div>

              {/* Sector */}
              <div>
                <label style={styles.label}>Sector</label>
                <div style={styles.pillGroup}>
                  {SECTORS.map(s => (
                    <button
                      key={s}
                      type="button"
                      style={styles.pill(sector === s)}
                      onClick={() => setSector(s)}
                    >
                      {s}
                    </button>
                  ))}
                </div>
              </div>

              {/* Therapy Area */}
              <div>
                <label style={styles.label}>Therapy Area</label>
                <select
                  value={therapyArea}
                  onChange={e => setTherapyArea(e.target.value)}
                  style={styles.select}
                >
                  <option value="">Select therapy area...</option>
                  {THERAPY_AREAS.map(ta => (
                    <option key={ta.id} value={ta.id}>{ta.label}</option>
                  ))}
                </select>
              </div>

              {/* Deal Size */}
              <div>
                <label style={styles.label}>Estimated Deal Size ($M)</label>
                <input
                  type="number"
                  value={dealSize}
                  onChange={e => setDealSize(e.target.value)}
                  placeholder="e.g., 250"
                  min="0"
                  step="1"
                  style={{
                    ...styles.input,
                    fontFamily: 'var(--font-dm-mono), "DM Mono", monospace',
                  }}
                  onFocus={e => { e.target.style.borderColor = '#5fd4e3'; }}
                  onBlur={e => { e.target.style.borderColor = 'rgba(100,116,139,0.15)'; }}
                />
              </div>
            </div>
          </div>

          {/* Section 2: Supporting Materials */}
          <div style={styles.card}>
            <div style={styles.sectionHeading}>
              <div style={styles.accentBar} />
              <h2 style={styles.sectionTitle}>Supporting Materials</h2>
            </div>

            <div
              style={styles.dropzone(isDragging)}
              onDragOver={e => { e.preventDefault(); setIsDragging(true); }}
              onDragLeave={() => setIsDragging(false)}
              onDrop={handleDrop}
              onClick={() => fileInputRef.current?.click()}
            >
              <Upload style={{ width: '28px', height: '28px', color: isDragging ? '#5fd4e3' : '#475569', margin: '0 auto 12px' }} />
              <p style={{ fontSize: '14px', color: '#94a3b8', marginBottom: '6px' }}>
                Drag & drop files or <span style={{ color: '#5fd4e3', fontWeight: 500 }}>browse</span>
              </p>
              <p style={{ fontSize: '12px', color: '#475569' }}>
                Accepted: CIM, pitch decks, financial models, term sheets, meeting notes
              </p>
              <p style={{ fontSize: '11px', color: '#334155', marginTop: '4px' }}>
                .pdf, .docx, .pptx, .xlsx
              </p>
              <input
                ref={fileInputRef}
                type="file"
                multiple
                accept={ACCEPTED_EXTENSIONS}
                onChange={handleFileSelect}
                style={{ display: 'none' }}
              />
            </div>

            {files.length > 0 && (
              <div style={styles.fileList}>
                {files.map((file, i) => (
                  <div key={`${file.name}-${i}`} style={styles.fileItem}>
                    <FileText style={{ width: '16px', height: '16px', color: '#5fd4e3', flexShrink: 0 }} />
                    <span style={{ fontSize: '13px', color: '#e2e8f0', flex: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {file.name}
                    </span>
                    <span style={{ fontSize: '12px', color: '#475569', fontFamily: 'var(--font-dm-mono), monospace', flexShrink: 0 }}>
                      {formatFileSize(file.size)}
                    </span>
                    <button
                      type="button"
                      onClick={(e) => { e.stopPropagation(); removeFile(i); }}
                      style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '4px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                    >
                      <X style={{ width: '14px', height: '14px', color: '#64748b' }} />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Section 3: Context & Notes */}
          <div style={styles.card}>
            <div style={styles.sectionHeading}>
              <div style={styles.accentBar} />
              <h2 style={styles.sectionTitle}>Context &amp; Notes</h2>
            </div>

            <textarea
              value={notes}
              onChange={e => setNotes(e.target.value)}
              placeholder="e.g., Met CEO at JPM Healthcare Conference. They're exploring a licensing deal for their Phase 2 NASH asset. Board wants to see a proposal by end of Q2..."
              style={styles.textarea}
              onFocus={e => { e.target.style.borderColor = '#5fd4e3'; }}
              onBlur={e => { e.target.style.borderColor = 'rgba(100,116,139,0.15)'; }}
            />
          </div>

          {/* Section 4: Engagement Type */}
          <div style={styles.card}>
            <div style={styles.sectionHeading}>
              <div style={styles.accentBar} />
              <h2 style={styles.sectionTitle}>Engagement Type</h2>
            </div>

            <div style={styles.pillGroup}>
              {ENGAGEMENT_TYPES.map(t => (
                <button
                  key={t}
                  type="button"
                  style={styles.pill(engagementType === t)}
                  onClick={() => setEngagementType(t)}
                >
                  {t}
                </button>
              ))}
            </div>
          </div>

          {/* Generate Button */}
          <button
            type="button"
            onClick={handleGenerate}
            disabled={!canGenerate}
            style={{
              ...styles.generateBtn,
              ...(!canGenerate ? styles.generateBtnDisabled : {}),
            }}
          >
            {isGenerating ? (
              <>
                <Loader2 style={{ width: '20px', height: '20px', animation: 'spin 1s linear infinite' }} />
                Generating Proposal...
              </>
            ) : (
              <>
                <Briefcase style={{ width: '18px', height: '18px' }} />
                Generate Proposal
              </>
            )}
          </button>

          {/* Spin keyframe — injected inline */}
          <style>{`@keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }`}</style>
        </div>

        {/* ── RIGHT COLUMN: Generated Proposal ────── */}
        <div>
          {/* Empty state */}
          {!proposal && !isGenerating && !error && (
            <div style={{ ...styles.card, ...styles.emptyState }}>
              <Building2 style={{ width: '48px', height: '48px', color: '#1e293b', marginBottom: '20px' }} />
              <p style={{ fontFamily: 'var(--font-cormorant), "Cormorant Garamond", Georgia, serif', fontSize: '20px', fontWeight: 600, color: '#334155', marginBottom: '8px' }}>
                Proposal Preview
              </p>
              <p style={{ fontSize: '14px', color: '#334155', maxWidth: '280px', lineHeight: 1.6 }}>
                Fill in the engagement details and click Generate to create an AI-powered preliminary proposal
              </p>
            </div>
          )}

          {/* Loading state */}
          {isGenerating && (
            <div style={{ ...styles.card, ...styles.loadingContainer }}>
              <Loader2 style={{ width: '36px', height: '36px', color: '#5fd4e3', marginBottom: '20px', animation: 'spin 1s linear infinite' }} />
              <p style={{ fontFamily: 'var(--font-cormorant), "Cormorant Garamond", Georgia, serif', fontSize: '20px', fontWeight: 600, color: '#e2e8f0', marginBottom: '8px' }}>
                Generating Proposal
              </p>
              <p style={{ fontSize: '14px', color: '#64748b', maxWidth: '320px', lineHeight: 1.6 }}>
                Analyzing engagement parameters and building institutional-quality terms...
              </p>
            </div>
          )}

          {/* Error state */}
          {error && !isGenerating && (
            <div style={{ ...styles.card, ...styles.emptyState }}>
              <AlertTriangle style={{ width: '36px', height: '36px', color: '#ef4444', marginBottom: '16px' }} />
              <p style={{ fontSize: '14px', color: '#ef4444', marginBottom: '8px', fontWeight: 500 }}>
                Generation Failed
              </p>
              <p style={{ fontSize: '13px', color: '#64748b', maxWidth: '320px', lineHeight: 1.6 }}>
                {error}
              </p>
            </div>
          )}

          {/* Generated proposal */}
          {proposal && !isGenerating && (
            <div style={styles.proposalCard}>
              {/* Proposal Header */}
              <div style={styles.proposalHeader}>
                <div>
                  <p style={{ fontFamily: 'var(--font-cormorant), "Cormorant Garamond", Georgia, serif', fontSize: '22px', fontWeight: 600, color: '#e2e8f0' }}>
                    Engagement Proposal
                  </p>
                  <p style={{ fontSize: '13px', color: '#475569', marginTop: '4px' }}>
                    {companyName} &mdash; {engagementType}
                  </p>
                </div>
                {generatedAt && (
                  <span style={{ fontFamily: 'var(--font-dm-mono), monospace', fontSize: '11px', color: '#334155' }}>
                    {new Date(generatedAt).toLocaleString()}
                  </span>
                )}
              </div>

              {/* Proposal Sections */}
              {proposal.map((section, i) => {
                const Icon = SECTION_ICONS[section.title] || Briefcase;
                return (
                  <div key={i} style={styles.proposalSection}>
                    <div style={styles.proposalSectionTitle}>
                      <div style={{ width: '4px', height: '20px', borderRadius: '2px', background: i === 0 ? 'linear-gradient(180deg, #5fd4e3, #9499d1)' : '#102236' }} />
                      <Icon style={{ width: '16px', height: '16px', color: '#5fd4e3' }} />
                      <h3 style={{ fontFamily: 'var(--font-cormorant), "Cormorant Garamond", Georgia, serif', fontSize: '18px', fontWeight: 600, color: '#e2e8f0' }}>
                        {section.title}
                      </h3>
                    </div>
                    <div style={styles.proposalContent}>
                      {section.content}
                    </div>
                  </div>
                );
              })}

              {/* Proposal Footer */}
              <div style={{ padding: '20px 32px', borderTop: '1px solid rgba(100,116,139,0.06)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <span style={{ fontFamily: 'var(--font-dm-mono), monospace', fontSize: '11px', color: '#334155' }}>
                  Ambrosia Ventures &mdash; Confidential
                </span>
                <span style={{ fontFamily: 'var(--font-dm-mono), monospace', fontSize: '11px', color: '#334155' }}>
                  Preliminary &mdash; Subject to Engagement Letter
                </span>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
