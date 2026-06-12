import { useState } from 'react';
import { useParams } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Search, FileText, ShieldAlert, GitBranch, RefreshCw, Trash2, X, Loader2 } from 'lucide-react';
import { useExceptions, useCreateException, useDeleteException } from '../../../hooks/useDocs';
import { type ExceptionItem } from '../../../api/docsApi';

interface ExceptionsLogProps {
  mode: 'standards' | 'contract' | 'rfc' | 'change';
}

export default function ExceptionsLog({ mode }: ExceptionsLogProps) {
  const { orgId } = useParams<{ orgId: string }>();
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

  const typeMap: Record<string, string> = {
    standards: 'Standards',
    contract: 'Contract',
    rfc: 'RFC',
    change: 'Change'
  };

  const dbType = typeMap[mode] || 'Standards';

  // React Query Hooks
  const { data: pageData, isLoading } = useExceptions(orgId || '', dbType, search);
  const createMutation = useCreateException();
  const deleteMutation = useDeleteException();

  const items = pageData?.content || [];

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

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.title || !form.justification || !orgId) return;

    try {
      await createMutation.mutateAsync({
        orgId,
        entry: {
          title: form.title,
          type: dbType,
          status: form.status,
          justification: form.justification,
          reviewer: form.reviewer || 'Self-Registered',
          dueDate: form.dueDate,
          priority: mode === 'rfc' ? form.priority : undefined
        }
      });
      setIsOpen(false);
    } catch (err) {
      console.error('Failed to create exception entry', err);
    }
  };

  const handleDelete = async (id: string) => {
    if (!orgId) return;
    if (confirm('Are you sure you want to remove this log entry?')) {
      try {
        await deleteMutation.mutateAsync({ orgId, id, type: dbType });
      } catch (err) {
        console.error('Failed to delete exception entry', err);
      }
    }
  };

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
        {isLoading ? (
          <div className="flex justify-center items-center py-12">
            <Loader2 className="w-8 h-8 animate-spin text-brand-primary" />
          </div>
        ) : items.length > 0 ? (
          items.map((item) => (
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
                  <span>Status: 
                    <strong className={`ml-1 px-1.5 py-0.5 rounded text-[8px] uppercase ${
                      item.status === 'Approved' ? 'bg-status-success/15 text-status-success' :
                      item.status === 'Pending' ? 'bg-status-warning/15 text-status-warning' :
                      'bg-vault-elevated text-text-muted'
                    }`}>
                      {item.status}
                    </strong>
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-2 w-full md:w-auto justify-end border-t md:border-t-0 border-border-subtle pt-3 md:pt-0">
                <button
                  onClick={() => handleDelete(item.id)}
                  disabled={deleteMutation.isPending}
                  className="btn-secondary py-1.5 px-3 text-xs text-status-danger border-status-danger/20 hover:bg-status-danger/10 flex items-center gap-1"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  Remove
                </button>
              </div>
            </div>
          ))
        ) : (
          <div className="glass-panel p-12 text-center flex flex-col items-center justify-center">
            <FileText className="w-12 h-12 text-text-muted mb-4" />
            <h3 className="text-sm font-bold text-text-primary mb-1">No Entries Found</h3>
            <p className="text-xs text-text-muted max-w-xs">
              Configure security standards, contract exceptions, change logs, and RFCs for this workspace.
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
                  <h2 className="text-base font-bold text-text-primary">Add Log Entry</h2>
                  <p className="text-xs text-text-muted mt-0.5">Register a new entry for {modeTitle}</p>
                </div>
                <button onClick={() => setIsOpen(false)} className="p-1 text-text-muted hover:text-text-primary">
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleSave} className="space-y-4">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-text-secondary">Entry Title / Subject</label>
                  <input
                    type="text"
                    required
                    value={form.title}
                    onChange={(e) => setForm({ ...form, title: e.target.value })}
                    className="input-field text-xs"
                    placeholder="e.g. Legacy TLS 1.0 support on web-srv-02"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-text-secondary">Status</label>
                    <select
                      value={form.status}
                      onChange={(e) => setForm({ ...form, status: e.target.value as ExceptionItem['status'] })}
                      className="input-field text-xs"
                    >
                      <option value="Draft">Draft</option>
                      <option value="Pending">Pending Approval</option>
                      <option value="Approved">Approved</option>
                      <option value="Expired">Expired</option>
                    </select>
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-bold text-text-secondary">Due Date / Rotation Date</label>
                    <input
                      type="date"
                      required
                      value={form.dueDate}
                      onChange={(e) => setForm({ ...form, dueDate: e.target.value })}
                      className="input-field text-xs"
                    />
                  </div>
                </div>

                {mode === 'rfc' && (
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-text-secondary">Change Priority</label>
                    <div className="flex gap-2">
                      {(['Low', 'Medium', 'High', 'Critical'] as const).map((p) => (
                        <button
                          key={p}
                          type="button"
                          onClick={() => setForm({ ...form, priority: p })}
                          className={`flex-1 py-1.5 rounded-lg border text-[10px] font-bold uppercase transition-all ${
                            form.priority === p
                              ? 'bg-brand-primary/10 border-brand-primary text-brand-primary'
                              : 'bg-vault-elevated/20 border-border-subtle text-text-muted hover:text-text-primary'
                          }`}
                        >
                          {p}
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                <div className="space-y-1">
                  <label className="text-xs font-bold text-text-secondary">Justification / Mitigation Details</label>
                  <textarea
                    required
                    rows={4}
                    value={form.justification}
                    onChange={(e) => setForm({ ...form, justification: e.target.value })}
                    className="input-field text-xs leading-relaxed"
                    placeholder="Provide full description of why this change is necessary and any risk mitigations..."
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-text-secondary">Authorizer / Reviewer Name</label>
                  <input
                    type="text"
                    value={form.reviewer}
                    onChange={(e) => setForm({ ...form, reviewer: e.target.value })}
                    className="input-field text-xs"
                    placeholder="e.g. Chief Security Officer / CAB Committee"
                  />
                </div>

                <div className="pt-4 flex gap-3">
                  <button type="submit" disabled={createMutation.isPending} className="flex-1 btn-primary py-2 flex items-center justify-center gap-1.5">
                    {createMutation.isPending && <Loader2 className="w-4 h-4 animate-spin" />}
                    Save Log Entry
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
