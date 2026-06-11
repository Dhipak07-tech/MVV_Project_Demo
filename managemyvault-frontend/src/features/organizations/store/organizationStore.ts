import { create } from 'zustand';
import type {
  Organization,
  OrganizationSummary,
  OrganizationFilters,
  UserInfo,
} from '../types/organization.types';

// ============================================
// Auth Store
// ============================================

interface AuthState {
  accessToken: string | null;
  refreshToken: string | null;
  user: UserInfo | null;
  isAuthenticated: boolean;

  setAuth: (accessToken: string, refreshToken: string, user: UserInfo) => void;
  clearAuth: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  accessToken: localStorage.getItem('accessToken'),
  refreshToken: localStorage.getItem('refreshToken'),
  user: localStorage.getItem('user') ? JSON.parse(localStorage.getItem('user')!) : null,
  isAuthenticated: !!localStorage.getItem('accessToken'),

  setAuth: (accessToken, refreshToken, user) => {
    localStorage.setItem('accessToken', accessToken);
    localStorage.setItem('refreshToken', refreshToken);
    localStorage.setItem('user', JSON.stringify(user));
    set({ accessToken, refreshToken, user, isAuthenticated: true });
  },

  clearAuth: () => {
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
    localStorage.removeItem('user');
    set({ accessToken: null, refreshToken: null, user: null, isAuthenticated: false });
  },
}));

// ============================================
// Organization Store
// ============================================

interface OrganizationState {
  // Directory state
  organizations: OrganizationSummary[];
  totalCount: number;
  currentPage: number;
  pageSize: number;
  isLoading: boolean;
  error: string | null;
  viewMode: 'grid' | 'list';
  searchQuery: string;
  filters: OrganizationFilters;

  // Workspace state (when inside an org)
  activeOrganization: Organization | null;
  activeOrganizationId: string | null;

  // Actions
  setOrganizations: (orgs: OrganizationSummary[], total: number) => void;
  setViewMode: (mode: 'grid' | 'list') => void;
  setSearchQuery: (query: string) => void;
  setFilters: (filters: Partial<OrganizationFilters>) => void;
  setActiveOrganization: (org: Organization | null) => void;
  setActiveOrganizationId: (id: string | null) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  setCurrentPage: (page: number) => void;
  resetFilters: () => void;
}

export const useOrganizationStore = create<OrganizationState>((set) => ({
  organizations: [],
  totalCount: 0,
  currentPage: 0,
  pageSize: 20,
  isLoading: false,
  error: null,
  viewMode: 'grid',
  searchQuery: '',
  filters: {},
  activeOrganization: null,
  activeOrganizationId: null,

  setOrganizations: (orgs, total) => set({ organizations: orgs, totalCount: total }),
  setViewMode: (mode) => set({ viewMode: mode }),
  setSearchQuery: (query) => set({ searchQuery: query, currentPage: 0 }),
  setFilters: (filters) =>
    set((state) => ({ filters: { ...state.filters, ...filters }, currentPage: 0 })),
  setActiveOrganization: (org) =>
    set({ activeOrganization: org, activeOrganizationId: org?.id ?? null }),
  setActiveOrganizationId: (id) => set({ activeOrganizationId: id }),
  setLoading: (loading) => set({ isLoading: loading }),
  setError: (error) => set({ error }),
  setCurrentPage: (page) => set({ currentPage: page }),
  resetFilters: () => set({ filters: {}, searchQuery: '', currentPage: 0 }),
}));
