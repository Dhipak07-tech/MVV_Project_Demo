import api from './organizationApi';

export interface Asset {
  id: string;
  organizationId: string;
  name: string;
  type: string;
  ipAddress?: string;
  macAddress?: string;
  serialNumber?: string;
  model?: string;
  manufacturer?: string;
  osVersion?: string;
  status: string;
  notes?: string;
  createdAt: string;
  updatedAt: string;
  createdBy?: string;
}

export interface NetworkingAsset {
  id: string;
  organizationId: string;
  name: string;
  type: string;
  subnetCidr?: string;
  gateway?: string;
  vlanId?: string;
  details?: string;
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

// Helper for local mock data keys
const MOCK_ASSETS_KEY = 'mmv_mock_assets';
const MOCK_NET_KEY = 'mmv_mock_networking';

function getMockAssets(): Asset[] {
  const data = localStorage.getItem(MOCK_ASSETS_KEY);
  if (!data) {
    const initial: Asset[] = [
      {
        id: '11111111-1111-1111-1111-111111111111',
        organizationId: 'b0000000-0000-0000-0000-000000000001',
        name: 'HQ Primary Edge Firewall',
        type: 'firewalls',
        ipAddress: '192.168.1.1',
        macAddress: '00:0d:3f:cd:02:5f',
        serialNumber: 'FG100D3G15002931',
        model: 'FortiGate 100D',
        manufacturer: 'Fortinet',
        osVersion: 'FortiOS v7.0.5',
        status: 'Active',
        notes: 'Primary firewall managing corporate LAN/WAN, routing and VPN endpoints.',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
      {
        id: '22222222-2222-2222-2222-222222222222',
        organizationId: 'b0000000-0000-0000-0000-000000000001',
        name: 'Active Directory & Domain Controller',
        type: 'servers',
        ipAddress: '192.168.1.10',
        macAddress: '00:15:5d:01:14:02',
        serialNumber: 'Dell-DC01-SRV',
        model: 'PowerEdge R640',
        manufacturer: 'Dell',
        osVersion: 'Windows Server 2022',
        status: 'Active',
        notes: 'Core directory services. Hosts DNS, DHCP and Group Policy.',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      }
    ];
    localStorage.setItem(MOCK_ASSETS_KEY, JSON.stringify(initial));
    return initial;
  }
  return JSON.parse(data);
}

function saveMockAssets(assets: Asset[]) {
  localStorage.setItem(MOCK_ASSETS_KEY, JSON.stringify(assets));
}

function getMockNet(): NetworkingAsset[] {
  const data = localStorage.getItem(MOCK_NET_KEY);
  if (!data) {
    const initial: NetworkingAsset[] = [
      {
        id: '33333333-3333-3333-3333-333333333333',
        organizationId: 'b0000000-0000-0000-0000-000000000001',
        name: 'Office LAN Subnet',
        type: 'lan',
        subnetCidr: '192.168.1.0/24',
        gateway: '192.168.1.1',
        vlanId: '10',
        details: 'Corporate LAN subnet for wired endpoints, workstations and printers.',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
      {
        id: '44444444-4444-4444-4444-444444444444',
        organizationId: 'b0000000-0000-0000-0000-000000000001',
        name: 'HQ Corporate SSID',
        type: 'wireless',
        subnetCidr: '192.168.20.0/24',
        gateway: '192.168.20.1',
        vlanId: '20',
        details: 'SSID: Weyland-Corp-Secure | Security: WPA3 Enterprise',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      }
    ];
    localStorage.setItem(MOCK_NET_KEY, JSON.stringify(initial));
    return initial;
  }
  return JSON.parse(data);
}

function saveMockNet(assets: NetworkingAsset[]) {
  localStorage.setItem(MOCK_NET_KEY, JSON.stringify(assets));
}

export const assetsApi = {
  // --- Hardware Assets API ---
  list: async (orgId: string, type: string, search = '', page = 0, size = 50): Promise<PageResponse<Asset>> => {
    if (localStorage.getItem('demoMode') === 'true') {
      await new Promise((r) => setTimeout(r, 200));
      let list = getMockAssets().filter((a) => a.organizationId === orgId && a.type === type);
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
    const { data } = await api.get<PageResponse<Asset>>(`/org/${orgId}/assets`, {
      params: { type, search, page, size },
    });
    return data;
  },

  create: async (orgId: string, asset: Omit<Asset, 'id' | 'organizationId' | 'createdAt' | 'updatedAt'>): Promise<Asset> => {
    if (localStorage.getItem('demoMode') === 'true') {
      await new Promise((r) => setTimeout(r, 200));
      const list = getMockAssets();
      const newAsset: Asset = {
        ...asset,
        id: crypto.randomUUID(),
        organizationId: orgId,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      list.push(newAsset);
      saveMockAssets(list);
      return newAsset;
    }
    const { data } = await api.post<Asset>(`/org/${orgId}/assets`, asset);
    return data;
  },

  update: async (orgId: string, id: string, asset: Partial<Omit<Asset, 'id' | 'organizationId'>>): Promise<Asset> => {
    if (localStorage.getItem('demoMode') === 'true') {
      await new Promise((r) => setTimeout(r, 200));
      const list = getMockAssets();
      const idx = list.findIndex((a) => a.id === id && a.organizationId === orgId);
      if (idx === -1) throw new Error('Asset not found');
      const updated = {
        ...list[idx],
        ...asset,
        updatedAt: new Date().toISOString(),
      };
      list[idx] = updated;
      saveMockAssets(list);
      return updated;
    }
    const { data } = await api.put<Asset>(`/org/${orgId}/assets/${id}`, asset);
    return data;
  },

  delete: async (orgId: string, id: string): Promise<void> => {
    if (localStorage.getItem('demoMode') === 'true') {
      await new Promise((r) => setTimeout(r, 200));
      const list = getMockAssets();
      const filtered = list.filter((a) => !(a.id === id && a.organizationId === orgId));
      saveMockAssets(filtered);
      return;
    }
    await api.delete(`/org/${orgId}/assets/${id}`);
  },

  // --- Networking Configurations API ---
  listNetworking: async (orgId: string, type: string, search = '', page = 0, size = 50): Promise<PageResponse<NetworkingAsset>> => {
    if (localStorage.getItem('demoMode') === 'true') {
      await new Promise((r) => setTimeout(r, 200));
      let list = getMockNet().filter((a) => a.organizationId === orgId && a.type === type);
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
    const { data } = await api.get<PageResponse<NetworkingAsset>>(`/org/${orgId}/networking`, {
      params: { type, search, page, size },
    });
    return data;
  },

  createNetworking: async (orgId: string, asset: Omit<NetworkingAsset, 'id' | 'organizationId' | 'createdAt' | 'updatedAt'>): Promise<NetworkingAsset> => {
    if (localStorage.getItem('demoMode') === 'true') {
      await new Promise((r) => setTimeout(r, 200));
      const list = getMockNet();
      const newAsset: NetworkingAsset = {
        ...asset,
        id: crypto.randomUUID(),
        organizationId: orgId,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      list.push(newAsset);
      saveMockNet(list);
      return newAsset;
    }
    const { data } = await api.post<NetworkingAsset>(`/org/${orgId}/networking`, asset);
    return data;
  },

  updateNetworking: async (orgId: string, id: string, asset: Partial<Omit<NetworkingAsset, 'id' | 'organizationId'>>): Promise<NetworkingAsset> => {
    if (localStorage.getItem('demoMode') === 'true') {
      await new Promise((r) => setTimeout(r, 200));
      const list = getMockNet();
      const idx = list.findIndex((a) => a.id === id && a.organizationId === orgId);
      if (idx === -1) throw new Error('Networking configuration not found');
      const updated = {
        ...list[idx],
        ...asset,
        updatedAt: new Date().toISOString(),
      };
      list[idx] = updated;
      saveMockNet(list);
      return updated;
    }
    const { data } = await api.put<NetworkingAsset>(`/org/${orgId}/networking/${id}`, asset);
    return data;
  },

  deleteNetworking: async (orgId: string, id: string): Promise<void> => {
    if (localStorage.getItem('demoMode') === 'true') {
      await new Promise((r) => setTimeout(r, 200));
      const list = getMockNet();
      const filtered = list.filter((a) => !(a.id === id && a.organizationId === orgId));
      saveMockNet(filtered);
      return;
    }
    await api.delete(`/org/${orgId}/networking/${id}`);
  },
};
