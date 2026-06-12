import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { clientContactApi } from '../../api/clientContactApi';
import { useOrganization } from '../../hooks/useOrganizations';
import RecordLayout from '../records/RecordLayout';
import {
  ShieldAlert, Plus, Edit2, Trash2, FileText,
  X, ChevronDown, ChevronUp, AlertCircle, Archive, Loader2
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface LegacySummary {
  id: string;
  organizationId: string;
  title: string;
  content: string;
  archived: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export default function SiteSummaryLegacy() {
  const { orgId } = useParams<{ orgId: string }>();
  const { data: org, isLoading: isOrgLoading } = useOrganization(orgId);

  const [records, setRecords] = useState<LegacySummary[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [expandedId, setExpandedId] = useState<string | null>(null);

  // Create/Edit modal state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingRecord, setEditingRecord] = useState<LegacySummary | null>(null);
  const [formTitle, setFormTitle] = useState('');
  const [formContent, setFormContent] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  // Selected record for RecordLayout
  const [selectedRecord, setSelectedRecord] = useState<LegacySummary | null>(null);

  const fetchRecords = async () => {
    if (!orgId) return;
    setIsLoading(true);
    try {
      const data = await clientContactApi.legacy.list(orgId);
      setRecords(data);
      if (data.length > 0 && !selectedRecord) {
        setSelectedRecord(data[0]);
        setExpandedId(data[0].id);
      }
    } catch (e) {
      console.error('Failed to load legacy summaries:', e);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchRecords();
  }, [orgId]);

  const handleOpenCreate = () => {
    setEditingRecord(null);
    setFormTitle('');
    setFormContent('');
    setIsModalOpen(true);
  };

  const handleOpenEdit = (record: LegacySummary) => {
    setEditingRecord(record);
    setFormTitle(record.title);
    setFormContent(record.content || '');
    setIsModalOpen(true);
  };

  const handleSave = async () => {
    if (!formTitle.trim()) return;
    setIsSaving(true);
    try {
      if (editingRecord) {
        const data = await clientContactApi.legacy.update(editingRecord.id, {
          title: formTitle,
          content: formContent,
          archived: editingRecord.archived
        });
        setRecords(records.map(r => r.id === editingRecord.id ? data : r));
        if (selectedRecord?.id === editingRecord.id) setSelectedRecord(data);
      } else {
        if (!orgId) return;
        const data = await clientContactApi.legacy.create({
          organizationId: orgId,
          title: formTitle,
          content: formContent,
          archived: false
        });
        setRecords([...records, data]);
        setSelectedRecord(data);
        setExpandedId(data.id);
      }
      setIsModalOpen(false);
    } catch (e) {
      console.error('Failed to save legacy summary:', e);
      alert('Failed to save legacy document.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Permanently delete this legacy document?')) return;
    try {
      await clientContactApi.legacy.delete(id);
      const updated = records.filter(r => r.id !== id);
      setRecords(updated);
      if (selectedRecord?.id === id) setSelectedRecord(updated[0] || null);
    } catch (e) {
      console.error('Failed to delete legacy summary:', e);
      alert('Failed to delete document.');
    }
  };

  const handleArchiveToggle = async (record: LegacySummary) => {
    try {
      const data = await clientContactApi.legacy.update(record.id, {
        title: record.title,
        content: record.content,
        archived: !record.archived
      });
      setRecords(records.map(r => r.id === record.id ? data : r));
      if (selectedRecord?.id === record.id) setSelectedRecord(data);
    } catch (e) {
      console.error('Failed to update archive status:', e);
    }
  };

  const handlePrint = () => {
    if (!selectedRecord) return;
    const printWindow = window.open('', '_blank');
    if (!printWindow) return;

    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>${selectedRecord.title} - Legacy Document</title>
          <style>
            body { font-family: 'Courier New', monospace; padding: 40px; color: #1a1a2e; }
            h1 { font-size: 18px; border-bottom: 2px solid #333; padding-bottom: 10px; }
            .meta { font-size: 11px; color: #666; margin-bottom: 20px; }
            .content { white-space: pre-wrap; font-size: 13px; line-height: 1.8; }
            .footer { margin-top: 40px; border-top: 1px solid #ccc; padding-top: 10px; font-size: 10px; color: #999; }
          </style>
        </head>
        <body>
          <h1>${selectedRecord.title}</h1>
          <div class="meta">
            Organization: ${org?.name || 'Unknown'}<br/>
            Last Updated: ${selectedRecord.updatedAt ? new Date(selectedRecord.updatedAt).toLocaleString() : 'N/A'}
          </div>
          <div class="content">${selectedRecord.content || 'No content.'}</div>
          <div class="footer">ManageMyVault &copy; 2026 &mdash; Legacy Document Archive</div>
        </body>
      </html>
    `);
    printWindow.document.close();
    printWindow.print();
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

  return (
    <RecordLayout
      breadcrumbs={[org.name, 'Client Contact', 'Site Summary (Legacy)']}
      title="Site Summary (Legacy)"
      type="LegacySiteSummary"
      organizationId={orgId || ''}
      entityId={selectedRecord?.id || 'legacy-root'}
      lastUpdated={selectedRecord?.updatedAt}
      updatedBy="System Administrator"
      onEdit={selectedRecord ? () => handleOpenEdit(selectedRecord) : undefined}
      onExportPdf={selectedRecord ? handlePrint : undefined}
      onArchive={selectedRecord ? () => handleArchiveToggle(selectedRecord) : undefined}
      onDelete={selectedRecord ? () => handleDelete(selectedRecord.id) : undefined}
      isArchived={selectedRecord?.archived}
      onShareLink={() => {
        navigator.clipboard.writeText(window.location.href);
        alert('Copied link to clipboard!');
      }}
    >
      {/* Legacy Alert Banner */}
      <div className="bg-amber-500/10 border border-amber-500/30 text-amber-500 p-4 rounded-lg flex items-start gap-3">
        <ShieldAlert className="w-5 h-5 mt-0.5 flex-shrink-0" />
        <div>
          <h4 className="text-xs font-bold uppercase tracking-wider font-mono">LEGACY DOCUMENT ARCHIVE</h4>
          <p className="text-[11px] mt-1 leading-relaxed font-mono">
            This module stores freeform historical onboarding documentation, VPN instructions, server details, and old MSP notes.
            Create and manage archival documents below.
          </p>
        </div>
      </div>

      {/* Document List Header */}
      <div className="glass-panel p-5">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <FileText className="w-4.5 h-4.5 text-brand-primary" />
            <h2 className="text-sm font-bold text-text-primary">Legacy Documents</h2>
            <span className="text-[10px] text-text-muted bg-vault-elevated px-2 py-0.5 rounded-full font-semibold">
              {records.length} {records.length === 1 ? 'record' : 'records'}
            </span>
          </div>
          <button onClick={handleOpenCreate} className="btn-primary text-xs py-1.5 px-3 flex items-center gap-1.5">
            <Plus className="w-3.5 h-3.5" />
            New Document
          </button>
        </div>

        {records.length === 0 ? (
          <div className="text-center py-12 text-text-muted">
            <FileText className="w-10 h-10 mx-auto mb-3 opacity-30" />
            <p className="text-xs">No legacy documents yet. Click "New Document" to create one.</p>
          </div>
        ) : (
          <div className="space-y-3">
            {records.map((record) => (
              <motion.div
                key={record.id}
                layout
                initial={{ opacity: 0, y: 5 }}
                animate={{ opacity: 1, y: 0 }}
                className={`border rounded-xl transition-all ${
                  selectedRecord?.id === record.id
                    ? 'border-brand-primary/40 bg-brand-primary/5'
                    : 'border-border-subtle bg-vault-card hover:border-border-default'
                } ${record.archived ? 'opacity-60' : ''}`}
              >
                {/* Document Row Header */}
                <div
                  className="flex items-center justify-between px-4 py-3 cursor-pointer"
                  onClick={() => {
                    setSelectedRecord(record);
                    setExpandedId(expandedId === record.id ? null : record.id);
                  }}
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <FileText className={`w-4 h-4 flex-shrink-0 ${
                      selectedRecord?.id === record.id ? 'text-brand-primary' : 'text-text-muted'
                    }`} />
                    <div className="min-w-0">
                      <h3 className="text-xs font-bold text-text-primary truncate flex items-center gap-2">
                        {record.title}
                        {record.archived && (
                          <span className="badge badge-warning text-[9px]">Archived</span>
                        )}
                      </h3>
                      <p className="text-[10px] text-text-muted mt-0.5">
                        {record.updatedAt
                          ? `Updated ${new Date(record.updatedAt).toLocaleDateString()}`
                          : 'Never updated'}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-1.5">
                    <button
                      onClick={(e) => { e.stopPropagation(); handleOpenEdit(record); }}
                      className="p-1.5 rounded hover:bg-vault-elevated text-text-secondary hover:text-text-primary transition-colors"
                      title="Edit"
                    >
                      <Edit2 className="w-3 h-3" />
                    </button>
                    <button
                      onClick={(e) => { e.stopPropagation(); handleArchiveToggle(record); }}
                      className="p-1.5 rounded hover:bg-vault-elevated text-text-secondary hover:text-status-warning transition-colors"
                      title={record.archived ? 'Unarchive' : 'Archive'}
                    >
                      <Archive className="w-3 h-3" />
                    </button>
                    <button
                      onClick={(e) => { e.stopPropagation(); handleDelete(record.id); }}
                      className="p-1.5 rounded hover:bg-status-danger/10 text-text-secondary hover:text-status-danger transition-colors"
                      title="Delete"
                    >
                      <Trash2 className="w-3 h-3" />
                    </button>
                    {expandedId === record.id
                      ? <ChevronUp className="w-3.5 h-3.5 text-text-muted" />
                      : <ChevronDown className="w-3.5 h-3.5 text-text-muted" />
                    }
                  </div>
                </div>

                {/* Expanded Content */}
                <AnimatePresence>
                  {expandedId === record.id && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.2 }}
                      className="overflow-hidden"
                    >
                      <div className="px-4 pb-4 pt-1 border-t border-border-subtle">
                        <div className="bg-vault-elevated/30 border border-border-subtle rounded-lg p-4 font-mono text-xs whitespace-pre-wrap leading-relaxed text-text-secondary max-h-[400px] overflow-y-auto">
                          {record.content || 'No content in this document.'}
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            ))}
          </div>
        )}
      </div>

      {/* Organization Reference Panel */}
      <div className="glass-panel p-5 font-mono">
        <h3 className="text-xs font-bold text-brand-primary uppercase tracking-wider border-b border-border-subtle pb-2 mb-3">
          Organization Reference
        </h3>
        <table className="w-full border-collapse text-xs">
          <tbody>
            <tr className="border-b border-border-subtle">
              <td className="py-2 font-bold text-text-muted w-1/3">ORGANIZATION:</td>
              <td className="py-2 text-text-primary font-semibold">{org.name}</td>
            </tr>
            <tr className="border-b border-border-subtle">
              <td className="py-2 font-bold text-text-muted">SLUG:</td>
              <td className="py-2 text-text-primary">{org.slug}</td>
            </tr>
            <tr className="border-b border-border-subtle">
              <td className="py-2 font-bold text-text-muted">STATUS:</td>
              <td className="py-2 text-text-primary">{org.status}</td>
            </tr>
            <tr>
              <td className="py-2 font-bold text-text-muted">CREATED:</td>
              <td className="py-2 text-text-primary">{new Date(org.createdAt).toLocaleString()}</td>
            </tr>
          </tbody>
        </table>
      </div>

      {/* Create/Edit Modal */}
      <AnimatePresence>
        {isModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, y: 15, scale: 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 15, scale: 0.98 }}
              className="w-full max-w-2xl bg-vault-card border border-border-subtle rounded-xl shadow-2xl p-6 relative"
            >
              <button
                onClick={() => setIsModalOpen(false)}
                className="absolute top-4 right-4 p-1.5 rounded-lg hover:bg-vault-elevated text-text-muted hover:text-text-primary transition-colors"
              >
                <X className="w-4 h-4" />
              </button>

              <h2 className="text-base font-bold text-text-primary mb-4 flex items-center gap-2">
                <FileText className="w-4.5 h-4.5 text-brand-primary" />
                {editingRecord ? 'Edit Legacy Document' : 'Create Legacy Document'}
              </h2>

              <div className="space-y-4">
                <div>
                  <label className="text-[11px] font-bold uppercase text-text-muted mb-1 block">Document Title</label>
                  <input
                    type="text"
                    required
                    value={formTitle}
                    onChange={(e) => setFormTitle(e.target.value)}
                    className="input-field"
                    placeholder="e.g. Cyberdyne Onboarding Notes - Jan 2025"
                  />
                </div>

                <div>
                  <label className="text-[11px] font-bold uppercase text-text-muted mb-1 block">
                    Document Content
                    <span className="font-normal normal-case ml-2 text-text-muted">(Freeform text — VPN instructions, server details, contact procedures, old MSP notes)</span>
                  </label>
                  <textarea
                    value={formContent}
                    onChange={(e) => setFormContent(e.target.value)}
                    className="input-field h-64 font-mono text-xs leading-relaxed resize-none"
                    placeholder={`== Customer Onboarding Notes ==

VPN Configuration:
  - Server: vpn.cyberdyne.com
  - Type: IKEv2
  - Pre-shared key: ****

Server Details:
  - DC-01: 10.0.1.10 (Domain Controller)
  - FS-01: 10.0.1.20 (File Server)
  - EX-01: 10.0.1.30 (Exchange)

Contact Procedures:
  - Primary: John Connor (IT Director)
  - After-hours: Call security desk at ext. 4400

Old MSP Notes:
  - Previous provider: SkyNet IT Services
  - Migrated on 2024-06-15
  - Known issues: Legacy printer on VLAN 10`}
                  />
                </div>

                <div className="flex gap-3 justify-end pt-3 border-t border-border-subtle">
                  <button
                    type="button"
                    onClick={() => setIsModalOpen(false)}
                    disabled={isSaving}
                    className="btn-secondary py-2 text-xs"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleSave}
                    disabled={isSaving || !formTitle.trim()}
                    className="btn-primary py-2 text-xs flex items-center gap-1.5"
                  >
                    {isSaving && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                    {isSaving ? 'Saving...' : editingRecord ? 'Update Document' : 'Create Document'}
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </RecordLayout>
  );
}
