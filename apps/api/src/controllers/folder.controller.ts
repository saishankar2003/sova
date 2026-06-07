import { Request, Response, NextFunction } from 'express';
import { Folder } from '../models/Document';
import { sendSuccess, sendCreated, sendNoContent } from '../utils/apiResponse';
import { ApiError } from '../utils/apiError';

export async function listFolders(req: Request, res: Response, next: NextFunction) {
  try {
    const folders = await Folder.find({ userId: req.user!.userId }).sort({ name: 1 });
    sendSuccess(res, folders);
  } catch (error) {
    next(error);
  }
}

export async function createFolder(req: Request, res: Response, next: NextFunction) {
  try {
    const folder = await Folder.create({ ...req.body, userId: req.user!.userId });
    sendCreated(res, folder);
  } catch (error) {
    next(error);
  }
}

export async function updateFolder(req: Request, res: Response, next: NextFunction) {
  try {
    const folder = await Folder.findOneAndUpdate(
      { _id: req.params.id, userId: req.user!.userId },
      { $set: req.body },
      { new: true },
    );
    if (!folder) throw ApiError.notFound('Folder');
    sendSuccess(res, folder);
  } catch (error) {
    next(error);
  }
}

export async function deleteFolder(req: Request, res: Response, next: NextFunction) {
  try {
    const folder = await Folder.findOneAndDelete({ _id: req.params.id, userId: req.user!.userId });
    if (!folder) throw ApiError.notFound('Folder');
    sendNoContent(res);
  } catch (error) {
    next(error);
  }
}
