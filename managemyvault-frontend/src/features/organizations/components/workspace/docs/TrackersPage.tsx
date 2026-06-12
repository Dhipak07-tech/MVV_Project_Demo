import { useState } from 'react';
import { useParams } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Search, Globe, Shield, AlertTriangle, CheckCircle, Trash2, X, Loader2 } from 'lucide-react';
import { useTrackers, useCreateTracker, useDeleteTracker } from '../../../hooks/useDocs';

interface TrackersPageProps {
  mode: 'ssl' | 'domain';
}

export default function TrackersPage({ mode }: TrackersPageProps) {
  const { orgId } = useParams<{ orgId: string }>();
  const [search, setSearch] = useState('');
  const [isOpen, setIsOpen] = useState(false);

  // Form State
  const [form, setForm] = useState({
    name: '',
    registrarOrIssuer: '',
    expiryDate: '',
    autoRenew: true,
    dnsOrStrength: ''
  });

  const dbType = mode === 'ssl' ? 'SSL' : 'Domain';

  // React Query Hooks
  const { data: pageData, isLoading } = useTrackers(orgId || '', dbType, search);
  const createMutation = useCreateTracker();
  const deleteMutation = useDeleteTracker();

  const items = pageData?.content || [];

  const handleOpenAdd = () => {
    setForm({
      name: '',
      registrarOrIssuer: mode === 'ssl' ? "Let's Encrypt" : 'GoDaddy',
      expiryDate: new Date(Date.now() + 90 * 24 * 3600 * 1000).toISOString().split('T')[0],
      autoRenew: true,
      dnsOrStrength: mode === 'ssl' ? 'RSA 2048-bit' : 'ns1.nameserver.com'
    });
    setIsOpen(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name || !form.expiryDate || !orgId) return;

    try {
      await createMutation.mutateAsync({
        orgId,
        tracker: {
          name: form.name,
          type: dbType,
          registrarOrIssuer: form.registrarOrIssuer,
          expiryDate: form.expiryDate,
          autoRenew: form.autoRenew,
          dnsOrStrength: form.dnsOrStrength
        }
      });
      setIsOpen(false);
    } catch (err) {
      console.error('Failed to create tracker', err);
    }
  };

  const handleDelete = async (id: string) => {
    if (!orgId) return;
    if (confirm('Are you sure you want to delete this tracker item?')) {
      try {
        await deleteMutation.mutateAsync({ orgId, id, type: dbType });
      } catch (err) {
        console.error('Failed to delete tracker', err);
      }
    }
  };

  const getDaysLeft = (expiryStr: string) => {
    const expiry = new Date(expiryStr);
    const diffTime = expiry.getTime() - Date.now();
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  };

  const modeTitle = mode === 'ssl' ? 'SSL Certificates' : 'Domains';

  return (
    <div className="p-6 space-y-6 bg-vault-base text-text-primary transition-colors duration-200">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-border-subtle pb-5">
        <div>
          <span className="text-xs font-semibold text-brand-primary tracking-wider uppercase">
            Core Documentation
          </span>
          <h1 className="text-2xl font-bold tracking-tight text-text-primary mt-1">
            {modeTitle} Tracker
          </h1>
          <p className="text-sm text-text-secondary mt-0.5">
            Monitor and track certificate expiration warnings and registrar status.
          </p>
        </div>

        <button onClick={handleOpenAdd} className="btn-primary">
          <Plus className="w-4 h-4 mr-1.5" />
          Add Tracker
        </button>
      </div>

      {/* Search Bar */}
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

      {/* Grid of Trackers */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {isLoading ? (
          <div className="col-span-2 flex justify-center items-center py-12">
            <Loader2 className="w-8 h-8 animate-spin text-brand-primary" />
          </div>
        ) : items.length > 0 ? (
          items.map((item) => {
            const daysLeft = getDaysLeft(item.expiryDate);
            const isCritical = daysLeft <= 30;
            const isWarning = daysLeft > 30 && daysLeft <= 90;

            return (
              <motion.div
                layout
                key={item.id}
                className="card-elevated p-5 flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-2.5">
                      <div className="w-9 h-9 rounded-lg bg-brand-primary/15 flex items-center justify-center text-brand-primary">
                        {mode === 'ssl' ? <Shield className="w-4.5 h-4.5" /> : <Globe className="w-4.5 h-4.5" />}
                      </div>
                      <div>
                        <h3 className="text-sm font-bold text-text-primary">{item.name}</h3>
                        <span className="text-[10px] text-text-muted font-mono">{item.dnsOrStrength}</span>
                      </div>
                    </div>

                    <button
                      onClick={() => handleDelete(item.id)}
                      disabled={deleteMutation.isPending}
                      className="p-1.5 rounded hover:bg-status-danger/10 text-text-secondary hover:text-status-danger transition-colors"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  <div className="mt-4 space-y-2 text-xs">
                    <div className="flex justify-between items-center bg-vault-base/30 px-3 py-2 rounded border border-border-subtle/50">
                      <span className="text-text-secondary">{mode === 'ssl' ? 'Issuer' : 'Registrar'}:</span>
                      <span className="font-semibold text-text-primary font-mono">{item.registrarOrIssuer}</span>
                    </div>

                    <div className="flex justify-between items-center bg-vault-base/30 px-3 py-2 rounded border border-border-subtle/50">
                      <span className="text-text-secondary">Expiry Date:</span>
                      <span className="font-semibold text-text-primary font-mono">{item.expiryDate}</span>
                    </div>

                    <div className="flex justify-between items-center bg-vault-base/30 px-3 py-2 rounded border border-border-subtle/50">
                      <span className="text-text-secondary">Auto Renew:</span>
                      <span className={`px-2 py-0.5 rounded text-[8px] uppercase font-bold ${
                        item.autoRenew ? 'bg-status-success/15 text-status-success' : 'bg-vault-elevated text-text-muted'
                      }`}>
                        {item.autoRenew ? 'Enabled' : 'Disabled'}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="mt-4 border-t border-border-subtle/50 pt-3 flex justify-between items-center text-[10px]">
                  <span className="text-text-muted">Time Remaining</span>
                  <div className="flex items-center gap-1">
                    {isCritical ? (
                      <AlertTriangle className="w-3.5 h-3.5 text-status-danger animate-pulse" />
                    ) : isWarning ? (
                      <AlertTriangle className="w-3.5 h-3.5 text-status-warning" />
                    ) : (
                      <CheckCircle className="w-3.5 h-3.5 text-status-success" />
                    )}
                    <span className={`font-bold ${
                      isCritical ? 'text-status-danger' : isWarning ? 'text-status-warning' : 'text-status-success'
                    }`}>
                      {daysLeft < 0 ? 'Expired' : `${daysLeft} Days Left`}
                    </span>
                  </div>
                </div>
              </motion.div>
            );
          })
        ) : (
          <div className="col-span-2 glass-panel p-12 text-center flex flex-col items-center justify-center">
            {mode === 'ssl' ? <Shield className="w-12 h-12 text-text-muted mb-4" /> : <Globe className="w-12 h-12 text-text-muted mb-4" />}
            <h3 className="text-sm font-bold text-text-primary mb-1">No Assets Tracked</h3>
            <p className="text-xs text-text-muted max-w-xs">
              Configure domain names or SSL certificates to monitor certificate warning windows.
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
                  <h2 className="text-base font-bold text-text-primary">Add Tracker Asset</h2>
                  <p className="text-xs text-text-muted mt-0.5">Configure warning schedules for expiring security profiles.</p>
                </div>
                <button onClick={() => setIsOpen(false)} className="p-1 text-text-muted hover:text-text-primary">
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleSave} className="space-y-4">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-text-secondary">Domain / Common Name (CN)</label>
                  <input
                    type="text"
                    required
                    value={form.name}
                    onChange={(e) => setForm({ ...form, name: e.target.value })}
                    className="input-field text-xs"
                    placeholder={mode === 'ssl' ? 'e.g. secure.cyberdyne.com' : 'e.g. cyberdyne.com'}
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-text-secondary">
                    {mode === 'ssl' ? 'Certificate Issuer' : 'Domain Registrar'}
                  </label>
                  <input
                    type="text"
                    required
                    value={form.registrarOrIssuer}
                    onChange={(e) => setForm({ ...form, registrarOrIssuer: e.target.value })}
                    className="input-field text-xs"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-text-secondary">Expiration Date</label>
                    <input
                      type="date"
                      required
                      value={form.expiryDate}
                      onChange={(e) => setForm({ ...form, expiryDate: e.target.value })}
                      className="input-field text-xs"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-bold text-text-secondary">DNS Servers / SSL Spec</label>
                    <input
                      type="text"
                      required
                      value={form.dnsOrStrength}
                      onChange={(e) => setForm({ ...form, dnsOrStrength: e.target.value })}
                      className="input-field text-xs"
                    />
                  </div>
                </div>

                <div className="flex items-center gap-2 p-3 bg-vault-elevated/20 rounded border border-border-subtle mt-2">
                  <input
                    type="checkbox"
                    id="autoRenew"
                    checked={form.autoRenew}
                    onChange={(e) => setForm({ ...form, autoRenew: e.target.checked })}
                    className="rounded border-border-subtle text-brand-primary focus:ring-brand-primary bg-vault-base"
                  />
                  <label htmlFor="autoRenew" className="text-xs font-semibold text-text-primary cursor-pointer select-none">
                    Auto-Renew Enabled (Suppresses critical warnings)
                  </label>
                </div>

                <div className="pt-4 flex gap-3">
                  <button type="submit" disabled={createMutation.isPending} className="flex-1 btn-primary py-2 flex items-center justify-center gap-1.5">
                    {createMutation.isPending && <Loader2 className="w-4 h-4 animate-spin" />}
                    Save Asset Tracker
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
