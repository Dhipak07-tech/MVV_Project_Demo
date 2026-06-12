import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { Plus, Search, FileText, Edit2, Trash2, Save, Folder, User, Calendar, Loader2 } from 'lucide-react';
import { useDocuments, useCreateDocument, useUpdateDocument, useDeleteDocument } from '../../../hooks/useDocs';
import { type DocumentItem } from '../../../api/docsApi';

export default function DocumentsPage() {
  const { orgId } = useParams<{ orgId: string }>();
  const [search, setSearch] = useState('');
  const [filterCat, setFilterCat] = useState('All');
  const [selectedDoc, setSelectedDoc] = useState<DocumentItem | null>(null);

  // Editor State
  const [isEditing, setIsEditing] = useState(false);
  const [editTitle, setEditTitle] = useState('');
  const [editContent, setEditContent] = useState('');
  const [editCategory, setEditCategory] = useState('General');

  // React Query Hooks
  const { data: pageData, isLoading } = useDocuments(orgId || '', filterCat, search);
  const createMutation = useCreateDocument();
  const updateMutation = useUpdateDocument();
  const deleteMutation = useDeleteDocument();

  const documents = pageData?.content || [];

  // Update selected doc if it changes in database
  useEffect(() => {
    if (selectedDoc) {
      const match = documents.find((d) => d.id === selectedDoc.id);
      if (match) {
        setSelectedDoc(match);
      }
    }
  }, [documents, selectedDoc]);

  const handleSelectDoc = (doc: DocumentItem) => {
    setSelectedDoc(doc);
    setIsEditing(false);
  };

  const handleOpenAdd = async () => {
    if (!orgId) return;
    const newDoc = {
      title: 'Untitled Document',
      content: '# New Document\nStart editing here...',
      category: 'General',
    };
    try {
      const saved = await createMutation.mutateAsync({ orgId, doc: newDoc });
      setSelectedDoc(saved);
      setEditTitle(saved.title);
      setEditContent(saved.content);
      setEditCategory(saved.category);
      setIsEditing(true);
    } catch (err) {
      console.error('Failed to create document', err);
    }
  };

  const handleEditStart = () => {
    if (!selectedDoc) return;
    setEditTitle(selectedDoc.title);
    setEditContent(selectedDoc.content);
    setEditCategory(selectedDoc.category);
    setIsEditing(true);
  };

  const handleSave = async () => {
    if (!selectedDoc || !orgId) return;
    try {
      const updated = await updateMutation.mutateAsync({
        orgId,
        id: selectedDoc.id,
        doc: {
          title: editTitle,
          content: editContent,
          category: editCategory,
        },
      });
      setSelectedDoc(updated);
      setIsEditing(false);
    } catch (err) {
      console.error('Failed to save document', err);
    }
  };

  const handleDelete = async (id: string) => {
    if (!orgId) return;
    if (confirm('Are you sure you want to delete this document?')) {
      try {
        await deleteMutation.mutateAsync({ orgId, id });
        setSelectedDoc(null);
        setIsEditing(false);
      } catch (err) {
        console.error('Failed to delete document', err);
      }
    }
  };

  const categories = ['All', 'Standards', 'Operations', 'General', 'Procedures', 'Reference'];

  return (
    <div className="p-6 space-y-6 bg-vault-base text-text-primary transition-colors duration-200">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-border-subtle pb-5">
        <div>
          <span className="text-xs font-semibold text-brand-primary tracking-wider uppercase">
            Core Documentation
          </span>
          <h1 className="text-2xl font-bold tracking-tight text-text-primary mt-1">
            Documents Center
          </h1>
          <p className="text-sm text-text-secondary mt-0.5">
            Create, edit, and categorize markdown documentation for standard operating procedures.
          </p>
        </div>

        <button onClick={handleOpenAdd} disabled={createMutation.isPending} className="btn-primary flex items-center gap-1.5">
          {createMutation.isPending ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : (
            <Plus className="w-4 h-4" />
          )}
          New Document
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Left Side: Document list & categories */}
        <div className="space-y-4 lg:col-span-1">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted" />
            <input
              type="text"
              placeholder="Search docs..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="input-field pl-9 text-xs"
            />
          </div>

          {/* Categories */}
          <div className="glass-panel p-4 space-y-2">
            <span className="text-[10px] font-bold text-text-muted uppercase tracking-wider block">Folders</span>
            <div className="space-y-1">
              {categories.map((cat) => (
                <button
                  key={cat}
                  onClick={() => setFilterCat(cat)}
                  className={`w-full flex items-center gap-2 px-2.5 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                    filterCat === cat
                      ? 'bg-brand-primary/10 text-brand-primary'
                      : 'text-text-secondary hover:text-text-primary hover:bg-vault-elevated/20'
                  }`}
                >
                  <Folder className="w-3.5 h-3.5" />
                  {cat}
                </button>
              ))}
            </div>
          </div>

          {/* List */}
          <div className="space-y-2 max-h-[400px] overflow-y-auto pr-1">
            {isLoading ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="w-6 h-6 animate-spin text-brand-primary" />
              </div>
            ) : documents.length === 0 ? (
              <p className="text-center py-8 text-xs text-text-muted">No documents found.</p>
            ) : (
              documents.map((doc) => (
                <button
                  key={doc.id}
                  onClick={() => handleSelectDoc(doc)}
                  className={`w-full text-left p-3.5 rounded-xl border transition-all ${
                    selectedDoc?.id === doc.id
                      ? 'bg-vault-card border-brand-primary shadow-glow-blue'
                      : 'bg-vault-card border-border-subtle hover:border-border-default'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <FileText className="w-4 h-4 text-brand-primary flex-shrink-0" />
                    <span className="text-xs font-bold text-text-primary truncate">{doc.title}</span>
                  </div>
                  <div className="flex items-center justify-between text-[9px] text-text-muted mt-2">
                    <span className="truncate">{doc.category}</span>
                    <span>{new Date(doc.updatedAt).toLocaleDateString()}</span>
                  </div>
                </button>
              ))
            )}
          </div>
        </div>

        {/* Right Side: Document view/edit panel */}
        <div className="lg:col-span-3">
          {selectedDoc ? (
            <div className="glass-panel p-6 space-y-5 min-h-[500px] flex flex-col justify-between">
              {/* Document Header details */}
              <div>
                <div className="flex justify-between items-start border-b border-border-subtle pb-4 mb-4">
                  {isEditing ? (
                    <div className="w-full space-y-3">
                      <input
                        type="text"
                        value={editTitle}
                        onChange={(e) => setEditTitle(e.target.value)}
                        className="input-field text-sm font-bold"
                        placeholder="Document Title"
                      />
                      <div className="grid grid-cols-2 gap-4">
                        <input
                          type="text"
                          value={editCategory}
                          onChange={(e) => setEditCategory(e.target.value)}
                          className="input-field text-xs"
                          placeholder="Category / Folder"
                        />
                      </div>
                    </div>
                  ) : (
                    <div>
                      <h2 className="text-base font-bold text-text-primary">{selectedDoc.title}</h2>
                      <div className="flex items-center gap-4 text-[10px] text-text-muted mt-1.5">
                        <span className="flex items-center gap-1">
                          <User className="w-3.5 h-3.5" /> Platform User
                        </span>
                        <span className="flex items-center gap-1">
                          <Calendar className="w-3.5 h-3.5" /> {new Date(selectedDoc.updatedAt).toLocaleDateString()}
                        </span>
                        <span className="bg-vault-elevated px-2 py-0.5 rounded border border-border-subtle">
                          {selectedDoc.category}
                        </span>
                      </div>
                    </div>
                  )}

                  <div className="flex items-center gap-1.5 ml-4">
                    {isEditing ? (
                      <>
                        <button onClick={handleSave} disabled={updateMutation.isPending} className="btn-primary py-1.5 px-3 text-xs flex items-center gap-1">
                          {updateMutation.isPending ? (
                            <Loader2 className="w-3 h-3 animate-spin" />
                          ) : (
                            <Save className="w-3.5 h-3.5" />
                          )}
                          Save
                        </button>
                        <button onClick={() => setIsEditing(false)} className="btn-secondary py-1.5 px-3 text-xs">
                          Cancel
                        </button>
                      </>
                    ) : (
                      <>
                        <button onClick={handleEditStart} className="btn-secondary py-1.5 px-3 text-xs flex items-center gap-1">
                          <Edit2 className="w-3.5 h-3.5" /> Edit
                        </button>
                        <button onClick={() => handleDelete(selectedDoc.id)} disabled={deleteMutation.isPending} className="p-1.5 text-text-muted hover:text-status-danger transition-colors">
                          {deleteMutation.isPending ? (
                            <Loader2 className="w-4 h-4 animate-spin text-status-danger" />
                          ) : (
                            <Trash2 className="w-4 h-4" />
                          )}
                        </button>
                      </>
                    )}
                  </div>
                </div>

                {/* Content Area */}
                <div className="mt-4">
                  {isEditing ? (
                    <textarea
                      value={editContent}
                      onChange={(e) => setEditContent(e.target.value)}
                      className="input-field h-96 font-mono text-xs leading-relaxed"
                      placeholder="Write your markdown document here..."
                    />
                  ) : (
                    <div className="prose prose-invert max-w-none text-xs text-text-secondary leading-relaxed bg-vault-elevated/20 p-4 rounded-xl border border-border-subtle whitespace-pre-wrap font-mono">
                      {selectedDoc.content}
                    </div>
                  )}
                </div>
              </div>

              {/* Footer status bar */}
              <div className="border-t border-border-subtle pt-4 text-[10px] text-text-muted flex justify-between">
                <span>Document UUID: {selectedDoc.id}</span>
                <span>ManageMyVault Documentation Engine</span>
              </div>
            </div>
          ) : (
            <div className="glass-panel p-12 text-center flex flex-col items-center justify-center min-h-[500px]">
              <FileText className="w-12 h-12 text-text-muted mb-4" />
              <h3 className="text-sm font-bold text-text-primary mb-1">No Document Selected</h3>
              <p className="text-xs text-text-muted max-w-xs">
                Select a document from the left list or create a new one to begin documentation workflows.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
