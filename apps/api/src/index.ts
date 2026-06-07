import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import { env } from './config/env';
import { connectDatabase } from './config/database';
import { initFirebase } from './config/firebase';
import { initStripe } from './config/stripe';
import { initRedis } from './config/redis';
import { initEmail } from './config/email';
import { errorHandler } from './middleware/errorHandler';
import { generalLimiter } from './middleware/rateLimiter';
import { logger } from './utils/logger';
import { routes } from './routes';

const app = express();

// ─── Security ───
app.use(helmet());
app.use(
  cors({
    origin: [env.WEB_URL, env.ADMIN_URL],
    credentials: true,
    methods: ['GET', 'POST', 'PATCH', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  }),
);

// ─── Body parsing ───
// Raw body needed for Stripe webhook verification
app.use('/api/webhooks/stripe', express.raw({ type: 'application/json' }));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// ─── Logging ───
if (env.NODE_ENV !== 'production') {
  app.use(morgan('dev'));
}

// ─── Rate limiting ───
app.use('/api/', generalLimiter);

// ─── Health check ───
app.get('/health', (_req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// ─── API routes ───
app.use('/api', routes);

// ─── 404 handler ───
app.use((_req, res) => {
  res.status(404).json({
    success: false,
    error: { code: 'NOT_FOUND', message: 'Endpoint not found' },
  });
});

// ─── Global error handler ───
app.use(errorHandler);

// ─── Start server ───
async function bootstrap() {
  try {
    // Connect to services
    await connectDatabase();
    initFirebase();
    initStripe();
    initRedis();
    initEmail();

    app.listen(env.PORT, () => {
      logger.info(`🚀 NextX API running on port ${env.PORT} (${env.NODE_ENV})`);
      logger.info(`   Health: ${env.API_URL}/health`);
      logger.info(`   API:    ${env.API_URL}/api`);
    });
  } catch (error) {
    logger.error('❌ Failed to start server:', error);
    process.exit(1);
  }
}

bootstrap();

export default app;
