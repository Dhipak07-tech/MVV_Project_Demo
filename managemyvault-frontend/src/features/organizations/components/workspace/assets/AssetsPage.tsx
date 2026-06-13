import { useState } from 'react';
import { useParams } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Plus, Search, Shield, Printer, Network, Server, Laptop, Cpu, Zap, Activity, HelpCircle,
  Trash2, Edit3, X, Info, Check, AlertCircle, RefreshCw
} from 'lucide-react';
import {
  useAssets,
  useCreateAsset,
  useUpdateAsset,
  useDeleteAsset
} from '../../../hooks/useAssets';

const ASSET_TYPE_LABELS: Record<string, string> = {
  'firewalls': 'Managed Network Firewall',
  'printers': 'Managed Network Printer',
  'switches': 'Managed Network Switch',
  'servers': 'Managed Server',
  'workstations': 'Managed Workstation',
  'laptops': 'Managed Laptop',
  'ups': 'Managed Network UPS',
  'esx-hosts': 'Managed Network ESX Host',
  'virtualization': 'Virtualization Platform',
};

const getAssetIcon = (type: string) => {
  switch (type) {
    case 'firewalls': return Shield;
    case 'printers': return Printer;
    case 'switches': return Network;
    case 'servers': return Server;
    case 'workstations': return Laptop;
    case 'laptops': return Laptop;
    case 'ups': return Zap;
    case 'esx-hosts': return Cpu;
    case 'virtualization': return Activity;
    default: return HelpCircle;
  }
};

export default function AssetsPage() {
  const { orgId, assetType = 'firewalls' } = useParams<{ orgId: string; assetType: string }>();
  const [search, setSearch] = useState('');
  const [isOpen, setIsOpen] = useState(false);
  const [selectedAssetId, setSelectedAssetId] = useState<string | null>(null);
  const [editingAsset, setEditingAsset] = useState<any | null>(null);

  // Form State
  const [form, setForm] = useState({
    name: '',
    ipAddress: '',
    macAddress: '',
    serialNumber: '',
    model: '',
    manufacturer: '',
    osVersion: '',
    status: 'Active',
    notes: '',
  });

  const [formError, setFormError] = useState<string | null>(null);

  // Queries & Mutations
  const { data: pageData, isLoading, isError, refetch } = useAssets(orgId || '', assetType, search);
  const createAssetMutation = useCreateAsset();
  const updateAssetMutation = useUpdateAsset();
  const deleteAssetMutation = useDeleteAsset();

  const assetLabel = ASSET_TYPE_LABELS[assetType] || 'Hardware Asset';
  const IconComponent = getAssetIcon(assetType);

  const handleOpenAdd = () => {
    setEditingAsset(null);
    setFormError(null);
    setForm({
      name: '',
      ipAddress: '',
      macAddress: '',
      serialNumber: '',
      model: '',
      manufacturer: '',
      osVersion: '',
      status: 'Active',
      notes: '',
    });
    setIsOpen(true);
  };

  const handleOpenEdit = (asset: any) => {
    setEditingAsset(asset);
    setFormError(null);
    setForm({
      name: asset.name,
      ipAddress: asset.ipAddress || '',
      macAddress: asset.macAddress || '',
      serialNumber: asset.serialNumber || '',
      model: asset.model || '',
      manufacturer: asset.manufacturer || '',
      osVersion: asset.osVersion || '',
      status: asset.status || 'Active',
      notes: asset.notes || '',
    });
    setIsOpen(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name.trim()) {
      setFormError('Asset name is required');
      return;
    }

    try {
      if (editingAsset) {
        await updateAssetMutation.mutateAsync({
          orgId: orgId || '',
          id: editingAsset.id,
          asset: form,
        });
      } else {
        await createAssetMutation.mutateAsync({
          orgId: orgId || '',
          asset: {
            ...form,
            type: assetType,
          },
        });
      }
      setIsOpen(false);
      refetch();
    } catch (err: any) {
      setFormError(err.response?.data?.message || 'Failed to save asset. Please try again.');
    }
  };

  const handleDelete = async (id: string) => {
    if (window.confirm('Are you sure you want to delete this hardware asset?')) {
      try {
        await deleteAssetMutation.mutateAsync({
          orgId: orgId || '',
          id,
          type: assetType,
        });
        if (selectedAssetId === id) {
          setSelectedAssetId(null);
        }
        refetch();
      } catch (err) {
        alert('Failed to delete asset');
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
            <span className="text-metadata font-semibold text-brand-primary tracking-wider uppercase">
              Hardware Asset Engine
            </span>
            <h1 className="text-page-title text-text-primary mt-0.5">
              {assetLabel}s
            </h1>
            <p className="text-sm text-text-secondary mt-0.5">
              Manage physical devices, configuration items, and operational parameters.
            </p>
          </div>
        </div>

        <button onClick={handleOpenAdd} className="btn-primary flex items-center gap-2">
          <Plus className="w-4 h-4" />
          Add Device
        </button>
      </div>

      {/* Search Bar */}
      <div className="flex items-center gap-3 bg-vault-surface rounded-xl p-3 border border-border-subtle shadow-sm">
        <Search className="w-5 h-5 text-text-muted flex-shrink-0" />
        <input
          type="text"
          placeholder={`Search ${assetLabel.toLowerCase()}s by name...`}
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
              <span>Fetching asset records from secure storage...</span>
            </div>
          ) : isError ? (
            <div className="glass-panel p-8 text-center text-status-danger border-status-danger/20">
              <AlertCircle className="w-8 h-8 mx-auto mb-2" />
              <span className="font-semibold block">Failed to load device list</span>
              <button onClick={() => refetch()} className="btn-primary mt-4 py-1.5 text-xs">
                Retry Fetch
              </button>
            </div>
          ) : assets.length === 0 ? (
            <div className="glass-panel p-12 text-center text-text-secondary border-dashed">
              <IconComponent className="w-12 h-12 text-text-muted mx-auto mb-3 opacity-40" />
              <p className="font-semibold text-text-primary">No devices registered</p>
              <p className="text-xs text-text-muted mt-1 max-w-md mx-auto">
                No {assetLabel.toLowerCase()} assets found matching your criteria. Get started by registering a new device.
              </p>
              <button onClick={handleOpenAdd} className="btn-primary mt-4 py-1.5 text-xs">
                Register Device
              </button>
            </div>
          ) : (
            <div className="bg-vault-surface border border-border-subtle rounded-xl overflow-hidden shadow-sm">
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="border-b border-border-subtle bg-vault-elevated/20 text-table-header text-text-muted">
                      <th className="p-3.5">Device Name</th>
                      <th className="p-3.5">IP Address</th>
                      <th className="p-3.5">Model / Vendor</th>
                      <th className="p-3.5">Status</th>
                      <th className="p-3.5 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border-subtle text-table-cell">
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
                        <td className="p-3.5 text-code text-xs text-text-secondary">
                          {asset.ipAddress || '—'}
                        </td>
                        <td className="p-3.5 text-xs text-text-secondary">
                          {asset.manufacturer ? `${asset.manufacturer} ` : ''}{asset.model || '—'}
                        </td>
                        <td className="p-3.5">
                          <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium border ${
                            asset.status === 'Active'
                              ? 'bg-status-success/10 text-status-success border-status-success/20'
                              : 'bg-status-warning/10 text-status-warning border-status-warning/20'
                          }`}>
                            {asset.status}
                          </span>
                        </td>
                        <td className="p-3.5 text-right" onClick={(e) => e.stopPropagation()}>
                          <div className="flex items-center justify-end gap-2">
                            <button
                              onClick={() => handleOpenEdit(asset)}
                              className="p-1 rounded hover:bg-vault-elevated text-text-secondary hover:text-text-primary"
                              title="Edit device specs"
                            >
                              <Edit3 className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => handleDelete(asset.id)}
                              className="p-1 rounded hover:bg-vault-elevated text-text-secondary hover:text-status-danger"
                              title="Decommission device"
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
                        <h3 className="text-card-title text-text-primary">{asset.name}</h3>
                        <p className="text-xs text-text-muted font-medium mt-0.5">{assetLabel}</p>
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
                        <span className="text-text-muted block font-medium">IP Address</span>
                        <span className="text-code text-text-secondary block mt-0.5">{asset.ipAddress || 'Not Assigned'}</span>
                      </div>
                      <div>
                        <span className="text-text-muted block font-medium">MAC Address</span>
                        <span className="text-code text-text-secondary block mt-0.5">{asset.macAddress || '—'}</span>
                      </div>
                      <div>
                        <span className="text-text-muted block font-medium">Serial Number</span>
                        <span className="text-code text-text-secondary block mt-0.5">{asset.serialNumber || '—'}</span>
                      </div>
                      <div>
                        <span className="text-text-muted block font-medium">Hardware Model</span>
                        <span className="text-text-secondary block mt-0.5">{asset.manufacturer || '—'} {asset.model || '—'}</span>
                      </div>
                      {asset.osVersion && (
                        <div>
                          <span className="text-text-muted block font-medium">Operating System</span>
                          <span className="text-text-secondary block mt-0.5">{asset.osVersion}</span>
                        </div>
                      )}
                      <div>
                        <span className="text-text-muted block font-medium">Status</span>
                        <span className="text-text-secondary block mt-0.5">{asset.status}</span>
                      </div>
                      <div className="border-t border-border-subtle pt-3">
                        <span className="text-text-muted block font-medium">Operational Notes</span>
                        <p className="text-text-secondary leading-relaxed mt-1 whitespace-pre-wrap">{asset.notes || 'No notes available.'}</p>
                      </div>
                    </div>
                  </motion.div>
                );
              })()
            ) : (
              <div className="glass-panel p-6 text-center text-text-muted border-dashed flex flex-col items-center justify-center min-h-[200px]">
                <Info className="w-8 h-8 text-text-muted opacity-30 mb-2" />
                <p className="text-sm font-semibold">Select a device record</p>
                <p className="text-xs mt-0.5">Click any asset row in the list to reveal its full hardware specifications, serial logs, and configuration details.</p>
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
                  {editingAsset ? 'Edit Device Configuration' : `Register ${assetLabel}`}
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
                      Device Display Name *
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Server DC-01, Firewall Primary Edge"
                      value={form.name}
                      onChange={(e) => setForm({ ...form, name: e.target.value })}
                      className="w-full bg-vault-elevated/40 border border-border-subtle rounded-lg px-3 py-2 text-sm text-text-primary outline-none focus:border-brand-primary transition-colors"
                    />
                  </div>

                  <div>
                    <label className="block text-form-label uppercase text-text-muted mb-1.5">
                      Manufacturer
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. Cisco, Dell, Fortinet"
                      value={form.manufacturer}
                      onChange={(e) => setForm({ ...form, manufacturer: e.target.value })}
                      className="w-full bg-vault-elevated/40 border border-border-subtle rounded-lg px-3 py-2 text-sm text-text-primary outline-none focus:border-brand-primary transition-colors"
                    />
                  </div>

                  <div>
                    <label className="block text-form-label uppercase text-text-muted mb-1.5">
                      Model / Specs
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. PowerEdge R740, ASA 5516-X"
                      value={form.model}
                      onChange={(e) => setForm({ ...form, model: e.target.value })}
                      className="w-full bg-vault-elevated/40 border border-border-subtle rounded-lg px-3 py-2 text-sm text-text-primary outline-none focus:border-brand-primary transition-colors"
                    />
                  </div>

                  <div>
                    <label className="block text-form-label uppercase text-text-muted mb-1.5">
                      IP Address
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. 192.168.1.1"
                      value={form.ipAddress}
                      onChange={(e) => setForm({ ...form, ipAddress: e.target.value })}
                      className="w-full bg-vault-elevated/40 border border-border-subtle rounded-lg px-3 py-2 text-sm text-text-primary outline-none focus:border-brand-primary transition-colors font-mono"
                    />
                  </div>

                  <div>
                    <label className="block text-form-label uppercase text-text-muted mb-1.5">
                      MAC Address
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. 00:0d:3f:cd:02:5f"
                      value={form.macAddress}
                      onChange={(e) => setForm({ ...form, macAddress: e.target.value })}
                      className="w-full bg-vault-elevated/40 border border-border-subtle rounded-lg px-3 py-2 text-sm text-text-primary outline-none focus:border-brand-primary transition-colors font-mono"
                    />
                  </div>

                  <div>
                    <label className="block text-form-label uppercase text-text-muted mb-1.5">
                      Serial Number
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. S/N or Service Tag"
                      value={form.serialNumber}
                      onChange={(e) => setForm({ ...form, serialNumber: e.target.value })}
                      className="w-full bg-vault-elevated/40 border border-border-subtle rounded-lg px-3 py-2 text-sm text-text-primary outline-none focus:border-brand-primary transition-colors font-mono"
                    />
                  </div>

                  <div>
                    <label className="block text-form-label uppercase text-text-muted mb-1.5">
                      OS Version
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. Windows Server, ESXi, Linux"
                      value={form.osVersion}
                      onChange={(e) => setForm({ ...form, osVersion: e.target.value })}
                      className="w-full bg-vault-elevated/40 border border-border-subtle rounded-lg px-3 py-2 text-sm text-text-primary outline-none focus:border-brand-primary transition-colors"
                    />
                  </div>

                  <div className="col-span-2">
                    <label className="block text-form-label uppercase text-text-muted mb-1.5">
                      Status
                    </label>
                    <select
                      value={form.status}
                      onChange={(e) => setForm({ ...form, status: e.target.value })}
                      className="w-full bg-vault-elevated/40 border border-border-subtle rounded-lg px-3 py-2 text-sm text-text-primary outline-none focus:border-brand-primary transition-colors"
                    >
                      <option value="Active" className="bg-vault-surface">Active</option>
                      <option value="Maintenance" className="bg-vault-surface">Maintenance</option>
                      <option value="Decommissioned" className="bg-vault-surface">Decommissioned</option>
                    </select>
                  </div>

                  <div className="col-span-2">
                    <label className="block text-form-label uppercase text-text-muted mb-1.5">
                      Operational Notes & Config Context
                    </label>
                    <textarea
                      placeholder="Details about power circuits, backup schedules, credential links, physical position..."
                      value={form.notes}
                      onChange={(e) => setForm({ ...form, notes: e.target.value })}
                      rows={4}
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
                    disabled={createAssetMutation.isPending || updateAssetMutation.isPending}
                  >
                    {(createAssetMutation.isPending || updateAssetMutation.isPending) ? (
                      <RefreshCw className="w-4 h-4 animate-spin" />
                    ) : (
                      <Check className="w-4 h-4" />
                    )}
                    Save Device
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
