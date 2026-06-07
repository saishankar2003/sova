import { Request, Response, NextFunction } from 'express';
import { UserRole } from '@nextx/shared';
import { ApiError } from '../utils/apiError';

/**
 * Middleware that checks if the authenticated user has one of the required roles.
 * Must be used AFTER the `authenticate` middleware.
 */
export function authorize(...roles: UserRole[]) {
  return (req: Request, _res: Response, next: NextFunction): void => {
    if (!req.user) {
      throw ApiError.unauthorized();
    }

    if (!roles.includes(req.user.role as UserRole)) {
      throw ApiError.forbidden('You do not have permission to access this resource');
    }

    next();
  };
}
