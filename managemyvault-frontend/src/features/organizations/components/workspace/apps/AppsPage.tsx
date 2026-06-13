import { useState } from 'react';
import { useParams } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Plus, Search, Key, Box, Mail, ShieldAlert, Users, Globe, ShieldCheck, Phone, HelpCircle,
  Trash2, Edit3, X, Info, Check, AlertCircle, RefreshCw
} from 'lucide-react';
import {
  useApps,
  useCreateApp,
  useUpdateApp,
  useDeleteApp
} from '../../../hooks/useApps';

const APP_TYPE_LABELS: Record<string, string> = {
  'active-directory': 'Active Directory Config',
  'applications': 'Core Application',
  'email': 'Email Setup & MX',
  'licensing': 'Software Licensing',
  'vendors': 'External Vendor',
  'website-provider': 'Website Provider / DNS Host',
  'security-services': 'Managed Security Services',
  'voice-pbx-fax': 'Voice / PBX / Fax Infrastructure',
};

const getAppIcon = (type: string) => {
  switch (type) {
    case 'active-directory': return Key;
    case 'applications': return Box;
    case 'email': return Mail;
    case 'licensing': return ShieldAlert;
    case 'vendors': return Users;
    case 'website-provider': return Globe;
    case 'security-services': return ShieldCheck;
    case 'voice-pbx-fax': return Phone;
    default: return HelpCircle;
  }
};

export default function AppsPage() {
  const { orgId, appType = 'applications' } = useParams<{ orgId: string; appType: string }>();
  const [search, setSearch] = useState('');
  const [isOpen, setIsOpen] = useState(false);
  const [selectedAppId, setSelectedAppId] = useState<string | null>(null);
  const [editingApp, setEditingApp] = useState<any | null>(null);

  // Form State
  const [form, setForm] = useState({
    name: '',
    provider: '',
    licenseKey: '',
    url: '',
    notes: '',
  });

  const [formError, setFormError] = useState<string | null>(null);

  // Queries & Mutations
  const { data: pageData, isLoading, isError, refetch } = useApps(orgId || '', appType, search);
  const createAppMutation = useCreateApp();
  const updateAppMutation = useUpdateApp();
  const deleteAppMutation = useDeleteApp();

  const appLabel = APP_TYPE_LABELS[appType] || 'Application Config';
  const IconComponent = getAppIcon(appType);

  const handleOpenAdd = () => {
    setEditingApp(null);
    setFormError(null);
    setForm({
      name: '',
      provider: '',
      licenseKey: '',
      url: '',
      notes: '',
    });
    setIsOpen(true);
  };

  const handleOpenEdit = (app: any) => {
    setEditingApp(app);
    setFormError(null);
    setForm({
      name: app.name,
      provider: app.provider || '',
      licenseKey: app.licenseKey || '',
      url: app.url || '',
      notes: app.notes || '',
    });
    setIsOpen(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name.trim()) {
      setFormError('Configuration name is required');
      return;
    }

    try {
      if (editingApp) {
        await updateAppMutation.mutateAsync({
          orgId: orgId || '',
          id: editingApp.id,
          app: form,
        });
      } else {
        await createAppMutation.mutateAsync({
          orgId: orgId || '',
          app: {
            ...form,
            type: appType,
          },
        });
      }
      setIsOpen(false);
      refetch();
    } catch (err: any) {
      setFormError(err.response?.data?.message || 'Failed to save configuration. Please try again.');
    }
  };

  const handleDelete = async (id: string) => {
    if (window.confirm('Are you sure you want to delete this configuration?')) {
      try {
        await deleteAppMutation.mutateAsync({
          orgId: orgId || '',
          id,
          type: appType,
        });
        if (selectedAppId === id) {
          setSelectedAppId(null);
        }
        refetch();
      } catch (err) {
        alert('Failed to delete config');
      }
    }
  };

  const apps = pageData?.content || [];

  return (
    <div className="p-6 space-y-6 bg-vault-base text-text-primary transition-colors duration-200">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-border-subtle pb-5">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-xl bg-brand-primary/10 flex items-center justify-center border border-brand-primary/20">
            <IconComponent className="w-6 h-6 text-brand-primary" />
          </div>
          <div>
            <span className="text-metadata font-semibold text-brand-primary tracking-wider uppercase">
              Applications & Service Control
            </span>
            <h1 className="text-page-title text-text-primary mt-0.5">
              {appLabel}
            </h1>
            <p className="text-sm text-text-secondary mt-0.5">
              Document software services, license keys, administrative URLs, and deployment configurations.
            </p>
          </div>
        </div>

        <button onClick={handleOpenAdd} className="btn-primary flex items-center gap-2">
          <Plus className="w-4 h-4" />
          Add Configuration
        </button>
      </div>

      {/* Search Bar */}
      <div className="flex items-center gap-3 bg-vault-surface rounded-xl p-3 border border-border-subtle shadow-sm">
        <Search className="w-5 h-5 text-text-muted flex-shrink-0" />
        <input
          type="text"
          placeholder={`Search ${appLabel.toLowerCase()}s by name...`}
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="bg-transparent text-sm text-text-primary placeholder-text-muted outline-none w-full"
        />
        {isLoading && <RefreshCw className="w-4 h-4 text-brand-primary animate-spin" />}
      </div>

      {/* Main Content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left List Container */}
        <div className="lg:col-span-2 space-y-3">
          {isLoading ? (
            <div className="glass-panel p-8 text-center text-text-secondary flex flex-col items-center gap-3">
              <RefreshCw className="w-8 h-8 text-brand-primary animate-spin" />
              <span>Fetching configuration logs from secure vault...</span>
            </div>
          ) : isError ? (
            <div className="glass-panel p-8 text-center text-status-danger border-status-danger/20">
              <AlertCircle className="w-8 h-8 mx-auto mb-2" />
              <span className="font-semibold block">Failed to load configuration list</span>
              <button onClick={() => refetch()} className="btn-primary mt-4 py-1.5 text-xs">
                Retry Fetch
              </button>
            </div>
          ) : apps.length === 0 ? (
            <div className="glass-panel p-12 text-center text-text-secondary border-dashed">
              <IconComponent className="w-12 h-12 text-text-muted mx-auto mb-3 opacity-40" />
              <p className="font-semibold text-text-primary">No configurations documented</p>
              <p className="text-xs text-text-muted mt-1 max-w-md mx-auto">
                No active records discovered for {appLabel.toLowerCase()}. Begin documentation now.
              </p>
              <button onClick={handleOpenAdd} className="btn-primary mt-4 py-1.5 text-xs">
                Create Configuration
              </button>
            </div>
          ) : (
            <div className="bg-vault-surface border border-border-subtle rounded-xl overflow-hidden shadow-sm">
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="border-b border-border-subtle bg-vault-elevated/20 text-table-header text-text-muted">
                      <th className="p-3.5">Name</th>
                      <th className="p-3.5">Provider / Vendor</th>
                      <th className="p-3.5">Endpoint URL</th>
                      <th className="p-3.5 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border-subtle text-table-cell">
                    {apps.map((app) => (
                      <tr
                        key={app.id}
                        onClick={() => setSelectedAppId(selectedAppId === app.id ? null : app.id)}
                        className={`hover:bg-vault-elevated/40 transition-colors cursor-pointer ${
                          selectedAppId === app.id ? 'bg-brand-primary/5 border-l-2 border-l-brand-primary' : ''
                        }`}
                      >
                        <td className="p-3.5 font-semibold text-text-primary">
                          {app.name}
                        </td>
                        <td className="p-3.5 text-xs text-text-secondary">
                          {app.provider || '—'}
                        </td>
                        <td className="p-3.5 font-mono text-xs text-text-secondary truncate max-w-xs">
                          {app.url ? (
                            <a
                              href={app.url.startsWith('http') ? app.url : `https://${app.url}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-brand-accent hover:underline"
                              onClick={(e) => e.stopPropagation()}
                            >
                              {app.url}
                            </a>
                          ) : (
                            '—'
                          )}
                        </td>
                        <td className="p-3.5 text-right" onClick={(e) => e.stopPropagation()}>
                          <div className="flex items-center justify-end gap-2">
                            <button
                              onClick={() => handleOpenEdit(app)}
                              className="p-1 rounded hover:bg-vault-elevated text-text-secondary hover:text-text-primary"
                              title="Edit config"
                            >
                              <Edit3 className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => handleDelete(app.id)}
                              className="p-1 rounded hover:bg-vault-elevated text-text-secondary hover:text-status-danger"
                              title="Delete config"
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
            {selectedAppId ? (
              (() => {
                const app = apps.find((a) => a.id === selectedAppId);
                if (!app) return null;
                return (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 10 }}
                    className="glass-panel p-5 space-y-4 border-brand-primary/20 bg-vault-surface/40"
                  >
                    <div className="flex justify-between items-start border-b border-border-subtle pb-3">
                      <div>
                        <h3 className="text-card-title text-text-primary">{app.name}</h3>
                        <p className="text-xs text-text-muted font-medium mt-0.5">{appLabel}</p>
                      </div>
                      <button
                        onClick={() => setSelectedAppId(null)}
                        className="p-1 rounded hover:bg-vault-elevated text-text-muted hover:text-text-primary"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>

                    <div className="space-y-3 text-xs">
                      <div>
                        <span className="text-text-muted block font-medium">Provider / Host</span>
                        <span className="text-text-secondary block mt-0.5 font-semibold">{app.provider || 'Not Specified'}</span>
                      </div>
                      {app.url && (
                        <div>
                          <span className="text-text-muted block font-medium">Console URL / Address</span>
                          <span className="text-code text-text-secondary block mt-0.5">
                            <a
                              href={app.url.startsWith('http') ? app.url : `https://${app.url}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-brand-accent hover:underline"
                            >
                              {app.url}
                            </a>
                          </span>
                        </div>
                      )}
                      {app.licenseKey && (
                        <div>
                          <span className="text-text-muted block font-medium">Subscription / License Keys</span>
                          <span className="text-code text-text-secondary block mt-0.5 bg-vault-elevated/50 p-2 rounded border border-border-subtle select-all">
                            {app.licenseKey}
                          </span>
                        </div>
                      )}
                      <div className="border-t border-border-subtle pt-3">
                        <span className="text-text-muted block font-medium">Operational Context & Details</span>
                        <p className="text-text-secondary leading-relaxed mt-1 whitespace-pre-wrap">{app.notes || 'No documentation available.'}</p>
                      </div>
                    </div>
                  </motion.div>
                );
              })()
            ) : (
              <div className="glass-panel p-6 text-center text-text-muted border-dashed flex flex-col items-center justify-center min-h-[200px]">
                <Info className="w-8 h-8 text-text-muted opacity-30 mb-2" />
                <p className="text-sm font-semibold">Select a configuration</p>
                <p className="text-xs mt-0.5">Click any record row to inspect licensing, provider data, endpoints, and deployment notes.</p>
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
                  {editingApp ? 'Edit Configuration' : `Document ${appLabel}`}
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
                    <label className="block text-form-label uppercase text-text-muted mb-1.5">
                      Service / Configuration Title *
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Weyland Corp Active Directory, Twilio Trunk Voice"
                      value={form.name}
                      onChange={(e) => setForm({ ...form, name: e.target.value })}
                      className="w-full bg-vault-elevated/40 border border-border-subtle rounded-lg px-3 py-2 text-sm text-text-primary outline-none focus:border-brand-primary transition-colors"
                    />
                  </div>

                  <div>
                    <label className="block text-form-label uppercase text-text-muted mb-1.5">
                      Provider / Manufacturer
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. Microsoft, AWS, Cisco, Twilio"
                      value={form.provider}
                      onChange={(e) => setForm({ ...form, provider: e.target.value })}
                      className="w-full bg-vault-elevated/40 border border-border-subtle rounded-lg px-3 py-2 text-sm text-text-primary outline-none focus:border-brand-primary transition-colors"
                    />
                  </div>

                  <div>
                    <label className="block text-form-label uppercase text-text-muted mb-1.5">
                      Endpoint URL / Console
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. admin.microsoft.com, portal.aws.com"
                      value={form.url}
                      onChange={(e) => setForm({ ...form, url: e.target.value })}
                      className="w-full bg-vault-elevated/40 border border-border-subtle rounded-lg px-3 py-2 text-sm text-text-primary outline-none focus:border-brand-primary transition-colors font-mono"
                    />
                  </div>

                  <div className="col-span-2">
                    <label className="block text-form-label uppercase text-text-muted mb-1.5">
                      Licensing / Serial Keys
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. Product keys, subscription counts, license tiers..."
                      value={form.licenseKey}
                      onChange={(e) => setForm({ ...form, licenseKey: e.target.value })}
                      className="w-full bg-vault-elevated/40 border border-border-subtle rounded-lg px-3 py-2 text-sm text-text-primary outline-none focus:border-brand-primary transition-colors font-mono"
                    />
                  </div>

                  <div className="col-span-2">
                    <label className="block text-form-label uppercase text-text-muted mb-1.5">
                      Technical Documentation & Notes
                    </label>
                    <textarea
                      placeholder="Document replication policies, failover parameters, subscription limits, emergency contacts..."
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
                    disabled={createAppMutation.isPending || updateAppMutation.isPending}
                  >
                    {(createAppMutation.isPending || updateAppMutation.isPending) ? (
                      <RefreshCw className="w-4 h-4 animate-spin" />
                    ) : (
                      <Check className="w-4 h-4" />
                    )}
                    Save Configuration
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
