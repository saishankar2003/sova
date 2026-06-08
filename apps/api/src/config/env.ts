import { z } from 'zod';

const envSchema = z.object({
  NODE_ENV: z.enum(['development', 'staging', 'production', 'test']).default('development'),
  PORT: z.coerce.number().default(4000),

  // URLs
  API_URL: z.string().url().default('http://localhost:4000'),
  WEB_URL: z.string().url().default('http://localhost:5173'),
  ADMIN_URL: z.string().url().default('http://localhost:5174'),

  // MongoDB
  MONGODB_URI: z.string().default('mongodb://localhost:27017/nextx'),
  MONGODB_DB_NAME: z.string().default('nextx'),

  // Redis
  REDIS_URL: z.string().optional(),

  // JWT
  JWT_ACCESS_SECRET: z
    .string()
    .min(32, 'JWT_ACCESS_SECRET must be at least 32 chars')
    .default('default_jwt_access_secret_key_at_least_32_chars_long'),
  JWT_REFRESH_SECRET: z
    .string()
    .min(32, 'JWT_REFRESH_SECRET must be at least 32 chars')
    .default('default_jwt_refresh_secret_key_at_least_32_chars_long'),
  JWT_ACCESS_EXPIRY: z.string().default('15m'),
  JWT_REFRESH_EXPIRY: z.string().default('7d'),

  // Google OAuth
  GOOGLE_CLIENT_ID: z.string().default(''),
  GOOGLE_CLIENT_SECRET: z.string().default(''),

  // Firebase
  FIREBASE_PROJECT_ID: z.string().default(''),
  FIREBASE_STORAGE_BUCKET: z.string().default(''),
  FIREBASE_SERVICE_ACCOUNT_KEY: z.string().default(''),

  // Stripe
  STRIPE_SECRET_KEY: z.string().default(''),
  STRIPE_WEBHOOK_SECRET: z.string().default(''),
  STRIPE_PRO_PRICE_ID: z.string().default(''),
  STRIPE_PREMIUM_PRICE_ID: z.string().default(''),

  // n8n
  N8N_WEBHOOK_URL: z.string().default(''),
  N8N_WEBHOOK_SECRET: z.string().default(''),
  N8N_TIMEOUT_MS: z.coerce.number().default(30000),

  // Resend
  RESEND_API_KEY: z.string().default(''),
  EMAIL_FROM: z.string().default('NextX <noreply@nextx.co.uk>'),

  // Sentry
  SENTRY_DSN: z.string().default(''),

  // Admin seed
  ADMIN_INITIAL_EMAIL: z.string().email().default('admin@nextx.co.uk'),
  ADMIN_INITIAL_PASSWORD: z.string().default(''),
});

export type Env = z.infer<typeof envSchema>;

function loadEnv(): Env {
  const result = envSchema.safeParse(process.env);

  if (!result.success) {
    console.error('❌ Invalid environment variables:');
    for (const issue of result.error.issues) {
      console.error(`  ${issue.path.join('.')}: ${issue.message}`);
    }
    process.exit(1);
  }

  return result.data;
}

export const env = loadEnv();
