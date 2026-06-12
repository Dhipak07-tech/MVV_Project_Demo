import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Shield, Phone, Key, AlertOctagon, Save, UserPlus, Trash2 } from 'lucide-react';

interface EscalationContact {
  tier: string;
  name: string;
  phone: string;
  role: string;
}

interface AfterHoursData {
  alarmProvider: string;
  alarmCode: string;
  bypassInstructions: string;
  accessProcedures: string;
  escalationPaths: EscalationContact[];
}

const DEFAULT_DATA: AfterHoursData = {
  alarmProvider: 'ADT Security Services',
  alarmCode: '4930#',
  bypassInstructions: 'Press Bypass + Zone Number (e.g. 04 for main server room) + Security Code + End.',
  accessProcedures: 'Swipe key fob at street entrance. Keypad on Server room door requires code 9931. Lock box in rear exit hallway code is 2026.',
  escalationPaths: [
    { tier: 'Tier 1 Support', name: 'John Connor', phone: '+1 (555) 0199', role: 'IT Support Team Lead' },
    { tier: 'Tier 2 SysAdmin', name: 'Miles Dyson', phone: '+1 (555) 0150', role: 'Lead Architect' },
    { tier: 'Tier 3 executive Escalation', name: 'Sarah Connor', phone: '+1 (555) 0180', role: 'Director of Ops' },
  ],
};

export default function AfterHours() {
  const { orgId } = useParams<{ orgId: string }>();
  const [data, setData] = useState<AfterHoursData | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [saveStatus, setSaveStatus] = useState<string | null>(null);

  // Load from local storage
  useEffect(() => {
    const stored = localStorage.getItem(`mmv_after_hours_${orgId}`);
    if (stored) {
      setData(JSON.parse(stored));
    } else {
      setData(DEFAULT_DATA);
      localStorage.setItem(`mmv_after_hours_${orgId}`, JSON.stringify(DEFAULT_DATA));
    }
  }, [orgId]);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!data) return;

    localStorage.setItem(`mmv_after_hours_${orgId}`, JSON.stringify(data));
    setIsEditing(false);
    setSaveStatus('Settings updated successfully!');
    setTimeout(() => setSaveStatus(null), 3000);
  };

  const handleAddEscalation = () => {
    if (!data) return;
    const newItem: EscalationContact = {
      tier: `Tier ${data.escalationPaths.length + 1}`,
      name: '',
      phone: '',
      role: '',
    };
    setData({
      ...data,
      escalationPaths: [...data.escalationPaths, newItem],
    });
  };

  const handleRemoveEscalation = (index: number) => {
    if (!data) return;
    const updated = data.escalationPaths.filter((_, i) => i !== index);
    setData({ ...data, escalationPaths: updated });
  };

  const handleEscalationChange = (index: number, field: keyof EscalationContact, val: string) => {
    if (!data) return;
    const updated = data.escalationPaths.map((item, i) =>
      i === index ? { ...item, [field]: val } : item
    );
    setData({ ...data, escalationPaths: updated });
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
            After Hours & Access Info
          </h1>
          <p className="text-sm text-text-secondary mt-0.5">
            Manage alarm codes, access procedures, and night/weekend escalation lists.
          </p>
        </div>

        <div className="flex items-center gap-3">
          {saveStatus && (
            <span className="text-xs text-status-success font-semibold">{saveStatus}</span>
          )}
          {isEditing ? (
            <button onClick={handleSave} className="btn-primary flex items-center gap-1.5">
              <Save className="w-4 h-4" /> Save Access Data
            </button>
          ) : (
            <button onClick={() => setIsEditing(true)} className="btn-secondary">
              Edit Information
            </button>
          )}
        </div>
      </div>

      <form onSubmit={handleSave} className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left Column: Alarm Codes & Building Access */}
        <div className="lg:col-span-2 space-y-6">
          
          {/* Alarm Codes */}
          <div className="glass-panel p-6 space-y-4">
            <h2 className="text-base font-bold text-text-primary flex items-center gap-2 pb-3 border-b border-border-subtle">
              <Key className="w-4.5 h-4.5 text-brand-primary" />
              Alarm Codes
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="text-[11px] font-bold uppercase text-text-muted mb-1 block">Alarm Provider</label>
                <input
                  type="text"
                  disabled={!isEditing}
                  value={data.alarmProvider}
                  onChange={(e) => setData({ ...data, alarmProvider: e.target.value })}
                  className="input-field disabled:opacity-75 disabled:cursor-not-allowed"
                />
              </div>

              <div>
                <label className="text-[11px] font-bold uppercase text-text-muted mb-1 block">Keypad Code / Bypass Key</label>
                <input
                  type="text"
                  disabled={!isEditing}
                  value={data.alarmCode}
                  onChange={(e) => setData({ ...data, alarmCode: e.target.value })}
                  className="input-field disabled:opacity-75 disabled:cursor-not-allowed font-mono"
                />
              </div>
            </div>

            <div>
              <label className="text-[11px] font-bold uppercase text-text-muted mb-1 block">Zone Bypass Instructions</label>
              <textarea
                disabled={!isEditing}
                value={data.bypassInstructions}
                onChange={(e) => setData({ ...data, bypassInstructions: e.target.value })}
                className="input-field h-24 resize-none disabled:opacity-75 disabled:cursor-not-allowed"
              />
            </div>
          </div>

          {/* Building Access Procedures */}
          <div className="glass-panel p-6 space-y-4">
            <h2 className="text-base font-bold text-text-primary flex items-center gap-2 pb-3 border-b border-border-subtle">
              <Shield className="w-4.5 h-4.5 text-brand-secondary" />
              Building Access Procedures
            </h2>
            <div>
              <label className="text-[11px] font-bold uppercase text-text-muted mb-1 block">Lockup & Entry Instructions</label>
              <textarea
                disabled={!isEditing}
                value={data.accessProcedures}
                onChange={(e) => setData({ ...data, accessProcedures: e.target.value })}
                className="input-field h-40 resize-none disabled:opacity-75 disabled:cursor-not-allowed"
              />
            </div>
          </div>
        </div>

        {/* Right Column: Escalation Paths */}
        <div className="glass-panel p-6 space-y-4">
          <div className="flex justify-between items-center pb-3 border-b border-border-subtle">
            <h2 className="text-base font-bold text-text-primary flex items-center gap-2">
              <Phone className="w-4.5 h-4.5 text-status-success" />
              Escalation Path
            </h2>
            {isEditing && (
              <button
                type="button"
                onClick={handleAddEscalation}
                className="p-1 rounded bg-brand-primary/10 text-brand-primary hover:bg-brand-primary/20 transition-colors"
              >
                <UserPlus className="w-4 h-4" />
              </button>
            )}
          </div>

          <div className="space-y-4">
            {data.escalationPaths.map((c, i) => (
              <div key={i} className="p-3.5 rounded-xl bg-vault-elevated/40 border border-border-subtle relative space-y-2">
                {isEditing && (
                  <button
                    type="button"
                    onClick={() => handleRemoveEscalation(i)}
                    className="absolute top-2 right-2 text-text-muted hover:text-status-danger transition-colors"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                )}

                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="text-[9px] font-bold uppercase text-text-muted block">Tier</label>
                    <input
                      type="text"
                      disabled={!isEditing}
                      value={c.tier}
                      onChange={(e) => handleEscalationChange(i, 'tier', e.target.value)}
                      className="bg-transparent border-none p-0 text-xs font-semibold text-text-primary focus:ring-0 w-full"
                    />
                  </div>
                  <div>
                    <label className="text-[9px] font-bold uppercase text-text-muted block">Name</label>
                    <input
                      type="text"
                      disabled={!isEditing}
                      placeholder="Name"
                      value={c.name}
                      onChange={(e) => handleEscalationChange(i, 'name', e.target.value)}
                      className="bg-transparent border-none p-0 text-xs text-text-primary focus:ring-0 w-full"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2 pt-1.5 border-t border-border-subtle/50">
                  <div>
                    <label className="text-[9px] font-bold uppercase text-text-muted block">Phone</label>
                    <input
                      type="text"
                      disabled={!isEditing}
                      placeholder="Phone"
                      value={c.phone}
                      onChange={(e) => handleEscalationChange(i, 'phone', e.target.value)}
                      className="bg-transparent border-none p-0 text-xs text-text-primary focus:ring-0 w-full font-mono"
                    />
                  </div>
                  <div>
                    <label className="text-[9px] font-bold uppercase text-text-muted block">Role</label>
                    <input
                      type="text"
                      disabled={!isEditing}
                      placeholder="Role"
                      value={c.role}
                      onChange={(e) => handleEscalationChange(i, 'role', e.target.value)}
                      className="bg-transparent border-none p-0 text-xs text-text-secondary focus:ring-0 w-full"
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

      </form>
    </div>
  );
}
