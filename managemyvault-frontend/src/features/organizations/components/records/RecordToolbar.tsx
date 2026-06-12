import { Edit2, Copy, Archive, Trash2, FileText, Link2 } from 'lucide-react';
import { useAuthStore } from '../../store/organizationStore';

interface RecordToolbarProps {
  onEdit?: () => void;
  onClone?: () => void;
  onArchive?: () => void;
  onDelete?: () => void;
  onExportPdf?: () => void;
  onShareLink?: () => void;
  isArchived?: boolean;
}

export default function RecordToolbar({
  onEdit,
  onClone,
  onArchive,
  onDelete,
  onExportPdf,
  onShareLink,
  isArchived = false
}: RecordToolbarProps) {
  const { user } = useAuthStore();
  const role = user?.role || 'ORG_MEMBER';

  // Role permissions checks
  const isAdmin = role === 'ORG_ADMIN' || role === 'PLATFORM_ADMIN';
  const isPlatformAdmin = role === 'PLATFORM_ADMIN';

  return (
    <div className="flex flex-wrap items-center justify-between gap-3 bg-vault-card/65 backdrop-blur border border-border-subtle p-3 rounded-xl mb-6">
      {/* Left side actions (Edit, Clone, Archive, Delete) */}
      <div className="flex items-center flex-wrap gap-2">
        {onEdit && (
          <button
            onClick={onEdit}
            className="btn-primary py-1.5 px-3.5 text-xs flex items-center gap-1.5"
          >
            <Edit2 className="w-3.5 h-3.5" /> Edit
          </button>
        )}

        {onClone && isAdmin && (
          <button
            onClick={onClone}
            className="btn-secondary py-1.5 px-3.5 text-xs flex items-center gap-1.5"
          >
            <Copy className="w-3.5 h-3.5" /> Clone
          </button>
        )}

        {onArchive && isAdmin && (
          <button
            onClick={onArchive}
            className={`btn-secondary py-1.5 px-3.5 text-xs flex items-center gap-1.5 ${
              isArchived ? 'text-status-warning' : ''
            }`}
          >
            <Archive className="w-3.5 h-3.5" /> {isArchived ? 'Restore' : 'Archive'}
          </button>
        )}

        {onDelete && (isPlatformAdmin || isAdmin) && (
          <button
            onClick={onDelete}
            className="bg-status-danger/10 text-status-danger border border-status-danger/20 hover:bg-status-danger/20 py-1.5 px-3.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors"
          >
            <Trash2 className="w-3.5 h-3.5" /> Delete
          </button>
        )}
      </div>

      {/* Right side utilities (Export, Share) */}
      <div className="flex items-center gap-2">
        {onExportPdf && (
          <button
            onClick={onExportPdf}
            className="btn-secondary py-1.5 px-3.5 text-xs flex items-center gap-1.5"
          >
            <FileText className="w-3.5 h-3.5" /> PDF
          </button>
        )}

        {onShareLink && (
          <button
            onClick={onShareLink}
            className="btn-secondary py-1.5 px-3.5 text-xs flex items-center gap-1.5"
          >
            <Link2 className="w-3.5 h-3.5" /> Share
          </button>
        )}
      </div>
    </div>
  );
}
