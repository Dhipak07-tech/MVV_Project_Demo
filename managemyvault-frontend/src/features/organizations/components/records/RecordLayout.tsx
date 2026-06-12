import React from 'react';
import RecordHeader from './RecordHeader';
import RecordToolbar from './RecordToolbar';
import RecordSidebar from './RecordSidebar';

interface RecordLayoutProps {
  // Breadcrumbs path
  breadcrumbs: string[];
  // Record title
  title: string;
  // Record type label
  type: string;
  // Organization ID for attachments/related items context
  organizationId: string;
  // Unique record entity ID
  entityId: string;
  // Audit info
  lastUpdated?: string;
  updatedBy?: string;
  // Toolbar handlers
  onEdit?: () => void;
  onClone?: () => void;
  onArchive?: () => void;
  onDelete?: () => void;
  onExportPdf?: () => void;
  onShareLink?: () => void;
  isArchived?: boolean;
  // Page body
  children: React.ReactNode;
}

export default function RecordLayout({
  breadcrumbs,
  title,
  type,
  organizationId,
  entityId,
  lastUpdated,
  updatedBy,
  onEdit,
  onClone,
  onArchive,
  onDelete,
  onExportPdf,
  onShareLink,
  isArchived = false,
  children
}: RecordLayoutProps) {
  return (
    <div className="p-6 space-y-6 bg-vault-base text-text-primary transition-colors duration-200">
      {/* 1. Header */}
      <RecordHeader
        breadcrumbs={breadcrumbs}
        title={title}
        type={type}
        lastUpdated={lastUpdated}
        updatedBy={updatedBy}
      />

      {/* 2. Toolbar */}
      <RecordToolbar
        onEdit={onEdit}
        onClone={onClone}
        onArchive={onArchive}
        onDelete={onDelete}
        onExportPdf={onExportPdf}
        onShareLink={onShareLink}
        isArchived={isArchived}
      />

      {/* 3. Main Workspace Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
        {/* Left Column: Details/Form content */}
        <div className="lg:col-span-2 space-y-6">
          {children}
        </div>

        {/* Right Column: Record Sidebar Widgets */}
        <div className="lg:col-span-1">
          <RecordSidebar
            organizationId={organizationId}
            entityType={type}
            entityId={entityId}
          />
        </div>
      </div>
    </div>
  );
}
