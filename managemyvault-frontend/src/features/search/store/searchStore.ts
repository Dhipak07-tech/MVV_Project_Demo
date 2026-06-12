import { create } from 'zustand';
import api from '../../organizations/api/organizationApi';

export interface SearchResult {
  type: string;
  id: string;
  title: string;
  description: string;
  organization: string;
  organizationId: string;
  lastUpdated?: string;
  score: number;
}

interface SearchState {
  isOpen: boolean;
  query: string;
  entityType: string;
  organizationId: string | null;
  results: SearchResult[];
  suggestions: string[];
  isLoading: boolean;
  
  setIsOpen: (open: boolean) => void;
  setQuery: (query: string) => void;
  setEntityType: (type: string) => void;
  setOrganizationId: (orgId: string | null) => void;
  clearSearch: () => void;
  
  performSearch: () => Promise<void>;
  fetchSuggestions: () => Promise<void>;
}

export const useSearchStore = create<SearchState>((set, get) => ({
  isOpen: false,
  query: '',
  entityType: 'ALL',
  organizationId: null,
  results: [],
  suggestions: [],
  isLoading: false,

  setIsOpen: (open) => set({ isOpen: open }),
  setQuery: (query) => set({ query }),
  setEntityType: (entityType) => set({ entityType }),
  setOrganizationId: (organizationId) => set({ organizationId }),
  clearSearch: () => set({ query: '', results: [], suggestions: [] }),

  performSearch: async () => {
    const { query, entityType, organizationId } = get();
    if (!query.trim()) {
      set({ results: [], isLoading: false });
      return;
    }

    set({ isLoading: true });
    try {
      const params: Record<string, string> = {
        q: query,
      };
      if (entityType && entityType !== 'ALL') {
        params.type = entityType;
      }
      if (organizationId) {
        params.organizationId = organizationId;
      }

      const response = await api.get<{ results: SearchResult[] }>('/search', { params });
      set({ results: response.data.results || [], isLoading: false });
    } catch (error) {
      console.error('Failed to perform global search:', error);
      set({ results: [], isLoading: false });
    }
  },

  fetchSuggestions: async () => {
    const { query } = get();
    if (query.trim().length < 2) {
      set({ suggestions: [] });
      return;
    }

    try {
      const response = await api.get<string[]>('/search/suggest', {
        params: { q: query },
      });
      set({ suggestions: response.data || [] });
    } catch (error) {
      console.error('Failed to fetch search suggestions:', error);
      set({ suggestions: [] });
    }
  },
}));
