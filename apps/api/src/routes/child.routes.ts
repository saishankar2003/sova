import { Router } from 'express';
import { authenticate } from '../middleware/authenticate';
import { validate } from '../middleware/validate';
import { createChildSchema, updateChildSchema } from '@nextx/shared';
import * as childController from '../controllers/child.controller';

const router = Router();
router.use(authenticate);

router.get('/', childController.listChildren);
router.post('/', validate(createChildSchema), childController.createChild);
router.get('/:id', childController.getChild);
router.patch('/:id', validate(updateChildSchema), childController.updateChild);
router.delete('/:id', childController.deleteChild);

export { router as childRoutes };
