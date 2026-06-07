import { Request, Response, NextFunction } from 'express';
import { JourneyEvent } from '../models/JourneyEvent';
import { Child } from '../models/Child';
import { EHCP_STAGE_ORDER } from '@nextx/shared';
import { sendSuccess, sendCreated, sendNoContent } from '../utils/apiResponse';
import { ApiError } from '../utils/apiError';

export async function getTimeline(req: Request, res: Response, next: NextFunction) {
  try {
    const child = await Child.findOne({ _id: req.params.childId, userId: req.user!.userId });
    if (!child) throw ApiError.notFound('Child');

    const events = await JourneyEvent.find({
      userId: req.user!.userId,
      childId: req.params.childId,
    }).sort({ createdAt: -1 });

    sendSuccess(res, { child, events, currentStage: child.ehcpStage });
  } catch (error) {
    next(error);
  }
}

export async function createEvent(req: Request, res: Response, next: NextFunction) {
  try {
    const child = await Child.findOne({ _id: req.params.childId, userId: req.user!.userId });
    if (!child) throw ApiError.notFound('Child');

    const event = await JourneyEvent.create({
      ...req.body,
      userId: req.user!.userId,
      childId: req.params.childId,
    });

    // If it's a stage_entered event, update child's current stage
    if (event.eventType === 'stage_entered') {
      child.ehcpStage = event.stage;
      await child.save();
    }

    sendCreated(res, event);
  } catch (error) {
    next(error);
  }
}

export async function updateEvent(req: Request, res: Response, next: NextFunction) {
  try {
    const event = await JourneyEvent.findOneAndUpdate(
      { _id: req.params.id, userId: req.user!.userId },
      { $set: req.body },
      { new: true },
    );
    if (!event) throw ApiError.notFound('Journey event');
    sendSuccess(res, event);
  } catch (error) {
    next(error);
  }
}

export async function deleteEvent(req: Request, res: Response, next: NextFunction) {
  try {
    const event = await JourneyEvent.findOneAndDelete({ _id: req.params.id, userId: req.user!.userId });
    if (!event) throw ApiError.notFound('Journey event');
    sendNoContent(res);
  } catch (error) {
    next(error);
  }
}

export async function getNextSteps(req: Request, res: Response, next: NextFunction) {
  try {
    const child = await Child.findOne({ _id: req.params.childId, userId: req.user!.userId });
    if (!child) throw ApiError.notFound('Child');

    const currentStageIndex = EHCP_STAGE_ORDER.indexOf(child.ehcpStage);

    // Get pending actions
    const pendingActions = await JourneyEvent.find({
      userId: req.user!.userId,
      childId: req.params.childId,
      actionStatus: 'pending',
    }).sort({ dueDate: 1 });

    sendSuccess(res, {
      currentStage: child.ehcpStage,
      currentStageIndex,
      totalStages: EHCP_STAGE_ORDER.length,
      pendingActions,
    });
  } catch (error) {
    next(error);
  }
}

export async function getActions(req: Request, res: Response, next: NextFunction) {
  try {
    const child = await Child.findOne({ _id: req.params.childId, userId: req.user!.userId });
    if (!child) throw ApiError.notFound('Child');

    const [pending, completed] = await Promise.all([
      JourneyEvent.find({
        userId: req.user!.userId,
        childId: req.params.childId,
        eventType: { $in: ['action_created', 'action_completed'] },
        actionStatus: 'pending',
      }).sort({ dueDate: 1 }),
      JourneyEvent.find({
        userId: req.user!.userId,
        childId: req.params.childId,
        actionStatus: 'completed',
      }).sort({ completedAt: -1 }),
    ]);

    sendSuccess(res, { pending, completed });
  } catch (error) {
    next(error);
  }
}
