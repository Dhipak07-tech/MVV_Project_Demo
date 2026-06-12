import api from './organizationApi';

export interface SiteSummaryData {
  id?: string;
  organizationId: string;
  title: string;
  timezone: string;
  businessHours: string;
  notes: string;
  primaryContactId?: string;
  emergencyContactId?: string;
  authorizationContactId?: string;
  active: boolean;
  updatedAt?: string;
  updatedBy?: string;
}

const MOCK_SITE_SUMMARY_KEY = 'mmv_mock_site_summaries';

function getMockSiteSummaries(): SiteSummaryData[] {
  const data = localStorage.getItem(MOCK_SITE_SUMMARY_KEY);
  if (!data) {
    const initial: SiteSummaryData[] = [
      {
        id: '11111111-1111-1111-1111-111111111111',
        organizationId: 'b0000000-0000-0000-0000-000000000001',
        title: 'Primary Headquarters',
        timezone: 'America/New_York',
        businessHours: '09:00 - 17:00',
        notes: 'Corporate headquarters located in central business district. Security card access required after hours.',
        primaryContactId: 'c0000000-0000-0000-0000-000000000001',
        emergencyContactId: 'c0000000-0000-0000-0000-000000000002',
        authorizationContactId: 'c0000000-0000-0000-0000-000000000003',
        active: true,
        updatedAt: new Date().toISOString(),
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
  getSiteSummary: async (orgId: string): Promise<SiteSummaryData> => {
    if (localStorage.getItem('demoMode') === 'true') {
      await new Promise((r) => setTimeout(r, 200));
      const list = getMockSiteSummaries();
      const item = list.find((s) => s.organizationId === orgId);
      if (!item) {
        throw { response: { status: 404 } };
      }
      return item;
    }
    const { data } = await api.get<SiteSummaryData>(`/site-summary/${orgId}`);
    return data;
  },

  createSiteSummary: async (payload: Omit<SiteSummaryData, 'id' | 'updatedAt' | 'updatedBy'>): Promise<SiteSummaryData> => {
    if (localStorage.getItem('demoMode') === 'true') {
      await new Promise((r) => setTimeout(r, 200));
      const list = getMockSiteSummaries();
      // Enforce unique SiteSummary per Org
      const exists = list.some((s) => s.organizationId === payload.organizationId);
      if (exists) {
        throw new Error('SiteSummary already exists for this organization');
      }
      const newItem: SiteSummaryData = {
        ...payload,
        id: crypto.randomUUID(),
        updatedAt: new Date().toISOString(),
      };
      list.push(newItem);
      saveMockSiteSummaries(list);
      return newItem;
    }
    const { data } = await api.post<SiteSummaryData>('/site-summary', payload);
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
    const { data } = await api.put<SiteSummaryData>(`/site-summary/${id}`, payload);
    return data;
  },

  archiveSiteSummary: async (id: string): Promise<SiteSummaryData> => {
    if (localStorage.getItem('demoMode') === 'true') {
      await new Promise((r) => setTimeout(r, 200));
      const list = getMockSiteSummaries();
      const idx = list.findIndex((s) => s.id === id);
      if (idx === -1) throw new Error('SiteSummary not found');
      list[idx].active = false;
      list[idx].updatedAt = new Date().toISOString();
      saveMockSiteSummaries(list);
      return list[idx];
    }
    const { data } = await api.put<SiteSummaryData>(`/site-summary/${id}/archive`);
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
    await api.delete(`/site-summary/${id}`);
  },
};
