import { Router } from 'express';
import { authenticate } from '../middleware/authenticate';
import { validate } from '../middleware/validate';
import { createReminderSchema, updateReminderSchema, snoozeReminderSchema } from '@nextx/shared';
import * as reminderController from '../controllers/reminder.controller';

const router = Router();
router.use(authenticate);

router.get('/', reminderController.listReminders);
router.post('/', validate(createReminderSchema), reminderController.createReminder);
router.patch('/:id', validate(updateReminderSchema), reminderController.updateReminder);
router.post('/:id/complete', reminderController.completeReminder);
router.post('/:id/snooze', validate(snoozeReminderSchema), reminderController.snoozeReminder);
router.post('/:id/dismiss', reminderController.dismissReminder);

export { router as reminderRoutes };
