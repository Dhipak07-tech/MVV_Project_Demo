import { useState, useEffect } from 'react';
import { useParams, Outlet, Link, useLocation, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ChevronDown, ChevronRight, Home, Users, FileText, Cpu, Network,
  Briefcase, CloudLightning, HelpCircle, ArrowLeft, Building, ShieldCheck
} from 'lucide-react';
import { useOrganization } from '../hooks/useOrganizations';
import { useAuthStore } from '../store/organizationStore';

interface SidebarSubitem {
  name: string;
  path: string;
  adminOnly?: boolean;
}

interface SidebarCategory {
  name: string;
  icon: typeof Home;
  subitems: SidebarSubitem[];
}

export default function WorkspaceLayout() {
  const { orgId } = useParams<{ orgId: string }>();
  const location = useLocation();
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const { data: org, isLoading } = useOrganization(orgId);

  // Accordion state for sidebar sections
  const [openCategories, setOpenCategories] = useState<Record<string, boolean>>({
    'Home': true,
    'Client Contact': true,
    'Core Documentation': true,
    'Hardware Quick View': false,
    'Networking': false,
    'Apps & Services': false,
    'Backup Solutions': false,
    'Testing': true,
  });

  const toggleCategory = (name: string) => {
    setOpenCategories((prev) => ({ ...prev, [name]: !prev[name] }));
  };

  const categories: SidebarCategory[] = [
    {
      name: 'Home',
      icon: Home,
      subitems: [
        { name: 'Dashboard', path: 'home' }
      ]
    },
    {
      name: 'Client Contact',
      icon: Users,
      subitems: [
        { name: 'Site Summary', path: 'site-summary' },
        { name: 'Site Summary (Legacy)', path: 'site-summary-legacy' },
        { name: 'After Hours Info', path: 'after-hours' },
        { name: 'Onsite Information', path: 'onsite-information' },
        { name: 'Locations', path: 'locations' },
        { name: 'Contacts', path: 'contacts' },
      ]
    },
    {
      name: 'Core Documentation',
      icon: FileText,
      subitems: [
        { name: 'F12 Standards Exception', path: 'docs/standards-exceptions' },
        { name: 'F12 Contract Exceptions', path: 'docs/contract-exceptions' },
        { name: 'Request For Change Form', path: 'docs/rfc' },
        { name: 'Change Log', path: 'docs/change-log' },
        { name: 'Configurations', path: 'assets' },
        { name: 'Documents', path: 'docs/documents' },
        { name: 'Domain Tracker', path: 'docs/domain-tracker' },
        { name: 'Known Issues', path: 'docs/known-issues' },
        { name: 'Maintenance Windows', path: 'docs/maintenance-windows' },
        { name: 'Multi-Factor Authentication', path: 'docs/mfa' },
        { name: 'Networks', path: 'docs/networks' },
        { name: 'Passwords', path: 'passwords' },
        { name: 'SSL Tracker', path: 'docs/ssl-tracker' },
      ]
    },
    {
      name: 'Hardware Quick View',
      icon: Cpu,
      subitems: [
        { name: 'Managed Network Firewall', path: 'assets/firewalls' },
        { name: 'Managed Network Printer', path: 'assets/printers' },
        { name: 'Managed Network Switch', path: 'assets/switches' },
        { name: 'Managed Server', path: 'assets/servers' },
        { name: 'Managed Workstation', path: 'assets/workstations' },
        { name: 'Managed Laptop', path: 'assets/laptops' },
        { name: 'Managed Network UPS', path: 'assets/ups' },
        { name: 'Managed Network ESX Host', path: 'assets/esx-hosts' },
        { name: 'Virtualization', path: 'assets/virtualization' },
      ]
    },
    {
      name: 'Networking',
      icon: Network,
      subitems: [
        { name: 'File Sharing', path: 'networking/file-sharing' },
        { name: 'LAN', path: 'networking/lan' },
        { name: 'MPLS', path: 'networking/mpls' },
        { name: 'Internet/WAN', path: 'networking/wan' },
        { name: 'NAS/SAN', path: 'networking/nas-san' },
        { name: 'Out-of-Band Management', path: 'networking/oob' },
        { name: 'Printer Management', path: 'networking/printer-management' },
        { name: 'VPN', path: 'networking/vpn' },
        { name: 'Wireless', path: 'networking/wireless' },
      ]
    },
    {
      name: 'Apps & Services',
      icon: Briefcase,
      subitems: [
        { name: 'Active Directory', path: 'apps/active-directory' },
        { name: 'Applications', path: 'apps/applications' },
        { name: 'Email', path: 'apps/email' },
        { name: 'Licensing', path: 'apps/licensing' },
        { name: 'Vendors', path: 'apps/vendors' },
        { name: 'Website Provider', path: 'apps/website-provider' },
        { name: 'Security Services', path: 'apps/security-services' },
        { name: 'Voice/PBX/Fax', path: 'apps/voice-pbx-fax' },
      ]
    },
    {
      name: 'Backup Solutions',
      icon: CloudLightning,
      subitems: [
        { name: 'Client Backups', path: 'backups/client-backups' },
        { name: 'Veeam Backups', path: 'backups/veeam-backups' },
        { name: 'Legacy Backups', path: 'backups/legacy-backups' },
        { name: 'MSP Backup', path: 'backups/msp-backup' },
      ]
    },
    {
      name: 'Testing',
      icon: HelpCircle,
      subitems: [
        { name: 'Site Summary V2', path: 'testing/site-summary-v2', adminOnly: true }
      ]
    }
  ];

  const handleBackToDirectory = () => {
    navigate('/organizations');
  };

  return (
    <div className="flex min-h-[calc(100vh-3.5rem)] bg-vault-base text-text-primary transition-colors duration-200">
      {/* Left Sidebar */}
      <aside className="w-72 flex-shrink-0 border-r border-border-subtle bg-vault-surface flex flex-col justify-between overflow-y-auto hidden md:flex">
        <div className="py-4 px-3 space-y-4">
          
          {/* Back button and Selected Org Info */}
          <div className="space-y-3 pb-3 border-b border-border-subtle">
            <button
              onClick={handleBackToDirectory}
              className="flex items-center gap-2 text-xs text-text-secondary hover:text-text-primary transition-colors font-semibold"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              Back to Organizations
            </button>
            <div className="flex items-center gap-2.5 p-2 rounded-xl bg-vault-elevated/40 border border-border-subtle">
              <div className="w-9 h-9 rounded-lg bg-brand-primary flex items-center justify-center text-white font-bold text-sm">
                {org?.name.charAt(0) || 'O'}
              </div>
              <div className="min-w-0">
                <p className="text-xs text-text-muted font-medium">Selected Organization</p>
                <p className="text-sm font-semibold text-text-primary truncate">{org?.name || 'Loading...'}</p>
              </div>
            </div>
          </div>

          {/* Navigation categories */}
          <nav className="space-y-1">
            {categories.map((category) => {
              // Filter out adminOnly items if user lacks appropriate roles
              const visibleSubitems = category.subitems.filter((item) => {
                if (item.adminOnly) {
                  return user?.role === 'SUPER_ADMIN' || user?.role === 'ULTRA_SUPER_ADMIN';
                }
                return true;
              });

              if (visibleSubitems.length === 0) return null;

              const isCategoryOpen = openCategories[category.name];

              return (
                <div key={category.name} className="space-y-0.5">
                  <button
                    onClick={() => toggleCategory(category.name)}
                    className="w-full flex items-center justify-between px-2.5 py-1.5 rounded-lg text-xs font-bold text-text-muted hover:text-text-primary transition-colors hover:bg-vault-elevated/20"
                  >
                    <div className="flex items-center gap-2">
                      <category.icon className="w-3.5 h-3.5 text-text-secondary" />
                      <span>{category.name}</span>
                    </div>
                    {isCategoryOpen ? (
                      <ChevronDown className="w-3 h-3 text-text-muted" />
                    ) : (
                      <ChevronRight className="w-3 h-3 text-text-muted" />
                    )}
                  </button>

                  <AnimatePresence initial={false}>
                    {isCategoryOpen && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.15 }}
                        className="overflow-hidden pl-3 ml-2.5 border-l border-border-subtle"
                      >
                        <div className="py-1 space-y-0.5">
                          {visibleSubitems.map((item) => {
                            const fullPath = `/org/${orgId}/${item.path}`;
                            const isActive = location.pathname === fullPath;
                            return (
                              <Link
                                key={item.name}
                                to={fullPath}
                                className={`flex items-center justify-between px-3 py-1.5 text-xs rounded-lg transition-all ${
                                  isActive
                                    ? 'bg-brand-primary/10 text-brand-primary font-semibold'
                                    : 'text-text-secondary hover:text-text-primary hover:bg-vault-elevated/30'
                                }`}
                              >
                                <span className="truncate">{item.name}</span>
                                {item.adminOnly && (
                                  <ShieldCheck className="w-3 h-3 text-amber-500 ml-1 flex-shrink-0" />
                                )}
                              </Link>
                            );
                          })}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              );
            })}
          </nav>
        </div>
      </aside>

      {/* Main Workspace Content Area */}
      <main className="flex-1 min-w-0 overflow-y-auto">
        <Outlet />
      </main>
    </div>
  );
}
