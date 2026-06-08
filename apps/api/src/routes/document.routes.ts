import { Router } from 'express';
import multer from 'multer';
import { authenticate } from '../middleware/authenticate';
import { uploadLimiter } from '../middleware/rateLimiter';
import * as documentController from '../controllers/document.controller';

const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB limit
  },
});

const router = Router();
router.use(authenticate);

router.get('/', documentController.listDocuments);
router.post('/upload', uploadLimiter, upload.single('file'), documentController.uploadDocument);
router.get('/search', documentController.searchDocuments);
router.get('/:id', documentController.getDocument);
router.get('/:id/download', documentController.downloadDocument);
router.patch('/:id', documentController.updateDocument);
router.delete('/:id', documentController.deleteDocument);

export { router as documentRoutes };
