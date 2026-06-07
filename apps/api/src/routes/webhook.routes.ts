import { Router } from 'express';
import * as webhookController from '../controllers/webhook.controller';

const router = Router();

// Stripe webhook — raw body already parsed in index.ts
router.post('/stripe', webhookController.handleStripeWebhook);

export { router as webhookRoutes };
