import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { Building2, Users, FileText, AlertCircle, Clock, Globe, Loader2, Copy } from 'lucide-react';
import { useOrganization } from '../../hooks/useOrganizations';
import RecordLayout from '../records/RecordLayout';
import { useSiteSummaryStore } from '../../store/siteSummaryStore';
import { useAuthStore } from '../../store/organizationStore';
import axios from 'axios';
import { API_URL } from '../../../../config/constants';
import { siteSummaryApi } from '../../api/siteSummaryApi';
import { clientContactApi } from '../../api/clientContactApi';

interface ContactOption {
  id: string;
  name: string;
  title: string;
}

export default function SiteSummary() {
  const { orgId } = useParams<{ orgId: string }>();
  const { data: org, isLoading: isOrgLoading } = useOrganization(orgId);
  const { user } = useAuthStore();

  const {
    data,
    isLoading,
    isSaving,
    error,
    fetchSiteSummary,
    saveSiteSummary,
    deleteSiteSummary,
    archiveSiteSummary
  } = useSiteSummaryStore();

  // States
  const [isEditing, setIsEditing] = useState(false);
  const [contacts, setContacts] = useState<ContactOption[]>([]);
  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({});
  const [showCloneModal, setShowCloneModal] = useState(false);
  const [targetOrgId, setTargetOrgId] = useState('');
  const [organizations, setOrganizations] = useState<{ id: string; name: string }[]>([]);
  const [isCloning, setIsCloning] = useState(false);

  // Form states
  const [title, setTitle] = useState('');
  const [timezone, setTimezone] = useState('');
  const [businessHours, setBusinessHours] = useState('');
  const [notes, setNotes] = useState('');
  const [primaryContactId, setPrimaryContactId] = useState('');
  const [emergencyContactId, setEmergencyContactId] = useState('');
  const [authorizationContactId, setAuthorizationContactId] = useState('');

  // RBAC Permission Check
  const hasWriteAccess = user?.role === 'ORG_ADMIN' || user?.role === 'TECHNICIAN' || user?.role === 'PLATFORM_ADMIN' || user?.role === 'ULTRA_SUPER_ADMIN' || user?.role === 'SUPER_ADMIN';

  useEffect(() => {
    if (orgId) {
      fetchSiteSummary(orgId);
      // Load contacts from central API
      clientContactApi.contacts.list(orgId).then(data => {
        const mapped = (data || []).map((c: any) => ({
          id: c.id,
          name: `${c.firstName || ''} ${c.lastName || ''}`.trim() || c.name || 'Unknown',
          title: c.role || c.department || 'Contact'
        }));
        setContacts(mapped);
      }).catch(err => {
        console.error('Failed to load contacts for dropdowns:', err);
        setContacts([]);
      });
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
    setValidationErrors({});
  }, [data, isEditing]);

  const validateForm = () => {
    const errors: Record<string, string> = {};
    if (!title.trim()) {
      errors.title = 'Title is required';
    }
    if (!timezone.trim()) {
      errors.timezone = 'Timezone is required';
    } else if (timezone.length < 3) {
      errors.timezone = 'Timezone must be a valid format (e.g. UTC, America/New_York)';
    }
    if (!businessHours.trim()) {
      errors.businessHours = 'Business hours are required';
    } else if (!businessHours.includes('-') && !businessHours.includes(':')) {
      errors.businessHours = 'Format must specify operating hours (e.g. 09:00 - 17:00)';
    }
    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSave = async () => {
    if (!orgId) return;
    if (!validateForm()) return;

    try {
      await saveSiteSummary(orgId, {
        organizationId: orgId,
        title,
        timezone,
        businessHours,
        notes,
        primaryContactId: primaryContactId || undefined,
        emergencyContactId: emergencyContactId || undefined,
        authorizationContactId: authorizationContactId || undefined,
      });
      setIsEditing(false);
    } catch (e) {
      console.error('Failed to save site summary:', e);
    }
  };

  const handleDelete = async () => {
    if (!data?.id) return;
    if (!window.confirm('Are you sure you want to delete this Site Summary?')) return;
    try {
      await deleteSiteSummary();
      setIsEditing(false);
    } catch (e) {
      console.error('Delete failed:', e);
    }
  };

  const handleArchive = async () => {
    if (!data?.id) return;
    try {
      await archiveSiteSummary();
      setIsEditing(false);
    } catch (e) {
      console.error('Archive failed:', e);
    }
  };

  const handleOpenClone = async () => {
    setShowCloneModal(true);
    try {
      const response = await axios.get(`${API_URL}/organizations`, {
        params: { size: 100 },
        headers: { Authorization: `Bearer ${localStorage.getItem('accessToken')}` }
      });
      if (response.data && response.data.content) {
        setOrganizations(response.data.content.filter((o: any) => o.id !== orgId));
      }
    } catch (e) {
      console.error('Failed to load organizations for clone:', e);
    }
  };

  const handleConfirmClone = async () => {
    if (!targetOrgId || !data) return;
    setIsCloning(true);
    try {
      await siteSummaryApi.createSiteSummary({
        organizationId: targetOrgId,
        title: `${title} (Cloned)`,
        timezone,
        businessHours,
        notes,
        primaryContactId: primaryContactId || undefined,
        emergencyContactId: emergencyContactId || undefined,
        authorizationContactId: authorizationContactId || undefined,
        active: true
      });
      alert('Site Summary successfully cloned to the target organization!');
      setShowCloneModal(false);
    } catch (e: any) {
      console.error('Clone failed:', e);
      alert(e.response?.data?.message || e.message || 'Failed to clone Site Summary. The target organization may already have a Site Summary configured.');
    } finally {
      setIsCloning(false);
    }
  };

  const handleExportPdf = () => {
    if (!org) return;
    const printWindow = window.open('', '_blank');
    if (!printWindow) return;

    const contactsHtml = `
      <div style="margin-top: 20px;">
        <h3 style="border-bottom: 2px solid #3b82f6; padding-bottom: 5px; color: #1e3a8a;">Key Contacts</h3>
        <table style="width: 100%; border-collapse: collapse; margin-top: 10px;">
          <tr>
            <th style="text-align: left; padding: 8px; border: 1px solid #ddd; background-color: #f3f4f6;">Role</th>
            <th style="text-align: left; padding: 8px; border: 1px solid #ddd; background-color: #f3f4f6;">Name</th>
          </tr>
          <tr>
            <td style="padding: 8px; border: 1px solid #ddd; font-weight: bold;">Primary Contact</td>
            <td style="padding: 8px; border: 1px solid #ddd;">${getContactName(data?.primaryContactId)}</td>
          </tr>
          <tr>
            <td style="padding: 8px; border: 1px solid #ddd; font-weight: bold;">Emergency Contact</td>
            <td style="padding: 8px; border: 1px solid #ddd;">${getContactName(data?.emergencyContactId)}</td>
          </tr>
          <tr>
            <td style="padding: 8px; border: 1px solid #ddd; font-weight: bold;">Authorization Contact</td>
            <td style="padding: 8px; border: 1px solid #ddd;">${getContactName(data?.authorizationContactId)}</td>
          </tr>
        </table>
      </div>
    `;

    printWindow.document.write(`
      <html>
        <head>
          <title>${data?.title || 'Site Summary'} - Export</title>
          <style>
            body { font-family: 'Inter', sans-serif; color: #333; padding: 40px; line-height: 1.6; }
            h1 { color: #1e3a8a; margin-bottom: 5px; }
            .org { font-size: 14px; color: #666; margin-bottom: 20px; font-weight: bold; }
            .section { margin-top: 20px; }
            .section-title { border-bottom: 2px solid #3b82f6; padding-bottom: 5px; color: #1e3a8a; font-size: 16px; margin-bottom: 10px; }
            .grid { display: grid; grid-cols: 2; gap: 20px; }
            .card { background: #f9fafb; padding: 15px; border-radius: 8px; border: 1px solid #e5e7eb; }
            .label { font-size: 10px; text-transform: uppercase; color: #6b7280; font-weight: bold; }
            .value { font-size: 14px; font-weight: 600; margin-top: 5px; }
            .notes { background: #f9fafb; border: 1px solid #e5e7eb; padding: 15px; border-radius: 8px; font-family: monospace; white-space: pre-wrap; margin-top: 10px; }
          </style>
        </head>
        <body>
          <h1>${data?.title || 'Primary Headquarters'}</h1>
          <div class="org">Organization: ${org.name}</div>
          
          <div class="section">
            <h3 class="section-title">Business Details</h3>
            <div style="display: flex; gap: 20px;">
              <div class="card" style="flex: 1;">
                <div class="label">Timezone</div>
                <div class="value">${data?.timezone || 'N/A'}</div>
              </div>
              <div class="card" style="flex: 1;">
                <div class="label">Hours of Operation</div>
                <div class="value">${data?.businessHours || 'N/A'}</div>
              </div>
            </div>
          </div>
          
          ${contactsHtml}
          
          ${data?.notes ? `
            <div class="section">
              <h3 class="section-title">General Notes</h3>
              <div class="notes">${data.notes}</div>
            </div>
          ` : ''}
          
          <script>
            window.onload = function() {
              window.print();
              setTimeout(function() { window.close(); }, 500);
            };
          </script>
        </body>
      </html>
    `);
    printWindow.document.close();
  };

  const getContactName = (id?: string) => {
    if (!id) return 'Not Configured';
    const c = contacts.find(item => item.id === id);
    return c ? c.name : 'Unknown Contact';
  };

  if (isOrgLoading || isLoading) {
    return (
      <div className="p-8 space-y-6 flex flex-col items-center justify-center min-h-[300px]">
        <Loader2 className="w-8 h-8 text-brand-primary animate-spin" />
        <p className="text-xs text-text-muted">Loading Site Summary...</p>
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
        {hasWriteAccess ? (
          <button
            onClick={() => setIsEditing(true)}
            className="btn-primary py-2 px-4 text-xs font-semibold"
          >
            Initialize Site Summary
          </button>
        ) : (
          <p className="text-xs text-text-muted italic">You do not have write access to initialize the summary.</p>
        )}
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
      onEdit={hasWriteAccess ? () => setIsEditing(!isEditing) : undefined}
      onDelete={hasWriteAccess && data?.id ? handleDelete : undefined}
      onArchive={hasWriteAccess && data?.id ? handleArchive : undefined}
      onClone={hasWriteAccess && data?.id ? handleOpenClone : undefined}
      onExportPdf={handleExportPdf}
      isArchived={data?.active === false}
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

          {/* Error alerts */}
          {(error || Object.keys(validationErrors).length > 0) && (
            <div className="bg-status-danger/10 text-status-danger border border-status-danger/20 p-3 rounded-lg space-y-1">
              <div className="flex items-center gap-2 font-bold">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>Error Validation / Submission Failures</span>
              </div>
              <ul className="list-disc pl-5 space-y-0.5 text-[11px]">
                {error && <li>{error}</li>}
                {Object.values(validationErrors).map((err, i) => (
                  <li key={i}>{err}</li>
                ))}
              </ul>
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="text-[10px] text-text-muted font-bold uppercase block mb-1">Title</label>
              <input
                type="text"
                value={title}
                disabled={isSaving}
                onChange={(e) => setTitle(e.target.value)}
                className={`input-field py-2 px-3 ${validationErrors.title ? 'border-status-danger' : ''}`}
                placeholder="e.g. Primary Headquarters"
              />
            </div>

            <div>
              <label className="text-[10px] text-text-muted font-bold uppercase block mb-1">Timezone</label>
              <input
                type="text"
                value={timezone}
                disabled={isSaving}
                onChange={(e) => setTimezone(e.target.value)}
                className={`input-field py-2 px-3 ${validationErrors.timezone ? 'border-status-danger' : ''}`}
                placeholder="e.g. America/New_York"
              />
            </div>

            <div>
              <label className="text-[10px] text-text-muted font-bold uppercase block mb-1">Business Hours</label>
              <input
                type="text"
                value={businessHours}
                disabled={isSaving}
                onChange={(e) => setBusinessHours(e.target.value)}
                className={`input-field py-2 px-3 ${validationErrors.businessHours ? 'border-status-danger' : ''}`}
                placeholder="e.g. 09:00 - 17:00 EST"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 border-t border-border-subtle pt-4">
            <div>
              <label className="text-[10px] text-text-muted font-bold uppercase block mb-1">Primary Contact</label>
              <select
                value={primaryContactId}
                disabled={isSaving}
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
                disabled={isSaving}
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
                disabled={isSaving}
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
              disabled={isSaving}
              onChange={(e) => setNotes(e.target.value)}
              className="input-field h-36 font-mono leading-relaxed"
              placeholder="Compile summary instructions..."
            />
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <button
              onClick={() => setIsEditing(false)}
              disabled={isSaving}
              className="btn-secondary py-2 px-4"
            >
              Cancel
            </button>
            <button
              onClick={handleSave}
              disabled={isSaving}
              className="btn-primary py-2 px-4 flex items-center gap-1.5"
            >
              {isSaving && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
              {isSaving ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        </div>
      ) : (
        <div className="space-y-6">
          {data?.active === false && (
            <div className="bg-status-warning/15 text-status-warning border border-status-warning/20 p-3 rounded-lg flex items-center gap-2 text-xs">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>This Site Summary record has been archived.</span>
            </div>
          )}

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

      {showCloneModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-vault-card border border-border-subtle rounded-2xl w-full max-w-md p-6 space-y-4 shadow-2xl animate-in fade-in zoom-in duration-200">
            <h3 className="text-sm font-bold text-text-primary flex items-center gap-2">
              <Copy className="w-4 h-4 text-brand-primary" />
              Clone Site Summary
            </h3>
            <p className="text-xs text-text-muted">
              Copy this record's business details, hours of operation, timezone, and notes to a target organization.
            </p>
            <div>
              <label className="text-[10px] text-text-muted font-bold uppercase block mb-1">Target Organization</label>
              <select
                value={targetOrgId}
                onChange={(e) => setTargetOrgId(e.target.value)}
                className="input-field py-2 px-3 text-xs w-full"
              >
                <option value="">Select Target Organization...</option>
                {organizations.map(o => (
                  <option key={o.id} value={o.id}>{o.name}</option>
                ))}
              </select>
            </div>
            <div className="flex justify-end gap-2 pt-2">
              <button
                onClick={() => setShowCloneModal(false)}
                disabled={isCloning}
                className="btn-secondary py-1.5 px-3.5 text-xs"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmClone}
                disabled={isCloning || !targetOrgId}
                className="btn-primary py-1.5 px-3.5 text-xs flex items-center gap-1.5"
              >
                {isCloning ? 'Cloning...' : 'Confirm Clone'}
              </button>
            </div>
          </div>
        </div>
      )}
    </RecordLayout>
  );
}
