import { Queue } from 'bullmq';
import { env } from '../config/env';
import { logger } from '../utils/logger';

export const QUEUE_NAMES = {
  REMINDERS: 'reminders',
  STALLED_JOURNEY: 'stalled-journey',
} as const;

export interface ReminderJobData {
  reminderId: string;
  userId: string;
  title: string;
  description: string | null;
  dueAt: string;
  deliveryChannels: ('in_app' | 'email')[];
  userEmail: string;
  userName: string;
}

export interface StalledJourneyJobData {
  triggerDate: string;
}

// BullMQ manages its own ioredis connection — pass URL, not the shared client,
// to avoid the dual-ioredis-version type conflict.
function bullConnection() {
  return { url: env.REDIS_URL! };
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
let reminderQueue: Queue<any> | null = null;
// eslint-disable-next-line @typescript-eslint/no-explicit-any
let stalledJourneyQueue: Queue<any> | null = null;

export function initQueues(): void {
  reminderQueue = new Queue(QUEUE_NAMES.REMINDERS, {
    connection: bullConnection(),
    defaultJobOptions: {
      attempts: 3,
      backoff: { type: 'exponential', delay: 5000 },
      removeOnComplete: { count: 100 },
      removeOnFail: { count: 50 },
    },
  });

  stalledJourneyQueue = new Queue(QUEUE_NAMES.STALLED_JOURNEY, {
    connection: bullConnection(),
    defaultJobOptions: {
      attempts: 2,
      backoff: { type: 'fixed', delay: 60000 },
      removeOnComplete: { count: 10 },
      removeOnFail: { count: 10 },
    },
  });

  logger.info('✅ BullMQ queues initialized');
}

export function getReminderQueue(): Queue<ReminderJobData> {
  if (!reminderQueue) throw new Error('Queues not initialized. Call initQueues() first.');
  return reminderQueue as Queue<ReminderJobData>;
}

export function getStalledJourneyQueue(): Queue<StalledJourneyJobData> {
  if (!stalledJourneyQueue) throw new Error('Queues not initialized. Call initQueues() first.');
  return stalledJourneyQueue as Queue<StalledJourneyJobData>;
}

export async function closeQueues(): Promise<void> {
  await reminderQueue?.close();
  await stalledJourneyQueue?.close();
}

export { bullConnection };
