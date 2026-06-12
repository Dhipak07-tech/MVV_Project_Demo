import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { Landmark, ShieldAlert, Cpu, Wifi, AlertCircle } from 'lucide-react';
import { useOrganization } from '../../hooks/useOrganizations';
import RecordLayout from '../records/RecordLayout';
import { clientContactApi } from '../../api/clientContactApi';

interface OnsiteData {
  organizationId: string;
  parkingInstructions: string;
  buildingAccess: string;
  serverRoomAccess: string;
  wifiInformation: string;
  keyLocations: string;
  notes: string;
  updatedAt?: string;
}

export default function OnsiteInfo() {
  const { orgId } = useParams<{ orgId: string }>();
  const { data: org, isLoading: isOrgLoading } = useOrganization(orgId);

  // States
  const [data, setData] = useState<OnsiteData | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // Form fields
  const [parkingInstructions, setParkingInstructions] = useState('');
  const [buildingAccess, setBuildingAccess] = useState('');
  const [serverRoomAccess, setServerRoomAccess] = useState('');
  const [wifiInformation, setWifiInformation] = useState('');
  const [keyLocations, setKeyLocations] = useState('');
  const [notes, setNotes] = useState('');

  const fetchOnsiteInfo = async () => {
    if (!orgId) return;
    setIsLoading(true);
    try {
      const result = await clientContactApi.onsite.get(orgId);
      setData(result);
    } catch (e) {
      console.error('Failed to load onsite information:', e);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchOnsiteInfo();
  }, [orgId]);

  // Sync form inputs when editing toggled or data loaded
  useEffect(() => {
    if (data) {
      setParkingInstructions(data.parkingInstructions || '');
      setBuildingAccess(data.buildingAccess || '');
      setServerRoomAccess(data.serverRoomAccess || '');
      setWifiInformation(data.wifiInformation || '');
      setKeyLocations(data.keyLocations || '');
      setNotes(data.notes || '');
    }
  }, [data, isEditing]);

  const handleSave = async () => {
    if (!orgId) return;
    const payload = {
      organizationId: orgId,
      parkingInstructions,
      buildingAccess,
      serverRoomAccess,
      wifiInformation,
      keyLocations,
      notes
    };

    try {
      const result = await clientContactApi.onsite.save(payload);
      setData(result);
      setIsEditing(false);
    } catch (e) {
      console.error('Failed to save onsite info:', e);
      alert('Failed to save onsite information.');
    }
  };

  if (isOrgLoading || isLoading) {
    return (
      <div className="p-8 space-y-6">
        <div className="h-8 w-64 bg-vault-elevated animate-pulse rounded-lg" />
        <div className="h-60 bg-vault-elevated animate-pulse rounded-xl" />
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
    <RecordLayout
      breadcrumbs={[org.name, 'Client Contact', 'Onsite Information']}
      title="Onsite Information"
      type="OnsiteInformation"
      organizationId={orgId || ''}
      entityId={orgId || 'onsite-info-id'}
      lastUpdated={data?.updatedAt}
      updatedBy="System Administrator"
      onEdit={() => setIsEditing(!isEditing)}
      onShareLink={() => {
        navigator.clipboard.writeText(window.location.href);
        alert('Copied link to clipboard!');
      }}
    >
      {isEditing ? (
        <div className="glass-panel p-6 space-y-5 text-xs">
          <h2 className="text-sm font-bold text-text-primary pb-2 border-b border-border-subtle flex items-center gap-2">
            <Landmark className="w-4.5 h-4.5 text-brand-primary" />
            Edit Onsite Information
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="text-[10px] text-text-muted font-bold uppercase block mb-1">Wifi Information</label>
              <input
                type="text"
                value={wifiInformation}
                onChange={(e) => setWifiInformation(e.target.value)}
                className="input-field py-2 px-3"
                placeholder="SSID: MMV_Guest, Pass:..."
              />
            </div>

            <div>
              <label className="text-[10px] text-text-muted font-bold uppercase block mb-1">Key Locations</label>
              <input
                type="text"
                value={keyLocations}
                onChange={(e) => setKeyLocations(e.target.value)}
                className="input-field py-2 px-3"
                placeholder="e.g. Master key in Safe #2"
              />
            </div>
          </div>

          <div>
            <label className="text-[10px] text-text-muted font-bold uppercase block mb-1">Parking Instructions</label>
            <textarea
              value={parkingInstructions}
              onChange={(e) => setParkingInstructions(e.target.value)}
              className="input-field h-24 leading-relaxed"
              placeholder="e.g. Visitors bays 10-18..."
            />
          </div>

          <div>
            <label className="text-[10px] text-text-muted font-bold uppercase block mb-1">Building Access Instructions</label>
            <textarea
              value={buildingAccess}
              onChange={(e) => setBuildingAccess(e.target.value)}
              className="input-field h-24 leading-relaxed"
              placeholder="Fob entry, registration rules..."
            />
          </div>

          <div>
            <label className="text-[10px] text-text-muted font-bold uppercase block mb-1">Server Room Access Instructions</label>
            <textarea
              value={serverRoomAccess}
              onChange={(e) => setServerRoomAccess(e.target.value)}
              className="input-field h-24 font-mono leading-relaxed"
              placeholder="Keys, dual authentication details..."
            />
          </div>

          <div>
            <label className="text-[10px] text-text-muted font-bold uppercase block mb-1">Additional Notes</label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="input-field h-24 leading-relaxed"
              placeholder="Other onsite specifications..."
            />
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <button
              onClick={() => setIsEditing(false)}
              className="btn-secondary py-2 px-4"
            >
              Cancel
            </button>
            <button
              onClick={handleSave}
              className="btn-primary py-2 px-4"
            >
              Save Changes
            </button>
          </div>
        </div>
      ) : (
        <div className="space-y-6">
          {/* Quick Details */}
          <div className="glass-panel p-6 space-y-4">
            <h2 className="text-sm font-bold text-text-primary pb-3 border-b border-border-subtle flex items-center gap-2">
              <Wifi className="w-4.5 h-4.5 text-brand-primary" />
              Wifi & Keys
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
              <div>
                <p className="text-text-muted font-bold uppercase text-[9px]">Wifi Information</p>
                <p className="font-semibold text-text-primary mt-1 font-mono">{data?.wifiInformation || 'Not Configured'}</p>
              </div>
              <div>
                <p className="text-text-muted font-bold uppercase text-[9px]">Key Locations</p>
                <p className="font-semibold text-text-primary mt-1">{data?.keyLocations || 'Not Configured'}</p>
              </div>
            </div>
          </div>

          {/* Parking */}
          {data?.parkingInstructions && (
            <div className="glass-panel p-6">
              <h2 className="text-sm font-bold text-text-primary pb-3 border-b border-border-subtle mb-3 flex items-center gap-2">
                <Landmark className="w-4.5 h-4.5 text-brand-secondary" />
                Parking Instructions
              </h2>
              <div className="bg-vault-elevated/20 p-4 rounded-xl border border-border-subtle text-xs whitespace-pre-wrap leading-relaxed text-text-secondary">
                {data.parkingInstructions}
              </div>
            </div>
          )}

          {/* Building Access */}
          {data?.buildingAccess && (
            <div className="glass-panel p-6">
              <h2 className="text-sm font-bold text-text-primary pb-3 border-b border-border-subtle mb-3 flex items-center gap-2">
                <ShieldAlert className="w-4.5 h-4.5 text-brand-accent" />
                Building Access
              </h2>
              <div className="bg-vault-elevated/20 p-4 rounded-xl border border-border-subtle text-xs whitespace-pre-wrap leading-relaxed text-text-secondary">
                {data.buildingAccess}
              </div>
            </div>
          )}

          {/* Server Room Access */}
          {data?.serverRoomAccess && (
            <div className="glass-panel p-6">
              <h2 className="text-sm font-bold text-text-primary pb-3 border-b border-border-subtle mb-3 flex items-center gap-2">
                <Cpu className="w-4.5 h-4.5 text-status-success" />
                Server Room Access
              </h2>
              <div className="bg-vault-elevated/20 p-4 rounded-xl border border-border-subtle font-mono text-xs whitespace-pre-wrap leading-relaxed text-text-secondary">
                {data.serverRoomAccess}
              </div>
            </div>
          )}

          {/* Notes */}
          {data?.notes && (
            <div className="glass-panel p-6">
              <h2 className="text-sm font-bold text-text-primary pb-3 border-b border-border-subtle mb-3">
                Additional Notes
              </h2>
              <div className="bg-vault-elevated/20 p-4 rounded-xl border border-border-subtle text-xs whitespace-pre-wrap leading-relaxed text-text-secondary">
                {data.notes}
              </div>
            </div>
          )}
        </div>
      )}
    </RecordLayout>
  );
}
