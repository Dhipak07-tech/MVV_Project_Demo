import api from '../../organizations/api/organizationApi';
import type {
  DashboardOverviewDto,
  DashboardStatisticsDto,
  DashboardActivityDto,
  DashboardTrendDto,
  DashboardOrganizationDto,
  DashboardSecurityDto,
  DashboardStorageDto,
} from '../types/dashboard.types';

export const dashboardApi = {
  getOverview: async (): Promise<DashboardOverviewDto> => {
    if (localStorage.getItem('demoMode') === 'true') {
      await new Promise((resolve) => setTimeout(resolve, 200));
      return {
        healthScore: 88,
        healthStatus: 'Healthy',
        healthBreakdown: {
          documentation: 90,
          assets: 85,
          passwords: 78,
          security: 92,
          backups: 95,
          compliance: 90,
        },
        notifications: [
          {
            id: 'n1',
            severity: 'WARNING',
            title: 'SSL Certificate Expiring',
            message: 'ssl.acme.com certificate expires in 6 days.',
            timestamp: new Date().toISOString(),
          },
          {
            id: 'n2',
            severity: 'CRITICAL',
            title: 'Backup Failure',
            message: 'Veeam Backup Job: Acme Corp File Server failed yesterday.',
            timestamp: new Date(Date.now() - 3600000).toISOString(),
          },
          {
            id: 'n3',
            severity: 'INFO',
            title: 'Exception Review Needed',
            message: '2 compliance exceptions are pending administrative approval.',
            timestamp: new Date(Date.now() - 7200000).toISOString(),
          },
        ],
      };
    }

    const { data } = await api.get<DashboardOverviewDto>('/dashboard/overview');
    return data;
  },

  getStatistics: async (): Promise<DashboardStatisticsDto> => {
    if (localStorage.getItem('demoMode') === 'true') {
      await new Promise((resolve) => setTimeout(resolve, 200));
      return {
        cards: [
          { title: 'Organizations', count: 12, change30Days: 2, growthRate: 20.0, trend: 'UP' },
          { title: 'Sites', count: 48, change30Days: 6, growthRate: 14.3, trend: 'UP' },
          { title: 'Contacts', count: 242, change30Days: 28, growthRate: 13.1, trend: 'UP' },
          { title: 'Passwords', count: 1450, change30Days: 120, growthRate: 9.0, trend: 'UP' },
          { title: 'Documents', count: 320, change30Days: 15, growthRate: 4.9, trend: 'UP' },
          { title: 'Assets', count: 852, change30Days: 42, growthRate: 5.2, trend: 'UP' },
          { title: 'Networks', count: 18, change30Days: 0, growthRate: 0.0, trend: 'NEUTRAL' },
          { title: 'Vendors', count: 34, change30Days: 3, growthRate: 9.7, trend: 'UP' },
          { title: 'Users', count: 64, change30Days: 4, growthRate: 6.7, trend: 'UP' },
        ],
      };
    }

    const { data } = await api.get<DashboardStatisticsDto>('/dashboard/statistics');
    return data;
  },

  getActivity: async (): Promise<DashboardActivityDto> => {
    if (localStorage.getItem('demoMode') === 'true') {
      await new Promise((resolve) => setTimeout(resolve, 200));
      return {
        recentActivity: [
          {
            id: 'a1',
            user: 'Sarah Connor',
            action: 'updated',
            entityType: 'PASSWORD',
            entityId: 'p1',
            details: 'Rotated password for admin-domain-controller',
            organization: 'Acme Corporation',
            organizationId: 'b0000000-0000-0000-0000-000000000001',
            timestamp: new Date().toISOString(),
          },
          {
            id: 'a2',
            user: 'John Doe',
            action: 'created',
            entityType: 'DOCUMENT',
            entityId: 'd1',
            details: 'Created document: Office 365 Tenant Migration Guide',
            organization: 'Initech Corp',
            organizationId: 'b0000000-0000-0000-0000-000000000002',
            timestamp: new Date(Date.now() - 1200000).toISOString(),
          },
          {
            id: 'a3',
            user: 'System Bot',
            action: 'scanned',
            entityType: 'ASSET',
            entityId: 'as1',
            details: 'Discovered 4 new IP addresses in subnet 192.168.1.0/24',
            organization: 'Hooli Inc',
            organizationId: 'b0000000-0000-0000-0000-000000000003',
            timestamp: new Date(Date.now() - 3600000).toISOString(),
          },
        ],
        recentlyUpdated: [
          {
            id: 'r1',
            title: 'Admin Domain Controller',
            type: 'PASSWORD',
            updatedBy: 'Sarah Connor',
            updatedAt: new Date().toISOString(),
            organization: 'Acme Corporation',
            organizationId: 'b0000000-0000-0000-0000-000000000001',
          },
          {
            id: 'r2',
            title: 'Office 365 Tenant Migration Guide',
            type: 'DOCUMENT',
            updatedBy: 'John Doe',
            updatedAt: new Date(Date.now() - 1200000).toISOString(),
            organization: 'Initech Corp',
            organizationId: 'b0000000-0000-0000-0000-000000000002',
          },
          {
            id: 'r3',
            title: 'Main Office Router',
            type: 'ASSET',
            updatedBy: 'Alex Mercer',
            updatedAt: new Date(Date.now() - 5000000).toISOString(),
            organization: 'Hooli Inc',
            organizationId: 'b0000000-0000-0000-0000-000000000003',
          },
        ],
      };
    }

    const { data } = await api.get<DashboardActivityDto>('/dashboard/activity');
    return data;
  },

  getTrends: async (days: number = 30): Promise<DashboardTrendDto> => {
    if (localStorage.getItem('demoMode') === 'true') {
      await new Promise((resolve) => setTimeout(resolve, 200));
      const trends = [];
      const end = new Date();
      for (let i = days; i >= 0; i--) {
        const d = new Date(end);
        d.setDate(d.getDate() - i);
        trends.push({
          date: d.toISOString().split('T')[0],
          assets: Math.round(500 + (days - i) * 10 + Math.sin(i) * 5),
          passwords: Math.round(1000 + (days - i) * 15 + Math.cos(i) * 10),
          documents: Math.round(200 + (days - i) * 4),
          contacts: Math.round(150 + (days - i) * 3),
          sites: Math.round(30 + (days - i) * 0.5),
        });
      }
      return { trends };
    }

    const { data } = await api.get<DashboardTrendDto>('/dashboard/trends', {
      params: { days },
    });
    return data;
  },

  getOrganizations: async (): Promise<DashboardOrganizationDto[]> => {
    if (localStorage.getItem('demoMode') === 'true') {
      await new Promise((resolve) => setTimeout(resolve, 200));
      return [
        {
          id: 'b0000000-0000-0000-0000-000000000001',
          name: 'Acme Corporation',
          slug: 'acme-corporation',
          logoUrl: null,
          healthScore: 92,
          siteCount: 4,
          assetCount: 124,
          pinned: true,
          favorite: true,
        },
        {
          id: 'b0000000-0000-0000-0000-000000000002',
          name: 'Initech Corp',
          slug: 'initech-corp',
          logoUrl: null,
          healthScore: 84,
          siteCount: 2,
          assetCount: 52,
          pinned: true,
          favorite: false,
        },
        {
          id: 'b0000000-0000-0000-0000-000000000003',
          name: 'Hooli Inc',
          slug: 'hooli-inc',
          logoUrl: null,
          healthScore: 89,
          siteCount: 3,
          assetCount: 88,
          pinned: false,
          favorite: false,
        },
      ];
    }

    const { data } = await api.get<DashboardOrganizationDto[]>('/dashboard/organizations');
    return data;
  },

  getSecurity: async (): Promise<DashboardSecurityDto> => {
    if (localStorage.getItem('demoMode') === 'true') {
      await new Promise((resolve) => setTimeout(resolve, 200));
      return {
        expiredPasswords: 14,
        weakPasswords: 8,
        reusedPasswords: 26,
        missingRotationPasswords: 42,
        expiredDomains: 1,
        expiredSslCertificates: 2,
        unreviewedExceptions: 3,
        securityHealthScore: 82,
      };
    }

    const { data } = await api.get<DashboardSecurityDto>('/dashboard/security');
    return data;
  },

  getStorage: async (): Promise<DashboardStorageDto> => {
    if (localStorage.getItem('demoMode') === 'true') {
      await new Promise((resolve) => setTimeout(resolve, 200));
      const trends = [];
      const end = new Date();
      for (let i = 30; i >= 0; i--) {
        const d = new Date(end);
        d.setDate(d.getDate() - i);
        trends.push({
          date: d.toISOString().split('T')[0],
          bytes: Math.round(150000000 + (30 - i) * 2500000),
        });
      }
      return {
        databaseSizeBytes: 42991616,
        databaseSizeReadable: '41 MB',
        minioUsageBytes: 254803968,
        minioUsageReadable: '243 MB',
        attachmentCount: 154,
        documentCount: 320,
        averageUploadSizeBytes: 1654571.22,
        averageUploadSizeReadable: '1.5 MB',
        trends,
      };
    }

    const { data } = await api.get<DashboardStorageDto>('/dashboard/storage');
    return data;
  },
};
