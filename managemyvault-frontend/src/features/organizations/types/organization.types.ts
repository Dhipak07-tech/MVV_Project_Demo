import { z } from 'zod';

// ============================================
// Enums
// ============================================

export const OrganizationStatusEnum = z.enum([
  'ACTIVE',
  'INACTIVE',
  'SUSPENDED',
  'ARCHIVED',
  'PENDING',
]);

export type OrganizationStatus = z.infer<typeof OrganizationStatusEnum>;

export const OrgRoleEnum = z.enum([
  'ORG_ADMIN',
  'TECHNICIAN',
  'AUDITOR',
  'READ_ONLY',
]);

export type OrgRole = z.infer<typeof OrgRoleEnum>;

// ============================================
// Organization Schemas
// ============================================

export const OrganizationSummarySchema = z.object({
  id: z.string().uuid(),
  name: z.string(),
  slug: z.string(),
  industry: z.string().nullable().optional(),
  logoUrl: z.string().nullable().optional(),
  status: OrganizationStatusEnum,
  healthScore: z.number().min(0).max(100).nullable(),
  createdAt: z.string(),
  memberCount: z.number().default(0),
  assetCount: z.number().default(0),
  passwordCount: z.number().default(0),
  documentCount: z.number().default(0),
});

export type OrganizationSummary = z.infer<typeof OrganizationSummarySchema>;

export const OrganizationSchema = z.object({
  id: z.string().uuid(),
  name: z.string(),
  slug: z.string(),
  description: z.string().nullable().optional(),
  industry: z.string().nullable().optional(),
  companySize: z.string().nullable().optional(),
  website: z.string().nullable().optional(),
  phone: z.string().nullable().optional(),
  email: z.string().nullable().optional(),
  logoUrl: z.string().nullable().optional(),
  status: OrganizationStatusEnum,
  healthScore: z.number().min(0).max(100).nullable(),
  timezone: z.string().default('UTC'),
  countryCode: z.string().nullable().optional(),
  addressLine1: z.string().nullable().optional(),
  addressLine2: z.string().nullable().optional(),
  city: z.string().nullable().optional(),
  stateProvince: z.string().nullable().optional(),
  postalCode: z.string().nullable().optional(),
  metadata: z.record(z.string(), z.unknown()).default({}),
  settings: z.record(z.string(), z.unknown()).default({}),
  createdAt: z.string(),
  updatedAt: z.string(),
  createdBy: z.string().uuid().nullable().optional(),
  memberCount: z.number().default(0),
  assetCount: z.number().default(0),
  passwordCount: z.number().default(0),
  documentCount: z.number().default(0),
  contactCount: z.number().default(0),
  lastActivity: z.string().nullable().optional(),
});

export type Organization = z.infer<typeof OrganizationSchema>;

// ============================================
// Request Schemas (Form validation)
// ============================================

export const CreateOrganizationSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters').max(255),
  description: z.string().max(5000).optional(),
  industry: z.string().max(100).optional(),
  companySize: z.string().max(50).optional(),
  website: z.string().url('Must be a valid URL').max(500).optional().or(z.literal('')),
  phone: z.string().max(50).optional(),
  email: z.string().email('Must be a valid email').max(255).optional().or(z.literal('')),
  timezone: z.string().max(100).optional(),
  countryCode: z.string().max(10).optional(),
  addressLine1: z.string().max(255).optional(),
  addressLine2: z.string().max(255).optional(),
  city: z.string().max(100).optional(),
  stateProvince: z.string().max(100).optional(),
  postalCode: z.string().max(20).optional(),
});

export type CreateOrganizationInput = z.infer<typeof CreateOrganizationSchema>;

export const UpdateOrganizationSchema = CreateOrganizationSchema.partial();
export type UpdateOrganizationInput = z.infer<typeof UpdateOrganizationSchema>;

// ============================================
// Filter Types
// ============================================

export interface OrganizationFilters {
  status?: OrganizationStatus;
  industry?: string;
}

// ============================================
// Page Response
// ============================================

export interface PageResponse<T> {
  content: T[];
  totalElements: number;
  totalPages: number;
  number: number;
  size: number;
  first: boolean;
  last: boolean;
}

// ============================================
// Auth Types
// ============================================

export interface LoginRequest {
  email: string;
  password: string;
}

export interface AuthResponse {
  accessToken: string;
  refreshToken: string;
  tokenType: string;
  expiresIn: number;
  user: UserInfo;
}

export interface UserInfo {
  id: string;
  email: string;
  fullName: string;
  role: string;
  organizationId?: string;
}
