import { Request } from 'express';
import type { PaginationMeta, PaginationQuery } from '@nextx/shared';

const DEFAULT_PAGE = 1;
const DEFAULT_LIMIT = 20;
const MAX_LIMIT = 100;

export function parsePagination(req: Request): Required<PaginationQuery> {
  const page = Math.max(1, parseInt(req.query.page as string) || DEFAULT_PAGE);
  const limit = Math.min(MAX_LIMIT, Math.max(1, parseInt(req.query.limit as string) || DEFAULT_LIMIT));
  const sortBy = (req.query.sortBy as string) || 'createdAt';
  const sortOrder = (req.query.sortOrder as string) === 'asc' ? 'asc' : 'desc';

  return { page, limit, sortBy, sortOrder };
}

export function buildPaginationMeta(
  page: number,
  limit: number,
  total: number,
): PaginationMeta {
  return {
    page,
    limit,
    total,
    hasMore: page * limit < total,
  };
}

export function getSkip(page: number, limit: number): number {
  return (page - 1) * limit;
}
