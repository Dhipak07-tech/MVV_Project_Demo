import api from './organizationApi';

export interface AppService {
  id: string;
  organizationId: string;
  name: string;
  type: string;
  provider?: string;
  licenseKey?: string;
  url?: string;
  notes?: string;
  createdAt: string;
  updatedAt: string;
  createdBy?: string;
}

export interface BackupSolution {
  id: string;
  organizationId: string;
  name: string;
  type: string;
  destination?: string;
  frequency?: string;
  retentionPolicy?: string;
  status: string;
  notes?: string;
  createdAt: string;
  updatedAt: string;
  createdBy?: string;
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

const MOCK_APPS_KEY = 'mmv_mock_apps';
const MOCK_BACKUPS_KEY = 'mmv_mock_backups';

function getMockApps(): AppService[] {
  const data = localStorage.getItem(MOCK_APPS_KEY);
  if (!data) {
    const initial: AppService[] = [
      {
        id: '55555555-5555-5555-5555-555555555555',
        organizationId: 'b0000000-0000-0000-0000-000000000001',
        name: 'Corporate Active Directory Domain',
        type: 'active-directory',
        provider: 'Microsoft Windows Server',
        licenseKey: 'W269N-WFGWX-YVC9B-4J6C9-T83GX',
        url: 'wcorp.local',
        notes: 'Domain controllers: DC-01 (10.0.1.10) and DC-02 (10.0.1.11). Active replication configured.',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
      {
        id: '66666666-6666-6666-6666-666666666666',
        organizationId: 'b0000000-0000-0000-0000-000000000001',
        name: 'Microsoft 365 Business Premium',
        type: 'office365',
        provider: 'Microsoft Cloud CSP',
        licenseKey: '50 Licenses - Tier 1 CSP',
        url: 'https://admin.microsoft.com',
        notes: 'Global administrator: admin@weylandcorp.onmicrosoft.com. MFA mandatory for all users.',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      }
    ];
    localStorage.setItem(MOCK_APPS_KEY, JSON.stringify(initial));
    return initial;
  }
  return JSON.parse(data);
}

function saveMockApps(apps: AppService[]) {
  localStorage.setItem(MOCK_APPS_KEY, JSON.stringify(apps));
}

function getMockBackups(): BackupSolution[] {
  const data = localStorage.getItem(MOCK_BACKUPS_KEY);
  if (!data) {
    const initial: BackupSolution[] = [
      {
        id: '77777777-7777-7777-7777-777777777777',
        organizationId: 'b0000000-0000-0000-0000-000000000001',
        name: 'Veeam Backup & Replication Suite',
        type: 'veeam-backups',
        destination: 'Local NAS (192.168.10.40) & Wasabi Cloud Repository',
        frequency: 'Daily Incremental, Weekly Full',
        retentionPolicy: '30 Daily Restore Points, 12 Monthly Archives',
        status: 'Active',
        notes: 'VMware ESXi cluster backup. Veeam console located on MGMT-SRV-01.',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
      {
        id: '88888888-8888-8888-8888-888888888888',
        organizationId: 'b0000000-0000-0000-0000-000000000001',
        name: 'Database Backup Agent',
        type: 'client-backups',
        destination: 'AWS S3 Vault (eu-west-1)',
        frequency: 'Hourly Transaction Logs, Daily Full',
        retentionPolicy: '14 Days Retention',
        status: 'Active',
        notes: 'Automated script backing up prod MSSQL instance directly to encrypted S3 bucket.',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      }
    ];
    localStorage.setItem(MOCK_BACKUPS_KEY, JSON.stringify(initial));
    return initial;
  }
  return JSON.parse(data);
}

function saveMockBackups(backups: BackupSolution[]) {
  localStorage.setItem(MOCK_BACKUPS_KEY, JSON.stringify(backups));
}

export const appsApi = {
  // --- Apps & Services API ---
  listApps: async (orgId: string, type: string, search = '', page = 0, size = 50): Promise<PageResponse<AppService>> => {
    if (localStorage.getItem('demoMode') === 'true') {
      await new Promise((r) => setTimeout(r, 200));
      let list = getMockApps().filter((a) => a.organizationId === orgId && a.type === type);
      if (search) {
        list = list.filter((a) => a.name.toLowerCase().includes(search.toLowerCase()));
      }
      const totalElements = list.length;
      const totalPages = Math.ceil(totalElements / size);
      const content = list.slice(page * size, (page + 1) * size);
      return {
        content,
        totalElements,
        totalPages,
        number: page,
        size,
        first: page === 0,
        last: (page + 1) * size >= totalElements,
      };
    }
    const { data } = await api.get<PageResponse<AppService>>(`/org/${orgId}/apps`, {
      params: { type, search, page, size },
    });
    return data;
  },

  createApp: async (orgId: string, app: Omit<AppService, 'id' | 'organizationId' | 'createdAt' | 'updatedAt'>): Promise<AppService> => {
    if (localStorage.getItem('demoMode') === 'true') {
      await new Promise((r) => setTimeout(r, 200));
      const list = getMockApps();
      const newApp: AppService = {
        ...app,
        id: crypto.randomUUID(),
        organizationId: orgId,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      list.push(newApp);
      saveMockApps(list);
      return newApp;
    }
    const { data } = await api.post<AppService>(`/org/${orgId}/apps`, app);
    return data;
  },

  updateApp: async (orgId: string, id: string, app: Partial<Omit<AppService, 'id' | 'organizationId'>>): Promise<AppService> => {
    if (localStorage.getItem('demoMode') === 'true') {
      await new Promise((r) => setTimeout(r, 200));
      const list = getMockApps();
      const idx = list.findIndex((a) => a.id === id && a.organizationId === orgId);
      if (idx === -1) throw new Error('App not found');
      const updated = {
        ...list[idx],
        ...app,
        updatedAt: new Date().toISOString(),
      };
      list[idx] = updated;
      saveMockApps(list);
      return updated;
    }
    const { data } = await api.put<AppService>(`/org/${orgId}/apps/${id}`, app);
    return data;
  },

  deleteApp: async (orgId: string, id: string): Promise<void> => {
    if (localStorage.getItem('demoMode') === 'true') {
      await new Promise((r) => setTimeout(r, 200));
      const list = getMockApps();
      const filtered = list.filter((a) => !(a.id === id && a.organizationId === orgId));
      saveMockApps(filtered);
      return;
    }
    await api.delete(`/org/${orgId}/apps/${id}`);
  },

  // --- Backup Solutions API ---
  listBackups: async (orgId: string, type: string, search = '', page = 0, size = 50): Promise<PageResponse<BackupSolution>> => {
    if (localStorage.getItem('demoMode') === 'true') {
      await new Promise((r) => setTimeout(r, 200));
      let list = getMockBackups().filter((a) => a.organizationId === orgId && a.type === type);
      if (search) {
        list = list.filter((a) => a.name.toLowerCase().includes(search.toLowerCase()));
      }
      const totalElements = list.length;
      const totalPages = Math.ceil(totalElements / size);
      const content = list.slice(page * size, (page + 1) * size);
      return {
        content,
        totalElements,
        totalPages,
        number: page,
        size,
        first: page === 0,
        last: (page + 1) * size >= totalElements,
      };
    }
    const { data } = await api.get<PageResponse<BackupSolution>>(`/org/${orgId}/backups`, {
      params: { type, search, page, size },
    });
    return data;
  },

  createBackup: async (orgId: string, backup: Omit<BackupSolution, 'id' | 'organizationId' | 'createdAt' | 'updatedAt'>): Promise<BackupSolution> => {
    if (localStorage.getItem('demoMode') === 'true') {
      await new Promise((r) => setTimeout(r, 200));
      const list = getMockBackups();
      const newBackup: BackupSolution = {
        ...backup,
        id: crypto.randomUUID(),
        organizationId: orgId,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      list.push(newBackup);
      saveMockBackups(list);
      return newBackup;
    }
    const { data } = await api.post<BackupSolution>(`/org/${orgId}/backups`, backup);
    return data;
  },

  updateBackup: async (orgId: string, id: string, backup: Partial<Omit<BackupSolution, 'id' | 'organizationId'>>): Promise<BackupSolution> => {
    if (localStorage.getItem('demoMode') === 'true') {
      await new Promise((r) => setTimeout(r, 200));
      const list = getMockBackups();
      const idx = list.findIndex((a) => a.id === id && a.organizationId === orgId);
      if (idx === -1) throw new Error('Backup solution not found');
      const updated = {
        ...list[idx],
        ...backup,
        updatedAt: new Date().toISOString(),
      };
      list[idx] = updated;
      saveMockBackups(list);
      return updated;
    }
    const { data } = await api.put<BackupSolution>(`/org/${orgId}/backups/${id}`, backup);
    return data;
  },

  deleteBackup: async (orgId: string, id: string): Promise<void> => {
    if (localStorage.getItem('demoMode') === 'true') {
      await new Promise((r) => setTimeout(r, 200));
      const list = getMockBackups();
      const filtered = list.filter((a) => !(a.id === id && a.organizationId === orgId));
      saveMockBackups(filtered);
      return;
    }
    await api.delete(`/org/${orgId}/backups/${id}`);
  },
};
