import { Request, Response, NextFunction } from 'express';
import { Child } from '../models/Child';
import { sendSuccess, sendCreated, sendNoContent } from '../utils/apiResponse';
import { ApiError } from '../utils/apiError';

export async function listChildren(req: Request, res: Response, next: NextFunction) {
  try {
    const children = await Child.find({ userId: req.user!.userId }).sort({ createdAt: -1 });
    sendSuccess(res, children);
  } catch (error) {
    next(error);
  }
}

export async function createChild(req: Request, res: Response, next: NextFunction) {
  try {
    const child = await Child.create({ ...req.body, userId: req.user!.userId });
    sendCreated(res, child);
  } catch (error) {
    next(error);
  }
}

export async function getChild(req: Request, res: Response, next: NextFunction) {
  try {
    const child = await Child.findOne({ _id: req.params.id, userId: req.user!.userId });
    if (!child) throw ApiError.notFound('Child');
    sendSuccess(res, child);
  } catch (error) {
    next(error);
  }
}

export async function updateChild(req: Request, res: Response, next: NextFunction) {
  try {
    const child = await Child.findOneAndUpdate(
      { _id: req.params.id, userId: req.user!.userId },
      { $set: req.body },
      { new: true },
    );
    if (!child) throw ApiError.notFound('Child');
    sendSuccess(res, child);
  } catch (error) {
    next(error);
  }
}

export async function deleteChild(req: Request, res: Response, next: NextFunction) {
  try {
    const child = await Child.findOneAndDelete({ _id: req.params.id, userId: req.user!.userId });
    if (!child) throw ApiError.notFound('Child');
    sendNoContent(res);
  } catch (error) {
    next(error);
  }
}
