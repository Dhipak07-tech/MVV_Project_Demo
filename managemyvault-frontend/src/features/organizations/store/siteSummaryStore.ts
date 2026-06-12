import { create } from 'zustand';
import { siteSummaryApi, type SiteSummaryData } from '../api/siteSummaryApi';

interface SiteSummaryState {
  data: SiteSummaryData | null;
  isLoading: boolean;
  isSaving: boolean;
  error: string | null;

  fetchSiteSummary: (orgId: string) => Promise<void>;
  saveSiteSummary: (orgId: string, payload: Omit<SiteSummaryData, 'id' | 'active'>) => Promise<void>;
  deleteSiteSummary: () => Promise<void>;
  archiveSiteSummary: () => Promise<void>;
  clearData: () => void;
}

export const useSiteSummaryStore = create<SiteSummaryState>((set, get) => ({
  data: null,
  isLoading: false,
  isSaving: false,
  error: null,

  fetchSiteSummary: async (orgId) => {
    set({ isLoading: true, error: null });
    try {
      const result = await siteSummaryApi.getSiteSummary(orgId);
      set({ data: result, isLoading: false });
    } catch (err: any) {
      if (err.response?.status === 404) {
        set({ data: null, isLoading: false });
      } else {
        set({
          error: err.message || 'Failed to fetch site summary',
          isLoading: false,
        });
      }
    }
  },

  saveSiteSummary: async (_orgId, payload) => {
    const previousData = get().data;
    const isUpdate = !!previousData?.id;

    // Build optimistic state
    const optimisticData: SiteSummaryData = {
      ...payload,
      id: previousData?.id || crypto.randomUUID(),
      active: previousData?.active ?? true,
      updatedAt: new Date().toISOString(),
    };

    set({ data: optimisticData, isSaving: true, error: null });

    try {
      let result;
      if (isUpdate) {
        result = await siteSummaryApi.updateSiteSummary(previousData!.id!, payload);
      } else {
        result = await siteSummaryApi.createSiteSummary({
          ...payload,
          active: true,
        });
      }
      set({ data: result, isSaving: false });
    } catch (err: any) {
      // Revert to original state on failure
      set({
        data: previousData,
        isSaving: false,
        error: err.response?.data?.message || err.message || 'Failed to save site summary',
      });
      throw err;
    }
  },

  deleteSiteSummary: async () => {
    const currentData = get().data;
    if (!currentData?.id) return;

    set({ data: null, isSaving: true, error: null });

    try {
      await siteSummaryApi.deleteSiteSummary(currentData.id);
      set({ isSaving: false });
    } catch (err: any) {
      // Revert to original state on failure
      set({
        data: currentData,
        isSaving: false,
        error: err.response?.data?.message || err.message || 'Failed to delete site summary',
      });
      throw err;
    }
  },

  archiveSiteSummary: async () => {
    const currentData = get().data;
    if (!currentData?.id) return;

    const previousData = { ...currentData };
    const optimisticData = { ...currentData, active: false };

    set({ data: optimisticData, isSaving: true, error: null });

    try {
      const result = await siteSummaryApi.archiveSiteSummary(currentData.id);
      set({ data: result, isSaving: false });
    } catch (err: any) {
      // Revert to original state on failure
      set({
        data: previousData,
        isSaving: false,
        error: err.response?.data?.message || err.message || 'Failed to archive site summary',
      });
      throw err;
    }
  },

  clearData: () => set({ data: null, error: null, isLoading: false, isSaving: false }),
}));
