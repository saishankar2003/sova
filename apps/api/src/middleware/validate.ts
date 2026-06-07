import { Request, Response, NextFunction } from 'express';
import { ZodSchema } from 'zod';
import { ApiError } from '../utils/apiError';

/**
 * Middleware factory that validates request body against a Zod schema.
 * On failure, throws a structured validation error with field-level details.
 */
export function validate(schema: ZodSchema) {
  return (req: Request, _res: Response, next: NextFunction): void => {
    const result = schema.safeParse(req.body);

    if (!result.success) {
      const details = result.error.issues.map((issue) => ({
        field: issue.path.join('.'),
        message: issue.message,
      }));
      throw ApiError.validationError(details);
    }

    // Replace body with parsed (and potentially transformed) data
    req.body = result.data;
    next();
  };
}

/**
 * Validates query parameters against a Zod schema.
 */
export function validateQuery(schema: ZodSchema) {
  return (req: Request, _res: Response, next: NextFunction): void => {
    const result = schema.safeParse(req.query);

    if (!result.success) {
      const details = result.error.issues.map((issue) => ({
        field: issue.path.join('.'),
        message: issue.message,
      }));
      throw ApiError.validationError(details);
    }

    req.query = result.data;
    next();
  };
}
