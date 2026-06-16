import { Router } from 'express';
import { authenticate } from '../../middleware/authenticate';
import { authorize } from '../../middleware/authorize';
import { UserRole } from '@nextx/shared';
import * as adminController from '../../controllers/admin.controller';

const router = Router();

// All admin routes require admin role
router.use(authenticate);
router.use(authorize(UserRole.ADMIN));

// Stats
router.get('/stats/overview', adminController.getStatsOverview);
router.get('/stats/signups', adminController.getStatsSignups);
router.get('/stats/chat-volume', adminController.getStatsChatVolume);
router.get('/stats/subscriptions', adminController.getStatsSubscriptions);

// Users
router.get('/users', adminController.getUsers);
router.get('/users/:id', adminController.getUserById);
router.patch('/users/:id', adminController.updateUser);

// Subscriptions
router.post('/subscriptions/:userId/override', adminController.overrideSubscription);
router.delete('/subscriptions/:userId/override', adminController.removeSubscriptionOverride);

// Documents
router.get('/documents', adminController.getDocuments);
router.get('/documents/:id/download', adminController.downloadDocument);

// Support
router.get('/support/tickets', adminController.getSupportTickets);
router.get('/support/tickets/:id', adminController.getSupportTicketById);
router.post('/support/tickets/:id/reply', adminController.replyToSupportTicket);
router.patch('/support/tickets/:id', adminController.updateSupportTicket);

// Knowledge
router.get('/knowledge', adminController.getKnowledgeArticles);
router.post('/knowledge', adminController.createKnowledgeArticle);
router.patch('/knowledge/:id', adminController.updateKnowledgeArticle);
router.delete('/knowledge/:id', adminController.deleteKnowledgeArticle);

// Alerts
router.get('/alerts/stalled', adminController.getStalledAlerts);
router.post('/alerts/:id/acknowledge', adminController.acknowledgeAlert);

// Audit
router.get('/audit-logs', adminController.getAuditLogs);

export { router as adminRoutes };
