export const DEAL_STAGES = [
  { id: 'sourcing', label: 'Sourcing', color: 'bg-slate-100 text-slate-700' },
  { id: 'initial_review', label: 'Initial Review', color: 'bg-blue-100 text-blue-700' },
  { id: 'due_diligence', label: 'Due Diligence', color: 'bg-amber-100 text-amber-700' },
  { id: 'negotiation', label: 'Negotiation', color: 'bg-orange-100 text-orange-700' },
  { id: 'closing', label: 'Closing', color: 'bg-purple-100 text-purple-700' },
  { id: 'closed_won', label: 'Closed Won', color: 'bg-green-100 text-green-700' },
  { id: 'closed_lost', label: 'Closed Lost', color: 'bg-red-100 text-red-700' },
] as const;

export const DEAL_TYPES = [
  { id: 'ma', label: 'M&A' },
  { id: 'licensing', label: 'Licensing' },
  { id: 'partnership', label: 'Partnership' },
  { id: 'fundraising', label: 'Fundraising' },
  { id: 'co_development', label: 'Co-Development' },
] as const;

export const ORG_TYPES = [
  { id: 'biotech', label: 'Biotech' },
  { id: 'pharma', label: 'Pharma' },
  { id: 'medtech', label: 'MedTech / Devices' },
  { id: 'diagnostics', label: 'Diagnostics' },
  { id: 'digital_health', label: 'Digital Health' },
  { id: 'healthcare', label: 'Healthcare Services' },
  { id: 'nutraceuticals', label: 'Nutraceuticals / Consumer Health' },
  { id: 'family_office', label: 'Family Office' },
  { id: 'angel', label: 'Angel' },
  { id: 'vc', label: 'VC' },
  { id: 'pe', label: 'PE' },
  { id: 'cro', label: 'CRO' },
  { id: 'advisory', label: 'Advisory' },
  { id: 'other', label: 'Other' },
] as const;

export const CONTACT_TYPES = [
  { id: 'executive', label: 'Executive' },
  { id: 'founder', label: 'Founder' },
  { id: 'investor', label: 'Investor' },
  { id: 'advisor', label: 'Advisor' },
  { id: 'board_member', label: 'Board Member' },
  { id: 'operator', label: 'Operator' },
] as const;

export const PROJECT_TYPES = [
  { id: 'strategy', label: 'Strategy' },
  { id: 'market_assessment', label: 'Market Assessment' },
  { id: 'partner_search', label: 'Partner Search' },
  { id: 'due_diligence', label: 'Due Diligence' },
  { id: 'valuation', label: 'Valuation' },
  { id: 'fundraising_support', label: 'Fundraising Support' },
] as const;

export const TASK_STATUSES = [
  { id: 'todo', label: 'To Do', color: 'bg-slate-100 text-slate-700' },
  { id: 'in_progress', label: 'In Progress', color: 'bg-blue-100 text-blue-700' },
  { id: 'review', label: 'Review', color: 'bg-amber-100 text-amber-700' },
  { id: 'done', label: 'Done', color: 'bg-green-100 text-green-700' },
] as const;

export const PRIORITIES = [
  { id: 'critical', label: 'Critical', color: 'bg-red-100 text-red-700' },
  { id: 'urgent', label: 'Urgent', color: 'bg-orange-100 text-orange-700' },
  { id: 'high', label: 'High', color: 'bg-amber-100 text-amber-700' },
  { id: 'medium', label: 'Medium', color: 'bg-yellow-100 text-yellow-700' },
  { id: 'low', label: 'Low', color: 'bg-slate-100 text-slate-700' },
] as const;

export const RELATIONSHIP_STRENGTHS = [
  { id: 'warm_intro', label: 'Warm Intro', color: 'bg-green-100 text-green-700' },
  { id: 'direct', label: 'Direct', color: 'bg-blue-100 text-blue-700' },
  { id: 'met_once', label: 'Met Once', color: 'bg-amber-100 text-amber-700' },
  { id: 'cold', label: 'Cold', color: 'bg-slate-100 text-slate-700' },
] as const;

export const CONFIDENTIALITY_LEVELS = [
  { id: 'public', label: 'Public' },
  { id: 'confidential', label: 'Confidential' },
  { id: 'highly_confidential', label: 'Highly Confidential' },
] as const;

export const TEAM_ROLES = [
  { id: 'partner', label: 'Partner' },
  { id: 'vp', label: 'Vice President' },
  { id: 'analyst', label: 'Analyst' },
  { id: 'associate', label: 'Associate' },
  { id: 'admin', label: 'Admin' },
] as const;
