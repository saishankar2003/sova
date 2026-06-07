import { Request, Response, NextFunction } from 'express';
import { DocumentModel } from '../models/Document';
import { sendSuccess, sendCreated, sendNoContent } from '../utils/apiResponse';
import { ApiError } from '../utils/apiError';
import { parsePagination, buildPaginationMeta, getSkip } from '../utils/pagination';

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
    // TODO: Handle multer + Firebase upload
    sendSuccess(res, { message: 'Document upload not yet implemented — requires Firebase config' });
  } catch (error) {
    next(error);
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

    // TODO: Generate signed download URL from Firebase
    sendSuccess(res, { downloadUrl: doc.downloadUrl || 'Firebase not configured' });
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
    // TODO: Delete from Firebase Storage
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
