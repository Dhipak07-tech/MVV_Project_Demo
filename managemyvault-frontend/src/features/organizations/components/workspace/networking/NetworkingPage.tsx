import { useState } from 'react';
import { useParams } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Plus, Search, HardDrive, Network, Link2, Globe, Server, Cpu, Printer, Lock, Wifi, HelpCircle,
  Trash2, Edit3, X, Info, Check, AlertCircle, RefreshCw
} from 'lucide-react';
import {
  useNetworkingAssets,
  useCreateNetworkingAsset,
  useUpdateNetworkingAsset,
  useDeleteNetworkingAsset
} from '../../../hooks/useAssets';

const NET_TYPE_LABELS: Record<string, string> = {
  'file-sharing': 'File Sharing Configuration',
  'lan': 'Local Area Network (LAN)',
  'mpls': 'Multiprotocol Label Switching (MPLS)',
  'wan': 'Internet / Wide Area Network (WAN)',
  'nas-san': 'NAS / SAN Storage',
  'oob': 'Out-of-Band (OOB) Management',
  'printer-management': 'Printer Management',
  'vpn': 'Virtual Private Network (VPN)',
  'wireless': 'Wireless Network (Wi-Fi)',
};

const getNetIcon = (type: string) => {
  switch (type) {
    case 'file-sharing': return HardDrive;
    case 'lan': return Network;
    case 'mpls': return Link2;
    case 'wan': return Globe;
    case 'nas-san': return Server;
    case 'oob': return Cpu;
    case 'printer-management': return Printer;
    case 'vpn': return Lock;
    case 'wireless': return Wifi;
    default: return HelpCircle;
  }
};

export default function NetworkingPage() {
  const { orgId, netType = 'lan' } = useParams<{ orgId: string; netType: string }>();
  const [search, setSearch] = useState('');
  const [isOpen, setIsOpen] = useState(false);
  const [selectedAssetId, setSelectedAssetId] = useState<string | null>(null);
  const [editingAsset, setEditingAsset] = useState<any | null>(null);

  // Form State
  const [form, setForm] = useState({
    name: '',
    subnetCidr: '',
    gateway: '',
    vlanId: '',
    details: '',
  });

  const [formError, setFormError] = useState<string | null>(null);

  // Queries & Mutations
  const { data: pageData, isLoading, isError, refetch } = useNetworkingAssets(orgId || '', netType, search);
  const createMutation = useCreateNetworkingAsset();
  const updateMutation = useUpdateNetworkingAsset();
  const deleteMutation = useDeleteNetworkingAsset();

  const netLabel = NET_TYPE_LABELS[netType] || 'Networking Config';
  const IconComponent = getNetIcon(netType);

  const handleOpenAdd = () => {
    setEditingAsset(null);
    setFormError(null);
    setForm({
      name: '',
      subnetCidr: '',
      gateway: '',
      vlanId: '',
      details: '',
    });
    setIsOpen(true);
  };

  const handleOpenEdit = (asset: any) => {
    setEditingAsset(asset);
    setFormError(null);
    setForm({
      name: asset.name,
      subnetCidr: asset.subnetCidr || '',
      gateway: asset.gateway || '',
      vlanId: asset.vlanId || '',
      details: asset.details || '',
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
      if (editingAsset) {
        await updateMutation.mutateAsync({
          orgId: orgId || '',
          id: editingAsset.id,
          asset: form,
        });
      } else {
        await createMutation.mutateAsync({
          orgId: orgId || '',
          asset: {
            ...form,
            type: netType,
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
    if (window.confirm('Are you sure you want to delete this networking configuration?')) {
      try {
        await deleteMutation.mutateAsync({
          orgId: orgId || '',
          id,
          type: netType,
        });
        if (selectedAssetId === id) {
          setSelectedAssetId(null);
        }
        refetch();
      } catch (err) {
        alert('Failed to delete configuration');
      }
    }
  };

  const assets = pageData?.content || [];

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
              Network Architecture Center
            </span>
            <h1 className="text-2xl font-bold tracking-tight text-text-primary mt-0.5">
              {netLabel}
            </h1>
            <p className="text-sm text-text-secondary mt-0.5">
              Document subnets, gateways, routing rules, access credentials, and network configuration profiles.
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
          placeholder={`Search configurations by name...`}
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
              <span>Fetching network records from secure storage...</span>
            </div>
          ) : isError ? (
            <div className="glass-panel p-8 text-center text-status-danger border-status-danger/20">
              <AlertCircle className="w-8 h-8 mx-auto mb-2" />
              <span className="font-semibold block">Failed to load networking data</span>
              <button onClick={() => refetch()} className="btn-primary mt-4 py-1.5 text-xs">
                Retry Fetch
              </button>
            </div>
          ) : assets.length === 0 ? (
            <div className="glass-panel p-12 text-center text-text-secondary border-dashed">
              <IconComponent className="w-12 h-12 text-text-muted mx-auto mb-3 opacity-40" />
              <p className="font-semibold text-text-primary">No configurations documented</p>
              <p className="text-xs text-text-muted mt-1 max-w-md mx-auto">
                No configurations found for {netLabel.toLowerCase()}. Register details like IPs, routing, VLAN keys or endpoints now.
              </p>
              <button onClick={handleOpenAdd} className="btn-primary mt-4 py-1.5 text-xs">
                Add Configuration
              </button>
            </div>
          ) : (
            <div className="bg-vault-surface border border-border-subtle rounded-xl overflow-hidden shadow-sm">
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="border-b border-border-subtle bg-vault-elevated/20 text-xs font-bold text-text-muted uppercase tracking-wider">
                      <th className="p-3.5">Configuration Name</th>
                      <th className="p-3.5">Subnet / CIDR</th>
                      <th className="p-3.5">Gateway</th>
                      <th className="p-3.5">VLAN ID</th>
                      <th className="p-3.5 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border-subtle text-sm">
                    {assets.map((asset) => (
                      <tr
                        key={asset.id}
                        onClick={() => setSelectedAssetId(selectedAssetId === asset.id ? null : asset.id)}
                        className={`hover:bg-vault-elevated/40 transition-colors cursor-pointer ${
                          selectedAssetId === asset.id ? 'bg-brand-primary/5 border-l-2 border-l-brand-primary' : ''
                        }`}
                      >
                        <td className="p-3.5 font-semibold text-text-primary">
                          {asset.name}
                        </td>
                        <td className="p-3.5 font-mono text-xs text-text-secondary">
                          {asset.subnetCidr || '—'}
                        </td>
                        <td className="p-3.5 font-mono text-xs text-text-secondary">
                          {asset.gateway || '—'}
                        </td>
                        <td className="p-3.5 text-xs text-text-secondary font-semibold">
                          {asset.vlanId ? `VLAN ${asset.vlanId}` : '—'}
                        </td>
                        <td className="p-3.5 text-right" onClick={(e) => e.stopPropagation()}>
                          <div className="flex items-center justify-end gap-2">
                            <button
                              onClick={() => handleOpenEdit(asset)}
                              className="p-1 rounded hover:bg-vault-elevated text-text-secondary hover:text-text-primary"
                              title="Edit config properties"
                            >
                              <Edit3 className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => handleDelete(asset.id)}
                              className="p-1 rounded hover:bg-vault-elevated text-text-secondary hover:text-status-danger"
                              title="Delete config record"
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
            {selectedAssetId ? (
              (() => {
                const asset = assets.find((a) => a.id === selectedAssetId);
                if (!asset) return null;
                return (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 10 }}
                    className="glass-panel p-5 space-y-4 border-brand-primary/20 bg-vault-surface/40"
                  >
                    <div className="flex justify-between items-start border-b border-border-subtle pb-3">
                      <div>
                        <h3 className="font-bold text-text-primary text-base">{asset.name}</h3>
                        <p className="text-xs text-text-muted font-medium mt-0.5">{netLabel}</p>
                      </div>
                      <button
                        onClick={() => setSelectedAssetId(null)}
                        className="p-1 rounded hover:bg-vault-elevated text-text-muted hover:text-text-primary"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>

                    <div className="space-y-3 text-xs">
                      <div>
                        <span className="text-text-muted block font-medium">Subnet / CIDR Scope</span>
                        <span className="font-mono text-text-secondary block mt-0.5">{asset.subnetCidr || 'Not Configured'}</span>
                      </div>
                      <div>
                        <span className="text-text-muted block font-medium">Gateway Endpoint</span>
                        <span className="font-mono text-text-secondary block mt-0.5">{asset.gateway || '—'}</span>
                      </div>
                      <div>
                        <span className="text-text-muted block font-medium">Virtual LAN (VLAN ID)</span>
                        <span className="font-mono text-text-secondary block mt-0.5">{asset.vlanId || '—'}</span>
                      </div>
                      <div className="border-t border-border-subtle pt-3">
                        <span className="text-text-muted block font-medium">Configuration & Integration Details</span>
                        <p className="text-text-secondary leading-relaxed mt-1 whitespace-pre-wrap">{asset.details || 'No documentation available.'}</p>
                      </div>
                    </div>
                  </motion.div>
                );
              })()
            ) : (
              <div className="glass-panel p-6 text-center text-text-muted border-dashed flex flex-col items-center justify-center min-h-[200px]">
                <Info className="w-8 h-8 text-text-muted opacity-30 mb-2" />
                <p className="text-sm font-semibold">Select a configuration record</p>
                <p className="text-xs mt-0.5">Click any row in the list to reveal its full network credentials, configuration details, SSIDs, and port mapping guidelines.</p>
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
                  {editingAsset ? 'Edit Configuration Specs' : `Configure ${netLabel}`}
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
                      Configuration Name *
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Primary Corporate Wi-Fi, Storage SAN Segment"
                      value={form.name}
                      onChange={(e) => setForm({ ...form, name: e.target.value })}
                      className="w-full bg-vault-elevated/40 border border-border-subtle rounded-lg px-3 py-2 text-sm text-text-primary outline-none focus:border-brand-primary transition-colors"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-text-muted uppercase mb-1.5">
                      Subnet / CIDR Scope
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. 192.168.10.0/24"
                      value={form.subnetCidr}
                      onChange={(e) => setForm({ ...form, subnetCidr: e.target.value })}
                      className="w-full bg-vault-elevated/40 border border-border-subtle rounded-lg px-3 py-2 text-sm text-text-primary outline-none focus:border-brand-primary transition-colors font-mono"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-text-muted uppercase mb-1.5">
                      Gateway Address
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. 192.168.10.1"
                      value={form.gateway}
                      onChange={(e) => setForm({ ...form, gateway: e.target.value })}
                      className="w-full bg-vault-elevated/40 border border-border-subtle rounded-lg px-3 py-2 text-sm text-text-primary outline-none focus:border-brand-primary transition-colors font-mono"
                    />
                  </div>

                  <div className="col-span-2">
                    <label className="block text-xs font-semibold text-text-muted uppercase mb-1.5">
                      VLAN ID
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. 10 or 100"
                      value={form.vlanId}
                      onChange={(e) => setForm({ ...form, vlanId: e.target.value })}
                      className="w-full bg-vault-elevated/40 border border-border-subtle rounded-lg px-3 py-2 text-sm text-text-primary outline-none focus:border-brand-primary transition-colors font-mono"
                    />
                  </div>

                  <div className="col-span-2">
                    <label className="block text-xs font-semibold text-text-muted uppercase mb-1.5">
                      Technical Details & Credentials
                    </label>
                    <textarea
                      placeholder="Document SSIDs, pre-shared keys, VPN endpoints, shared folder network paths, access permissions..."
                      value={form.details}
                      onChange={(e) => setForm({ ...form, details: e.target.value })}
                      rows={5}
                      className="w-full bg-vault-elevated/40 border border-border-subtle rounded-lg px-3 py-2 text-sm text-text-primary outline-none focus:border-brand-primary transition-colors resize-none"
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
