-- 012_enrichment_and_audit.sql
-- Enrichment cache and audit log

CREATE TABLE public.enrichment_cache (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  source TEXT NOT NULL,
  source_id TEXT,
  entity_type TEXT NOT NULL,
  entity_id UUID,
  data JSONB NOT NULL,
  fetched_at TIMESTAMPTZ DEFAULT NOW(),
  expires_at TIMESTAMPTZ DEFAULT (NOW() + INTERVAL '24 hours'),
  UNIQUE(source, source_id, entity_type)
);

CREATE TABLE public.audit_log (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES public.team_members(id),
  action TEXT NOT NULL
    CHECK (action IN ('create', 'update', 'delete', 'view', 'export')),
  entity_type TEXT NOT NULL,
  entity_id UUID,
  changes JSONB,
  ip_address TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_enrichment_cache_lookup ON public.enrichment_cache(source, source_id, entity_type);
CREATE INDEX idx_enrichment_cache_entity ON public.enrichment_cache(entity_type, entity_id);
CREATE INDEX idx_enrichment_cache_expires ON public.enrichment_cache(expires_at);
CREATE INDEX idx_audit_log_entity ON public.audit_log(entity_type, entity_id);
CREATE INDEX idx_audit_log_user_id ON public.audit_log(user_id);

ALTER TABLE public.enrichment_cache ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated users can view enrichment cache"
  ON public.enrichment_cache FOR SELECT TO authenticated USING (true);

CREATE POLICY "Authenticated users can insert enrichment cache"
  ON public.enrichment_cache FOR INSERT TO authenticated WITH CHECK (true);

CREATE POLICY "Authenticated users can update enrichment cache"
  ON public.enrichment_cache FOR UPDATE TO authenticated USING (true);

ALTER TABLE public.audit_log ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Partners and admins can view audit log"
  ON public.audit_log FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.team_members
      WHERE id = auth.uid() AND role IN ('admin', 'partner')
    )
  );

CREATE POLICY "All authenticated users can insert audit log"
  ON public.audit_log FOR INSERT TO authenticated WITH CHECK (true);
