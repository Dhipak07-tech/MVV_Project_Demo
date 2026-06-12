import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { assetsApi, type Asset, type NetworkingAsset } from '../api/assetsApi';

export function useAssets(orgId: string, type: string, search = '', page = 0, size = 50) {
  return useQuery({
    queryKey: ['assets', orgId, type, search, page, size],
    queryFn: () => assetsApi.list(orgId, type, search, page, size),
    enabled: !!orgId && !!type,
    staleTime: 1000 * 30, // 30 seconds
  });
}

export function useCreateAsset() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ orgId, asset }: { orgId: string; asset: Omit<Asset, 'id' | 'organizationId' | 'createdAt' | 'updatedAt'> }) =>
      assetsApi.create(orgId, asset),
    onSuccess: (_, { orgId, asset }) => {
      queryClient.invalidateQueries({ queryKey: ['assets', orgId, asset.type] });
    },
  });
}

export function useUpdateAsset() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ orgId, id, asset }: { orgId: string; id: string; asset: Partial<Omit<Asset, 'id' | 'organizationId'>> }) =>
      assetsApi.update(orgId, id, asset),
    onSuccess: (updatedAsset) => {
      queryClient.invalidateQueries({ queryKey: ['assets', updatedAsset.organizationId, updatedAsset.type] });
    },
  });
}

export function useDeleteAsset() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ orgId, id }: { orgId: string; id: string; type: string }) =>
      assetsApi.delete(orgId, id),
    onSuccess: (_, { orgId, type }) => {
      queryClient.invalidateQueries({ queryKey: ['assets', orgId, type] });
    },
  });
}

export function useNetworkingAssets(orgId: string, type: string, search = '', page = 0, size = 50) {
  return useQuery({
    queryKey: ['networking', orgId, type, search, page, size],
    queryFn: () => assetsApi.listNetworking(orgId, type, search, page, size),
    enabled: !!orgId && !!type,
    staleTime: 1000 * 30,
  });
}

export function useCreateNetworkingAsset() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ orgId, asset }: { orgId: string; asset: Omit<NetworkingAsset, 'id' | 'organizationId' | 'createdAt' | 'updatedAt'> }) =>
      assetsApi.createNetworking(orgId, asset),
    onSuccess: (_, { orgId, asset }) => {
      queryClient.invalidateQueries({ queryKey: ['networking', orgId, asset.type] });
    },
  });
}

export function useUpdateNetworkingAsset() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ orgId, id, asset }: { orgId: string; id: string; asset: Partial<Omit<NetworkingAsset, 'id' | 'organizationId'>> }) =>
      assetsApi.updateNetworking(orgId, id, asset),
    onSuccess: (updatedAsset) => {
      queryClient.invalidateQueries({ queryKey: ['networking', updatedAsset.organizationId, updatedAsset.type] });
    },
  });
}

export function useDeleteNetworkingAsset() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ orgId, id }: { orgId: string; id: string; type: string }) =>
      assetsApi.deleteNetworking(orgId, id),
    onSuccess: (_, { orgId, type }) => {
      queryClient.invalidateQueries({ queryKey: ['networking', orgId, type] });
    },
  });
}
