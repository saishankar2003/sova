import { Router } from 'express';
import { authenticate } from '../middleware/authenticate';
import { validate } from '../middleware/validate';
import { createTicketSchema, replyToTicketSchema } from '@nextx/shared';
import * as supportController from '../controllers/support.controller';

const router = Router();
router.use(authenticate);

router.get('/tickets', supportController.listTickets);
router.post('/tickets', validate(createTicketSchema), supportController.createTicket);
router.get('/tickets/:id', supportController.getTicket);
router.post('/tickets/:id/messages', validate(replyToTicketSchema), supportController.replyToTicket);

export { router as supportRoutes };
