import { Request, Response, NextFunction } from 'express';
import { ApiError } from '../utils/apiError';
import { sendError } from '../utils/apiResponse';
import { logger } from '../utils/logger';

/**
 * Global error handling middleware.
 * Catches ApiError instances and unknown errors, returning consistent JSON responses.
 */
export function errorHandler(err: Error, req: Request, res: Response, _next: NextFunction): void {
  // Handle known API errors
  if (err instanceof ApiError) {
    sendError(res, err.statusCode, err.code, err.message, err.details);
    return;
  }

  // Handle Mongoose validation errors
  if (err.name === 'ValidationError') {
    sendError(res, 422, 'VALIDATION_ERROR', 'Database validation failed');
    return;
  }

  // Handle Mongoose cast errors (invalid ObjectId, etc.)
  if (err.name === 'CastError') {
    sendError(res, 400, 'BAD_REQUEST', 'Invalid ID format');
    return;
  }

  // Handle JSON parse errors
  if (err instanceof SyntaxError && 'body' in err) {
    sendError(res, 400, 'BAD_REQUEST', 'Invalid JSON in request body');
    return;
  }

  // Handle JWT errors
  if (err.name === 'JsonWebTokenError') {
    sendError(res, 401, 'UNAUTHORIZED', 'Invalid token');
    return;
  }

  if (err.name === 'TokenExpiredError') {
    sendError(res, 401, 'TOKEN_EXPIRED', 'Token has expired');
    return;
  }

  // Unknown errors
  logger.error({ err, url: req.url, method: req.method }, 'Unhandled error');
  sendError(res, 500, 'INTERNAL_ERROR', 'An unexpected error occurred');
}
