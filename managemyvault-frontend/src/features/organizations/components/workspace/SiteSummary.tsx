import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  Building2, Users, MapPin, Database, FileText, CheckCircle,
  AlertCircle, Edit2, Save, ExternalLink
} from 'lucide-react';
import { useOrganization } from '../../hooks/useOrganizations';

interface Contact {
  id: string;
  name: string;
  title: string;
  email: string;
  phone: string;
  type: string;
  status: string;
}

interface LocationItem {
  id: string;
  name: string;
  address: string;
  city: string;
  state: string;
  type: string;
}

interface CriticalSystem {
  id: string;
  name: string;
  type: string;
  status: 'Online' | 'Offline' | 'Maintenance';
  description: string;
}

const DEFAULT_SYSTEMS: CriticalSystem[] = [
  { id: '1', name: 'Primary Domain Controller', type: 'Active Directory', status: 'Online', description: 'Windows Server 2022 handling identity management.' },
  { id: '2', name: 'Cloud Email Cluster', type: 'Email', status: 'Online', description: 'Microsoft 365 Tenant Exchange Integration.' },
  { id: '3', name: 'HQ Border Firewall', type: 'Security Services', status: 'Online', description: 'Palo Alto Networks Next-Gen border security.' },
];

export default function SiteSummary() {
  const { orgId } = useParams<{ orgId: string }>();
  const { data: org, isLoading } = useOrganization(orgId);

  // States
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [locations, setLocations] = useState<LocationItem[]>([]);
  const [systems, setSystems] = useState<CriticalSystem[]>([]);
  const [notes, setNotes] = useState('');
  const [isEditingNotes, setIsEditingNotes] = useState(false);

  // Load data
  useEffect(() => {
    // Contacts
    const storedContacts = localStorage.getItem(`mmv_contacts_${orgId}`);
    if (storedContacts) {
      setContacts(JSON.parse(storedContacts));
    }

    // Locations
    const storedLocs = localStorage.getItem(`mmv_locations_${orgId}`);
    if (storedLocs) {
      setLocations(JSON.parse(storedLocs));
    }

    // Critical Systems
    const storedSys = localStorage.getItem(`mmv_site_summary_systems_${orgId}`);
    if (storedSys) {
      setSystems(JSON.parse(storedSys));
    } else {
      setSystems(DEFAULT_SYSTEMS);
      localStorage.setItem(`mmv_site_summary_systems_${orgId}`, JSON.stringify(DEFAULT_SYSTEMS));
    }

    // Org Notes
    const storedNotes = localStorage.getItem(`mmv_notes_${orgId}`);
    if (storedNotes) {
      setNotes(storedNotes);
    } else {
      setNotes('No organization summary notes have been created yet. Click edit to compile office instructions, vendor contact rules, or escalation schedules.');
    }
  }, [orgId]);

  const handleSaveNotes = () => {
    localStorage.setItem(`mmv_notes_${orgId}`, notes);
    setIsEditingNotes(false);
  };

  const primaryContacts = contacts.filter((c) => c.type === 'Primary' || c.type === 'Technical');
  const primaryLocations = locations.filter((l) => l.type === 'HQ' || l.type === 'Data Center');

  if (isLoading) {
    return (
      <div className="p-8 space-y-6">
        <div className="h-8 w-64 bg-vault-elevated animate-pulse rounded-lg" />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="h-60 bg-vault-elevated animate-pulse rounded-xl" />
          <div className="h-60 bg-vault-elevated animate-pulse rounded-xl" />
        </div>
      </div>
    );
  }

  if (!org) {
    return (
      <div className="p-8 text-center text-text-secondary">
        <AlertCircle className="w-12 h-12 mx-auto text-status-warning mb-4" />
        <p className="text-lg font-medium">Organization not found</p>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6 bg-vault-base text-text-primary transition-colors duration-200">
      {/* Header */}
      <div className="border-b border-border-subtle pb-5">
        <span className="text-xs font-semibold text-brand-primary tracking-wider uppercase">
          Client Contact
        </span>
        <h1 className="text-2xl font-bold tracking-tight text-text-primary mt-1">
          Site Summary
        </h1>
        <p className="text-sm text-text-secondary mt-0.5">
          Master documentation and overview sheet for {org.name}.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left Column: Company details + Critical systems */}
        <div className="lg:col-span-2 space-y-6">
          
          {/* Company Details */}
          <div className="glass-panel p-6 space-y-4">
            <h2 className="text-base font-bold text-text-primary flex items-center gap-2 pb-3 border-b border-border-subtle">
              <Building2 className="w-4.5 h-4.5 text-brand-primary" />
              Company Details
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
              <div>
                <p className="text-text-muted font-semibold uppercase tracking-wider">Company Name</p>
                <p className="text-sm text-text-primary mt-1 font-semibold">{org.name}</p>
              </div>
              <div>
                <p className="text-text-muted font-semibold uppercase tracking-wider">Industry</p>
                <p className="text-sm text-text-primary mt-1 font-semibold">{org.industry || 'N/A'}</p>
              </div>
              <div>
                <p className="text-text-muted font-semibold uppercase tracking-wider">Domain / Website</p>
                <a
                  href={`https://${org.slug}.com`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm text-brand-primary hover:underline mt-1 font-semibold flex items-center gap-1"
                >
                  {org.slug}.com
                  <ExternalLink className="w-3 h-3" />
                </a>
              </div>
              <div>
                <p className="text-text-muted font-semibold uppercase tracking-wider">Status</p>
                <span className="badge badge-success text-[10px] uppercase font-bold mt-1.5 inline-block">
                  {org.status}
                </span>
              </div>
            </div>
            <div className="text-xs pt-2">
              <p className="text-text-muted font-semibold uppercase tracking-wider">Description</p>
              <p className="text-text-secondary mt-1 leading-relaxed">
                {org.description || 'No company description has been added yet.'}
              </p>
            </div>
          </div>

          {/* Critical Systems */}
          <div className="glass-panel p-6">
            <h2 className="text-base font-bold text-text-primary flex items-center gap-2 pb-3 border-b border-border-subtle mb-4">
              <Database className="w-4.5 h-4.5 text-brand-secondary" />
              Critical Systems
            </h2>
            <div className="space-y-3">
              {systems.map((sys) => (
                <div key={sys.id} className="flex items-start justify-between p-3.5 rounded-xl bg-vault-elevated/40 border border-border-subtle">
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="text-xs font-bold text-text-primary">{sys.name}</h3>
                      <span className="text-[9px] px-2 py-0.5 bg-vault-base rounded-full border border-border-subtle text-text-secondary">
                        {sys.type}
                      </span>
                    </div>
                    <p className="text-xs text-text-secondary mt-1">{sys.description}</p>
                  </div>
                  <span className="badge badge-success text-[9px] uppercase font-bold">
                    {sys.status}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right Column: Primary contacts & Locations */}
        <div className="space-y-6">
          
          {/* Primary Contacts */}
          <div className="glass-panel p-6">
            <h2 className="text-base font-bold text-text-primary flex items-center gap-2 pb-3 border-b border-border-subtle mb-4">
              <Users className="w-4.5 h-4.5 text-status-success" />
              Primary Contacts
            </h2>
            {primaryContacts.length > 0 ? (
              <div className="space-y-3.5">
                {primaryContacts.map((c) => (
                  <div key={c.id} className="text-xs">
                    <p className="font-bold text-text-primary">{c.name}</p>
                    <p className="text-text-muted text-[10px] mt-0.5">{c.title} ({c.type})</p>
                    <p className="text-text-secondary mt-1 font-mono">{c.email}</p>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-xs text-text-muted">No primary contacts configured.</p>
            )}
          </div>

          {/* Primary Locations */}
          <div className="glass-panel p-6">
            <h2 className="text-base font-bold text-text-primary flex items-center gap-2 pb-3 border-b border-border-subtle mb-4">
              <MapPin className="w-4.5 h-4.5 text-status-warning" />
              Primary Sites
            </h2>
            {primaryLocations.length > 0 ? (
              <div className="space-y-3.5">
                {primaryLocations.map((l) => (
                  <div key={l.id} className="text-xs">
                    <p className="font-bold text-text-primary">{l.name}</p>
                    <p className="text-text-secondary mt-1">{l.address}</p>
                    <p className="text-text-muted text-[10px] mt-0.5">{l.city}, {l.state}</p>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-xs text-text-muted">No primary sites configured.</p>
            )}
          </div>

        </div>
      </div>

      {/* Row: Organization Notes */}
      <div className="glass-panel p-6">
        <div className="flex justify-between items-center pb-3 border-b border-border-subtle mb-4">
          <h2 className="text-base font-bold text-text-primary flex items-center gap-2">
            <FileText className="w-4.5 h-4.5 text-brand-accent" />
            General Site & Onsite Notes
          </h2>
          {isEditingNotes ? (
            <button onClick={handleSaveNotes} className="btn-primary py-1 px-3 text-xs flex items-center gap-1.5">
              <Save className="w-3.5 h-3.5" /> Save Notes
            </button>
          ) : (
            <button onClick={() => setIsEditingNotes(true)} className="btn-secondary py-1 px-3 text-xs flex items-center gap-1.5">
              <Edit2 className="w-3.5 h-3.5" /> Edit Notes
            </button>
          )}
        </div>

        {isEditingNotes ? (
          <textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            className="input-field h-40 font-mono text-xs leading-relaxed"
          />
        ) : (
          <div className="bg-vault-elevated/30 p-4 rounded-xl border border-border-subtle">
            <p className="text-xs text-text-secondary leading-relaxed whitespace-pre-wrap font-mono">
              {notes}
            </p>
          </div>
        )}
      </div>

    </div>
  );
}
