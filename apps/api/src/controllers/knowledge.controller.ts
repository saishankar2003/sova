import { Request, Response, NextFunction } from 'express';
import { KnowledgeArticle } from '../models/KnowledgeArticle';
import { sendSuccess } from '../utils/apiResponse';
import { ApiError } from '../utils/apiError';

export async function listArticles(req: Request, res: Response, next: NextFunction) {
  try {
    const filter: Record<string, unknown> = { published: true };
    if (req.query.category) filter.category = req.query.category;

    const articles = await KnowledgeArticle.find(filter)
      .select('-content') // List view excludes full content
      .sort({ category: 1, order: 1 });
    sendSuccess(res, articles);
  } catch (error) {
    next(error);
  }
}

export async function getArticle(req: Request, res: Response, next: NextFunction) {
  try {
    const article = await KnowledgeArticle.findOne({ slug: req.params.slug, published: true });
    if (!article) throw ApiError.notFound('Article');
    sendSuccess(res, article);
  } catch (error) {
    next(error);
  }
}

export async function getFAQ(_req: Request, res: Response, next: NextFunction) {
  try {
    const articles = await KnowledgeArticle.find({ category: 'faq', published: true }).sort({ order: 1 });
    sendSuccess(res, articles);
  } catch (error) {
    next(error);
  }
}

export async function getEHCPIntro(_req: Request, res: Response, next: NextFunction) {
  try {
    const articles = await KnowledgeArticle.find({ category: 'ehcp_intro', published: true }).sort({ order: 1 });
    sendSuccess(res, articles);
  } catch (error) {
    next(error);
  }
}
