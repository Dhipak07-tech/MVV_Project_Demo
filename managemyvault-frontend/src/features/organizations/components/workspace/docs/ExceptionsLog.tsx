import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Search, FileText, CheckCircle, ShieldAlert, GitBranch, RefreshCw, Save, Trash2, X } from 'lucide-react';

interface ExceptionItem {
  id: string;
  title: string;
  type: 'Standards' | 'Contract' | 'RFC' | 'Change';
  status: 'Approved' | 'Pending' | 'Draft' | 'Expired';
  justification: string;
  reviewer: string;
  dueDate: string;
  priority?: 'Low' | 'Medium' | 'High' | 'Critical';
}

const DEFAULT_EXCEPTIONS: ExceptionItem[] = [
  { id: '1', title: 'TLS 1.1 Support for Legacy Scanner', type: 'Standards', status: 'Approved', justification: 'Required for warehouse scanner barcode integration. Hardware upgrade planned Q4.', reviewer: 'Security Board', dueDate: '2026-12-31' },
  { id: '2', title: '24/7 SLA Exemption for Branch Office', type: 'Contract', status: 'Approved', justification: 'Branch office hours are limited. Remote power management active.', reviewer: 'Operations Director', dueDate: '2027-06-30' },
  { id: '3', title: 'Upgrade Core Database Server to Postgres 15', type: 'RFC', status: 'Pending', justification: 'Performance optimization and compatibility patches.', reviewer: 'Database Lead', dueDate: '2026-07-15', priority: 'High' },
  { id: '4', title: 'Rotated AD Domain Controller Master Key', type: 'Change', status: 'Approved', justification: 'Compliance security rotation cycle.', reviewer: 'Domain Controller Admin', dueDate: '2026-06-12' }
];

interface ExceptionsLogProps {
  mode: 'standards' | 'contract' | 'rfc' | 'change';
}

export default function ExceptionsLog({ mode }: ExceptionsLogProps) {
  const { orgId } = useParams<{ orgId: string }>();
  const [items, setItems] = useState<ExceptionItem[]>([]);
  const [search, setSearch] = useState('');
  const [isOpen, setIsOpen] = useState(false);

  // Form State
  const [form, setForm] = useState({
    title: '',
    status: 'Pending' as ExceptionItem['status'],
    justification: '',
    reviewer: '',
    dueDate: '',
    priority: 'Medium' as 'Low' | 'Medium' | 'High' | 'Critical'
  });

  useEffect(() => {
    const stored = localStorage.getItem(`mmv_exceptions_${orgId}`);
    if (stored) {
      setItems(JSON.parse(stored));
    } else {
      setItems(DEFAULT_EXCEPTIONS);
      localStorage.setItem(`mmv_exceptions_${orgId}`, JSON.stringify(DEFAULT_EXCEPTIONS));
    }
  }, [orgId]);

  const saveItems = (updated: ExceptionItem[]) => {
    setItems(updated);
    localStorage.setItem(`mmv_exceptions_${orgId}`, JSON.stringify(updated));
  };

  const handleOpenAdd = () => {
    setForm({
      title: '',
      status: 'Pending',
      justification: '',
      reviewer: '',
      dueDate: new Date().toISOString().split('T')[0],
      priority: 'Medium'
    });
    setIsOpen(true);
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.title || !form.justification) return;

    const typeMap = {
      standards: 'Standards',
      contract: 'Contract',
      rfc: 'RFC',
      change: 'Change'
    } as const;

    const newItem: ExceptionItem = {
      id: crypto.randomUUID(),
      title: form.title,
      type: typeMap[mode],
      status: form.status,
      justification: form.justification,
      reviewer: form.reviewer || 'Self-Registered',
      dueDate: form.dueDate,
      priority: mode === 'rfc' ? form.priority : undefined
    };

    saveItems([...items, newItem]);
    setIsOpen(false);
  };

  const handleDelete = (id: string) => {
    if (confirm('Are you sure you want to remove this log entry?')) {
      const updated = items.filter(item => item.id !== id);
      saveItems(updated);
    }
  };

  // Map modes
  const modeTitle = {
    standards: 'Standards Exceptions',
    contract: 'Contract Exceptions',
    rfc: 'Requests for Change (RFC)',
    change: 'Change Logs'
  }[mode];

  const modeSubtitle = {
    standards: 'Document and track configurations deviating from organizational security baselines.',
    contract: 'Track variations in SLA rules or vendor contracts with authorized approvals.',
    rfc: 'Manage upcoming IT infrastructure changes, risks, and deployment windows.',
    change: 'Audit trail of recent configuration edits and server updates.'
  }[mode];

  const typeFilter = {
    standards: 'Standards',
    contract: 'Contract',
    rfc: 'RFC',
    change: 'Change'
  }[mode];

  const filtered = items
    .filter(item => item.type === typeFilter)
    .filter(item =>
      item.title.toLowerCase().includes(search.toLowerCase()) ||
      item.justification.toLowerCase().includes(search.toLowerCase()) ||
      item.reviewer.toLowerCase().includes(search.toLowerCase())
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
            {modeSubtitle}
          </p>
        </div>

        <button onClick={handleOpenAdd} className="btn-primary">
          <Plus className="w-4 h-4 mr-1.5" />
          Add Entry
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

      {/* Log Items List */}
      <div className="space-y-4">
        {filtered.length > 0 ? (
          filtered.map((item) => (
            <div key={item.id} className="glass-panel p-5 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
              <div className="space-y-2">
                <div className="flex items-center gap-2.5">
                  {mode === 'standards' && <ShieldAlert className="w-4.5 h-4.5 text-brand-primary" />}
                  {mode === 'contract' && <FileText className="w-4.5 h-4.5 text-brand-secondary" />}
                  {mode === 'rfc' && <RefreshCw className="w-4.5 h-4.5 text-status-warning" />}
                  {mode === 'change' && <GitBranch className="w-4.5 h-4.5 text-status-success" />}

                  <h3 className="text-sm font-bold text-text-primary">{item.title}</h3>
                  
                  {item.priority && (
                    <span className={`text-[9px] px-2 py-0.5 rounded-full border font-bold uppercase ${
                      item.priority === 'Critical' ? 'bg-status-danger/10 border-status-danger/30 text-status-danger' :
                      item.priority === 'High' ? 'bg-status-warning/10 border-status-warning/30 text-status-warning' :
                      'bg-brand-primary/10 border-brand-primary/30 text-brand-primary'
                    }`}>
                      {item.priority}
                    </span>
                  )}
                </div>

                <p className="text-xs text-text-secondary leading-relaxed max-w-2xl">
                  {item.justification}
                </p>

                <div className="flex flex-wrap items-center gap-4 text-[10px] text-text-muted">
                  <span>Authorizer/Reviewer: <strong className="text-text-secondary">{item.reviewer}</strong></span>
                  <span>Date/Due: <strong className="text-text-secondary">{item.dueDate}</strong></span>
                  <span>ID: <strong className="text-text-secondary font-mono">{item.id.slice(0, 8)}</strong></span>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <span className={`badge ${
                  item.status === 'Approved' ? 'badge-success' : item.status === 'Expired' ? 'badge-danger' : 'badge-warning'
                } text-[10px] uppercase font-bold`}>
                  {item.status}
                </span>

                <button
                  onClick={() => handleDelete(item.id)}
                  className="p-2 rounded bg-vault-elevated text-text-muted hover:text-status-danger transition-colors"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          ))
        ) : (
          <div className="glass-panel p-12 text-center text-text-muted">
            No entries found matching filters.
          </div>
        )}
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
                Add {modeTitle} Entry
              </h2>

              <form onSubmit={handleSave} className="space-y-4">
                <div>
                  <label className="text-[11px] font-bold uppercase text-text-muted mb-1 block">Title</label>
                  <input
                    type="text"
                    required
                    value={form.title}
                    onChange={(e) => setForm({ ...form, title: e.target.value })}
                    className="input-field text-xs"
                    placeholder="e.g. TLS 1.0 support bypass"
                  />
                </div>

                {mode === 'rfc' && (
                  <div>
                    <label className="text-[11px] font-bold uppercase text-text-muted mb-1 block">Priority Level</label>
                    <select
                      value={form.priority}
                      onChange={(e) => setForm({ ...form, priority: e.target.value as any })}
                      className="input-field text-xs"
                    >
                      <option value="Low">Low</option>
                      <option value="Medium">Medium</option>
                      <option value="High">High</option>
                      <option value="Critical">Critical</option>
                    </select>
                  </div>
                )}

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-[11px] font-bold uppercase text-text-muted mb-1 block">Reviewer / Admin</label>
                    <input
                      type="text"
                      required
                      value={form.reviewer}
                      onChange={(e) => setForm({ ...form, reviewer: e.target.value })}
                      className="input-field text-xs"
                      placeholder="Security Team"
                    />
                  </div>
                  <div>
                    <label className="text-[11px] font-bold uppercase text-text-muted mb-1 block">Target Date</label>
                    <input
                      type="date"
                      required
                      value={form.dueDate}
                      onChange={(e) => setForm({ ...form, dueDate: e.target.value })}
                      className="input-field text-xs"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-[11px] font-bold uppercase text-text-muted mb-1 block">Status</label>
                  <select
                    value={form.status}
                    onChange={(e) => setForm({ ...form, status: e.target.value as any })}
                    className="input-field text-xs"
                  >
                    <option value="Pending">Pending Approval</option>
                    <option value="Approved">Approved</option>
                    <option value="Draft">Draft</option>
                    <option value="Expired">Expired</option>
                  </select>
                </div>

                <div>
                  <label className="text-[11px] font-bold uppercase text-text-muted mb-1 block">Justification & Details</label>
                  <textarea
                    required
                    value={form.justification}
                    onChange={(e) => setForm({ ...form, justification: e.target.value })}
                    className="input-field h-24 resize-none text-xs"
                    placeholder="Enter compliance rules or change descriptions..."
                  />
                </div>

                <div className="flex gap-3 justify-end pt-3 border-t border-border-subtle">
                  <button type="button" onClick={() => setIsOpen(false)} className="btn-secondary py-2 text-xs">
                    Cancel
                  </button>
                  <button type="submit" className="btn-primary py-2 text-xs">
                    Save Entry
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
