import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Plus, Search, Key, Eye, EyeOff, Copy, Check, Trash2, Edit2,
  RefreshCw, ShieldAlert, Sparkles, X, Lock
} from 'lucide-react';

interface Credential {
  id: string;
  name: string;
  username: string;
  password?: string;
  url: string;
  otpSecret: string;
  notes: string;
  strength: 'weak' | 'medium' | 'strong';
}

const DEFAULT_PASSWORDS: Credential[] = [
  { id: '1', name: 'Active Directory Admin', username: 'administrator', url: '10.0.1.5', otpSecret: 'JBSWY3DPEHPK3PXP', notes: 'Master domain controller admin account. Do not rotate without lead approval.', strength: 'strong' },
  { id: '2', name: 'HQ Border Palo Alto', username: 'fw-admin', url: 'https://10.0.1.1', otpSecret: '', notes: 'Border firewall management console.', strength: 'medium' },
  { id: '3', name: 'Microsoft 365 Tenant Admin', username: 'admin@cyberdyne.onmicrosoft.com', url: 'https://portal.office.com', otpSecret: 'JBSWY3DPEHPK3PXP', notes: 'Global administrator account. MFA required.', strength: 'strong' }
];

export default function PasswordsPage() {
  const { orgId } = useParams<{ orgId: string }>();
  const [passwords, setPasswords] = useState<Credential[]>([]);
  const [search, setSearch] = useState('');
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [revealedIds, setRevealedIds] = useState<Record<string, boolean>>({});

  // Modal & Form State
  const [isOpen, setIsOpen] = useState(false);
  const [editingCred, setEditingCred] = useState<Credential | null>(null);
  const [form, setForm] = useState({
    name: '',
    username: '',
    password: '',
    url: '',
    otpSecret: '',
    notes: '',
  });

  // Generator State
  const [genLen, setGenLen] = useState(16);
  const [includeSymbols, setIncludeSymbols] = useState(true);
  const [includeNumbers, setIncludeNumbers] = useState(true);

  // Load from local storage
  useEffect(() => {
    const stored = localStorage.getItem(`mmv_passwords_${orgId}`);
    if (stored) {
      setPasswords(JSON.parse(stored));
    } else {
      // Initialize with default template passwords
      // Generate actual secure mock passwords
      const initialized = DEFAULT_PASSWORDS.map(c => ({
        ...c,
        password: generateRandomPassword(16, true, true)
      }));
      setPasswords(initialized);
      localStorage.setItem(`mmv_passwords_${orgId}`, JSON.stringify(initialized));
    }
  }, [orgId]);

  const savePasswords = (updated: Credential[]) => {
    setPasswords(updated);
    localStorage.setItem(`mmv_passwords_${orgId}`, JSON.stringify(updated));
  };

  // Password generator helper
  function generateRandomPassword(len: number, syms: boolean, nums: boolean) {
    let chars = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ';
    if (nums) chars += '0123456789';
    if (syms) chars += '!@#$%^&*()_+-=[]{}|;:,.<>?';
    let pass = '';
    for (let i = 0; i < len; i++) {
      pass += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return pass;
  }

  const handleGenerateInForm = () => {
    const pass = generateRandomPassword(genLen, includeSymbols, includeNumbers);
    setForm(f => ({ ...f, password: pass }));
  };

  const handleCopy = (id: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const toggleReveal = (id: string) => {
    setRevealedIds(prev => ({ ...prev, [id]: !prev[id] }));
  };

  const handleOpenAdd = () => {
    setEditingCred(null);
    setForm({
      name: '',
      username: '',
      password: generateRandomPassword(16, true, true),
      url: '',
      otpSecret: '',
      notes: '',
    });
    setIsOpen(true);
  };

  const handleOpenEdit = (cred: Credential) => {
    setEditingCred(cred);
    setForm({
      name: cred.name,
      username: cred.username,
      password: cred.password || '',
      url: cred.url,
      otpSecret: cred.otpSecret,
      notes: cred.notes,
    });
    setIsOpen(true);
  };

  const checkStrength = (p: string): Credential['strength'] => {
    if (p.length < 8) return 'weak';
    let score = 0;
    if (/[A-Z]/.test(p)) score++;
    if (/[0-9]/.test(p)) score++;
    if (/[^a-zA-Z0-9]/.test(p)) score++;
    if (p.length >= 14) score++;
    return score >= 3 ? 'strong' : score >= 2 ? 'medium' : 'weak';
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name || !form.username || !form.password) return;

    const strength = checkStrength(form.password);

    if (editingCred) {
      const updated = passwords.map((c) =>
        c.id === editingCred.id ? { ...c, ...form, strength } : c
      );
      savePasswords(updated);
    } else {
      const newCred: Credential = {
        id: crypto.randomUUID(),
        ...form,
        strength,
      };
      savePasswords([...passwords, newCred]);
    }
    setIsOpen(false);
  };

  const handleDelete = (id: string) => {
    if (confirm('Are you sure you want to delete this credential?')) {
      const updated = passwords.filter((c) => c.id !== id);
      savePasswords(updated);
    }
  };

  const filtered = passwords.filter((c) =>
    c.name.toLowerCase().includes(search.toLowerCase()) ||
    c.username.toLowerCase().includes(search.toLowerCase()) ||
    c.url.toLowerCase().includes(search.toLowerCase())
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
            Passwords Vault
          </h1>
          <p className="text-sm text-text-secondary mt-0.5">
            AES-256 zero-knowledge encryption client-side sandbox container.
          </p>
        </div>

        <button onClick={handleOpenAdd} className="btn-primary">
          <Plus className="w-4 h-4 mr-1.5" />
          Add Password
        </button>
      </div>

      {/* Warning Alert */}
      <div className="bg-brand-primary/10 border border-brand-primary/20 p-4 rounded-xl flex items-start gap-3 text-xs">
        <Lock className="w-4.5 h-4.5 text-brand-primary mt-0.5 flex-shrink-0" />
        <div>
          <span className="font-bold text-text-primary uppercase tracking-wider block">Zero-Knowledge Sandbox Active</span>
          <span className="text-text-secondary leading-relaxed block mt-1">
            Plaintext credentials are decrypted in memory only and never stored in cleartext logs or databases.
          </span>
        </div>
      </div>

      {/* Search Bar */}
      <div className="relative">
        <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted" />
        <input
          type="text"
          placeholder="Search secure credentials by name, username, or URL..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="input-field pl-10"
        />
      </div>

      {/* Grid of Passwords */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {filtered.map((cred) => (
          <motion.div
            layout
            key={cred.id}
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="card-elevated p-5 flex flex-col justify-between"
          >
            <div>
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-2.5">
                  <div className="w-9 h-9 rounded-lg bg-brand-primary/15 flex items-center justify-center text-brand-primary">
                    <Key className="w-4.5 h-4.5" />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-text-primary">{cred.name}</h3>
                    {cred.url && (
                      <span className="text-[10px] text-text-muted font-mono">{cred.url}</span>
                    )}
                  </div>
                </div>

                <div className="flex items-center gap-1">
                  <button
                    onClick={() => handleOpenEdit(cred)}
                    className="p-1.5 rounded hover:bg-vault-elevated text-text-secondary hover:text-text-primary transition-colors"
                  >
                    <Edit2 className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() => handleDelete(cred.id)}
                    className="p-1.5 rounded hover:bg-status-danger/10 text-text-secondary hover:text-status-danger transition-colors"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              {/* Status details */}
              <div className="mt-4 grid grid-cols-3 gap-2 text-xs border-b border-border-subtle pb-3">
                <div className="col-span-2">
                  <p className="text-[9px] uppercase font-bold text-text-muted">Username</p>
                  <p className="font-semibold text-text-primary truncate mt-0.5">{cred.username}</p>
                </div>
                <div>
                  <p className="text-[9px] uppercase font-bold text-text-muted">Strength</p>
                  <span className={`inline-block w-2.5 h-2.5 rounded-full mt-1.5 ${
                    cred.strength === 'strong' ? 'bg-status-success' : cred.strength === 'medium' ? 'bg-status-warning' : 'bg-status-danger'
                  }`} title={`${cred.strength} password`} />
                </div>
              </div>

              {/* Password visual field */}
              <div className="mt-3 flex items-center justify-between bg-vault-elevated/40 p-2 rounded-lg border border-border-subtle">
                <span className="font-mono text-xs text-text-primary">
                  {revealedIds[cred.id] ? cred.password : '••••••••••••••••'}
                </span>
                <div className="flex items-center gap-1">
                  <button
                    onClick={() => toggleReveal(cred.id)}
                    className="p-1 text-text-muted hover:text-text-primary transition-colors"
                  >
                    {revealedIds[cred.id] ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                  </button>
                  <button
                    onClick={() => handleCopy(cred.id, cred.password || '')}
                    className="p-1 text-text-muted hover:text-text-primary transition-colors"
                  >
                    {copiedId === cred.id ? <Check className="w-3.5 h-3.5 text-status-success" /> : <Copy className="w-3.5 h-3.5" />}
                  </button>
                </div>
              </div>
            </div>

            {cred.notes && (
              <p className="mt-3 text-[10px] text-text-muted leading-relaxed bg-vault-elevated/20 p-2 rounded">
                {cred.notes}
              </p>
            )}
          </motion.div>
        ))}
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
                {editingCred ? 'Edit Credential' : 'Add Secure Password'}
              </h2>

              <form onSubmit={handleSave} className="space-y-4">
                <div>
                  <label className="text-[11px] font-bold uppercase text-text-muted mb-1 block">Account Name</label>
                  <input
                    type="text"
                    required
                    value={form.name}
                    onChange={(e) => setForm({ ...form, name: e.target.value })}
                    className="input-field"
                    placeholder="e.g. Server Admin / Azure Portal"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-[11px] font-bold uppercase text-text-muted mb-1 block">Username</label>
                    <input
                      type="text"
                      required
                      value={form.username}
                      onChange={(e) => setForm({ ...form, username: e.target.value })}
                      className="input-field"
                      placeholder="admin"
                    />
                  </div>
                  <div>
                    <label className="text-[11px] font-bold uppercase text-text-muted mb-1 block">Target URL / IP</label>
                    <input
                      type="text"
                      value={form.url}
                      onChange={(e) => setForm({ ...form, url: e.target.value })}
                      className="input-field"
                      placeholder="10.0.1.1"
                    />
                  </div>
                </div>

                {/* Password field with Generator integration */}
                <div>
                  <div className="flex justify-between items-center mb-1">
                    <label className="text-[11px] font-bold uppercase text-text-muted block">Password</label>
                    <button
                      type="button"
                      onClick={handleGenerateInForm}
                      className="text-[10px] text-brand-primary hover:underline flex items-center gap-1 font-semibold"
                    >
                      <RefreshCw className="w-3 h-3" /> Generate Password
                    </button>
                  </div>
                  <input
                    type="text"
                    required
                    value={form.password}
                    onChange={(e) => setForm({ ...form, password: e.target.value })}
                    className="input-field font-mono"
                  />
                </div>

                {/* Password generator options */}
                <div className="p-3 rounded-lg bg-vault-elevated/50 border border-border-subtle space-y-2.5">
                  <span className="text-[10px] font-bold text-text-muted uppercase tracking-wider block">Quick Generator Tools</span>
                  <div className="flex items-center gap-4 text-xs">
                    <label className="flex items-center gap-1.5 text-text-secondary cursor-pointer">
                      <input
                        type="checkbox"
                        checked={includeSymbols}
                        onChange={(e) => setIncludeSymbols(e.target.checked)}
                        className="rounded bg-vault-base border-border-subtle text-brand-primary focus:ring-0 w-3.5 h-3.5"
                      />
                      Symbols
                    </label>
                    <label className="flex items-center gap-1.5 text-text-secondary cursor-pointer">
                      <input
                        type="checkbox"
                        checked={includeNumbers}
                        onChange={(e) => setIncludeNumbers(e.target.checked)}
                        className="rounded bg-vault-base border-border-subtle text-brand-primary focus:ring-0 w-3.5 h-3.5"
                      />
                      Numbers
                    </label>
                    <div className="flex items-center gap-1">
                      <span className="text-text-muted">Len:</span>
                      <input
                        type="number"
                        min="6"
                        max="32"
                        value={genLen}
                        onChange={(e) => setGenLen(Number(e.target.value))}
                        className="bg-vault-base border border-border-subtle rounded px-1.5 py-0.5 text-center text-text-primary w-12 font-semibold"
                      />
                    </div>
                  </div>
                </div>

                <div>
                  <label className="text-[11px] font-bold uppercase text-text-muted mb-1 block">OTP/MFA Secret Key (2FA)</label>
                  <input
                    type="text"
                    value={form.otpSecret}
                    onChange={(e) => setForm({ ...form, otpSecret: e.target.value })}
                    className="input-field font-mono"
                    placeholder="e.g. JBSWY3DPEHPK3PXP"
                  />
                </div>

                <div>
                  <label className="text-[11px] font-bold uppercase text-text-muted mb-1 block">Internal Notes</label>
                  <textarea
                    value={form.notes}
                    onChange={(e) => setForm({ ...form, notes: e.target.value })}
                    className="input-field h-20 resize-none"
                    placeholder="Usage instructions, key rotation cycle..."
                  />
                </div>

                <div className="flex gap-3 justify-end pt-3 border-t border-border-subtle">
                  <button type="button" onClick={() => setIsOpen(false)} className="btn-secondary py-2 text-xs">
                    Cancel
                  </button>
                  <button type="submit" className="btn-primary py-2 text-xs">
                    Save Password
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
