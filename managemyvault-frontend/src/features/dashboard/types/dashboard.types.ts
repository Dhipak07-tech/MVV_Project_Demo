export interface NotificationDto {
  id: string;
  severity: 'CRITICAL' | 'WARNING' | 'INFO';
  title: string;
  message: string;
  timestamp: string;
}

export interface DashboardOverviewDto {
  healthScore: number;
  healthStatus: string;
  healthBreakdown: Record<string, number>;
  notifications: NotificationDto[];
}

export interface StatisticCard {
  title: string;
  count: number;
  change30Days: number;
  growthRate: number;
  trend: 'UP' | 'DOWN' | 'NEUTRAL';
}

export interface DashboardStatisticsDto {
  cards: StatisticCard[];
}

export interface ActivityItem {
  id: string;
  user: string;
  action: string;
  entityType: string;
  entityId: string;
  details: string;
  organization: string;
  organizationId: string;
  timestamp: string;
}

export interface UpdatedRecordItem {
  id: string;
  title: string;
  type: 'PASSWORD' | 'DOCUMENT' | 'SITE' | 'CONTACT' | 'ASSET';
  updatedBy: string;
  updatedAt: string;
  organization: string;
  organizationId: string;
}

export interface DashboardActivityDto {
  recentActivity: ActivityItem[];
  recentlyUpdated: UpdatedRecordItem[];
}

export interface TrendDataPoint {
  date: string;
  assets: number;
  passwords: number;
  documents: number;
  contacts: number;
  sites: number;
}

export interface DashboardTrendDto {
  trends: TrendDataPoint[];
}

export interface DashboardOrganizationDto {
  id: string;
  name: string;
  slug: string;
  logoUrl: string | null;
  healthScore: number;
  siteCount: number;
  assetCount: number;
  pinned: boolean;
  favorite: boolean;
}

export interface DashboardSecurityDto {
  expiredPasswords: number;
  weakPasswords: number;
  reusedPasswords: number;
  missingRotationPasswords: number;
  expiredDomains: number;
  expiredSslCertificates: number;
  unreviewedExceptions: number;
  securityHealthScore: number;
}

export interface StorageDataPoint {
  date: string;
  bytes: number;
}

export interface DashboardStorageDto {
  databaseSizeBytes: number;
  databaseSizeReadable: string;
  minioUsageBytes: number;
  minioUsageReadable: string;
  attachmentCount: number;
  documentCount: number;
  averageUploadSizeBytes: number;
  averageUploadSizeReadable: string;
  trends: StorageDataPoint[];
}
