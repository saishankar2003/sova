import { Router } from 'express';
import { authenticate } from '../../middleware/authenticate';
import { authorize } from '../../middleware/authorize';
import { UserRole } from '@nextx/shared';

const router = Router();

// All admin routes require admin role
router.use(authenticate);
router.use(authorize(UserRole.ADMIN));

// Stats
router.get('/stats/overview', (_req, res) => res.json({ success: true, data: {} }));
router.get('/stats/signups', (_req, res) => res.json({ success: true, data: {} }));
router.get('/stats/chat-volume', (_req, res) => res.json({ success: true, data: {} }));
router.get('/stats/subscriptions', (_req, res) => res.json({ success: true, data: {} }));

// Users
router.get('/users', (_req, res) => res.json({ success: true, data: [] }));
router.get('/users/:id', (_req, res) => res.json({ success: true, data: {} }));
router.patch('/users/:id', (_req, res) => res.json({ success: true, data: {} }));

// Subscriptions
router.post('/subscriptions/:userId/override', (_req, res) => res.json({ success: true, data: {} }));
router.delete('/subscriptions/:userId/override', (_req, res) => res.json({ success: true, data: {} }));

// Documents
router.get('/documents', (_req, res) => res.json({ success: true, data: [] }));
router.get('/documents/:id/download', (_req, res) => res.json({ success: true, data: {} }));

// Support
router.get('/support/tickets', (_req, res) => res.json({ success: true, data: [] }));
router.get('/support/tickets/:id', (_req, res) => res.json({ success: true, data: {} }));
router.post('/support/tickets/:id/reply', (_req, res) => res.json({ success: true, data: {} }));
router.patch('/support/tickets/:id', (_req, res) => res.json({ success: true, data: {} }));

// Knowledge
router.get('/knowledge', (_req, res) => res.json({ success: true, data: [] }));
router.post('/knowledge', (_req, res) => res.json({ success: true, data: {} }));
router.patch('/knowledge/:id', (_req, res) => res.json({ success: true, data: {} }));
router.delete('/knowledge/:id', (_req, res) => res.json({ success: true, data: {} }));

// Alerts
router.get('/alerts/stalled', (_req, res) => res.json({ success: true, data: [] }));
router.post('/alerts/:id/acknowledge', (_req, res) => res.json({ success: true, data: {} }));

// Audit
router.get('/audit-logs', (_req, res) => res.json({ success: true, data: [] }));

export { router as adminRoutes };
