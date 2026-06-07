import { Router } from 'express';
import { authenticate } from '../middleware/authenticate';
import { uploadLimiter } from '../middleware/rateLimiter';
import * as documentController from '../controllers/document.controller';

const router = Router();
router.use(authenticate);

router.get('/', documentController.listDocuments);
router.post('/upload', uploadLimiter, documentController.uploadDocument);
router.get('/search', documentController.searchDocuments);
router.get('/:id', documentController.getDocument);
router.get('/:id/download', documentController.downloadDocument);
router.patch('/:id', documentController.updateDocument);
router.delete('/:id', documentController.deleteDocument);

export { router as documentRoutes };
