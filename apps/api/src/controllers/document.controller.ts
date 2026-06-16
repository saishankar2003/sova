import { Request, Response, NextFunction } from 'express';
import mongoose from 'mongoose';
import fs from 'fs';
import path from 'path';
import { DocumentModel } from '../models/Document';
import { getStorageBucket } from '../config/firebase';
import { env } from '../config/env';
import { sendSuccess, sendCreated, sendNoContent } from '../utils/apiResponse';
import { ApiError } from '../utils/apiError';
import { parsePagination, buildPaginationMeta, getSkip } from '../utils/pagination';
import { uploadEhcpDocument } from '../services/fileUpload.service';

export async function listDocuments(req: Request, res: Response, next: NextFunction) {
  try {
    const { page, limit, sortBy, sortOrder } = parsePagination(req);
    const filter: Record<string, unknown> = { userId: req.user!.userId };

    if (req.query.folderId) filter.folderId = req.query.folderId;
    if (req.query.childId) filter.childId = req.query.childId;
    if (req.query.tag) filter.tags = req.query.tag;

    const [documents, total] = await Promise.all([
      DocumentModel.find(filter)
        .sort({ [sortBy]: sortOrder === 'asc' ? 1 : -1 })
        .skip(getSkip(page, limit))
        .limit(limit),
      DocumentModel.countDocuments(filter),
    ]);

    sendSuccess(res, documents, 200, buildPaginationMeta(page, limit, total));
  } catch (error) {
    next(error);
  }
}

export async function uploadDocument(req: Request, res: Response, next: NextFunction) {
  try {
    const file = req.file;
    if (!file) {
      throw ApiError.badRequest('No file uploaded');
    }

    const userId = req.user!.userId;
    const name = req.body.name || file.originalname;
    const folderId = req.body.folderId || null;
    const childId = req.body.childId || null;
    const description = req.body.description || null;

    let tags: string[] = [];
    if (req.body.tags) {
      if (Array.isArray(req.body.tags)) {
        tags = req.body.tags;
      } else if (typeof req.body.tags === 'string') {
        tags = req.body.tags
          .split(',')
          .map((t: string) => t.trim())
          .filter(Boolean);
      }
    }

    let firebasePath = '';
    let filePath = '';
    let fileUrl = '';
    let downloadUrl = '';

    // Check if we should use Supabase (prototype)
    if (env.SUPABASE_URL) {
      const result = await uploadEhcpDocument(file.buffer, file.originalname, file.mimetype);
      filePath = result.path;
      fileUrl = result.publicUrl;
      downloadUrl = result.publicUrl;
    } else {
      // Fallback: Check if Firebase service account is configured
      let useFirebase = false;
      try {
        getStorageBucket();
        useFirebase = true;
      } catch {
        useFirebase = false;
      }

      if (useFirebase) {
        const bucket = getStorageBucket().bucket();
        const docId = new mongoose.Types.ObjectId();
        firebasePath = `users/${userId}/documents/${docId}/${file.originalname}`;
        
        const fileRef = bucket.file(firebasePath);
        await fileRef.save(file.buffer, {
          metadata: {
            contentType: file.mimetype,
            metadata: { uploadedBy: String(userId), documentId: String(docId) },
          },
        });

        // Generate signed URL (valid for 1 hour)
        const [url] = await fileRef.getSignedUrl({
          action: 'read',
          expires: Date.now() + 60 * 60 * 1000,
        });
        downloadUrl = url;
      } else {
        // Fallback: Local filesystem
        const uploadsDir = path.join(__dirname, '../../uploads');
        if (!fs.existsSync(uploadsDir)) {
          fs.mkdirSync(uploadsDir, { recursive: true });
        }
        const filename = `${Date.now()}-${Math.round(Math.random() * 1e9)}-${file.originalname}`;
        const localPath = path.join(uploadsDir, filename);
        fs.writeFileSync(localPath, file.buffer);
        
        firebasePath = `uploads/${filename}`;
        downloadUrl = `${env.API_URL}/uploads/${filename}`;
      }
    }

    const doc = await DocumentModel.create({
      userId,
      childId,
      folderId,
      source: 'upload',
      name,
      originalName: file.originalname,
      mimeType: file.mimetype,
      sizeBytes: file.size,
      firebasePath,
      filePath,
      fileUrl,
      downloadUrl,
      downloadUrlExpiry: (env.SUPABASE_URL || !firebasePath) ? null : new Date(Date.now() + 60 * 60 * 1000),
      tags,
      description,
    });

    sendCreated(res, doc);
  } catch (error: any) {
    console.error('UPLOAD ERROR:', error);
    res.status(500).json({ success: false, error: error.message, stack: error.stack });
  }
}

export async function getDocument(req: Request, res: Response, next: NextFunction) {
  try {
    const doc = await DocumentModel.findOne({ _id: req.params.id, userId: req.user!.userId });
    if (!doc) throw ApiError.notFound('Document');
    sendSuccess(res, doc);
  } catch (error) {
    next(error);
  }
}

export async function downloadDocument(req: Request, res: Response, next: NextFunction) {
  try {
    const doc = await DocumentModel.findOne({ _id: req.params.id, userId: req.user!.userId });
    if (!doc) throw ApiError.notFound('Document');

    // If Supabase fileUrl exists, return that
    if (doc.fileUrl) {
      sendSuccess(res, { downloadUrl: doc.fileUrl });
      return;
    }

    // If local path, return direct download link
    if (doc.firebasePath && doc.firebasePath.startsWith('uploads/')) {
      sendSuccess(res, { downloadUrl: `${env.API_URL}/${doc.firebasePath}` });
      return;
    }

    // Otherwise generate signed URL from Firebase
    try {
      if (!doc.firebasePath) {
        throw ApiError.notFound('File path not found in document');
      }
      const bucket = getStorageBucket().bucket();
      const fileRef = bucket.file(doc.firebasePath);
      const [url] = await fileRef.getSignedUrl({
        action: 'read',
        expires: Date.now() + 60 * 60 * 1000,
      });

      doc.downloadUrl = url;
      doc.downloadUrlExpiry = new Date(Date.now() + 60 * 60 * 1000);
      await doc.save();

      sendSuccess(res, { downloadUrl: url });
    } catch {
      // Fallback
      sendSuccess(res, { downloadUrl: doc.downloadUrl });
    }
  } catch (error) {
    next(error);
  }
}

export async function updateDocument(req: Request, res: Response, next: NextFunction) {
  try {
    const doc = await DocumentModel.findOneAndUpdate(
      { _id: req.params.id, userId: req.user!.userId },
      { $set: req.body },
      { new: true },
    );
    if (!doc) throw ApiError.notFound('Document');
    sendSuccess(res, doc);
  } catch (error) {
    next(error);
  }
}

export async function deleteDocument(req: Request, res: Response, next: NextFunction) {
  try {
    const doc = await DocumentModel.findOneAndDelete({ _id: req.params.id, userId: req.user!.userId });
    if (!doc) throw ApiError.notFound('Document');

    if (doc.filePath) {
      // It's in Supabase - optionally delete from Supabase if needed
      // but for prototype we can leave it or add deletion logic later
    } else if (doc.firebasePath && doc.firebasePath.startsWith('uploads/')) {
      const localFilePath = path.join(__dirname, '../../', doc.firebasePath);
      if (fs.existsSync(localFilePath)) {
        fs.unlinkSync(localFilePath);
      }
    } else if (doc.firebasePath) {
      // Delete from Firebase
      try {
        const bucket = getStorageBucket().bucket();
        await bucket.file(doc.firebasePath).delete();
      } catch {
        // Ignore firebase deletion errors if firebase not set up
      }
    }

    sendNoContent(res);
  } catch (error) {
    next(error);
  }
}

export async function searchDocuments(req: Request, res: Response, next: NextFunction) {
  try {
    const { q } = req.query;
    if (!q) throw ApiError.badRequest('Search query "q" is required');

    const documents = await DocumentModel.find({
      userId: req.user!.userId,
      $text: { $search: q as string },
    }).limit(20);

    sendSuccess(res, documents);
  } catch (error) {
    next(error);
  }
}
