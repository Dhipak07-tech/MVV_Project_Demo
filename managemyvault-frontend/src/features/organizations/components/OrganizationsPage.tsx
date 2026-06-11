import { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Plus, Search, Grid3X3, List, Filter, Building2, TrendingUp, AlertTriangle, Archive } from 'lucide-react';
import { useOrganizations, useOrganizationStats } from '../hooks/useOrganizations';
import { useOrganizationStore } from '../store/organizationStore';
import { useDebounce } from '../../../shared/hooks/useDebounce';
import OrganizationCard from './OrganizationCard';
import CreateOrganizationModal from './CreateOrganizationModal';
import type { OrganizationStatus } from '../types/organization.types';

export default function OrganizationsPage() {
  const navigate = useNavigate();
  const { viewMode, setViewMode, searchQuery, setSearchQuery, filters, setFilters } = useOrganizationStore();
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showFilters, setShowFilters] = useState(false);
  const debouncedSearch = useDebounce(searchQuery, 300);

  const { data: orgsData, isLoading, error } = useOrganizations({
    search: debouncedSearch || undefined,
    status: filters.status,
    industry: filters.industry,
  });
  const { data: stats } = useOrganizationStats();
  const organizations = useMemo(() => orgsData?.content ?? [], [orgsData]);

  const statCards = [
    { label: 'Total', value: stats?.total ?? 0, icon: Building2, color: 'text-brand-primary', bg: 'bg-brand-primary/10' },
    { label: 'Active', value: stats?.active ?? 0, icon: TrendingUp, color: 'text-status-success', bg: 'bg-status-success/10' },
    { label: 'Suspended', value: stats?.suspended ?? 0, icon: AlertTriangle, color: 'text-status-warning', bg: 'bg-status-warning/10' },
    { label: 'Archived', value: stats?.archived ?? 0, icon: Archive, color: 'text-text-muted', bg: 'bg-vault-elevated' },
  ];

  const statusOpts: { label: string; value: OrganizationStatus | '' }[] = [
    { label: 'All', value: '' }, { label: 'Active', value: 'ACTIVE' }, { label: 'Suspended', value: 'SUSPENDED' },
    { label: 'Archived', value: 'ARCHIVED' }, { label: 'Pending', value: 'PENDING' },
  ];

  return (
    <div className="p-6 lg:p-8 max-w-[1400px] mx-auto">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-text-primary">Organizations</h1>
          <p className="text-sm text-text-secondary mt-1">Manage client organizations</p>
        </div>
        <button onClick={() => setShowCreateModal(true)} className="btn-primary" id="create-org-btn">
          <Plus className="w-4 h-4" /> New Organization
        </button>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {statCards.map((s, i) => (
          <motion.div key={s.label} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }} className="stat-card">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-text-muted uppercase tracking-wider">{s.label}</p>
                <p className={`text-2xl font-bold mt-1 ${s.color}`}>{s.value}</p>
              </div>
              <div className={`p-2.5 rounded-xl ${s.bg}`}><s.icon className={`w-5 h-5 ${s.color}`} /></div>
            </div>
          </motion.div>
        ))}
      </div>

      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 mb-6">
        <div className="flex items-center gap-3 flex-1 w-full sm:w-auto">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted" />
            <input type="text" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} placeholder="Search..." className="input-field pl-10" />
          </div>
          <button onClick={() => setShowFilters(!showFilters)} className={`btn-secondary ${showFilters ? 'border-brand-primary text-brand-primary' : ''}`}>
            <Filter className="w-4 h-4" />
          </button>
        </div>
        <div className="flex items-center gap-1 bg-vault-elevated rounded-lg p-1 border border-border-subtle">
          <button onClick={() => setViewMode('grid')} className={`p-1.5 rounded-md ${viewMode === 'grid' ? 'bg-brand-primary text-white' : 'text-text-muted hover:text-text-primary'}`}><Grid3X3 className="w-4 h-4" /></button>
          <button onClick={() => setViewMode('list')} className={`p-1.5 rounded-md ${viewMode === 'list' ? 'bg-brand-primary text-white' : 'text-text-muted hover:text-text-primary'}`}><List className="w-4 h-4" /></button>
        </div>
      </div>

      {showFilters && (
        <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} className="flex items-center gap-3 mb-6 p-4 bg-vault-card rounded-xl border border-border-subtle">
          <select value={filters.status || ''} onChange={(e) => setFilters({ status: (e.target.value || undefined) as OrganizationStatus | undefined })} className="input-field w-auto">
            {statusOpts.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
          </select>
          <button onClick={() => { setFilters({ status: undefined, industry: undefined }); setSearchQuery(''); }} className="btn-ghost text-sm">Clear</button>
        </motion.div>
      )}

      {isLoading ? (
        <div className={`grid gap-4 ${viewMode === 'grid' ? 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3' : 'grid-cols-1'}`}>
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="bg-vault-card rounded-xl border border-border-subtle p-5 animate-pulse">
              <div className="flex items-center gap-3 mb-4"><div className="w-10 h-10 bg-vault-elevated rounded-lg" /><div className="space-y-2"><div className="w-32 h-4 bg-vault-elevated rounded" /><div className="w-20 h-3 bg-vault-elevated rounded" /></div></div>
              <div className="w-full h-3 bg-vault-elevated rounded mt-4" />
            </div>
          ))}
        </div>
      ) : error ? (
        <div className="text-center py-16">
          <AlertTriangle className="w-12 h-12 text-status-danger mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-text-primary mb-2">Failed to load</h3>
          <p className="text-text-secondary">Check your connection and try again.</p>
        </div>
      ) : organizations.length === 0 ? (
        <div className="text-center py-16">
          <Building2 className="w-12 h-12 text-text-muted mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-text-primary mb-2">{searchQuery ? 'No results' : 'No organizations yet'}</h3>
          <p className="text-text-secondary mb-6">{searchQuery ? 'Try different search terms' : 'Create your first org'}</p>
          {!searchQuery && <button onClick={() => setShowCreateModal(true)} className="btn-primary"><Plus className="w-4 h-4" /> Create</button>}
        </div>
      ) : (
        <div className={viewMode === 'grid' ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4' : 'flex flex-col gap-3'}>
          {organizations.map((org, i) => (
            <OrganizationCard key={org.id} org={org} index={i} onSelect={(id) => navigate(`/organizations/${id}`)} onEdit={(id) => navigate(`/organizations/${id}`)} onArchive={() => {}} />
          ))}
        </div>
      )}
      {showCreateModal && <CreateOrganizationModal onClose={() => setShowCreateModal(false)} />}
    </div>
  );
}
