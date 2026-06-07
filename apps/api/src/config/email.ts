import { Resend } from 'resend';
import { env } from './env';
import { logger } from '../utils/logger';

let resendClient: Resend | null = null;

export function initEmail(): Resend | null {
  if (!env.RESEND_API_KEY) {
    logger.warn('⚠️  Resend not configured — emails will not be sent');
    return null;
  }

  resendClient = new Resend(env.RESEND_API_KEY);
  logger.info('✅ Resend email client initialized');
  return resendClient;
}

export function getResend(): Resend {
  if (!resendClient) {
    throw new Error('Resend not initialized. Call initEmail() first.');
  }
  return resendClient;
}
