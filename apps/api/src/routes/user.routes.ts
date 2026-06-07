import { Router } from 'express';
import { authenticate } from '../middleware/authenticate';
import { validate } from '../middleware/validate';
import { updateProfileSchema, changePasswordSchema, updatePreferencesSchema } from '@nextx/shared';
import * as userController from '../controllers/user.controller';

const router = Router();

// All user routes require authentication
router.use(authenticate);

router.get('/me', userController.getMe);
router.patch('/me', validate(updateProfileSchema), userController.updateProfile);
router.patch('/me/password', validate(changePasswordSchema), userController.changePassword);
router.patch('/me/avatar', userController.uploadAvatar);
router.patch('/me/preferences', validate(updatePreferencesSchema), userController.updatePreferences);
router.delete('/me', userController.deleteAccount);

export { router as userRoutes };
