import { Router } from 'express';
import { authenticate } from '../middleware/authenticate';
import * as journeyController from '../controllers/journey.controller';

const router = Router();
router.use(authenticate);

router.get('/children/:childId/timeline', journeyController.getTimeline);
router.post('/children/:childId/events', journeyController.createEvent);
router.patch('/events/:id', journeyController.updateEvent);
router.delete('/events/:id', journeyController.deleteEvent);
router.get('/children/:childId/next-steps', journeyController.getNextSteps);
router.get('/children/:childId/actions', journeyController.getActions);

export { router as journeyRoutes };
