import { Router } from 'express';
import { authenticate } from '../middleware/authenticate';
import * as chatController from '../controllers/chat.controller';

const router = Router();
router.use(authenticate);

router.get('/sessions', chatController.listSessions);
router.post('/sessions', chatController.createSession);
router.get('/sessions/:id', chatController.getSession);
router.delete('/sessions/:id', chatController.deleteSession);
router.post('/sessions/:id/messages', chatController.sendMessage);
router.get('/sessions/:id/messages', chatController.getMessages);

export { router as chatRoutes };
