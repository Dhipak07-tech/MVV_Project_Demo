import React, { useState, useEffect, useRef } from 'react';
import { Paperclip, Trash2, Download, UploadCloud, FileText, ImageIcon, X, AlertCircle } from 'lucide-react';
import { clientContactApi } from '../../api/clientContactApi';
import api from '../../api/organizationApi';

interface Attachment {
  id: string;
  fileName: string;
  contentType: string;
  size: number;
  createdAt: string;
  createdBy: string;
  createdByUserName?: string;
}

interface AttachmentWidgetProps {
  organizationId: string;
  entityType: string;
  entityId: string;
}

interface Toast {
  id: string;
  message: string;
  type: 'success' | 'error' | 'info';
}

export default function AttachmentWidget({
  organizationId,
  entityType,
  entityId
}: AttachmentWidgetProps) {
  const [attachments, setAttachments] = useState<Attachment[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const [dragActive, setDragActive] = useState(false);
  const [toasts, setToasts] = useState<Toast[]>([]);
  const [deleteAttachmentItem, setDeleteAttachmentItem] = useState<{ id: string; fileName: string } | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const showToast = (message: string, type: 'success' | 'error' | 'info' = 'success') => {
    const id = crypto.randomUUID();
    setToasts(prev => [...prev, { id, message, type }]);
    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== id));
    }, 4000);
  };

  const fetchAttachments = async () => {
    if (!/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(entityId)) {
      setAttachments([]);
      return;
    }
    try {
      const data = await clientContactApi.attachments.list(entityType, entityId, organizationId);
      setAttachments(data);
    } catch (error) {
      console.error('Failed to fetch attachments:', error);
    }
  };

  useEffect(() => {
    fetchAttachments();
  }, [entityId, entityType, organizationId]);

  const handleUpload = async (file: File) => {
    setIsUploading(true);
    try {
      await clientContactApi.attachments.upload(organizationId, entityType, entityId, file);
      await fetchAttachments();
      showToast('File uploaded successfully', 'success');
      window.dispatchEvent(new CustomEvent('activity-updated'));
    } catch (error) {
      console.error('Upload failed:', error);
      showToast('Upload failed. Check permissions or file size.', 'error');
    } finally {
      setIsUploading(false);
    }
  };

  const handleDeleteConfirm = async () => {
    if (!deleteAttachmentItem) return;
    const { id, fileName } = deleteAttachmentItem;
    setDeleteAttachmentItem(null);

    try {
      await clientContactApi.attachments.delete(id, organizationId, entityType, entityId, fileName);
      setAttachments(prev => prev.filter(a => a.id !== id));
      showToast('Attachment deleted successfully', 'success');
      window.dispatchEvent(new CustomEvent('activity-updated'));
    } catch (error: any) {
      console.error('Delete failed:', error);
      if (error?.response?.status === 403) {
        showToast('Permission Denied. Only admins or the uploader can delete.', 'error');
      } else {
        showToast('Failed to delete attachment', 'error');
      }
    }
  };

  const handleDownload = async (id: string, fileName: string) => {
    if (localStorage.getItem('demoMode') === 'true') {
      // Offline/Demo mock download
      const blob = new Blob(["Demo Mode: Mock content for " + fileName], { type: "text/plain" });
      const href = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = href;
      link.setAttribute('download', fileName);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(href);

      // Log download activity event in demo mode
      clientContactApi.activities.log(organizationId, entityType, entityId, 'ATTACHMENT_DOWNLOAD', "Downloaded " + fileName);
      showToast('Download started (Demo Mode)', 'success');
      window.dispatchEvent(new CustomEvent('activity-updated'));
      return;
    }

    try {
      const response = await api.get(`/attachments/${id}/download`, {
        responseType: 'blob'
      });
      const href = URL.createObjectURL(response.data);
      const link = document.createElement('a');
      link.href = href;
      link.setAttribute('download', fileName);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(href);
      showToast('Download started', 'success');
      window.dispatchEvent(new CustomEvent('activity-updated'));
    } catch (error) {
      console.error('Download failed:', error);
      showToast('Failed to download file', 'error');
    }
  };

  // Drag & drop handlers
  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleUpload(e.dataTransfer.files[0]);
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      handleUpload(e.target.files[0]);
    }
  };

  const formatSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  return (
    <div className="glass-panel p-5 space-y-4 relative">
      {/* Toast Notification Container */}
      <div className="fixed top-4 right-4 z-[9999] space-y-2 pointer-events-none">
        {toasts.map((toast) => (
          <div
            key={toast.id}
            className={`flex items-center gap-2.5 px-4 py-3 rounded-lg shadow-xl border text-xs font-semibold max-w-sm pointer-events-auto backdrop-blur-md transition-all duration-300 ${
              toast.type === 'success'
                ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/25'
                : toast.type === 'error'
                ? 'bg-rose-500/10 text-rose-400 border-rose-500/25'
                : 'bg-blue-500/10 text-blue-400 border-blue-500/25'
            }`}
          >
            {toast.type === 'error' && <AlertCircle className="w-4 h-4 shrink-0" />}
            <span>{toast.message}</span>
            <button
              onClick={() => setToasts(prev => prev.filter(t => t.id !== toast.id))}
              className="text-text-muted hover:text-text-primary transition-colors ml-auto"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        ))}
      </div>

      {/* Delete Confirmation Modal */}
      {deleteAttachmentItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="glass-panel w-full max-w-md p-6 space-y-6 border border-border-subtle shadow-2xl bg-vault-card/95">
            <div className="space-y-3">
              <div className="flex items-center gap-2.5 text-status-danger">
                <AlertCircle className="w-5 h-5" />
                <h3 className="text-base font-bold">Delete Attachment</h3>
              </div>
              <p className="text-sm text-text-secondary">
                Are you sure you want to delete:
              </p>
              <p className="text-sm font-semibold text-brand-primary break-all bg-vault-base/40 p-2.5 rounded border border-border-subtle/50 font-mono">
                {deleteAttachmentItem.fileName}
              </p>
              <p className="text-xs text-text-muted font-medium">
                This action cannot be undone.
              </p>
            </div>
            <div className="flex justify-end gap-3 pt-2">
              <button
                onClick={() => setDeleteAttachmentItem(null)}
                className="px-4 py-2 text-xs font-semibold text-text-secondary hover:text-text-primary rounded-lg bg-vault-base/40 border border-border-subtle hover:bg-vault-base/80 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleDeleteConfirm}
                className="px-4 py-2 text-xs font-semibold text-white rounded-lg bg-status-danger hover:bg-status-danger/80 transition-colors shadow-lg shadow-status-danger/20"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}

      <h3 className="text-sm font-bold text-text-primary flex items-center gap-2 pb-2.5 border-b border-border-subtle">
        <Paperclip className="w-4 h-4 text-brand-primary" />
        Attachments
      </h3>

      {/* Drag & Drop Zone */}
      <div
        onDragEnter={handleDrag}
        onDragOver={handleDrag}
        onDragLeave={handleDrag}
        onDrop={handleDrop}
        onClick={() => fileInputRef.current?.click()}
        className={`border-2 border-dashed rounded-xl p-5 text-center cursor-pointer transition-all ${
          dragActive
            ? 'border-brand-primary bg-brand-primary/10'
            : 'border-border-subtle hover:border-text-muted bg-vault-base/30'
        }`}
      >
        <input
          ref={fileInputRef}
          type="file"
          className="hidden"
          onChange={handleFileSelect}
        />
        <UploadCloud className="w-8 h-8 text-text-muted mx-auto mb-2" />
        <p className="text-xs font-semibold text-text-primary">
          {isUploading ? 'Uploading file...' : 'Drag & drop file here or click'}
        </p>
        <p className="text-[10px] text-text-muted mt-1">
          PDF, PNG, JPG, DOCX, XLSX, TXT up to 25MB
        </p>
      </div>

      {/* List Attachments */}
      <div className="space-y-2.5 max-h-60 overflow-y-auto pr-1">
        {attachments.map((a) => {
          const isImage = a.contentType.startsWith('image/');
          return (
            <div
              key={a.id}
              className="flex items-start justify-between p-3 rounded-lg bg-vault-elevated/40 border border-border-subtle hover:bg-vault-elevated/70 transition-all text-xs gap-3"
            >
              <div className="flex items-start gap-2.5 min-w-0 flex-1">
                {isImage ? (
                  <ImageIcon className="w-4 h-4 text-brand-secondary shrink-0 mt-0.5" />
                ) : (
                  <FileText className="w-4 h-4 text-brand-accent shrink-0 mt-0.5" />
                )}
                <div className="min-w-0 flex-1">
                  <p className="font-semibold text-text-primary truncate pr-1" title={a.fileName}>
                    {a.fileName}
                  </p>
                  <div className="flex flex-wrap items-center gap-x-2 text-[10px] text-text-secondary mt-1 font-medium">
                    <span className="text-brand-primary">{formatSize(a.size)}</span>
                    <span className="text-border-subtle">•</span>
                    <span>{a.contentType.split('/')[1]?.toUpperCase() || 'FILE'}</span>
                    <span className="text-border-subtle">•</span>
                    <span>Uploaded by {a.createdByUserName || 'Unknown'}</span>
                    <span className="text-border-subtle">•</span>
                    <span>{new Date(a.createdAt).toLocaleDateString(undefined, { day: 'numeric', month: 'short', year: 'numeric' })}</span>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-1 shrink-0 mt-0.5">
                <button
                  onClick={() => handleDownload(a.id, a.fileName)}
                  className="p-1.5 rounded hover:bg-vault-card text-text-muted hover:text-text-primary transition-colors"
                  title="Download File"
                >
                  <Download className="w-3.5 h-3.5" />
                </button>
                <button
                  onClick={() => setDeleteAttachmentItem({ id: a.id, fileName: a.fileName })}
                  className="p-1.5 rounded hover:bg-vault-card text-text-muted hover:text-status-danger transition-colors"
                  title="Delete File"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          );
        })}

        {attachments.length === 0 && !isUploading && (
          <p className="text-xs text-text-muted text-center py-4">No attachments uploaded yet.</p>
        )}
      </div>
    </div>
  );
}
