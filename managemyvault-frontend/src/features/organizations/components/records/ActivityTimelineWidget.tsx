import { useState, useEffect } from 'react';
import { Clock, Plus, Edit, Trash, Paperclip, RefreshCw } from 'lucide-react';
import axios from 'axios';
import { API_URL } from '../../../../config/constants';

interface ActivityEvent {
  id: string;
  action: string;
  userId: string;
  timestamp: string;
}

interface ActivityTimelineWidgetProps {
  organizationId: string;
  entityType: string;
  entityId: string;
}

export default function ActivityTimelineWidget({
  organizationId,
  entityType,
  entityId
}: ActivityTimelineWidgetProps) {
  const [events, setEvents] = useState<ActivityEvent[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const token = localStorage.getItem('accessToken');
  const headers = { Authorization: `Bearer ${token}` };

  const fetchEvents = async () => {
    setIsLoading(true);
    try {
      const response = await axios.get(
        `${API_URL}/activity/${entityType}/${entityId}`,
        {
          params: { organizationId },
          headers
        }
      );
      setEvents(response.data);
    } catch (error) {
      console.error('Failed to fetch activity log:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchEvents();
  }, [entityId, entityType, organizationId]);

  const getActionIcon = (action: string) => {
    switch (action) {
      case 'CREATE':
        return <Plus className="w-3.5 h-3.5 text-status-success" />;
      case 'UPDATE':
        return <Edit className="w-3.5 h-3.5 text-brand-secondary" />;
      case 'DELETE':
      case 'ATTACHMENT_DELETE':
        return <Trash className="w-3.5 h-3.5 text-status-danger" />;
      case 'ATTACHMENT_UPLOAD':
        return <Paperclip className="w-3.5 h-3.5 text-brand-primary" />;
      default:
        return <Clock className="w-3.5 h-3.5 text-text-muted" />;
    }
  };

  const getActionText = (action: string) => {
    switch (action) {
      case 'CREATE':
        return 'created this record';
      case 'UPDATE':
        return 'updated details';
      case 'DELETE':
        return 'deleted this record';
      case 'ATTACHMENT_UPLOAD':
        return 'uploaded an attachment';
      case 'ATTACHMENT_DELETE':
        return 'removed an attachment';
      default:
        return action.toLowerCase().replace('_', ' ');
    }
  };

  return (
    <div className="glass-panel p-5 space-y-4">
      <div className="flex justify-between items-center pb-2.5 border-b border-border-subtle">
        <h3 className="text-sm font-bold text-text-primary flex items-center gap-2">
          <Clock className="w-4 h-4 text-brand-secondary" />
          Activity Timeline
        </h3>
        <button
          onClick={fetchEvents}
          disabled={isLoading}
          className="text-text-muted hover:text-text-primary transition-colors disabled:animate-spin"
        >
          <RefreshCw className="w-3.5 h-3.5" />
        </button>
      </div>

      <div className="relative border-l border-border-subtle pl-4 ml-2.5 space-y-5 py-2 max-h-60 overflow-y-auto">
        {events.map((e) => (
          <div key={e.id} className="relative text-xs">
            {/* Action point icon */}
            <span className="absolute -left-[23px] top-0.5 p-1 bg-vault-card rounded-full border border-border-subtle flex items-center justify-center">
              {getActionIcon(e.action)}
            </span>
            <div className="pl-1.5">
              <p className="font-semibold text-text-primary">
                System User <span className="font-normal text-text-secondary">{getActionText(e.action)}</span>
              </p>
              <p className="text-[10px] text-text-muted mt-0.5">
                {new Date(e.timestamp).toLocaleString()}
              </p>
            </div>
          </div>
        ))}

        {events.length === 0 && !isLoading && (
          <p className="text-xs text-text-muted text-center py-2 pr-4">No activity events recorded yet.</p>
        )}
      </div>
    </div>
  );
}
