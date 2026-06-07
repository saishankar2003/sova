import { Request, Response, NextFunction } from 'express';
import { Reminder } from '../models/Reminder';
import { sendSuccess, sendCreated } from '../utils/apiResponse';
import { ApiError } from '../utils/apiError';

export async function listReminders(req: Request, res: Response, next: NextFunction) {
  try {
    const filter: Record<string, unknown> = { userId: req.user!.userId };
    if (req.query.status) filter.status = req.query.status;

    const reminders = await Reminder.find(filter).sort({ dueAt: 1 });
    sendSuccess(res, reminders);
  } catch (error) {
    next(error);
  }
}

export async function createReminder(req: Request, res: Response, next: NextFunction) {
  try {
    const reminder = await Reminder.create({ ...req.body, userId: req.user!.userId });
    sendCreated(res, reminder);
  } catch (error) {
    next(error);
  }
}

export async function updateReminder(req: Request, res: Response, next: NextFunction) {
  try {
    const reminder = await Reminder.findOneAndUpdate(
      { _id: req.params.id, userId: req.user!.userId },
      { $set: req.body },
      { new: true },
    );
    if (!reminder) throw ApiError.notFound('Reminder');
    sendSuccess(res, reminder);
  } catch (error) {
    next(error);
  }
}

export async function completeReminder(req: Request, res: Response, next: NextFunction) {
  try {
    const reminder = await Reminder.findOneAndUpdate(
      { _id: req.params.id, userId: req.user!.userId },
      { $set: { status: 'completed', completedAt: new Date() } },
      { new: true },
    );
    if (!reminder) throw ApiError.notFound('Reminder');
    sendSuccess(res, reminder);
  } catch (error) {
    next(error);
  }
}

export async function snoozeReminder(req: Request, res: Response, next: NextFunction) {
  try {
    const reminder = await Reminder.findOneAndUpdate(
      { _id: req.params.id, userId: req.user!.userId },
      { $set: { status: 'snoozed', snoozedUntil: req.body.snoozedUntil } },
      { new: true },
    );
    if (!reminder) throw ApiError.notFound('Reminder');
    sendSuccess(res, reminder);
  } catch (error) {
    next(error);
  }
}

export async function dismissReminder(req: Request, res: Response, next: NextFunction) {
  try {
    const reminder = await Reminder.findOneAndUpdate(
      { _id: req.params.id, userId: req.user!.userId },
      { $set: { status: 'dismissed' } },
      { new: true },
    );
    if (!reminder) throw ApiError.notFound('Reminder');
    sendSuccess(res, reminder);
  } catch (error) {
    next(error);
  }
}
