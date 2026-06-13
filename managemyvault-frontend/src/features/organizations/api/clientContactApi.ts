import api from './organizationApi';
import { API_URL } from '../../../config/constants';

// ============================================================================
// Types
// ============================================================================

export interface Contact {
  id: string;
  firstName: string;
  lastName: string;
  role: string;
  email: string;
  phone: string;
  mobile: string;
  department: string;
  primaryContact: boolean;
  emergencyContact: boolean;
  authorizationContact: boolean;
  notes: string;
  isActive: boolean;
}

export interface LocationItem {
  id: string;
  name: string;
  address: string;
  city: string;
  state: string;
  zip: string;
  country: string;
  type: 'HQ' | 'Branch' | 'Data Center' | 'Remote';
  phone: string;
  timezone: string;
  primaryLocation: boolean;
  notes: string;
}

export interface AfterHoursData {
  id?: string;
  organizationId: string;
  alarmCodes: string;
  afterHoursProcedure: string;
  emergencyPhone: string;
  escalationProcedure: string;
  securityVendor: string;
  notes: string;
  updatedAt?: string;
}

export interface OnsiteData {
  id?: string;
  organizationId: string;
  parkingInstructions: string;
  buildingAccess: string;
  serverRoomAccess: string;
  wifiInformation: string;
  keyLocations: string;
  notes: string;
  updatedAt?: string;
}

export interface LegacySummary {
  id: string;
  organizationId: string;
  title: string;
  content: string;
  archived: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface Attachment {
  id: string;
  fileName: string;
  contentType: string;
  size: number;
  createdAt: string;
  createdBy: string;
}

export interface RelatedItem {
  id: string;
  relatedEntityType: string;
  relatedEntityId: string;
  relatedEntityName: string;
  createdAt: string;
}

export interface ActivityEvent {
  id: string;
  action: string;
  userId: string;
  userName?: string;
  details?: string;
  timestamp: string;
}

export interface EntityRevision {
  id: string;
  beforeState: string | null;
  afterState: string | null;
  changedBy: string;
  changedByName?: string;
  changedAt: string;
}

// ============================================================================
// Local Storage Keys & Initial Data
// ============================================================================

const KEYS = {
  CONTACTS: 'mmv_mock_contacts',
  LOCATIONS: 'mmv_mock_locations',
  AFTER_HOURS: 'mmv_mock_after_hours',
  ONSITE: 'mmv_mock_onsite_information',
  LEGACY: 'mmv_mock_legacy_summaries',
  ATTACHMENTS: 'mmv_mock_attachments',
  RELATIONSHIPS: 'mmv_mock_relationships',
  ACTIVITIES: 'mmv_mock_activities',
  REVISIONS: 'mmv_mock_revisions'
};

function getStored<T>(key: string, initial: T): T {
  const data = localStorage.getItem(key);
  if (!data) {
    localStorage.setItem(key, JSON.stringify(initial));
    return initial;
  }
  return JSON.parse(data);
}

function setStored<T>(key: string, data: T) {
  localStorage.setItem(key, JSON.stringify(data));
}

// Initial mock data definitions
const INITIAL_CONTACTS: Contact[] = [
  {
    id: 'c57eae61-c8d6-491c-bc48-9a7e2f9c645d',
    firstName: 'John',
    lastName: 'Connor',
    role: 'IT Director',
    email: 'john@acme.com',
    phone: '+1-555-0100',
    mobile: '+1-555-0101',
    department: 'IT',
    primaryContact: true,
    emergencyContact: false,
    authorizationContact: true,
    notes: 'Primary IT contact',
    isActive: true
  },
  {
    id: '70b2a304-1533-4ffe-93c8-2dfc4a02c568',
    firstName: 'Sarah',
    lastName: 'Connor',
    role: 'Security Lead',
    email: 'sarah@acme.com',
    phone: '+1-555-0200',
    mobile: '+1-555-0202',
    department: 'Security',
    primaryContact: false,
    emergencyContact: true,
    authorizationContact: true,
    notes: 'Escalation for security matters',
    isActive: true
  },
  {
    id: '86db5820-7e4e-49ab-98e4-cbb2069513da',
    firstName: 'Miles',
    lastName: 'Dyson',
    role: 'Lead Architect',
    email: 'miles@acme.com',
    phone: '+1-555-0300',
    mobile: '',
    department: 'Engineering',
    primaryContact: false,
    emergencyContact: false,
    authorizationContact: false,
    notes: 'System design expert',
    isActive: true
  }
];

const INITIAL_LOCATIONS: LocationItem[] = [
  {
    id: 'l1111111-1111-1111-1111-111111111111',
    name: 'Acme Corp Headquarters',
    address: '123 Desert Road',
    city: 'Phoenix',
    state: 'AZ',
    zip: '85001',
    country: 'US',
    type: 'HQ',
    phone: '+1 555-0199',
    timezone: 'America/New_York',
    primaryLocation: true,
    notes: 'Corporate headquarters with card access.'
  }
];

const INITIAL_AFTER_HOURS: Record<string, AfterHoursData> = {
  'b0000000-0000-0000-0000-000000000001': {
    organizationId: 'b0000000-0000-0000-0000-000000000001',
    alarmCodes: 'Partition 1: 4921 | Partition 2: 9081',
    afterHoursProcedure: 'Call emergency line. Escalate to Sarah Connor if no response within 15 minutes.',
    emergencyPhone: '+1-555-9111',
    escalationProcedure: '1. Contact Sarah Connor\n2. Call Security Dispatch',
    securityVendor: 'Securitas USA',
    notes: 'Keypad is next to the primary warehouse entrance.',
    updatedAt: new Date().toISOString()
  }
};

const INITIAL_ONSITE: Record<string, OnsiteData> = {
  'b0000000-0000-0000-0000-000000000001': {
    organizationId: 'b0000000-0000-0000-0000-000000000001',
    parkingInstructions: 'Visitor parking is located in front of the main lobby. Parking spaces 10-25.',
    buildingAccess: 'Front gate is open 07:00 - 18:00. Use badge reader after hours.',
    serverRoomAccess: 'Requires keycard and biometric fingerprint scan. Managed by John Connor.',
    wifiInformation: 'SSID: Weyland-Corp-Secure | Password in Password Vault under "Wi-Fi Access"',
    keyLocations: 'Server keys are stored in the lockbox in the admin office.',
    notes: 'Server room is located on the 2nd floor, room 204.',
    updatedAt: new Date().toISOString()
  }
};

const INITIAL_LEGACY: LegacySummary[] = [
  {
    id: 'leg11111-1111-1111-1111-111111111111',
    organizationId: 'b0000000-0000-0000-0000-000000000001',
    title: 'Historical Site Plan (2020)',
    content: 'This document details the original wiring configurations, network drops, and rack placements for the Acme Corp Headquarters.',
    archived: false,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  }
];

// Helper to check demo mode
const isDemo = () => localStorage.getItem('demoMode') === 'true';

// ============================================================================
// API Object
// ============================================================================

export const clientContactApi = {
  // ------------------------------------------
  // Contacts
  // ------------------------------------------
  contacts: {
    list: async (orgId: string): Promise<Contact[]> => {
      if (isDemo()) {
        await new Promise(r => setTimeout(r, 200));
        return getStored<Contact[]>(KEYS.CONTACTS, INITIAL_CONTACTS);
      }
      const { data } = await api.get<Contact[]>('/contacts', { params: { organizationId: orgId } });
      return data;
    },
    search: async (orgId: string, query: string): Promise<Contact[]> => {
      if (isDemo()) {
        await new Promise(r => setTimeout(r, 150));
        const list = getStored<Contact[]>(KEYS.CONTACTS, INITIAL_CONTACTS);
        if (!query) return list;
        const q = query.toLowerCase();
        return list.filter(c => 
          `${c.firstName} ${c.lastName}`.toLowerCase().includes(q) ||
          (c.role || '').toLowerCase().includes(q) ||
          (c.email || '').toLowerCase().includes(q)
        );
      }
      const { data } = await api.get<Contact[]>('/contacts/search', { params: { organizationId: orgId, query } });
      return data;
    },
    get: async (id: string): Promise<Contact> => {
      if (isDemo()) {
        await new Promise(r => setTimeout(r, 100));
        const list = getStored<Contact[]>(KEYS.CONTACTS, INITIAL_CONTACTS);
        const item = list.find(c => c.id === id);
        if (!item) throw { response: { status: 404 } };
        return item;
      }
      const { data } = await api.get<Contact>(`/contacts/${id}`);
      return data;
    },
    create: async (orgId: string, payload: Omit<Contact, 'id'>): Promise<Contact> => {
      if (isDemo()) {
        await new Promise(r => setTimeout(r, 200));
        const list = getStored<Contact[]>(KEYS.CONTACTS, INITIAL_CONTACTS);
        const newItem: Contact = { ...payload, id: crypto.randomUUID() };
        list.push(newItem);
        setStored(KEYS.CONTACTS, list);
        return newItem;
      }
      const { data } = await api.post<Contact>('/contacts', payload, { params: { organizationId: orgId } });
      return data;
    },
    update: async (id: string, payload: Partial<Contact>): Promise<Contact> => {
      if (isDemo()) {
        await new Promise(r => setTimeout(r, 200));
        const list = getStored<Contact[]>(KEYS.CONTACTS, INITIAL_CONTACTS);
        const idx = list.findIndex(c => c.id === id);
        if (idx === -1) throw new Error('Contact not found');
        const updated = { ...list[idx], ...payload };
        list[idx] = updated;
        setStored(KEYS.CONTACTS, list);
        return updated;
      }
      const { data } = await api.put<Contact>(`/contacts/${id}`, payload);
      return data;
    },
    delete: async (id: string): Promise<void> => {
      if (isDemo()) {
        await new Promise(r => setTimeout(r, 150));
        const list = getStored<Contact[]>(KEYS.CONTACTS, INITIAL_CONTACTS);
        setStored(KEYS.CONTACTS, list.filter(c => c.id !== id));
        return;
      }
      await api.delete(`/contacts/${id}`);
    }
  },

  // ------------------------------------------
  // Locations
  // ------------------------------------------
  locations: {
    list: async (orgId: string): Promise<LocationItem[]> => {
      if (isDemo()) {
        await new Promise(r => setTimeout(r, 200));
        return getStored<LocationItem[]>(KEYS.LOCATIONS, INITIAL_LOCATIONS);
      }
      const { data } = await api.get<LocationItem[]>('/locations', { params: { organizationId: orgId } });
      return data;
    },
    get: async (id: string): Promise<LocationItem> => {
      if (isDemo()) {
        await new Promise(r => setTimeout(r, 100));
        const list = getStored<LocationItem[]>(KEYS.LOCATIONS, INITIAL_LOCATIONS);
        const item = list.find(l => l.id === id);
        if (!item) throw { response: { status: 404 } };
        return item;
      }
      const { data } = await api.get<LocationItem>(`/locations/${id}`);
      return data;
    },
    create: async (orgId: string, payload: Omit<LocationItem, 'id'>): Promise<LocationItem> => {
      if (isDemo()) {
        await new Promise(r => setTimeout(r, 200));
        const list = getStored<LocationItem[]>(KEYS.LOCATIONS, INITIAL_LOCATIONS);
        const newItem: LocationItem = { ...payload, id: crypto.randomUUID() };
        list.push(newItem);
        setStored(KEYS.LOCATIONS, list);
        return newItem;
      }
      const { data } = await api.post<LocationItem>('/locations', payload, { params: { organizationId: orgId } });
      return data;
    },
    update: async (id: string, payload: Partial<LocationItem>): Promise<LocationItem> => {
      if (isDemo()) {
        await new Promise(r => setTimeout(r, 200));
        const list = getStored<LocationItem[]>(KEYS.LOCATIONS, INITIAL_LOCATIONS);
        const idx = list.findIndex(l => l.id === id);
        if (idx === -1) throw new Error('Location not found');
        const updated = { ...list[idx], ...payload };
        list[idx] = updated;
        setStored(KEYS.LOCATIONS, list);
        return updated;
      }
      const { data } = await api.put<LocationItem>(`/locations/${id}`, payload);
      return data;
    },
    delete: async (id: string): Promise<void> => {
      if (isDemo()) {
        await new Promise(r => setTimeout(r, 150));
        const list = getStored<LocationItem[]>(KEYS.LOCATIONS, INITIAL_LOCATIONS);
        setStored(KEYS.LOCATIONS, list.filter(l => l.id !== id));
        return;
      }
      await api.delete(`/locations/${id}`);
    }
  },

  // ------------------------------------------
  // After Hours Procedure
  // ------------------------------------------
  afterHours: {
    get: async (orgId: string): Promise<AfterHoursData> => {
      if (isDemo()) {
        await new Promise(r => setTimeout(r, 200));
        const map = getStored<Record<string, AfterHoursData>>(KEYS.AFTER_HOURS, INITIAL_AFTER_HOURS);
        if (!map[orgId]) {
          map[orgId] = {
            organizationId: orgId,
            alarmCodes: '',
            afterHoursProcedure: '',
            emergencyPhone: '',
            escalationProcedure: '',
            securityVendor: '',
            notes: '',
            updatedAt: new Date().toISOString()
          };
          setStored(KEYS.AFTER_HOURS, map);
        }
        return map[orgId];
      }
      const { data } = await api.get<AfterHoursData>('/after-hours', { params: { organizationId: orgId } });
      return data;
    },
    save: async (payload: AfterHoursData): Promise<AfterHoursData> => {
      if (isDemo()) {
        await new Promise(r => setTimeout(r, 200));
        const map = getStored<Record<string, AfterHoursData>>(KEYS.AFTER_HOURS, INITIAL_AFTER_HOURS);
        const updated = { ...payload, updatedAt: new Date().toISOString() };
        map[payload.organizationId] = updated;
        setStored(KEYS.AFTER_HOURS, map);
        return updated;
      }
      const { data } = await api.post<AfterHoursData>('/after-hours', payload);
      return data;
    }
  },

  // ------------------------------------------
  // Onsite Information
  // ------------------------------------------
  onsite: {
    get: async (orgId: string): Promise<OnsiteData> => {
      if (isDemo()) {
        await new Promise(r => setTimeout(r, 200));
        const map = getStored<Record<string, OnsiteData>>(KEYS.ONSITE, INITIAL_ONSITE);
        if (!map[orgId]) {
          map[orgId] = {
            organizationId: orgId,
            parkingInstructions: '',
            buildingAccess: '',
            serverRoomAccess: '',
            wifiInformation: '',
            keyLocations: '',
            notes: '',
            updatedAt: new Date().toISOString()
          };
          setStored(KEYS.ONSITE, map);
        }
        return map[orgId];
      }
      const { data } = await api.get<OnsiteData>('/onsite-information', { params: { organizationId: orgId } });
      return data;
    },
    save: async (payload: OnsiteData): Promise<OnsiteData> => {
      if (isDemo()) {
        await new Promise(r => setTimeout(r, 200));
        const map = getStored<Record<string, OnsiteData>>(KEYS.ONSITE, INITIAL_ONSITE);
        const updated = { ...payload, updatedAt: new Date().toISOString() };
        map[payload.organizationId] = updated;
        setStored(KEYS.ONSITE, map);
        return updated;
      }
      const { data } = await api.post<OnsiteData>('/onsite-information', payload);
      return data;
    }
  },

  // ------------------------------------------
  // Legacy Site Summary
  // ------------------------------------------
  legacy: {
    list: async (orgId: string): Promise<LegacySummary[]> => {
      if (isDemo()) {
        await new Promise(r => setTimeout(r, 200));
        const list = getStored<LegacySummary[]>(KEYS.LEGACY, INITIAL_LEGACY);
        return list.filter(l => l.organizationId === orgId);
      }
      const { data } = await api.get<LegacySummary[]>('/legacy-site-summaries', { params: { organizationId: orgId } });
      return data;
    },
    get: async (id: string): Promise<LegacySummary> => {
      if (isDemo()) {
        await new Promise(r => setTimeout(r, 100));
        const list = getStored<LegacySummary[]>(KEYS.LEGACY, INITIAL_LEGACY);
        const item = list.find(l => l.id === id);
        if (!item) throw { response: { status: 404 } };
        return item;
      }
      const { data } = await api.get<LegacySummary>(`/legacy-site-summaries/${id}`);
      return data;
    },
    create: async (payload: Omit<LegacySummary, 'id' | 'createdAt' | 'updatedAt'>): Promise<LegacySummary> => {
      if (isDemo()) {
        await new Promise(r => setTimeout(r, 200));
        const list = getStored<LegacySummary[]>(KEYS.LEGACY, INITIAL_LEGACY);
        const newItem: LegacySummary = {
          ...payload,
          id: crypto.randomUUID(),
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        };
        list.push(newItem);
        setStored(KEYS.LEGACY, list);
        return newItem;
      }
      const { data } = await api.post<LegacySummary>('/legacy-site-summaries', payload);
      return data;
    },
    update: async (id: string, payload: Partial<LegacySummary>): Promise<LegacySummary> => {
      if (isDemo()) {
        await new Promise(r => setTimeout(r, 200));
        const list = getStored<LegacySummary[]>(KEYS.LEGACY, INITIAL_LEGACY);
        const idx = list.findIndex(l => l.id === id);
        if (idx === -1) throw new Error('Legacy summary not found');
        const updated = {
          ...list[idx],
          ...payload,
          updatedAt: new Date().toISOString()
        };
        list[idx] = updated;
        setStored(KEYS.LEGACY, list);
        return updated;
      }
      const { data } = await api.put<LegacySummary>(`/legacy-site-summaries/${id}`, payload);
      return data;
    },
    delete: async (id: string): Promise<void> => {
      if (isDemo()) {
        await new Promise(r => setTimeout(r, 150));
        const list = getStored<LegacySummary[]>(KEYS.LEGACY, INITIAL_LEGACY);
        setStored(KEYS.LEGACY, list.filter(l => l.id !== id));
        return;
      }
      await api.delete(`/legacy-site-summaries/${id}`);
    }
  },

  // ------------------------------------------
  // Attachments
  // ------------------------------------------
  attachments: {
    list: async (entityType: string, entityId: string, orgId: string): Promise<Attachment[]> => {
      if (isDemo()) {
        await new Promise(r => setTimeout(r, 200));
        const list = getStored<Attachment[]>(KEYS.ATTACHMENTS, []);
        // Match mock attachments
        return list.filter((a: any) => a.entityType === entityType && a.entityId === entityId);
      }
      const { data } = await api.get<Attachment[]>(`/attachments/${entityType}/${entityId}`, { params: { organizationId: orgId } });
      return data;
    },
    upload: async (orgId: string, entityType: string, entityId: string, file: File): Promise<Attachment> => {
      if (isDemo()) {
        await new Promise(r => setTimeout(r, 500));
        const list = getStored<Attachment[]>(KEYS.ATTACHMENTS, []);
        const newAttachment: any = {
          id: crypto.randomUUID(),
          entityType,
          entityId,
          fileName: file.name,
          contentType: file.type || 'application/octet-stream',
          size: file.size,
          createdAt: new Date().toISOString(),
          createdBy: 'System Administrator'
        };
        list.push(newAttachment);
        setStored(KEYS.ATTACHMENTS, list);

        // Log an activity for upload
        clientContactApi.activities.log(orgId, entityType, entityId, 'ATTACHMENT_UPLOAD', "Uploaded " + file.name);

        return newAttachment;
      }

      const formData = new FormData();
      formData.append('organizationId', orgId);
      formData.append('entityType', entityType);
      formData.append('entityId', entityId);
      formData.append('file', file);
      const { data } = await api.post<Attachment>('/attachments/upload', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      return data;
    },
    delete: async (id: string, orgId: string, entityType: string, entityId: string, fileName: string): Promise<void> => {
      if (isDemo()) {
        await new Promise(r => setTimeout(r, 150));
        const list = getStored<Attachment[]>(KEYS.ATTACHMENTS, []);
        setStored(KEYS.ATTACHMENTS, list.filter(a => a.id !== id));

        // Log an activity for deletion
        clientContactApi.activities.log(orgId, entityType, entityId, 'ATTACHMENT_DELETE', "Deleted " + fileName);
        return;
      }
      await api.delete(`/attachments/${id}`);
    },
    downloadUrl: (id: string): string => {
      const token = localStorage.getItem('accessToken');
      return `${API_URL}/attachments/${id}/download?token=${token}`;
    }
  },

  // ------------------------------------------
  // Relationships
  // ------------------------------------------
  relationships: {
    list: async (entityType: string, entityId: string, orgId: string): Promise<RelatedItem[]> => {
      if (isDemo()) {
        await new Promise(r => setTimeout(r, 200));
        const list = getStored<RelatedItem[]>(KEYS.RELATIONSHIPS, []);
        // Return matching items from the mock relationship store
        return list.filter((r: any) => r.entityType === entityType && r.entityId === entityId);
      }
      const { data } = await api.get<RelatedItem[]>(`/relationships/${entityType}/${entityId}`, { params: { organizationId: orgId } });
      return data;
    },
    link: async (payload: { organizationId: string; sourceType: string; sourceId: string; targetType: string; targetId: string; targetName: string }): Promise<RelatedItem> => {
      if (isDemo()) {
        await new Promise(r => setTimeout(r, 200));
        const list = getStored<RelatedItem[]>(KEYS.RELATIONSHIPS, []);
        
        const newRel: any = {
          id: crypto.randomUUID(),
          entityType: payload.sourceType,
          entityId: payload.sourceId,
          relatedEntityType: payload.targetType,
          relatedEntityId: payload.targetId,
          relatedEntityName: payload.targetName,
          createdAt: new Date().toISOString()
        };

        // Add both directions for mock representation
        const reverseRel: any = {
          id: crypto.randomUUID(),
          entityType: payload.targetType,
          entityId: payload.targetId,
          relatedEntityType: payload.sourceType,
          relatedEntityId: payload.sourceId,
          relatedEntityName: `Source Record (${payload.sourceId.substring(0, 8)})`,
          createdAt: new Date().toISOString()
        };

        list.push(newRel, reverseRel);
        setStored(KEYS.RELATIONSHIPS, list);

        // Log activities
        clientContactApi.activities.log(payload.organizationId, payload.sourceType, payload.sourceId, 'RELATIONSHIP_CREATE', `${payload.targetType}: ${payload.targetName}`);

        return newRel;
      }
      const { data } = await api.post<RelatedItem>('/relationships', {
        organizationId: payload.organizationId,
        sourceType: payload.sourceType,
        sourceId: payload.sourceId,
        targetType: payload.targetType,
        targetId: payload.targetId
      });
      return data;
    },
    unlink: async (id: string, orgId: string, entityType: string, entityId: string): Promise<void> => {
      if (isDemo()) {
        await new Promise(r => setTimeout(r, 150));
        const list = getStored<RelatedItem[]>(KEYS.RELATIONSHIPS, []);
        setStored(KEYS.RELATIONSHIPS, list.filter(r => r.id !== id));

        // Log activities
        clientContactApi.activities.log(orgId, entityType, entityId, 'RELATIONSHIP_DELETE', 'Unlinked related item');
        return;
      }
      await api.delete(`/relationships/${id}`);
    }
  },

  // ------------------------------------------
  // Activity Timeline
  // ------------------------------------------
  activities: {
    list: async (entityType: string, entityId: string, orgId: string): Promise<ActivityEvent[]> => {
      if (isDemo()) {
        await new Promise(r => setTimeout(r, 200));
        const list = getStored<ActivityEvent[]>(KEYS.ACTIVITIES, []);
        const filtered = list.filter((a: any) => a.entityType === entityType && a.entityId === entityId);
        if (filtered.length === 0) {
          // Add default create activity if empty
          const defaultEvent: ActivityEvent = {
            id: crypto.randomUUID(),
            action: 'CREATE',
            userId: 'a0000000-0000-0000-0000-000000000001',
            userName: 'System Administrator',
            details: 'Record created in vault',
            timestamp: new Date().toISOString()
          };
          const allEvents = [...list, { ...defaultEvent, entityType, entityId }];
          setStored(KEYS.ACTIVITIES, allEvents);
          return [defaultEvent];
        }
        return filtered;
      }
      const { data } = await api.get<ActivityEvent[]>(`/activity/${entityType}/${entityId}`, { params: { organizationId: orgId } });
      return data;
    },
    log: (orgId: string, entityType: string, entityId: string, action: string, details?: string) => {
      const list = getStored<any[]>(KEYS.ACTIVITIES, []);
      const newEvent = {
        id: crypto.randomUUID(),
        organizationId: orgId,
        entityType,
        entityId,
        action,
        userId: 'a0000000-0000-0000-0000-000000000001',
        userName: 'System Administrator',
        details,
        timestamp: new Date().toISOString()
      };
      list.push(newEvent);
      setStored(KEYS.ACTIVITIES, list);
    }
  },

  // ------------------------------------------
  // Revision History
  // ------------------------------------------
  revisions: {
    list: async (entityType: string, entityId: string, orgId: string): Promise<EntityRevision[]> => {
      if (isDemo()) {
        await new Promise(r => setTimeout(r, 200));
        const list = getStored<EntityRevision[]>(KEYS.REVISIONS, []);
        return list.filter((r: any) => r.entityType === entityType && r.entityId === entityId);
      }
      const { data } = await api.get<EntityRevision[]>(`/revisions/${entityType}/${entityId}`, { params: { organizationId: orgId } });
      return data;
    },
    log: (entityType: string, entityId: string, before: any, after: any) => {
      const list = getStored<any[]>(KEYS.REVISIONS, []);
      const newRev = {
        id: crypto.randomUUID(),
        entityType,
        entityId,
        beforeState: before ? JSON.stringify(before) : null,
        afterState: after ? JSON.stringify(after) : null,
        changedBy: 'a0000000-0000-0000-0000-000000000001',
        changedByName: 'System Administrator',
        changedAt: new Date().toISOString()
      };
      list.push(newRev);
      setStored(KEYS.REVISIONS, list);
    }
  }
};
