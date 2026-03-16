-- 003_organizations.sql
-- Organizations: biotechs, pharma, investors, CROs, advisors

CREATE TABLE public.organizations (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  type TEXT NOT NULL
    CHECK (type IN ('biotech', 'pharma', 'family_office', 'angel', 'vc', 'pe', 'cro', 'advisory', 'other')),
  stage TEXT
    CHECK (stage IN ('seed', 'series_a', 'series_b', 'series_c', 'growth', 'public')),
  therapy_areas TEXT[] DEFAULT '{}',
  indications TEXT[] DEFAULT '{}',
  website TEXT,
  linkedin TEXT,
  hq_city TEXT,
  hq_country TEXT DEFAULT 'US',
  description TEXT,
  logo_url TEXT,
  employee_count_range TEXT,
  founded_year INTEGER,
  lead_asset TEXT,
  lead_asset_phase TEXT,
  last_funding_amount BIGINT,
  last_funding_date DATE,
  total_funding BIGINT,
  tags TEXT[] DEFAULT '{}',
  notes TEXT,
  targeting_score NUMERIC,
  targeting_signals JSONB DEFAULT '{}',
  owner_id UUID REFERENCES public.team_members(id),
  created_by UUID REFERENCES public.team_members(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes
CREATE INDEX idx_organizations_type ON public.organizations(type);
CREATE INDEX idx_organizations_therapy_areas ON public.organizations USING GIN (therapy_areas);
CREATE INDEX idx_organizations_owner_id ON public.organizations(owner_id);
CREATE INDEX idx_organizations_name_trgm ON public.organizations USING GIN (name gin_trgm_ops);

ALTER TABLE public.organizations ENABLE ROW LEVEL SECURITY;

CREATE POLICY "All authenticated users can view organizations"
  ON public.organizations FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Authenticated users can create organizations"
  ON public.organizations FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Owner or admin can update organizations"
  ON public.organizations FOR UPDATE
  TO authenticated
  USING (
    owner_id = auth.uid()
    OR created_by = auth.uid()
    OR EXISTS (
      SELECT 1 FROM public.team_members
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

CREATE POLICY "Owner or admin can delete organizations"
  ON public.organizations FOR DELETE
  TO authenticated
  USING (
    owner_id = auth.uid()
    OR created_by = auth.uid()
    OR EXISTS (
      SELECT 1 FROM public.team_members
      WHERE id = auth.uid() AND role = 'admin'
    )
  );
