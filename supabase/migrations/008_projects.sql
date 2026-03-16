-- 008_projects.sql
-- Projects and tasks for engagement delivery

CREATE TABLE public.projects (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  client_org_id UUID REFERENCES public.organizations(id),
  deal_id UUID REFERENCES public.deals(id),
  project_type TEXT NOT NULL
    CHECK (project_type IN ('strategy', 'market_assessment', 'partner_search', 'due_diligence', 'valuation', 'fundraising_support')),
  status TEXT DEFAULT 'active'
    CHECK (status IN ('planning', 'active', 'on_hold', 'completed', 'cancelled')),
  start_date DATE,
  target_end_date DATE,
  actual_end_date DATE,
  budget BIGINT,
  description TEXT,
  lead_id UUID REFERENCES public.team_members(id),
  team_member_ids UUID[] DEFAULT '{}',
  deliverables JSONB DEFAULT '[]',
  milestones JSONB DEFAULT '[]',
  tags TEXT[] DEFAULT '{}',
  created_by UUID REFERENCES public.team_members(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE public.tasks (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT,
  project_id UUID REFERENCES public.projects(id) ON DELETE CASCADE,
  deal_id UUID REFERENCES public.deals(id) ON DELETE SET NULL,
  assigned_to UUID REFERENCES public.team_members(id),
  status TEXT DEFAULT 'todo'
    CHECK (status IN ('todo', 'in_progress', 'review', 'done')),
  priority TEXT DEFAULT 'medium'
    CHECK (priority IN ('urgent', 'high', 'medium', 'low')),
  due_date DATE,
  completed_at TIMESTAMPTZ,
  tags TEXT[] DEFAULT '{}',
  created_by UUID REFERENCES public.team_members(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Add FK from activities to projects now that the table exists
ALTER TABLE public.activities
  ADD CONSTRAINT fk_activities_project_id
  FOREIGN KEY (project_id) REFERENCES public.projects(id) ON DELETE SET NULL;

-- Indexes
CREATE INDEX idx_projects_client_org_id ON public.projects(client_org_id);
CREATE INDEX idx_projects_deal_id ON public.projects(deal_id);
CREATE INDEX idx_projects_lead_id ON public.projects(lead_id);
CREATE INDEX idx_tasks_project_id ON public.tasks(project_id);
CREATE INDEX idx_tasks_assigned_to ON public.tasks(assigned_to);
CREATE INDEX idx_tasks_status ON public.tasks(status);

-- RLS: Projects
ALTER TABLE public.projects ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated users can view projects"
  ON public.projects FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Authenticated users can create projects"
  ON public.projects FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Lead or admin can update projects"
  ON public.projects FOR UPDATE
  TO authenticated
  USING (
    lead_id = auth.uid()
    OR created_by = auth.uid()
    OR EXISTS (
      SELECT 1 FROM public.team_members
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

CREATE POLICY "Lead or admin can delete projects"
  ON public.projects FOR DELETE
  TO authenticated
  USING (
    lead_id = auth.uid()
    OR created_by = auth.uid()
    OR EXISTS (
      SELECT 1 FROM public.team_members
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- RLS: Tasks
ALTER TABLE public.tasks ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated users can view tasks"
  ON public.tasks FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Authenticated users can create tasks"
  ON public.tasks FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Assignee or admin can update tasks"
  ON public.tasks FOR UPDATE
  TO authenticated
  USING (
    assigned_to = auth.uid()
    OR created_by = auth.uid()
    OR EXISTS (
      SELECT 1 FROM public.team_members
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

CREATE POLICY "Assignee or admin can delete tasks"
  ON public.tasks FOR DELETE
  TO authenticated
  USING (
    assigned_to = auth.uid()
    OR created_by = auth.uid()
    OR EXISTS (
      SELECT 1 FROM public.team_members
      WHERE id = auth.uid() AND role = 'admin'
    )
  );
