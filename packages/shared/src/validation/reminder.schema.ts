import { z } from 'zod';

export const createReminderSchema = z.object({
  childId: z.string().optional().nullable(),
  journeyEventId: z.string().optional().nullable(),
  title: z.string().min(1, 'Title is required').max(200),
  description: z.string().max(1000).optional().nullable(),
  dueAt: z.string().datetime({ message: 'Invalid date format' }),
  deliveryChannels: z
    .array(z.enum(['in_app', 'email']))
    .min(1, 'At least one delivery channel required')
    .default(['in_app']),
});

export const updateReminderSchema = z.object({
  title: z.string().min(1).max(200).optional(),
  description: z.string().max(1000).optional().nullable(),
  dueAt: z.string().datetime().optional(),
  deliveryChannels: z.array(z.enum(['in_app', 'email'])).min(1).optional(),
});

export const snoozeReminderSchema = z.object({
  snoozedUntil: z.string().datetime({ message: 'Invalid date format' }),
});

export type CreateReminderInput = z.infer<typeof createReminderSchema>;
export type UpdateReminderInput = z.infer<typeof updateReminderSchema>;
export type SnoozeReminderInput = z.infer<typeof snoozeReminderSchema>;
