import Stripe from 'stripe';
import { env } from './env';
import { logger } from '../utils/logger';

let stripeClient: Stripe | null = null;

export function initStripe(): Stripe | null {
  if (!env.STRIPE_SECRET_KEY) {
    logger.warn('⚠️  Stripe not configured — payments will not work');
    return null;
  }

  stripeClient = new Stripe(env.STRIPE_SECRET_KEY, {
    typescript: true,
  });

  logger.info('✅ Stripe initialized');
  return stripeClient;
}

export function getStripe(): Stripe {
  if (!stripeClient) {
    throw new Error('Stripe not initialized. Call initStripe() first.');
  }
  return stripeClient;
}
