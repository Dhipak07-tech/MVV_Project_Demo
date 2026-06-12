import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import axios from 'axios';
import { Shield, Phone, Key, HelpCircle, AlertCircle } from 'lucide-react';
import { useOrganization } from '../../hooks/useOrganizations';
import RecordLayout from '../records/RecordLayout';
import { API_URL } from '../../../../config/constants';

interface AfterHoursData {
  organizationId: string;
  alarmCodes: string;
  afterHoursProcedure: string;
  emergencyPhone: string;
  escalationProcedure: string;
  securityVendor: string;
  notes: string;
  updatedAt?: string;
}

export default function AfterHours() {
  const { orgId } = useParams<{ orgId: string }>();
  const { data: org, isLoading: isOrgLoading } = useOrganization(orgId);

  // States
  const [data, setData] = useState<AfterHoursData | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // Form fields
  const [alarmCodes, setAlarmCodes] = useState('');
  const [afterHoursProcedure, setAfterHoursProcedure] = useState('');
  const [emergencyPhone, setEmergencyPhone] = useState('');
  const [escalationProcedure, setEscalationProcedure] = useState('');
  const [securityVendor, setSecurityVendor] = useState('');
  const [notes, setNotes] = useState('');

  const token = localStorage.getItem('accessToken');
  const headers = { Authorization: `Bearer ${token}` };

  const fetchAfterHours = async () => {
    if (!orgId) return;
    setIsLoading(true);
    try {
      const response = await axios.get(`${API_URL}/after-hours`, {
        params: { organizationId: orgId },
        headers
      });
      setData(response.data);
    } catch (e) {
      console.error('Failed to load after hours information:', e);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchAfterHours();
  }, [orgId]);

  // Sync form inputs when editing toggled or data loaded
  useEffect(() => {
    if (data) {
      setAlarmCodes(data.alarmCodes || '');
      setAfterHoursProcedure(data.afterHoursProcedure || '');
      setEmergencyPhone(data.emergencyPhone || '');
      setEscalationProcedure(data.escalationProcedure || '');
      setSecurityVendor(data.securityVendor || '');
      setNotes(data.notes || '');
    }
  }, [data, isEditing]);

  const handleSave = async () => {
    if (!orgId) return;
    const payload = {
      organizationId: orgId,
      alarmCodes,
      afterHoursProcedure,
      emergencyPhone,
      escalationProcedure,
      securityVendor,
      notes
    };

    try {
      const response = await axios.post(`${API_URL}/after-hours`, payload, { headers });
      setData(response.data);
      setIsEditing(false);
    } catch (e) {
      console.error('Failed to save after hours info:', e);
      alert('Failed to save after hours information.');
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
      breadcrumbs={[org.name, 'Client Contact', 'After Hours Information']}
      title="After Hours & Access Info"
      type="AfterHoursInformation"
      organizationId={orgId || ''}
      entityId={orgId || 'after-hours-id'}
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
            <Shield className="w-4.5 h-4.5 text-brand-primary" />
            Edit After Hours Info
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="text-[10px] text-text-muted font-bold uppercase block mb-1">Security Vendor</label>
              <input
                type="text"
                value={securityVendor}
                onChange={(e) => setSecurityVendor(e.target.value)}
                className="input-field py-2 px-3"
                placeholder="e.g. ADT Services"
              />
            </div>

            <div>
              <label className="text-[10px] text-text-muted font-bold uppercase block mb-1">Emergency Phone</label>
              <input
                type="text"
                value={emergencyPhone}
                onChange={(e) => setEmergencyPhone(e.target.value)}
                className="input-field py-2 px-3"
                placeholder="e.g. +1 (555) 0199"
              />
            </div>
          </div>

          <div>
            <label className="text-[10px] text-text-muted font-bold uppercase block mb-1">Alarm Codes & Instructions</label>
            <textarea
              value={alarmCodes}
              onChange={(e) => setAlarmCodes(e.target.value)}
              className="input-field h-24 font-mono leading-relaxed"
              placeholder="e.g. Keypad pin 4930#, Bypass Zone 4..."
            />
          </div>

          <div>
            <label className="text-[10px] text-text-muted font-bold uppercase block mb-1">After Hours Access Procedure</label>
            <textarea
              value={afterHoursProcedure}
              onChange={(e) => setAfterHoursProcedure(e.target.value)}
              className="input-field h-28 leading-relaxed"
              placeholder="Step by step access guide..."
            />
          </div>

          <div>
            <label className="text-[10px] text-text-muted font-bold uppercase block mb-1">Escalation Procedure</label>
            <textarea
              value={escalationProcedure}
              onChange={(e) => setEscalationProcedure(e.target.value)}
              className="input-field h-28 leading-relaxed"
              placeholder="Who to escalate to if onsite contact fails..."
            />
          </div>

          <div>
            <label className="text-[10px] text-text-muted font-bold uppercase block mb-1">Additional Notes</label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="input-field h-24 leading-relaxed"
              placeholder="Other instructions..."
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
          {/* Vendor Details */}
          <div className="glass-panel p-6 space-y-4">
            <h2 className="text-sm font-bold text-text-primary pb-3 border-b border-border-subtle flex items-center gap-2">
              <Shield className="w-4.5 h-4.5 text-brand-primary" />
              Security & Vendor Details
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
              <div>
                <p className="text-text-muted font-bold uppercase text-[9px]">Security Vendor</p>
                <p className="font-semibold text-text-primary mt-1">{data?.securityVendor || 'Not Configured'}</p>
              </div>
              <div>
                <p className="text-text-muted font-bold uppercase text-[9px]">Emergency Contact Phone</p>
                <p className="font-semibold text-text-primary mt-1 font-mono">{data?.emergencyPhone || 'Not Configured'}</p>
              </div>
            </div>
          </div>

          {/* Alarm Codes */}
          {data?.alarmCodes && (
            <div className="glass-panel p-6">
              <h2 className="text-sm font-bold text-text-primary pb-3 border-b border-border-subtle mb-3 flex items-center gap-2">
                <Key className="w-4.5 h-4.5 text-brand-secondary" />
                Alarm & Bypass Codes
              </h2>
              <div className="bg-vault-elevated/20 p-4 rounded-xl border border-border-subtle font-mono text-xs whitespace-pre-wrap leading-relaxed text-text-secondary">
                {data.alarmCodes}
              </div>
            </div>
          )}

          {/* Access Procedure */}
          {data?.afterHoursProcedure && (
            <div className="glass-panel p-6">
              <h2 className="text-sm font-bold text-text-primary pb-3 border-b border-border-subtle mb-3 flex items-center gap-2">
                <HelpCircle className="w-4.5 h-4.5 text-brand-accent" />
                Access Procedure
              </h2>
              <div className="bg-vault-elevated/20 p-4 rounded-xl border border-border-subtle text-xs whitespace-pre-wrap leading-relaxed text-text-secondary">
                {data.afterHoursProcedure}
              </div>
            </div>
          )}

          {/* Escalation Procedure */}
          {data?.escalationProcedure && (
            <div className="glass-panel p-6">
              <h2 className="text-sm font-bold text-text-primary pb-3 border-b border-border-subtle mb-3 flex items-center gap-2">
                <Phone className="w-4.5 h-4.5 text-status-success" />
                Escalation Procedure
              </h2>
              <div className="bg-vault-elevated/20 p-4 rounded-xl border border-border-subtle text-xs whitespace-pre-wrap leading-relaxed text-text-secondary">
                {data.escalationProcedure}
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
