export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080';
export const API_VERSION = '/api/v1';
export const API_URL = `${API_BASE_URL}${API_VERSION}`;

export const APP_NAME = 'ManageMyVault';
export const APP_DESCRIPTION = 'Enterprise Vault Management Platform for MSPs';

export const PAGINATION = {
  DEFAULT_PAGE_SIZE: 20,
  PAGE_SIZE_OPTIONS: [10, 20, 50, 100],
} as const;

export const FILE_UPLOAD = {
  MAX_FILE_SIZE: 10 * 1024 * 1024, // 10MB
  ACCEPTED_IMAGE_TYPES: ['image/png', 'image/jpeg', 'image/webp', 'image/svg+xml'],
} as const;

export const ROUTES = {
  HOME: '/',
  LOGIN: '/login',
  ORGANIZATIONS: '/organizations',
  ORGANIZATION_WORKSPACE: '/organizations/:orgId',
  PLATFORM_ADMIN: '/admin',
} as const;

export const QUERY_KEYS = {
  ORGANIZATIONS: 'organizations',
  ORGANIZATION: 'organization',
  ORGANIZATION_MEMBERS: 'organizationMembers',
  ORGANIZATION_STATS: 'organizationStats',
  PLATFORM_USERS: 'platformUsers',
  CURRENT_USER: 'currentUser',
  AUDIT_LOGS: 'auditLogs',
} as const;

export const STALE_TIME = {
  SHORT: 30 * 1000,       // 30 seconds
  MEDIUM: 5 * 60 * 1000,  // 5 minutes
  LONG: 30 * 60 * 1000,   // 30 minutes
} as const;
