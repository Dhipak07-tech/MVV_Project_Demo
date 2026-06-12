import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Search, MapPin, Edit2, Trash2, Landmark, X } from 'lucide-react';

interface LocationItem {
  id: string;
  name: string;
  address: string;
  city: string;
  state: string;
  zip: string;
  type: 'HQ' | 'Branch' | 'Data Center' | 'Remote';
  status: 'Active' | 'Inactive';
  notes: string;
}

const DEFAULT_LOCATIONS: LocationItem[] = [
  { id: '1', name: 'Cyberdyne Headquarters', address: '18144 El Camino Real', city: 'Sunnyvale', state: 'CA', zip: '94087', type: 'HQ', status: 'Active', notes: 'Main executive office and development laboratories.' },
  { id: '2', name: 'Primary Data Center', address: '2211 N 1st St', city: 'San Jose', state: 'CA', zip: '95131', type: 'Data Center', status: 'Active', notes: 'Secured server room holding core system configurations.' },
];

export default function LocationsPage() {
  const { orgId } = useParams<{ orgId: string }>();
  const [locations, setLocations] = useState<LocationItem[]>([]);
  const [search, setSearch] = useState('');
  const [filterType, setFilterType] = useState('All');
  
  // Modal State
  const [isOpen, setIsOpen] = useState(false);
  const [editingLoc, setEditingLoc] = useState<LocationItem | null>(null);

  // Form State
  const [form, setForm] = useState({
    name: '',
    address: '',
    city: '',
    state: '',
    zip: '',
    type: 'Branch' as LocationItem['type'],
    status: 'Active' as LocationItem['status'],
    notes: '',
  });

  // Load from local storage
  useEffect(() => {
    const stored = localStorage.getItem(`mmv_locations_${orgId}`);
    if (stored) {
      setLocations(JSON.parse(stored));
    } else {
      setLocations(DEFAULT_LOCATIONS);
      localStorage.setItem(`mmv_locations_${orgId}`, JSON.stringify(DEFAULT_LOCATIONS));
    }
  }, [orgId]);

  // Save helper
  const saveLocations = (updated: LocationItem[]) => {
    setLocations(updated);
    localStorage.setItem(`mmv_locations_${orgId}`, JSON.stringify(updated));
  };

  const handleOpenAdd = () => {
    setEditingLoc(null);
    setForm({
      name: '',
      address: '',
      city: '',
      state: '',
      zip: '',
      type: 'Branch',
      status: 'Active',
      notes: '',
    });
    setIsOpen(true);
  };

  const handleOpenEdit = (loc: LocationItem) => {
    setEditingLoc(loc);
    setForm({
      name: loc.name,
      address: loc.address,
      city: loc.city,
      state: loc.state,
      zip: loc.zip,
      type: loc.type,
      status: loc.status,
      notes: loc.notes,
    });
    setIsOpen(true);
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name || !form.address) return;

    if (editingLoc) {
      const updated = locations.map((l) =>
        l.id === editingLoc.id ? { ...l, ...form } : l
      );
      saveLocations(updated);
    } else {
      const newLoc: LocationItem = {
        id: crypto.randomUUID(),
        ...form,
      };
      saveLocations([...locations, newLoc]);
    }
    setIsOpen(false);
  };

  const handleDelete = (id: string) => {
    if (confirm('Are you sure you want to delete this location?')) {
      const updated = locations.filter((l) => l.id !== id);
      saveLocations(updated);
    }
  };

  // Filter
  const filteredLocs = locations.filter((l) => {
    const matchesSearch =
      l.name.toLowerCase().includes(search.toLowerCase()) ||
      l.address.toLowerCase().includes(search.toLowerCase()) ||
      l.city.toLowerCase().includes(search.toLowerCase());
    const matchesType = filterType === 'All' || l.type === filterType;
    return matchesSearch && matchesType;
  });

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-border-subtle pb-5">
        <div>
          <span className="text-xs font-semibold text-brand-primary tracking-wider uppercase">
            Client Contact
          </span>
          <h1 className="text-2xl font-bold tracking-tight text-text-primary mt-1">
            Locations & Sites
          </h1>
          <p className="text-sm text-text-secondary mt-0.5">
            Document building addresses, physical spaces, and core data centers.
          </p>
        </div>

        <button onClick={handleOpenAdd} className="btn-primary">
          <Plus className="w-4 h-4 mr-1.5" />
          Add Location
        </button>
      </div>

      {/* Search and Filters */}
      <div className="flex flex-col sm:flex-row items-center gap-4">
        <div className="relative flex-1 w-full">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted" />
          <input
            type="text"
            placeholder="Search locations by name, address, or city..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="input-field pl-10"
          />
        </div>
        <div className="flex gap-2 w-full sm:w-auto">
          {['All', 'HQ', 'Branch', 'Data Center', 'Remote'].map((type) => (
            <button
              key={type}
              onClick={() => setFilterType(type)}
              className={`px-3 py-1.5 text-xs font-semibold rounded-lg border transition-all ${
                filterType === type
                  ? 'bg-brand-primary/10 border-brand-primary text-brand-primary'
                  : 'bg-vault-card border-border-subtle text-text-secondary hover:text-text-primary hover:border-border-default'
              }`}
            >
              {type}
            </button>
          ))}
        </div>
      </div>

      {/* Grid of Locations */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {filteredLocs.map((loc) => (
          <motion.div
            layout
            key={loc.id}
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="card-elevated p-5 flex flex-col justify-between"
          >
            <div>
              {/* Header */}
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-brand-primary/10 flex items-center justify-center text-brand-primary">
                    {loc.type === 'HQ' ? <Landmark className="w-5 h-5" /> : <MapPin className="w-5 h-5" />}
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-text-primary">{loc.name}</h3>
                    <p className="text-xs text-text-muted">{loc.address}</p>
                  </div>
                </div>

                <div className="flex items-center gap-1">
                  <button
                    onClick={() => handleOpenEdit(loc)}
                    className="p-1.5 rounded hover:bg-vault-elevated text-text-secondary hover:text-text-primary transition-colors"
                  >
                    <Edit2 className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() => handleDelete(loc.id)}
                    className="p-1.5 rounded hover:bg-status-danger/10 text-text-secondary hover:text-status-danger transition-colors"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              {/* Badges */}
              <div className="flex gap-2 mt-4">
                <span className={`badge text-[10px] font-semibold uppercase ${
                  loc.type === 'HQ' ? 'badge-success' : loc.type === 'Data Center' ? 'badge-warning' : 'badge-info'
                }`}>
                  {loc.type}
                </span>
                <span className={`badge text-[10px] font-semibold uppercase ${
                  loc.status === 'Active' ? 'badge-success' : 'badge-danger'
                }`}>
                  {loc.status}
                </span>
              </div>

              {/* Address detail */}
              <p className="mt-4 text-xs text-text-secondary">
                {loc.city}, {loc.state} {loc.zip}
              </p>
            </div>

            {loc.notes && (
              <div className="mt-4 pt-3 border-t border-border-subtle bg-vault-elevated/20 p-2 rounded text-[11px] text-text-muted leading-relaxed">
                {loc.notes}
              </div>
            )}
          </motion.div>
        ))}

        {filteredLocs.length === 0 && (
          <div className="col-span-full text-center py-12 text-text-muted">
            No locations found.
          </div>
        )}
      </div>

      {/* Add/Edit Modal */}
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
                {editingLoc ? 'Edit Location' : 'Add New Location'}
              </h2>

              <form onSubmit={handleSave} className="space-y-4">
                <div>
                  <label className="text-[11px] font-bold uppercase text-text-muted mb-1 block">Location Name</label>
                  <input
                    type="text"
                    required
                    value={form.name}
                    onChange={(e) => setForm({ ...form, name: e.target.value })}
                    className="input-field"
                    placeholder="e.g. Headquarters / Remote Warehouse"
                  />
                </div>

                <div>
                  <label className="text-[11px] font-bold uppercase text-text-muted mb-1 block">Street Address</label>
                  <input
                    type="text"
                    required
                    value={form.address}
                    onChange={(e) => setForm({ ...form, address: e.target.value })}
                    className="input-field"
                    placeholder="e.g. 100 Main St"
                  />
                </div>

                <div className="grid grid-cols-3 gap-3">
                  <div className="col-span-2">
                    <label className="text-[11px] font-bold uppercase text-text-muted mb-1 block">City</label>
                    <input
                      type="text"
                      value={form.city}
                      onChange={(e) => setForm({ ...form, city: e.target.value })}
                      className="input-field"
                      placeholder="San Jose"
                    />
                  </div>
                  <div>
                    <label className="text-[11px] font-bold uppercase text-text-muted mb-1 block">State</label>
                    <input
                      type="text"
                      value={form.state}
                      onChange={(e) => setForm({ ...form, state: e.target.value })}
                      className="input-field"
                      placeholder="CA"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-[11px] font-bold uppercase text-text-muted mb-1 block">ZIP Code</label>
                    <input
                      type="text"
                      value={form.zip}
                      onChange={(e) => setForm({ ...form, zip: e.target.value })}
                      className="input-field"
                      placeholder="95131"
                    />
                  </div>
                  <div>
                    <label className="text-[11px] font-bold uppercase text-text-muted mb-1 block">Type</label>
                    <select
                      value={form.type}
                      onChange={(e) => setForm({ ...form, type: e.target.value as LocationItem['type'] })}
                      className="input-field"
                    >
                      <option value="HQ">HQ</option>
                      <option value="Branch">Branch</option>
                      <option value="Data Center">Data Center</option>
                      <option value="Remote">Remote</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="text-[11px] font-bold uppercase text-text-muted mb-1 block">Status</label>
                  <select
                    value={form.status}
                    onChange={(e) => setForm({ ...form, status: e.target.value as LocationItem['status'] })}
                    className="input-field"
                  >
                    <option value="Active">Active</option>
                    <option value="Inactive">Inactive</option>
                  </select>
                </div>

                <div>
                  <label className="text-[11px] font-bold uppercase text-text-muted mb-1 block">Access Notes / Keyboxes</label>
                  <textarea
                    value={form.notes}
                    onChange={(e) => setForm({ ...form, notes: e.target.value })}
                    className="input-field h-20 resize-none"
                    placeholder="E.g. biometric access protocols, door lock codes..."
                  />
                </div>

                <div className="flex gap-3 justify-end pt-3 border-t border-border-subtle">
                  <button type="button" onClick={() => setIsOpen(false)} className="btn-secondary py-2 text-xs">
                    Cancel
                  </button>
                  <button type="submit" className="btn-primary py-2 text-xs">
                    Save Location
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
