import { Worker, Job } from 'bullmq';
import { Reminder } from '../../models/Reminder';
import { logger } from '../../utils/logger';
import { env } from '../../config/env';
import type { ReminderJobData } from '../queue';
import { QUEUE_NAMES, bullConnection } from '../queue';

async function sendReminderEmail(data: ReminderJobData): Promise<void> {
  if (!env.RESEND_API_KEY) return;

  // Lazy import so the worker doesn't fail if Resend isn't configured
  const { getResend } = await import('../../config/email');
  const resend = getResend();

  const dueDateFormatted = new Date(data.dueAt).toLocaleDateString('en-GB', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  // Resend free tier requires a verified domain for custom FROM addresses.
  // Fall back to onboarding@resend.dev when the domain isn't verified yet.
  const from =
    env.NODE_ENV === 'production' ? env.EMAIL_FROM : 'NextX <onboarding@resend.dev>';

  const { data: sent, error } = await resend.emails.send({
    from,
    to: data.userEmail,
    subject: `Reminder: ${data.title}`,
    html: `
      <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #1a1a1a;">📅 Reminder: ${data.title}</h2>
        ${data.description ? `<p style="color: #555;">${data.description}</p>` : ''}
        <p style="color: #555;">Due: <strong>${dueDateFormatted}</strong></p>
        <hr style="border: none; border-top: 1px solid #eee; margin: 24px 0;" />
        <p style="color: #999; font-size: 13px;">
          This reminder was set in your <a href="${env.WEB_URL}">NextX EHCP Journey</a>.
          <br/>To manage your reminders, visit <a href="${env.WEB_URL}/reminders">${env.WEB_URL}/reminders</a>.
        </p>
      </div>
    `,
  });

  if (error) {
    logger.error({ error }, 'Resend API error');
    throw new Error(`Resend failed: ${error.message}`);
  }

  logger.info({ emailId: sent?.id, to: data.userEmail }, 'Reminder email sent via Resend');
}

export function startReminderWorker(): Worker {
  const worker = new Worker(
    QUEUE_NAMES.REMINDERS,
    async (job: Job<ReminderJobData>) => {
      const { reminderId, deliveryChannels } = job.data;

      logger.info({ reminderId }, 'Processing reminder job');

      const reminder = await Reminder.findById(reminderId);
      if (!reminder) {
        logger.warn({ reminderId }, 'Reminder not found — skipping');
        return;
      }

      // Skip if already handled (idempotency guard)
      if (reminder.status !== 'pending') {
        logger.info({ reminderId, status: reminder.status }, 'Reminder already processed — skipping');
        return;
      }

      if (deliveryChannels.includes('email')) {
        await sendReminderEmail(job.data);
      }

      await Reminder.findByIdAndUpdate(reminderId, {
        status: 'sent',
        deliveredAt: new Date(),
      });

      logger.info({ reminderId }, 'Reminder delivered');
    },
    {
      connection: bullConnection(),
      concurrency: 5,
    },
  );

  worker.on('completed', (job) => {
    logger.info({ jobId: job.id, reminderId: job.data.reminderId }, 'Reminder job completed');
  });

  worker.on('failed', (job, err) => {
    logger.error({ jobId: job?.id, err }, 'Reminder job failed');
  });

  logger.info('✅ Reminder worker started');
  return worker;
}
