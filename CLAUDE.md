# AMBROSIA OPS — Internal Operations Platform

## Project Overview

**Product**: Ambrosia Ops — Internal advisory operations platform
**URL**: ops.ambrosiaventures.co
**Parent Brand**: Ambrosia Ventures (life sciences strategy & M&A advisory)
**Tech Stack**: Next.js 16 App Router, TypeScript, Tailwind v4, Supabase, Vercel

**What it does**: Unified command center for Ambrosia Ventures' 4-10 person team — CRM with AI scoring, deal pipeline management, research intelligence, and operational tooling. Replaces spreadsheets + email.

**Auth**: @ambrosiaventures.co emails ONLY. No public signup. Middleware enforces domain.

---

## Brand & Design System

### Colors (CSS custom properties in globals.css)
```css
--bg-page: #04080f      /* Navy 950 — page background */
--bg-surface: #07101e   /* Navy 900 — card backgrounds */
--bg-elevated: #0d1b2e  /* Navy 800 — elevated surfaces */
--bg-hover: #102236     /* Navy 700 — hover states */
--accent: #00c9a7       /* Teal 500 — primary accent */
```

### Brand Gradient (from logo)
```css
/* Teal-to-lavender — use for CTAs, active states, brand moments */
background: linear-gradient(135deg, #5fd4e3, #9499d1);
```

### Typography
```
Display: Cormorant Garamond (var(--font-cormorant)) — headings, hero text, section titles
Body:    Sora (var(--font-sora)) — UI text, labels, navigation
Mono:    DM Mono (var(--font-dm-mono)) — metrics, scores, financial figures, timestamps
```

### Design Principles
- Dark mode only (navy/teal palette)
- Institutional density — Bloomberg Terminal, not consumer SaaS
- Every number in DM Mono with tabular-nums
- Cormorant Garamond for section headings (the logo font)
- Teal used sparingly — only for active/positive signals and brand accents
- No emojis. No playful illustrations. This is M&A advisory tooling.

---

## Architecture

### Key Directories
```
src/app/(dashboard)/     — All authenticated pages
src/app/(auth)/          — Login, callback
src/app/api/             — API routes
src/components/ui/       — Base design system (Button, Card, Badge, etc.)
src/components/layout/   — Sidebar, Topbar, PageHeader
src/components/shared/   — ScoreBadge, and shared components
src/lib/scoring/         — CRM scoring engine + opportunity screening
src/lib/supabase/        — Supabase client/server/middleware
src/lib/data/            — Constants, therapy areas
src/lib/utils/           — cn(), format helpers
src/types/               — Database types, scoring types
supabase/migrations/     — 13 SQL migrations (18 tables)
```

### Scoring Engines
- `lib/scoring/engine.ts` — CRM intake scoring (0-100, 4 dimensions: Company Fit, Relationship, Market Timing, Advisory Opportunity)
- `lib/scoring/opportunity-screening.ts` — Mandate evaluation (5 dimensions + Lehman fee formula)

### Database (Supabase — 18 tables)
Key tables: team_members, organizations, contacts, deals, deal_stage_history, activities, projects, tasks, investor_profiles, research_notes, documents, fees, enrichment_cache, audit_log, relationships

### Access Control
- Partners: full access to everything
- VPs: full access except fee data (view only) and team management
- Analysts/Associates: assigned deals/projects only, no fee data, no audit log
- Fee Modeling, Team Utilization, LP Reporting: partners only

---

## Ecosystem Integration

Ops integrates with other Ambrosia platforms via internal API endpoints:
- **Terrain** (terrain.ambrosiaventures.co) — Market sizing, competitive landscape, regulatory
- **Benchmarker** (calculator.ambrosiaventures.co) — Deal valuation, comparable transactions

Users never see platform names — they select analysis types in the Intelligence Workbench.

---

## Contact Types (NOT KOL — this is M&A advisory)
Executive, Founder, Investor, Advisor, Board Member, Operator

## Therapy Areas (18 canonical)
oncology, immunology, neurology, rare_disease, cardiovascular, metabolic, psychiatry, pain_management, infectious_disease, hematology, ophthalmology, pulmonology, nephrology, dermatology, gastroenterology, hepatology, endocrinology, musculoskeletal

---

## Environment Variables
```
NEXT_PUBLIC_SUPABASE_URL
NEXT_PUBLIC_SUPABASE_ANON_KEY
SUPABASE_SERVICE_ROLE_KEY
NEXT_PUBLIC_APP_URL
ANTHROPIC_API_KEY
TERRAIN_INTERNAL_API_KEY
BENCHMARKER_INTERNAL_API_KEY
CRON_SECRET
```
