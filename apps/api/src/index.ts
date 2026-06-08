import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import path from 'path';
import fs from 'fs';
import swaggerUi from 'swagger-ui-express';
import { swaggerDocument } from './config/swagger';
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

// Trust reverse proxy (e.g., Render) for correct IP rate limiting
app.set('trust proxy', 1);

// ─── Security ───
app.use(
  helmet({
    contentSecurityPolicy: false,
  }),
);
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

// Serve uploads folder statically
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

// Serve Swagger UI
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument));

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

    // Ensure uploads folder exists
    const uploadsDir = path.join(__dirname, '../uploads');
    if (!fs.existsSync(uploadsDir)) {
      fs.mkdirSync(uploadsDir, { recursive: true });
    }

    app.listen(env.PORT, () => {
      logger.info(`🚀 NextX API running on port ${env.PORT} (${env.NODE_ENV})`);
      logger.info(`   Health: ${env.API_URL}/health`);
      logger.info(`   API:    ${env.API_URL}/api`);
    });
  } catch (error) {
    logger.error({ err: error }, '❌ Failed to start server');
    process.exit(1);
  }
}

if (process.env.NODE_ENV !== 'test') {
  bootstrap();
}

export default app;
