import { useLocation, Link, useParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowLeft, Construction, Clock, Sparkles } from 'lucide-react';

interface SprintInfo {
  name: string;
  sprint: string;
  description: string;
}

const ROUTE_SPRINTS: Record<string, SprintInfo> = {
  'site-summary': { name: 'Site Summary', sprint: 'Sprint 2', description: 'Comprehensive site documentation and primary contacts layout.' },
  'site-summary-legacy': { name: 'Site Summary (Legacy)', sprint: 'Legacy View', description: 'Read-only archival documentation views.' },
  'after-hours': { name: 'After Hours Info', sprint: 'Sprint 2', description: 'Emergency procedures, alarm codes, and building access documentation.' },
  'onsite-information': { name: 'Onsite Information', sprint: 'Sprint 2', description: 'Office access, server room configurations, and local site guides.' },
  'locations': { name: 'Locations Tracker', sprint: 'Sprint 2', description: 'HQ, branches, and regional data center mapping.' },
  'contacts': { name: 'Contacts Directory', sprint: 'Sprint 2', description: 'Global organization-scoped address book and contacts management.' },
  'passwords': { name: 'Password Vault', sprint: 'Sprint 8', description: 'AES-256 encrypted password management engine with OTP integrations.' },
  'testing/site-summary-v2': { name: 'Site Summary V2 Playground', sprint: 'Super Admin Beta', description: 'Future design prototype dashboard.' },
};

export default function ComingSoon() {
  const { orgId } = useParams();
  const location = useLocation();
  const path = location.pathname.replace(`/org/${orgId}/`, '');

  // Determine sprint info based on current path
  let info = ROUTE_SPRINTS[path];

  if (!info) {
    if (path.startsWith('assets/')) {
      info = { name: 'Asset Engine Configuration', sprint: 'Sprint 4', description: 'Hardware assets, laptops, servers, and virtualization quick views.' };
    } else if (path.startsWith('networking/')) {
      info = { name: 'Networking Assets', sprint: 'Sprint 4', description: 'LAN, MPLS, WAN, VPN, and wireless setups documentation.' };
    } else if (path.startsWith('apps/')) {
      info = { name: 'Applications Module', sprint: 'Future Phase', description: 'Active Directory, licensing, email, PBX, and vendor directories.' };
    } else if (path.startsWith('backups/')) {
      info = { name: 'Backup Solutions', sprint: 'Future Backup Domain', description: 'Veeam backups, client backups, and MSP backup validation.' };
    } else if (path.startsWith('docs/')) {
      info = { name: 'Core Documentation Center', sprint: 'Sprint 5', description: 'F12 standard exceptions, RFC forms, change logs, and document templates.' };
    } else {
      info = { name: 'Enterprise Module', sprint: 'Future Phase', description: 'Advanced SaaS integration features.' };
    }
  }

  return (
    <div className="min-h-[75vh] flex items-center justify-center p-6 bg-vault-base transition-colors duration-200">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.4 }}
        className="max-w-md w-full text-center relative"
      >
        {/* Glow circles */}
        <div className="absolute -inset-1 bg-gradient-to-r from-brand-primary to-brand-accent rounded-2xl blur-lg opacity-25 group-hover:opacity-100 transition duration-1000 group-hover:duration-200 animate-tilt"></div>

        <div className="relative glass-panel p-8 flex flex-col items-center">
          <div className="w-16 h-16 rounded-2xl bg-brand-primary/10 flex items-center justify-center mb-6">
            <Construction className="w-8 h-8 text-brand-primary animate-pulse" />
          </div>

          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-brand-accent/10 text-brand-accent mb-4 border border-brand-accent/20">
            <Clock className="w-3.5 h-3.5" />
            Planned for {info.sprint}
          </span>

          <h1 className="text-2xl font-bold text-text-primary mb-2">
            {info.name}
          </h1>

          <p className="text-sm text-text-secondary mb-6 leading-relaxed max-w-sm">
            {info.description}
          </p>

          <div className="w-full border-t border-border-subtle pt-6 flex flex-col gap-3">
            <div className="flex items-center justify-center gap-2 text-xs text-text-muted">
              <Sparkles className="w-3.5 h-3.5 text-amber-400" />
              <span>Part of the ManageMyVault SaaS Roadmap</span>
            </div>

            <Link
              to={`/org/${orgId}/home`}
              className="btn-primary w-full mt-2"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Return to Workspace Home
            </Link>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
