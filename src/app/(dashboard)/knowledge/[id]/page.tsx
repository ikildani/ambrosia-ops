'use client';

import { use } from 'react';
import Link from 'next/link';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import {
  ArrowLeft,
  Clock,
  User,
  BookOpen,
  Tag,
  TrendingUp,
  FileText,
  Lightbulb,
} from 'lucide-react';

/* -------------------------------------------------- */
/* CATEGORY METADATA                                   */
/* -------------------------------------------------- */

type KnowledgeCategory = 'playbook' | 'template' | 'market_intel' | 'lesson';

const CATEGORY_META: Record<
  KnowledgeCategory,
  { label: string; icon: React.ElementType; badgeVariant: 'teal' | 'blue' | 'amber' | 'green' }
> = {
  playbook:     { label: 'Playbook',      icon: BookOpen,   badgeVariant: 'teal' },
  template:     { label: 'Template',      icon: FileText,   badgeVariant: 'amber' },
  market_intel: { label: 'Market Intel',  icon: TrendingUp, badgeVariant: 'blue' },
  lesson:       { label: 'Lesson Learned', icon: Lightbulb, badgeVariant: 'green' },
};

/* -------------------------------------------------- */
/* KNOWLEDGE ENTRIES (duplicated for now)               */
/* -------------------------------------------------- */

interface KnowledgeEntry {
  id: string;
  title: string;
  category: KnowledgeCategory;
  description: string;
  content: string;
  tags: string[];
  lastUpdated: string;
  author: string;
  readTime: string;
}

const knowledgeEntries: KnowledgeEntry[] = [
  // -- Playbooks --
  {
    id: 'pb-001',
    title: 'M&A Transaction Playbook',
    category: 'playbook',
    description:
      'End-to-end guide for managing life sciences M&A transactions from initial sourcing through definitive agreement and close. Covers target identification, outreach sequencing, management presentations, due diligence coordination, bid process management, and post-signing obligations.',
    content: 'Full content available in the knowledge base',
    tags: ['M&A', 'deal process', 'sell-side', 'buy-side', 'closing mechanics'],
    lastUpdated: 'May 20, 2026',
    author: 'Issa Kildani',
    readTime: '15 min read',
  },
  {
    id: 'pb-002',
    title: 'Due Diligence Checklist',
    category: 'playbook',
    description:
      'Comprehensive due diligence framework tailored for life sciences assets including clinical, regulatory, IP, commercial, and financial workstreams. Includes stage-specific checklists for preclinical through commercial-stage assets and red flag indicators for common deal-breakers.',
    content: 'Full content available in the knowledge base',
    tags: ['due diligence', 'clinical', 'IP', 'regulatory', 'CMC'],
    lastUpdated: 'May 18, 2026',
    author: 'Issa Kildani',
    readTime: '12 min read',
  },
  {
    id: 'pb-003',
    title: 'Licensing Deal Negotiation Guide',
    category: 'playbook',
    description:
      'Framework for structuring and negotiating licensing transactions across therapeutic areas. Covers key economic terms (upfront, milestones, royalties), territory splits, co-development rights, diligence obligations, and common red flags in licensor vs. licensee positions.',
    content: 'Full content available in the knowledge base',
    tags: ['licensing', 'negotiation', 'royalties', 'milestones', 'term sheets'],
    lastUpdated: 'May 14, 2026',
    author: 'Issa Kildani',
    readTime: '10 min read',
  },
  {
    id: 'pb-004',
    title: 'Fundraising Advisory Process',
    category: 'playbook',
    description:
      'Step-by-step advisory workflow for guiding biotech clients through fundraising from Series A through IPO. Includes investor targeting methodology, data room preparation, roadshow management, term sheet negotiation, and syndicate construction best practices.',
    content: 'Full content available in the knowledge base',
    tags: ['fundraising', 'Series A', 'IPO', 'investor targeting', 'syndicate'],
    lastUpdated: 'May 10, 2026',
    author: 'Issa Kildani',
    readTime: '11 min read',
  },
  {
    id: 'pb-005',
    title: 'Partner Search Methodology',
    category: 'playbook',
    description:
      'Systematic approach for identifying and prioritizing potential strategic partners for licensing, co-development, or acquisition. Covers therapeutic area mapping, pipeline gap analysis, corporate development outreach protocols, and NDA/CDA management workflows.',
    content: 'Full content available in the knowledge base',
    tags: ['partner search', 'business development', 'strategic fit', 'outreach'],
    lastUpdated: 'May 6, 2026',
    author: 'Issa Kildani',
    readTime: '9 min read',
  },

  // -- Templates --
  {
    id: 'tp-001',
    title: 'Confidential Information Memorandum (CIM)',
    category: 'template',
    description:
      'Standard CIM structure for sell-side advisory mandates in life sciences. Includes section templates for executive summary, company overview, technology platform, clinical pipeline, IP portfolio, commercial opportunity, financial projections, and transaction rationale.',
    content: 'Full content available in the knowledge base',
    tags: ['CIM', 'sell-side', 'data room', 'pitch materials'],
    lastUpdated: 'May 22, 2026',
    author: 'Issa Kildani',
    readTime: '8 min read',
  },
  {
    id: 'tp-002',
    title: 'Term Sheet Template',
    category: 'template',
    description:
      'Standardized term sheet framework covering key economic and governance terms for licensing and M&A transactions. Includes typical ranges for upfront payments, milestone structures, royalty tiers, and representations/warranties with life sciences-specific provisions.',
    content: 'Full content available in the knowledge base',
    tags: ['term sheet', 'deal terms', 'economic terms', 'governance'],
    lastUpdated: 'May 16, 2026',
    author: 'Issa Kildani',
    readTime: '7 min read',
  },
  {
    id: 'tp-003',
    title: 'Board Presentation Template',
    category: 'template',
    description:
      'Investment committee deck structure for presenting deal recommendations to client boards. Covers strategic rationale, valuation analysis (rNPV, comparables, precedent transactions), risk factors, deal structure options, and recommended next steps with decision framework.',
    content: 'Full content available in the knowledge base',
    tags: ['IC deck', 'board materials', 'valuation', 'recommendation'],
    lastUpdated: 'May 12, 2026',
    author: 'Issa Kildani',
    readTime: '6 min read',
  },
  {
    id: 'tp-004',
    title: 'Valuation Model Guide',
    category: 'template',
    description:
      'Reference guide for the risk-adjusted NPV (rNPV) methodology used across all Ambrosia advisory mandates. Documents standard assumptions for discount rates, probability of success by phase, peak sales estimation, patent life adjustments, and scenario modeling frameworks.',
    content: 'Full content available in the knowledge base',
    tags: ['rNPV', 'valuation', 'DCF', 'assumptions', 'modeling'],
    lastUpdated: 'May 8, 2026',
    author: 'Issa Kildani',
    readTime: '10 min read',
  },

  // -- Market Intelligence --
  {
    id: 'mi-001',
    title: '2026 Biopharma M&A Landscape',
    category: 'market_intel',
    description:
      'Comprehensive overview of 2026 biopharma M&A activity including deal volume trends, median premiums by therapeutic area, emerging buyer profiles, and key regulatory developments. Covers the impact of IRA pricing provisions on transaction structures and acquirer appetite across oncology, immunology, and rare disease.',
    content: 'Full content available in the knowledge base',
    tags: ['M&A landscape', '2026 trends', 'deal volume', 'premiums', 'IRA'],
    lastUpdated: 'May 23, 2026',
    author: 'Issa Kildani',
    readTime: '14 min read',
  },
  {
    id: 'mi-002',
    title: 'China Cross-Border Licensing Wave',
    category: 'market_intel',
    description:
      'Analysis of the accelerating outbound licensing trend from Chinese biotech companies to ex-China partners. Examines deal structures, typical upfront-to-total ratios, territory splits, and the strategic implications for Western mid-caps evaluating China-originated assets in oncology and immunology.',
    content: 'Full content available in the knowledge base',
    tags: ['China', 'cross-border', 'licensing', 'outbound', 'ex-China rights'],
    lastUpdated: 'May 19, 2026',
    author: 'Issa Kildani',
    readTime: '12 min read',
  },
  {
    id: 'mi-003',
    title: 'AI-Driven Drug Discovery Deals',
    category: 'market_intel',
    description:
      'Survey of emerging deal structures at the intersection of artificial intelligence and drug discovery. Covers platform licensing vs. asset-specific partnerships, computational milestone triggers, data rights provisions, and how traditional pharma is pricing AI/ML-generated candidates relative to conventional discovery programs.',
    content: 'Full content available in the knowledge base',
    tags: ['AI/ML', 'drug discovery', 'platform deals', 'data rights', 'computational'],
    lastUpdated: 'May 15, 2026',
    author: 'Issa Kildani',
    readTime: '11 min read',
  },
  {
    id: 'mi-004',
    title: 'Orphan Drug Premium Analysis',
    category: 'market_intel',
    description:
      'Quantitative analysis of acquisition and licensing premiums observed in rare disease transactions over the past 36 months. Benchmarks premiums by clinical stage, regulatory designation status (orphan, breakthrough, fast track), and market exclusivity profile against non-orphan comparables across 118 transactions.',
    content: 'Full content available in the knowledge base',
    tags: ['rare disease', 'orphan drug', 'premiums', 'exclusivity', 'designations'],
    lastUpdated: 'May 11, 2026',
    author: 'Issa Kildani',
    readTime: '13 min read',
  },

  // -- Lessons Learned --
  {
    id: 'll-001',
    title: 'Pipeline Failure Recovery Strategies',
    category: 'lesson',
    description:
      'Institutional lessons on advising clients through clinical pipeline failures including communication frameworks for boards and investors, strategic pivot options (indication expansion, platform re-positioning, reverse mergers), and timeline management for maintaining enterprise value post-failure.',
    content: 'Full content available in the knowledge base',
    tags: ['pipeline failure', 'crisis management', 'strategic pivot', 'communication'],
    lastUpdated: 'May 21, 2026',
    author: 'Issa Kildani',
    readTime: '9 min read',
  },
  {
    id: 'll-002',
    title: 'Competitive Auction Management',
    category: 'lesson',
    description:
      'Lessons from managing multi-bidder auction processes for sell-side mandates. Covers bidder qualification strategies, information asymmetry management, timeline compression tactics, markup negotiation sequencing, and how to maintain competitive tension while preserving bidder relationships for future transactions.',
    content: 'Full content available in the knowledge base',
    tags: ['auction', 'sell-side', 'competitive process', 'bidder management'],
    lastUpdated: 'May 17, 2026',
    author: 'Issa Kildani',
    readTime: '10 min read',
  },
  {
    id: 'll-003',
    title: 'Regulatory Risk Pricing',
    category: 'lesson',
    description:
      'Framework for quantifying and pricing regulatory uncertainty into deal terms based on lessons from past advisory engagements. Covers CRL scenario modeling, AdCom vote probability adjustments, PDUFA date risk allocation between buyer and seller, and structuring regulatory milestones to bridge valuation gaps.',
    content: 'Full content available in the knowledge base',
    tags: ['regulatory risk', 'CRL', 'PDUFA', 'milestone structuring', 'risk allocation'],
    lastUpdated: 'May 13, 2026',
    author: 'Issa Kildani',
    readTime: '8 min read',
  },
];

/* -------------------------------------------------- */
/* DETAIL CONTENT BY ENTRY ID                          */
/* -------------------------------------------------- */

function getDetailContent(id: string): string[] {
  const contentMap: Record<string, string[]> = {
    'pb-001': [
      'Phase 1: Sourcing & Screening -- The transaction process begins with systematic identification of potential targets or acquirers through therapeutic area mapping, pipeline gap analysis, and corporate development relationship leverage. Our proprietary screening framework evaluates over 40 criteria across clinical maturity, IP strength, commercial readiness, and strategic fit. Initial desk research is followed by confidential, high-level conversations to gauge interest without revealing client identity or specific mandate parameters. The sourcing phase typically spans 4-8 weeks depending on the breadth of the search mandate and the specificity of the client\'s strategic criteria. During this phase, the team builds a comprehensive landscape map of 50-200 potential counterparties, tiered by strategic fit (Tier 1: 10-15 high-conviction targets, Tier 2: 20-30 qualified candidates, Tier 3: 30-50 exploratory contacts). Each target is profiled across financial capacity, therapeutic area overlap, recent transaction activity, stated corporate strategy, and relationship accessibility. The output of this phase is a ranked target list with recommended outreach sequencing and a preliminary timeline for engagement.',
      'Phase 2: Initial Engagement & Teaser Distribution -- Upon identifying qualified counterparties, the team initiates structured outreach through existing relationships or cold corporate development contacts. Non-disclosure agreements are executed using our standardized CDA templates with appropriate carve-outs for life sciences diligence. A teaser document is prepared summarizing the opportunity at a level sufficient to generate interest without disclosing proprietary data. Management teams are briefed on messaging discipline and information boundaries. The engagement phase requires careful orchestration of multiple parallel conversations, tracking each counterparty\'s level of interest, diligence requests, and internal approval timelines. Standard deliverables include a 2-3 page teaser (anonymous or named, depending on client preference), a process letter outlining timeline and expectations, and a preliminary information package for parties that sign NDAs. The advisory team maintains a detailed CRM tracker logging every interaction, document shared, and follow-up commitment. A weekly pipeline review with the client ensures alignment on which parties to advance, pause, or decline. Typical conversion rates from teaser to NDA execution range from 30-50% for well-targeted outreach.',
      'Phase 3: Due Diligence Management -- Once a counterparty expresses serious interest and signs an appropriate NDA, a staged due diligence process is initiated. Phase 1 DD covers publicly available information and high-level clinical/commercial data shared via a summary presentation. Phase 2 DD grants access to the virtual data room with detailed regulatory filings, CMC documentation, IP opinions, and financial models. Phase 3 DD involves expert sessions, site visits, and management presentations. Each phase has defined gating criteria before proceeding — specifically, the counterparty must provide written confirmation of continued interest and an indicative value range before advancing to the next phase. The data room is organized into a standardized folder structure (Corporate, Clinical, Regulatory, Manufacturing, IP, Commercial, Financial, Legal) with granular access controls that allow different parties to see different levels of detail. A Q&A log is maintained centrally, with responses reviewed by legal counsel before distribution. Management presentations are rehearsed with the advisory team, with clear guidelines on what information can be shared verbally versus what must remain in the data room. The DD phase typically spans 6-10 weeks for M&A transactions and 4-6 weeks for licensing deals.',
      'Phase 4: Negotiation & Structuring -- Deal terms are negotiated through iterative markup sessions beginning with a non-binding letter of intent (LOI) or term sheet. Key economic variables include upfront consideration (cash, stock, or combination), development and regulatory milestones (tied to IND, Phase initiations, data readouts, regulatory submissions, and approvals), commercial milestones (net sales thresholds), royalty rates and tiers, and territory definitions. Our valuation models — including risk-adjusted NPV (rNPV), comparable transaction analysis, precedent premium analysis, and sum-of-the-parts assessment — provide quantitative anchors for each negotiation point. Representations, warranties, and indemnification provisions are tailored to the specific risk profile of the asset, with particular attention to clinical data integrity, IP ownership, regulatory compliance, and undisclosed liabilities. The negotiation phase typically involves 3-5 rounds of markup on the definitive agreement, with separate workstreams for the purchase agreement, disclosure schedules, transition services agreement, and any ancillary documents (employment agreements, consulting arrangements, escrow agreements). The advisory team serves as the primary interface between the parties\' legal teams, translating business terms into legal language and flagging provisions that may have unintended economic consequences. Closing conditions are negotiated to balance deal certainty with appropriate protections for both parties.',
      'Phase 5: Signing, Regulatory Approval & Closing -- Post-signing, the team manages the regulatory approval process (HSR/Hart-Scott-Rodino filing where transaction value exceeds thresholds, CFIUS review for cross-border transactions, and antitrust clearance in relevant jurisdictions), coordinates third-party consents (from collaboration partners, landlords, key suppliers, and government agencies), and oversees the closing mechanics including escrow arrangements, working capital adjustments, and transition service agreements. A structured integration plan is developed covering personnel retention (key employee agreements, stay bonuses, and retention pools), technology transfer (lab equipment, manufacturing processes, analytical methods), regulatory filing continuity (IND transfers, DMF amendments, annual report obligations), and ongoing clinical trial management to preserve asset value through the ownership transition. The period between signing and closing typically spans 30-90 days for domestic transactions and 60-180 days for cross-border deals requiring multiple regulatory approvals. During this period, the advisory team monitors compliance with interim operating covenants, manages any material adverse change (MAC) risks, and coordinates the mechanics of funds flow at closing. Post-closing deliverables include final working capital calculations, earnout tracking mechanisms, and transition support as specified in the TSA.',
      'Phase 6: Post-Close Advisory & Relationship Management -- While the formal mandate concludes at closing, Ambrosia maintains an active advisory relationship through the critical first 90 days post-close. This includes monitoring earnout milestone progress, facilitating introductions between the combined entity\'s management teams, providing market intelligence on competitive developments that may affect integration priorities, and serving as an ongoing resource for the client\'s board on strategic matters. This phase also serves a business development function: successful transactions generate referrals, repeat mandates, and enhanced market positioning. The team conducts a structured post-mortem within 30 days of closing, documenting lessons learned, process improvements, and relationship insights for the institutional knowledge base.',
    ],
    'pb-002': [
      'Clinical Workstream -- The clinical due diligence workstream covers a comprehensive review of all INDs, clinical trial protocols, statistical analysis plans, clinical study reports, and safety databases. For each ongoing trial, the team evaluates enrollment velocity, site performance, endpoint definitions, interim analysis triggers, and comparability to prior studies. Particular attention is paid to protocol amendments, clinical holds, and any FDA or EMA correspondence that may indicate regulatory concerns. Stage-specific checklists scale from preclinical toxicology packages through post-marketing commitments.',
      'Regulatory & IP Workstream -- Regulatory diligence examines the complete correspondence file with FDA, EMA, PMDA, and other relevant agencies. Key deliverables include regulatory strategy alignment, designation status verification (orphan, breakthrough, fast track, accelerated approval), and assessment of post-marketing requirements. The IP workstream maps the full patent estate including composition of matter, formulation, method of use, and manufacturing process claims. Freedom-to-operate analyses, paragraph IV exposure, and Orange Book/Purple Book listings are evaluated against competitive landscape and generic/biosimilar entry timelines.',
      'Commercial & Financial Workstream -- Commercial diligence assesses total addressable market, patient segmentation, payer landscape, reimbursement pathways, and competitive positioning. Peak sales estimates are stress-tested against epidemiological data, treatment paradigm shifts, and anticipated competitive entries. Financial diligence covers historical and projected P&L, cash runway, burn rate assumptions, existing contractual obligations, and cap table structure. Revenue recognition policies, deferred revenue from collaborations, and milestone payment schedules are verified against source agreements.',
      'Red Flag Indicators -- Across all workstreams, the team maintains a running log of potential deal-breakers including: unexplained protocol amendments in pivotal trials, clinical holds or FDA warning letters, unresolved patent interference proceedings, material undisclosed litigation, customer concentration above 40%, key person dependencies without retention mechanisms, and significant deviations between management projections and independent commercial assessments. Any single red flag triggers an escalation review with the advisory team lead before proceeding.',
    ],
    'pb-003': [
      'Economic Terms Framework -- Licensing economics are structured across four primary value levers: upfront payments, development milestones, commercial milestones, and royalties. Upfront payments typically range from 10-30% of total deal value for preclinical assets and 20-50% for clinical-stage compounds, reflecting the risk profile and negotiating leverage of each party. Development milestones are tied to IND filing, Phase 1/2/3 initiation, pivotal data readouts, and regulatory submissions. Commercial milestones benchmark against annual net sales thresholds. Royalty tiers typically escalate from low-teens to mid-twenties for blockbuster-trajectory assets.',
      'Territory & Rights Allocation -- Territory splits most commonly follow US/ex-US, US+EU/ROW, or worldwide structures. Co-exclusive and co-promote arrangements introduce complexity around cost-sharing, commercial coordination, and dispute resolution that must be carefully documented. Opt-in rights, rights of first negotiation (ROFN), and rights of first refusal (ROFR) on additional indications or geographies require precise triggering conditions, exercise windows, and valuation methodologies to avoid future disputes.',
      'Diligence Obligations & Governance -- Licensees are typically subject to commercially reasonable efforts (CRE) obligations with defined minimum expenditure thresholds, development timelines, and reporting cadences. Joint steering committees (JSC), joint development committees (JDC), and joint commercialization committees (JCC) provide governance frameworks. Voting mechanics, casting vote rights, and escalation procedures determine operational control. Anti-shelving provisions, sublicensing restrictions, and change-of-control triggers protect licensor interests against acquirers who may deprioritize the licensed program.',
      'Common Pitfalls & Red Flags -- Frequently observed negotiation failures include: ambiguous definitions of "net sales" that fail to account for rebates, chargebacks, and co-pay assistance; milestone triggers tied to subjective endpoints rather than measurable regulatory or commercial achievements; inadequate audit rights over royalty calculations; and change-of-control provisions that fail to address partial acquisitions or reverse mergers. The most consequential drafting errors tend to cluster around termination provisions, assignment restrictions, and IP ownership of improvements.',
    ],
    'pb-004': [
      'Pre-Fundraise Preparation -- Effective fundraising advisory begins 6-9 months before the target raise date with a comprehensive readiness assessment. The team evaluates the client\'s data maturity, corporate narrative coherence, management team completeness, and gap analysis against institutional investor expectations. Key deliverables include a refined corporate presentation, updated financial model with scenario analysis, data room population, and identification of any pre-fundraise corporate housekeeping items (board composition, governance documents, option pool expansion, IP assignments).',
      'Investor Targeting & Outreach -- Investor targeting follows a tiered methodology: Tier 1 consists of 15-20 funds with demonstrated sector expertise, appropriate check size, and recent investment activity in the relevant therapeutic area and stage. Tier 2 expands to crossover funds, family offices, and corporate venture arms with adjacency interest. Tier 3 covers generalist healthcare investors and international capital sources. Outreach is sequenced to ensure Tier 1 conversations occur first, with sufficient time for diligence before introducing competitive dynamics from broader outreach.',
      'Roadshow Management -- Roadshow logistics are managed to maintain momentum while avoiding management team fatigue. Meetings are clustered geographically with a target of 4-5 substantive investor meetings per day over a 2-3 week period. Follow-up materials (data room access, expert calls, site visits) are staged to coincide with investor diligence timelines. Weekly pipeline reviews track investor engagement levels and flag any process concerns requiring strategic adjustment.',
      'Term Sheet Negotiation & Close -- Upon receiving term sheets, the team conducts a comparative analysis across all key provisions: pre-money valuation, liquidation preferences, anti-dilution protection, board composition, protective provisions, drag-along rights, and investor-specific covenants. Our benchmark database of 280+ comparable life sciences financings provides quantitative context for each negotiation point. Syndicate construction is optimized for value-add beyond capital, including industry expertise, follow-on capacity, and strategic partnership facilitation.',
    ],
    'pb-005': [
      'Therapeutic Area Mapping -- The partner search begins with a comprehensive mapping of the relevant therapeutic area landscape, identifying all companies with active clinical programs, commercial products, or stated strategic interest in the target indication or modality. This mapping draws on proprietary databases, conference presentations, SEC filings, patent applications, and corporate development intelligence to construct a universe of 50-200 potential partners ranked by strategic fit, financial capacity, and historical deal activity.',
      'Pipeline Gap Analysis -- Each potential partner is evaluated against their existing pipeline to identify strategic gaps that the client\'s asset could fill. Factors include lifecycle management needs (patent cliffs within 3-5 years), therapeutic area expansion goals stated in investor communications, competitive positioning against peer companies, and geographic coverage requirements. Partners with the most acute strategic need for the client\'s asset profile are prioritized, as urgency correlates strongly with premium willingness and timeline acceleration.',
      'Outreach Protocol & NDA Management -- Corporate development outreach follows a structured protocol: initial contact through existing relationships where available, followed by a high-level opportunity summary that conveys strategic relevance without disclosing confidential information. NDA/CDA execution uses our standardized templates with appropriate carve-outs for the specific transaction type. Contact tracking, response rates, and follow-up cadences are managed through the CRM system with automated escalation alerts for non-responsive Tier 1 targets.',
      'Partner Evaluation & Shortlisting -- Interested parties undergo a reverse due diligence assessment covering financial stability, integration track record, cultural compatibility, decision-making speed, and regulatory approval likelihood (particularly relevant for cross-border transactions subject to CFIUS or antitrust review). The shortlist typically narrows to 5-8 qualified partners who advance to management meetings and detailed data sharing. Partner-specific engagement strategies are developed to maximize competitive tension while maintaining relationship quality for future transactions.',
    ],
    'tp-001': [
      'Executive Summary Section -- The CIM executive summary provides a 2-3 page overview of the investment opportunity, including company description, lead program status, key competitive advantages, financial highlights, and transaction rationale. This section is designed to be self-contained for senior decision-makers who may not review the full document. Language should be precise, data-driven, and avoid promotional tone. Key metrics (market size, patient population, clinical endpoints) are presented with sourcing and methodology notes.',
      'Company & Technology Overview -- This section presents the company history, founding thesis, technology platform, and mechanism of action in sufficient depth for scientific and commercial evaluation. For platform companies, the section articulates the breadth of application beyond the lead program and documents validation milestones. For single-asset companies, it positions the asset within the broader treatment paradigm and articulates differentiation against standard of care and emerging competitors. Patent estate summaries and key publication references are included.',
      'Clinical Pipeline & Regulatory Strategy -- Each clinical program is presented with trial design summaries, enrollment status, endpoint definitions, anticipated data readout timelines, and regulatory pathway strategy. Historical clinical data (including Phase 1 safety, Phase 2 efficacy signals) are presented with statistical context and independent clinical assessment. Regulatory designations, agency interactions, and approval pathway assumptions are documented with supporting correspondence references where appropriate.',
      'Commercial Opportunity & Financial Projections -- The commercial section presents market sizing (top-down epidemiological approach and bottom-up patient flow model), competitive landscape positioning, pricing and reimbursement assumptions, and peak sales estimates with explicit assumption documentation. Financial projections include 10-year P&L forecasts under base, upside, and downside scenarios with sensitivity analysis on key variables. Capital requirements to reach each value inflection point are clearly articulated.',
    ],
    'tp-002': [
      'Key Economic Terms Section -- The term sheet template structures economic provisions across a standardized framework: upfront payment (cash and/or equity), development milestone schedule (IND, Phase starts, data readouts, regulatory submissions), regulatory milestones (approval events by geography), commercial milestones (annual net sales thresholds), and royalty structure (tiered rates, step-downs, offsets). Each section includes placeholder ranges benchmarked against recent comparable transactions with explanatory notes on market norms.',
      'Governance & Decision Rights -- Governance provisions define the committee structure (JSC, JDC, JCC), voting mechanics, casting vote allocation, and escalation procedures for material decisions. Decision matrices specify which party controls key areas: clinical development strategy, regulatory submissions, pricing/reimbursement, commercial launch sequencing, and lifecycle management. Sub-licensing rights, assignment restrictions, and change-of-control provisions are structured to protect both parties\' strategic interests.',
      'Representations, Warranties & Indemnification -- Life sciences-specific representations cover IP ownership and freedom-to-operate, regulatory compliance history, clinical data integrity, undisclosed safety signals, and material contractual obligations that could affect the licensed rights. Warranty survival periods, indemnification caps, and basket/deductible structures are calibrated to the risk profile and relative bargaining positions. Specific provisions address clinical trial liability allocation, product liability insurance requirements, and regulatory recall cost-sharing.',
      'Termination & Wind-Down Provisions -- Termination provisions address material breach (with cure periods), bankruptcy/insolvency, safety events, and convenience termination (typically licensee-only, with notice periods and wind-down obligations). Post-termination rights include license-back provisions for improvements developed during the collaboration, inventory sell-off periods, transition assistance obligations, and ongoing royalty obligations on products launched prior to termination. Data and regulatory filing transfer mechanics are specified in detail.',
    ],
    'tp-003': [
      'Strategic Rationale Section -- The board presentation opens with a concise articulation of strategic rationale: why this transaction, why now, and how it advances the company\'s stated corporate strategy. This section maps the opportunity against the board-approved strategic plan, identifies the specific gap or objective the transaction addresses, and quantifies the strategic value beyond financial returns (pipeline diversification, geographic expansion, capability acquisition, competitive positioning).',
      'Valuation Analysis -- The valuation section presents a multi-methodology analysis: risk-adjusted NPV (rNPV) as the primary methodology, supported by comparable public company analysis, precedent transaction multiples, and sum-of-the-parts assessment for multi-asset targets. Each methodology includes explicit assumption documentation, sensitivity tables on key variables, and probability-weighted scenario analysis. The recommended valuation range is derived from the convergence of methodologies with appropriate weighting based on data availability and comparability.',
      'Risk Assessment & Mitigation -- Material risks are presented across five categories: clinical/scientific, regulatory, commercial, financial/structural, and execution/integration. Each risk is rated for probability and impact, with specific mitigation strategies or deal structure provisions that address the risk. Contingent value rights (CVRs), milestone-based consideration, escrow arrangements, and representation/warranty insurance are presented as structural tools for allocating identified risks between parties.',
      'Recommendation & Decision Framework -- The concluding section presents a clear recommendation (proceed, proceed with conditions, or decline) with the supporting rationale. A decision framework outlines the key assumptions underlying the recommendation and identifies the specific conditions or findings that would change the recommendation. Next steps are presented with a timeline, resource requirements, and approval thresholds for proceeding to the next phase of the transaction.',
    ],
    'tp-004': [
      'rNPV Methodology Overview -- The risk-adjusted net present value model is the primary valuation methodology for development-stage life sciences assets across all Ambrosia advisory mandates. The model projects risk-adjusted cash flows by applying phase-specific probability of technical and regulatory success (PTRS) to projected revenues and costs, then discounts at a rate reflecting the systematic risk of the therapeutic area and development stage. Standard discount rates range from 8-12% for late-stage/commercial assets to 12-18% for early-stage programs, calibrated to market-observed transaction multiples.',
      'Probability of Success Assumptions -- Phase transition probabilities are sourced from the BIO/QLS clinical development success rate database, adjusted for therapeutic area, modality, biomarker enrichment, regulatory designation status, and historical program-specific data. Baseline rates: Preclinical to Phase 1 (60-70%), Phase 1 to Phase 2 (50-65%), Phase 2 to Phase 3 (25-40%), Phase 3 to NDA (55-70%), NDA to Approval (85-95%). Adjustments are documented with supporting evidence and rationale. Cumulative probability of success (cPOS) from current stage to approval is the primary risk metric communicated to clients.',
      'Revenue Modeling Framework -- Peak sales estimation follows a patient-based model: target population (epidemiological prevalence x diagnosed rate x treated rate x addressable rate) multiplied by pricing (WAC, net price after rebates/discounts) and market share trajectory (S-curve adoption model with competitive erosion). Launch sequencing by geography, indication expansion timelines, and loss of exclusivity assumptions are explicitly modeled. Revenue ramp follows therapeutic area-specific S-curves calibrated to historical analogue launches.',
      'Scenario Analysis & Sensitivity -- Every rNPV model includes base case, upside, and downside scenarios with clearly defined assumption sets for each. Two-variable sensitivity tables present valuation impact across the most influential parameters (typically peak sales and probability of success, or discount rate and market share). Monte Carlo simulation is employed for high-value mandates, generating probability distributions of NPV outcomes from 10,000+ iterations with correlated variable assumptions. Results are presented as expected value with confidence intervals.',
    ],
    'mi-001': [
      'Executive Summary -- The 2026 biopharma M&A landscape is characterized by sustained deal volume with a notable shift in buyer composition and deal structure preferences. Year-to-date, 47 transactions exceeding $500M in total consideration have been announced, compared to 39 in the same period of 2025. Median acquisition premiums have compressed modestly to 68% (vs. 74% in 2025), driven partly by elevated public market valuations reducing the "gap" between trading prices and strategic value. The Inflation Reduction Act\'s Medicare drug pricing provisions continue to reshape acquirer appetite, with a measurable tilt toward assets with patent estates extending beyond 2035.',
      'Therapeutic Area Dynamics -- Oncology remains the dominant therapeutic area by deal volume (38% of all transactions >$500M) but is showing signs of premium compression as competitive intensity increases across checkpoint inhibitors, ADCs, and bispecific platforms. Immunology/inflammation has emerged as the fastest-growing M&A category, driven by the approaching patent cliffs on Humira biosimilars and the race to establish next-generation anti-inflammatory platforms. Rare disease commands the highest median premiums (92%) reflecting smaller patient populations, premium pricing, and longer exclusivity periods.',
      'Emerging Buyer Profiles -- Mid-cap pharmaceutical companies ($5-25B market cap) have become the most active acquirers by deal count, often pursuing bolt-on acquisitions to fill near-term pipeline gaps. Large-cap pharma continues to dominate by deal value but is increasingly favoring option-based structures (equity investments with acquisition options, licensing with buyout provisions) over outright acquisitions for preclinical and early-stage assets. Private equity involvement in biopharma M&A has reached an inflection point, with three PE-backed acquisitions of commercial-stage rare disease companies in Q1 2026 alone.',
      'IRA Impact on Deal Structures -- The Inflation Reduction Act\'s small-molecule pricing provisions (9 years post-approval) versus biologic provisions (13 years) have created a measurable structural preference for biologic assets in M&A. Acquirers are systematically adjusting DCF models to incorporate Medicare price negotiation risk, particularly for assets targeting indications with significant Medicare exposure (oncology, cardiovascular, metabolic). Milestone structures increasingly include IRA-specific provisions: price negotiation selection milestones, volume-based adjustment mechanisms, and inflation rebate cost-sharing arrangements between buyer and seller.',
    ],
    'mi-002': [
      'Market Overview -- Chinese biotech companies have executed over 60 outbound licensing transactions since January 2025, representing a fundamental shift in the global pharmaceutical value chain. These deals are concentrated in oncology (45%) and immunology (25%), with emerging activity in neuroscience and metabolic disease. The median upfront payment for China-originated assets has increased from $30M in 2023 to $75M in 2026, reflecting both improved clinical data packages and growing Western confidence in Chinese clinical development capabilities.',
      'Deal Structure Analysis -- Outbound licensing from China typically follows a structured template: upfront cash payment (15-25% of total deal value), development milestones tied to ex-China regulatory events, and tiered royalties on ex-China net sales. Territory splits are predominantly China/ex-China, with licensors retaining manufacturing rights and supply obligations. Co-development arrangements are increasing in frequency, particularly for Phase 2 and later assets where the Chinese company seeks to maintain economic participation beyond royalties. Total deal values for clinical-stage oncology assets from Chinese biotechs now regularly exceed $1B.',
      'Strategic Implications for Western Companies -- Western mid-cap pharmaceutical companies evaluating China-originated assets must navigate a distinct set of considerations: regulatory pathway alignment (NMPA data acceptance by FDA/EMA), manufacturing quality and supply chain continuity, IP landscape in the ex-China territory, and geopolitical risk including CFIUS review, technology transfer restrictions, and evolving US-China trade policy. Companies that develop robust China-sourcing capabilities and cross-border deal expertise will have a meaningful competitive advantage in accessing assets that may represent best-in-class clinical profiles at lower acquisition costs than domestically developed alternatives.',
      'Outlook & Advisory Implications -- The outbound licensing wave from China is expected to accelerate through 2027 as the first generation of well-funded Chinese biotechs reach clinical proof-of-concept with differentiated assets. For advisory mandates, this creates opportunities in both directions: assisting Chinese biotechs in structuring outbound deals to maximize value, and advising Western acquirers on evaluation frameworks that appropriately price the unique risks and opportunities of China-originated assets. Key advisory value-adds include regulatory bridge strategy, manufacturing due diligence, and geopolitical risk assessment.',
    ],
    'mi-003': [
      'Market Landscape -- The intersection of artificial intelligence and drug discovery has generated over $8B in cumulative deal value since 2024, spanning platform collaborations, asset-specific partnerships, and outright acquisitions of AI-native drug discovery companies. Deal structures in this space remain highly heterogeneous, reflecting the nascent and rapidly evolving nature of AI/ML contributions to the drug development value chain. The market is bifurcating between platform-level partnerships (where pharma gains broad access to computational capabilities) and asset-specific deals (where AI-generated candidates are transacted similarly to conventionally discovered molecules).',
      'Platform vs. Asset Deal Structures -- Platform collaborations typically involve multi-year research agreements with option rights on output molecules, structured as: technology access fees ($10-50M), research funding ($5-20M/year), and option exercise payments upon candidate nomination. Asset-specific deals increasingly resemble traditional licensing transactions but with novel provisions for data rights, algorithm IP, and computational methodology disclosure. A key structural tension exists around the valuation of AI-generated candidates: pharma buyers argue that reduced discovery timelines should command a discount, while AI companies contend that higher-quality candidate selection (better PK, selectivity, safety margins) justifies a premium.',
      'Emerging Deal Terms -- Novel contractual provisions emerging in AI drug discovery deals include: computational milestone triggers (in silico validation, predictive accuracy thresholds), data exclusivity and re-use restrictions, algorithm improvement sharing, and synthetic data rights. Joint ownership of training datasets and model weights represents a particularly complex negotiation area, as the value of these assets grows with each successive drug program. Representation and warranty provisions are evolving to address AI-specific risks including model bias, training data provenance, and regulatory acceptance of computationally-derived evidence.',
      'Valuation Considerations -- Pricing AI drug discovery assets requires adjustments to traditional rNPV frameworks. Potential premium factors include: compressed discovery timelines (12-18 months vs. 3-5 years), improved candidate quality metrics (lower predicted attrition), and platform optionality beyond the initial indication. Potential discount factors include: limited clinical validation track record, regulatory uncertainty around AI-derived evidence, and key person/technology dependency risks. As the first wave of AI-discovered molecules progresses through Phase 2 and Phase 3, transaction multiples will increasingly be calibrated to clinical outcomes rather than platform promise.',
    ],
    'mi-004': [
      'Transaction Premium Analysis -- Analysis of 118 rare disease transactions completed between 2023 and 2026 reveals a median acquisition premium of 87% for orphan-designated assets versus 52% for non-orphan comparables across the same therapeutic areas. This 35-percentage-point "orphan premium" is remarkably consistent across clinical stages, though the absolute dollar premium increases significantly for later-stage assets. Orphan-designated assets in Phase 3 or later commanded a median premium of 94%, compared to 78% for Phase 1/2 orphan assets, reflecting both de-risking and proximity to revenue generation.',
      'Regulatory Designation Impact -- Regulatory designations beyond orphan status provide incremental premium uplift: breakthrough therapy designation adds approximately 12-15 percentage points to the median premium, while fast track designation adds 5-8 percentage points. The combination of orphan + breakthrough + priority review voucher eligibility produces the highest observed premiums, with a median of 112% across 14 transactions in our dataset. Importantly, the premium associated with regulatory designations appears to be partially independent of clinical data quality, suggesting that buyers are pricing the reduced regulatory risk and accelerated time-to-market inherent in these pathways.',
      'Market Exclusivity Valuation -- Seven-year orphan drug exclusivity in the US (10 years in EU) represents a quantifiable moat that acquirers systematically value. Our analysis indicates that each additional year of remaining orphan exclusivity at the time of acquisition is associated with approximately 4-6 percentage points of incremental premium. Assets with orphan exclusivity extending beyond 2033 command significantly higher valuations than those with near-term exclusivity expirations, even after controlling for revenue trajectory and competitive landscape. This finding has direct implications for deal timing: sellers maximize value by transacting while substantial exclusivity remains.',
      'Advisory Implications -- For sell-side advisory mandates involving orphan-designated assets, our analysis supports several actionable recommendations: (1) regulatory designation strategy should be completed before initiating a sale process, as the premium impact is substantial and well-documented; (2) buyer targeting should prioritize acquirers with existing rare disease commercial infrastructure, as these buyers consistently pay 10-15% higher premiums than diversified pharma without rare disease platforms; (3) deal structures should leverage the exclusivity moat to negotiate higher upfront percentages, as buyers face less competition risk during the exclusivity period and can therefore justify front-loading consideration.',
    ],
    'll-001': [
      'Situation Context -- Clinical pipeline failures in pivotal trials represent one of the most value-destructive events for biotech companies, typically resulting in 50-80% equity declines within 48 hours of announcement. Over the past three years, Ambrosia has advised five clients through pipeline failure scenarios, developing institutional expertise in crisis management, strategic re-positioning, and value preservation. The common thread across all engagements is that speed of response and quality of strategic communication directly correlate with the degree to which enterprise value can be preserved or recovered.',
      'Communication Framework -- Immediate post-failure communication follows a structured protocol: (1) Board notification within 4 hours with preliminary data assessment and recommended next steps; (2) investor communication within 24 hours with clear articulation of data findings, cash runway implications, and strategic options under evaluation; (3) employee communication within 48 hours with retention-focused messaging and timeline for strategic update. The most critical principle is honesty with context: acknowledge the failure directly, provide data-driven analysis of what the results mean, and present a credible path forward with specific milestones and timelines.',
      'Strategic Pivot Options -- Post-failure strategic options depend on three variables: remaining cash runway, platform breadth beyond the failed program, and management team credibility. Common pivot paths include: (a) indication expansion with the same molecule based on emerging data or scientific rationale, (b) platform re-positioning to highlight other pipeline assets that may have been overshadowed, (c) reverse merger or strategic combination with a complementary company, (d) return of capital if no credible path to value creation exists. Each option is evaluated against a decision matrix scoring probability of success, capital requirements, timeline to value inflection, and management team capability alignment.',
      'Value Preservation Tactics -- Tactical measures for preserving enterprise value post-failure include: immediate cost restructuring to extend runway (demonstrating fiscal discipline to investors), accelerated development of backup pipeline assets, strategic partnership discussions for non-lead assets that may attract interest from parties previously hesitant to compete for management attention, and exploration of asset out-licensing for the failed program in alternative indications or geographies where the data may still support development. Timeline management is critical: the strategic update to investors should occur within 30-60 days of the failure announcement, providing sufficient time for analysis while maintaining market confidence that management is taking decisive action.',
    ],
    'll-002': [
      'Situation Context -- Competitive auction processes, when managed effectively, can generate 20-40% incremental value relative to bilateral negotiations. However, poorly managed auctions risk alienating bidders, creating information security concerns, and ultimately producing inferior outcomes if competitive tension collapses prematurely. Ambrosia has managed 12 multi-bidder processes over the past four years, producing a median final-round premium of 34% over the initial indication of interest, with insights on both successful and suboptimal process outcomes.',
      'Bidder Qualification & Information Management -- The most critical phase of any auction is bidder qualification: identifying which parties have both the strategic rationale and financial capacity to consummate a transaction at full value. Our standard process begins with 15-25 teaser recipients, narrowing to 8-12 first-round participants (management presentation access), and 3-5 final-round bidders with full data room access. Information release is strictly staged: each round of data access is conditioned on increasingly specific indications of value, ensuring that competitive information is shared only with parties demonstrating serious interest and capability.',
      'Timeline Management & Competitive Tension -- Auction timelines must balance thoroughness with momentum. First-round bids are typically due 4-6 weeks after management presentations, with a 2-3 week evaluation period before advancing finalists. Final bids are due 3-4 weeks after full data room access with markup of the definitive agreement. The most effective tactic for maintaining competitive tension is transparency about process dynamics without revealing specific bid levels: confirming the number of active bidders, communicating that competitive bids have been received, and clearly articulating that the seller intends to maximize value through a complete process.',
      'Key Lessons & Common Pitfalls -- The most consequential lesson from our auction experience is that losing a bidder late in the process is far more damaging than running a slightly longer timeline to keep all parties engaged. Common pitfalls include: setting unrealistic timeline expectations that cause bidders to submit qualified bids rather than walk away; providing inconsistent information to different bidders (even inadvertently through management presentation variations); failing to maintain relationship quality with unsuccessful bidders, who may be counterparties in future transactions; and over-indexing on headline price without adequate attention to certainty of close, regulatory risk, and post-signing execution risk.',
    ],
    'll-003': [
      'Situation Context -- Regulatory uncertainty is one of the most difficult variables to price in life sciences transactions, yet it often represents the largest source of valuation divergence between buyer and seller. Assets approaching PDUFA dates, post-CRL resubmissions, or pre-AdCom presentations face binary outcomes that can swing valuations by 50-200%. Ambrosia has developed a structured framework for quantifying regulatory risk and translating it into deal terms that bridge the valuation gap, based on lessons from eight advisory mandates involving significant regulatory uncertainty.',
      'CRL Scenario Modeling -- Complete Response Letters represent a particularly challenging pricing scenario because the nature of the CRL (clinical deficiency vs. CMC issue vs. labeling question) dramatically affects the cost, timeline, and probability of resolution. Our framework categorizes CRL risk into three tiers: Tier 1 (labeling/post-marketing, typically 3-6 month resolution, 90%+ approval probability), Tier 2 (CMC/manufacturing, 6-18 month resolution, 70-85% approval probability), and Tier 3 (clinical deficiency requiring additional studies, 2-4 year resolution, 40-60% approval probability). Each tier implies a different discount to the base case rNPV and suggests different milestone structuring approaches.',
      'Risk Allocation Through Deal Structure -- The most effective mechanism for bridging regulatory valuation gaps is milestone-based consideration that allocates risk between buyer and seller. Standard structures include: (a) upfront payment reflecting the probability-weighted downside scenario, with regulatory milestones that restore full value upon approval; (b) contingent value rights (CVRs) that provide sellers additional consideration upon achievement of regulatory milestones; (c) escrow arrangements that release funds upon CRL resolution or approval; and (d) earnout structures tied to post-approval commercial performance that shift regulatory risk to the buyer while preserving seller upside.',
      'Key Takeaways -- Three principles have proven most valuable across our regulatory risk engagements: First, sellers should never accept a discount for regulatory risk without receiving commensurate upside protection through milestones or CVRs, as the market systematically overprices regulatory uncertainty for well-characterized assets. Second, AdCom vote probabilities should be modeled using historical vote distributions for the specific division and product type, not blanket assumptions. Third, the timing of transaction execution relative to regulatory events is a critical strategic decision: selling pre-PDUFA preserves optionality value, while selling post-CRL (but pre-resubmission) often represents the nadir of perceived value and should be avoided unless capital constraints require it.',
    ],
  };

  return contentMap[id] || [
    'This knowledge base entry contains proprietary institutional content that has been compiled from internal advisory experience, precedent transaction analysis, and subject matter expertise. The content is intended for authorized Ambrosia Ventures team members only and should not be shared externally without partner approval.',
    'For questions about this entry or to request updates, please contact the authoring team member or raise a discussion in the relevant deal team channel.',
  ];
}

/* -------------------------------------------------- */
/* PAGE COMPONENT                                      */
/* -------------------------------------------------- */

export default function KnowledgeDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const entry = knowledgeEntries.find((e) => e.id === id);

  if (!entry) {
    return (
      <div className="flex flex-col items-center justify-center py-32 text-center">
        <BookOpen className="mb-6 h-12 w-12 text-slate-600" />
        <h2 className="font-cormorant text-2xl font-semibold text-slate-300 mb-3">
          Entry Not Found
        </h2>
        <p className="text-sm text-slate-500 mb-8">
          The requested knowledge base entry does not exist or has been archived.
        </p>
        <Link
          href="/knowledge"
          className="inline-flex items-center gap-2 text-sm text-teal-400 hover:text-teal-300 transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Knowledge Base
        </Link>
      </div>
    );
  }

  const meta = CATEGORY_META[entry.category];
  const Icon = meta.icon;
  const contentSections = getDetailContent(entry.id);

  return (
    <div className="mx-auto max-w-4xl">
      {/* Back Navigation */}
      <Link
        href="/knowledge"
        className="mb-8 inline-flex items-center gap-2 text-sm text-slate-500 hover:text-teal-400 transition-colors"
      >
        <ArrowLeft className="h-4 w-4" />
        Back to Knowledge Base
      </Link>

      {/* Main Content Card */}
      <Card style={{ padding: '56px 64px' }}>
        {/* Category Badge + Read Time */}
        <div className="mb-8 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-navy-800 border border-subtle">
              <Icon className="h-4 w-4 text-teal-400" />
            </div>
            <Badge variant={meta.badgeVariant}>{meta.label}</Badge>
          </div>
          <div className="flex items-center gap-1.5 font-mono text-xs text-slate-500">
            <Clock className="h-3.5 w-3.5" />
            {entry.readTime}
          </div>
        </div>

        {/* Title */}
        <h1 style={{ fontFamily: 'var(--font-cormorant), "Cormorant Garamond", Georgia, serif', fontSize: '36px', fontWeight: 600, color: '#f0f4f8', lineHeight: 1.2, letterSpacing: '-0.01em', marginBottom: '20px' }}>
          {entry.title}
        </h1>

        {/* Author + Last Updated */}
        <div className="mb-8 flex items-center gap-5 text-sm text-slate-500">
          <div className="flex items-center gap-2">
            <User className="h-4 w-4 text-slate-600" />
            <span className="font-medium text-slate-400">{entry.author}</span>
          </div>
          <span className="text-slate-700">|</span>
          <div className="flex items-center gap-2">
            <Clock className="h-4 w-4 text-slate-600" />
            <span>Last updated {entry.lastUpdated}</span>
          </div>
        </div>

        {/* Tags */}
        <div className="mb-10 flex flex-wrap gap-3">
          {entry.tags.map((tag) => (
            <span
              key={tag}
              className="inline-flex items-center gap-1.5 rounded bg-navy-800 px-3 py-1.5 text-xs text-slate-400 border border-subtle"
            >
              <Tag className="h-3 w-3 text-slate-600" />
              {tag}
            </span>
          ))}
        </div>

        {/* Divider */}
        <div className="mb-12 border-t border-subtle" />

        {/* Description / Overview */}
        <div className="mb-12">
          <h2 style={{ fontFamily: 'var(--font-cormorant), "Cormorant Garamond", Georgia, serif', fontSize: '22px', fontWeight: 600, color: '#e2e8f0', marginBottom: '16px' }}>
            Overview
          </h2>
          <p style={{ fontSize: '15px', lineHeight: 1.85, color: '#94a3b8', letterSpacing: '0.01em' }}>
            {entry.description}
          </p>
        </div>

        {/* Full Content Sections */}
        <div className="space-y-12">
          {contentSections.map((section, i) => {
            const separatorIndex = section.indexOf(' -- ');
            const hasHeading = separatorIndex > -1;
            const heading = hasHeading ? section.slice(0, separatorIndex) : null;
            const body = hasHeading ? section.slice(separatorIndex + 4) : section;

            return (
              <div key={i}>
                {heading && (
                  <h3 style={{ fontFamily: 'var(--font-cormorant), "Cormorant Garamond", Georgia, serif', fontSize: '20px', fontWeight: 600, color: '#e2e8f0', marginBottom: '14px' }}>
                    {heading}
                  </h3>
                )}
                <p style={{ fontSize: '15px', lineHeight: 1.85, color: '#94a3b8', letterSpacing: '0.01em' }}>
                  {body}
                </p>
              </div>
            );
          })}
        </div>

        {/* Footer Divider */}
        <div className="mt-12 mb-6 border-t border-subtle" />

        {/* Footer Metadata */}
        <div className="flex items-center justify-between text-xs text-slate-600">
          <div className="flex items-center gap-2">
            <BookOpen className="h-3.5 w-3.5" />
            <span className="font-mono">ID: {entry.id}</span>
          </div>
          <span className="font-mono">Ambrosia Ventures -- Internal Use Only</span>
        </div>
      </Card>
    </div>
  );
}
