import React from 'react';
import { ChevronRight, Calendar, User } from 'lucide-react';

interface RecordHeaderProps {
  breadcrumbs: string[];
  title: string;
  type: string;
  lastUpdated?: string;
  updatedBy?: string;
}

export default function RecordHeader({
  breadcrumbs,
  title,
  type,
  lastUpdated,
  updatedBy
}: RecordHeaderProps) {
  return (
    <div className="border-b border-border-subtle pb-4 mb-4">
      {/* Breadcrumbs */}
      <nav className="flex items-center gap-1.5 text-xs text-text-muted mb-2 font-medium">
        {breadcrumbs.map((crumb, idx) => (
          <React.Fragment key={idx}>
            {idx > 0 && <ChevronRight className="w-3.5 h-3.5 text-text-muted" />}
            <span className={idx === breadcrumbs.length - 1 ? 'text-text-secondary font-semibold' : ''}>
              {crumb}
            </span>
          </React.Fragment>
        ))}
      </nav>

      {/* Main Title Block */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded bg-brand-primary/10 text-brand-primary border border-brand-primary/25">
              {type}
            </span>
            <h1 className="text-xl font-extrabold text-text-primary tracking-tight">
              {title}
            </h1>
          </div>
        </div>

        {/* Audit info */}
        {(lastUpdated || updatedBy) && (
          <div className="flex items-center gap-4 text-xs text-text-secondary">
            {lastUpdated && (
              <span className="flex items-center gap-1.5">
                <Calendar className="w-3.5 h-3.5 text-text-muted" />
                Updated: {new Date(lastUpdated).toLocaleDateString()}
              </span>
            )}
            {updatedBy && (
              <span className="flex items-center gap-1.5">
                <User className="w-3.5 h-3.5 text-text-muted" />
                By: {updatedBy}
              </span>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
