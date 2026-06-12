import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Search, User, Edit2, Trash2, Mail, Phone, X, UserCheck } from 'lucide-react';

interface Contact {
  id: string;
  name: string;
  title: string;
  email: string;
  phone: string;
  type: 'Primary' | 'Billing' | 'Technical' | 'General';
  status: 'Active' | 'Inactive';
  notes: string;
}

const DEFAULT_CONTACTS: Contact[] = [
  { id: '1', name: 'John Connor', title: 'IT Director', email: 'john.connor@cyberdyne.com', phone: '+1 (555) 0199', type: 'Primary', status: 'Active', notes: 'Key contact for Skynet firewall authorization.' },
  { id: '2', name: 'Sarah Connor', title: 'Security Architect', email: 'sarah.connor@cyberdyne.com', phone: '+1 (555) 0180', type: 'Technical', status: 'Active', notes: 'Handles local office security fobs.' },
  { id: '3', name: 'Miles Dyson', title: 'Lead Developer', email: 'miles.dyson@cyberdyne.com', phone: '+1 (555) 0150', type: 'Technical', status: 'Active', notes: 'Server room physical key holder.' },
];

export default function ContactsPage() {
  const { orgId } = useParams<{ orgId: string }>();
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [search, setSearch] = useState('');
  const [filterType, setFilterType] = useState('All');
  
  // Modal State
  const [isOpen, setIsOpen] = useState(false);
  const [editingContact, setEditingContact] = useState<Contact | null>(null);

  // Form State
  const [form, setForm] = useState({
    name: '',
    title: '',
    email: '',
    phone: '',
    type: 'General' as Contact['type'],
    status: 'Active' as Contact['status'],
    notes: '',
  });

  // Load from local storage
  useEffect(() => {
    const stored = localStorage.getItem(`mmv_contacts_${orgId}`);
    if (stored) {
      setContacts(JSON.parse(stored));
    } else {
      setContacts(DEFAULT_CONTACTS);
      localStorage.setItem(`mmv_contacts_${orgId}`, JSON.stringify(DEFAULT_CONTACTS));
    }
  }, [orgId]);

  // Save to local storage helper
  const saveContacts = (updated: Contact[]) => {
    setContacts(updated);
    localStorage.setItem(`mmv_contacts_${orgId}`, JSON.stringify(updated));
  };

  const handleOpenAdd = () => {
    setEditingContact(null);
    setForm({
      name: '',
      title: '',
      email: '',
      phone: '',
      type: 'General',
      status: 'Active',
      notes: '',
    });
    setIsOpen(true);
  };

  const handleOpenEdit = (contact: Contact) => {
    setEditingContact(contact);
    setForm({
      name: contact.name,
      title: contact.title,
      email: contact.email,
      phone: contact.phone,
      type: contact.type,
      status: contact.status,
      notes: contact.notes,
    });
    setIsOpen(true);
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name || !form.email) return;

    if (editingContact) {
      // Edit mode
      const updated = contacts.map((c) =>
        c.id === editingContact.id ? { ...c, ...form } : c
      );
      saveContacts(updated);
    } else {
      // Add mode
      const newContact: Contact = {
        id: crypto.randomUUID(),
        ...form,
      };
      saveContacts([...contacts, newContact]);
    }
    setIsOpen(false);
  };

  const handleDelete = (id: string) => {
    if (confirm('Are you sure you want to delete this contact?')) {
      const updated = contacts.filter((c) => c.id !== id);
      saveContacts(updated);
    }
  };

  // Filters
  const filteredContacts = contacts.filter((c) => {
    const matchesSearch =
      c.name.toLowerCase().includes(search.toLowerCase()) ||
      c.title.toLowerCase().includes(search.toLowerCase()) ||
      c.email.toLowerCase().includes(search.toLowerCase());
    const matchesType = filterType === 'All' || c.type === filterType;
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
            Contacts Directory
          </h1>
          <p className="text-sm text-text-secondary mt-0.5">
            Manage organization-scoped personnel, titles, and emergency roles.
          </p>
        </div>

        <button onClick={handleOpenAdd} className="btn-primary">
          <Plus className="w-4 h-4 mr-1.5" />
          Add Contact
        </button>
      </div>

      {/* Search and Filters */}
      <div className="flex flex-col sm:flex-row items-center gap-4">
        <div className="relative flex-1 w-full">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted" />
          <input
            type="text"
            placeholder="Search contacts by name, email, or role..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="input-field pl-10"
          />
        </div>
        <div className="flex gap-2 w-full sm:w-auto">
          {['All', 'Primary', 'Billing', 'Technical', 'General'].map((type) => (
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

      {/* Grid of Contact Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {filteredContacts.map((contact) => (
          <motion.div
            layout
            key={contact.id}
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="card-elevated p-5 flex flex-col justify-between"
          >
            <div>
              {/* Header */}
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-brand-primary/10 flex items-center justify-center text-brand-primary">
                    <User className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-text-primary flex items-center gap-1.5">
                      {contact.name}
                      {contact.type === 'Primary' && (
                        <span title="Primary Contact">
                          <UserCheck className="w-4 h-4 text-amber-500" />
                        </span>
                      )}
                    </h3>
                    <p className="text-xs text-text-muted">{contact.title}</p>
                  </div>
                </div>

                <div className="flex items-center gap-1">
                  <button
                    onClick={() => handleOpenEdit(contact)}
                    className="p-1.5 rounded hover:bg-vault-elevated text-text-secondary hover:text-text-primary transition-colors"
                  >
                    <Edit2 className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() => handleDelete(contact.id)}
                    className="p-1.5 rounded hover:bg-status-danger/10 text-text-secondary hover:text-status-danger transition-colors"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              {/* Badges */}
              <div className="flex gap-2 mt-4">
                <span className={`badge text-[10px] font-semibold uppercase ${
                  contact.type === 'Primary' ? 'badge-success' : contact.type === 'Billing' ? 'badge-warning' : 'badge-info'
                }`}>
                  {contact.type}
                </span>
                <span className={`badge text-[10px] font-semibold uppercase ${
                  contact.status === 'Active' ? 'badge-success' : 'badge-danger'
                }`}>
                  {contact.status}
                </span>
              </div>

              {/* Details */}
              <div className="mt-4 space-y-2.5 text-xs text-text-secondary">
                <div className="flex items-center gap-2">
                  <Mail className="w-4 h-4 text-text-muted" />
                  <a href={`mailto:${contact.email}`} className="hover:underline">{contact.email}</a>
                </div>
                <div className="flex items-center gap-2">
                  <Phone className="w-4 h-4 text-text-muted" />
                  <a href={`tel:${contact.phone}`} className="hover:underline">{contact.phone}</a>
                </div>
              </div>
            </div>

            {contact.notes && (
              <div className="mt-4 pt-3 border-t border-border-subtle bg-vault-elevated/20 p-2 rounded text-[11px] text-text-muted leading-relaxed">
                {contact.notes}
              </div>
            )}
          </motion.div>
        ))}

        {filteredContacts.length === 0 && (
          <div className="col-span-full text-center py-12 text-text-muted">
            No contacts found matching search filters.
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
                {editingContact ? 'Edit Contact' : 'Add New Contact'}
              </h2>

              <form onSubmit={handleSave} className="space-y-4">
                <div>
                  <label className="text-[11px] font-bold uppercase text-text-muted mb-1 block">Full Name</label>
                  <input
                    type="text"
                    required
                    value={form.name}
                    onChange={(e) => setForm({ ...form, name: e.target.value })}
                    className="input-field"
                    placeholder="e.g. John Connor"
                  />
                </div>

                <div>
                  <label className="text-[11px] font-bold uppercase text-text-muted mb-1 block">Job Title</label>
                  <input
                    type="text"
                    value={form.title}
                    onChange={(e) => setForm({ ...form, title: e.target.value })}
                    className="input-field"
                    placeholder="e.g. System Administrator"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-[11px] font-bold uppercase text-text-muted mb-1 block">Email</label>
                    <input
                      type="email"
                      required
                      value={form.email}
                      onChange={(e) => setForm({ ...form, email: e.target.value })}
                      className="input-field"
                      placeholder="john@domain.com"
                    />
                  </div>
                  <div>
                    <label className="text-[11px] font-bold uppercase text-text-muted mb-1 block">Phone</label>
                    <input
                      type="text"
                      value={form.phone}
                      onChange={(e) => setForm({ ...form, phone: e.target.value })}
                      className="input-field"
                      placeholder="+1 (555) 0000"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-[11px] font-bold uppercase text-text-muted mb-1 block">Type</label>
                    <select
                      value={form.type}
                      onChange={(e) => setForm({ ...form, type: e.target.value as Contact['type'] })}
                      className="input-field"
                    >
                      <option value="Primary">Primary</option>
                      <option value="Billing">Billing</option>
                      <option value="Technical">Technical</option>
                      <option value="General">General</option>
                    </select>
                  </div>
                  <div>
                    <label className="text-[11px] font-bold uppercase text-text-muted mb-1 block">Status</label>
                    <select
                      value={form.status}
                      onChange={(e) => setForm({ ...form, status: e.target.value as Contact['status'] })}
                      className="input-field"
                    >
                      <option value="Active">Active</option>
                      <option value="Inactive">Inactive</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="text-[11px] font-bold uppercase text-text-muted mb-1 block">Notes / Permissions</label>
                  <textarea
                    value={form.notes}
                    onChange={(e) => setForm({ ...form, notes: e.target.value })}
                    className="input-field h-20 resize-none"
                    placeholder="Provide escalation context, site approvals..."
                  />
                </div>

                <div className="flex gap-3 justify-end pt-3 border-t border-border-subtle">
                  <button type="button" onClick={() => setIsOpen(false)} className="btn-secondary py-2 text-xs">
                    Cancel
                  </button>
                  <button type="submit" className="btn-primary py-2 text-xs">
                    Save Contact
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
