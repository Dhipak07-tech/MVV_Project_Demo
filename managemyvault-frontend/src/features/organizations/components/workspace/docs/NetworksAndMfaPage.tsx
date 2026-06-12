import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Search, Network, Key, AlertTriangle, Calendar, Save, Trash2, X } from 'lucide-react';

interface NetworkOrMfaItem {
  id: string;
  title: string;
  type: 'Network' | 'MFA' | 'Issue' | 'Maintenance';
  param1: string; // Subnet, MFA Provider, Severity, Target Device
  param2: string; // VLAN/DHCP, Backup Policy, Status, Duration
  notes: string;
}

const DEFAULT_ITEMS: NetworkOrMfaItem[] = [
  { id: '1', title: 'HQ LAN Subnet', type: 'Network', param1: '10.0.1.0/24', param2: 'VLAN 10 · Gateway 10.0.1.1', notes: 'Core administration subnet. DHCP scope: 10.0.1.100 - 10.0.1.200.' },
  { id: '2', title: 'Primary Active Directory MFA', type: 'MFA', param1: 'DUO Security Integration', param2: 'Backup: Offline hardware bypass token', notes: 'Duo authentication proxy is installed on Server 10.0.1.6.' },
  { id: '3', title: 'HQ Firewall WAN Link Outage Flapping', type: 'Issue', param1: 'Major Severity', param2: 'In Investigation', notes: 'Comcast fiber link experiences sporadic packet loss between 2 PM and 4 PM daily. Ticket #9910 opened.' },
  { id: '4', title: 'Monthly Windows Server Security Patching', type: 'Maintenance', param1: 'All AD Servers', param2: '3 Hours Duration', notes: 'Scheduled patching window every third Saturday at 2:00 AM EST. Services failover to Secondary DC.' }
];

interface NetworksAndMfaPageProps {
  mode: 'networks' | 'mfa' | 'known-issues' | 'maintenance';
}

export default function NetworksAndMfaPage({ mode }: NetworksAndMfaPageProps) {
  const { orgId } = useParams<{ orgId: string }>();
  const [items, setItems] = useState<NetworkOrMfaItem[]>([]);
  const [search, setSearch] = useState('');
  const [isOpen, setIsOpen] = useState(false);

  // Form State
  const [form, setForm] = useState({
    title: '',
    param1: '',
    param2: '',
    notes: ''
  });

  useEffect(() => {
    const stored = localStorage.getItem(`mmv_netmfa_${orgId}`);
    if (stored) {
      setItems(JSON.parse(stored));
    } else {
      setItems(DEFAULT_ITEMS);
      localStorage.setItem(`mmv_netmfa_${orgId}`, JSON.stringify(DEFAULT_ITEMS));
    }
  }, [orgId]);

  const saveItems = (updated: NetworkOrMfaItem[]) => {
    setItems(updated);
    localStorage.setItem(`mmv_netmfa_${orgId}`, JSON.stringify(updated));
  };

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

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.title || !form.notes) return;

    const typeFilterMap = {
      networks: 'Network',
      mfa: 'MFA',
      'known-issues': 'Issue',
      maintenance: 'Maintenance'
    }[mode] as NetworkOrMfaItem['type'];

    const newItem: NetworkOrMfaItem = {
      id: crypto.randomUUID(),
      title: form.title,
      type: typeFilterMap,
      param1: form.param1,
      param2: form.param2,
      notes: form.notes
    };

    saveItems([...items, newItem]);
    setIsOpen(false);
  };

  const handleDelete = (id: string) => {
    if (confirm('Are you sure you want to delete this configuration item?')) {
      const updated = items.filter(i => i.id !== id);
      saveItems(updated);
    }
  };

  const modeTitle = {
    networks: 'Networks & VLANs',
    mfa: 'Multi-Factor Auth',
    'known-issues': 'Known Issues Log',
    maintenance: 'Maintenance Windows'
  }[mode];

  const typeFilterMap = {
    networks: 'Network',
    mfa: 'MFA',
    'known-issues': 'Issue',
    maintenance: 'Maintenance'
  }[mode];

  const filtered = items
    .filter(i => i.type === typeFilterMap)
    .filter(i =>
      i.title.toLowerCase().includes(search.toLowerCase()) ||
      i.notes.toLowerCase().includes(search.toLowerCase())
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
            {modeTitle}
          </h1>
          <p className="text-sm text-text-secondary mt-0.5">
            Manage infrastructure subnets, security procedures, system bugs, and patching schedules.
          </p>
        </div>

        <button onClick={handleOpenAdd} className="btn-primary">
          <Plus className="w-4 h-4 mr-1.5" />
          Add Configuration
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

      {/* Grid of config logs */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {filtered.map((item) => (
          <div key={item.id} className="card-elevated p-5 flex flex-col justify-between">
            <div>
              <div className="flex justify-between items-start">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-lg bg-vault-elevated flex items-center justify-center text-text-secondary">
                    {mode === 'networks' && <Network className="w-4.5 h-4.5 text-brand-primary" />}
                    {mode === 'mfa' && <Key className="w-4.5 h-4.5 text-status-success" />}
                    {mode === 'known-issues' && <AlertTriangle className="w-4.5 h-4.5 text-status-danger" />}
                    {mode === 'maintenance' && <Calendar className="w-4.5 h-4.5 text-status-warning" />}
                  </div>
                  <div>
                    <h3 className="text-xs font-bold text-text-primary">{item.title}</h3>
                    <p className="text-[10px] text-text-muted mt-0.5">{item.param1}</p>
                  </div>
                </div>

                <button
                  onClick={() => handleDelete(item.id)}
                  className="p-1.5 rounded hover:bg-status-danger/10 text-text-secondary hover:text-status-danger transition-colors"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>

              <div className="mt-4 pt-3 border-t border-border-subtle text-xs space-y-1">
                <span className="text-[9px] uppercase font-bold text-text-muted">Parameter details</span>
                <p className="font-semibold text-text-primary mt-0.5">{item.param2}</p>
              </div>
            </div>

            <p className="mt-3.5 text-xs text-text-secondary leading-relaxed bg-vault-elevated/40 p-3 rounded-lg border border-border-subtle font-mono text-[11px]">
              {item.notes}
            </p>
          </div>
        ))}
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
                  <label className="text-[11px] font-bold uppercase text-text-muted mb-1 block">Title / Device Name</label>
                  <input
                    type="text"
                    required
                    value={form.title}
                    onChange={(e) => setForm({ ...form, title: e.target.value })}
                    className="input-field text-xs"
                    placeholder="e.g. HQ Subnet"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-[11px] font-bold uppercase text-text-muted mb-1 block">
                      {mode === 'networks' ? 'CIDR Block' : mode === 'mfa' ? 'Auth Provider' : mode === 'known-issues' ? 'Severity' : 'Target Target'}
                    </label>
                    <input
                      type="text"
                      required
                      value={form.param1}
                      onChange={(e) => setForm({ ...form, param1: e.target.value })}
                      className="input-field text-xs"
                    />
                  </div>
                  <div>
                    <label className="text-[11px] font-bold uppercase text-text-muted mb-1 block">
                      {mode === 'networks' ? 'Gateway/VLAN' : mode === 'mfa' ? 'Backup Mode' : mode === 'known-issues' ? 'Status' : 'Window Duration'}
                    </label>
                    <input
                      type="text"
                      required
                      value={form.param2}
                      onChange={(e) => setForm({ ...form, param2: e.target.value })}
                      className="input-field text-xs"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-[11px] font-bold uppercase text-text-muted mb-1 block">Configuration Instructions & Notes</label>
                  <textarea
                    required
                    value={form.notes}
                    onChange={(e) => setForm({ ...form, notes: e.target.value })}
                    className="input-field h-24 resize-none text-xs"
                    placeholder="Provide details..."
                  />
                </div>

                <div className="flex gap-3 justify-end pt-3 border-t border-border-subtle">
                  <button type="button" onClick={() => setIsOpen(false)} className="btn-secondary py-2 text-xs">
                    Cancel
                  </button>
                  <button type="submit" className="btn-primary py-2 text-xs">
                    Save Config
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
