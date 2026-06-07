import { Response } from 'express';
import type { PaginationMeta } from '@nextx/shared';

export function sendSuccess<T>(res: Response, data: T, statusCode = 200, meta?: PaginationMeta) {
  const response: { success: true; data: T; meta?: PaginationMeta } = {
    success: true,
    data,
  };

  if (meta) {
    response.meta = meta;
  }

  return res.status(statusCode).json(response);
}

export function sendError(
  res: Response,
  statusCode: number,
  code: string,
  message: string,
  details?: Array<{ field: string; message: string }>,
) {
  return res.status(statusCode).json({
    success: false,
    error: {
      code,
      message,
      ...(details && { details }),
    },
  });
}

export function sendCreated<T>(res: Response, data: T) {
  return sendSuccess(res, data, 201);
}

export function sendNoContent(res: Response) {
  return res.status(204).send();
}
