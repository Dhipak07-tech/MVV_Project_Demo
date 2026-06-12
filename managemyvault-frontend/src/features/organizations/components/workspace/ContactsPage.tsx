import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { clientContactApi } from '../../api/clientContactApi';
import { Plus, Search, User, Edit2, Trash2, Mail, Phone, X, UserCheck, Shield } from 'lucide-react';

interface Contact {
  id: string;
  firstName: string;
  lastName: string;
  name: string;
  role: string;
  email: string;
  phone: string;
  mobile: string;
  department: string;
  primaryContact: boolean;
  emergencyContact: boolean;
  authorizationContact: boolean;
  notes: string;
  isActive: boolean;
}

export default function ContactsPage() {
  const { orgId } = useParams<{ orgId: string }>();
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [search, setSearch] = useState('');
  const [filterType, setFilterType] = useState('All');
  const [isLoading, setIsLoading] = useState(true);

  // Modal State
  const [isOpen, setIsOpen] = useState(false);
  const [editingContact, setEditingContact] = useState<Contact | null>(null);

  // Form State
  const [form, setForm] = useState({
    firstName: '',
    lastName: '',
    role: '',
    email: '',
    phone: '',
    mobile: '',
    department: '',
    primaryContact: false,
    emergencyContact: false,
    authorizationContact: false,
    notes: '',
    isActive: true,
  });

  const fetchContacts = async () => {
    if (!orgId) return;
    setIsLoading(true);
    try {
      const data = await clientContactApi.contacts.list(orgId);
      setContacts(data);
    } catch (e) {
      console.error('Failed to load contacts:', e);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchContacts();
  }, [orgId]);

  const handleOpenAdd = () => {
    setEditingContact(null);
    setForm({
      firstName: '',
      lastName: '',
      role: '',
      email: '',
      phone: '',
      mobile: '',
      department: '',
      primaryContact: false,
      emergencyContact: false,
      authorizationContact: false,
      notes: '',
      isActive: true,
    });
    setIsOpen(true);
  };

  const handleOpenEdit = (contact: Contact) => {
    setEditingContact(contact);
    setForm({
      firstName: contact.firstName || '',
      lastName: contact.lastName || '',
      role: contact.role || '',
      email: contact.email || '',
      phone: contact.phone || '',
      mobile: contact.mobile || '',
      department: contact.department || '',
      primaryContact: !!contact.primaryContact,
      emergencyContact: !!contact.emergencyContact,
      authorizationContact: !!contact.authorizationContact,
      notes: contact.notes || '',
      isActive: contact.isActive !== false,
    });
    setIsOpen(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.firstName || !form.lastName || !form.email) return;

    try {
      if (editingContact) {
        // Edit mode
        const data = await clientContactApi.contacts.update(editingContact.id, form);
        setContacts(contacts.map(c => c.id === editingContact.id ? data : c));
      } else {
        // Add mode
        if (!orgId) return;
        const data = await clientContactApi.contacts.create(orgId, form);
        setContacts([...contacts, data]);
      }
      setIsOpen(false);
    } catch (e) {
      console.error('Failed to save contact:', e);
      alert('Failed to save contact.');
    }
  };

  const handleDelete = async (id: string) => {
    if (confirm('Are you sure you want to delete this contact?')) {
      try {
        await clientContactApi.contacts.delete(id);
        setContacts(contacts.filter((c) => c.id !== id));
      } catch (e) {
        console.error('Failed to delete contact:', e);
        alert('Failed to delete contact.');
      }
    }
  };

  // Filters
  const filteredContacts = contacts.filter((c) => {
    const fullName = `${c.firstName || ''} ${c.lastName || ''}`.toLowerCase();
    const matchesSearch =
      fullName.includes(search.toLowerCase()) ||
      (c.role || '').toLowerCase().includes(search.toLowerCase()) ||
      (c.email || '').toLowerCase().includes(search.toLowerCase()) ||
      (c.department || '').toLowerCase().includes(search.toLowerCase());

    if (filterType === 'All') return matchesSearch;
    if (filterType === 'Primary') return matchesSearch && c.primaryContact;
    if (filterType === 'Emergency') return matchesSearch && c.emergencyContact;
    if (filterType === 'Authorization') return matchesSearch && c.authorizationContact;
    return matchesSearch;
  });

  if (isLoading) {
    return (
      <div className="p-8 space-y-6">
        <div className="h-8 w-64 bg-vault-elevated animate-pulse rounded-lg" />
        <div className="h-60 bg-vault-elevated animate-pulse rounded-xl" />
      </div>
    );
  }

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
            Manage organization-scoped personnel, roles, and authorization levels.
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
            placeholder="Search contacts by name, email, or department..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="input-field pl-10"
          />
        </div>
        <div className="flex gap-2 w-full sm:w-auto">
          {['All', 'Primary', 'Emergency', 'Authorization'].map((type) => (
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
                      {contact.firstName} {contact.lastName}
                      {contact.primaryContact && (
                        <span title="Primary Contact">
                          <UserCheck className="w-4 h-4 text-amber-500" />
                        </span>
                      )}
                    </h3>
                    <p className="text-xs text-text-muted">{contact.role || 'No RoleSpecified'}</p>
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
              <div className="flex flex-wrap gap-2 mt-4">
                {contact.department && (
                  <span className="badge text-[10px] font-semibold uppercase badge-info">
                    {contact.department}
                  </span>
                )}
                {contact.primaryContact && (
                  <span className="badge text-[10px] font-semibold uppercase badge-success">
                    Primary
                  </span>
                )}
                {contact.emergencyContact && (
                  <span className="badge text-[10px] font-semibold uppercase badge-warning">
                    Emergency
                  </span>
                )}
                {contact.authorizationContact && (
                  <span className="badge text-[10px] font-semibold uppercase badge-danger">
                    Auth
                  </span>
                )}
                <span className={`badge text-[10px] font-semibold uppercase ${
                  contact.isActive ? 'badge-success' : 'badge-danger'
                }`}>
                  {contact.isActive ? 'Active' : 'Inactive'}
                </span>
              </div>

              {/* Details */}
              <div className="mt-4 space-y-2.5 text-xs text-text-secondary">
                <div className="flex items-center gap-2">
                  <Mail className="w-4 h-4 text-text-muted" />
                  <a href={`mailto:${contact.email}`} className="hover:underline">{contact.email}</a>
                </div>
                {contact.phone && (
                  <div className="flex items-center gap-2">
                    <Phone className="w-4 h-4 text-text-muted" />
                    <a href={`tel:${contact.phone}`} className="hover:underline">{contact.phone}</a>
                  </div>
                )}
                {contact.mobile && (
                  <div className="flex items-center gap-2">
                    <Shield className="w-4 h-4 text-text-muted" />
                    <span>Mobile: {contact.mobile}</span>
                  </div>
                )}
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
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-[11px] font-bold uppercase text-text-muted mb-1 block">First Name</label>
                    <input
                      type="text"
                      required
                      value={form.firstName}
                      onChange={(e) => setForm({ ...form, firstName: e.target.value })}
                      className="input-field"
                      placeholder="e.g. John"
                    />
                  </div>
                  <div>
                    <label className="text-[11px] font-bold uppercase text-text-muted mb-1 block">Last Name</label>
                    <input
                      type="text"
                      required
                      value={form.lastName}
                      onChange={(e) => setForm({ ...form, lastName: e.target.value })}
                      className="input-field"
                      placeholder="e.g. Connor"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-[11px] font-bold uppercase text-text-muted mb-1 block">Job Title / Role</label>
                    <input
                      type="text"
                      required
                      value={form.role}
                      onChange={(e) => setForm({ ...form, role: e.target.value })}
                      className="input-field"
                      placeholder="e.g. IT Director"
                    />
                  </div>
                  <div>
                    <label className="text-[11px] font-bold uppercase text-text-muted mb-1 block">Department</label>
                    <input
                      type="text"
                      value={form.department}
                      onChange={(e) => setForm({ ...form, department: e.target.value })}
                      className="input-field"
                      placeholder="e.g. Operations"
                    />
                  </div>
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
                    <label className="text-[11px] font-bold uppercase text-text-muted mb-1 block">Mobile</label>
                    <input
                      type="text"
                      value={form.mobile}
                      onChange={(e) => setForm({ ...form, mobile: e.target.value })}
                      className="input-field"
                      placeholder="+1 (555) 0123"
                    />
                  </div>
                  <div>
                    <label className="text-[11px] font-bold uppercase text-text-muted mb-1 block">Status</label>
                    <select
                      value={form.isActive ? 'Active' : 'Inactive'}
                      onChange={(e) => setForm({ ...form, isActive: e.target.value === 'Active' })}
                      className="input-field"
                    >
                      <option value="Active">Active</option>
                      <option value="Inactive">Inactive</option>
                    </select>
                  </div>
                </div>

                {/* Verification/Auth Flags */}
                <div className="space-y-2 pt-2 border-t border-border-subtle">
                  <label className="text-[11px] font-bold uppercase text-text-muted mb-1 block">Access & Roles</label>
                  <div className="grid grid-cols-3 gap-2">
                    <label className="flex items-center gap-2 cursor-pointer p-2 rounded bg-vault-elevated/40 hover:bg-vault-elevated transition-colors">
                      <input
                        type="checkbox"
                        checked={form.primaryContact}
                        onChange={(e) => setForm({ ...form, primaryContact: e.target.checked })}
                        className="rounded border-border-default bg-vault-base text-brand-primary focus:ring-brand-primary"
                      />
                      <span className="text-[10px] font-semibold text-text-secondary">Primary</span>
                    </label>
                    <label className="flex items-center gap-2 cursor-pointer p-2 rounded bg-vault-elevated/40 hover:bg-vault-elevated transition-colors">
                      <input
                        type="checkbox"
                        checked={form.emergencyContact}
                        onChange={(e) => setForm({ ...form, emergencyContact: e.target.checked })}
                        className="rounded border-border-default bg-vault-base text-brand-primary focus:ring-brand-primary"
                      />
                      <span className="text-[10px] font-semibold text-text-secondary">Emergency</span>
                    </label>
                    <label className="flex items-center gap-2 cursor-pointer p-2 rounded bg-vault-elevated/40 hover:bg-vault-elevated transition-colors">
                      <input
                        type="checkbox"
                        checked={form.authorizationContact}
                        onChange={(e) => setForm({ ...form, authorizationContact: e.target.checked })}
                        className="rounded border-border-default bg-vault-base text-brand-primary focus:ring-brand-primary"
                      />
                      <span className="text-[10px] font-semibold text-text-secondary">Authorized</span>
                    </label>
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
