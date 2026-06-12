import { useState } from 'react';
import { useParams } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Plus, Search, Database, HardDrive, Cloud, Server, HelpCircle,
  Trash2, Edit3, X, Info, Check, AlertCircle, RefreshCw
} from 'lucide-react';
import {
  useBackups,
  useCreateBackup,
  useUpdateBackup,
  useDeleteBackup
} from '../../../hooks/useApps';

const BACKUP_TYPE_LABELS: Record<string, string> = {
  'client-backups': 'Client Backup Policy',
  'veeam-backups': 'Veeam Backup Job',
  'legacy-backups': 'Legacy Backup Archival',
  'msp-backup': 'MSP Infrastructure Backup',
};

const getBackupIcon = (type: string) => {
  switch (type) {
    case 'client-backups': return Database;
    case 'veeam-backups': return HardDrive;
    case 'legacy-backups': return Server;
    case 'msp-backup': return Cloud;
    default: return HelpCircle;
  }
};

export default function BackupsPage() {
  const { orgId, backupType = 'veeam-backups' } = useParams<{ orgId: string; backupType: string }>();
  const [search, setSearch] = useState('');
  const [isOpen, setIsOpen] = useState(false);
  const [selectedBackupId, setSelectedBackupId] = useState<string | null>(null);
  const [editingBackup, setEditingBackup] = useState<any | null>(null);

  // Form State
  const [form, setForm] = useState({
    name: '',
    destination: '',
    frequency: 'Daily',
    retentionPolicy: '',
    status: 'Active',
    notes: '',
  });

  const [formError, setFormError] = useState<string | null>(null);

  // Queries & Mutations
  const { data: pageData, isLoading, isError, refetch } = useBackups(orgId || '', backupType, search);
  const createMutation = useCreateBackup();
  const updateMutation = useUpdateBackup();
  const deleteMutation = useDeleteBackup();

  const backupLabel = BACKUP_TYPE_LABELS[backupType] || 'Backup Policy';
  const IconComponent = getBackupIcon(backupType);

  const handleOpenAdd = () => {
    setEditingBackup(null);
    setFormError(null);
    setForm({
      name: '',
      destination: '',
      frequency: 'Daily',
      retentionPolicy: '',
      status: 'Active',
      notes: '',
    });
    setIsOpen(true);
  };

  const handleOpenEdit = (backup: any) => {
    setEditingBackup(backup);
    setFormError(null);
    setForm({
      name: backup.name,
      destination: backup.destination || '',
      frequency: backup.frequency || 'Daily',
      retentionPolicy: backup.retentionPolicy || '',
      status: backup.status || 'Active',
      notes: backup.notes || '',
    });
    setIsOpen(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name.trim()) {
      setFormError('Policy name is required');
      return;
    }

    try {
      if (editingBackup) {
        await updateMutation.mutateAsync({
          orgId: orgId || '',
          id: editingBackup.id,
          backup: form,
        });
      } else {
        await createMutation.mutateAsync({
          orgId: orgId || '',
          backup: {
            ...form,
            type: backupType,
          },
        });
      }
      setIsOpen(false);
      refetch();
    } catch (err: any) {
      setFormError(err.response?.data?.message || 'Failed to save policy. Please try again.');
    }
  };

  const handleDelete = async (id: string) => {
    if (window.confirm('Are you sure you want to delete this backup configuration?')) {
      try {
        await deleteMutation.mutateAsync({
          orgId: orgId || '',
          id,
          type: backupType,
        });
        if (selectedBackupId === id) {
          setSelectedBackupId(null);
        }
        refetch();
      } catch (err) {
        alert('Failed to delete config');
      }
    }
  };

  const backups = pageData?.content || [];

  return (
    <div className="p-6 space-y-6 bg-vault-base text-text-primary transition-colors duration-200">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-border-subtle pb-5">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-xl bg-brand-primary/10 flex items-center justify-center border border-brand-primary/20">
            <IconComponent className="w-6 h-6 text-brand-primary" />
          </div>
          <div>
            <span className="text-xs font-semibold text-brand-primary tracking-wider uppercase">
              Backup & Disaster Recovery Center
            </span>
            <h1 className="text-2xl font-bold tracking-tight text-text-primary mt-0.5">
              {backupLabel}
            </h1>
            <p className="text-sm text-text-secondary mt-0.5">
              Document storage locations, cron schedules, recovery points, and validation guidelines.
            </p>
          </div>
        </div>

        <button onClick={handleOpenAdd} className="btn-primary flex items-center gap-2">
          <Plus className="w-4 h-4" />
          Add Policy
        </button>
      </div>

      {/* Search Bar */}
      <div className="flex items-center gap-3 bg-vault-surface rounded-xl p-3 border border-border-subtle shadow-sm">
        <Search className="w-5 h-5 text-text-muted flex-shrink-0" />
        <input
          type="text"
          placeholder={`Search backups by policy name...`}
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="bg-transparent text-sm text-text-primary placeholder-text-muted outline-none w-full"
        />
        {isLoading && <RefreshCw className="w-4 h-4 text-brand-primary animate-spin" />}
      </div>

      {/* Main Grid/Table Content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left List Container */}
        <div className="lg:col-span-2 space-y-3">
          {isLoading ? (
            <div className="glass-panel p-8 text-center text-text-secondary flex flex-col items-center gap-3">
              <RefreshCw className="w-8 h-8 text-brand-primary animate-spin" />
              <span>Fetching restore matrices from secure storage...</span>
            </div>
          ) : isError ? (
            <div className="glass-panel p-8 text-center text-status-danger border-status-danger/20">
              <AlertCircle className="w-8 h-8 mx-auto mb-2" />
              <span className="font-semibold block">Failed to load backup list</span>
              <button onClick={() => refetch()} className="btn-primary mt-4 py-1.5 text-xs">
                Retry Fetch
              </button>
            </div>
          ) : backups.length === 0 ? (
            <div className="glass-panel p-12 text-center text-text-secondary border-dashed">
              <IconComponent className="w-12 h-12 text-text-muted mx-auto mb-3 opacity-40" />
              <p className="font-semibold text-text-primary">No backup policies documented</p>
              <p className="text-xs text-text-muted mt-1 max-w-md mx-auto">
                No active policies recorded for {backupLabel.toLowerCase()}. Register details like retention plans or local destinations now.
              </p>
              <button onClick={handleOpenAdd} className="btn-primary mt-4 py-1.5 text-xs">
                Register Policy
              </button>
            </div>
          ) : (
            <div className="bg-vault-surface border border-border-subtle rounded-xl overflow-hidden shadow-sm">
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="border-b border-border-subtle bg-vault-elevated/20 text-xs font-bold text-text-muted uppercase tracking-wider">
                      <th className="p-3.5">Policy / Target</th>
                      <th className="p-3.5">Storage Destination</th>
                      <th className="p-3.5">Frequency</th>
                      <th className="p-3.5">Status</th>
                      <th className="p-3.5 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border-subtle text-sm">
                    {backups.map((backup) => (
                      <tr
                        key={backup.id}
                        onClick={() => setSelectedBackupId(selectedBackupId === backup.id ? null : backup.id)}
                        className={`hover:bg-vault-elevated/40 transition-colors cursor-pointer ${
                          selectedBackupId === backup.id ? 'bg-brand-primary/5 border-l-2 border-l-brand-primary' : ''
                        }`}
                      >
                        <td className="p-3.5 font-semibold text-text-primary">
                          {backup.name}
                        </td>
                        <td className="p-3.5 text-xs text-text-secondary truncate max-w-xs">
                          {backup.destination || '—'}
                        </td>
                        <td className="p-3.5 text-xs text-text-secondary">
                          {backup.frequency || '—'}
                        </td>
                        <td className="p-3.5">
                          <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium border ${
                            backup.status === 'Active'
                              ? 'bg-status-success/10 text-status-success border-status-success/20'
                              : 'bg-status-warning/10 text-status-warning border-status-warning/20'
                          }`}>
                            {backup.status}
                          </span>
                        </td>
                        <td className="p-3.5 text-right" onClick={(e) => e.stopPropagation()}>
                          <div className="flex items-center justify-end gap-2">
                            <button
                              onClick={() => handleOpenEdit(backup)}
                              className="p-1 rounded hover:bg-vault-elevated text-text-secondary hover:text-text-primary"
                              title="Edit policy details"
                            >
                              <Edit3 className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => handleDelete(backup.id)}
                              className="p-1 rounded hover:bg-vault-elevated text-text-secondary hover:text-status-danger"
                              title="Decommission policy"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>

        {/* Right Details Panel Container */}
        <div className="lg:col-span-1">
          <AnimatePresence mode="wait">
            {selectedBackupId ? (
              (() => {
                const backup = backups.find((b) => b.id === selectedBackupId);
                if (!backup) return null;
                return (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 10 }}
                    className="glass-panel p-5 space-y-4 border-brand-primary/20 bg-vault-surface/40"
                  >
                    <div className="flex justify-between items-start border-b border-border-subtle pb-3">
                      <div>
                        <h3 className="font-bold text-text-primary text-base">{backup.name}</h3>
                        <p className="text-xs text-text-muted font-medium mt-0.5">{backupLabel}</p>
                      </div>
                      <button
                        onClick={() => setSelectedBackupId(null)}
                        className="p-1 rounded hover:bg-vault-elevated text-text-muted hover:text-text-primary"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>

                    <div className="space-y-3 text-xs">
                      <div>
                        <span className="text-text-muted block font-medium">Backup Destination</span>
                        <span className="text-text-secondary block mt-0.5 font-mono">{backup.destination || 'Not Documented'}</span>
                      </div>
                      <div>
                        <span className="text-text-muted block font-medium">Backup Frequency</span>
                        <span className="text-text-secondary block mt-0.5 font-semibold">{backup.frequency || '—'}</span>
                      </div>
                      {backup.retentionPolicy && (
                        <div>
                          <span className="text-text-muted block font-medium">Retention Policy</span>
                          <span className="text-text-secondary block mt-0.5 bg-vault-elevated/40 px-2 py-1 rounded border border-border-subtle inline-block">
                            {backup.retentionPolicy}
                          </span>
                        </div>
                      )}
                      <div>
                        <span className="text-text-muted block font-medium">Job Status</span>
                        <span className="text-text-secondary block mt-0.5">{backup.status}</span>
                      </div>
                      <div className="border-t border-border-subtle pt-3">
                        <span className="text-text-muted block font-medium">Disaster Recovery Procedures</span>
                        <p className="text-text-secondary leading-relaxed mt-1 whitespace-pre-wrap">{backup.notes || 'No documentation available.'}</p>
                      </div>
                    </div>
                  </motion.div>
                );
              })()
            ) : (
              <div className="glass-panel p-6 text-center text-text-muted border-dashed flex flex-col items-center justify-center min-h-[200px]">
                <Info className="w-8 h-8 text-text-muted opacity-30 mb-2" />
                <p className="text-sm font-semibold">Select a backup policy</p>
                <p className="text-xs mt-0.5">Click any job row in the list to reveal local path mappings, retention terms, and recovery details.</p>
              </div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* Add/Edit Modal */}
      <AnimatePresence>
        {isOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-vault-base/80 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="glass-panel w-full max-w-lg overflow-hidden flex flex-col border-brand-primary/20"
            >
              <div className="flex justify-between items-center p-5 border-b border-border-subtle bg-vault-elevated/10">
                <h2 className="text-lg font-bold text-text-primary flex items-center gap-2">
                  <IconComponent className="w-5 h-5 text-brand-primary" />
                  {editingBackup ? 'Edit Backup Configuration' : `Configure ${backupLabel}`}
                </h2>
                <button
                  onClick={() => setIsOpen(false)}
                  className="p-1 rounded-lg hover:bg-vault-elevated text-text-muted hover:text-text-primary transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleSave} className="p-5 space-y-4 overflow-y-auto max-h-[70vh]">
                {formError && (
                  <div className="bg-status-danger/10 border border-status-danger/20 p-3 rounded-lg flex items-center gap-2 text-xs text-status-danger">
                    <AlertCircle className="w-4 h-4 flex-shrink-0" />
                    <span>{formError}</span>
                  </div>
                )}

                <div className="grid grid-cols-2 gap-4">
                  <div className="col-span-2">
                    <label className="block text-xs font-semibold text-text-muted uppercase mb-1.5">
                      Policy / Target Name *
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. VMware Prod Cluster, SQL DB Offsite Agent"
                      value={form.name}
                      onChange={(e) => setForm({ ...form, name: e.target.value })}
                      className="w-full bg-vault-elevated/40 border border-border-subtle rounded-lg px-3 py-2 text-sm text-text-primary outline-none focus:border-brand-primary transition-colors"
                    />
                  </div>

                  <div className="col-span-2">
                    <label className="block text-xs font-semibold text-text-muted uppercase mb-1.5">
                      Storage Destination
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. Local NAS, Amazon S3, Wasabi bucket"
                      value={form.destination}
                      onChange={(e) => setForm({ ...form, destination: e.target.value })}
                      className="w-full bg-vault-elevated/40 border border-border-subtle rounded-lg px-3 py-2 text-sm text-text-primary outline-none focus:border-brand-primary transition-colors"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-text-muted uppercase mb-1.5">
                      Frequency
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. Hourly, Daily, Weekly, Continuous"
                      value={form.frequency}
                      onChange={(e) => setForm({ ...form, frequency: e.target.value })}
                      className="w-full bg-vault-elevated/40 border border-border-subtle rounded-lg px-3 py-2 text-sm text-text-primary outline-none focus:border-brand-primary transition-colors"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-text-muted uppercase mb-1.5">
                      Retention Policy
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. 14 Days, 30 Daily / 12 Monthly"
                      value={form.retentionPolicy}
                      onChange={(e) => setForm({ ...form, retentionPolicy: e.target.value })}
                      className="w-full bg-vault-elevated/40 border border-border-subtle rounded-lg px-3 py-2 text-sm text-text-primary outline-none focus:border-brand-primary transition-colors font-mono"
                    />
                  </div>

                  <div className="col-span-2">
                    <label className="block text-xs font-semibold text-text-muted uppercase mb-1.5">
                      Job Status
                    </label>
                    <select
                      value={form.status}
                      onChange={(e) => setForm({ ...form, status: e.target.value })}
                      className="w-full bg-vault-elevated/40 border border-border-subtle rounded-lg px-3 py-2 text-sm text-text-primary outline-none focus:border-brand-primary transition-colors"
                    >
                      <option value="Active" className="bg-vault-surface">Active</option>
                      <option value="Suspended" className="bg-vault-surface">Suspended</option>
                      <option value="Warning" className="bg-vault-surface">Warning / Critical</option>
                    </select>
                  </div>

                  <div className="col-span-2">
                    <label className="block text-xs font-semibold text-text-muted uppercase mb-1.5">
                      Recovery Instructions & Recovery Logs
                    </label>
                    <textarea
                      placeholder="Specify recovery steps: where are backup keys stored, console login names, how to perform bare metal restore..."
                      value={form.notes}
                      onChange={(e) => setForm({ ...form, notes: e.target.value })}
                      rows={5}
                      className="w-full bg-vault-elevated/40 border border-border-subtle rounded-lg px-3 py-2 text-sm text-text-primary outline-none focus:border-brand-primary transition-colors resize-none font-sans"
                    />
                  </div>
                </div>

                <div className="flex items-center justify-end gap-3 border-t border-border-subtle pt-4 mt-6">
                  <button
                    type="button"
                    onClick={() => setIsOpen(false)}
                    className="btn-secondary"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="btn-primary flex items-center gap-1.5"
                    disabled={createMutation.isPending || updateMutation.isPending}
                  >
                    {(createMutation.isPending || updateMutation.isPending) ? (
                      <RefreshCw className="w-4 h-4 animate-spin" />
                    ) : (
                      <Check className="w-4 h-4" />
                    )}
                    Save Backup Configuration
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
