import { useState } from 'react';
import { useParams } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Search, Network, Key, AlertTriangle, Calendar, Trash2, X, Loader2 } from 'lucide-react';
import { useNetworks, useCreateNetwork, useDeleteNetwork } from '../../../hooks/useDocs';

interface NetworksAndMfaPageProps {
  mode: 'networks' | 'mfa' | 'known-issues' | 'maintenance';
}

export default function NetworksAndMfaPage({ mode }: NetworksAndMfaPageProps) {
  const { orgId } = useParams<{ orgId: string }>();
  const [search, setSearch] = useState('');
  const [isOpen, setIsOpen] = useState(false);

  // Form State
  const [form, setForm] = useState({
    title: '',
    param1: '',
    param2: '',
    notes: ''
  });

  const typeFilterMap: Record<string, string> = {
    networks: 'Network',
    mfa: 'MFA',
    'known-issues': 'Issue',
    maintenance: 'Maintenance'
  };

  const dbType = typeFilterMap[mode] || 'Network';

  // React Query Hooks
  const { data: pageData, isLoading } = useNetworks(orgId || '', dbType, search);
  const createMutation = useCreateNetwork();
  const deleteMutation = useDeleteNetwork();

  const items = pageData?.content || [];

  const handleOpenAdd = () => {
    const defaultParams = {
      networks: { param1: '192.168.1.0/24', param2: 'VLAN 1 · Gateway 192.168.1.1' },
      mfa: { param1: 'Google Authenticator', param2: 'Printable OTP list' },
      'known-issues': { param1: 'Minor Severity', param2: 'Open' },
      maintenance: { param1: 'HQ Firewalls', param2: '2 Hours' }
    }[mode];

    setForm({
      title: '',
      param1: defaultParams.param1,
      param2: defaultParams.param2,
      notes: ''
    });
    setIsOpen(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.title || !form.notes || !orgId) return;

    try {
      await createMutation.mutateAsync({
        orgId,
        net: {
          title: form.title,
          type: dbType,
          param1: form.param1,
          param2: form.param2,
          notes: form.notes
        }
      });
      setIsOpen(false);
    } catch (err) {
      console.error('Failed to create network configuration', err);
    }
  };

  const handleDelete = async (id: string) => {
    if (!orgId) return;
    if (confirm('Are you sure you want to delete this configuration item?')) {
      try {
        await deleteMutation.mutateAsync({ orgId, id, type: dbType });
      } catch (err) {
        console.error('Failed to delete network configuration', err);
      }
    }
  };

  // UI mapping
  const modeTitle = {
    networks: 'Network & VLANs',
    mfa: 'Multi-Factor Auth Rules',
    'known-issues': 'Known Issues Log',
    maintenance: 'Scheduled Maintenance'
  }[mode];

  const modeSubtitle = {
    networks: 'Document physical subnets, WAN/LAN configurations, and routing routes.',
    mfa: 'Maintain MFA details, backup protocols, and authorization configurations.',
    'known-issues': 'Review open anomalies, network flapping incidents, or server disruptions.',
    maintenance: 'Audit future platform downtime, Windows security patching, and core system maintenance.'
  }[mode];

  return (
    <div className="p-6 space-y-6 bg-vault-base text-text-primary transition-colors duration-200">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-border-subtle pb-5">
        <div>
          <span className="text-metadata font-semibold text-brand-primary tracking-wider uppercase">
            Core Documentation
          </span>
          <h1 className="text-page-title text-text-primary mt-1">
            {modeTitle}
          </h1>
          <p className="text-sm text-text-secondary mt-0.5">
            {modeSubtitle}
          </p>
        </div>

        <button onClick={handleOpenAdd} className="btn-primary">
          <Plus className="w-4 h-4 mr-1.5" />
          Add Item
        </button>
      </div>

      {/* Search Input */}
      <div className="relative">
        <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted" />
        <input
          type="text"
          placeholder={`Search ${modeTitle.toLowerCase()}...`}
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="input-field pl-10"
        />
      </div>

      {/* Log Items List */}
      <div className="space-y-4">
        {isLoading ? (
          <div className="flex justify-center items-center py-12">
            <Loader2 className="w-8 h-8 animate-spin text-brand-primary" />
          </div>
        ) : items.length > 0 ? (
          items.map((item) => (
            <div key={item.id} className="glass-panel p-5 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
              <div className="space-y-2">
                <div className="flex items-center gap-2.5">
                  {mode === 'networks' && <Network className="w-4.5 h-4.5 text-brand-primary" />}
                  {mode === 'mfa' && <Key className="w-4.5 h-4.5 text-brand-secondary" />}
                  {mode === 'known-issues' && <AlertTriangle className="w-4.5 h-4.5 text-status-danger" />}
                  {mode === 'maintenance' && <Calendar className="w-4.5 h-4.5 text-status-warning" />}

                  <h3 className="text-card-title text-text-primary">{item.title}</h3>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 bg-vault-elevated/20 p-3 rounded-lg border border-border-subtle text-xs">
                  <div>
                    <span className="text-text-muted block text-[10px] uppercase font-bold">
                       {mode === 'networks' ? 'Subnet' : mode === 'mfa' ? 'Provider' : mode === 'known-issues' ? 'Severity' : 'Target Devices'}
                    </span>
                    <span className="text-code text-text-primary font-semibold">{item.param1}</span>
                  </div>
                  <div>
                    <span className="text-text-muted block text-[10px] uppercase font-bold">
                      {mode === 'networks' ? 'VLAN / Gateway' : mode === 'mfa' ? 'Backup Policy' : mode === 'known-issues' ? 'Status' : 'Duration'}
                    </span>
                    <span className="text-code text-text-primary font-semibold">{item.param2}</span>
                  </div>
                </div>

                <p className="text-xs text-text-secondary leading-relaxed max-w-2xl mt-1">
                  {item.notes}
                </p>
              </div>

              <div className="flex items-center gap-2 w-full md:w-auto justify-end border-t md:border-t-0 border-border-subtle pt-3 md:pt-0">
                <button
                  onClick={() => handleDelete(item.id)}
                  disabled={deleteMutation.isPending}
                  className="btn-secondary py-1.5 px-3 text-xs text-status-danger border-status-danger/20 hover:bg-status-danger/10 flex items-center gap-1"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  Remove
                </button>
              </div>
            </div>
          ))
        ) : (
          <div className="glass-panel p-12 text-center flex flex-col items-center justify-center">
            {mode === 'networks' && <Network className="w-12 h-12 text-text-muted mb-4" />}
            {mode === 'mfa' && <Key className="w-12 h-12 text-text-muted mb-4" />}
            {mode === 'known-issues' && <AlertTriangle className="w-12 h-12 text-text-muted mb-4" />}
            {mode === 'maintenance' && <Calendar className="w-12 h-12 text-text-muted mb-4" />}
            <h3 className="text-sm font-bold text-text-primary mb-1">No Items Configured</h3>
            <p className="text-xs text-text-muted max-w-xs">
              Keep network mapping records and operations settings updated here.
            </p>
          </div>
        )}
      </div>

      {/* Slide-over Form Panel */}
      <AnimatePresence>
        {isOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.5 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsOpen(false)}
              className="fixed inset-0 bg-black z-40"
            />
            <motion.div
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 20 }}
              className="fixed right-0 top-0 bottom-0 w-full max-w-lg bg-vault-card border-l border-border-default p-6 shadow-2xl z-50 overflow-y-auto"
            >
              <div className="flex justify-between items-center border-b border-border-subtle pb-4 mb-6">
                <div>
                  <h2 className="text-base font-bold text-text-primary">Add Configuration</h2>
                  <p className="text-xs text-text-muted mt-0.5">Register a new record for {modeTitle}</p>
                </div>
                <button onClick={() => setIsOpen(false)} className="p-1 text-text-muted hover:text-text-primary">
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleSave} className="space-y-4">
                <div className="space-y-1">
                  <label className="text-form-label text-text-secondary">Title / Alias Name</label>
                  <input
                    type="text"
                    required
                    value={form.title}
                    onChange={(e) => setForm({ ...form, title: e.target.value })}
                    className="input-field text-xs"
                    placeholder={mode === 'networks' ? 'e.g. Office Core LAN' : 'e.g. Administrator Duo Configuration'}
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-form-label text-text-secondary">
                    {mode === 'networks' ? 'Subnet (CIDR)' : mode === 'mfa' ? 'MFA Provider / Application' : mode === 'known-issues' ? 'Severity / Impact' : 'Target Devices'}
                  </label>
                  <input
                    type="text"
                    required
                    value={form.param1}
                    onChange={(e) => setForm({ ...form, param1: e.target.value })}
                    className="input-field text-xs"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-form-label text-text-secondary">
                    {mode === 'networks' ? 'VLAN / Gateway details' : mode === 'mfa' ? 'Bypass / Recovery Protocols' : mode === 'known-issues' ? 'Current Status' : 'Patching Duration'}
                  </label>
                  <input
                    type="text"
                    required
                    value={form.param2}
                    onChange={(e) => setForm({ ...form, param2: e.target.value })}
                    className="input-field text-xs"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-form-label text-text-secondary">Notes & Configuration details</label>
                  <textarea
                    required
                    rows={5}
                    value={form.notes}
                    onChange={(e) => setForm({ ...form, notes: e.target.value })}
                    className="input-field text-xs leading-relaxed"
                    placeholder="Provide step by step documentation, credentials details references, or recovery steps..."
                  />
                </div>

                <div className="pt-4 flex gap-3">
                  <button type="submit" disabled={createMutation.isPending} className="flex-1 btn-primary py-2 flex items-center justify-center gap-1.5">
                    {createMutation.isPending && <Loader2 className="w-4 h-4 animate-spin" />}
                    Save Configuration
                  </button>
                  <button type="button" onClick={() => setIsOpen(false)} className="flex-1 btn-secondary py-2">
                    Cancel
                  </button>
                </div>
              </form>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
