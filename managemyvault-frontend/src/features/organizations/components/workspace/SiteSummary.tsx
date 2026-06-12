import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import axios from 'axios';
import { Building2, Users, FileText, AlertCircle, Clock, MapPin, Globe } from 'lucide-react';
import { useOrganization } from '../../hooks/useOrganizations';
import RecordLayout from '../records/RecordLayout';
import { API_URL } from '../../../../config/constants';

interface SiteSummaryData {
  id?: string;
  organizationId: string;
  title: string;
  timezone: string;
  businessHours: string;
  notes: string;
  primaryContactId?: string;
  emergencyContactId?: string;
  authorizationContactId?: string;
  active: boolean;
  updatedAt?: string;
  updatedBy?: string;
}

interface ContactOption {
  id: string;
  name: string;
  title: string;
}

export default function SiteSummary() {
  const { orgId } = useParams<{ orgId: string }>();
  const { data: org, isLoading: isOrgLoading } = useOrganization(orgId);

  // States
  const [data, setData] = useState<SiteSummaryData | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [contacts, setContacts] = useState<ContactOption[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Form states
  const [title, setTitle] = useState('');
  const [timezone, setTimezone] = useState('');
  const [businessHours, setBusinessHours] = useState('');
  const [notes, setNotes] = useState('');
  const [primaryContactId, setPrimaryContactId] = useState('');
  const [emergencyContactId, setEmergencyContactId] = useState('');
  const [authorizationContactId, setAuthorizationContactId] = useState('');

  const token = localStorage.getItem('accessToken');
  const headers = { Authorization: `Bearer ${token}` };

  const fetchSiteSummary = async () => {
    if (!orgId) return;
    setIsLoading(true);
    try {
      const response = await axios.get(`${API_URL}/organizations/${orgId}/site-summary`, { headers });
      setData(response.data);
      setError(null);
    } catch (e: any) {
      if (e.response?.status === 404) {
        // Not found, we will initialize a blank form
        setData(null);
      } else {
        setError('Failed to load site summary.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchSiteSummary();

    // Load contacts from local storage
    if (orgId) {
      const storedContacts = localStorage.getItem(`mmv_contacts_${orgId}`);
      if (storedContacts) {
        setContacts(JSON.parse(storedContacts));
      }
    }
  }, [orgId]);

  // Sync form fields when editing starts or data changes
  useEffect(() => {
    if (data) {
      setTitle(data.title || '');
      setTimezone(data.timezone || '');
      setBusinessHours(data.businessHours || '');
      setNotes(data.notes || '');
      setPrimaryContactId(data.primaryContactId || '');
      setEmergencyContactId(data.emergencyContactId || '');
      setAuthorizationContactId(data.authorizationContactId || '');
    } else {
      setTitle('Primary Headquarters');
      setTimezone('America/New_York');
      setBusinessHours('09:00 - 17:00');
      setNotes('');
      setPrimaryContactId('');
      setEmergencyContactId('');
      setAuthorizationContactId('');
    }
  }, [data, isEditing]);

  const handleSave = async () => {
    if (!orgId) return;
    const payload = {
      organizationId: orgId,
      title,
      timezone,
      businessHours,
      notes,
      primaryContactId: primaryContactId || null,
      emergencyContactId: emergencyContactId || null,
      authorizationContactId: authorizationContactId || null,
      active: true
    };

    try {
      if (data?.id) {
        // Update
        const response = await axios.put(`${API_URL}/site-summaries/${data.id}`, payload, { headers });
        setData(response.data);
      } else {
        // Create
        const response = await axios.post(`${API_URL}/site-summaries`, payload, { headers });
        setData(response.data);
      }
      setIsEditing(false);
      fetchSiteSummary();
    } catch (e) {
      console.error('Failed to save site summary:', e);
      alert('Error saving site summary.');
    }
  };

  const handleDelete = async () => {
    if (!data?.id) return;
    if (!window.confirm('Are you sure you want to delete this Site Summary?')) return;
    try {
      await axios.delete(`${API_URL}/site-summaries/${data.id}`, { headers });
      setData(null);
      setIsEditing(false);
    } catch (e) {
      console.error('Delete failed:', e);
    }
  };

  const getContactName = (id?: string) => {
    if (!id) return 'Not Configured';
    const c = contacts.find(item => item.id === id);
    return c ? c.name : 'Unknown Contact';
  };

  if (isOrgLoading || isLoading) {
    return (
      <div className="p-8 space-y-6">
        <div className="h-8 w-64 bg-vault-elevated animate-pulse rounded-lg" />
        <div className="h-60 bg-vault-elevated animate-pulse rounded-xl" />
      </div>
    );
  }

  if (!org) {
    return (
      <div className="p-8 text-center text-text-secondary">
        <AlertCircle className="w-12 h-12 mx-auto text-status-warning mb-4" />
        <p className="text-lg font-medium">Organization not found</p>
      </div>
    );
  }

  // If no summary exists and not editing, show setup view
  if (!data && !isEditing) {
    return (
      <div className="p-8 text-center max-w-md mx-auto space-y-4">
        <Building2 className="w-12 h-12 mx-auto text-brand-primary opacity-80" />
        <h2 className="text-lg font-bold text-text-primary">No Site Summary Configured</h2>
        <p className="text-xs text-text-secondary">
          Compile operating timezone, business hours, and authority contacts for {org.name}.
        </p>
        <button
          onClick={() => setIsEditing(true)}
          className="btn-primary py-2 px-4 text-xs font-semibold"
        >
          Initialize Site Summary
        </button>
      </div>
    );
  }

  return (
    <RecordLayout
      breadcrumbs={[org.name, 'Site Summary', data?.title || 'Primary Headquarters']}
      title={data?.title || 'Primary Headquarters'}
      type="SiteSummary"
      organizationId={orgId || ''}
      entityId={data?.id || 'new-record'}
      lastUpdated={data?.updatedAt}
      updatedBy="System Administrator"
      onEdit={() => setIsEditing(!isEditing)}
      onDelete={data?.id ? handleDelete : undefined}
      onShareLink={() => {
        navigator.clipboard.writeText(window.location.href);
        alert('Copied link to clipboard!');
      }}
    >
      {isEditing ? (
        <div className="glass-panel p-6 space-y-5 text-xs">
          <h2 className="text-sm font-bold text-text-primary pb-2 border-b border-border-subtle flex items-center gap-2">
            <Building2 className="w-4 h-4 text-brand-primary" />
            Edit Site Summary
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="text-[10px] text-text-muted font-bold uppercase block mb-1">Title</label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="input-field py-2 px-3"
                placeholder="e.g. Primary Headquarters"
              />
            </div>

            <div>
              <label className="text-[10px] text-text-muted font-bold uppercase block mb-1">Timezone</label>
              <input
                type="text"
                value={timezone}
                onChange={(e) => setTimezone(e.target.value)}
                className="input-field py-2 px-3"
                placeholder="e.g. America/New_York"
              />
            </div>

            <div>
              <label className="text-[10px] text-text-muted font-bold uppercase block mb-1">Business Hours</label>
              <input
                type="text"
                value={businessHours}
                onChange={(e) => setBusinessHours(e.target.value)}
                className="input-field py-2 px-3"
                placeholder="e.g. 09:00 - 17:00 EST"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 border-t border-border-subtle pt-4">
            <div>
              <label className="text-[10px] text-text-muted font-bold uppercase block mb-1">Primary Contact</label>
              <select
                value={primaryContactId}
                onChange={(e) => setPrimaryContactId(e.target.value)}
                className="input-field py-2 px-3"
              >
                <option value="">None Selected</option>
                {contacts.map(c => (
                  <option key={c.id} value={c.id}>{c.name} ({c.title})</option>
                ))}
              </select>
            </div>

            <div>
              <label className="text-[10px] text-text-muted font-bold uppercase block mb-1">Emergency Contact</label>
              <select
                value={emergencyContactId}
                onChange={(e) => setEmergencyContactId(e.target.value)}
                className="input-field py-2 px-3"
              >
                <option value="">None Selected</option>
                {contacts.map(c => (
                  <option key={c.id} value={c.id}>{c.name} ({c.title})</option>
                ))}
              </select>
            </div>

            <div>
              <label className="text-[10px] text-text-muted font-bold uppercase block mb-1">Authorization Contact</label>
              <select
                value={authorizationContactId}
                onChange={(e) => setAuthorizationContactId(e.target.value)}
                className="input-field py-2 px-3"
              >
                <option value="">None Selected</option>
                {contacts.map(c => (
                  <option key={c.id} value={c.id}>{c.name} ({c.title})</option>
                ))}
              </select>
            </div>
          </div>

          <div className="border-t border-border-subtle pt-4">
            <label className="text-[10px] text-text-muted font-bold uppercase block mb-1">General Notes</label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="input-field h-36 font-mono leading-relaxed"
              placeholder="Compile summary instructions..."
            />
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <button
              onClick={() => setIsEditing(false)}
              className="btn-secondary py-2 px-4"
            >
              Cancel
            </button>
            <button
              onClick={handleSave}
              className="btn-primary py-2 px-4"
            >
              Save Changes
            </button>
          </div>
        </div>
      ) : (
        <div className="space-y-6">
          {/* Main Details */}
          <div className="glass-panel p-6 space-y-5">
            <h2 className="text-sm font-bold text-text-primary pb-3 border-b border-border-subtle flex items-center gap-2">
              <Building2 className="w-4.5 h-4.5 text-brand-primary" />
              Business Details
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5 text-xs">
              <div className="flex items-center gap-3">
                <Globe className="w-4 h-4 text-brand-secondary" />
                <div>
                  <p className="text-text-muted font-bold uppercase tracking-wider text-[10px]">Timezone</p>
                  <p className="text-sm font-semibold text-text-primary mt-0.5">{data?.timezone || 'N/A'}</p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <Clock className="w-4 h-4 text-brand-accent" />
                <div>
                  <p className="text-text-muted font-bold uppercase tracking-wider text-[10px]">Hours of Operation</p>
                  <p className="text-sm font-semibold text-text-primary mt-0.5">{data?.businessHours || 'N/A'}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Authority Contacts */}
          <div className="glass-panel p-6">
            <h2 className="text-sm font-bold text-text-primary pb-3 border-b border-border-subtle mb-4 flex items-center gap-2">
              <Users className="w-4.5 h-4.5 text-status-success" />
              Key Contacts
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-5 text-xs">
              <div className="bg-vault-elevated/40 p-4 rounded-xl border border-border-subtle">
                <p className="text-text-muted font-bold uppercase tracking-wider text-[9px] mb-1">Primary Contact</p>
                <p className="font-bold text-text-primary">{getContactName(data?.primaryContactId)}</p>
              </div>

              <div className="bg-vault-elevated/40 p-4 rounded-xl border border-border-subtle">
                <p className="text-text-muted font-bold uppercase tracking-wider text-[9px] mb-1">Emergency Contact</p>
                <p className="font-bold text-text-primary">{getContactName(data?.emergencyContactId)}</p>
              </div>

              <div className="bg-vault-elevated/40 p-4 rounded-xl border border-border-subtle">
                <p className="text-text-muted font-bold uppercase tracking-wider text-[9px] mb-1">Authorization Contact</p>
                <p className="font-bold text-text-primary">{getContactName(data?.authorizationContactId)}</p>
              </div>
            </div>
          </div>

          {/* Summary Notes */}
          {data?.notes && (
            <div className="glass-panel p-6">
              <h2 className="text-sm font-bold text-text-primary pb-3 border-b border-border-subtle mb-3 flex items-center gap-2">
                <FileText className="w-4.5 h-4.5 text-brand-accent" />
                General Notes
              </h2>
              <div className="bg-vault-elevated/20 p-4 rounded-xl border border-border-subtle font-mono text-xs whitespace-pre-wrap leading-relaxed text-text-secondary">
                {data.notes}
              </div>
            </div>
          )}
        </div>
      )}
    </RecordLayout>
  );
}
