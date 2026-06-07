import { Router } from 'express';
import * as knowledgeController from '../controllers/knowledge.controller';

const router = Router();

// All knowledge routes are public (read-only)
router.get('/articles', knowledgeController.listArticles);
router.get('/articles/:slug', knowledgeController.getArticle);
router.get('/faq', knowledgeController.getFAQ);
router.get('/ehcp-intro', knowledgeController.getEHCPIntro);

export { router as knowledgeRoutes };
