-- 007_activities.sql
-- Activity log: emails, meetings, calls, notes, intros

CREATE TABLE public.activities (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  activity_type TEXT NOT NULL
    CHECK (activity_type IN ('email', 'meeting', 'call', 'note', 'document_shared', 'intro_made', 'deal_update')),
  subject TEXT,
  body TEXT,
  organization_id UUID REFERENCES public.organizations(id) ON DELETE SET NULL,
  contact_id UUID REFERENCES public.contacts(id) ON DELETE SET NULL,
  deal_id UUID REFERENCES public.deals(id) ON DELETE SET NULL,
  project_id UUID,  -- FK added after projects table is created
  participant_contact_ids UUID[] DEFAULT '{}',
  team_member_id UUID REFERENCES public.team_members(id),
  occurred_at TIMESTAMPTZ DEFAULT NOW(),
  duration_minutes INTEGER,
  is_pinned BOOLEAN DEFAULT FALSE,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes
CREATE INDEX idx_activities_organization_id ON public.activities(organization_id);
CREATE INDEX idx_activities_contact_id ON public.activities(contact_id);
CREATE INDEX idx_activities_deal_id ON public.activities(deal_id);
CREATE INDEX idx_activities_occurred_at ON public.activities(occurred_at DESC);

ALTER TABLE public.activities ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated users can view activities"
  ON public.activities FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Authenticated users can create activities"
  ON public.activities FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Author can update their activities"
  ON public.activities FOR UPDATE
  TO authenticated
  USING (team_member_id = auth.uid());
