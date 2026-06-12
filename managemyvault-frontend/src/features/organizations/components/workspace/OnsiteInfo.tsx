import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Landmark, ShieldAlert, Cpu, FileText, Save } from 'lucide-react';

interface OnsiteData {
  parking: string;
  officeAccess: string;
  serverRoomAccess: string;
  siteNotes: string;
}

const DEFAULT_DATA: OnsiteData = {
  parking: 'Visitor parking is located in the front lot (bays 10-18). Parking permits must be requested at the reception desk for visits exceeding 2 hours. Parking validation is not required.',
  officeAccess: 'Reception is open Monday to Friday, 8:00 AM - 5:00 PM. Visitors must sign in via the iPad registry and receive a color-coded temporary badge. Escort required in core spaces.',
  serverRoomAccess: 'The server room is located on Floor 2, Room 204. Access requires double authentication: 1. Swipe tech fob at Floor 2 hallway gate. 2. Lock box 204A next to the door (code is 9980) contains the physical master key. Rack key is located inside drawer A3.',
  siteNotes: 'Building operations manager is Miles Dyson. Emergency fire shutoff switch is located near the server room rear door. Power distribution units (PDUs) are managed via IP 10.0.1.15.',
};

export default function OnsiteInfo() {
  const { orgId } = useParams<{ orgId: string }>();
  const [data, setData] = useState<OnsiteData | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [saveStatus, setSaveStatus] = useState<string | null>(null);

  // Load from local storage
  useEffect(() => {
    const stored = localStorage.getItem(`mmv_onsite_info_${orgId}`);
    if (stored) {
      setData(JSON.parse(stored));
    } else {
      setData(DEFAULT_DATA);
      localStorage.setItem(`mmv_onsite_info_${orgId}`, JSON.stringify(DEFAULT_DATA));
    }
  }, [orgId]);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!data) return;

    localStorage.setItem(`mmv_onsite_info_${orgId}`, JSON.stringify(data));
    setIsEditing(false);
    setSaveStatus('Onsite data updated successfully!');
    setTimeout(() => setSaveStatus(null), 3000);
  };

  if (!data) return null;

  return (
    <div className="p-6 space-y-6 bg-vault-base text-text-primary transition-colors duration-200">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-border-subtle pb-5">
        <div>
          <span className="text-xs font-semibold text-brand-primary tracking-wider uppercase">
            Client Contact
          </span>
          <h1 className="text-2xl font-bold tracking-tight text-text-primary mt-1">
            Onsite Information
          </h1>
          <p className="text-sm text-text-secondary mt-0.5">
            Configure visitor parking, office access rules, and server room key locations.
          </p>
        </div>

        <div className="flex items-center gap-3">
          {saveStatus && (
            <span className="text-xs text-status-success font-semibold">{saveStatus}</span>
          )}
          {isEditing ? (
            <button onClick={handleSave} className="btn-primary flex items-center gap-1.5">
              <Save className="w-4 h-4" /> Save Onsite Info
            </button>
          ) : (
            <button onClick={() => setIsEditing(true)} className="btn-secondary">
              Edit Information
            </button>
          )}
        </div>
      </div>

      <form onSubmit={handleSave} className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Parking details */}
        <div className="glass-panel p-6 space-y-4">
          <h2 className="text-base font-bold text-text-primary flex items-center gap-2 pb-3 border-b border-border-subtle">
            <Landmark className="w-4.5 h-4.5 text-brand-primary" />
            Parking Instructions
          </h2>
          <div>
            <textarea
              disabled={!isEditing}
              value={data.parking}
              onChange={(e) => setData({ ...data, parking: e.target.value })}
              className="input-field h-36 resize-none disabled:opacity-75 disabled:cursor-not-allowed text-xs leading-relaxed"
            />
          </div>
        </div>

        {/* Office Access details */}
        <div className="glass-panel p-6 space-y-4">
          <h2 className="text-base font-bold text-text-primary flex items-center gap-2 pb-3 border-b border-border-subtle">
            <ShieldAlert className="w-4.5 h-4.5 text-brand-secondary" />
            Office Access Rules
          </h2>
          <div>
            <textarea
              disabled={!isEditing}
              value={data.officeAccess}
              onChange={(e) => setData({ ...data, officeAccess: e.target.value })}
              className="input-field h-36 resize-none disabled:opacity-75 disabled:cursor-not-allowed text-xs leading-relaxed"
            />
          </div>
        </div>

        {/* Server Room Access details */}
        <div className="glass-panel p-6 space-y-4">
          <h2 className="text-base font-bold text-text-primary flex items-center gap-2 pb-3 border-b border-border-subtle">
            <Cpu className="w-4.5 h-4.5 text-status-success" />
            Server Room Access
          </h2>
          <div>
            <textarea
              disabled={!isEditing}
              value={data.serverRoomAccess}
              onChange={(e) => setData({ ...data, serverRoomAccess: e.target.value })}
              className="input-field h-36 resize-none disabled:opacity-75 disabled:cursor-not-allowed text-xs leading-relaxed font-mono"
            />
          </div>
        </div>

        {/* Site Notes details */}
        <div className="glass-panel p-6 space-y-4">
          <h2 className="text-base font-bold text-text-primary flex items-center gap-2 pb-3 border-b border-border-subtle">
            <FileText className="w-4.5 h-4.5 text-brand-accent" />
            General Site Notes
          </h2>
          <div>
            <textarea
              disabled={!isEditing}
              value={data.siteNotes}
              onChange={(e) => setData({ ...data, siteNotes: e.target.value })}
              className="input-field h-36 resize-none disabled:opacity-75 disabled:cursor-not-allowed text-xs leading-relaxed"
            />
          </div>
        </div>

      </form>
    </div>
  );
}
