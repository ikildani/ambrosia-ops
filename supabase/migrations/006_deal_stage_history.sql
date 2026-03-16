-- 006_deal_stage_history.sql
-- Track deal stage transitions for pipeline analytics

CREATE TABLE public.deal_stage_history (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  deal_id UUID NOT NULL REFERENCES public.deals(id) ON DELETE CASCADE,
  from_stage TEXT,
  to_stage TEXT NOT NULL,
  changed_by UUID REFERENCES public.team_members(id),
  notes TEXT,
  changed_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_deal_stage_history_deal_id ON public.deal_stage_history(deal_id);

ALTER TABLE public.deal_stage_history ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated users can view deal stage history"
  ON public.deal_stage_history FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Authenticated users can insert deal stage history"
  ON public.deal_stage_history FOR INSERT
  TO authenticated
  WITH CHECK (true);
