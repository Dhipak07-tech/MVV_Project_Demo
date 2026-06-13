import { useState } from 'react';
import { useParams } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Plus, Search, Key, Eye, EyeOff, Copy, Check, Trash2, Edit2,
  X, Lock, Loader2
} from 'lucide-react';
import { usePasswords, useCreatePassword, useUpdatePassword, useDeletePassword } from '../../../hooks/useDocs';
import { type Credential } from '../../../api/docsApi';

export default function PasswordsPage() {
  const { orgId } = useParams<{ orgId: string }>();
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

  // React Query Hooks
  const { data: pageData, isLoading } = usePasswords(orgId || '', search);
  const createMutation = useCreatePassword();
  const updateMutation = useUpdatePassword();
  const deleteMutation = useDeletePassword();

  const passwords = pageData?.content || [];

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

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name || !form.username || !form.password || !orgId) return;

    const strength = checkStrength(form.password);

    try {
      if (editingCred) {
        await updateMutation.mutateAsync({
          orgId,
          id: editingCred.id,
          cred: { ...form, strength }
        });
      } else {
        await createMutation.mutateAsync({
          orgId,
          cred: { ...form, strength }
        });
      }
      setIsOpen(false);
    } catch (err) {
      console.error('Failed to save password', err);
    }
  };

  const handleDelete = async (id: string) => {
    if (!orgId) return;
    if (confirm('Are you sure you want to delete this credential?')) {
      try {
        await deleteMutation.mutateAsync({ orgId, id });
      } catch (err) {
        console.error('Failed to delete password', err);
      }
    }
  };

  return (
    <div className="p-6 space-y-6 bg-vault-base text-text-primary transition-colors duration-200">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-border-subtle pb-5">
        <div>
          <span className="text-metadata font-semibold text-brand-primary tracking-wider uppercase">
            Core Documentation
          </span>
          <h1 className="text-page-title text-text-primary mt-1">
            Passwords Vault
          </h1>
          <p className="text-sm text-text-secondary mt-0.5">
            AES-256 zero-knowledge encryption credentials storage container.
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
        {isLoading ? (
          <div className="col-span-2 flex justify-center items-center py-12">
            <Loader2 className="w-8 h-8 animate-spin text-brand-primary" />
          </div>
        ) : passwords.length > 0 ? (
          passwords.map((cred) => (
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
                      <h3 className="text-card-title text-text-primary">{cred.name}</h3>
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
                      disabled={deleteMutation.isPending}
                      className="p-1.5 rounded hover:bg-status-danger/10 text-text-secondary hover:text-status-danger transition-colors"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                <div className="mt-4 space-y-2 text-xs">
                  <div className="flex justify-between items-center bg-vault-base/30 px-3 py-2 rounded border border-border-subtle/50">
                    <span className="text-text-secondary">Username:</span>
                    <div className="flex items-center gap-1.5">
                      <span className="font-semibold text-text-primary font-mono">{cred.username}</span>
                      <button
                        onClick={() => handleCopy(`u-${cred.id}`, cred.username)}
                        className="text-text-muted hover:text-brand-primary transition-colors"
                      >
                        {copiedId === `u-${cred.id}` ? <Check className="w-3.5 h-3.5 text-status-success" /> : <Copy className="w-3.5 h-3.5" />}
                      </button>
                    </div>
                  </div>

                  <div className="flex justify-between items-center bg-vault-base/30 px-3 py-2 rounded border border-border-subtle/50">
                    <span className="text-text-secondary">Password:</span>
                    <div className="flex items-center gap-2">
                      <span className="font-semibold font-mono tracking-wider">
                        {revealedIds[cred.id] ? cred.password || '••••••••' : '••••••••••••'}
                      </span>
                      <div className="flex items-center gap-1">
                        <button
                          onClick={() => toggleReveal(cred.id)}
                          className="text-text-muted hover:text-brand-primary transition-colors"
                        >
                          {revealedIds[cred.id] ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                        </button>
                        <button
                          onClick={() => handleCopy(`p-${cred.id}`, cred.password || '')}
                          className="text-text-muted hover:text-brand-primary transition-colors"
                        >
                          {copiedId === `p-${cred.id}` ? <Check className="w-3.5 h-3.5 text-status-success" /> : <Copy className="w-3.5 h-3.5" />}
                        </button>
                      </div>
                    </div>
                  </div>

                  {cred.otpSecret && (
                    <div className="flex justify-between items-center bg-vault-base/30 px-3 py-2 rounded border border-border-subtle/50">
                      <span className="text-text-secondary">OTP Secret (MFA):</span>
                      <div className="flex items-center gap-1.5">
                        <span className="font-semibold text-text-primary font-mono">{cred.otpSecret}</span>
                        <button
                          onClick={() => handleCopy(`otp-${cred.id}`, cred.otpSecret)}
                          className="text-text-muted hover:text-brand-primary transition-colors"
                        >
                          {copiedId === `otp-${cred.id}` ? <Check className="w-3.5 h-3.5 text-status-success" /> : <Copy className="w-3.5 h-3.5" />}
                        </button>
                      </div>
                    </div>
                  )}

                  {cred.notes && (
                    <div className="p-3 bg-vault-base/20 rounded border border-border-subtle/30 text-text-secondary text-[11px] leading-relaxed">
                      {cred.notes}
                    </div>
                  )}
                </div>
              </div>

              <div className="mt-4 border-t border-border-subtle/50 pt-3 flex justify-between items-center text-[10px]">
                <span className="text-text-muted">Strength Profile</span>
                <span className={`px-2 py-0.5 rounded-full border font-bold uppercase ${
                  cred.strength === 'strong' ? 'bg-status-success/10 border-status-success/20 text-status-success' :
                  cred.strength === 'medium' ? 'bg-status-warning/10 border-status-warning/20 text-status-warning' :
                  'bg-status-danger/10 border-status-danger/20 text-status-danger'
                }`}>
                  {cred.strength}
                </span>
              </div>
            </motion.div>
          ))
        ) : (
          <div className="col-span-2 glass-panel p-12 text-center flex flex-col items-center justify-center">
            <Lock className="w-12 h-12 text-text-muted mb-4" />
            <h3 className="text-sm font-bold text-text-primary mb-1">No Passwords Saved</h3>
            <p className="text-xs text-text-muted max-w-xs">
              Securely store credentials, accounts, and application keys with zero-knowledge.
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
                  <h2 className="text-base font-bold text-text-primary">
                    {editingCred ? 'Edit Secure Password' : 'Add Secure Password'}
                  </h2>
                  <p className="text-xs text-text-muted mt-0.5">Encrypts data in client memory before storage.</p>
                </div>
                <button onClick={() => setIsOpen(false)} className="p-1 text-text-muted hover:text-text-primary">
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleSave} className="space-y-4">
                <div className="space-y-1">
                  <label className="text-form-label text-text-secondary">Password Alias / Name</label>
                  <input
                    type="text"
                    required
                    value={form.name}
                    onChange={(e) => setForm({ ...form, name: e.target.value })}
                    className="input-field text-xs"
                    placeholder="e.g. Active Directory Main Domain Admin"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-form-label text-text-secondary">Username / Identity</label>
                    <input
                      type="text"
                      required
                      value={form.username}
                      onChange={(e) => setForm({ ...form, username: e.target.value })}
                      className="input-field text-xs"
                      placeholder="e.g. administrator"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-form-label text-text-secondary">Target Domain / IP URL</label>
                    <input
                      type="text"
                      value={form.url}
                      onChange={(e) => setForm({ ...form, url: e.target.value })}
                      className="input-field text-xs"
                      placeholder="e.g. https://10.0.1.5"
                    />
                  </div>
                </div>

                <div className="space-y-1">
                  <div className="flex justify-between items-center mb-1">
                    <label className="text-form-label text-text-secondary">Secure Password</label>
                    <button
                      type="button"
                      onClick={handleGenerateInForm}
                      className="text-[10px] font-bold text-brand-primary hover:underline"
                    >
                      Regenerate
                    </button>
                  </div>
                  <input
                    type="text"
                    required
                    value={form.password}
                    onChange={(e) => setForm({ ...form, password: e.target.value })}
                    className="input-field text-xs font-mono"
                  />
                </div>

                {/* Generator Options */}
                <div className="p-3 bg-vault-elevated/20 rounded-lg border border-border-subtle space-y-3">
                  <div className="flex justify-between items-center text-[10px] text-text-secondary font-bold uppercase">
                    <span>Quick Generator Settings</span>
                    <span>Length: {genLen}</span>
                  </div>
                  <input
                    type="range"
                    min={8}
                    max={32}
                    value={genLen}
                    onChange={(e) => setGenLen(Number(e.target.value))}
                    className="w-full h-1 bg-vault-elevated rounded-lg appearance-none cursor-pointer accent-brand-primary"
                  />
                  <div className="flex gap-4 text-[10px] text-text-secondary font-semibold">
                    <label className="flex items-center gap-1.5 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={includeSymbols}
                        onChange={(e) => setIncludeSymbols(e.target.checked)}
                        className="rounded border-border-subtle text-brand-primary focus:ring-brand-primary bg-vault-base"
                      />
                      Symbols (!@#)
                    </label>
                    <label className="flex items-center gap-1.5 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={includeNumbers}
                        onChange={(e) => setIncludeNumbers(e.target.checked)}
                        className="rounded border-border-subtle text-brand-primary focus:ring-brand-primary bg-vault-base"
                      />
                      Numbers (0-9)
                    </label>
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-form-label text-text-secondary">OTP Secret Seed (Optional)</label>
                  <input
                    type="text"
                    value={form.otpSecret}
                    onChange={(e) => setForm({ ...form, otpSecret: e.target.value })}
                    className="input-field text-xs font-mono"
                    placeholder="Base32 Key e.g. JBSWY3DPEHPK3PXP"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-form-label text-text-secondary">Audit Logs & Notes</label>
                  <textarea
                    rows={4}
                    value={form.notes}
                    onChange={(e) => setForm({ ...form, notes: e.target.value })}
                    className="input-field text-xs leading-relaxed"
                    placeholder="Enter details about this credential..."
                  />
                </div>

                <div className="pt-4 flex gap-3">
                  <button type="submit" disabled={createMutation.isPending || updateMutation.isPending} className="flex-1 btn-primary py-2 flex items-center justify-center gap-1.5">
                    {(createMutation.isPending || updateMutation.isPending) && <Loader2 className="w-4 h-4 animate-spin" />}
                    Save Credential
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
