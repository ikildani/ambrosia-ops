-- 009_investor_profiles.sql
-- Extended investor data for organizations of investor type

CREATE TABLE public.investor_profiles (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  organization_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE UNIQUE,
  investor_type TEXT NOT NULL
    CHECK (investor_type IN ('family_office', 'angel', 'seed_vc', 'early_vc', 'growth_vc', 'pe', 'crossover', 'strategic')),
  therapy_area_focus TEXT[] DEFAULT '{}',
  stage_focus TEXT[] DEFAULT '{}',
  modality_preferences TEXT[] DEFAULT '{}',
  geography_focus TEXT[] DEFAULT '{}',
  check_size_min BIGINT,
  check_size_max BIGINT,
  typical_check BIGINT,
  deals_per_year INTEGER,
  recent_investments JSONB DEFAULT '[]',
  portfolio_companies TEXT[] DEFAULT '{}',
  board_seat_required BOOLEAN DEFAULT FALSE,
  lead_preference TEXT
    CHECK (lead_preference IN ('lead_only', 'co_lead', 'follow', 'any')),
  notes TEXT,
  last_updated TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_investor_profiles_org_id ON public.investor_profiles(organization_id);

ALTER TABLE public.investor_profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated users can view investor profiles"
  ON public.investor_profiles FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Authenticated users can create investor profiles"
  ON public.investor_profiles FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Authenticated users can update investor profiles"
  ON public.investor_profiles FOR UPDATE
  TO authenticated
  USING (true);
