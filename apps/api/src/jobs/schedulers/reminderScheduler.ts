import { getReminderQueue } from '../queue';
import { Reminder } from '../../models/Reminder';
import { User } from '../../models/User';
import { logger } from '../../utils/logger';

/** How often the scheduler polls for due reminders (ms). */
const POLL_INTERVAL_MS = 60 * 1000; // 1 minute

let schedulerTimer: ReturnType<typeof setInterval> | null = null;

async function enqueueDueReminders(): Promise<void> {
  const now = new Date();
  // Find reminders due in the past or within the next minute that are still pending
  const lookahead = new Date(now.getTime() + POLL_INTERVAL_MS);

  const dueReminders = await Reminder.find({
    status: 'pending',
    dueAt: { $lte: lookahead },
  }).lean();

  if (dueReminders.length === 0) return;

  const queue = getReminderQueue();

  for (const reminder of dueReminders) {
    const user = await User.findById(reminder.userId).select('email profile').lean();
    if (!user) continue;

    const delay = Math.max(0, reminder.dueAt.getTime() - Date.now());

    await queue.add(
      `reminder:${reminder._id}`,
      {
        reminderId: String(reminder._id),
        userId: String(reminder.userId),
        title: reminder.title,
        description: reminder.description,
        dueAt: reminder.dueAt.toISOString(),
        deliveryChannels: reminder.deliveryChannels,
        userEmail: user.email,
        userName: `${user.profile.firstName} ${user.profile.lastName}`.trim(),
      },
      {
        delay,
        jobId: `reminder_${reminder._id}`, // deduplicate — BullMQ ignores duplicate jobIds
      },
    );
  }

  logger.info({ count: dueReminders.length }, 'Enqueued due reminders');
}

export function startReminderScheduler(): void {
  // Run immediately on startup, then every minute
  enqueueDueReminders().catch((err) =>
    logger.error({ err }, 'Failed initial reminder scan'),
  );

  schedulerTimer = setInterval(() => {
    enqueueDueReminders().catch((err) =>
      logger.error({ err }, 'Failed reminder scan'),
    );
  }, POLL_INTERVAL_MS);

  logger.info('✅ Reminder scheduler started (polling every 60s)');
}

export function stopReminderScheduler(): void {
  if (schedulerTimer) {
    clearInterval(schedulerTimer);
    schedulerTimer = null;
  }
}
