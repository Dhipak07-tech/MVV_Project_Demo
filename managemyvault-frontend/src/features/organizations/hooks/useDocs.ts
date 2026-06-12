import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { docsApi, type DocumentItem, type ExceptionItem, type NetworkOrMfaItem, type Credential, type TrackerItem } from '../api/docsApi';

// --- Documents Hooks ---
export function useDocuments(orgId: string, category: string, search = '', page = 0, size = 50) {
  return useQuery({
    queryKey: ['documents', orgId, category, search, page, size],
    queryFn: () => docsApi.listDocuments(orgId, category, search, page, size),
    enabled: !!orgId,
    staleTime: 1000 * 30,
  });
}

export function useCreateDocument() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ orgId, doc }: { orgId: string; doc: Omit<DocumentItem, 'id' | 'organizationId' | 'createdAt' | 'updatedAt'> }) =>
      docsApi.createDocument(orgId, doc),
    onSuccess: (newDoc) => {
      queryClient.invalidateQueries({ queryKey: ['documents', newDoc.organizationId] });
    },
  });
}

export function useUpdateDocument() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ orgId, id, doc }: { orgId: string; id: string; doc: Partial<Omit<DocumentItem, 'id' | 'organizationId'>> }) =>
      docsApi.updateDocument(orgId, id, doc),
    onSuccess: (updated) => {
      queryClient.invalidateQueries({ queryKey: ['documents', updated.organizationId] });
    },
  });
}

export function useDeleteDocument() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ orgId, id }: { orgId: string; id: string }) =>
      docsApi.deleteDocument(orgId, id),
    onSuccess: (_, { orgId }) => {
      queryClient.invalidateQueries({ queryKey: ['documents', orgId] });
    },
  });
}

// --- Exceptions Hooks ---
export function useExceptions(orgId: string, type: string, search = '', page = 0, size = 50) {
  return useQuery({
    queryKey: ['exceptions', orgId, type, search, page, size],
    queryFn: () => docsApi.listExceptions(orgId, type, search, page, size),
    enabled: !!orgId && !!type,
    staleTime: 1000 * 30,
  });
}

export function useCreateException() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ orgId, entry }: { orgId: string; entry: Omit<ExceptionItem, 'id' | 'organizationId' | 'createdAt' | 'updatedAt'> }) =>
      docsApi.createException(orgId, entry),
    onSuccess: (newEntry) => {
      queryClient.invalidateQueries({ queryKey: ['exceptions', newEntry.organizationId, newEntry.type] });
    },
  });
}

export function useUpdateException() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ orgId, id, entry }: { orgId: string; id: string; entry: Partial<Omit<ExceptionItem, 'id' | 'organizationId'>> }) =>
      docsApi.updateException(orgId, id, entry),
    onSuccess: (updated) => {
      queryClient.invalidateQueries({ queryKey: ['exceptions', updated.organizationId, updated.type] });
    },
  });
}

export function useDeleteException() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (vars: { orgId: string; id: string; type: string }) =>
      docsApi.deleteException(vars.orgId, vars.id),
    onSuccess: (_, { orgId, type }) => {
      queryClient.invalidateQueries({ queryKey: ['exceptions', orgId, type] });
    },
  });
}

// --- Networks and MFA Hooks ---
export function useNetworks(orgId: string, type: string, search = '', page = 0, size = 50) {
  return useQuery({
    queryKey: ['networks', orgId, type, search, page, size],
    queryFn: () => docsApi.listNetworks(orgId, type, search, page, size),
    enabled: !!orgId && !!type,
    staleTime: 1000 * 30,
  });
}

export function useCreateNetwork() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ orgId, net }: { orgId: string; net: Omit<NetworkOrMfaItem, 'id' | 'organizationId' | 'createdAt' | 'updatedAt'> }) =>
      docsApi.createNetwork(orgId, net),
    onSuccess: (newNet) => {
      queryClient.invalidateQueries({ queryKey: ['networks', newNet.organizationId, newNet.type] });
    },
  });
}

export function useUpdateNetwork() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ orgId, id, net }: { orgId: string; id: string; net: Partial<Omit<NetworkOrMfaItem, 'id' | 'organizationId'>> }) =>
      docsApi.updateNetwork(orgId, id, net),
    onSuccess: (updated) => {
      queryClient.invalidateQueries({ queryKey: ['networks', updated.organizationId, updated.type] });
    },
  });
}

export function useDeleteNetwork() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (vars: { orgId: string; id: string; type: string }) =>
      docsApi.deleteNetwork(vars.orgId, vars.id),
    onSuccess: (_, { orgId, type }) => {
      queryClient.invalidateQueries({ queryKey: ['networks', orgId, type] });
    },
  });
}

// --- Passwords Hooks ---
export function usePasswords(orgId: string, search = '', page = 0, size = 50) {
  return useQuery({
    queryKey: ['passwords', orgId, search, page, size],
    queryFn: () => docsApi.listPasswords(orgId, search, page, size),
    enabled: !!orgId,
    staleTime: 1000 * 30,
  });
}

export function useCreatePassword() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ orgId, cred }: { orgId: string; cred: Omit<Credential, 'id' | 'organizationId' | 'createdAt' | 'updatedAt'> }) =>
      docsApi.createPassword(orgId, cred),
    onSuccess: (newCred) => {
      queryClient.invalidateQueries({ queryKey: ['passwords', newCred.organizationId] });
    },
  });
}

export function useUpdatePassword() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ orgId, id, cred }: { orgId: string; id: string; cred: Partial<Omit<Credential, 'id' | 'organizationId'>> }) =>
      docsApi.updatePassword(orgId, id, cred),
    onSuccess: (updated) => {
      queryClient.invalidateQueries({ queryKey: ['passwords', updated.organizationId] });
    },
  });
}

export function useDeletePassword() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ orgId, id }: { orgId: string; id: string }) =>
      docsApi.deletePassword(orgId, id),
    onSuccess: (_, { orgId }) => {
      queryClient.invalidateQueries({ queryKey: ['passwords', orgId] });
    },
  });
}

// --- Trackers Hooks ---
export function useTrackers(orgId: string, type: string, search = '', page = 0, size = 50) {
  return useQuery({
    queryKey: ['trackers', orgId, type, search, page, size],
    queryFn: () => docsApi.listTrackers(orgId, type, search, page, size),
    enabled: !!orgId && !!type,
    staleTime: 1000 * 30,
  });
}

export function useCreateTracker() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ orgId, tracker }: { orgId: string; tracker: Omit<TrackerItem, 'id' | 'organizationId' | 'createdAt' | 'updatedAt'> }) =>
      docsApi.createTracker(orgId, tracker),
    onSuccess: (newTracker) => {
      queryClient.invalidateQueries({ queryKey: ['trackers', newTracker.organizationId, newTracker.type] });
    },
  });
}

export function useUpdateTracker() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ orgId, id, tracker }: { orgId: string; id: string; tracker: Partial<Omit<TrackerItem, 'id' | 'organizationId'>> }) =>
      docsApi.updateTracker(orgId, id, tracker),
    onSuccess: (updated) => {
      queryClient.invalidateQueries({ queryKey: ['trackers', updated.organizationId, updated.type] });
    },
  });
}

export function useDeleteTracker() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (vars: { orgId: string; id: string; type: string }) =>
      docsApi.deleteTracker(vars.orgId, vars.id),
    onSuccess: (_, { orgId, type }) => {
      queryClient.invalidateQueries({ queryKey: ['trackers', orgId, type] });
    },
  });
}
