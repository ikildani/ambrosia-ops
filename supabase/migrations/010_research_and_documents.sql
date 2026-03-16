-- 010_research_and_documents.sql
-- Research notes (markdown) and document metadata

CREATE TABLE public.research_notes (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT,
  content TEXT NOT NULL,
  note_type TEXT NOT NULL
    CHECK (note_type IN ('company_deep_dive', 'market_memo', 'competitive_intel', 'deal_thesis', 'meeting_summary', 'sector_overview')),
  organization_id UUID REFERENCES public.organizations(id) ON DELETE SET NULL,
  deal_id UUID REFERENCES public.deals(id) ON DELETE SET NULL,
  ai_generated BOOLEAN DEFAULT FALSE,
  ai_sources JSONB DEFAULT '{}',
  therapy_area TEXT,
  tags TEXT[] DEFAULT '{}',
  is_pinned BOOLEAN DEFAULT FALSE,
  author_id UUID REFERENCES public.team_members(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE public.documents (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  file_path TEXT NOT NULL,
  file_size BIGINT,
  mime_type TEXT,
  document_type TEXT
    CHECK (document_type IN ('term_sheet', 'cim', 'pitch_deck', 'financial_model', 'dd_report', 'memo', 'other')),
  organization_id UUID REFERENCES public.organizations(id) ON DELETE SET NULL,
  deal_id UUID REFERENCES public.deals(id) ON DELETE SET NULL,
  project_id UUID REFERENCES public.projects(id) ON DELETE SET NULL,
  uploaded_by UUID REFERENCES public.team_members(id),
  confidentiality_level TEXT DEFAULT 'confidential'
    CHECK (confidentiality_level IN ('public', 'confidential', 'highly_confidential')),
  tags TEXT[] DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_research_notes_org_id ON public.research_notes(organization_id);
CREATE INDEX idx_research_notes_deal_id ON public.research_notes(deal_id);
CREATE INDEX idx_research_notes_author_id ON public.research_notes(author_id);
CREATE INDEX idx_documents_org_id ON public.documents(organization_id);
CREATE INDEX idx_documents_deal_id ON public.documents(deal_id);
CREATE INDEX idx_documents_project_id ON public.documents(project_id);

ALTER TABLE public.research_notes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated users can view research notes"
  ON public.research_notes FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Authenticated users can create research notes"
  ON public.research_notes FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Author or admin can update research notes"
  ON public.research_notes FOR UPDATE
  TO authenticated
  USING (
    author_id = auth.uid()
    OR EXISTS (
      SELECT 1 FROM public.team_members
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

CREATE POLICY "Author or admin can delete research notes"
  ON public.research_notes FOR DELETE
  TO authenticated
  USING (
    author_id = auth.uid()
    OR EXISTS (
      SELECT 1 FROM public.team_members
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

ALTER TABLE public.documents ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated users can view documents"
  ON public.documents FOR SELECT
  TO authenticated
  USING (
    confidentiality_level != 'highly_confidential'
    OR uploaded_by = auth.uid()
    OR EXISTS (
      SELECT 1 FROM public.team_members
      WHERE id = auth.uid() AND role IN ('admin', 'partner')
    )
    OR EXISTS (
      SELECT 1 FROM public.deals d
      WHERE d.id = deal_id
        AND (d.lead_advisor_id = auth.uid() OR auth.uid() = ANY(d.team_member_ids))
    )
  );

CREATE POLICY "Authenticated users can upload documents"
  ON public.documents FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Uploader or admin can update documents"
  ON public.documents FOR UPDATE
  TO authenticated
  USING (
    uploaded_by = auth.uid()
    OR EXISTS (
      SELECT 1 FROM public.team_members
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

CREATE POLICY "Uploader or admin can delete documents"
  ON public.documents FOR DELETE
  TO authenticated
  USING (
    uploaded_by = auth.uid()
    OR EXISTS (
      SELECT 1 FROM public.team_members
      WHERE id = auth.uid() AND role = 'admin'
    )
  );
