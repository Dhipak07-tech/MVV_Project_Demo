import { useState, useEffect } from 'react';
import { History, Eye, ChevronDown, ChevronUp, RefreshCw } from 'lucide-react';
import axios from 'axios';
import { API_URL } from '../../../../config/constants';

interface EntityRevision {
  id: string;
  beforeState: string | null;
  afterState: string | null;
  changedBy: string;
  changedAt: string;
}

interface RevisionHistoryWidgetProps {
  organizationId: string;
  entityType: string;
  entityId: string;
}

export default function RevisionHistoryWidget({
  organizationId,
  entityType,
  entityId
}: RevisionHistoryWidgetProps) {
  const [revisions, setRevisions] = useState<EntityRevision[]>([]);
  const [expandedRevId, setExpandedRevId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const token = localStorage.getItem('accessToken');
  const headers = { Authorization: `Bearer ${token}` };

  const fetchRevisions = async () => {
    setIsLoading(true);
    try {
      const response = await axios.get(
        `${API_URL}/revisions/${entityType}/${entityId}`,
        {
          params: { organizationId },
          headers
        }
      );
      setRevisions(response.data);
    } catch (error) {
      console.error('Failed to fetch revisions:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchRevisions();
  }, [entityId, entityType, organizationId]);

  const toggleExpand = (id: string) => {
    setExpandedRevId(expandedRevId === id ? null : id);
  };

  const getDiff = (beforeStr: string | null, afterStr: string | null) => {
    try {
      const beforeObj = beforeStr ? JSON.parse(beforeStr) : {};
      const afterObj = afterStr ? JSON.parse(afterStr) : {};
      
      const allKeys = Array.from(new Set([...Object.keys(beforeObj), ...Object.keys(afterObj)]))
        .filter(k => k !== 'version' && k !== 'updatedAt' && k !== 'createdAt' && k !== 'updatedBy' && k !== 'createdBy');

      const diffs: { key: string; before: any; after: any }[] = [];

      allKeys.forEach(k => {
        if (JSON.stringify(beforeObj[k]) !== JSON.stringify(afterObj[k])) {
          diffs.push({
            key: k,
            before: beforeObj[k],
            after: afterObj[k]
          });
        }
      });

      return diffs;
    } catch (e) {
      return [];
    }
  };

  return (
    <div className="glass-panel p-5 space-y-4">
      <div className="flex justify-between items-center pb-2.5 border-b border-border-subtle">
        <h3 className="text-sm font-bold text-text-primary flex items-center gap-2">
          <History className="w-4 h-4 text-brand-accent" />
          Revision History
        </h3>
        <button
          onClick={fetchRevisions}
          disabled={isLoading}
          className="text-text-muted hover:text-text-primary transition-colors disabled:animate-spin"
        >
          <RefreshCw className="w-3.5 h-3.5" />
        </button>
      </div>

      <div className="space-y-3 max-h-64 overflow-y-auto pr-1">
        {revisions.map((rev, idx) => {
          const isExpanded = expandedRevId === rev.id;
          const diffs = getDiff(rev.beforeState, rev.afterState);

          return (
            <div
              key={rev.id}
              className="rounded-lg border border-border-subtle bg-vault-elevated/20 overflow-hidden text-xs"
            >
              {/* Revision Header */}
              <div
                onClick={() => toggleExpand(rev.id)}
                className="flex items-center justify-between p-2.5 cursor-pointer hover:bg-vault-elevated/40 transition-colors"
              >
                <div>
                  <p className="font-semibold text-text-primary">
                    Version {revisions.length - idx}
                  </p>
                  <p className="text-[10px] text-text-muted mt-0.5">
                    {new Date(rev.changedAt).toLocaleString()}
                  </p>
                </div>
                {isExpanded ? <ChevronUp className="w-4 h-4 text-text-muted" /> : <ChevronDown className="w-4 h-4 text-text-muted" />}
              </div>

              {/* Revision Details (Diff view) */}
              {isExpanded && (
                <div className="p-3 bg-vault-base/50 border-t border-border-subtle space-y-2">
                  {diffs.length > 0 ? (
                    <div className="space-y-2">
                      <p className="text-[10px] uppercase font-bold text-brand-primary tracking-wider">Changes:</p>
                      <div className="grid grid-cols-1 gap-2 font-mono text-[10px] leading-normal">
                        {diffs.map((d, dIdx) => (
                          <div key={dIdx} className="bg-vault-card/60 p-2 rounded border border-border-subtle">
                            <span className="font-bold text-text-primary block mb-1">{d.key}</span>
                            <div className="grid grid-cols-2 gap-2">
                              <div className="bg-status-danger/5 text-status-danger p-1 rounded overflow-hidden text-ellipsis">
                                <span className="font-bold mr-1">-</span>
                                {d.before !== null && d.before !== undefined ? String(d.before) : 'empty'}
                              </div>
                              <div className="bg-status-success/5 text-status-success p-1 rounded overflow-hidden text-ellipsis">
                                <span className="font-bold mr-1">+</span>
                                {d.after !== null && d.after !== undefined ? String(d.after) : 'empty'}
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  ) : (
                    <p className="text-[10px] text-text-muted italic">Initial snapshot or metadata update only.</p>
                  )}
                </div>
              )}
            </div>
          );
        })}

        {revisions.length === 0 && !isLoading && (
          <p className="text-xs text-text-muted text-center py-4">No revisions recorded yet.</p>
        )}
      </div>
    </div>
  );
}
