-- 004_contacts.sql
-- Contacts: people linked to organizations

CREATE TABLE public.contacts (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  first_name TEXT NOT NULL,
  last_name TEXT NOT NULL,
  email TEXT,
  phone TEXT,
  title TEXT,
  organization_id UUID REFERENCES public.organizations(id) ON DELETE SET NULL,
  contact_type TEXT DEFAULT 'executive'
    CHECK (contact_type IN ('executive', 'founder', 'investor', 'advisor', 'board_member', 'operator')),
  linkedin TEXT,
  therapy_area_expertise TEXT[] DEFAULT '{}',
  relationship_strength TEXT DEFAULT 'cold'
    CHECK (relationship_strength IN ('warm_intro', 'direct', 'met_once', 'cold')),
  relationship_owner_id UUID REFERENCES public.team_members(id),
  last_contacted_at TIMESTAMPTZ,
  notes TEXT,
  tags TEXT[] DEFAULT '{}',
  created_by UUID REFERENCES public.team_members(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes
CREATE INDEX idx_contacts_organization_id ON public.contacts(organization_id);
CREATE INDEX idx_contacts_name_trgm ON public.contacts
  USING GIN ((first_name || ' ' || last_name) gin_trgm_ops);

ALTER TABLE public.contacts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "All authenticated users can view contacts"
  ON public.contacts FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Authenticated users can create contacts"
  ON public.contacts FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Relationship owner or admin can update contacts"
  ON public.contacts FOR UPDATE
  TO authenticated
  USING (
    relationship_owner_id = auth.uid()
    OR created_by = auth.uid()
    OR EXISTS (
      SELECT 1 FROM public.team_members
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

CREATE POLICY "Relationship owner or admin can delete contacts"
  ON public.contacts FOR DELETE
  TO authenticated
  USING (
    relationship_owner_id = auth.uid()
    OR created_by = auth.uid()
    OR EXISTS (
      SELECT 1 FROM public.team_members
      WHERE id = auth.uid() AND role = 'admin'
    )
  );
