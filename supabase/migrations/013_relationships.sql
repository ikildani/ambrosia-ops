-- 013_relationships.sql
-- Relationship graph between organizations and contacts

CREATE TABLE public.relationships (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  from_org_id UUID REFERENCES public.organizations(id) ON DELETE CASCADE,
  to_org_id UUID REFERENCES public.organizations(id) ON DELETE CASCADE,
  from_contact_id UUID REFERENCES public.contacts(id) ON DELETE CASCADE,
  to_contact_id UUID REFERENCES public.contacts(id) ON DELETE CASCADE,
  relationship_type TEXT NOT NULL
    CHECK (relationship_type IN (
      'investor_in', 'board_member', 'advisor_to', 'former_colleague',
      'co_investor', 'partner', 'competitor', 'introduced_by'
    )),
  strength TEXT DEFAULT 'medium'
    CHECK (strength IN ('strong', 'medium', 'weak')),
  notes TEXT,
  established_date DATE,
  created_by UUID REFERENCES public.team_members(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  CONSTRAINT relationships_must_have_pair CHECK (
    (from_org_id IS NOT NULL AND to_org_id IS NOT NULL)
    OR (from_contact_id IS NOT NULL AND to_contact_id IS NOT NULL)
  )
);

CREATE INDEX idx_relationships_from_org ON public.relationships(from_org_id);
CREATE INDEX idx_relationships_to_org ON public.relationships(to_org_id);
CREATE INDEX idx_relationships_from_contact ON public.relationships(from_contact_id);
CREATE INDEX idx_relationships_to_contact ON public.relationships(to_contact_id);
CREATE INDEX idx_relationships_type ON public.relationships(relationship_type);

ALTER TABLE public.relationships ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated users can view relationships"
  ON public.relationships FOR SELECT TO authenticated USING (true);

CREATE POLICY "Authenticated users can create relationships"
  ON public.relationships FOR INSERT TO authenticated WITH CHECK (true);

CREATE POLICY "Authenticated users can update relationships"
  ON public.relationships FOR UPDATE TO authenticated USING (true);
