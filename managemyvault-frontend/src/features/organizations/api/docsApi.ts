import api from './organizationApi';
import type { PageResponse } from './appsApi';

export interface DocumentItem {
  id: string;
  organizationId: string;
  title: string;
  content: string;
  category: string;
  createdAt: string;
  updatedAt: string;
  createdBy?: string;
  updatedBy?: string;
}

export interface ExceptionItem {
  id: string;
  organizationId: string;
  title: string;
  type: string;
  status: 'Approved' | 'Pending' | 'Draft' | 'Expired';
  justification: string;
  reviewer: string;
  dueDate: string;
  priority?: 'Low' | 'Medium' | 'High' | 'Critical';
  createdAt: string;
  updatedAt: string;
  createdBy?: string;
  updatedBy?: string;
}

export interface NetworkOrMfaItem {
  id: string;
  organizationId: string;
  title: string;
  type: string;
  param1: string;
  param2: string;
  notes: string;
  createdAt: string;
  updatedAt: string;
  createdBy?: string;
  updatedBy?: string;
}

export interface Credential {
  id: string;
  organizationId: string;
  name: string;
  username: string;
  password?: string;
  url: string;
  otpSecret: string;
  notes: string;
  strength: 'weak' | 'medium' | 'strong';
  createdAt: string;
  updatedAt: string;
  createdBy?: string;
  updatedBy?: string;
}

export interface TrackerItem {
  id: string;
  organizationId: string;
  name: string;
  type: string;
  registrarOrIssuer: string;
  expiryDate: string;
  autoRenew: boolean;
  dnsOrStrength: string;
  createdAt: string;
  updatedAt: string;
  createdBy?: string;
  updatedBy?: string;
}

// Local Storage Mock Keys
const MOCK_DOCS_KEY = 'mmv_mock_docs';
const MOCK_EXCEPTIONS_KEY = 'mmv_mock_exceptions';
const MOCK_NETWORKS_KEY = 'mmv_mock_networks';
const MOCK_PASSWORDS_KEY = 'mmv_mock_passwords';
const MOCK_TRACKERS_KEY = 'mmv_mock_trackers';

function getMockDocs(): DocumentItem[] {
  const data = localStorage.getItem(MOCK_DOCS_KEY);
  if (!data) {
    const initial: DocumentItem[] = [
      { id: '1', organizationId: 'b0000000-0000-0000-0000-000000000001', title: 'Skynet Integration Guidelines', content: '# Skynet Integration System\nThis document outlines how to safely bridge our internal firewall systems with Skynet cognitive nodes.\n\n## Network Mapping\n* Core mainframe: 10.0.1.5\n* Security node: port 8443\n\n## Security Precautions\nEnsure virtual threads isolation is enabled on the backend gateway.', category: 'Standards', createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() },
      { id: '2', organizationId: 'b0000000-0000-0000-0000-000000000001', title: 'Building Access Policy', content: '# Building Access & Lockup\nInstructions for entry fobs and server rooms.\n\n1. Swipe key fob at ground floor lobby.\n2. Server room key code: 9931.', category: 'Operations', createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() }
    ];
    localStorage.setItem(MOCK_DOCS_KEY, JSON.stringify(initial));
    return initial;
  }
  return JSON.parse(data);
}

function getMockExceptions(): ExceptionItem[] {
  const data = localStorage.getItem(MOCK_EXCEPTIONS_KEY);
  if (!data) {
    const initial: ExceptionItem[] = [
      { id: '1', organizationId: 'b0000000-0000-0000-0000-000000000001', title: 'TLS 1.1 Support for Legacy Scanner', type: 'Standards', status: 'Approved', justification: 'Required for warehouse scanner barcode integration. Hardware upgrade planned Q4.', reviewer: 'Security Board', dueDate: '2026-12-31', createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() },
      { id: '2', organizationId: 'b0000000-0000-0000-0000-000000000001', title: '24/7 SLA Exemption for Branch Office', type: 'Contract', status: 'Approved', justification: 'Branch office hours are limited. Remote power management active.', reviewer: 'Operations Director', dueDate: '2027-06-30', createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() },
      { id: '3', organizationId: 'b0000000-0000-0000-0000-000000000001', title: 'Upgrade Core Database Server to Postgres 15', type: 'RFC', status: 'Pending', justification: 'Performance optimization and compatibility patches.', reviewer: 'Database Lead', dueDate: '2026-07-15', priority: 'High', createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() },
      { id: '4', organizationId: 'b0000000-0000-0000-0000-000000000001', title: 'Rotated AD Domain Controller Master Key', type: 'Change', status: 'Approved', justification: 'Compliance security rotation cycle.', reviewer: 'Domain Controller Admin', dueDate: '2026-06-12', createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() }
    ];
    localStorage.setItem(MOCK_EXCEPTIONS_KEY, JSON.stringify(initial));
    return initial;
  }
  return JSON.parse(data);
}

function getMockNetworks(): NetworkOrMfaItem[] {
  const data = localStorage.getItem(MOCK_NETWORKS_KEY);
  if (!data) {
    const initial: NetworkOrMfaItem[] = [
      { id: '1', organizationId: 'b0000000-0000-0000-0000-000000000001', title: 'HQ LAN Subnet', type: 'Network', param1: '10.0.1.0/24', param2: 'VLAN 10 · Gateway 10.0.1.1', notes: 'Core administration subnet. DHCP scope: 10.0.1.100 - 10.0.1.200.', createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() },
      { id: '2', organizationId: 'b0000000-0000-0000-0000-000000000001', title: 'Primary Active Directory MFA', type: 'MFA', param1: 'DUO Security Integration', param2: 'Backup: Offline hardware bypass token', notes: 'Duo authentication proxy is installed on Server 10.0.1.6.', createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() },
      { id: '3', organizationId: 'b0000000-0000-0000-0000-000000000001', title: 'HQ Firewall WAN Link Outage Flapping', type: 'Issue', param1: 'Major Severity', param2: 'In Investigation', notes: 'Comcast fiber link experiences sporadic packet loss between 2 PM and 4 PM daily. Ticket #9910 opened.', createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() },
      { id: '4', organizationId: 'b0000000-0000-0000-0000-000000000001', title: 'Monthly Windows Server Security Patching', type: 'Maintenance', param1: 'All AD Servers', param2: '3 Hours Duration', notes: 'Scheduled patching window every third Saturday at 2:00 AM EST. Services failover to Secondary DC.', createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() }
    ];
    localStorage.setItem(MOCK_NETWORKS_KEY, JSON.stringify(initial));
    return initial;
  }
  return JSON.parse(data);
}

function getMockPasswords(): Credential[] {
  const data = localStorage.getItem(MOCK_PASSWORDS_KEY);
  if (!data) {
    const initial: Credential[] = [
      { id: '1', organizationId: 'b0000000-0000-0000-0000-000000000001', name: 'Active Directory Admin', username: 'administrator', url: '10.0.1.5', otpSecret: 'JBSWY3DPEHPK3PXP', notes: 'Master domain controller admin account. Do not rotate without lead approval.', strength: 'strong', createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() },
      { id: '2', organizationId: 'b0000000-0000-0000-0000-000000000001', name: 'HQ Border Palo Alto', username: 'fw-admin', url: 'https://10.0.1.1', otpSecret: '', notes: 'Border firewall management console.', strength: 'medium', createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() },
      { id: '3', organizationId: 'b0000000-0000-0000-0000-000000000001', name: 'Microsoft 365 Tenant Admin', username: 'admin@cyberdyne.onmicrosoft.com', url: 'https://portal.office.com', otpSecret: 'JBSWY3DPEHPK3PXP', notes: 'Global administrator account. MFA required.', strength: 'strong', createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() }
    ];
    localStorage.setItem(MOCK_PASSWORDS_KEY, JSON.stringify(initial));
    return initial;
  }
  return JSON.parse(data);
}

function getMockTrackers(): TrackerItem[] {
  const data = localStorage.getItem(MOCK_TRACKERS_KEY);
  if (!data) {
    const initial: TrackerItem[] = [
      { id: '1', organizationId: 'b0000000-0000-0000-0000-000000000001', name: 'cyberdyne.com', type: 'Domain', registrarOrIssuer: 'GoDaddy', expiryDate: '2026-11-20', autoRenew: true, dnsOrStrength: 'ns1.cyberdyne.com / ns2.cyberdyne.com', createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() },
      { id: '2', organizationId: 'b0000000-0000-0000-0000-000000000001', name: 'secure.cyberdyne.com', type: 'SSL', registrarOrIssuer: 'DigiCert SHA2 Extended', expiryDate: '2026-08-14', autoRenew: false, dnsOrStrength: 'RSA 2048-bit', createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() },
      { id: '3', organizationId: 'b0000000-0000-0000-0000-000000000001', name: 'api.cyberdyne.com', type: 'SSL', registrarOrIssuer: "Let's Encrypt Authority X3", expiryDate: '2026-07-02', autoRenew: true, dnsOrStrength: 'ECDSA P-256', createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() }
    ];
    localStorage.setItem(MOCK_TRACKERS_KEY, JSON.stringify(initial));
    return initial;
  }
  return JSON.parse(data);
}

export const docsApi = {
  // --- Documents Center API ---
  listDocuments: async (orgId: string, category: string, search = '', page = 0, size = 50): Promise<PageResponse<DocumentItem>> => {
    if (localStorage.getItem('demoMode') === 'true') {
      await new Promise((r) => setTimeout(r, 150));
      let list = getMockDocs().filter((d) => d.organizationId === orgId);
      if (category && category !== 'All') {
        list = list.filter((d) => d.category === category);
      }
      if (search) {
        list = list.filter((d) => d.title.toLowerCase().includes(search.toLowerCase()) || d.content.toLowerCase().includes(search.toLowerCase()));
      }
      const totalElements = list.length;
      return {
        content: list.slice(page * size, (page + 1) * size),
        totalElements,
        totalPages: Math.ceil(totalElements / size),
        number: page,
        size,
        first: page === 0,
        last: (page + 1) * size >= totalElements,
      };
    }
    const { data } = await api.get<PageResponse<DocumentItem>>(`/org/${orgId}/docs/documents`, {
      params: { category, search, page, size },
    });
    return data;
  },

  createDocument: async (orgId: string, doc: Omit<DocumentItem, 'id' | 'organizationId' | 'createdAt' | 'updatedAt'>): Promise<DocumentItem> => {
    if (localStorage.getItem('demoMode') === 'true') {
      const list = getMockDocs();
      const newDoc: DocumentItem = {
        ...doc,
        id: crypto.randomUUID(),
        organizationId: orgId,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      list.push(newDoc);
      localStorage.setItem(MOCK_DOCS_KEY, JSON.stringify(list));
      return newDoc;
    }
    const { data } = await api.post<DocumentItem>(`/org/${orgId}/docs/documents`, doc);
    return data;
  },

  updateDocument: async (orgId: string, id: string, doc: Partial<Omit<DocumentItem, 'id' | 'organizationId'>>): Promise<DocumentItem> => {
    if (localStorage.getItem('demoMode') === 'true') {
      const list = getMockDocs();
      const idx = list.findIndex((d) => d.id === id);
      if (idx === -1) throw new Error('Document not found');
      const updated = { ...list[idx], ...doc, updatedAt: new Date().toISOString() };
      list[idx] = updated;
      localStorage.setItem(MOCK_DOCS_KEY, JSON.stringify(list));
      return updated;
    }
    const { data } = await api.put<DocumentItem>(`/org/${orgId}/docs/documents/${id}`, doc);
    return data;
  },

  deleteDocument: async (orgId: string, id: string): Promise<void> => {
    if (localStorage.getItem('demoMode') === 'true') {
      const list = getMockDocs();
      const filtered = list.filter((d) => d.id !== id);
      localStorage.setItem(MOCK_DOCS_KEY, JSON.stringify(filtered));
      return;
    }
    await api.delete(`/org/${orgId}/docs/documents/${id}`);
  },

  // --- Exceptions Log API ---
  listExceptions: async (orgId: string, type: string, search = '', page = 0, size = 50): Promise<PageResponse<ExceptionItem>> => {
    if (localStorage.getItem('demoMode') === 'true') {
      await new Promise((r) => setTimeout(r, 150));
      let list = getMockExceptions().filter((e) => e.organizationId === orgId && e.type === type);
      if (search) {
        list = list.filter((e) => e.title.toLowerCase().includes(search.toLowerCase()) || e.justification.toLowerCase().includes(search.toLowerCase()));
      }
      return {
        content: list.slice(page * size, (page + 1) * size),
        totalElements: list.length,
        totalPages: Math.ceil(list.length / size),
        number: page,
        size,
        first: page === 0,
        last: (page + 1) * size >= list.length,
      };
    }
    const { data } = await api.get<PageResponse<ExceptionItem>>(`/org/${orgId}/docs/exceptions`, {
      params: { type, search, page, size },
    });
    return data;
  },

  createException: async (orgId: string, entry: Omit<ExceptionItem, 'id' | 'organizationId' | 'createdAt' | 'updatedAt'>): Promise<ExceptionItem> => {
    if (localStorage.getItem('demoMode') === 'true') {
      const list = getMockExceptions();
      const newEntry: ExceptionItem = {
        ...entry,
        id: crypto.randomUUID(),
        organizationId: orgId,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      list.push(newEntry);
      localStorage.setItem(MOCK_EXCEPTIONS_KEY, JSON.stringify(list));
      return newEntry;
    }
    const { data } = await api.post<ExceptionItem>(`/org/${orgId}/docs/exceptions`, entry);
    return data;
  },

  updateException: async (orgId: string, id: string, entry: Partial<Omit<ExceptionItem, 'id' | 'organizationId'>>): Promise<ExceptionItem> => {
    if (localStorage.getItem('demoMode') === 'true') {
      const list = getMockExceptions();
      const idx = list.findIndex((e) => e.id === id);
      if (idx === -1) throw new Error('Exception not found');
      const updated = { ...list[idx], ...entry, updatedAt: new Date().toISOString() };
      list[idx] = updated;
      localStorage.setItem(MOCK_EXCEPTIONS_KEY, JSON.stringify(list));
      return updated;
    }
    const { data } = await api.put<ExceptionItem>(`/org/${orgId}/docs/exceptions/${id}`, entry);
    return data;
  },

  deleteException: async (orgId: string, id: string): Promise<void> => {
    if (localStorage.getItem('demoMode') === 'true') {
      const list = getMockExceptions();
      const filtered = list.filter((e) => e.id !== id);
      localStorage.setItem(MOCK_EXCEPTIONS_KEY, JSON.stringify(filtered));
      return;
    }
    await api.delete(`/org/${orgId}/docs/exceptions/${id}`);
  },

  // --- Networks and MFA API ---
  listNetworks: async (orgId: string, type: string, search = '', page = 0, size = 50): Promise<PageResponse<NetworkOrMfaItem>> => {
    if (localStorage.getItem('demoMode') === 'true') {
      await new Promise((r) => setTimeout(r, 150));
      let list = getMockNetworks().filter((n) => n.organizationId === orgId && n.type === type);
      if (search) {
        list = list.filter((n) => n.title.toLowerCase().includes(search.toLowerCase()) || n.notes.toLowerCase().includes(search.toLowerCase()));
      }
      return {
        content: list.slice(page * size, (page + 1) * size),
        totalElements: list.length,
        totalPages: Math.ceil(list.length / size),
        number: page,
        size,
        first: page === 0,
        last: (page + 1) * size >= list.length,
      };
    }
    const { data } = await api.get<PageResponse<NetworkOrMfaItem>>(`/org/${orgId}/docs/networks-mfa`, {
      params: { type, search, page, size },
    });
    return data;
  },

  createNetwork: async (orgId: string, net: Omit<NetworkOrMfaItem, 'id' | 'organizationId' | 'createdAt' | 'updatedAt'>): Promise<NetworkOrMfaItem> => {
    if (localStorage.getItem('demoMode') === 'true') {
      const list = getMockNetworks();
      const newNet: NetworkOrMfaItem = {
        ...net,
        id: crypto.randomUUID(),
        organizationId: orgId,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      list.push(newNet);
      localStorage.setItem(MOCK_NETWORKS_KEY, JSON.stringify(list));
      return newNet;
    }
    const { data } = await api.post<NetworkOrMfaItem>(`/org/${orgId}/docs/networks-mfa`, net);
    return data;
  },

  updateNetwork: async (orgId: string, id: string, net: Partial<Omit<NetworkOrMfaItem, 'id' | 'organizationId'>>): Promise<NetworkOrMfaItem> => {
    if (localStorage.getItem('demoMode') === 'true') {
      const list = getMockNetworks();
      const idx = list.findIndex((n) => n.id === id);
      if (idx === -1) throw new Error('Entry not found');
      const updated = { ...list[idx], ...net, updatedAt: new Date().toISOString() };
      list[idx] = updated;
      localStorage.setItem(MOCK_NETWORKS_KEY, JSON.stringify(list));
      return updated;
    }
    const { data } = await api.put<NetworkOrMfaItem>(`/org/${orgId}/docs/networks-mfa/${id}`, net);
    return data;
  },

  deleteNetwork: async (orgId: string, id: string): Promise<void> => {
    if (localStorage.getItem('demoMode') === 'true') {
      const list = getMockNetworks();
      const filtered = list.filter((n) => n.id !== id);
      localStorage.setItem(MOCK_NETWORKS_KEY, JSON.stringify(filtered));
      return;
    }
    await api.delete(`/org/${orgId}/docs/networks-mfa/${id}`);
  },

  // --- Passwords / Credentials API ---
  listPasswords: async (orgId: string, search = '', page = 0, size = 50): Promise<PageResponse<Credential>> => {
    if (localStorage.getItem('demoMode') === 'true') {
      await new Promise((r) => setTimeout(r, 150));
      let list = getMockPasswords().filter((p) => p.organizationId === orgId);
      if (search) {
        list = list.filter((p) => p.name.toLowerCase().includes(search.toLowerCase()) || p.username.toLowerCase().includes(search.toLowerCase()));
      }
      return {
        content: list.slice(page * size, (page + 1) * size),
        totalElements: list.length,
        totalPages: Math.ceil(list.length / size),
        number: page,
        size,
        first: page === 0,
        last: (page + 1) * size >= list.length,
      };
    }
    const { data } = await api.get<PageResponse<Credential>>(`/org/${orgId}/docs/passwords`, {
      params: { search, page, size },
    });
    return data;
  },

  createPassword: async (orgId: string, cred: Omit<Credential, 'id' | 'organizationId' | 'createdAt' | 'updatedAt'>): Promise<Credential> => {
    if (localStorage.getItem('demoMode') === 'true') {
      const list = getMockPasswords();
      const newCred: Credential = {
        ...cred,
        id: crypto.randomUUID(),
        organizationId: orgId,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      list.push(newCred);
      localStorage.setItem(MOCK_PASSWORDS_KEY, JSON.stringify(list));
      return newCred;
    }
    const { data } = await api.post<Credential>(`/org/${orgId}/docs/passwords`, cred);
    return data;
  },

  updatePassword: async (orgId: string, id: string, cred: Partial<Omit<Credential, 'id' | 'organizationId'>>): Promise<Credential> => {
    if (localStorage.getItem('demoMode') === 'true') {
      const list = getMockPasswords();
      const idx = list.findIndex((p) => p.id === id);
      if (idx === -1) throw new Error('Credential not found');
      const updated = { ...list[idx], ...cred, updatedAt: new Date().toISOString() };
      list[idx] = updated;
      localStorage.setItem(MOCK_PASSWORDS_KEY, JSON.stringify(list));
      return updated;
    }
    const { data } = await api.put<Credential>(`/org/${orgId}/docs/passwords/${id}`, cred);
    return data;
  },

  deletePassword: async (orgId: string, id: string): Promise<void> => {
    if (localStorage.getItem('demoMode') === 'true') {
      const list = getMockPasswords();
      const filtered = list.filter((p) => p.id !== id);
      localStorage.setItem(MOCK_PASSWORDS_KEY, JSON.stringify(filtered));
      return;
    }
    await api.delete(`/org/${orgId}/docs/passwords/${id}`);
  },

  // --- Trackers API ---
  listTrackers: async (orgId: string, type: string, search = '', page = 0, size = 50): Promise<PageResponse<TrackerItem>> => {
    if (localStorage.getItem('demoMode') === 'true') {
      await new Promise((r) => setTimeout(r, 150));
      let list = getMockTrackers().filter((t) => t.organizationId === orgId && t.type === type);
      if (search) {
        list = list.filter((t) => t.name.toLowerCase().includes(search.toLowerCase()));
      }
      return {
        content: list.slice(page * size, (page + 1) * size),
        totalElements: list.length,
        totalPages: Math.ceil(list.length / size),
        number: page,
        size,
        first: page === 0,
        last: (page + 1) * size >= list.length,
      };
    }
    const { data } = await api.get<PageResponse<TrackerItem>>(`/org/${orgId}/docs/trackers`, {
      params: { type, search, page, size },
    });
    return data;
  },

  createTracker: async (orgId: string, tracker: Omit<TrackerItem, 'id' | 'organizationId' | 'createdAt' | 'updatedAt'>): Promise<TrackerItem> => {
    if (localStorage.getItem('demoMode') === 'true') {
      const list = getMockTrackers();
      const newTracker: TrackerItem = {
        ...tracker,
        id: crypto.randomUUID(),
        organizationId: orgId,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      list.push(newTracker);
      localStorage.setItem(MOCK_TRACKERS_KEY, JSON.stringify(list));
      return newTracker;
    }
    const { data } = await api.post<TrackerItem>(`/org/${orgId}/docs/trackers`, tracker);
    return data;
  },

  updateTracker: async (orgId: string, id: string, tracker: Partial<Omit<TrackerItem, 'id' | 'organizationId'>>): Promise<TrackerItem> => {
    if (localStorage.getItem('demoMode') === 'true') {
      const list = getMockTrackers();
      const idx = list.findIndex((t) => t.id === id);
      if (idx === -1) throw new Error('Tracker not found');
      const updated = { ...list[idx], ...tracker, updatedAt: new Date().toISOString() };
      list[idx] = updated;
      localStorage.setItem(MOCK_TRACKERS_KEY, JSON.stringify(list));
      return updated;
    }
    const { data } = await api.put<TrackerItem>(`/org/${orgId}/docs/trackers/${id}`, tracker);
    return data;
  },

  deleteTracker: async (orgId: string, id: string): Promise<void> => {
    if (localStorage.getItem('demoMode') === 'true') {
      const list = getMockTrackers();
      const filtered = list.filter((t) => t.id !== id);
      localStorage.setItem(MOCK_TRACKERS_KEY, JSON.stringify(filtered));
      return;
    }
    await api.delete(`/org/${orgId}/docs/trackers/${id}`);
  },
};
