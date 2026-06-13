import api from './organizationApi';

export interface SiteSummaryData {
  id?: string;
  organizationId: string;
  title: string;
  timezone: string;
  hoursOfOperation: string;
  notes: string;
  primaryContactId?: string;
  primaryContactName?: string;
  emergencyContact1Id?: string;
  emergencyContact1Name?: string;
  emergencyContact2Id?: string;
  emergencyContact2Name?: string;
  authorizationContactId?: string;
  authorizationContactName?: string;
  isArchived: boolean;
  archivedAt?: string;
  archivedBy?: string;
  createdAt?: string;
  updatedAt?: string;
  createdBy?: string;
  updatedBy?: string;
  locationCount?: number;
  passwordCount?: number;
  documentCount?: number;
  assetCount?: number;
}

export interface SiteSummaryRevision {
  id: string;
  siteSummaryId: string;
  beforeState?: string;
  afterState?: string;
  changedBy?: string;
  changedByName?: string;
  changedAt: string;
}

export interface PageResponse<T> {
  content: T[];
  totalElements: number;
  totalPages: number;
  number: number;
  size: number;
  first: boolean;
  last: boolean;
}

const MOCK_SITE_SUMMARY_KEY = 'mmv_mock_sites';

function getMockSiteSummaries(): SiteSummaryData[] {
  const data = localStorage.getItem(MOCK_SITE_SUMMARY_KEY);
  if (!data) {
    const initial: SiteSummaryData[] = [
      {
        id: '11111111-1111-1111-1111-111111111111',
        organizationId: 'b0000000-0000-0000-0000-000000000001',
        title: 'Primary Headquarters',
        timezone: 'America/New_York',
        hoursOfOperation: '09:00 - 17:00',
        notes: 'Corporate headquarters located in central business district. Security card access required after hours.',
        primaryContactId: 'c0000000-0000-0000-0000-000000000001',
        primaryContactName: 'John Doe',
        emergencyContact1Id: 'c0000000-0000-0000-0000-000000000002',
        emergencyContact1Name: 'Jane Smith',
        authorizationContactId: 'c0000000-0000-0000-0000-000000000003',
        authorizationContactName: 'Bob Johnson',
        isArchived: false,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        locationCount: 3,
        passwordCount: 12,
        documentCount: 5,
        assetCount: 24,
      }
    ];
    localStorage.setItem(MOCK_SITE_SUMMARY_KEY, JSON.stringify(initial));
    return initial;
  }
  return JSON.parse(data);
}

function saveMockSiteSummaries(summaries: SiteSummaryData[]) {
  localStorage.setItem(MOCK_SITE_SUMMARY_KEY, JSON.stringify(summaries));
}

export const siteSummaryApi = {
  listSites: async (
    orgId: string,
    params: {
      isArchived?: boolean;
      search?: string;
      page?: number;
      size?: number;
      sortBy?: string;
      sortDir?: string;
    } = {}
  ): Promise<PageResponse<SiteSummaryData>> => {
    if (localStorage.getItem('demoMode') === 'true') {
      await new Promise((r) => setTimeout(r, 200));
      let list = getMockSiteSummaries().filter(
        (s) => s.organizationId === orgId && s.isArchived === (params.isArchived ?? false)
      );
      if (params.search) {
        const query = params.search.toLowerCase();
        list = list.filter(
          (s) =>
            s.title.toLowerCase().includes(query) ||
            s.notes.toLowerCase().includes(query)
        );
      }
      return {
        content: list,
        totalElements: list.length,
        totalPages: 1,
        number: params.page ?? 0,
        size: params.size ?? 10,
        first: true,
        last: true,
      };
    }
    const { data } = await api.get<PageResponse<SiteSummaryData>>('/sites', {
      params: {
        organizationId: orgId,
        isArchived: params.isArchived ?? false,
        search: params.search || undefined,
        page: params.page ?? 0,
        size: params.size ?? 10,
        sortBy: params.sortBy || 'title',
        sortDir: params.sortDir || 'asc',
      },
    });
    return data;
  },

  getSiteSummary: async (id: string): Promise<SiteSummaryData> => {
    if (localStorage.getItem('demoMode') === 'true') {
      await new Promise((r) => setTimeout(r, 200));
      const list = getMockSiteSummaries();
      const item = list.find((s) => s.id === id);
      if (!item) throw { response: { status: 404 } };
      return item;
    }
    const { data } = await api.get<SiteSummaryData>(`/sites/${id}`);
    return data;
  },

  createSiteSummary: async (payload: Omit<SiteSummaryData, 'id' | 'isArchived' | 'updatedAt' | 'createdAt'>): Promise<SiteSummaryData> => {
    if (localStorage.getItem('demoMode') === 'true') {
      await new Promise((r) => setTimeout(r, 200));
      const list = getMockSiteSummaries();
      const newItem: SiteSummaryData = {
        ...payload,
        id: crypto.randomUUID(),
        isArchived: false,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        locationCount: 0,
        passwordCount: 0,
        documentCount: 0,
        assetCount: 0,
      };
      list.push(newItem);
      saveMockSiteSummaries(list);
      return newItem;
    }
    const { data } = await api.post<SiteSummaryData>('/sites', payload);
    return data;
  },

  updateSiteSummary: async (id: string, payload: Partial<Omit<SiteSummaryData, 'id' | 'organizationId'>>): Promise<SiteSummaryData> => {
    if (localStorage.getItem('demoMode') === 'true') {
      await new Promise((r) => setTimeout(r, 200));
      const list = getMockSiteSummaries();
      const idx = list.findIndex((s) => s.id === id);
      if (idx === -1) throw new Error('SiteSummary not found');
      const updated = {
        ...list[idx],
        ...payload,
        updatedAt: new Date().toISOString(),
      };
      list[idx] = updated;
      saveMockSiteSummaries(list);
      return updated;
    }
    const { data } = await api.put<SiteSummaryData>(`/sites/${id}`, payload);
    return data;
  },

  archiveSiteSummary: async (id: string): Promise<SiteSummaryData> => {
    if (localStorage.getItem('demoMode') === 'true') {
      await new Promise((r) => setTimeout(r, 200));
      const list = getMockSiteSummaries();
      const idx = list.findIndex((s) => s.id === id);
      if (idx === -1) throw new Error('SiteSummary not found');
      list[idx].isArchived = true;
      list[idx].archivedAt = new Date().toISOString();
      list[idx].updatedAt = new Date().toISOString();
      saveMockSiteSummaries(list);
      return list[idx];
    }
    const { data } = await api.post<SiteSummaryData>(`/sites/${id}/archive`);
    return data;
  },

  restoreSiteSummary: async (id: string): Promise<SiteSummaryData> => {
    if (localStorage.getItem('demoMode') === 'true') {
      await new Promise((r) => setTimeout(r, 200));
      const list = getMockSiteSummaries();
      const idx = list.findIndex((s) => s.id === id);
      if (idx === -1) throw new Error('SiteSummary not found');
      list[idx].isArchived = false;
      list[idx].archivedAt = undefined;
      list[idx].updatedAt = new Date().toISOString();
      saveMockSiteSummaries(list);
      return list[idx];
    }
    const { data } = await api.post<SiteSummaryData>(`/sites/${id}/restore`);
    return data;
  },

  deleteSiteSummary: async (id: string): Promise<void> => {
    if (localStorage.getItem('demoMode') === 'true') {
      await new Promise((r) => setTimeout(r, 200));
      const list = getMockSiteSummaries();
      const filtered = list.filter((s) => s.id !== id);
      saveMockSiteSummaries(filtered);
      return;
    }
    await api.delete(`/sites/${id}`);
  },

  cloneSiteSummary: async (id: string): Promise<SiteSummaryData> => {
    if (localStorage.getItem('demoMode') === 'true') {
      await new Promise((r) => setTimeout(r, 200));
      const list = getMockSiteSummaries();
      const item = list.find((s) => s.id === id);
      if (!item) throw new Error('SiteSummary not found');
      const cloned: SiteSummaryData = {
        ...item,
        id: crypto.randomUUID(),
        title: `${item.title} - Copy`,
        isArchived: false,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      list.push(cloned);
      saveMockSiteSummaries(list);
      return cloned;
    }
    const { data } = await api.post<SiteSummaryData>(`/sites/${id}/clone`);
    return data;
  },

  getRevisions: async (id: string): Promise<SiteSummaryRevision[]> => {
    if (localStorage.getItem('demoMode') === 'true') {
      await new Promise((r) => setTimeout(r, 100));
      return [];
    }
    const { data } = await api.get<SiteSummaryRevision[]>(`/sites/${id}/revisions`);
    return data;
  },

  restoreRevision: async (id: string, revisionId: string): Promise<SiteSummaryData> => {
    if (localStorage.getItem('demoMode') === 'true') {
      throw new Error('Restore revision not supported in demo mode');
    }
    const { data } = await api.post<SiteSummaryData>(`/sites/${id}/revisions/${revisionId}/restore`);
    return data;
  },
};
