-- 011_fees.sql
-- Fee tracking for projects and deals

CREATE TABLE public.fees (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  project_id UUID REFERENCES public.projects(id),
  deal_id UUID REFERENCES public.deals(id),
  fee_type TEXT NOT NULL
    CHECK (fee_type IN ('retainer', 'success', 'project')),
  amount BIGINT NOT NULL,
  status TEXT DEFAULT 'pending'
    CHECK (status IN ('pending', 'invoiced', 'paid', 'overdue')),
  due_date DATE,
  paid_date DATE,
  description TEXT,
  created_by UUID REFERENCES public.team_members(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_fees_project_id ON public.fees(project_id);
CREATE INDEX idx_fees_deal_id ON public.fees(deal_id);
CREATE INDEX idx_fees_status ON public.fees(status);

ALTER TABLE public.fees ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Partners and admins can view fees"
  ON public.fees FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.team_members
      WHERE id = auth.uid() AND role IN ('admin', 'partner', 'vp')
    )
  );

CREATE POLICY "Partners and admins can create fees"
  ON public.fees FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.team_members
      WHERE id = auth.uid() AND role IN ('admin', 'partner')
    )
  );

CREATE POLICY "Partners and admins can update fees"
  ON public.fees FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.team_members
      WHERE id = auth.uid() AND role IN ('admin', 'partner')
    )
  );

CREATE POLICY "Partners and admins can delete fees"
  ON public.fees FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.team_members
      WHERE id = auth.uid() AND role IN ('admin', 'partner')
    )
  );
