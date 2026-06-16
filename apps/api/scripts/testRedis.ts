/**
 * Test script for Redis / BullMQ reminder pipeline.
 *
 * Usage:
 *   pnpm --filter api tsx scripts/testRedis.ts
 *
 * What it does:
 *   1. Connects to MongoDB + Redis
 *   2. Finds the first user in the DB
 *   3. Creates a reminder with dueAt = 1 minute ago (so it's immediately due)
 *   4. Manually calls enqueueDueReminders() — same function the scheduler uses
 *   5. Prints the BullMQ job ID so you can confirm it was queued
 *   6. The worker (running in the main API process) will pick it up and send the email
 */

import 'dotenv/config';
import mongoose from 'mongoose';
import Redis from 'ioredis';
import { Queue } from 'bullmq';
import { env } from '../src/config/env';

async function main() {
  // ── 1. Connect MongoDB ──────────────────────────────────────────
  console.log('Connecting to MongoDB…');
  await mongoose.connect(env.MONGODB_URI);
  console.log('✅ MongoDB connected');

  // Import models after mongoose connects
  const { User } = await import('../src/models/User');
  const { Reminder } = await import('../src/models/Reminder');

  // ── 2. Find a real user ─────────────────────────────────────────
  const user = await User.findOne().lean();
  if (!user) {
    console.error('❌ No users found in DB. Sign up first via the app.');
    process.exit(1);
  }
  console.log(`✅ Found user: ${user.email}`);

  // ── 3. Create a past-due reminder ──────────────────────────────
  const dueAt = new Date(Date.now() - 60_000); // 1 minute ago
  const reminder = await Reminder.create({
    userId: user._id,
    title: 'Redis Test Reminder',
    description: 'This was created by testRedis.ts to verify the BullMQ pipeline.',
    dueAt,
    status: 'pending',
    deliveryChannels: ['email'],
  });
  console.log(`✅ Created reminder: ${reminder._id} (due ${dueAt.toISOString()})`);

  // ── 4. Enqueue it directly (same logic as the scheduler) ────────
  if (!env.REDIS_URL) {
    console.error('❌ REDIS_URL not set in .env');
    process.exit(1);
  }

  const queue = new Queue('reminders', {
    connection: { url: env.REDIS_URL },
  });

  const job = await queue.add(
    'test-reminder',
    {
      reminderId: String(reminder._id),
      userId: String(user._id),
      title: reminder.title,
      description: reminder.description,
      dueAt: reminder.dueAt.toISOString(),
      deliveryChannels: reminder.deliveryChannels,
      userEmail: 'gadesaishankar@gmail.com',
      userName: `${user.profile.firstName} ${user.profile.lastName}`.trim(),
    },
    {
      jobId: `reminder_${reminder._id}`,
      delay: 0, // process immediately
    },
  );

  console.log(`✅ Job enqueued — ID: ${job.id}`);
  console.log('');
  console.log('Now watch the running API server logs for:');
  console.log('  INFO  Processing reminder job');
  console.log('  INFO  Reminder delivered');
  console.log('');
  console.log('And check your Resend dashboard for the email to:', user.email);

  // ── 5. Poll for job completion (up to 15s) ──────────────────────
  console.log('Waiting up to 15s for worker to process the job…');
  for (let i = 0; i < 15; i++) {
    await new Promise((r) => setTimeout(r, 1000));
    const state = await job.getState();
    process.stdout.write(`\r  Job state: ${state}   `);
    if (state === 'completed') {
      console.log('\n✅ Job completed!');
      break;
    }
    if (state === 'failed') {
      console.log('\n❌ Job failed — check API logs for error details.');
      break;
    }
  }

  await queue.close();
  await mongoose.disconnect();
  process.exit(0);
}

main().catch((err) => {
  console.error('Script error:', err);
  process.exit(1);
});
