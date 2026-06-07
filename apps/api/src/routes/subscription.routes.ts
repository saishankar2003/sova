import { Router } from 'express';
import { authenticate } from '../middleware/authenticate';
import * as subscriptionController from '../controllers/subscription.controller';

const router = Router();

router.get('/plans', subscriptionController.getPlans);
router.get('/status', authenticate, subscriptionController.getStatus);
router.post('/checkout', authenticate, subscriptionController.createCheckout);
router.post('/portal', authenticate, subscriptionController.createPortal);

export { router as subscriptionRoutes };
