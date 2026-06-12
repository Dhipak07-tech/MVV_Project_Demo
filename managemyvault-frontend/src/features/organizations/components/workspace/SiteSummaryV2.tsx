import { useParams } from 'react-router-dom';
import { useOrganization } from '../../hooks/useOrganizations';
import { ShieldAlert, Sparkles, LayoutGrid, CheckCircle } from 'lucide-react';

export default function SiteSummaryV2() {
  const { orgId } = useParams<{ orgId: string }>();
  const { data: org, isLoading } = useOrganization(orgId);

  if (isLoading) {
    return (
      <div className="p-8 space-y-4 font-mono">
        <div className="h-6 w-40 bg-vault-elevated animate-pulse rounded" />
      </div>
    );
  }

  if (!org) {
    return (
      <div className="p-8 text-center text-text-secondary font-mono">
        Organization not found.
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6 bg-vault-base text-text-primary transition-colors duration-200">
      
      {/* Beta Header */}
      <div className="bg-brand-primary/10 border border-brand-primary/30 text-brand-primary p-4 rounded-xl flex items-start gap-3">
        <Sparkles className="w-5 h-5 mt-0.5 flex-shrink-0 text-amber-400" />
        <div>
          <h4 className="text-xs font-bold uppercase tracking-wider">Site Summary V2 Playground</h4>
          <p className="text-[11px] mt-1 leading-relaxed">
            Welcome to the design playground for the future documentation layout. This screen is only visible to administrative personnel.
          </p>
        </div>
      </div>

      <div className="glass-panel p-8 text-center max-w-lg mx-auto flex flex-col items-center">
        <LayoutGrid className="w-12 h-12 text-brand-primary mb-4" />
        <h2 className="text-base font-bold text-text-primary mb-2">Workspace V2 Grid System</h2>
        <p className="text-xs text-text-secondary leading-relaxed mb-6">
          This playground is active. We are testing full drag-and-drop support for organization summary widgets, live server ping metrics, and custom field extensions.
        </p>
        
        <div className="w-full bg-vault-elevated/40 border border-border-subtle rounded-xl p-4 text-left space-y-3.5">
          <div className="flex items-center gap-2 text-xs font-semibold text-text-primary">
            <CheckCircle className="w-4 h-4 text-status-success" />
            <span>Interactive sandbox enabled</span>
          </div>
          <div className="flex items-center gap-2 text-xs font-semibold text-text-primary">
            <CheckCircle className="w-4 h-4 text-status-success" />
            <span>Super Admin & Ultra Admin credentials verified</span>
          </div>
        </div>
      </div>
    </div>
  );
}
