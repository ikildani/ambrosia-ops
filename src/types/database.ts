export type TeamMember = {
  id: string;
  email: string;
  full_name: string;
  role: 'partner' | 'vp' | 'analyst' | 'associate' | 'admin';
  avatar_url: string | null;
  is_active: boolean;
  created_at: string;
  updated_at: string;
};

export type Organization = {
  id: string;
  name: string;
  type: 'biotech' | 'pharma' | 'medtech' | 'diagnostics' | 'digital_health' | 'healthcare' | 'nutraceuticals' | 'family_office' | 'angel' | 'vc' | 'pe' | 'cro' | 'advisory' | 'other';
  stage: 'seed' | 'series_a' | 'series_b' | 'series_c' | 'growth' | 'public' | null;
  therapy_areas: string[];
  indications: string[];
  website: string | null;
  linkedin: string | null;
  hq_city: string | null;
  hq_country: string | null;
  description: string | null;
  employee_count_range: string | null;
  founded_year: number | null;
  lead_asset: string | null;
  lead_asset_phase: string | null;
  last_funding_amount: number | null;
  last_funding_date: string | null;
  total_funding: number | null;
  tags: string[];
  notes: string | null;
  owner_id: string | null;
  targeting_score: number | null;
  targeting_signals: Record<string, unknown> | null;
  created_by: string;
  created_at: string;
  updated_at: string;
};

export type Contact = {
  id: string;
  first_name: string;
  last_name: string;
  email: string | null;
  phone: string | null;
  title: string | null;
  organization_id: string | null;
  contact_type: 'executive' | 'founder' | 'investor' | 'advisor' | 'board_member' | 'operator';
  linkedin: string | null;
  therapy_area_expertise: string[];
  relationship_strength: 'warm_intro' | 'direct' | 'met_once' | 'cold';
  relationship_owner_id: string | null;
  last_contacted_at: string | null;
  notes: string | null;
  tags: string[];
  created_by: string;
  created_at: string;
  updated_at: string;
};

export type Deal = {
  id: string;
  title: string;
  deal_type: 'ma' | 'licensing' | 'partnership' | 'fundraising' | 'co_development';
  stage: 'sourcing' | 'initial_review' | 'due_diligence' | 'negotiation' | 'closing' | 'closed_won' | 'closed_lost';
  priority: 'critical' | 'high' | 'medium' | 'low';
  company_id: string;
  counterparty_ids: string[];
  estimated_value: number | null;
  upfront_amount: number | null;
  milestone_amount: number | null;
  royalty_range: string | null;
  therapy_area: string | null;
  indication: string | null;
  modality: string | null;
  development_stage: string | null;
  scorecard: Record<string, unknown> | null;
  confidentiality_level: 'public' | 'confidential' | 'highly_confidential';
  lead_advisor_id: string | null;
  team_member_ids: string[];
  sourced_at: string | null;
  expected_close_date: string | null;
  actual_close_date: string | null;
  tags: string[];
  notes: string | null;
  created_by: string;
  created_at: string;
  updated_at: string;
};

export type DealStageHistory = {
  id: string;
  deal_id: string;
  from_stage: string | null;
  to_stage: string;
  changed_by: string;
  notes: string | null;
  changed_at: string;
};

export type Project = {
  id: string;
  name: string;
  client_org_id: string;
  deal_id: string | null;
  project_type: 'strategy' | 'market_assessment' | 'partner_search' | 'due_diligence' | 'valuation' | 'fundraising_support';
  status: 'planning' | 'active' | 'on_hold' | 'completed' | 'cancelled';
  start_date: string | null;
  target_end_date: string | null;
  actual_end_date: string | null;
  budget: number | null;
  description: string | null;
  lead_id: string;
  team_member_ids: string[];
  deliverables: Record<string, unknown> | null;
  milestones: Record<string, unknown> | null;
  tags: string[];
  created_by: string;
  created_at: string;
  updated_at: string;
};

export type Task = {
  id: string;
  title: string;
  description: string | null;
  project_id: string | null;
  deal_id: string | null;
  assigned_to: string | null;
  status: 'todo' | 'in_progress' | 'review' | 'done';
  priority: 'urgent' | 'high' | 'medium' | 'low';
  due_date: string | null;
  completed_at: string | null;
  tags: string[];
  created_by: string;
  created_at: string;
  updated_at: string;
};

export type Activity = {
  id: string;
  activity_type: 'email' | 'meeting' | 'call' | 'note' | 'document_shared' | 'intro_made' | 'deal_update';
  subject: string;
  body: string | null;
  organization_id: string | null;
  contact_id: string | null;
  deal_id: string | null;
  project_id: string | null;
  participant_contact_ids: string[];
  team_member_id: string;
  occurred_at: string;
  duration_minutes: number | null;
  is_pinned: boolean;
  metadata: Record<string, unknown> | null;
  created_at: string;
};

export type InvestorProfile = {
  id: string;
  organization_id: string;
  investor_type: 'family_office' | 'angel' | 'seed_vc' | 'early_vc' | 'growth_vc' | 'pe' | 'crossover' | 'strategic';
  therapy_area_focus: string[];
  stage_focus: string[];
  modality_preferences: string[];
  geography_focus: string[];
  check_size_min: number | null;
  check_size_max: number | null;
  typical_check: number | null;
  deals_per_year: number | null;
  recent_investments: Record<string, unknown> | null;
  portfolio_companies: string[];
  board_seat_required: boolean;
  lead_preference: 'lead_only' | 'co_lead' | 'follow' | 'any';
  notes: string | null;
  last_updated: string;
};

export type ResearchNote = {
  id: string;
  title: string;
  content: string;
  note_type: 'company_deep_dive' | 'market_memo' | 'competitive_intel' | 'deal_thesis' | 'meeting_summary' | 'sector_overview';
  organization_id: string | null;
  deal_id: string | null;
  ai_generated: boolean;
  ai_sources: Record<string, unknown> | null;
  therapy_area: string | null;
  tags: string[];
  is_pinned: boolean;
  author_id: string;
  created_at: string;
  updated_at: string;
};

export type Document = {
  id: string;
  name: string;
  file_path: string;
  file_size: number | null;
  mime_type: string | null;
  document_type: 'term_sheet' | 'cim' | 'pitch_deck' | 'financial_model' | 'dd_report' | 'memo' | 'other';
  organization_id: string | null;
  deal_id: string | null;
  project_id: string | null;
  uploaded_by: string;
  confidentiality_level: 'public' | 'confidential' | 'highly_confidential';
  tags: string[];
  created_at: string;
};

export type Fee = {
  id: string;
  project_id: string | null;
  deal_id: string | null;
  fee_type: 'retainer' | 'success' | 'project';
  amount: number;
  status: 'pending' | 'invoiced' | 'paid' | 'overdue';
  due_date: string | null;
  paid_date: string | null;
  description: string | null;
  created_by: string;
  created_at: string;
  updated_at: string;
};

export type AuditLog = {
  id: string;
  user_id: string;
  action: 'create' | 'update' | 'delete' | 'view' | 'export';
  entity_type: string;
  entity_id: string;
  changes: Record<string, unknown> | null;
  ip_address: string | null;
  created_at: string;
};
