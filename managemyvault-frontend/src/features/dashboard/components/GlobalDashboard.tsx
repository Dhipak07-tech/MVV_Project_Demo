import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  LayoutDashboard,
  Building2,
  MapPin,
  Users,
  Key,
  FileText,
  Monitor,
  Activity,
  ShieldAlert,
  HardDrive,
  Database,
  ArrowUpRight,
  ArrowDownRight,
  AlertTriangle,
  Info,
  CheckCircle,
  Pin,
  Star,
  Settings,
  RefreshCw,
  ExternalLink,
} from 'lucide-react';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  LineChart,
  Line,
  Legend,
} from 'recharts';
import { useAuthStore } from '../../organizations/store/organizationStore';
import { dashboardApi } from '../api/dashboardApi';
import type {
  DashboardOverviewDto,
  DashboardStatisticsDto,
  DashboardActivityDto,
  DashboardTrendDto,
  DashboardOrganizationDto,
  DashboardSecurityDto,
  DashboardStorageDto,
} from '../types/dashboard.types';

export default function GlobalDashboard() {
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const isPlatformUser = user?.role === 'ULTRA_SUPER_ADMIN' || user?.role === 'SUPER_ADMIN';

  // State hooks for dashboard modules
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [overview, setOverview] = useState<DashboardOverviewDto | null>(null);
  const [stats, setStats] = useState<DashboardStatisticsDto | null>(null);
  const [activity, setActivity] = useState<DashboardActivityDto | null>(null);
  const [trends, setTrends] = useState<DashboardTrendDto | null>(null);
  const [orgs, setOrgs] = useState<DashboardOrganizationDto[]>([]);
  const [security, setSecurity] = useState<DashboardSecurityDto | null>(null);
  const [storage, setStorage] = useState<DashboardStorageDto | null>(null);

  const [trendDays, setTrendDays] = useState(30);
  const [activityTab, setActivityTab] = useState<'activity' | 'updates'>('activity');

  const fetchData = async () => {
    try {
      setRefreshing(true);
      const [
        overviewRes,
        statsRes,
        activityRes,
        trendsRes,
        orgsRes,
        securityRes,
      ] = await Promise.all([
        dashboardApi.getOverview(),
        dashboardApi.getStatistics(),
        dashboardApi.getActivity(),
        dashboardApi.getTrends(trendDays),
        dashboardApi.getOrganizations(),
        dashboardApi.getSecurity(),
      ]);

      setOverview(overviewRes);
      setStats(statsRes);
      setActivity(activityRes);
      setTrends(trendsRes);
      setOrgs(orgsRes);
      setSecurity(securityRes);

      if (isPlatformUser) {
        const storageRes = await dashboardApi.getStorage();
        setStorage(storageRes);
      }
    } catch (err) {
      console.error('Error fetching dashboard data:', err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [trendDays, user]);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[80vh] gap-4">
        <div className="w-12 h-12 border-4 border-brand-primary border-t-transparent rounded-full animate-spin" />
        <p className="text-sm font-medium text-text-secondary">Loading MSP Command Center...</p>
      </div>
    );
  }

  // Helper mapping for KPI card icons
  const getIcon = (title: string) => {
    switch (title.toLowerCase()) {
      case 'organizations': return Building2;
      case 'sites': return MapPin;
      case 'contacts': return Users;
      case 'passwords': return Key;
      case 'documents': return FileText;
      case 'assets': return Monitor;
      case 'networks': return Activity;
      case 'vendors': return Settings;
      case 'users': return Users;
      default: return LayoutDashboard;
    }
  };

  return (
    <div className="p-6 lg:p-8 max-w-[1600px] mx-auto space-y-8">
      {/* 1. Header with Role Awareness & Action Controls */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-page-title text-text-primary">Global Dashboard</h1>
            <span className="badge badge-info uppercase tracking-wider text-[10px] px-2 py-0.5">
              {user?.role?.replace(/_/g, ' ') || 'ORG ADMIN'}
            </span>
          </div>
          <p className="text-sm text-text-secondary mt-1">
            Enterprise command center and platform analytics.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={fetchData}
            disabled={refreshing}
            className="btn-secondary text-xs flex items-center gap-2"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${refreshing ? 'animate-spin' : ''}`} />
            Refresh Dashboard
          </button>
        </div>
      </div>

      {/* 2. IT Glue-style Organization Context Switching Ribbon */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-section-title text-text-primary flex items-center gap-2">
            <Building2 className="w-5 h-5 text-brand-primary" />
            Organization Quick Switch
          </h2>
          <span className="text-xs text-text-muted">Jump directly to client workspace</span>
        </div>
        <div className="flex gap-4 overflow-x-auto pb-2 scrollbar-thin scrollbar-thumb-border-default scrollbar-track-vault-base">
          {orgs.map((org) => (
            <motion.div
              key={org.id}
              whileHover={{ y: -3 }}
              onClick={() => navigate(`/org/${org.id}/home`)}
              className="flex-shrink-0 w-64 bg-vault-card border border-border-subtle rounded-xl p-4 cursor-pointer hover:border-brand-primary hover:shadow-card-hover transition-all duration-200"
            >
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-lg bg-vault-elevated flex items-center justify-center font-bold text-brand-primary">
                    {org.name.slice(0, 2).toUpperCase()}
                  </div>
                  <div className="max-w-[140px] truncate">
                    <p className="text-sm font-semibold text-text-primary truncate">{org.name}</p>
                    <p className="text-[11px] text-text-muted truncate">/{org.slug}</p>
                  </div>
                </div>
                <div className="flex items-center gap-1">
                  {org.pinned && <Pin className="w-3 h-3 text-status-warning fill-status-warning" />}
                  {org.favorite && <Star className="w-3 h-3 text-brand-accent fill-brand-accent" />}
                </div>
              </div>

              <div className="mt-4 grid grid-cols-3 gap-2 border-t border-border-subtle pt-3 text-center">
                <div>
                  <p className="text-[10px] text-text-muted uppercase">Health</p>
                  <p className={`text-xs font-semibold mt-0.5 ${
                    org.healthScore >= 85 ? 'text-status-success' : org.healthScore >= 60 ? 'text-status-warning' : 'text-status-danger'
                  }`}>
                    {org.healthScore}%
                  </p>
                </div>
                <div>
                  <p className="text-[10px] text-text-muted uppercase">Sites</p>
                  <p className="text-xs font-semibold text-text-primary mt-0.5">{org.siteCount}</p>
                </div>
                <div>
                  <p className="text-[10px] text-text-muted uppercase">Assets</p>
                  <p className="text-xs font-semibold text-text-primary mt-0.5">{org.assetCount}</p>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>

      {/* 3. Top Metrics: Overall Health Score + Notifications */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Overall Health Card */}
        <div className="bg-vault-card border border-border-subtle rounded-xl p-6 flex flex-col justify-between">
          <div>
            <h3 className="text-card-title text-text-primary">Overall Platform Health</h3>
            <p className="text-xs text-text-muted mt-1">Weighted performance across operational indicators</p>
          </div>

          <div className="flex items-center justify-center my-6 relative">
            {/* Health circle display */}
            <div className="w-32 h-32 rounded-full border-8 border-vault-elevated flex flex-col items-center justify-center relative shadow-inner">
              <span className={`text-3xl font-extrabold ${
                overview?.healthScore && overview.healthScore >= 85 ? 'text-status-success' : overview?.healthScore && overview.healthScore >= 60 ? 'text-status-warning' : 'text-status-danger'
              }`}>
                {overview?.healthScore}%
              </span>
              <span className="text-[10px] text-text-muted uppercase font-semibold tracking-wider mt-1">
                {overview?.healthStatus}
              </span>

              {/* Glowing ring underlay based on health */}
              <div className={`absolute inset-0 rounded-full border-4 opacity-25 animate-pulse ${
                overview?.healthScore && overview.healthScore >= 85 ? 'border-status-success' : overview?.healthScore && overview.healthScore >= 60 ? 'border-status-warning' : 'border-status-danger'
              }`} />
            </div>
          </div>

          {/* Breakdown progress bars */}
          <div className="space-y-2.5">
            {overview?.healthBreakdown && Object.entries(overview.healthBreakdown).map(([key, val]) => (
              <div key={key}>
                <div className="flex justify-between text-xs font-medium mb-1">
                  <span className="text-text-secondary capitalize">{key}</span>
                  <span className="text-text-primary">{val}%</span>
                </div>
                <div className="w-full bg-vault-elevated rounded-full h-1.5 overflow-hidden">
                  <div
                    className={`h-full rounded-full ${
                      val >= 85 ? 'bg-status-success' : val >= 60 ? 'bg-status-warning' : 'bg-status-danger'
                    }`}
                    style={{ width: `${val}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Notifications & Critical Alerts Feed */}
        <div className="lg:col-span-2 bg-vault-card border border-border-subtle rounded-xl p-6 flex flex-col">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-card-title text-text-primary flex items-center gap-2">
                <ShieldAlert className="w-5 h-5 text-status-warning" />
                Active Incident Alerts
              </h3>
              <p className="text-xs text-text-muted mt-1">Real-time status updates and critical checks</p>
            </div>
            <span className="badge badge-warning text-[10px] font-bold">
              {overview?.notifications?.length ?? 0} Alert{(overview?.notifications?.length ?? 0) !== 1 ? 's' : ''}
            </span>
          </div>

          <div className="flex-1 overflow-y-auto space-y-3 max-h-[380px] pr-2">
            <AnimatePresence>
              {overview?.notifications && overview.notifications.length > 0 ? (
                overview.notifications.map((n) => (
                  <motion.div
                    key={n.id}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 10 }}
                    className={`flex items-start gap-3 p-4 rounded-xl border transition-colors ${
                      n.severity === 'CRITICAL'
                        ? 'bg-status-danger/10 border-status-danger/30 hover:bg-status-danger/15'
                        : n.severity === 'WARNING'
                        ? 'bg-status-warning/10 border-status-warning/30 hover:bg-status-warning/15'
                        : 'bg-status-info/10 border-status-info/30 hover:bg-status-info/15'
                    }`}
                  >
                    <div className="mt-0.5">
                      {n.severity === 'CRITICAL' ? (
                        <AlertTriangle className="w-4.5 h-4.5 text-status-danger" />
                      ) : n.severity === 'WARNING' ? (
                        <AlertTriangle className="w-4.5 h-4.5 text-status-warning" />
                      ) : (
                        <Info className="w-4.5 h-4.5 text-status-info" />
                      )}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center justify-between">
                        <p className="text-sm font-semibold text-text-primary">{n.title}</p>
                        <span className="text-[10px] text-text-muted">
                          {new Date(n.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </span>
                      </div>
                      <p className="text-xs text-text-secondary mt-1 leading-relaxed">{n.message}</p>
                    </div>
                  </motion.div>
                ))
              ) : (
                <div className="flex flex-col items-center justify-center h-full text-center py-12">
                  <CheckCircle className="w-10 h-10 text-status-success mb-2" />
                  <p className="text-sm font-medium text-text-primary">System Secure</p>
                  <p className="text-xs text-text-muted mt-0.5">No critical issues or anomalies detected.</p>
                </div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>

      {/* 4. Operational Statistics Grid */}
      <div className="space-y-3">
        <h2 className="text-section-title text-text-primary flex items-center gap-2">
          <Activity className="w-5 h-5 text-brand-primary" />
          Operational Statistics
        </h2>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
          {stats?.cards.map((card) => {
            const Icon = getIcon(card.title);
            return (
              <div key={card.title} className="stat-card flex flex-col justify-between">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-text-muted uppercase tracking-wider">
                    {card.title}
                  </span>
                  <div className="p-1.5 rounded-lg bg-vault-elevated text-brand-primary">
                    <Icon className="w-4 h-4" />
                  </div>
                </div>

                <div className="mt-4">
                  <p className="text-3xl font-extrabold text-text-primary tracking-tight">
                    {card.count.toLocaleString()}
                  </p>
                  <div className="flex items-center gap-1 mt-1 text-[11px]">
                    {card.trend === 'UP' ? (
                      <span className="text-status-success font-medium flex items-center gap-0.5">
                        <ArrowUpRight className="w-3.5 h-3.5" />
                        +{card.growthRate}%
                      </span>
                    ) : card.trend === 'DOWN' ? (
                      <span className="text-status-danger font-medium flex items-center gap-0.5">
                        <ArrowDownRight className="w-3.5 h-3.5" />
                        -{card.growthRate}%
                      </span>
                    ) : (
                      <span className="text-text-muted font-medium">Flat</span>
                    )}
                    <span className="text-text-muted">past 30d</span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* 5. Charts & Trends Layer */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Line Chart showing growth trends */}
        <div className="lg:col-span-2 bg-vault-card border border-border-subtle rounded-xl p-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
            <div>
              <h3 className="text-card-title text-text-primary">Resource Accumulation Trends</h3>
              <p className="text-xs text-text-muted mt-0.5">Track growth of operational entities over time</p>
            </div>
            <div className="flex gap-1 bg-vault-elevated p-1 rounded-lg border border-border-subtle">
              {[7, 15, 30, 90].map((d) => (
                <button
                  key={d}
                  onClick={() => setTrendDays(d)}
                  className={`px-2.5 py-1 text-xs font-medium rounded-md transition-colors ${
                    trendDays === d
                      ? 'bg-brand-primary text-white'
                      : 'text-text-secondary hover:text-text-primary'
                  }`}
                >
                  {d}d
                </button>
              ))}
            </div>
          </div>

          <div className="h-72 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={trends?.trends ?? []}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                <XAxis dataKey="date" stroke="rgb(var(--color-text-muted))" fontSize={11} />
                <YAxis stroke="rgb(var(--color-text-muted))" fontSize={11} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: 'rgba(20, 27, 53, 0.95)',
                    border: '1px solid rgb(var(--color-border-subtle))',
                    borderRadius: '8px',
                    color: '#fff',
                  }}
                />
                <Legend fontSize={12} />
                <Line type="monotone" dataKey="passwords" stroke="#3B82F6" strokeWidth={2} dot={false} />
                <Line type="monotone" dataKey="assets" stroke="#10B981" strokeWidth={2} dot={false} />
                <Line type="monotone" dataKey="documents" stroke="#F59E0B" strokeWidth={2} dot={false} />
                <Line type="monotone" dataKey="contacts" stroke="#EF4444" strokeWidth={2} dot={false} />
                <Line type="monotone" dataKey="sites" stroke="#6366F1" strokeWidth={2} dot={false} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Security Posture Module */}
        <div className="bg-vault-card border border-border-subtle rounded-xl p-6 flex flex-col justify-between">
          <div>
            <h3 className="text-card-title text-text-primary flex items-center gap-2">
              <ShieldAlert className="w-5 h-5 text-brand-primary" />
              Security Posture
            </h3>
            <p className="text-xs text-text-muted mt-0.5">Aggregate status of safety and credentials</p>
          </div>

          <div className="my-4 flex items-center gap-4">
            <div className="relative w-20 h-20 flex items-center justify-center">
              <svg className="w-full h-full transform -rotate-90" viewBox="0 0 36 36">
                <path
                  className="text-vault-elevated"
                  strokeWidth="3.5"
                  stroke="currentColor"
                  fill="none"
                  d="M18 2.0845
                    a 15.9155 15.9155 0 0 1 0 31.831
                    a 15.9155 15.9155 0 0 1 0 -31.831"
                />
                <path
                  className="text-brand-primary"
                  strokeWidth="3.5"
                  strokeDasharray={`${security?.securityHealthScore || 0}, 100`}
                  strokeLinecap="round"
                  stroke="currentColor"
                  fill="none"
                  d="M18 2.0845
                    a 15.9155 15.9155 0 0 1 0 31.831
                    a 15.9155 15.9155 0 0 1 0 -31.831"
                />
              </svg>
              <span className="absolute text-lg font-bold text-text-primary">
                {security?.securityHealthScore}%
              </span>
            </div>
            <div>
              <p className="text-sm font-semibold text-text-primary">Security Index Score</p>
              <p className="text-xs text-text-muted mt-0.5">Calculated based on credential hygiene metrics</p>
            </div>
          </div>

          <div className="space-y-2.5 pt-2 border-t border-border-subtle">
            <div className="flex justify-between text-xs">
              <span className="text-text-secondary">Weak Credentials</span>
              <span className={`font-semibold ${security && security.weakPasswords > 5 ? 'text-status-danger' : 'text-text-primary'}`}>
                {security?.weakPasswords}
              </span>
            </div>
            <div className="flex justify-between text-xs">
              <span className="text-text-secondary">Expired Credentials</span>
              <span className={`font-semibold ${security && security.expiredPasswords > 0 ? 'text-status-warning' : 'text-text-primary'}`}>
                {security?.expiredPasswords}
              </span>
            </div>
            <div className="flex justify-between text-xs">
              <span className="text-text-secondary">Reused Credentials</span>
              <span className="font-semibold text-text-primary">{security?.reusedPasswords}</span>
            </div>
            <div className="flex justify-between text-xs">
              <span className="text-text-secondary">Expired Tracker Assets</span>
              <span className="font-semibold text-text-primary">
                {(security?.expiredDomains || 0) + (security?.expiredSslCertificates || 0)}
              </span>
            </div>
            <div className="flex justify-between text-xs">
              <span className="text-text-secondary">Pending Exceptions</span>
              <span className="font-semibold text-text-primary">{security?.unreviewedExceptions}</span>
            </div>
          </div>
        </div>
      </div>

      {/* 6. Activity & Storage Layer */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Log feed: Recent activities + Updates */}
        <div className="lg:col-span-2 bg-vault-card border border-border-subtle rounded-xl p-6">
          <div className="flex items-center justify-between border-b border-border-subtle pb-3 mb-4">
            <div className="flex gap-4">
              <button
                onClick={() => setActivityTab('activity')}
                className={`text-sm font-semibold pb-2 border-b-2 transition-colors ${
                  activityTab === 'activity'
                    ? 'border-brand-primary text-brand-primary'
                    : 'border-transparent text-text-muted hover:text-text-primary'
                }`}
              >
                Recent Audit Logs
              </button>
              <button
                onClick={() => setActivityTab('updates')}
                className={`text-sm font-semibold pb-2 border-b-2 transition-colors ${
                  activityTab === 'updates'
                    ? 'border-brand-primary text-brand-primary'
                    : 'border-transparent text-text-muted hover:text-text-primary'
                }`}
              >
                Recently Updated Records
              </button>
            </div>
          </div>

          <div className="space-y-4 max-h-[300px] overflow-y-auto pr-2">
            {activityTab === 'activity' ? (
              activity?.recentActivity && activity.recentActivity.length > 0 ? (
                activity.recentActivity.map((act) => (
                  <div key={act.id} className="flex gap-3 text-xs border-b border-border-subtle/50 pb-3 last:border-0">
                    <div className="w-8 h-8 rounded-full bg-brand-primary/10 text-brand-primary flex items-center justify-center font-bold">
                      {act.user.slice(0, 2).toUpperCase()}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center justify-between">
                        <span className="font-semibold text-text-primary">{act.user}</span>
                        <span className="text-[10px] text-text-muted">
                          {new Date(act.timestamp).toLocaleString()}
                        </span>
                      </div>
                      <p className="text-text-secondary mt-0.5">
                        <span className="text-brand-accent font-medium capitalize">{act.action}</span>{' '}
                        {act.details} in <span className="font-semibold">{act.organization}</span>
                      </p>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-12 text-xs text-text-muted">No audit events logged.</div>
              )
            ) : (
              activity?.recentlyUpdated && activity.recentlyUpdated.length > 0 ? (
                activity.recentlyUpdated.map((rec) => (
                  <div
                    key={rec.id}
                    onClick={() => navigate(`/org/${rec.organizationId}/${rec.type.toLowerCase() === 'site' ? 'site-summary' : rec.type.toLowerCase() + 's'}`)}
                    className="flex items-center justify-between p-2 rounded-lg hover:bg-vault-elevated cursor-pointer transition-colors text-xs"
                  >
                    <div className="flex items-center gap-3">
                      <span className={`badge ${
                        rec.type === 'PASSWORD' ? 'badge-success' : rec.type === 'DOCUMENT' ? 'badge-info' : 'badge-warning'
                      }`}>
                        {rec.type}
                      </span>
                      <div>
                        <p className="font-semibold text-text-primary flex items-center gap-1">
                          {rec.title}
                          <ExternalLink className="w-3 h-3 text-text-muted inline" />
                        </p>
                        <p className="text-[10px] text-text-muted">{rec.organization}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-text-secondary">by {rec.updatedBy}</p>
                      <p className="text-[10px] text-text-muted">
                        {new Date(rec.updatedAt).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-12 text-xs text-text-muted">No recently updated records.</div>
              )
            )}
          </div>
        </div>

        {/* 7. Platform Storage Analytics (Super Admins only) */}
        {isPlatformUser && storage && (
          <div className="bg-vault-card border border-border-subtle rounded-xl p-6 flex flex-col justify-between">
            <div>
              <h3 className="text-card-title text-text-primary flex items-center gap-2">
                <HardDrive className="w-5 h-5 text-brand-primary" />
                Storage Analytics
              </h3>
              <p className="text-xs text-text-muted mt-0.5">Database sizing and file storage usage</p>
            </div>

            <div className="grid grid-cols-2 gap-4 my-4">
              <div className="bg-vault-elevated p-3 rounded-lg border border-border-subtle">
                <p className="text-[10px] text-text-muted uppercase">Database Size</p>
                <p className="text-lg font-bold text-text-primary mt-1 flex items-center gap-1.5">
                  <Database className="w-4 h-4 text-brand-primary" />
                  {storage.databaseSizeReadable}
                </p>
              </div>
              <div className="bg-vault-elevated p-3 rounded-lg border border-border-subtle">
                <p className="text-[10px] text-text-muted uppercase">File Storage (MinIO)</p>
                <p className="text-lg font-bold text-text-primary mt-1 flex items-center gap-1.5">
                  <HardDrive className="w-4 h-4 text-brand-secondary" />
                  {storage.minioUsageReadable}
                </p>
              </div>
            </div>

            {/* Micro Area Chart showing storage growth */}
            <div className="h-24 w-full my-1">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={storage.trends}>
                  <defs>
                    <linearGradient id="storageColor" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#6366F1" stopOpacity={0.4} />
                      <stop offset="95%" stopColor="#6366F1" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <Tooltip
                    formatter={(val) => [`${(Number(val) / (1024 * 1024)).toFixed(1)} MB`, 'Storage']}
                    contentStyle={{
                      backgroundColor: 'rgba(20, 27, 53, 0.95)',
                      border: '1px solid rgb(var(--color-border-subtle))',
                      borderRadius: '8px',
                      color: '#fff',
                      fontSize: '11px',
                    }}
                  />
                  <Area type="monotone" dataKey="bytes" stroke="#6366F1" fillOpacity={1} fill="url(#storageColor)" strokeWidth={1.5} />
                </AreaChart>
              </ResponsiveContainer>
            </div>

            <div className="space-y-2 pt-2 border-t border-border-subtle text-xs">
              <div className="flex justify-between">
                <span className="text-text-secondary">Attachment Count</span>
                <span className="font-semibold text-text-primary">{storage.attachmentCount} files</span>
              </div>
              <div className="flex justify-between">
                <span className="text-text-secondary">Average Upload Size</span>
                <span className="font-semibold text-text-primary">{storage.averageUploadSizeReadable}</span>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
