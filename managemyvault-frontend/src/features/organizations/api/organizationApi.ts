import axios from 'axios';
import { API_URL } from '../../../config/constants';
import type {
  AuthResponse,
  LoginRequest,
  Organization,
  OrganizationSummary,
  CreateOrganizationInput,
  UpdateOrganizationInput,
  PageResponse,
  OrganizationStatus,
} from '../types/organization.types';

// ============================================
// Axios Instance
// ============================================

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor — attach JWT token
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('accessToken');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Response interceptor — handle 401 (token expired)
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error.response?.status === 401) {
      const refreshToken = localStorage.getItem('refreshToken');
      if (refreshToken && !error.config._retry) {
        error.config._retry = true;
        try {
          const { data } = await axios.post(`${API_URL}/auth/refresh`, {
            refreshToken,
          });
          localStorage.setItem('accessToken', data.accessToken);
          localStorage.setItem('refreshToken', data.refreshToken);
          error.config.headers.Authorization = `Bearer ${data.accessToken}`;
          return api(error.config);
        } catch {
          localStorage.removeItem('accessToken');
          localStorage.removeItem('refreshToken');
          window.location.href = '/login';
        }
      }
    }
    return Promise.reject(error);
  }
);

// ============================================
// Demo/Mock Data System (for offline/demo use)
// ============================================

const INITIAL_MOCK_ORGANIZATIONS: Organization[] = [
  {
    id: 'b0000000-0000-0000-0000-000000000001',
    name: 'Acme Corporation',
    slug: 'acme-corporation',
    description: 'Global manufacturing conglomerate specializing in cartoonish explosives and roadrunner traps.',
    industry: 'Manufacturing',
    companySize: '10000+',
    website: 'https://acme.com',
    phone: '+1 555-0199',
    email: 'security@acme.com',
    logoUrl: null,
    status: 'ACTIVE',
    healthScore: 92,
    timezone: 'America/New_York',
    countryCode: 'US',
    addressLine1: '123 Desert Road',
    addressLine2: 'Suite 400',
    city: 'Phoenix',
    stateProvince: 'AZ',
    postalCode: '85001',
    metadata: {},
    settings: {},
    createdAt: new Date(Date.now() - 180 * 24 * 3600 * 1000).toISOString(),
    updatedAt: new Date().toISOString(),
    createdBy: 'a0000000-0000-0000-0000-000000000001',
    memberCount: 42,
    assetCount: 156,
    passwordCount: 512,
    documentCount: 89,
    contactCount: 12,
    lastActivity: new Date(Date.now() - 10 * 60000).toISOString(),
  },
  {
    id: 'b0000000-0000-0000-0000-000000000002',
    name: 'Cyberdyne Systems',
    slug: 'cyberdyne-systems',
    description: 'Defense network systems developer. Currently working on a self-aware neural network named Skynet.',
    industry: 'Defense',
    companySize: '500-1000',
    website: 'https://cyberdyne.com',
    phone: '+1 555-0800',
    email: 'info@cyberdyne.com',
    logoUrl: null,
    status: 'SUSPENDED',
    healthScore: 45,
    timezone: 'America/Los_Angeles',
    countryCode: 'US',
    addressLine1: '18111 Von Karman Ave',
    addressLine2: '',
    city: 'Irvine',
    stateProvince: 'CA',
    postalCode: '92612',
    metadata: {},
    settings: {},
    createdAt: new Date(Date.now() - 365 * 24 * 3600 * 1000).toISOString(),
    updatedAt: new Date().toISOString(),
    createdBy: 'a0000000-0000-0000-0000-000000000001',
    memberCount: 120,
    assetCount: 840,
    passwordCount: 1024,
    documentCount: 340,
    contactCount: 56,
    lastActivity: new Date(Date.now() - 3600000).toISOString(),
  },
  {
    id: 'b0000000-0000-0000-0000-000000000003',
    name: 'Initech Inc.',
    slug: 'initech-inc',
    description: 'Software company specializing in Y2K banking compliance software. Famous for red staplers.',
    industry: 'Technology',
    companySize: '100-500',
    website: 'https://initech.com',
    phone: '+1 555-0144',
    email: 'lumbergh@initech.com',
    logoUrl: null,
    status: 'ACTIVE',
    healthScore: 78,
    timezone: 'America/Chicago',
    countryCode: 'US',
    addressLine1: '4120 Freemont Ave',
    addressLine2: '',
    city: 'Austin',
    stateProvince: 'TX',
    postalCode: '78701',
    metadata: {},
    settings: {},
    createdAt: new Date(Date.now() - 30 * 24 * 3600 * 1000).toISOString(),
    updatedAt: new Date().toISOString(),
    createdBy: 'a0000000-0000-0000-0000-000000000001',
    memberCount: 15,
    assetCount: 45,
    passwordCount: 120,
    documentCount: 22,
    contactCount: 4,
    lastActivity: new Date(Date.now() - 86400000).toISOString(),
  },
  {
    id: 'b0000000-0000-0000-0000-000000000004',
    name: 'Weyland-Yutani',
    slug: 'weyland-yutani',
    description: 'Building Better Worlds. Space colonization and research conglomerate.',
    industry: 'Aerospace',
    companySize: '10000+',
    website: 'https://weyland-yutani.com',
    phone: '+1 555-0999',
    email: 'ash@weyland.com',
    logoUrl: null,
    status: 'ACTIVE',
    healthScore: 88,
    timezone: 'UTC',
    countryCode: 'GB',
    addressLine1: 'Weyland House',
    addressLine2: 'London Wall',
    city: 'London',
    stateProvince: 'Greater London',
    postalCode: 'EC2M 5QD',
    metadata: {},
    settings: {},
    createdAt: new Date(Date.now() - 730 * 24 * 3600 * 1000).toISOString(),
    updatedAt: new Date().toISOString(),
    createdBy: 'a0000000-0000-0000-0000-000000000001',
    memberCount: 450,
    assetCount: 3400,
    passwordCount: 8900,
    documentCount: 1200,
    contactCount: 98,
    lastActivity: new Date(Date.now() - 15 * 60000).toISOString(),
  },
  {
    id: 'b0000000-0000-0000-0000-000000000005',
    name: 'Tyrell Corporation',
    slug: 'tyrell-corporation',
    description: 'More human than human. High-technology replica developers.',
    industry: 'Biotechnology',
    companySize: '1000-5000',
    website: 'https://tyrell.com',
    phone: '+1 555-2019',
    email: 'deckard@tyrell.com',
    logoUrl: null,
    status: 'ACTIVE',
    healthScore: 94,
    timezone: 'America/Los_Angeles',
    countryCode: 'US',
    addressLine1: 'Tyrell Pyramids',
    addressLine2: 'Tower A',
    city: 'Los Angeles',
    stateProvince: 'CA',
    postalCode: '90012',
    metadata: {},
    settings: {},
    createdAt: new Date(Date.now() - 400 * 24 * 3600 * 1000).toISOString(),
    updatedAt: new Date().toISOString(),
    createdBy: 'a0000000-0000-0000-0000-000000000001',
    memberCount: 88,
    assetCount: 390,
    passwordCount: 1100,
    documentCount: 410,
    contactCount: 23,
    lastActivity: new Date(Date.now() - 50 * 60000).toISOString(),
  },
  {
    id: 'b0000000-0000-0000-0000-000000000006',
    name: 'Umbrella Corporation',
    slug: 'umbrella-corporation',
    description: 'Pharmaceutical development and advanced biological engineering.',
    industry: 'Pharmaceuticals',
    companySize: '5000-10000',
    website: 'https://umbrella.com',
    phone: '+1 555-0911',
    email: 'wesker@umbrella.com',
    logoUrl: null,
    status: 'ARCHIVED',
    healthScore: 12,
    timezone: 'America/New_York',
    countryCode: 'US',
    addressLine1: 'Hive Lab Facility',
    addressLine2: 'Underground',
    city: 'Raccoon City',
    stateProvince: 'IL',
    postalCode: '61101',
    metadata: {},
    settings: {},
    createdAt: new Date(Date.now() - 500 * 24 * 3600 * 1000).toISOString(),
    updatedAt: new Date().toISOString(),
    createdBy: 'a0000000-0000-0000-0000-000000000001',
    memberCount: 0,
    assetCount: 0,
    passwordCount: 0,
    documentCount: 0,
    contactCount: 0,
    lastActivity: null,
  },
];

function getStoredMockData(): Organization[] {
  const data = localStorage.getItem('mock_organizations');
  if (!data) {
    localStorage.setItem('mock_organizations', JSON.stringify(INITIAL_MOCK_ORGANIZATIONS));
    return INITIAL_MOCK_ORGANIZATIONS;
  }
  return JSON.parse(data);
}

function saveStoredMockData(orgs: Organization[]) {
  localStorage.setItem('mock_organizations', JSON.stringify(orgs));
}

// ============================================
// Auth API
// ============================================

export const authApi = {
  login: async (request: LoginRequest): Promise<AuthResponse> => {
    const { data } = await api.post<AuthResponse>('/auth/login', request);
    return data;
  },

  refresh: async (refreshToken: string): Promise<AuthResponse> => {
    const { data } = await api.post<AuthResponse>('/auth/refresh', { refreshToken });
    return data;
  },

  logout: async (): Promise<void> => {
    try {
      await api.post('/auth/logout');
    } catch {
      // Ignore if offline
    }
  },
};

// ============================================
// Organization API
// ============================================

export interface OrganizationSearchParams {
  search?: string;
  status?: OrganizationStatus;
  industry?: string;
  page?: number;
  size?: number;
  sort?: string;
}

export const organizationApi = {
  list: async (params: OrganizationSearchParams = {}): Promise<PageResponse<OrganizationSummary>> => {
    if (localStorage.getItem('demoMode') === 'true') {
      await new Promise((resolve) => setTimeout(resolve, 300));
      let list = getStoredMockData();

      // Apply filters
      if (params.search) {
        const query = params.search.toLowerCase();
        list = list.filter((o) => o.name.toLowerCase().includes(query) || o.slug.toLowerCase().includes(query));
      }
      if (params.status) {
        list = list.filter((o) => o.status === params.status);
      }
      if (params.industry) {
        const ind = params.industry.toLowerCase();
        list = list.filter((o) => o.industry?.toLowerCase().includes(ind));
      }

      // Pagination
      const page = params.page || 0;
      const size = params.size || 20;
      const start = page * size;
      const end = start + size;
      const content = list.slice(start, end).map((org) => ({
        id: org.id,
        name: org.name,
        slug: org.slug,
        industry: org.industry,
        logoUrl: org.logoUrl,
        status: org.status,
        healthScore: org.healthScore,
        createdAt: org.createdAt,
        memberCount: org.memberCount,
        assetCount: org.assetCount,
        passwordCount: org.passwordCount,
        documentCount: org.documentCount,
      }));

      return {
        content,
        totalElements: list.length,
        totalPages: Math.ceil(list.length / size),
        number: page,
        size,
        first: page === 0,
        last: end >= list.length,
      };
    }

    const { data } = await api.get<PageResponse<OrganizationSummary>>('/organizations', {
      params: {
        search: params.search || undefined,
        status: params.status || undefined,
        industry: params.industry || undefined,
        page: params.page || 0,
        size: params.size || 20,
        sort: params.sort || 'name,asc',
      },
    });
    return data;
  },

  getById: async (id: string): Promise<Organization> => {
    if (localStorage.getItem('demoMode') === 'true') {
      await new Promise((resolve) => setTimeout(resolve, 200));
      const list = getStoredMockData();
      const org = list.find((o) => o.id === id);
      if (!org) throw new Error('Organization not found');
      return org;
    }

    const { data } = await api.get<Organization>(`/organizations/${id}`);
    return data;
  },

  create: async (input: CreateOrganizationInput): Promise<Organization> => {
    if (localStorage.getItem('demoMode') === 'true') {
      await new Promise((resolve) => setTimeout(resolve, 400));
      const list = getStoredMockData();
      const newOrg: Organization = {
        id: crypto.randomUUID(),
        name: input.name,
        slug: input.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, ''),
        description: input.description || null,
        industry: input.industry || null,
        companySize: input.companySize || null,
        website: input.website || null,
        phone: input.phone || null,
        email: input.email || null,
        logoUrl: null,
        status: 'ACTIVE',
        healthScore: 100,
        timezone: input.timezone || 'UTC',
        countryCode: input.countryCode || null,
        addressLine1: input.addressLine1 || null,
        addressLine2: input.addressLine2 || null,
        city: input.city || null,
        stateProvince: input.stateProvince || null,
        postalCode: input.postalCode || null,
        metadata: {},
        settings: {},
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        createdBy: null,
        memberCount: 1,
        assetCount: 0,
        passwordCount: 0,
        documentCount: 0,
        contactCount: 0,
        lastActivity: new Date().toISOString(),
      };
      list.unshift(newOrg);
      saveStoredMockData(list);
      return newOrg;
    }

    const { data } = await api.post<Organization>('/organizations', input);
    return data;
  },

  update: async (id: string, input: UpdateOrganizationInput): Promise<Organization> => {
    if (localStorage.getItem('demoMode') === 'true') {
      await new Promise((resolve) => setTimeout(resolve, 300));
      const list = getStoredMockData();
      const idx = list.findIndex((o) => o.id === id);
      if (idx === -1) throw new Error('Organization not found');

      const updated = {
        ...list[idx],
        ...input,
        updatedAt: new Date().toISOString(),
      } as Organization;

      list[idx] = updated;
      saveStoredMockData(list);
      return updated;
    }

    const { data } = await api.put<Organization>(`/organizations/${id}`, input);
    return data;
  },

  archive: async (id: string): Promise<void> => {
    if (localStorage.getItem('demoMode') === 'true') {
      await new Promise((resolve) => setTimeout(resolve, 200));
      const list = getStoredMockData();
      const idx = list.findIndex((o) => o.id === id);
      if (idx !== -1) {
        list[idx].status = 'ARCHIVED';
        saveStoredMockData(list);
      }
      return;
    }

    await api.post(`/organizations/${id}/archive`);
  },

  restore: async (id: string): Promise<Organization> => {
    if (localStorage.getItem('demoMode') === 'true') {
      await new Promise((resolve) => setTimeout(resolve, 200));
      const list = getStoredMockData();
      const idx = list.findIndex((o) => o.id === id);
      if (idx === -1) throw new Error('Organization not found');
      list[idx].status = 'ACTIVE';
      saveStoredMockData(list);
      return list[idx];
    }

    const { data } = await api.post<Organization>(`/organizations/${id}/restore`);
    return data;
  },

  getStats: async (): Promise<{ total: number; active: number; suspended: number; archived: number }> => {
    if (localStorage.getItem('demoMode') === 'true') {
      await new Promise((resolve) => setTimeout(resolve, 150));
      const list = getStoredMockData();
      return {
        total: list.length,
        active: list.filter((o) => o.status === 'ACTIVE').length,
        suspended: list.filter((o) => o.status === 'SUSPENDED').length,
        archived: list.filter((o) => o.status === 'ARCHIVED').length,
      };
    }

    const { data } = await api.get('/organizations/stats');
    return data;
  },

  globalSearch: async (query: string): Promise<any[]> => {
    if (localStorage.getItem('demoMode') === 'true') {
      await new Promise((resolve) => setTimeout(resolve, 200));
      const list = getStoredMockData();
      return list.filter((o) =>
        o.name.toLowerCase().includes(query.toLowerCase()) ||
        o.description?.toLowerCase().includes(query.toLowerCase())
      );
    }

    const { data } = await api.get<any[]>('/organizations/search', {
      params: { query },
    });
    return data;
  },
};

export default api;
