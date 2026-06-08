import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '../services/api';
import { useUIStore } from '../stores/uiStore';
import { Button } from '../components/ui/Button/Button';
import { Input } from '../components/ui/Input/Input';
import { Card } from '../components/ui/Card/Card';
import styles from './DocumentsPage.module.css';

interface Folder {
  _id: string;
  name: string;
  color: string | null;
  childId: string | null;
}

interface Child {
  _id: string;
  firstName: string;
  lastName: string;
}

interface DocItem {
  _id: string;
  name: string;
  originalName: string;
  mimeType: string;
  sizeBytes: number;
  folderId: string | null;
  childId: string | null;
  tags: string[];
  description: string | null;
  downloadUrl: string;
  createdAt: string;
}

export function DocumentsPage() {
  const queryClient = useQueryClient();
  const { addToast } = useUIStore();

  // ─── Filter & Selection State ───
  const [selectedFolderId, setSelectedFolderId] = useState<string | 'all' | 'unorganized'>('all');
  const [selectedChildId, setSelectedChildId] = useState<string>('all');
  const [selectedTag, setSelectedTag] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');

  // ─── Modals State ───
  const [showFolderModal, setShowFolderModal] = useState(false);
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [editingFolder, setEditingFolder] = useState<Folder | null>(null);
  const [folderToDelete, setFolderToDelete] = useState<Folder | null>(null);
  const [docToDelete, setDocToDelete] = useState<DocItem | null>(null);
  
  // ─── Folder Form State ───
  const [folderName, setFolderName] = useState('');
  const [folderColor, setFolderColor] = useState('#4f46e5');
  const [folderChildId, setFolderChildId] = useState('');

  // ─── Upload Form State ───
  const [uploadFile, setUploadFile] = useState<File | null>(null);
  const [uploadTitle, setUploadTitle] = useState('');
  const [uploadFolderId, setUploadFolderId] = useState('');
  const [uploadChildId, setUploadChildId] = useState('');
  const [uploadTags, setUploadTags] = useState('');
  const [uploadDescription, setUploadDescription] = useState('');

  // ─── Drag & Drop State ───
  const [dragActive, setDragActive] = useState(false);

  // ─── Queries ───
  const { data: folders = [] } = useQuery<Folder[]>({
    queryKey: ['folders'],
    queryFn: async () => {
      const res = await api.get('/folders');
      return res.data.data;
    },
  });

  const { data: children = [] } = useQuery<Child[]>({
    queryKey: ['children'],
    queryFn: async () => {
      const res = await api.get('/children');
      return res.data.data;
    },
  });

  const { data: docsData, isLoading: docsLoading } = useQuery<{ data: DocItem[] }>({
    queryKey: ['documents', selectedFolderId, selectedChildId, selectedTag, searchQuery],
    queryFn: async () => {
      const params: Record<string, string> = {};
      if (selectedFolderId !== 'all') {
        params.folderId = selectedFolderId === 'unorganized' ? '' : selectedFolderId;
      }
      if (selectedChildId !== 'all') params.childId = selectedChildId;
      if (selectedTag) params.tag = selectedTag;

      let endpoint = '/documents';
      if (searchQuery.trim()) {
        endpoint = '/documents/search';
        params.q = searchQuery;
      }

      const res = await api.get(endpoint, { params });
      return res.data;
    },
  });

  const documents = docsData?.data || [];

  // ─── Get unique tags list for tag cloud filter ───
  const allTags = Array.from(new Set(documents.flatMap((doc) => doc.tags || [])));

  // ─── Folder Mutations ───
  const saveFolderMutation = useMutation({
    mutationFn: async () => {
      const payload = {
        name: folderName,
        color: folderColor,
        childId: folderChildId || null,
      };
      if (editingFolder) {
        return api.patch(`/folders/${editingFolder._id}`, payload);
      }
      return api.post('/folders', payload);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['folders'] });
      setShowFolderModal(false);
      addToast({
        type: 'success',
        title: editingFolder ? 'Folder renamed' : 'Folder created',
      });
      setFolderName('');
    },
    onError: () => {
      addToast({ type: 'error', title: 'Failed to save folder' });
    },
  });

  const deleteFolderMutation = useMutation({
    mutationFn: (id: string) => api.delete(`/folders/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['folders'] });
      if (selectedFolderId === editingFolder?._id) {
        setSelectedFolderId('all');
      }
      addToast({ type: 'success', title: 'Folder deleted' });
    },
    onError: () => {
      addToast({ type: 'error', title: 'Failed to delete folder' });
    },
  });

  // ─── Document Mutations ───
  const uploadDocMutation = useMutation({
    mutationFn: async () => {
      if (!uploadFile) return;
      const formData = new FormData();
      formData.append('file', uploadFile);
      formData.append('name', uploadTitle || uploadFile.name);
      if (uploadFolderId) formData.append('folderId', uploadFolderId);
      if (uploadChildId) formData.append('childId', uploadChildId);
      if (uploadTags) formData.append('tags', uploadTags);
      if (uploadDescription) formData.append('description', uploadDescription);

      return api.post('/documents/upload', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['documents'] });
      setShowUploadModal(false);
      setUploadFile(null);
      setUploadTitle('');
      setUploadTags('');
      setUploadDescription('');
      addToast({ type: 'success', title: 'Document uploaded successfully' });
    },
    onError: () => {
      addToast({ type: 'error', title: 'Failed to upload document' });
    },
  });

  const deleteDocMutation = useMutation({
    mutationFn: (id: string) => api.delete(`/documents/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['documents'] });
      addToast({ type: 'success', title: 'Document deleted' });
    },
    onError: () => {
      addToast({ type: 'error', title: 'Failed to delete document' });
    },
  });

  // ─── Helpers ───
  function formatFileSize(bytes: number): string {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
  }

  function getFileIcon(mime: string): string {
    if (!mime) return '📄';
    const lower = mime.toLowerCase();
    if (lower.includes('pdf')) return '📕';
    if (lower.includes('image') || lower.includes('png') || lower.includes('jpeg')) return '🖼️';
    if (lower.includes('word') || lower.includes('officedocument.word') || lower.includes('msword')) return '📘';
    if (lower.includes('excel') || lower.includes('officedocument.spreadsheet') || lower.includes('csv')) return '📗';
    return '📄';
  }

  // ─── Modal Triggers ───
  function openCreateFolder() {
    setEditingFolder(null);
    setFolderName('');
    setFolderColor('#4f46e5');
    setFolderChildId('');
    setShowFolderModal(true);
  }

  function openEditFolder(folder: Folder, e: React.MouseEvent) {
    e.stopPropagation();
    setEditingFolder(folder);
    setFolderName(folder.name);
    setFolderColor(folder.color || '#4f46e5');
    setFolderChildId(folder.childId || '');
    setShowFolderModal(true);
  }

  function openUpload(file?: File) {
    if (file) {
      setUploadFile(file);
      setUploadTitle(file.name);
    }
    setUploadFolderId(selectedFolderId === 'all' || selectedFolderId === 'unorganized' ? '' : selectedFolderId);
    setUploadChildId(selectedChildId === 'all' ? '' : selectedChildId);
    setShowUploadModal(true);
  }

  // ─── Drag and Drop Handlers ───
  function handleDrag(e: React.DragEvent) {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  }

  function handleDrop(e: React.DragEvent) {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      openUpload(e.dataTransfer.files[0]);
    }
  }

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    if (e.target.files && e.target.files[0]) {
      openUpload(e.target.files[0]);
    }
  }

  async function handleDownload(doc: DocItem) {
    try {
      const res = await api.get(`/documents/${doc._id}/download`);
      const link = document.createElement('a');
      link.href = res.data.data.downloadUrl;
      link.target = '_blank';
      link.download = doc.originalName;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch {
      addToast({ type: 'error', title: 'Failed to download file' });
    }
  }

  return (
    <div className={styles.container}>
      {/* Left Sidebar */}
      <aside className={styles.sidebar}>
        <Button className={styles.createFolderBtn} onClick={openCreateFolder}>
          <span>+</span> Create Folder
        </Button>

        <div className={styles.folderList}>
          <button
            className={`${styles.folderItem} ${selectedFolderId === 'all' ? styles.folderActive : ''}`}
            onClick={() => setSelectedFolderId('all')}
          >
            <span className={styles.folderInfo}>📁 All Documents</span>
          </button>

          <button
            className={`${styles.folderItem} ${selectedFolderId === 'unorganized' ? styles.folderActive : ''}`}
            onClick={() => setSelectedFolderId('unorganized')}
          >
            <span className={styles.folderInfo}>📂 Unorganized</span>
          </button>

          {folders.map((folder) => (
            <button
              key={folder._id}
              className={`${styles.folderItem} ${selectedFolderId === folder._id ? styles.folderActive : ''}`}
              onClick={() => setSelectedFolderId(folder._id)}
            >
              <span className={styles.folderInfo}>
                <span
                  className={styles.folderColor}
                  style={{ backgroundColor: folder.color || '#94a3b8' }}
                />
                {folder.name}
              </span>
              <span className={styles.folderActions}>
                <button
                  className={styles.folderActionBtn}
                  onClick={(e) => openEditFolder(folder, e)}
                  aria-label="Rename folder"
                >
                  ✏️
                </button>
                <button
                  className={styles.folderActionBtn}
                  onClick={(e) => {
                    e.stopPropagation();
                    setFolderToDelete(folder);
                  }}
                  aria-label="Delete folder"
                >
                  🗑️
                </button>
              </span>
            </button>
          ))}
        </div>
      </aside>

      {/* Main Panel */}
      <main className={styles.mainContent}>
        <div className={styles.actionBar}>
          <div className={styles.searchWrapper}>
            <span className={styles.searchIcon}>🔍</span>
            <input
              type="text"
              className={`form-input ${styles.searchInput}`}
              placeholder="Search documents..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>

          <div className={styles.filterBar}>
            <select
              className={styles.filterSelect}
              value={selectedChildId}
              onChange={(e) => setSelectedChildId(e.target.value)}
              aria-label="Filter by child"
            >
              <option value="all">All Children</option>
              {children.map((child) => (
                <option key={child._id} value={child._id}>
                  {child.firstName} {child.lastName}
                </option>
              ))}
            </select>

            <Button onClick={() => openUpload()}>Upload File</Button>
          </div>
        </div>

        {/* Tag Cloud */}
        {allTags.length > 0 && (
          <div className={styles.tagCloud}>
            <span style={{ fontSize: 'var(--text-xs)', color: 'var(--text-tertiary)' }}>Tags:</span>
            <button
              className={`${styles.tagPill} ${!selectedTag ? styles.tagPillActive : ''}`}
              onClick={() => setSelectedTag(null)}
            >
              All
            </button>
            {allTags.map((tag) => (
              <button
                key={tag}
                className={`${styles.tagPill} ${selectedTag === tag ? styles.tagPillActive : ''}`}
                onClick={() => setSelectedTag(selectedTag === tag ? null : tag)}
              >
                #{tag}
              </button>
            ))}
          </div>
        )}

        {/* Upload Drop Zone / Files list */}
        {documents.length === 0 && !docsLoading ? (
          <div
            className={`${styles.uploadZone} ${dragActive ? styles.dragActive : ''}`}
            onDragEnter={handleDrag}
            onDragLeave={handleDrag}
            onDragOver={handleDrag}
            onDrop={handleDrop}
            onClick={() => document.getElementById('file-input')?.click()}
          >
            <input
              id="file-input"
              type="file"
              style={{ display: 'none' }}
              onChange={handleFileChange}
            />
            <div className={styles.uploadIcon}>📤</div>
            <div className={styles.uploadTitle}>Drag and drop your file here</div>
            <div className={styles.uploadSubtitle}>Or click to browse from device (PDF, DOC, PNG, JPG up to 10MB)</div>
          </div>
        ) : (
          <div
            className={`${styles.grid}`}
            onDragEnter={handleDrag}
            onDragOver={handleDrag}
            onDrop={handleDrop}
          >
            {/* Hidden Input for dragging over files grid */}
            <input
              id="grid-file-input"
              type="file"
              style={{ display: 'none' }}
              onChange={handleFileChange}
            />

            {docsLoading ? (
              <div className={styles.emptyState}>Loading...</div>
            ) : (
              documents.map((doc) => (
                <div key={doc._id} className={styles.docCard}>
                  <div className={styles.docHeader}>
                    <div className={styles.docIcon}>{getFileIcon(doc.mimeType)}</div>
                    <div className={styles.docTitleWrapper}>
                      <div className={styles.docTitle} title={doc.name}>
                        {doc.name}
                      </div>
                      <div className={styles.docMeta}>
                        {formatFileSize(doc.sizeBytes)} · {new Date(doc.createdAt).toLocaleDateString()}
                      </div>
                    </div>
                  </div>

                  <p className={styles.docDesc}>
                    {doc.description || 'No description provided.'}
                  </p>

                  {doc.tags && doc.tags.length > 0 && (
                    <div className={styles.docTags}>
                      {doc.tags.map((tag) => (
                        <span key={tag} className={styles.docTag}>
                          #{tag}
                        </span>
                      ))}
                    </div>
                  )}

                  <div className={styles.docFooter}>
                    <span>
                      {doc.childId
                        ? `👶 ${children.find((c) => c._id === doc.childId)?.firstName || 'Child'}`
                        : '🌐 Global'}
                    </span>
                    <div className={styles.docActions}>
                      <Button variant="ghost" size="sm" onClick={() => handleDownload(doc)}>
                        ⬇️ Download
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        style={{ color: 'var(--color-error)' }}
                        onClick={() => setDocToDelete(doc)}
                      >
                        🗑️ Delete
                      </Button>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        )}
      </main>

      {/* Create / Edit Folder Modal */}
      {showFolderModal && (
        <div className={styles.modalOverlay} onClick={() => setShowFolderModal(false)}>
          <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
            <h3 className={styles.modalTitle}>
              {editingFolder ? 'Edit Folder' : 'Create Folder'}
            </h3>
            <form
              onSubmit={(e) => {
                e.preventDefault();
                saveFolderMutation.mutate();
              }}
            >
              <div className={styles.formField}>
                <label className={styles.formLabel}>Folder Name</label>
                <input
                  type="text"
                  required
                  className={styles.formInput}
                  placeholder="e.g. Health Reports"
                  value={folderName}
                  onChange={(e) => setFolderName(e.target.value)}
                />
              </div>

              <div className={styles.formField}>
                <label className={styles.formLabel}>Accent Color</label>
                <input
                  type="color"
                  className={styles.formInput}
                  style={{ height: '40px', padding: '4px' }}
                  value={folderColor}
                  onChange={(e) => setFolderColor(e.target.value)}
                />
              </div>

              <div className={styles.formField}>
                <label className={styles.formLabel}>Associate with Child (Optional)</label>
                <select
                  className={styles.formSelect}
                  value={folderChildId}
                  onChange={(e) => setFolderChildId(e.target.value)}
                >
                  <option value="">None (Global)</option>
                  {children.map((child) => (
                    <option key={child._id} value={child._id}>
                      {child.firstName} {child.lastName}
                    </option>
                  ))}
                </select>
              </div>

              <div className={styles.modalActions}>
                <Button variant="secondary" type="button" onClick={() => setShowFolderModal(false)}>
                  Cancel
                </Button>
                <Button type="submit" loading={saveFolderMutation.isPending}>
                  {editingFolder ? 'Save Changes' : 'Create'}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Upload File Modal */}
      {showUploadModal && (
        <div className={styles.modalOverlay} onClick={() => setShowUploadModal(false)}>
          <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
            <h3 className={styles.modalTitle}>Upload Document</h3>
            <form
              onSubmit={(e) => {
                e.preventDefault();
                uploadDocMutation.mutate();
              }}
            >
              <div className={styles.formField}>
                <label className={styles.formLabel}>Select File</label>
                {uploadFile ? (
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: 'var(--space-2) var(--space-3)', background: 'var(--color-gray-100)', borderRadius: 'var(--radius-md)' }}>
                    <span style={{ fontSize: 'var(--text-xs)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: '300px' }}>
                      📎 {uploadFile.name}
                    </span>
                    <Button variant="ghost" size="sm" onClick={() => setUploadFile(null)}>Remove</Button>
                  </div>
                ) : (
                  <input
                    type="file"
                    required
                    className={styles.formInput}
                    onChange={(e) => {
                      if (e.target.files && e.target.files[0]) {
                        setUploadFile(e.target.files[0]);
                        setUploadTitle(e.target.files[0].name);
                      }
                    }}
                  />
                )}
              </div>

              <div className={styles.formField}>
                <label className={styles.formLabel}>Document Title</label>
                <input
                  type="text"
                  required
                  className={styles.formInput}
                  value={uploadTitle}
                  onChange={(e) => setUploadTitle(e.target.value)}
                />
              </div>

              <div className={styles.formField}>
                <label className={styles.formLabel}>Folder (Optional)</label>
                <select
                  className={styles.formSelect}
                  value={uploadFolderId}
                  onChange={(e) => setUploadFolderId(e.target.value)}
                >
                  <option value="">Root / Unorganized</option>
                  {folders.map((folder) => (
                    <option key={folder._id} value={folder._id}>
                      {folder.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className={styles.formField}>
                <label className={styles.formLabel}>Associate with Child (Optional)</label>
                <select
                  className={styles.formSelect}
                  value={uploadChildId}
                  onChange={(e) => setUploadChildId(e.target.value)}
                >
                  <option value="">None (Global)</option>
                  {children.map((child) => (
                    <option key={child._id} value={child._id}>
                      {child.firstName} {child.lastName}
                    </option>
                  ))}
                </select>
              </div>

              <div className={styles.formField}>
                <label className={styles.formLabel}>Tags (comma-separated)</label>
                <input
                  type="text"
                  className={styles.formInput}
                  placeholder="e.g. medical, speech, 2026"
                  value={uploadTags}
                  onChange={(e) => setUploadTags(e.target.value)}
                />
              </div>

              <div className={styles.formField}>
                <label className={styles.formLabel}>Description</label>
                <textarea
                  className={styles.formTextarea}
                  rows={3}
                  value={uploadDescription}
                  onChange={(e) => setUploadDescription(e.target.value)}
                />
              </div>

              <div className={styles.modalActions}>
                <Button variant="secondary" type="button" onClick={() => setShowUploadModal(false)}>
                  Cancel
                </Button>
                <Button type="submit" loading={uploadDocMutation.isPending} disabled={!uploadFile}>
                  Upload
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Folder Modal */}
      {folderToDelete && (
        <div className={styles.modalOverlay} onClick={() => setFolderToDelete(null)}>
          <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
            <h3 className={styles.modalTitle}>Confirm Delete Folder</h3>
            <p style={{ marginBottom: 'var(--space-4)', color: 'var(--text-secondary)' }}>
              Are you sure you want to delete the folder "{folderToDelete.name}"? Documents inside will remain in the "Unorganized" section.
            </p>
            <div className={styles.modalActions}>
              <Button type="button" variant="secondary" onClick={() => setFolderToDelete(null)}>
                Cancel
              </Button>
              <Button
                type="button"
                variant="danger"
                onClick={() => {
                  deleteFolderMutation.mutate(folderToDelete._id);
                  setFolderToDelete(null);
                }}
              >
                Delete Folder
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Document Modal */}
      {docToDelete && (
        <div className={styles.modalOverlay} onClick={() => setDocToDelete(null)}>
          <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
            <h3 className={styles.modalTitle}>Confirm Delete Document</h3>
            <p style={{ marginBottom: 'var(--space-4)', color: 'var(--text-secondary)' }}>
              Are you sure you want to permanently delete the document "{docToDelete.name}"? This action cannot be undone.
            </p>
            <div className={styles.modalActions}>
              <Button type="button" variant="secondary" onClick={() => setDocToDelete(null)}>
                Cancel
              </Button>
              <Button
                type="button"
                variant="danger"
                onClick={() => {
                  deleteDocMutation.mutate(docToDelete._id);
                  setDocToDelete(null);
                }}
              >
                Delete Document
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
