import AttachmentWidget from './AttachmentWidget';
import RelatedItemsWidget from './RelatedItemsWidget';
import ActivityTimelineWidget from './ActivityTimelineWidget';
import RevisionHistoryWidget from './RevisionHistoryWidget';

interface RecordSidebarProps {
  organizationId: string;
  entityType: string;
  entityId: string;
}

export default function RecordSidebar({
  organizationId,
  entityType,
  entityId
}: RecordSidebarProps) {
  return (
    <div className="space-y-6">
      {/* Attachments Widget */}
      <AttachmentWidget
        organizationId={organizationId}
        entityType={entityType}
        entityId={entityId}
      />

      {/* Related Items Widget */}
      <RelatedItemsWidget
        organizationId={organizationId}
        entityType={entityType}
        entityId={entityId}
      />

      {/* Activity Timeline */}
      <ActivityTimelineWidget
        organizationId={organizationId}
        entityType={entityType}
        entityId={entityId}
      />

      {/* Revision History */}
      <RevisionHistoryWidget
        organizationId={organizationId}
        entityType={entityType}
        entityId={entityId}
      />
    </div>
  );
}
