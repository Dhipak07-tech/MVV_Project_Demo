import { motion } from 'framer-motion';
import { Building2, Users, Key, FileText, MoreVertical, Archive } from 'lucide-react';
import type { OrganizationSummary } from '../types/organization.types';
import HealthScoreRing from './HealthScoreRing';
import IndustryBadge from './IndustryBadge';
import { formatRelativeTime, getInitials } from '../../../shared/utils/formatters';
import { cn } from '../../../shared/utils/cn';
import { getIndustryColor } from '../../../config/theme';
import { useState } from 'react';

interface OrganizationCardProps {
  org: OrganizationSummary;
  onSelect: (id: string) => void;
  onEdit: (id: string) => void;
  onArchive: (id: string) => void;
  index?: number;
}

/**
 * Organization card with:
 * - Logo with fallback initials avatar
 * - Name + industry badge
 * - Status chip
 * - Health score ring (animated SVG arc)
 * - Asset/password/document counts
 * - Last activity timestamp
 * - Hover glow + quick actions
 */
export default function OrganizationCard({
  org,
  onSelect,
  onEdit,
  onArchive,
  index = 0,
}: OrganizationCardProps) {
  const [showMenu, setShowMenu] = useState(false);
  const industryColor = getIndustryColor(org.industry || 'other');

  const statusStyles: Record<string, string> = {
    ACTIVE: 'badge-success',
    INACTIVE: 'badge-warning',
    SUSPENDED: 'badge-danger',
    ARCHIVED: 'text-text-muted bg-vault-elevated border-border-subtle badge',
    PENDING: 'badge-info',
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay: index * 0.05 }}
      className="group relative"
    >
      <div
        onClick={() => onSelect(org.id)}
        className={cn(
          'relative overflow-hidden rounded-xl cursor-pointer',
          'bg-vault-card border border-border-subtle',
          'transition-all duration-300 ease-out',
          'hover:border-brand-primary hover:shadow-glow-blue',
          'p-5'
        )}
      >
        {/* Left accent border */}
        <div
          className="absolute left-0 top-0 bottom-0 w-1 rounded-l-xl transition-all duration-300"
          style={{ backgroundColor: industryColor, opacity: 0.6 }}
        />

        {/* Header: Logo + Name + Status */}
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center gap-3">
            {/* Logo / Initials */}
            {org.logoUrl ? (
              <img
                src={org.logoUrl}
                alt={org.name}
                className="w-10 h-10 rounded-lg object-cover border border-border-subtle"
              />
            ) : (
              <div
                className="w-10 h-10 rounded-lg flex items-center justify-center text-sm font-bold text-white"
                style={{ backgroundColor: industryColor + '30', color: industryColor }}
              >
                {getInitials(org.name)}
              </div>
            )}

            <div className="min-w-0">
              <h3 className="text-card-title text-text-primary truncate max-w-[180px]">
                {org.name}
              </h3>
              <IndustryBadge industry={org.industry} />
            </div>
          </div>

          <div className="flex items-center gap-2">
            <span className={statusStyles[org.status] || 'badge'}>
              {org.status}
            </span>

            {/* Quick actions menu */}
            <div className="relative">
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setShowMenu(!showMenu);
                }}
                className="opacity-0 group-hover:opacity-100 transition-opacity p-1 rounded hover:bg-vault-elevated"
              >
                <MoreVertical className="w-4 h-4 text-text-muted" />
              </button>

              {showMenu && (
                <div className="absolute right-0 top-8 z-10 w-36 bg-vault-elevated border border-border-default rounded-lg shadow-lg py-1">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onEdit(org.id);
                      setShowMenu(false);
                    }}
                    className="w-full text-left px-3 py-2 text-sm text-text-secondary hover:text-text-primary hover:bg-vault-card"
                  >
                    Edit
                  </button>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onArchive(org.id);
                      setShowMenu(false);
                    }}
                    className="w-full text-left px-3 py-2 text-sm text-status-danger hover:bg-vault-card flex items-center gap-2"
                  >
                    <Archive className="w-3.5 h-3.5" />
                    Archive
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Health Score Ring */}
        <div className="flex items-center justify-between mb-4">
          <HealthScoreRing score={org.healthScore ?? 0} size={52} />

          {/* Stats */}
          <div className="flex items-center gap-4 text-text-muted">
            <div className="flex items-center gap-1.5" title="Members">
              <Users className="w-3.5 h-3.5" />
              <span className="text-xs font-medium text-text-secondary">{org.memberCount}</span>
            </div>
            <div className="flex items-center gap-1.5" title="Passwords">
              <Key className="w-3.5 h-3.5" />
              <span className="text-xs font-medium text-text-secondary">{org.passwordCount}</span>
            </div>
            <div className="flex items-center gap-1.5" title="Documents">
              <FileText className="w-3.5 h-3.5" />
              <span className="text-xs font-medium text-text-secondary">{org.documentCount}</span>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between pt-3 border-t border-border-subtle">
          <div className="flex items-center gap-1.5 text-text-muted">
            <Building2 className="w-3.5 h-3.5" />
            <span className="text-code text-xs">{org.slug}</span>
          </div>
          <span className="text-xs text-text-muted">
            {formatRelativeTime(org.createdAt)}
          </span>
        </div>
      </div>
    </motion.div>
  );
}
