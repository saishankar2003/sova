export type DocumentSource = 'upload' | 'ai_generated';

export interface IFolder {
  _id: string;
  userId: string;
  childId: string | null;
  name: string;
  parentFolderId: string | null;
  color: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface IDocument {
  _id: string;
  userId: string;
  childId: string | null;
  folderId: string | null;
  source: DocumentSource;
  name: string;
  originalName: string;
  mimeType: string;
  sizeBytes: number;
  firebasePath?: string;
  filePath?: string;
  fileUrl?: string;
  downloadUrl: string | null;
  downloadUrlExpiry: string | null;
  tags: string[];
  description: string | null;
  chatSessionId: string | null;
  createdAt: string;
  updatedAt: string;
}
