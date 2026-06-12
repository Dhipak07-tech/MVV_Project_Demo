import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { organizationApi, type OrganizationSearchParams } from '../api/organizationApi';
import { QUERY_KEYS, STALE_TIME } from '../../../config/constants';
import type { CreateOrganizationInput, UpdateOrganizationInput } from '../types/organization.types';

/**
 * Hook for listing/searching organizations.
 */
export function useOrganizations(params: OrganizationSearchParams = {}) {
  return useQuery({
    queryKey: [QUERY_KEYS.ORGANIZATIONS, params],
    queryFn: () => organizationApi.list(params),
    staleTime: STALE_TIME.SHORT,
  });
}

/**
 * Hook for fetching a single organization.
 */
export function useOrganization(id: string | undefined) {
  return useQuery({
    queryKey: [QUERY_KEYS.ORGANIZATION, id],
    queryFn: () => organizationApi.getById(id!),
    enabled: !!id,
    staleTime: STALE_TIME.MEDIUM,
  });
}

/**
 * Hook for organization stats.
 */
export function useOrganizationStats() {
  return useQuery({
    queryKey: [QUERY_KEYS.ORGANIZATION, 'stats'],
    queryFn: () => organizationApi.getStats(),
    staleTime: STALE_TIME.MEDIUM,
  });
}

/**
 * Mutation hook for creating an organization.
 */
export function useCreateOrganization() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: CreateOrganizationInput) => organizationApi.create(input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.ORGANIZATIONS] });
    },
  });
}

/**
 * Mutation hook for updating an organization.
 */
export function useUpdateOrganization() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, input }: { id: string; input: UpdateOrganizationInput }) =>
      organizationApi.update(id, input),
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.ORGANIZATIONS] });
      queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.ORGANIZATION, id] });
    },
  });
}

/**
 * Mutation hook for archiving an organization.
 */
export function useArchiveOrganization() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => organizationApi.archive(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.ORGANIZATIONS] });
    },
  });
}

/**
 * Hook for global search across organizations using Elasticsearch.
 */
export function useGlobalSearch(query: string) {
  return useQuery({
    queryKey: ['global-search', query],
    queryFn: () => organizationApi.globalSearch(query),
    enabled: query.length >= 2,
    staleTime: 1000 * 10,
  });
}
