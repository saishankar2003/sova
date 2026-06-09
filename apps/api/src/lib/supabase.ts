import { createClient } from '@supabase/supabase-js';
import { env } from '../config/env';
import { logger } from '../utils/logger';

// Initialize Supabase client
const supabaseUrl = env.SUPABASE_URL;
const supabaseKey = env.SUPABASE_SECRET_KEY;

export const supabase = (supabaseUrl && supabaseKey) 
  ? createClient(supabaseUrl, supabaseKey)
  : null;

if (!supabase) {
  logger.warn('⚠️ Supabase not configured — document storage might fall back to Firebase or local');
} else {
  logger.info('✅ Supabase initialized for prototype storage');
}
