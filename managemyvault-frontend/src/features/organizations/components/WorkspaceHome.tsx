import { useParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  Key, FileText, Users, MapPin, AlertTriangle,
  Activity, Database, ShieldAlert, Cpu, Network
} from 'lucide-react';
import { useOrganization } from '../hooks/useOrganizations';
import HealthScoreRing from './HealthScoreRing';

export default function WorkspaceHome() {
  const { orgId } = useParams<{ orgId: string }>();
  const { data: org, isLoading } = useOrganization(orgId);

  if (isLoading) {
    return (
      <div className="p-8 space-y-6">
        <div className="h-8 w-64 bg-vault-elevated animate-pulse rounded-lg" />
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-32 bg-vault-elevated animate-pulse rounded-xl" />
          ))}
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="h-96 lg:col-span-2 bg-vault-elevated animate-pulse rounded-xl" />
          <div className="h-96 bg-vault-elevated animate-pulse rounded-xl" />
        </div>
      </div>
    );
  }

  if (!org) {
    return (
      <div className="p-8 text-center text-text-secondary">
        <AlertTriangle className="w-12 h-12 mx-auto text-status-warning mb-4" />
        <p className="text-lg font-medium">Organization workspace not found</p>
      </div>
    );
  }

  const healthScore = org.healthScore ?? 100;

  // Pre-configured mock lists based on organization stats
  const mockAssets = [
    { name: 'Core Router Switch', type: 'Switch', ip: '10.0.1.1' },
    { name: 'Active Directory VM', type: 'Server', ip: '10.0.1.5' },
    { name: 'Finance Printer', type: 'Printer', ip: '10.0.2.14' },
    { name: 'Office Server ESXi', type: 'ESX Host', ip: '10.0.1.2' },
  ];

  const mockRecentActivity = [
    { user: 'Sarah Connor', action: 'Created credential for VPN Portal', time: '10 mins ago' },
    { user: 'John Doe', action: 'Updated Site Summary for Server Room A', time: '1 hour ago' },
    { user: 'System Bot', action: 'Rotated API credentials for Weyland Integration', time: '3 hours ago' },
    { user: 'Miles Dyson', action: 'Archived legacy configurations', time: '1 day ago' },
  ];

  const mockAlerts = [
    healthScore < 60
      ? { type: 'critical', text: ' Skynet Network Firewall has expired support license', date: 'Immediate Action Required' }
      : { type: 'warning', text: '3 shared credentials have not been rotated in 90+ days', date: '3 days ago' },
    { type: 'warning', text: 'Primary Domain SSL certificate expires in 14 days', date: '1 day ago' },
    { type: 'info', text: 'Backup verification completed successfully for main storage node', date: '12 hours ago' },
  ];

  return (
    <div className="p-6 space-y-6 bg-vault-base text-text-primary transition-colors duration-200">
      {/* Header section */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b border-border-subtle pb-5">
        <div>
          <span className="text-xs font-semibold text-brand-primary tracking-wider uppercase">
            Workspace Dashboard
          </span>
          <h1 className="text-2xl font-bold tracking-tight text-text-primary mt-1">
            {org.name}
          </h1>
          <p className="text-sm text-text-secondary mt-0.5">
            {org.description || 'Manage core configuration items, documents, and credentials.'}
          </p>
        </div>

        {/* Top actions/quick-indicators */}
        <div className="flex items-center gap-4 bg-vault-card border border-border-subtle px-4 py-2.5 rounded-xl shadow-sm">
          <div className="text-right">
            <p className="text-xs text-text-muted leading-none">Security Rating</p>
            <p className="text-sm font-semibold text-text-primary mt-1">Class A Compliance</p>
          </div>
          <div className="w-2.5 h-2.5 rounded-full bg-status-success animate-pulse" />
        </div>
      </div>

      {/* Grid: 4 Core Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="stat-card flex items-center justify-between"
        >
          <div>
            <span className="text-xs text-text-muted uppercase font-semibold">Total Assets</span>
            <h3 className="text-2xl font-extrabold text-text-primary mt-1.5">{org.assetCount}</h3>
            <span className="text-xs text-brand-accent mt-1 inline-block">Hardware & Networks</span>
          </div>
          <div className="w-12 h-12 rounded-xl bg-brand-primary/10 flex items-center justify-center text-brand-primary">
            <Cpu className="w-6 h-6" />
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15 }}
          className="stat-card flex items-center justify-between"
        >
          <div>
            <span className="text-xs text-text-muted uppercase font-semibold">Passwords</span>
            <h3 className="text-2xl font-extrabold text-text-primary mt-1.5">{org.passwordCount}</h3>
            <span className="text-xs text-status-success mt-1 inline-block">AES-256 Encrypted</span>
          </div>
          <div className="w-12 h-12 rounded-xl bg-brand-secondary/10 flex items-center justify-center text-brand-secondary">
            <Key className="w-6 h-6" />
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="stat-card flex items-center justify-between"
        >
          <div>
            <span className="text-xs text-text-muted uppercase font-semibold">Documents</span>
            <h3 className="text-2xl font-extrabold text-text-primary mt-1.5">{org.documentCount}</h3>
            <span className="text-xs text-text-muted mt-1 inline-block">Standards & Guides</span>
          </div>
          <div className="w-12 h-12 rounded-xl bg-brand-accent/10 flex items-center justify-center text-brand-accent">
            <FileText className="w-6 h-6" />
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.25 }}
          className="stat-card flex items-center justify-between"
        >
          <div>
            <span className="text-xs text-text-muted uppercase font-semibold">Locations</span>
            <h3 className="text-2xl font-extrabold text-text-primary mt-1.5">3</h3>
            <span className="text-xs text-text-muted mt-1 inline-block">Sites & Server Rooms</span>
          </div>
          <div className="w-12 h-12 rounded-xl bg-status-success/10 flex items-center justify-center text-status-success">
            <MapPin className="w-6 h-6" />
          </div>
        </motion.div>
      </div>

      {/* Main Row: Health Score & Recent Activity & Assets list */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left Column: Health Score Card */}
        <div className="glass-panel p-6 flex flex-col items-center justify-center text-center">
          <h2 className="text-base font-semibold text-text-primary self-start mb-6">Documentation Health</h2>
          <div className="w-40 h-40 flex items-center justify-center mb-6">
            <HealthScoreRing score={healthScore} size={150} strokeWidth={12} />
          </div>
          <h3 className="text-sm font-semibold text-text-primary mb-1">
            {healthScore >= 80 ? 'Excellent Coverage' : healthScore >= 50 ? 'Needs Attention' : 'Critical Gaps'}
          </h3>
          <p className="text-xs text-text-muted max-w-[200px] leading-relaxed">
            Overall health score tracks completeness of configurations, passwords, and site notes.
          </p>
        </div>

        {/* Center Column: Recent Assets & Configuration quick overview */}
        <div className="glass-panel p-6 flex flex-col justify-between">
          <div>
            <h2 className="text-base font-semibold text-text-primary mb-4 flex items-center gap-2">
              <Database className="w-4 h-4 text-brand-primary" />
              Critical Assets Quick View
            </h2>
            <div className="space-y-3">
              {mockAssets.map((asset, i) => (
                <div key={i} className="flex items-center justify-between p-2.5 rounded-lg bg-vault-elevated/50 border border-border-subtle hover:border-border-default transition-all duration-200">
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-lg bg-brand-primary/10 flex items-center justify-center text-brand-primary">
                      <Network className="w-4 h-4" />
                    </div>
                    <div>
                      <p className="text-xs font-semibold text-text-primary">{asset.name}</p>
                      <p className="text-[10px] text-text-muted mt-0.5">{asset.type}</p>
                    </div>
                  </div>
                  <span className="text-[11px] font-mono text-text-secondary bg-vault-base px-2 py-0.5 rounded border border-border-subtle">
                    {asset.ip}
                  </span>
                </div>
              ))}
            </div>
          </div>
          <span className="text-xs text-brand-primary hover:underline cursor-pointer font-medium mt-4 block">
            View all network configurations →
          </span>
        </div>

        {/* Right Column: Security Alerts & Compliance status */}
        <div className="glass-panel p-6">
          <h2 className="text-base font-semibold text-text-primary mb-4 flex items-center gap-2">
            <ShieldAlert className="w-4.5 h-4.5 text-status-danger" />
            Security & Alerts
          </h2>
          <div className="space-y-3.5">
            {mockAlerts.map((alert, i) => (
              <div key={i} className="flex gap-2.5">
                <div className={`mt-0.5 flex-shrink-0 w-2.5 h-2.5 rounded-full ${
                  alert.type === 'critical' ? 'bg-status-danger' : alert.type === 'warning' ? 'bg-status-warning' : 'bg-status-info'
                }`} />
                <div>
                  <p className="text-xs text-text-secondary leading-relaxed">{alert.text}</p>
                  <span className="text-[10px] text-text-muted mt-1 block">{alert.date}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

      </div>

      {/* Timeline Row: Recent Activity & Contacts summary */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left/Center Columns: Recent Activity Log */}
        <div className="lg:col-span-2 glass-panel p-6">
          <h2 className="text-base font-semibold text-text-primary mb-5 flex items-center gap-2">
            <Activity className="w-4.5 h-4.5 text-brand-secondary" />
            Recent Workspace Activity
          </h2>
          <div className="relative border-l border-border-subtle ml-3 pl-6 space-y-5">
            {mockRecentActivity.map((activity, i) => (
              <div key={i} className="relative">
                {/* Dot */}
                <div className="absolute -left-[30px] top-1 w-2.5 h-2.5 rounded-full border border-vault-card bg-border-default" />
                
                <div>
                  <p className="text-xs text-text-secondary">
                    <span className="font-semibold text-text-primary">{activity.user}</span> {activity.action}
                  </p>
                  <span className="text-[10px] text-text-muted mt-1 block">{activity.time}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Right Column: Primary Contacts Widget */}
        <div className="glass-panel p-6 flex flex-col justify-between">
          <div>
            <h2 className="text-base font-semibold text-text-primary mb-4 flex items-center gap-2">
              <Users className="w-4.5 h-4.5 text-status-success" />
              Primary Site Contacts
            </h2>
            <div className="space-y-4">
              <div>
                <p className="text-[10px] uppercase font-bold text-text-muted tracking-wider">Primary Escalation</p>
                <p className="text-xs font-semibold text-text-primary mt-1">John Connor</p>
                <p className="text-xs text-text-secondary mt-0.5">john.connor@cyberdyne.com</p>
              </div>
              <div>
                <p className="text-[10px] uppercase font-bold text-text-muted tracking-wider">Site Coordinator</p>
                <p className="text-xs font-semibold text-text-primary mt-1">Sarah Connor</p>
                <p className="text-xs text-text-secondary mt-0.5">+1 (555) 0180</p>
              </div>
            </div>
          </div>

          <div className="mt-4 border-t border-border-subtle pt-4 flex justify-between items-center text-xs">
            <span className="text-text-muted">6 total directory contacts</span>
            <span className="text-brand-primary hover:underline cursor-pointer font-medium">Directory →</span>
          </div>
        </div>

      </div>
    </div>
  );
}
