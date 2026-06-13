import { useState, useEffect } from 'react';
import { useParams, useSearchParams } from 'react-router-dom';
import {
  Building2,
  Users,
  FileText,
  AlertCircle,
  Clock,
  Globe,
  Loader2,
  Copy,
  Search,
  Plus,
  ChevronLeft,
  Calendar,
  Trash2,
  History,
  RotateCcw,
  Link2,
  Activity
} from 'lucide-react';
import { useOrganization } from '../../hooks/useOrganizations';
import RecordLayout from '../records/RecordLayout';
import { siteSummaryApi, type SiteSummaryData, type SiteSummaryRevision } from '../../api/siteSummaryApi';
import { clientContactApi, type Contact } from '../../api/clientContactApi';
import { useAuthStore } from '../../store/organizationStore';
import RelatedItemsWidget from '../records/RelatedItemsWidget';
import AttachmentWidget from '../records/AttachmentWidget';
import ActivityTimelineWidget from '../records/ActivityTimelineWidget';

// ============================================================================
// Contact Typeahead Search Component
// ============================================================================
function ContactLookup({
  label,
  value,
  onChange,
  orgId
}: {
  label: string;
  value: string;
  onChange: (id: string, name: string) => void;
  orgId: string;
}) {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<Contact[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [selectedName, setSelectedName] = useState('');

  useEffect(() => {
    if (value) {
      clientContactApi.contacts.get(value).then(c => {
        setSelectedName(`${c.firstName} ${c.lastName}`);
      }).catch(() => {
        setSelectedName('Unknown Contact');
      });
    } else {
      setSelectedName('');
    }
  }, [value]);

  useEffect(() => {
    if (!query.trim()) {
      setResults([]);
      return;
    }
    const delayDebounce = setTimeout(() => {
      clientContactApi.contacts.search(orgId, query).then(data => {
        setResults(data);
      }).catch(err => {
        console.error(err);
      });
    }, 300);
    return () => clearTimeout(delayDebounce);
  }, [query, orgId]);

  return (
    <div className="relative">
      <label className="text-[10px] text-text-muted font-bold uppercase block mb-1">{label}</label>
      {value ? (
        <div className="flex items-center justify-between bg-vault-elevated/40 border border-border-subtle rounded-lg px-3 py-2 text-xs">
          <span className="font-semibold text-text-primary">{selectedName}</span>
          <button
            type="button"
            onClick={() => {
              onChange('', '');
              setQuery('');
            }}
            className="text-text-muted hover:text-status-danger transition-colors text-[10px] font-bold uppercase"
          >
            Clear
          </button>
        </div>
      ) : (
        <div className="relative">
          <input
            type="text"
            placeholder="Type name to lookup contact..."
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setIsOpen(true);
            }}
            onFocus={() => setIsOpen(true)}
            className="input-field py-2 px-3 text-xs w-full"
          />
          {isOpen && results.length > 0 && (
            <div className="absolute left-0 right-0 z-50 mt-1 max-h-40 overflow-y-auto bg-vault-card border border-border-subtle rounded-lg shadow-xl divide-y divide-border-subtle">
              {results.map((c) => (
                <div
                  key={c.id}
                  onClick={() => {
                    onChange(c.id, `${c.firstName} ${c.lastName}`);
                    setIsOpen(false);
                  }}
                  className="px-3 py-2 text-xs hover:bg-vault-elevated cursor-pointer flex justify-between items-center"
                >
                  <span className="font-semibold text-text-primary">{c.firstName} {c.lastName}</span>
                  <span className="text-[9px] uppercase font-bold text-brand-primary">{c.role || c.department || 'Contact'}</span>
                </div>
              ))}
            </div>
          )}
          {isOpen && query.trim() && results.length === 0 && (
            <div className="absolute left-0 right-0 z-50 mt-1 p-3 bg-vault-card border border-border-subtle rounded-lg text-center text-xs text-text-muted">
              No contacts found
            </div>
          )}
        </div>
      )}
    </div>
  );
}

// ============================================================================
// Main Site Summary Component
// ============================================================================
export default function SiteSummary() {
  const { orgId } = useParams<{ orgId: string }>();
  const [searchParams, setSearchParams] = useSearchParams();
  const selectedSiteId = searchParams.get('id');

  const { data: org, isLoading: isOrgLoading } = useOrganization(orgId);
  const { user } = useAuthStore();

  // RBAC Permission Check
  const hasWriteAccess = user?.role === 'ORG_ADMIN' || user?.role === 'TECHNICIAN' || user?.role === 'PLATFORM_ADMIN' || user?.role === 'ULTRA_SUPER_ADMIN' || user?.role === 'SUPER_ADMIN';

  // --------------------------------------------------------------------------
  // LIST VIEW STATE
  // --------------------------------------------------------------------------
  const [sites, setSites] = useState<SiteSummaryData[]>([]);
  const [isListLoading, setIsListLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [includeArchived, setIncludeArchived] = useState(false);
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [totalElements, setTotalElements] = useState(0);

  // --------------------------------------------------------------------------
  // DETAIL VIEW STATE
  // --------------------------------------------------------------------------
  const [siteData, setSiteData] = useState<SiteSummaryData | null>(null);
  const [isSiteLoading, setIsSiteLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<'overview' | 'related' | 'attachments' | 'revisions' | 'timeline'>('overview');
  const [revisions, setRevisions] = useState<SiteSummaryRevision[]>([]);
  const [isRevisionsLoading, setIsRevisionsLoading] = useState(false);
  const [expandedRevId, setExpandedRevId] = useState<string | null>(null);

  // --------------------------------------------------------------------------
  // EDIT/CREATE DIALOG STATE
  // --------------------------------------------------------------------------
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});
  const [form, setForm] = useState({
    title: '',
    timezone: 'America/New_York',
    hoursOfOperation: '09:00 - 17:00',
    notes: '',
    primaryContactId: '',
    emergencyContact1Id: '',
    emergencyContact2Id: '',
    authorizationContactId: ''
  });

  // --------------------------------------------------------------------------
  // CLONE DIALOG STATE
  // --------------------------------------------------------------------------
  const [isCloneOpen, setIsCloneOpen] = useState(false);
  const [isCloning, setIsCloning] = useState(false);
  const [cloneSiteId, setCloneSiteId] = useState<string | null>(null);

  // --------------------------------------------------------------------------
  // ESCALATED CONTACT DETAILS
  // --------------------------------------------------------------------------
  const [contactDetails, setContactDetails] = useState<Record<string, Contact>>({});

  // --------------------------------------------------------------------------
  // API TRIGGERS
  // --------------------------------------------------------------------------
  const fetchSites = async () => {
    if (!orgId) return;
    setIsListLoading(true);
    try {
      const response = await siteSummaryApi.listSites(orgId, {
        isArchived: includeArchived,
        search: searchQuery,
        page,
        size: 10
      });
      setSites(response.content);
      setTotalPages(response.totalPages);
      setTotalElements(response.totalElements);
    } catch (e) {
      console.error('Failed to load sites:', e);
    } finally {
      setIsListLoading(false);
    }
  };

  const fetchSiteDetail = async (id: string) => {
    setIsSiteLoading(true);
    try {
      const data = await siteSummaryApi.getSiteSummary(id);
      setSiteData(data);
      // Fetch details of configured contacts
      const contactIds = [data.primaryContactId, data.emergencyContact1Id, data.emergencyContact2Id, data.authorizationContactId].filter(Boolean) as string[];
      contactIds.forEach(cId => {
        if (!contactDetails[cId]) {
          clientContactApi.contacts.get(cId).then(detail => {
            setContactDetails(prev => ({ ...prev, [cId]: detail }));
          }).catch(err => console.error('Failed to load contact info:', err));
        }
      });
    } catch (e) {
      console.error('Failed to load site details:', e);
      setSiteData(null);
    } finally {
      setIsSiteLoading(false);
    }
  };

  const fetchRevisions = async (id: string) => {
    setIsRevisionsLoading(true);
    try {
      const revs = await siteSummaryApi.getRevisions(id);
      setRevisions(revs);
    } catch (e) {
      console.error('Failed to load revisions:', e);
    } finally {
      setIsRevisionsLoading(false);
    }
  };

  // --------------------------------------------------------------------------
  // EFFECTS
  // --------------------------------------------------------------------------
  useEffect(() => {
    if (!selectedSiteId) {
      fetchSites();
    } else {
      fetchSiteDetail(selectedSiteId);
      if (activeTab === 'revisions') {
        fetchRevisions(selectedSiteId);
      }
    }
  }, [orgId, selectedSiteId, includeArchived, searchQuery, page]);

  useEffect(() => {
    if (selectedSiteId && activeTab === 'revisions') {
      fetchRevisions(selectedSiteId);
    }
  }, [activeTab, selectedSiteId]);

  // --------------------------------------------------------------------------
  // HANDLERS
  // --------------------------------------------------------------------------
  const handleOpenCreate = () => {
    setForm({
      title: '',
      timezone: 'America/New_York',
      hoursOfOperation: '09:00 - 17:00',
      notes: '',
      primaryContactId: '',
      emergencyContact1Id: '',
      emergencyContact2Id: '',
      authorizationContactId: ''
    });
    setFormErrors({});
    setIsModalOpen(true);
  };

  const handleOpenEdit = () => {
    if (!siteData) return;
    setForm({
      title: siteData.title || '',
      timezone: siteData.timezone || 'America/New_York',
      hoursOfOperation: siteData.hoursOfOperation || '09:00 - 17:00',
      notes: siteData.notes || '',
      primaryContactId: siteData.primaryContactId || '',
      emergencyContact1Id: siteData.emergencyContact1Id || '',
      emergencyContact2Id: siteData.emergencyContact2Id || '',
      authorizationContactId: siteData.authorizationContactId || ''
    });
    setFormErrors({});
    setIsModalOpen(true);
  };

  const validateForm = () => {
    const errors: Record<string, string> = {};
    if (!form.title.trim()) errors.title = 'Title is required';
    if (!form.timezone.trim()) errors.timezone = 'Timezone is required';
    if (!form.hoursOfOperation.trim()) errors.hoursOfOperation = 'Hours of Operation is required';
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!orgId || !validateForm()) return;
    setIsSaving(true);
    try {
      if (selectedSiteId) {
        // Edit Mode
        const updated = await siteSummaryApi.updateSiteSummary(selectedSiteId, form);
        setSiteData(updated);
        alert('Site summary updated successfully');
      } else {
        // Create Mode
        const created = await siteSummaryApi.createSiteSummary({
          organizationId: orgId,
          ...form
        });
        setSearchParams({ id: created.id || '' });
        alert('Site summary created successfully');
      }
      setIsModalOpen(false);
    } catch (err: any) {
      console.error(err);
      alert(err.response?.data?.message || err.message || 'Failed to save site summary');
    } finally {
      setIsSaving(false);
    }
  };

  const handleArchive = async () => {
    if (!siteData?.id) return;
    if (!window.confirm('Are you sure you want to archive this site?')) return;
    try {
      const updated = await siteSummaryApi.archiveSiteSummary(siteData.id);
      setSiteData(updated);
      alert('Site archived successfully');
    } catch (err) {
      console.error(err);
      alert('Failed to archive site');
    }
  };

  const handleRestore = async () => {
    if (!siteData?.id) return;
    try {
      const updated = await siteSummaryApi.restoreSiteSummary(siteData.id);
      setSiteData(updated);
      alert('Site restored successfully');
    } catch (err) {
      console.error(err);
      alert('Failed to restore site');
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('Are you sure you want to permanently delete this Site summary? This cannot be undone.')) return;
    try {
      await siteSummaryApi.deleteSiteSummary(id);
      alert('Site summary deleted successfully');
      if (selectedSiteId === id) {
        setSearchParams({});
        setSiteData(null);
      } else {
        fetchSites();
      }
    } catch (err) {
      console.error(err);
      alert('Failed to delete site summary');
    }
  };

  const handleClone = async () => {
    if (!cloneSiteId) return;
    setIsCloning(true);
    try {
      const cloned = await siteSummaryApi.cloneSiteSummary(cloneSiteId);
      alert('Site summary cloned successfully! New site created.');
      setSearchParams({ id: cloned.id || '' });
      setIsCloneOpen(false);
    } catch (err: any) {
      console.error(err);
      alert(err.response?.data?.message || err.message || 'Failed to clone site');
    } finally {
      setIsCloning(false);
    }
  };

  const handleRestoreRevision = async (revisionId: string) => {
    if (!siteData?.id) return;
    if (!window.confirm('Are you sure you want to rollback to this revision? This will overwrite the current state.')) return;
    try {
      const restored = await siteSummaryApi.restoreRevision(siteData.id, revisionId);
      setSiteData(restored);
      alert('Version restored successfully!');
      fetchRevisions(siteData.id);
    } catch (err: any) {
      console.error(err);
      alert(err.response?.data?.message || err.message || 'Failed to restore revision');
    }
  };

  const handleExportPdf = () => {
    if (!org || !siteData) return;
    const printWindow = window.open('', '_blank');
    if (!printWindow) return;

    const getContactBlock = (id?: string, label?: string) => {
      if (!id) return `<div class="card"><div class="label">${label}</div><div class="value">None Configured</div></div>`;
      const contact = contactDetails[id];
      return `
        <div class="card">
          <div class="label">${label}</div>
          <div class="value">${contact ? `${contact.firstName} ${contact.lastName}` : 'Loading...'}</div>
          ${contact ? `
            <div style="font-size: 11px; margin-top: 5px; color: #555;">
              <div><strong>Role:</strong> ${contact.role || 'N/A'}</div>
              <div><strong>Email:</strong> ${contact.email || 'N/A'}</div>
              <div><strong>Phone:</strong> ${contact.phone || 'N/A'}</div>
            </div>
          ` : ''}
        </div>
      `;
    };

    printWindow.document.write(`
      <html>
        <head>
          <title>${siteData.title} - Site Summary Record</title>
          <style>
            body { font-family: 'Outfit', 'Inter', sans-serif; color: #1f2937; padding: 40px; line-height: 1.6; }
            h1 { color: #1e3a8a; margin-bottom: 5px; }
            .org { font-size: 13px; color: #4b5563; margin-bottom: 20px; font-weight: bold; text-transform: uppercase; letter-spacing: 1px; }
            .section { margin-top: 25px; }
            .section-title { border-bottom: 2px solid #3b82f6; padding-bottom: 6px; color: #1e3a8a; font-size: 15px; font-weight: bold; margin-bottom: 15px; text-transform: uppercase; }
            .grid { display: grid; grid-template-columns: repeat(2, 1fr); gap: 20px; }
            .grid-3 { display: grid; grid-template-columns: repeat(3, 1fr); gap: 15px; }
            .card { background: #f9fafb; padding: 15px; border-radius: 8px; border: 1px solid #e5e7eb; }
            .label { font-size: 10px; text-transform: uppercase; color: #6b7280; font-weight: bold; letter-spacing: 0.5px; }
            .value { font-size: 13px; font-weight: 600; margin-top: 5px; color: #111827; }
            .notes { background: #f9fafb; border: 1px solid #e5e7eb; padding: 15px; border-radius: 8px; font-family: monospace; white-space: pre-wrap; font-size: 12px; margin-top: 10px; }
          </style>
        </head>
        <body>
          <h1>${siteData.title}</h1>
          <div class="org">Organization: ${org.name}</div>
          
          <div class="section">
            <h3 class="section-title">Business Details</h3>
            <div class="grid">
              <div class="card">
                <div class="label">Timezone</div>
                <div class="value">${siteData.timezone || 'N/A'}</div>
              </div>
              <div class="card">
                <div class="label">Hours of Operation</div>
                <div class="value">${siteData.hoursOfOperation || 'N/A'}</div>
              </div>
            </div>
          </div>
          
          <div class="section">
            <h3 class="section-title">Key Contacts</h3>
            <div class="grid" style="margin-bottom: 15px;">
              ${getContactBlock(siteData.primaryContactId, 'Primary Contact')}
              ${getContactBlock(siteData.authorizationContactId, 'Authorization Contact')}
            </div>
            <div class="grid">
              ${getContactBlock(siteData.emergencyContact1Id, 'Emergency Contact 1')}
              ${getContactBlock(siteData.emergencyContact2Id, 'Emergency Contact 2')}
            </div>
          </div>
          
          ${siteData.notes ? `
            <div class="section">
              <h3 class="section-title">General Notes</h3>
              <div class="notes">${siteData.notes}</div>
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

  const getDiff = (beforeStr: string | null, afterStr: string | null) => {
    try {
      const beforeObj = beforeStr ? JSON.parse(beforeStr) : {};
      const afterObj = afterStr ? JSON.parse(afterStr) : {};
      const allKeys = Array.from(new Set([...Object.keys(beforeObj), ...Object.keys(afterObj)]))
        .filter(k => !['id', 'organizationId', 'createdAt', 'updatedAt', 'createdBy', 'updatedBy', 'isArchived', 'archivedAt', 'archivedBy'].includes(k));

      const diffs: { key: string; before: any; after: any }[] = [];
      allKeys.forEach(k => {
        if (JSON.stringify(beforeObj[k]) !== JSON.stringify(afterObj[k])) {
          diffs.push({ key: k, before: beforeObj[k], after: afterObj[k] });
        }
      });
      return diffs;
    } catch (e) {
      return [];
    }
  };

  const formatKeyName = (key: string) => {
    return key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase());
  };

  // --------------------------------------------------------------------------
  // RENDERING HELPERS
  // --------------------------------------------------------------------------
  if (isOrgLoading) {
    return (
      <div className="p-8 space-y-6 flex flex-col items-center justify-center min-h-[400px]">
        <Loader2 className="w-8 h-8 text-brand-primary animate-spin" />
        <p className="text-xs text-text-muted">Loading workspace details...</p>
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

  // ==========================================================================
  // DETAIL VIEW RENDERING
  // ==========================================================================
  if (selectedSiteId) {
    if (isSiteLoading || !siteData) {
      return (
        <div className="p-8 space-y-6 flex flex-col items-center justify-center min-h-[400px]">
          <Loader2 className="w-8 h-8 text-brand-primary animate-spin" />
          <p className="text-xs text-text-muted">Loading Site details...</p>
        </div>
      );
    }

    return (
      <RecordLayout
        breadcrumbs={[org.name, 'Sites', siteData.title]}
        title={siteData.title}
        type="SiteSummary"
        organizationId={orgId || ''}
        entityId={siteData.id || ''}
        lastUpdated={siteData.updatedAt}
        updatedBy="System Administrator"
        onEdit={hasWriteAccess ? handleOpenEdit : undefined}
        onDelete={hasWriteAccess ? () => handleDelete(siteData.id || '') : undefined}
        onArchive={hasWriteAccess && !siteData.isArchived ? handleArchive : undefined}
        onClone={hasWriteAccess ? () => { setCloneSiteId(siteData.id ?? null); setIsCloneOpen(true); } : undefined}
        onExportPdf={handleExportPdf}
        isArchived={siteData.isArchived}
        onShareLink={() => {
          navigator.clipboard.writeText(window.location.href);
          alert('Copied URL to clipboard!');
        }}
      >
        {/* Custom Actions Header */}
        <div className="flex items-center justify-between bg-vault-card border border-border-subtle p-4 rounded-xl shadow-lg mb-6">
          <button
            onClick={() => setSearchParams({})}
            className="flex items-center gap-1.5 text-xs font-semibold text-text-secondary hover:text-text-primary transition-colors bg-vault-base/40 border border-border-subtle py-1.5 px-3 rounded-lg"
          >
            <ChevronLeft className="w-4 h-4" />
            Back to Site List
          </button>
          
          <div className="flex items-center gap-2">
            {siteData.isArchived ? (
              <button
                onClick={handleRestore}
                className="flex items-center gap-1.5 text-xs font-semibold text-status-success hover:text-white hover:bg-status-success bg-status-success/15 border border-status-success/30 py-1.5 px-3 rounded-lg transition-all"
              >
                <RotateCcw className="w-4 h-4" />
                Restore Site
              </button>
            ) : null}
          </div>
        </div>

        {/* Tab Headers */}
        <div className="flex gap-2 border-b border-border-subtle mb-6 overflow-x-auto">
          {[
            { id: 'overview', label: 'Overview', icon: Building2 },
            { id: 'related', label: `Related (${(siteData.locationCount || 0) + (siteData.passwordCount || 0) + (siteData.documentCount || 0) + (siteData.assetCount || 0)})`, icon: Link2 },
            { id: 'attachments', label: 'Attachments', icon: FileText },
            { id: 'revisions', label: 'Revisions', icon: History },
            { id: 'timeline', label: 'Activity Timeline', icon: Activity }
          ].map(t => {
            const Icon = t.icon;
            return (
              <button
                key={t.id}
                onClick={() => setActiveTab(t.id as any)}
                className={`flex items-center gap-2 px-4 py-2.5 text-xs font-bold border-b-2 transition-all shrink-0 ${
                  activeTab === t.id
                    ? 'border-brand-primary text-brand-primary bg-brand-primary/5'
                    : 'border-transparent text-text-secondary hover:text-text-primary'
                }`}
              >
                <Icon className="w-4 h-4" />
                {t.label}
              </button>
            );
          })}
        </div>

        {/* Tab Content Panels */}
        <div className="space-y-6">
          {activeTab === 'overview' && (
            <div className="space-y-6 animate-in fade-in-50 duration-200">
              {/* Business details */}
              <div className="glass-panel p-6 space-y-4">
                <h3 className="text-sm font-bold text-text-primary pb-2 border-b border-border-subtle flex items-center gap-2">
                  <Globe className="w-4.5 h-4.5 text-brand-primary" />
                  Business details
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-xs">
                  <div>
                    <span className="text-[10px] text-text-muted font-bold uppercase tracking-wider block mb-0.5">Operating Timezone</span>
                    <p className="font-semibold text-text-primary flex items-center gap-2 text-sm">
                      <Clock className="w-4 h-4 text-brand-secondary" />
                      {siteData.timezone}
                    </p>
                  </div>
                  <div>
                    <span className="text-[10px] text-text-muted font-bold uppercase tracking-wider block mb-0.5">Hours of Operation</span>
                    <p className="font-semibold text-text-primary flex items-center gap-2 text-sm">
                      <Calendar className="w-4 h-4 text-brand-accent" />
                      {siteData.hoursOfOperation}
                    </p>
                  </div>
                </div>
              </div>

              {/* Key Contacts */}
              <div className="glass-panel p-6 space-y-4">
                <h3 className="text-sm font-bold text-text-primary pb-2 border-b border-border-subtle flex items-center gap-2">
                  <Users className="w-4.5 h-4.5 text-status-success" />
                  Key Contacts
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {[
                    { id: siteData.primaryContactId, label: 'Primary Contact', badge: 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/25' },
                    { id: siteData.authorizationContactId, label: 'Authorization Contact', badge: 'bg-rose-500/10 text-rose-400 border border-rose-500/25' },
                    { id: siteData.emergencyContact1Id, label: 'Emergency Contact 1', badge: 'bg-amber-500/10 text-amber-400 border border-amber-500/25' },
                    { id: siteData.emergencyContact2Id, label: 'Emergency Contact 2', badge: 'bg-amber-500/10 text-amber-400 border border-amber-500/25' }
                  ].map((c, i) => {
                    const detail = c.id ? contactDetails[c.id] : null;
                    return (
                      <div key={i} className="bg-vault-elevated/30 border border-border-subtle rounded-xl p-4 space-y-3">
                        <div className="flex justify-between items-center">
                          <span className="text-[10px] font-bold text-text-muted uppercase tracking-wider">{c.label}</span>
                          {detail?.isActive && <span className={`text-[9px] px-2 py-0.5 rounded-full font-bold uppercase ${c.badge}`}>Active</span>}
                        </div>
                        {c.id ? (
                          <div className="space-y-2">
                            <p className="text-xs font-bold text-text-primary">{detail ? `${detail.firstName} ${detail.lastName}` : 'Loading...'}</p>
                            {detail ? (
                              <div className="text-[11px] text-text-secondary space-y-1 font-medium">
                                <p><span className="text-text-muted">Job Title:</span> {detail.role || 'N/A'}</p>
                                <p><span className="text-text-muted">Email:</span> <a href={`mailto:${detail.email}`} className="hover:underline text-brand-primary">{detail.email}</a></p>
                                <p><span className="text-text-muted">Phone:</span> {detail.phone || 'N/A'}</p>
                                {detail.mobile && <p><span className="text-text-muted">Mobile:</span> {detail.mobile}</p>}
                              </div>
                            ) : null}
                          </div>
                        ) : (
                          <p className="text-xs text-text-muted italic py-1">No contact specified</p>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* General Notes */}
              {siteData.notes && (
                <div className="glass-panel p-6 space-y-3">
                  <h3 className="text-sm font-bold text-text-primary pb-2 border-b border-border-subtle flex items-center gap-2">
                    <FileText className="w-4.5 h-4.5 text-brand-accent" />
                    General Notes
                  </h3>
                  <div className="bg-vault-elevated/20 p-4 rounded-xl border border-border-subtle font-mono text-xs whitespace-pre-wrap leading-relaxed text-text-secondary">
                    {siteData.notes}
                  </div>
                </div>
              )}
            </div>
          )}

          {activeTab === 'related' && (
            <div className="animate-in fade-in-50 duration-200">
              <RelatedItemsWidget
                organizationId={orgId || ''}
                entityType="SITE_SUMMARY"
                entityId={siteData.id || ''}
              />
            </div>
          )}

          {activeTab === 'attachments' && (
            <div className="animate-in fade-in-50 duration-200">
              <AttachmentWidget
                organizationId={orgId || ''}
                entityType="SITE_SUMMARY"
                entityId={siteData.id || ''}
              />
            </div>
          )}

          {activeTab === 'revisions' && (
            <div className="glass-panel p-5 space-y-4 animate-in fade-in-50 duration-200">
              <div className="flex justify-between items-center pb-2.5 border-b border-border-subtle">
                <h3 className="text-sm font-bold text-text-primary flex items-center gap-2">
                  <History className="w-4 h-4 text-brand-primary" />
                  Site revision log
                </h3>
              </div>

              {isRevisionsLoading ? (
                <div className="flex items-center justify-center py-10">
                  <Loader2 className="w-6 h-6 text-brand-primary animate-spin" />
                </div>
              ) : (
                <div className="space-y-4">
                  {revisions.map((rev, idx) => {
                    const isExpanded = expandedRevId === rev.id;
                    const diffs = getDiff(rev.beforeState ?? null, rev.afterState ?? null);
                    return (
                      <div key={rev.id} className="bg-vault-elevated/20 border border-border-subtle rounded-xl overflow-hidden text-xs">
                        <div
                          onClick={() => setExpandedRevId(isExpanded ? null : rev.id)}
                          className="flex justify-between items-center p-4 cursor-pointer hover:bg-vault-elevated/40 transition-colors"
                        >
                          <div>
                            <p className="font-bold text-text-primary">Version {revisions.length - idx}</p>
                            <p className="text-[10px] text-text-muted mt-0.5">By {rev.changedByName || 'System'} on {new Date(rev.changedAt).toLocaleString()}</p>
                          </div>
                          <div className="flex items-center gap-3">
                            {hasWriteAccess && (
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleRestoreRevision(rev.id);
                                }}
                                className="bg-brand-primary/10 hover:bg-brand-primary text-brand-primary hover:text-white border border-brand-primary/20 hover:border-brand-primary px-3 py-1 rounded text-[10px] font-bold uppercase transition-all flex items-center gap-1"
                              >
                                <RotateCcw className="w-3 h-3" />
                                Rollback
                              </button>
                            )}
                          </div>
                        </div>

                        {isExpanded && (
                          <div className="p-4 bg-vault-base/50 border-t border-border-subtle space-y-3">
                            {diffs.length > 0 ? (
                              <div className="space-y-2">
                                <span className="text-[10px] font-bold text-text-muted uppercase">Changed properties:</span>
                                <div className="space-y-2.5 font-mono text-[10px]">
                                  {diffs.map((d, dIdx) => (
                                    <div key={dIdx} className="bg-vault-card/80 p-3 rounded-lg border border-border-subtle">
                                      <p className="font-bold text-text-primary mb-1.5">{formatKeyName(d.key)}</p>
                                      <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                                        <div className="bg-rose-500/5 text-rose-400 p-2 rounded border border-rose-500/10">
                                          <span className="font-bold mr-1">-</span>
                                          {d.before ? String(d.before) : 'N/A'}
                                        </div>
                                        <div className="bg-emerald-500/5 text-emerald-400 p-2 rounded border border-emerald-500/10">
                                          <span className="font-bold mr-1">+</span>
                                          {d.after ? String(d.after) : 'N/A'}
                                        </div>
                                      </div>
                                    </div>
                                  ))}
                                </div>
                              </div>
                            ) : (
                              <p className="text-[10px] text-text-muted italic">No structural changes detected.</p>
                            )}
                          </div>
                        )}
                      </div>
                    );
                  })}
                  {revisions.length === 0 && (
                    <p className="text-xs text-text-muted text-center py-6">No revisions logged for this site</p>
                  )}
                </div>
              )}
            </div>
          )}

          {activeTab === 'timeline' && (
            <div className="animate-in fade-in-50 duration-200">
              <ActivityTimelineWidget
                organizationId={orgId || ''}
                entityType="SITE_SUMMARY"
                entityId={siteData.id || ''}
              />
            </div>
          )}
        </div>
      </RecordLayout>
    );
  }

  // ==========================================================================
  // LIST VIEW RENDERING
  // ==========================================================================
  return (
    <div className="p-6 space-y-6 animate-in fade-in-50 duration-200">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-border-subtle pb-5">
        <div>
          <span className="text-xs font-semibold text-brand-primary tracking-wider uppercase">
            Site Management
          </span>
          <h1 className="text-2xl font-bold tracking-tight text-text-primary mt-1">
            Sites Directory
          </h1>
          <p className="text-sm text-text-secondary mt-0.5">
            Administer timezone definitions, operating schedules, contacts, and assets across regional workspaces.
          </p>
        </div>

        {hasWriteAccess && (
          <button onClick={handleOpenCreate} className="btn-primary flex items-center gap-1">
            <Plus className="w-4 h-4" />
            New Site
          </button>
        )}
      </div>

      {/* Filters & Actions Panel */}
      <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
        <div className="relative w-full md:max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted" />
          <input
            type="text"
            placeholder="Search sites by title, contacts, locations, or notes..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="input-field pl-9 text-xs"
          />
        </div>

        <div className="flex items-center gap-4 w-full md:w-auto shrink-0 justify-end">
          <label className="flex items-center gap-2 cursor-pointer text-xs font-semibold text-text-secondary select-none">
            <input
              type="checkbox"
              checked={includeArchived}
              onChange={(e) => setIncludeArchived(e.target.checked)}
              className="rounded border-border-default bg-vault-base text-brand-primary focus:ring-brand-primary w-4 h-4"
            />
            Show Archived Sites
          </label>
        </div>
      </div>

      {/* Main Grid / List */}
      {isListLoading ? (
        <div className="flex items-center justify-center min-h-[250px]">
          <Loader2 className="w-8 h-8 text-brand-primary animate-spin" />
        </div>
      ) : (
        <div className="bg-vault-card border border-border-subtle rounded-xl overflow-hidden shadow-lg">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-vault-elevated/40 border-b border-border-subtle text-text-muted font-bold uppercase tracking-wider text-[10px]">
                <th className="py-3.5 px-4">Title</th>
                <th className="py-3.5 px-4">Timezone</th>
                <th className="py-3.5 px-4">Business Hours</th>
                <th className="py-3.5 px-4">Primary Contact</th>
                <th className="py-3.5 px-4 text-center">Cross-Linked Counts</th>
                <th className="py-3.5 px-4 text-center">Status</th>
                <th className="py-3.5 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border-subtle">
              {sites.map((site) => (
                <tr key={site.id} className="hover:bg-vault-elevated/10 transition-colors group">
                  <td className="py-3.5 px-4 font-bold text-text-primary">
                    <button
                      onClick={() => setSearchParams({ id: site.id || '' })}
                      className="hover:underline text-left"
                    >
                      {site.title}
                    </button>
                  </td>
                  <td className="py-3.5 px-4 text-text-secondary">{site.timezone}</td>
                  <td className="py-3.5 px-4 text-text-secondary">{site.hoursOfOperation}</td>
                  <td className="py-3.5 px-4 text-text-secondary">{site.primaryContactName || 'N/A'}</td>
                  <td className="py-3.5 px-4">
                    <div className="flex gap-2.5 justify-center items-center">
                      <span className="px-2 py-0.5 rounded-md bg-vault-base border border-border-subtle font-mono text-[10px] text-brand-secondary font-semibold" title="Locations">
                        LOC: {site.locationCount || 0}
                      </span>
                      <span className="px-2 py-0.5 rounded-md bg-vault-base border border-border-subtle font-mono text-[10px] text-brand-primary font-semibold" title="Passwords">
                        PWD: {site.passwordCount || 0}
                      </span>
                      <span className="px-2 py-0.5 rounded-md bg-vault-base border border-border-subtle font-mono text-[10px] text-brand-accent font-semibold" title="Documents">
                        DOC: {site.documentCount || 0}
                      </span>
                      <span className="px-2 py-0.5 rounded-md bg-vault-base border border-border-subtle font-mono text-[10px] text-status-success font-semibold" title="Assets">
                        AST: {site.assetCount || 0}
                      </span>
                    </div>
                  </td>
                  <td className="py-3.5 px-4 text-center">
                    <span className={`px-2 py-0.5 rounded-full text-[9px] font-bold uppercase ${
                      site.isArchived
                        ? 'bg-status-warning/10 text-status-warning border border-status-warning/20'
                        : 'bg-status-success/10 text-status-success border border-status-success/20'
                    }`}>
                      {site.isArchived ? 'Archived' : 'Active'}
                    </span>
                  </td>
                  <td className="py-3.5 px-4 text-right">
                    <div className="flex gap-2 justify-end opacity-0 group-hover:opacity-100 transition-opacity">
                      <button
                        onClick={() => setSearchParams({ id: site.id || '' })}
                        className="bg-vault-elevated border border-border-subtle text-text-secondary hover:text-text-primary px-2.5 py-1 rounded-md text-[10px] font-bold uppercase transition-colors"
                      >
                        Manage
                      </button>
                      {hasWriteAccess && (
                        <button
                          onClick={() => { setCloneSiteId(site.id ?? null); setIsCloneOpen(true); }}
                          className="bg-brand-primary/10 border border-brand-primary/20 text-brand-primary hover:bg-brand-primary hover:text-white px-2 py-1 rounded-md text-[10px] font-bold uppercase transition-all"
                          title="Clone Site"
                        >
                          <Copy className="w-3.5 h-3.5" />
                        </button>
                      )}
                      {hasWriteAccess && (
                        <button
                          onClick={() => handleDelete(site.id || '')}
                          className="bg-rose-500/10 border border-rose-500/20 text-rose-400 hover:bg-rose-500 hover:text-white px-2 py-1 rounded-md text-[10px] font-bold uppercase transition-all"
                          title="Delete Site"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
              {sites.length === 0 && (
                <tr>
                  <td colSpan={7} className="text-center py-10 text-text-muted italic">
                    No site summaries found. Click "New Site" to register a workspace.
                  </td>
                </tr>
              )}
            </tbody>
          </table>

          {/* Pagination controls */}
          {totalPages > 1 && (
            <div className="bg-vault-elevated/20 border-t border-border-subtle p-3 flex justify-between items-center">
              <span className="text-[10px] text-text-muted font-bold uppercase">Total Sites: {totalElements}</span>
              <div className="flex gap-1">
                <button
                  disabled={page === 0}
                  onClick={() => setPage(p => p - 1)}
                  className="bg-vault-card border border-border-subtle hover:bg-vault-elevated px-2 py-1 rounded text-[10px] font-bold text-text-primary disabled:opacity-40"
                >
                  Previous
                </button>
                <span className="px-3 py-1 font-mono text-[10px] text-text-secondary">Page {page + 1} of {totalPages}</span>
                <button
                  disabled={page >= totalPages - 1}
                  onClick={() => setPage(p => p + 1)}
                  className="bg-vault-card border border-border-subtle hover:bg-vault-elevated px-2 py-1 rounded text-[10px] font-bold text-text-primary disabled:opacity-40"
                >
                  Next
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* ======================================================================
          CREATE / EDIT MODAL DIALOG
          ====================================================================== */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <form onSubmit={handleSave} className="bg-vault-card border border-border-subtle rounded-2xl w-full max-w-lg p-6 space-y-4 shadow-2xl animate-in fade-in zoom-in duration-200">
            <h3 className="text-sm font-bold text-text-primary pb-2 border-b border-border-subtle flex items-center gap-2">
              <Building2 className="w-4 h-4 text-brand-primary" />
              {selectedSiteId ? 'Edit Site summary' : 'Create New Site'}
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="text-[10px] text-text-muted font-bold uppercase block mb-1">Site Title</label>
                <input
                  type="text"
                  required
                  value={form.title}
                  onChange={(e) => setForm({ ...form, title: e.target.value })}
                  className={`input-field py-2 px-3 text-xs w-full ${formErrors.title ? 'border-status-danger' : ''}`}
                  placeholder="e.g. Primary Headquarters"
                />
                {formErrors.title && <span className="text-[9px] text-status-danger">{formErrors.title}</span>}
              </div>

              <div>
                <label className="text-[10px] text-text-muted font-bold uppercase block mb-1">Operating Timezone</label>
                <input
                  type="text"
                  required
                  value={form.timezone}
                  onChange={(e) => setForm({ ...form, timezone: e.target.value })}
                  className={`input-field py-2 px-3 text-xs w-full ${formErrors.timezone ? 'border-status-danger' : ''}`}
                  placeholder="e.g. America/New_York"
                />
                {formErrors.timezone && <span className="text-[9px] text-status-danger">{formErrors.timezone}</span>}
              </div>

              <div>
                <label className="text-[10px] text-text-muted font-bold uppercase block mb-1">Hours of Operation</label>
                <input
                  type="text"
                  required
                  value={form.hoursOfOperation}
                  onChange={(e) => setForm({ ...form, hoursOfOperation: e.target.value })}
                  className={`input-field py-2 px-3 text-xs w-full ${formErrors.hoursOfOperation ? 'border-status-danger' : ''}`}
                  placeholder="e.g. 09:00 - 17:00"
                />
                {formErrors.hoursOfOperation && <span className="text-[9px] text-status-danger">{formErrors.hoursOfOperation}</span>}
              </div>
            </div>

            {/* Lookups */}
            <div className="border-t border-border-subtle pt-3 space-y-3">
              <span className="text-[10px] font-bold text-text-muted uppercase tracking-wider block">Role-scoped Contacts</span>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <ContactLookup
                  label="Primary Contact"
                  value={form.primaryContactId}
                  onChange={(id) => setForm({ ...form, primaryContactId: id })}
                  orgId={orgId || ''}
                />
                <ContactLookup
                  label="Authorization Contact"
                  value={form.authorizationContactId}
                  onChange={(id) => setForm({ ...form, authorizationContactId: id })}
                  orgId={orgId || ''}
                />
                <ContactLookup
                  label="Emergency Contact 1"
                  value={form.emergencyContact1Id}
                  onChange={(id) => setForm({ ...form, emergencyContact1Id: id })}
                  orgId={orgId || ''}
                />
                <ContactLookup
                  label="Emergency Contact 2"
                  value={form.emergencyContact2Id}
                  onChange={(id) => setForm({ ...form, emergencyContact2Id: id })}
                  orgId={orgId || ''}
                />
              </div>
            </div>

            <div>
              <label className="text-[10px] text-text-muted font-bold uppercase block mb-1">General Notes</label>
              <textarea
                value={form.notes}
                onChange={(e) => setForm({ ...form, notes: e.target.value })}
                className="input-field h-24 text-xs w-full"
                placeholder="Escalation procedures, access lockbox instructions..."
              />
            </div>

            <div className="flex justify-end gap-2 border-t border-border-subtle pt-3">
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                disabled={isSaving}
                className="btn-secondary py-1.5 px-3.5 text-xs"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isSaving}
                className="btn-primary py-1.5 px-3.5 text-xs flex items-center gap-1.5"
              >
                {isSaving && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                {isSaving ? 'Saving...' : 'Save Site'}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* ======================================================================
          CLONE MODAL DIALOG
          ====================================================================== */}
      {isCloneOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-vault-card border border-border-subtle rounded-2xl w-full max-w-sm p-6 space-y-4 shadow-2xl animate-in fade-in zoom-in duration-200">
            <h3 className="text-sm font-bold text-text-primary flex items-center gap-2">
              <Copy className="w-4 h-4 text-brand-primary" />
              Clone Site summary
            </h3>
            <p className="text-xs text-text-secondary leading-relaxed">
              This will create a complete copy of the selected site, including hours of operation, timezone, linked contact relationships, cross-module links, and attached documentation.
            </p>
            <div className="flex justify-end gap-2 pt-2">
              <button
                onClick={() => setIsCloneOpen(false)}
                disabled={isCloning}
                className="btn-secondary py-1.5 px-3.5 text-xs"
              >
                Cancel
              </button>
              <button
                onClick={handleClone}
                disabled={isCloning || !cloneSiteId}
                className="btn-primary py-1.5 px-3.5 text-xs flex items-center gap-1.5"
              >
                {isCloning ? 'Cloning...' : 'Confirm Clone'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
