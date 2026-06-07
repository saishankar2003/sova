import { Request, Response, NextFunction } from 'express';
import { sendSuccess } from '../utils/apiResponse';
import { logger } from '../utils/logger';

export async function handleStripeWebhook(req: Request, res: Response, next: NextFunction) {
  try {
    // TODO: Verify Stripe webhook signature and handle events
    // const sig = req.headers['stripe-signature'];
    // const event = stripe.webhooks.constructEvent(req.body, sig, env.STRIPE_WEBHOOK_SECRET);

    logger.info('Stripe webhook received (handler not yet implemented)');
    sendSuccess(res, { received: true });
  } catch (error) {
    next(error);
  }
}
