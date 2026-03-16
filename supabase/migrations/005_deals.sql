-- 005_deals.sql
-- Deals pipeline: M&A, licensing, partnerships, fundraising

CREATE TABLE public.deals (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  deal_type TEXT NOT NULL
    CHECK (deal_type IN ('ma', 'licensing', 'partnership', 'fundraising', 'co_development')),
  stage TEXT NOT NULL DEFAULT 'sourcing'
    CHECK (stage IN ('sourcing', 'initial_review', 'due_diligence', 'negotiation', 'closing', 'closed_won', 'closed_lost')),
  priority TEXT DEFAULT 'medium'
    CHECK (priority IN ('critical', 'high', 'medium', 'low')),
  company_id UUID REFERENCES public.organizations(id),
  counterparty_ids UUID[] DEFAULT '{}',
  estimated_value BIGINT,
  upfront_amount BIGINT,
  milestone_amount BIGINT,
  royalty_range TEXT,
  therapy_area TEXT,
  indication TEXT,
  modality TEXT,
  development_stage TEXT,
  scorecard JSONB DEFAULT '{}',
  benchmarker_scenario_id TEXT,
  benchmarker_valuation_data JSONB DEFAULT '{}',
  terrain_report_id TEXT,
  terrain_market_data JSONB DEFAULT '{}',
  confidentiality_level TEXT DEFAULT 'confidential'
    CHECK (confidentiality_level IN ('public', 'confidential', 'highly_confidential')),
  lead_advisor_id UUID REFERENCES public.team_members(id),
  team_member_ids UUID[] DEFAULT '{}',
  sourced_at DATE DEFAULT CURRENT_DATE,
  expected_close_date DATE,
  actual_close_date DATE,
  tags TEXT[] DEFAULT '{}',
  notes TEXT,
  created_by UUID REFERENCES public.team_members(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes
CREATE INDEX idx_deals_stage ON public.deals(stage);
CREATE INDEX idx_deals_company_id ON public.deals(company_id);
CREATE INDEX idx_deals_therapy_area ON public.deals(therapy_area);
CREATE INDEX idx_deals_lead_advisor_id ON public.deals(lead_advisor_id);

ALTER TABLE public.deals ENABLE ROW LEVEL SECURITY;

-- SELECT: all authenticated can see public/confidential; highly_confidential only for lead, team, partners, admins
CREATE POLICY "Authenticated users can view deals"
  ON public.deals FOR SELECT
  TO authenticated
  USING (
    confidentiality_level != 'highly_confidential'
    OR lead_advisor_id = auth.uid()
    OR auth.uid() = ANY(team_member_ids)
    OR EXISTS (
      SELECT 1 FROM public.team_members
      WHERE id = auth.uid() AND role IN ('admin', 'partner')
    )
  );

CREATE POLICY "Authenticated users can create deals"
  ON public.deals FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Lead advisor or admin can update deals"
  ON public.deals FOR UPDATE
  TO authenticated
  USING (
    lead_advisor_id = auth.uid()
    OR created_by = auth.uid()
    OR EXISTS (
      SELECT 1 FROM public.team_members
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

CREATE POLICY "Lead advisor or admin can delete deals"
  ON public.deals FOR DELETE
  TO authenticated
  USING (
    lead_advisor_id = auth.uid()
    OR created_by = auth.uid()
    OR EXISTS (
      SELECT 1 FROM public.team_members
      WHERE id = auth.uid() AND role = 'admin'
    )
  );
