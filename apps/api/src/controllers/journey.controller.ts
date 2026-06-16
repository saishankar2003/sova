import { Request, Response, NextFunction } from 'express';
import { JourneyEvent } from '../models/JourneyEvent';
import { Child } from '../models/Child';
import { EHCP_STAGE_ORDER, EHCP_STAGE_DESCRIPTIONS, EHCPStage } from '@nextx/shared';
import { sendSuccess, sendCreated, sendNoContent } from '../utils/apiResponse';
import { ApiError } from '../utils/apiError';

const NEXT_STEPS: Record<EHCPStage, string[]> = {
  [EHCPStage.INITIAL_RESEARCH]: [
    'Read the IPSEA and SENDIAS guides on EHCPs',
    'Gather evidence of your child\'s needs (reports, assessments)',
    'Contact your local SENDIASS for free, impartial advice',
    'Join a parent support group or forum',
  ],
  [EHCPStage.REQUEST]: [
    'Write a formal request letter to your Local Authority (LA)',
    'Include supporting evidence from school, GP, or specialists',
    'The LA must respond within 6 weeks — track the deadline',
    'Keep copies of all correspondence',
  ],
  [EHCPStage.ASSESSMENT]: [
    'Attend any arranged assessments and keep notes',
    'Submit your own written evidence to the LA',
    'The LA must complete the assessment within 16 weeks of request',
    'Prepare a parental contribution for the EHCP',
  ],
  [EHCPStage.DRAFT_PLAN]: [
    'Review every section of the draft carefully (especially B, F, and I)',
    'Note any inaccuracies or omissions',
    'Request changes in writing within 15 days',
    'Seek advice from SENDIASS or a solicitor if unhappy',
  ],
  [EHCPStage.FINAL_PLAN]: [
    'Check the named school/provision is correct',
    'Ensure all agreed support is listed in Section F',
    'Note the annual review date',
    'Contact the school SENCO to confirm the plan is being implemented',
  ],
  [EHCPStage.IMPLEMENTATION]: [
    'Meet with the school SENCO to discuss provision delivery',
    'Review progress reports regularly',
    'Log any concerns about provision not being met',
    'Prepare for the annual review',
  ],
  [EHCPStage.ANNUAL_REVIEW]: [
    'Gather evidence of progress since the last review',
    'Request any professional reports in advance',
    'Prepare your views and wishes for the meeting',
    'The LA must issue an amended plan within 8 weeks of the review',
  ],
  [EHCPStage.TRANSITION]: [
    'Plan ahead — start transition discussions at least 2 years before',
    'Research post-16 options (sixth form, college, supported internship)',
    'Update the EHCP to reflect new aspirations and outcomes',
    'Engage with adult social care services if relevant',
  ],
  [EHCPStage.MEDIATION_TRIBUNAL]: [
    'Contact an EHCP mediation service (required before tribunal)',
    'Obtain an independent expert report if needed',
    'Engage a SEND specialist solicitor or advocate',
    'Register your appeal with SENDIST within 2 months of decision',
  ],
};

export async function getTimeline(req: Request, res: Response, next: NextFunction) {
  try {
    const child = await Child.findOne({ _id: req.params.childId, userId: req.user!.userId });
    if (!child) throw ApiError.notFound('Child');

    const events = await JourneyEvent.find({
      userId: req.user!.userId,
      childId: req.params.childId,
    }).sort({ createdAt: -1 });

    const currentStageIndex = EHCP_STAGE_ORDER.indexOf(child.ehcpStage);
    const pendingActionsCount = events.filter(
      (e) => e.actionStatus === 'pending',
    ).length;

    sendSuccess(res, {
      child,
      events,
      currentStage: child.ehcpStage,
      stageProgress: {
        currentStageIndex,
        totalStages: EHCP_STAGE_ORDER.length,
        percentComplete: Math.round(((currentStageIndex + 1) / EHCP_STAGE_ORDER.length) * 100),
      },
      nextStepsHint: EHCP_STAGE_DESCRIPTIONS[child.ehcpStage] ?? null,
      pendingActionsCount,
    });
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

    if (event.eventType === 'stage_entered') {
      child.ehcpStage = event.stage;
      await child.save();
    }

    sendCreated(res, event);
  } catch (error) {
    next(error);
  }
}

export async function advanceStage(req: Request, res: Response, next: NextFunction) {
  try {
    const { stage, note } = req.body;

    const child = await Child.findOne({ _id: req.params.childId, userId: req.user!.userId });
    if (!child) throw ApiError.notFound('Child');

    if (child.ehcpStage === stage) {
      throw ApiError.badRequest(`Child is already at stage: ${stage}`);
    }

    const event = await JourneyEvent.create({
      userId: req.user!.userId,
      childId: req.params.childId,
      stage,
      eventType: 'stage_entered',
      title: `Advanced to ${stage.replace(/_/g, ' ')}`,
      description: note ?? null,
      actionStatus: null,
    });

    child.ehcpStage = stage;
    await child.save();

    sendCreated(res, { child, event });
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

export async function completeAction(req: Request, res: Response, next: NextFunction) {
  try {
    const event = await JourneyEvent.findOneAndUpdate(
      { _id: req.params.id, userId: req.user!.userId },
      { $set: { actionStatus: 'completed', completedAt: new Date() } },
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
    const event = await JourneyEvent.findOneAndDelete({
      _id: req.params.id,
      userId: req.user!.userId,
    });
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

    const pendingActions = await JourneyEvent.find({
      userId: req.user!.userId,
      childId: req.params.childId,
      actionStatus: 'pending',
    }).sort({ dueDate: 1 });

    sendSuccess(res, {
      currentStage: child.ehcpStage,
      currentStageIndex,
      totalStages: EHCP_STAGE_ORDER.length,
      nextSteps: NEXT_STEPS[child.ehcpStage] ?? [],
      stageDescription: EHCP_STAGE_DESCRIPTIONS[child.ehcpStage] ?? '',
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
