import mongoose, { Schema, Document, Types } from 'mongoose';

export interface IFolderDocument extends Document {
  userId: Types.ObjectId;
  childId: Types.ObjectId | null;
  name: string;
  parentFolderId: Types.ObjectId | null;
  color: string | null;
}

const folderSchema = new Schema<IFolderDocument>(
  {
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    childId: { type: Schema.Types.ObjectId, ref: 'Child', default: null },
    name: { type: String, required: true, trim: true },
    parentFolderId: { type: Schema.Types.ObjectId, ref: 'Folder', default: null },
    color: { type: String, default: null },
  },
  { timestamps: true },
);

folderSchema.index({ userId: 1, parentFolderId: 1 });

export const Folder = mongoose.model<IFolderDocument>('Folder', folderSchema);

// ─── Documents ───

export interface IDocumentDocument extends Document {
  userId: Types.ObjectId;
  childId: Types.ObjectId | null;
  folderId: Types.ObjectId | null;
  source: 'upload' | 'ai_generated';
  name: string;
  originalName: string;
  mimeType: string;
  sizeBytes: number;
  firebasePath?: string;
  filePath?: string;
  fileUrl?: string;
  downloadUrl: string | null;
  downloadUrlExpiry: Date | null;
  tags: string[];
  description: string | null;
  chatSessionId: Types.ObjectId | null;
}

const documentSchema = new Schema<IDocumentDocument>(
  {
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    childId: { type: Schema.Types.ObjectId, ref: 'Child', default: null },
    folderId: { type: Schema.Types.ObjectId, ref: 'Folder', default: null },
    source: { type: String, enum: ['upload', 'ai_generated'], required: true },
    name: { type: String, required: true, trim: true },
    originalName: { type: String, required: true },
    mimeType: { type: String, required: true },
    sizeBytes: { type: Number, required: true },
    firebasePath: { type: String, required: false },
    filePath: { type: String, required: false },
    fileUrl: { type: String, required: false },
    downloadUrl: { type: String, default: null },
    downloadUrlExpiry: { type: Date, default: null },
    tags: [{ type: String, trim: true }],
    description: { type: String, default: null },
    chatSessionId: { type: Schema.Types.ObjectId, ref: 'ChatSession', default: null },
  },
  { timestamps: true },
);

documentSchema.index({ userId: 1, folderId: 1 });
documentSchema.index({ userId: 1, tags: 1 });
documentSchema.index({ userId: 1, createdAt: -1 });
documentSchema.index({ name: 'text', tags: 'text', description: 'text' });

export const DocumentModel = mongoose.model<IDocumentDocument>('Document', documentSchema);
