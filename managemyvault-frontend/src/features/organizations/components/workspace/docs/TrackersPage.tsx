import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Search, Globe, Shield, AlertTriangle, CheckCircle, Save, Trash2, X } from 'lucide-react';

interface TrackerItem {
  id: string;
  name: string; // domain or host
  type: 'SSL' | 'Domain';
  registrarOrIssuer: string;
  expiryDate: string;
  autoRenew: boolean;
  dnsOrStrength: string;
}

const DEFAULT_TRACKERS: TrackerItem[] = [
  { id: '1', name: 'cyberdyne.com', type: 'Domain', registrarOrIssuer: 'GoDaddy', expiryDate: '2026-11-20', autoRenew: true, dnsOrStrength: 'ns1.cyberdyne.com / ns2.cyberdyne.com' },
  { id: '2', name: 'secure.cyberdyne.com', type: 'SSL', registrarOrIssuer: 'DigiCert SHA2 Extended', expiryDate: '2026-08-14', autoRenew: false, dnsOrStrength: 'RSA 2048-bit' },
  { id: '3', name: 'api.cyberdyne.com', type: 'SSL', registrarOrIssuer: "Let's Encrypt Authority X3", expiryDate: '2026-07-02', autoRenew: true, dnsOrStrength: 'ECDSA P-256' }
];

interface TrackersPageProps {
  mode: 'ssl' | 'domain';
}

export default function TrackersPage({ mode }: TrackersPageProps) {
  const { orgId } = useParams<{ orgId: string }>();
  const [items, setItems] = useState<TrackerItem[]>([]);
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

  useEffect(() => {
    const stored = localStorage.getItem(`mmv_trackers_${orgId}`);
    if (stored) {
      setItems(JSON.parse(stored));
    } else {
      setItems(DEFAULT_TRACKERS);
      localStorage.setItem(`mmv_trackers_${orgId}`, JSON.stringify(DEFAULT_TRACKERS));
    }
  }, [orgId]);

  const saveItems = (updated: TrackerItem[]) => {
    setItems(updated);
    localStorage.setItem(`mmv_trackers_${orgId}`, JSON.stringify(updated));
  };

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

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name || !form.expiryDate) return;

    const newItem: TrackerItem = {
      id: crypto.randomUUID(),
      name: form.name,
      type: mode === 'ssl' ? 'SSL' : 'Domain',
      registrarOrIssuer: form.registrarOrIssuer,
      expiryDate: form.expiryDate,
      autoRenew: form.autoRenew,
      dnsOrStrength: form.dnsOrStrength
    };

    saveItems([...items, newItem]);
    setIsOpen(false);
  };

  const handleDelete = (id: string) => {
    if (confirm('Are you sure you want to delete this tracker item?')) {
      const updated = items.filter(i => i.id !== id);
      saveItems(updated);
    }
  };

  const getDaysLeft = (expiryStr: string) => {
    const expiry = new Date(expiryStr);
    const diffTime = expiry.getTime() - Date.now();
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  };

  const modeTitle = mode === 'ssl' ? 'SSL Certificates' : 'Domains';
  const itemTypeFilter = mode === 'ssl' ? 'SSL' : 'Domain';

  const filtered = items
    .filter(i => i.type === itemTypeFilter)
    .filter(i =>
      i.name.toLowerCase().includes(search.toLowerCase()) ||
      i.registrarOrIssuer.toLowerCase().includes(search.toLowerCase())
    );

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
            Monitor registration deadlines, issuing authorizers, and automatic renewals.
          </p>
        </div>

        <button onClick={handleOpenAdd} className="btn-primary">
          <Plus className="w-4 h-4 mr-1.5" />
          Add Tracker
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

      {/* Grid of tracker cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {filtered.map((item) => {
          const daysLeft = getDaysLeft(item.expiryDate);
          const isExpiringSoon = daysLeft < 30;
          const isExpired = daysLeft <= 0;

          return (
            <div key={item.id} className="card-elevated p-5 flex flex-col justify-between">
              <div>
                <div className="flex justify-between items-start">
                  <div className="flex items-center gap-3">
                    <div className={`w-9 h-9 rounded-lg flex items-center justify-center ${
                      mode === 'ssl' ? 'bg-brand-primary/10 text-brand-primary' : 'bg-brand-secondary/10 text-brand-secondary'
                    }`}>
                      {mode === 'ssl' ? <Shield className="w-4.5 h-4.5" /> : <Globe className="w-4.5 h-4.5" />}
                    </div>
                    <div>
                      <h3 className="text-xs font-bold text-text-primary">{item.name}</h3>
                      <p className="text-[10px] text-text-muted mt-0.5">{item.registrarOrIssuer}</p>
                    </div>
                  </div>

                  <button
                    onClick={() => handleDelete(item.id)}
                    className="p-1.5 rounded hover:bg-status-danger/10 text-text-secondary hover:text-status-danger transition-colors"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>

                <div className="grid grid-cols-2 gap-4 mt-5 pt-3 border-t border-border-subtle text-xs">
                  <div>
                    <span className="text-[9px] uppercase font-bold text-text-muted">Expiry Date</span>
                    <p className="font-semibold text-text-primary mt-0.5">{item.expiryDate}</p>
                  </div>
                  <div>
                    <span className="text-[9px] uppercase font-bold text-text-muted">Auto Renewal</span>
                    <p className="font-semibold text-text-primary mt-0.5">{item.autoRenew ? 'Enabled' : 'Disabled'}</p>
                  </div>
                </div>

                <div className="mt-3 text-[10px] text-text-secondary font-mono bg-vault-elevated/40 p-2 rounded border border-border-subtle truncate">
                  {mode === 'ssl' ? 'Encryption: ' : 'Nameservers: '}{item.dnsOrStrength}
                </div>
              </div>

              {/* Status footer inside card */}
              <div className="mt-4 flex items-center gap-2 text-xs">
                {isExpired ? (
                  <div className="flex items-center gap-1.5 text-status-danger">
                    <AlertTriangle className="w-4 h-4" />
                    <span className="font-bold uppercase text-[10px]">Expired</span>
                  </div>
                ) : isExpiringSoon ? (
                  <div className="flex items-center gap-1.5 text-status-warning">
                    <AlertTriangle className="w-4 h-4" />
                    <span className="font-bold uppercase text-[10px]">Expiring in {daysLeft} days</span>
                  </div>
                ) : (
                  <div className="flex items-center gap-1.5 text-status-success">
                    <CheckCircle className="w-4 h-4" />
                    <span className="font-bold uppercase text-[10px]">{daysLeft} Days Left</span>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Add Modal */}
      <AnimatePresence>
        {isOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 15 }}
              className="w-full max-w-md bg-vault-card border border-border-subtle rounded-xl shadow-2xl p-6 relative"
            >
              <button
                onClick={() => setIsOpen(false)}
                className="absolute top-4 right-4 p-1.5 rounded-lg hover:bg-vault-elevated text-text-muted hover:text-text-primary transition-colors"
              >
                <X className="w-4 h-4" />
              </button>

              <h2 className="text-base font-bold text-text-primary mb-4">
                Add {modeTitle}
              </h2>

              <form onSubmit={handleSave} className="space-y-4">
                <div>
                  <label className="text-[11px] font-bold uppercase text-text-muted mb-1 block">
                    {mode === 'ssl' ? 'Hostname (Common Name)' : 'Domain Name'}
                  </label>
                  <input
                    type="text"
                    required
                    value={form.name}
                    onChange={(e) => setForm({ ...form, name: e.target.value })}
                    className="input-field text-xs"
                    placeholder="e.g. app.cyberdyne.com"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-[11px] font-bold uppercase text-text-muted mb-1 block">
                      {mode === 'ssl' ? 'Certificate Authority' : 'Registrar'}
                    </label>
                    <input
                      type="text"
                      required
                      value={form.registrarOrIssuer}
                      onChange={(e) => setForm({ ...form, registrarOrIssuer: e.target.value })}
                      className="input-field text-xs"
                    />
                  </div>
                  <div>
                    <label className="text-[11px] font-bold uppercase text-text-muted mb-1 block">Expiration Date</label>
                    <input
                      type="date"
                      required
                      value={form.expiryDate}
                      onChange={(e) => setForm({ ...form, expiryDate: e.target.value })}
                      className="input-field text-xs"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-[11px] font-bold uppercase text-text-muted mb-1 block">
                    {mode === 'ssl' ? 'Key Parameters / Strength' : 'DNS Servers (CSV)'}
                  </label>
                  <input
                    type="text"
                    required
                    value={form.dnsOrStrength}
                    onChange={(e) => setForm({ ...form, dnsOrStrength: e.target.value })}
                    className="input-field text-xs font-mono"
                    placeholder={mode === 'ssl' ? 'RSA 2048-bit' : 'ns1.host.com, ns2.host.com'}
                  />
                </div>

                <div className="flex items-center gap-2 py-2">
                  <input
                    type="checkbox"
                    id="autoRenew"
                    checked={form.autoRenew}
                    onChange={(e) => setForm({ ...form, autoRenew: e.target.checked })}
                    className="rounded bg-vault-base border-border-subtle text-brand-primary focus:ring-0 w-4 h-4 cursor-pointer"
                  />
                  <label htmlFor="autoRenew" className="text-xs text-text-secondary cursor-pointer font-semibold">
                    Enable automatic billing / alerts renewal
                  </label>
                </div>

                <div className="flex gap-3 justify-end pt-3 border-t border-border-subtle">
                  <button type="button" onClick={() => setIsOpen(false)} className="btn-secondary py-2 text-xs">
                    Cancel
                  </button>
                  <button type="submit" className="btn-primary py-2 text-xs">
                    Save Item
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
