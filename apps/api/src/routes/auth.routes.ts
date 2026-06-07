import { Router } from 'express';
import { authLimiter } from '../middleware/rateLimiter';
import { validate } from '../middleware/validate';
import {
  signupSchema,
  loginSchema,
  googleAuthSchema,
  forgotPasswordSchema,
  resetPasswordSchema,
} from '@nextx/shared';
import * as authController from '../controllers/auth.controller';

const router = Router();

router.post('/signup', authLimiter, validate(signupSchema), authController.signup);
router.post('/login', authLimiter, validate(loginSchema), authController.login);
router.post('/google', authLimiter, validate(googleAuthSchema), authController.googleAuth);
router.post('/refresh', authController.refreshToken);
router.post('/logout', authController.logout);
router.post('/forgot-password', authLimiter, validate(forgotPasswordSchema), authController.forgotPassword);
router.post('/reset-password', validate(resetPasswordSchema), authController.resetPassword);
router.get('/verify-email/:token', authController.verifyEmail);

export { router as authRoutes };
