import { useQuery } from '@tanstack/react-query';
import type { Organization, Contact, Deal, Activity, ResearchNote, Project, Task } from '@/types/database';

type Pagination = {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
};

type PaginatedResponse<T> = {
  data: T[];
  pagination: Pagination;
};

async function fetchApi<T>(url: string): Promise<PaginatedResponse<T>> {
  const res = await fetch(url);
  if (!res.ok) {
    const err = await res.json().catch(() => ({ error: 'Request failed' }));
    throw new Error(err.error || `HTTP ${res.status}`);
  }
  return res.json();
}

export function useOrganizations(params?: {
  type?: string;
  therapy_area?: string;
  search?: string;
  page?: number;
  limit?: number;
}) {
  const searchParams = new URLSearchParams();
  if (params?.type && params.type !== 'all') searchParams.set('type', params.type);
  if (params?.therapy_area) searchParams.set('therapy_area', params.therapy_area);
  if (params?.search) searchParams.set('search', params.search);
  if (params?.page) searchParams.set('page', String(params.page));
  if (params?.limit) searchParams.set('limit', String(params.limit));

  const qs = searchParams.toString();
  return useQuery({
    queryKey: ['organizations', qs],
    queryFn: () => fetchApi<Organization>(`/api/organizations${qs ? `?${qs}` : ''}`),
  });
}

export function useContacts(params?: {
  organization_id?: string;
  contact_type?: string;
  search?: string;
  page?: number;
  limit?: number;
}) {
  const searchParams = new URLSearchParams();
  if (params?.organization_id) searchParams.set('organization_id', params.organization_id);
  if (params?.contact_type && params.contact_type !== 'all') searchParams.set('contact_type', params.contact_type);
  if (params?.search) searchParams.set('search', params.search);
  if (params?.page) searchParams.set('page', String(params.page));
  if (params?.limit) searchParams.set('limit', String(params.limit));

  const qs = searchParams.toString();
  return useQuery({
    queryKey: ['contacts', qs],
    queryFn: () => fetchApi<Contact & { organizations?: { id: string; name: string } }>(`/api/contacts${qs ? `?${qs}` : ''}`),
  });
}

export function useDeals(params?: {
  stage?: string;
  deal_type?: string;
  therapy_area?: string;
  search?: string;
  page?: number;
  limit?: number;
}) {
  const searchParams = new URLSearchParams();
  if (params?.stage) searchParams.set('stage', params.stage);
  if (params?.deal_type) searchParams.set('deal_type', params.deal_type);
  if (params?.therapy_area) searchParams.set('therapy_area', params.therapy_area);
  if (params?.search) searchParams.set('search', params.search);
  if (params?.page) searchParams.set('page', String(params.page));
  if (params?.limit) searchParams.set('limit', String(params.limit));

  const qs = searchParams.toString();
  return useQuery({
    queryKey: ['deals', qs],
    queryFn: () => fetchApi<Deal & { organizations?: { id: string; name: string } }>(`/api/deals${qs ? `?${qs}` : ''}`),
  });
}

export function useActivities(params?: {
  organization_id?: string;
  contact_id?: string;
  deal_id?: string;
  project_id?: string;
  page?: number;
  limit?: number;
}) {
  const searchParams = new URLSearchParams();
  if (params?.organization_id) searchParams.set('organization_id', params.organization_id);
  if (params?.contact_id) searchParams.set('contact_id', params.contact_id);
  if (params?.deal_id) searchParams.set('deal_id', params.deal_id);
  if (params?.project_id) searchParams.set('project_id', params.project_id);
  if (params?.page) searchParams.set('page', String(params.page));
  if (params?.limit) searchParams.set('limit', String(params.limit));

  const qs = searchParams.toString();
  return useQuery({
    queryKey: ['activities', qs],
    queryFn: () => fetchApi<Activity>(`/api/activities${qs ? `?${qs}` : ''}`),
  });
}

export function useResearchNotes(params?: {
  search?: string;
  note_type?: string;
  page?: number;
  limit?: number;
}) {
  const searchParams = new URLSearchParams();
  if (params?.search) searchParams.set('search', params.search);
  if (params?.note_type && params.note_type !== 'all') searchParams.set('note_type', params.note_type);
  if (params?.page) searchParams.set('page', String(params.page));
  if (params?.limit) searchParams.set('limit', String(params.limit));

  const qs = searchParams.toString();
  return useQuery({
    queryKey: ['research_notes', qs],
    queryFn: () => fetchApi<ResearchNote>(`/api/research${qs ? `?${qs}` : ''}`),
  });
}

export function useProjects(params?: {
  status?: string;
  search?: string;
  page?: number;
  limit?: number;
}) {
  const searchParams = new URLSearchParams();
  if (params?.status && params.status !== 'all') searchParams.set('status', params.status);
  if (params?.search) searchParams.set('search', params.search);
  if (params?.page) searchParams.set('page', String(params.page));
  if (params?.limit) searchParams.set('limit', String(params.limit));

  const qs = searchParams.toString();
  return useQuery({
    queryKey: ['projects', qs],
    queryFn: () => fetchApi<Project>(`/api/projects${qs ? `?${qs}` : ''}`),
  });
}

export function useTasks(params?: {
  status?: string;
  assigned_to?: string;
  project_id?: string;
  deal_id?: string;
  page?: number;
  limit?: number;
}) {
  const searchParams = new URLSearchParams();
  if (params?.status && params.status !== 'all') searchParams.set('status', params.status);
  if (params?.assigned_to) searchParams.set('assigned_to', params.assigned_to);
  if (params?.project_id) searchParams.set('project_id', params.project_id);
  if (params?.deal_id) searchParams.set('deal_id', params.deal_id);
  if (params?.page) searchParams.set('page', String(params.page));
  if (params?.limit) searchParams.set('limit', String(params.limit));

  const qs = searchParams.toString();
  return useQuery({
    queryKey: ['tasks', qs],
    queryFn: () => fetchApi<Task>(`/api/tasks${qs ? `?${qs}` : ''}`),
  });
}
