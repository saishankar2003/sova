import { Router } from 'express';
import { authenticate } from '../middleware/authenticate';
import { validate } from '../middleware/validate';
import {
  createJourneyEventSchema,
  updateJourneyEventSchema,
  advanceStageSchema,
} from '@nextx/shared';
import * as journeyController from '../controllers/journey.controller';

const router = Router();

router.use(authenticate);

router.get('/children/:childId/timeline', journeyController.getTimeline);
router.get('/children/:childId/next-steps', journeyController.getNextSteps);
router.get('/children/:childId/actions', journeyController.getActions);

router.post(
  '/children/:childId/events',
  validate(createJourneyEventSchema),
  journeyController.createEvent,
);
router.post(
  '/children/:childId/advance-stage',
  validate(advanceStageSchema),
  journeyController.advanceStage,
);
router.patch(
  '/events/:id',
  validate(updateJourneyEventSchema),
  journeyController.updateEvent,
);
router.post('/events/:id/complete', journeyController.completeAction);
router.delete('/events/:id', journeyController.deleteEvent);

export { router as journeyRoutes };
