import admin from 'firebase-admin';
import { env } from './env';
import { logger } from '../utils/logger';

let firebaseApp: admin.app.App | null = null;

export function initFirebase(): void {
  if (firebaseApp) return;

  if (!env.FIREBASE_SERVICE_ACCOUNT_KEY) {
    logger.warn('⚠️  Firebase not configured — document storage will not work');
    return;
  }

  try {
    const serviceAccount = JSON.parse(
      Buffer.from(env.FIREBASE_SERVICE_ACCOUNT_KEY, 'base64').toString('utf-8'),
    );

    firebaseApp = admin.initializeApp({
      credential: admin.credential.cert(serviceAccount),
      storageBucket: env.FIREBASE_STORAGE_BUCKET,
    });

    logger.info('✅ Firebase initialized');
  } catch (error) {
    logger.error({ err: error }, '❌ Failed to initialize Firebase');
  }
}

export function getStorageBucket(): admin.storage.Storage {
  if (!firebaseApp) {
    throw new Error('Firebase not initialized. Call initFirebase() first.');
  }
  return admin.storage();
}

export { admin };
