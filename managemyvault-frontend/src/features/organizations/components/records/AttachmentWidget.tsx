import React, { useState, useEffect, useRef } from 'react';
import { Paperclip, Trash2, Download, UploadCloud, FileText, ImageIcon, Eye } from 'lucide-react';
import axios from 'axios';
import { API_URL } from '../../../../config/constants';

interface Attachment {
  id: string;
  fileName: string;
  contentType: string;
  size: number;
  createdAt: string;
  createdBy: string;
}

interface AttachmentWidgetProps {
  organizationId: string;
  entityType: string;
  entityId: string;
}

export default function AttachmentWidget({
  organizationId,
  entityType,
  entityId
}: AttachmentWidgetProps) {
  const [attachments, setAttachments] = useState<Attachment[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const [dragActive, setDragActive] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const token = localStorage.getItem('accessToken');
  const headers = {
    Authorization: `Bearer ${token}`
  };

  const fetchAttachments = async () => {
    try {
      const response = await axios.get(
        `${API_URL}/attachments/${entityType}/${entityId}`,
        {
          params: { organizationId },
          headers
        }
      );
      setAttachments(response.data);
    } catch (error) {
      console.error('Failed to fetch attachments:', error);
    }
  };

  useEffect(() => {
    fetchAttachments();
  }, [entityId, entityType, organizationId]);

  const handleUpload = async (file: File) => {
    setIsUploading(true);
    const formData = new FormData();
    formData.append('organizationId', organizationId);
    formData.append('entityType', entityType);
    formData.append('entityId', entityId);
    formData.append('file', file);

    try {
      await axios.post(`${API_URL}/attachments/upload`, formData, {
        headers: {
          ...headers,
          'Content-Type': 'multipart/form-data'
        }
      });
      fetchAttachments();
    } catch (error) {
      console.error('Upload failed:', error);
    } finally {
      setIsUploading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('Are you sure you want to delete this attachment?')) return;
    try {
      await axios.delete(`${API_URL}/attachments/${id}`, { headers });
      setAttachments(attachments.filter(a => a.id !== id));
    } catch (error) {
      console.error('Delete failed:', error);
    }
  };

  const handleDownload = (id: string, fileName: string) => {
    axios({
      url: `${API_URL}/attachments/${id}/download`,
      method: 'GET',
      responseType: 'blob',
      headers
    }).then((response) => {
      const href = URL.createObjectURL(response.data);
      const link = document.createElement('a');
      link.href = href;
      link.setAttribute('download', fileName);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(href);
    }).catch(error => {
      console.error('Download failed:', error);
    });
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
    <div className="glass-panel p-5 space-y-4">
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
      <div className="space-y-2 max-h-60 overflow-y-auto pr-1">
        {attachments.map((a) => {
          const isImage = a.contentType.startsWith('image/');
          return (
            <div
              key={a.id}
              className="flex items-center justify-between p-2.5 rounded-lg bg-vault-elevated/40 border border-border-subtle hover:bg-vault-elevated/70 transition-all text-xs"
            >
              <div className="flex items-center gap-2.5 min-w-0">
                {isImage ? (
                  <ImageIcon className="w-4 h-4 text-brand-secondary shrink-0" />
                ) : (
                  <FileText className="w-4 h-4 text-brand-accent shrink-0" />
                )}
                <div className="min-w-0">
                  <p className="font-semibold text-text-primary truncate" title={a.fileName}>
                    {a.fileName}
                  </p>
                  <p className="text-[10px] text-text-muted mt-0.5">
                    {formatSize(a.size)}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-1">
                <button
                  onClick={() => handleDownload(a.id, a.fileName)}
                  className="p-1 rounded hover:bg-vault-card text-text-muted hover:text-text-primary transition-colors"
                  title="Download File"
                >
                  <Download className="w-3.5 h-3.5" />
                </button>
                <button
                  onClick={() => handleDelete(a.id)}
                  className="p-1 rounded hover:bg-vault-card text-text-muted hover:text-status-danger transition-colors"
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
