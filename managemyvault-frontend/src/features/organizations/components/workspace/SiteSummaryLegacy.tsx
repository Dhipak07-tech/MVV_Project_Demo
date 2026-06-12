import { useParams } from 'react-router-dom';
import { useOrganization } from '../../hooks/useOrganizations';
import { Printer, ShieldAlert } from 'lucide-react';

export default function SiteSummaryLegacy() {
  const { orgId } = useParams<{ orgId: string }>();
  const { data: org, isLoading } = useOrganization(orgId);

  if (isLoading) {
    return (
      <div className="p-8 space-y-4 font-mono">
        <div className="h-6 w-40 bg-vault-elevated animate-pulse rounded" />
        <div className="h-40 bg-vault-elevated animate-pulse rounded" />
      </div>
    );
  }

  if (!org) {
    return (
      <div className="p-8 text-center text-text-secondary font-mono">
        [ERROR] Organization not found.
      </div>
    );
  }

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="p-6 space-y-6 max-w-4xl mx-auto bg-vault-base text-text-primary transition-colors duration-200">
      
      {/* Historical Alert */}
      <div className="bg-amber-500/10 border border-amber-500/30 text-amber-500 p-4 rounded-lg flex items-start gap-3">
        <ShieldAlert className="w-5 h-5 mt-0.5 flex-shrink-0" />
        <div>
          <h4 className="text-xs font-bold uppercase tracking-wider font-mono">LEGACY READ-ONLY RECORD</h4>
          <p className="text-[11px] mt-1 leading-relaxed font-mono">
            This sheet contains archived documentation. Fields cannot be updated from this interface. Refer to active Site Summary for live parameters.
          </p>
        </div>
      </div>

      {/* Legacy Print Wrapper */}
      <div className="bg-vault-card border border-border-default rounded-xl p-8 shadow-sm font-mono relative">
        
        {/* Vintage Header */}
        <div className="flex justify-between items-start border-b-2 border-border-default pb-6 mb-6">
          <div>
            <h1 className="text-lg font-bold text-text-primary tracking-widest uppercase">
              SYSTEM CONFIGURATION SHEET
            </h1>
            <p className="text-[11px] text-text-muted mt-1 uppercase">
              DOCUMENT REFERENCE: MMV-LEGACY-00{org.slug.length}
            </p>
          </div>
          <button
            onClick={handlePrint}
            className="btn-secondary py-1 px-2.5 text-[11px] flex items-center gap-1.5"
          >
            <Printer className="w-3.5 h-3.5" /> PRINT RECORD
          </button>
        </div>

        {/* Vintage Tabular Grid */}
        <div className="space-y-6 text-xs">
          
          {/* Section 1: Org Identification */}
          <div>
            <h3 className="text-xs font-bold text-brand-primary uppercase tracking-wider border-b border-border-subtle pb-1 mb-3">
              I. ORGANIZATION IDENTIFICATION
            </h3>
            <table className="w-full border-collapse">
              <tbody>
                <tr className="border-b border-border-subtle">
                  <td className="py-2 font-bold text-text-muted w-1/3">ORGANIZATION NAME:</td>
                  <td className="py-2 text-text-primary font-semibold">{org.name}</td>
                </tr>
                <tr className="border-b border-border-subtle">
                  <td className="py-2 font-bold text-text-muted">SLUG IDENTIFIER:</td>
                  <td className="py-2 text-text-primary font-mono">{org.slug}</td>
                </tr>
                <tr className="border-b border-border-subtle">
                  <td className="py-2 font-bold text-text-muted">STATUS STATUS:</td>
                  <td className="py-2 text-text-primary">{org.status}</td>
                </tr>
                <tr>
                  <td className="py-2 font-bold text-text-muted">RECORD CREATION DATE:</td>
                  <td className="py-2 text-text-primary">{new Date(org.createdAt).toLocaleString()}</td>
                </tr>
              </tbody>
            </table>
          </div>

          {/* Section 2: Legacy Note Archives */}
          <div>
            <h3 className="text-xs font-bold text-brand-primary uppercase tracking-wider border-b border-border-subtle pb-1 mb-3">
              II. RECORD ARCHIVES
            </h3>
            <div className="p-4 bg-vault-elevated/40 border border-border-subtle rounded text-text-secondary leading-relaxed">
              <p className="text-[11px]">
                {org.description || 'No legacy notes are archived for this organization.'}
              </p>
            </div>
          </div>

          {/* Section 3: System Sign-off */}
          <div className="pt-6 border-t border-border-subtle grid grid-cols-2 gap-4 text-[10px] text-text-muted">
            <div>
              <p>VERIFIED BY: SECURITY COMPLIANCE OFFICE</p>
              <p className="mt-1">SIGN-OFF CODE: SEC-CO-OK</p>
            </div>
            <div className="text-right">
              <p>MANAGE MY VAULT © 2026</p>
              <p className="mt-1">SECURE PORTAL VERSION 4.1</p>
            </div>
          </div>

        </div>

      </div>
    </div>
  );
}
