import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { appsApi, type AppService, type BackupSolution } from '../api/appsApi';

export function useApps(orgId: string, type: string, search = '', page = 0, size = 50) {
  return useQuery({
    queryKey: ['apps', orgId, type, search, page, size],
    queryFn: () => appsApi.listApps(orgId, type, search, page, size),
    enabled: !!orgId && !!type,
    staleTime: 1000 * 30,
  });
}

export function useCreateApp() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ orgId, app }: { orgId: string; app: Omit<AppService, 'id' | 'organizationId' | 'createdAt' | 'updatedAt'> }) =>
      appsApi.createApp(orgId, app),
    onSuccess: (_, { orgId, app }) => {
      queryClient.invalidateQueries({ queryKey: ['apps', orgId, app.type] });
    },
  });
}

export function useUpdateApp() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ orgId, id, app }: { orgId: string; id: string; app: Partial<Omit<AppService, 'id' | 'organizationId'>> }) =>
      appsApi.updateApp(orgId, id, app),
    onSuccess: (updatedApp) => {
      queryClient.invalidateQueries({ queryKey: ['apps', updatedApp.organizationId, updatedApp.type] });
    },
  });
}

export function useDeleteApp() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ orgId, id }: { orgId: string; id: string; type: string }) =>
      appsApi.deleteApp(orgId, id),
    onSuccess: (_, { orgId, type }) => {
      queryClient.invalidateQueries({ queryKey: ['apps', orgId, type] });
    },
  });
}

export function useBackups(orgId: string, type: string, search = '', page = 0, size = 50) {
  return useQuery({
    queryKey: ['backups', orgId, type, search, page, size],
    queryFn: () => appsApi.listBackups(orgId, type, search, page, size),
    enabled: !!orgId && !!type,
    staleTime: 1000 * 30,
  });
}

export function useCreateBackup() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ orgId, backup }: { orgId: string; backup: Omit<BackupSolution, 'id' | 'organizationId' | 'createdAt' | 'updatedAt'> }) =>
      appsApi.createBackup(orgId, backup),
    onSuccess: (_, { orgId, backup }) => {
      queryClient.invalidateQueries({ queryKey: ['backups', orgId, backup.type] });
    },
  });
}

export function useUpdateBackup() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ orgId, id, backup }: { orgId: string; id: string; backup: Partial<Omit<BackupSolution, 'id' | 'organizationId'>> }) =>
      appsApi.updateBackup(orgId, id, backup),
    onSuccess: (updatedBackup) => {
      queryClient.invalidateQueries({ queryKey: ['backups', updatedBackup.organizationId, updatedBackup.type] });
    },
  });
}

export function useDeleteBackup() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ orgId, id }: { orgId: string; id: string; type: string }) =>
      appsApi.deleteBackup(orgId, id),
    onSuccess: (_, { orgId, type }) => {
      queryClient.invalidateQueries({ queryKey: ['backups', orgId, type] });
    },
  });
}
