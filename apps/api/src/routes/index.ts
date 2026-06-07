import { Router } from 'express';
import { authRoutes } from './auth.routes';
import { userRoutes } from './user.routes';
import { childRoutes } from './child.routes';
import { folderRoutes } from './folder.routes';
import { documentRoutes } from './document.routes';
import { chatRoutes } from './chat.routes';
import { journeyRoutes } from './journey.routes';
import { reminderRoutes } from './reminder.routes';
import { subscriptionRoutes } from './subscription.routes';
import { supportRoutes } from './support.routes';
import { knowledgeRoutes } from './knowledge.routes';
import { webhookRoutes } from './webhook.routes';
import { adminRoutes } from './admin';

const router = Router();

// Public + authenticated routes
router.use('/auth', authRoutes);
router.use('/users', userRoutes);
router.use('/children', childRoutes);
router.use('/folders', folderRoutes);
router.use('/documents', documentRoutes);
router.use('/chat', chatRoutes);
router.use('/journey', journeyRoutes);
router.use('/reminders', reminderRoutes);
router.use('/subscriptions', subscriptionRoutes);
router.use('/support', supportRoutes);
router.use('/knowledge', knowledgeRoutes);
router.use('/webhooks', webhookRoutes);

// Admin routes
router.use('/admin', adminRoutes);

export { router as routes };
