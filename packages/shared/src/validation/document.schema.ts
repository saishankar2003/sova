import { z } from 'zod';

export const uploadDocumentSchema = z.object({
  name: z.string().min(1).max(255).optional(),
  folderId: z.string().optional().nullable(),
  childId: z.string().optional().nullable(),
  tags: z.array(z.string().max(50)).max(20).default([]),
  description: z.string().max(500).optional().nullable(),
});

export const updateDocumentSchema = z.object({
  name: z.string().min(1).max(255).optional(),
  folderId: z.string().optional().nullable(),
  tags: z.array(z.string().max(50)).max(20).optional(),
  description: z.string().max(500).optional().nullable(),
});

export const createFolderSchema = z.object({
  name: z.string().min(1, 'Folder name is required').max(100),
  childId: z.string().optional().nullable(),
  parentFolderId: z.string().optional().nullable(),
  color: z.string().regex(/^#[0-9A-Fa-f]{6}$/).optional().nullable(),
});

export const updateFolderSchema = z.object({
  name: z.string().min(1).max(100).optional(),
  parentFolderId: z.string().optional().nullable(),
  color: z.string().regex(/^#[0-9A-Fa-f]{6}$/).optional().nullable(),
});

export type UploadDocumentInput = z.infer<typeof uploadDocumentSchema>;
export type UpdateDocumentInput = z.infer<typeof updateDocumentSchema>;
export type CreateFolderInput = z.infer<typeof createFolderSchema>;
export type UpdateFolderInput = z.infer<typeof updateFolderSchema>;
