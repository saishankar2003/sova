import { Request, Response, NextFunction } from 'express';
import { User } from '../models/User';
import { Subscription } from '../models/Subscription';
import { DocumentModel } from '../models/Document';
import { SupportTicket } from '../models/SupportTicket';
import { KnowledgeArticle } from '../models/KnowledgeArticle';
import { AuditLog } from '../models/AuditLog';
import { JourneyEvent } from '../models/JourneyEvent';
import { ChatSession } from '../models/ChatSession';
import { sendSuccess } from '../utils/apiResponse';
import { ApiError } from '../utils/apiError';
import { env } from '../config/env';

// Helper to log admin actions
async function logAudit(actorId: string, action: string, targetType: string, targetId: string, payload: any, req: Request) {
  try {
    await AuditLog.create({
      actorId,
      action,
      targetType,
      targetId,
      payload,
      ipAddress: req.ip || '',
      userAgent: req.headers['user-agent'] || '',
    });
  } catch (error) {
    console.error('Failed to write audit log:', error);
  }
}

// ─── STATS ───

export async function getStatsOverview(req: Request, res: Response, next: NextFunction) {
  try {
    const totalUsers = await User.countDocuments();
    const activeSubscriptions = await Subscription.countDocuments({ status: 'active' });
    const totalDocuments = await DocumentModel.countDocuments();
    const openTickets = await SupportTicket.countDocuments({ status: 'open' });

    sendSuccess(res, {
      totalUsers,
      activeSubscriptions,
      totalDocuments,
      openTickets,
    });
  } catch (error) {
    next(error);
  }
}

export async function getStatsSignups(req: Request, res: Response, next: NextFunction) {
  try {
    const { days = 30 } = req.query;
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - Number(days));

    const signups = await User.aggregate([
      { $match: { createdAt: { $gte: startDate } } },
      { $group: { _id: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } }, count: { $sum: 1 } } },
      { $sort: { _id: 1 } }
    ]);

    sendSuccess(res, { signups });
  } catch (error) {
    next(error);
  }
}

export async function getStatsChatVolume(req: Request, res: Response, next: NextFunction) {
  try {
    const totalChats = await ChatSession.countDocuments();
    sendSuccess(res, { totalChats });
  } catch (error) {
    next(error);
  }
}

export async function getStatsSubscriptions(req: Request, res: Response, next: NextFunction) {
  try {
    const plans = await Subscription.aggregate([
      { $group: { _id: "$plan", count: { $sum: 1 } } }
    ]);
    const statuses = await Subscription.aggregate([
      { $group: { _id: "$status", count: { $sum: 1 } } }
    ]);
    sendSuccess(res, { plans, statuses });
  } catch (error) {
    next(error);
  }
}

// ─── USERS ───

export async function getUsers(req: Request, res: Response, next: NextFunction) {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 50;
    const skip = (page - 1) * limit;

    const users = await User.find()
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .lean();

    const total = await User.countDocuments();

    sendSuccess(res, {
      users,
      pagination: { total, page, limit, pages: Math.ceil(total / limit) }
    });
  } catch (error) {
    next(error);
  }
}

export async function getUserById(req: Request, res: Response, next: NextFunction) {
  try {
    const user = await User.findById(req.params.id).lean();
    if (!user) throw ApiError.notFound('User not found');

    const subscription = await Subscription.findOne({ userId: user._id }).lean();
    const documents = await DocumentModel.find({ userId: user._id }).sort({ createdAt: -1 }).lean();
    const tickets = await SupportTicket.find({ userId: user._id }).sort({ createdAt: -1 }).lean();
    
    sendSuccess(res, { user, subscription, documents, tickets });
  } catch (error) {
    next(error);
  }
}

export async function updateUser(req: Request, res: Response, next: NextFunction) {
  try {
    const user = await User.findByIdAndUpdate(req.params.id, { $set: req.body }, { new: true });
    if (!user) throw ApiError.notFound('User not found');

    await logAudit(req.user!.userId, 'update_user', 'user', user._id.toString(), req.body, req);
    sendSuccess(res, { user });
  } catch (error) {
    next(error);
  }
}

// ─── SUBSCRIPTIONS ───

export async function overrideSubscription(req: Request, res: Response, next: NextFunction) {
  try {
    const { plan, status, expiresAt } = req.body;
    const sub = await Subscription.findOneAndUpdate(
      { userId: req.params.userId },
      { $set: { plan, status, currentPeriodEnd: expiresAt ? new Date(expiresAt) : null, cancelAtPeriodEnd: false } },
      { new: true, upsert: true }
    );

    await logAudit(req.user!.userId, 'override_subscription', 'subscription', sub._id.toString(), req.body, req);
    sendSuccess(res, { subscription: sub });
  } catch (error) {
    next(error);
  }
}

export async function removeSubscriptionOverride(req: Request, res: Response, next: NextFunction) {
  try {
    const sub = await Subscription.findOneAndUpdate(
      { userId: req.params.userId },
      { $set: { plan: 'free', status: 'active', currentPeriodEnd: null } },
      { new: true }
    );

    await logAudit(req.user!.userId, 'remove_subscription_override', 'subscription', sub?._id.toString() || '', {}, req);
    sendSuccess(res, { subscription: sub });
  } catch (error) {
    next(error);
  }
}

// ─── DOCUMENTS ───

export async function getDocuments(req: Request, res: Response, next: NextFunction) {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 50;
    
    const documents = await DocumentModel.find()
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit)
      .populate('userId', 'email profile.firstName profile.lastName')
      .lean();

    const total = await DocumentModel.countDocuments();

    sendSuccess(res, {
      documents,
      pagination: { total, page, limit, pages: Math.ceil(total / limit) }
    });
  } catch (error) {
    next(error);
  }
}

export async function downloadDocument(req: Request, res: Response, next: NextFunction) {
  try {
    const doc = await DocumentModel.findById(req.params.id);
    if (!doc) throw ApiError.notFound('Document not found');

    await logAudit(req.user!.userId, 'download_document', 'document', doc._id.toString(), {}, req);

    if (doc.fileUrl) {
      sendSuccess(res, { downloadUrl: doc.fileUrl });
      return;
    }

    if (doc.firebasePath && doc.firebasePath.startsWith('uploads/')) {
      sendSuccess(res, { downloadUrl: `${env.API_URL}/${doc.firebasePath}` });
      return;
    }

    sendSuccess(res, { downloadUrl: doc.downloadUrl || null });
  } catch (error) {
    next(error);
  }
}

// ─── SUPPORT ───

export async function getSupportTickets(req: Request, res: Response, next: NextFunction) {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 50;
    const status = req.query.status as string;

    const query = status ? { status } : {};

    const tickets = await SupportTicket.find(query)
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit)
      .populate('userId', 'email profile.firstName profile.lastName')
      .lean();

    const total = await SupportTicket.countDocuments(query);

    sendSuccess(res, {
      tickets,
      pagination: { total, page, limit, pages: Math.ceil(total / limit) }
    });
  } catch (error) {
    next(error);
  }
}

export async function getSupportTicketById(req: Request, res: Response, next: NextFunction) {
  try {
    const ticket = await SupportTicket.findById(req.params.id)
      .populate('userId', 'email profile.firstName profile.lastName')
      .lean();
    if (!ticket) throw ApiError.notFound('Ticket not found');

    sendSuccess(res, { ticket });
  } catch (error) {
    next(error);
  }
}

export async function replyToSupportTicket(req: Request, res: Response, next: NextFunction) {
  try {
    const { content } = req.body;
    const ticket = await SupportTicket.findById(req.params.id);
    if (!ticket) throw ApiError.notFound('Ticket not found');

    ticket.messages.push({
      senderId: req.user!.userId as any,
      senderRole: 'admin',
      content,
      createdAt: new Date()
    });
    
    if (ticket.status === 'open') {
      ticket.status = 'in_progress';
    }

    await ticket.save();
    await logAudit(req.user!.userId, 'reply_ticket', 'ticket', ticket._id.toString(), { contentLength: content.length }, req);
    
    sendSuccess(res, { ticket });
  } catch (error) {
    next(error);
  }
}

export async function updateSupportTicket(req: Request, res: Response, next: NextFunction) {
  try {
    const { status, priority, category } = req.body;
    const ticket = await SupportTicket.findById(req.params.id);
    if (!ticket) throw ApiError.notFound('Ticket not found');

    if (status) ticket.status = status;
    if (priority) ticket.priority = priority;
    if (category) ticket.category = category;

    if (status === 'resolved' || status === 'closed') {
      ticket.resolvedAt = new Date();
    }

    await ticket.save();
    await logAudit(req.user!.userId, 'update_ticket', 'ticket', ticket._id.toString(), req.body, req);

    sendSuccess(res, { ticket });
  } catch (error) {
    next(error);
  }
}

// ─── KNOWLEDGE BASE ───

export async function getKnowledgeArticles(req: Request, res: Response, next: NextFunction) {
  try {
    const articles = await KnowledgeArticle.find().sort({ category: 1, order: 1 }).lean();
    sendSuccess(res, { articles });
  } catch (error) {
    next(error);
  }
}

export async function createKnowledgeArticle(req: Request, res: Response, next: NextFunction) {
  try {
    const article = new KnowledgeArticle({
      ...req.body,
      lastEditedBy: req.user!.userId
    });
    await article.save();

    await logAudit(req.user!.userId, 'create_article', 'knowledge', article._id.toString(), { slug: article.slug }, req);
    sendSuccess(res, { article });
  } catch (error) {
    next(error);
  }
}

export async function updateKnowledgeArticle(req: Request, res: Response, next: NextFunction) {
  try {
    const article = await KnowledgeArticle.findByIdAndUpdate(
      req.params.id,
      { $set: { ...req.body, lastEditedBy: req.user!.userId } },
      { new: true }
    );
    if (!article) throw ApiError.notFound('Article not found');

    await logAudit(req.user!.userId, 'update_article', 'knowledge', article._id.toString(), { slug: article.slug }, req);
    sendSuccess(res, { article });
  } catch (error) {
    next(error);
  }
}

export async function deleteKnowledgeArticle(req: Request, res: Response, next: NextFunction) {
  try {
    const article = await KnowledgeArticle.findByIdAndDelete(req.params.id);
    if (!article) throw ApiError.notFound('Article not found');

    await logAudit(req.user!.userId, 'delete_article', 'knowledge', article._id.toString(), { slug: article.slug }, req);
    sendSuccess(res, { message: 'Article deleted' });
  } catch (error) {
    next(error);
  }
}

// ─── ALERTS ───

export async function getStalledAlerts(req: Request, res: Response, next: NextFunction) {
  try {
    // Find users whose last journey event was > 14 days ago
    const staleThreshold = new Date();
    staleThreshold.setDate(staleThreshold.getDate() - 14);

    const latestEvents = await JourneyEvent.aggregate([
      { $sort: { createdAt: -1 } },
      { $group: { _id: "$userId", lastEventDate: { $first: "$createdAt" } } },
      { $match: { lastEventDate: { $lt: staleThreshold } } }
    ]);

    const userIds = latestEvents.map(e => e._id);
    const stalledUsers = await User.find({ _id: { $in: userIds } }).select('email profile').lean();

    sendSuccess(res, { stalledUsers, thresholdDays: 14 });
  } catch (error) {
    next(error);
  }
}

export async function acknowledgeAlert(req: Request, res: Response, next: NextFunction) {
  try {
    // Basic stub
    sendSuccess(res, { message: 'Alert acknowledged' });
  } catch (error) {
    next(error);
  }
}

// ─── AUDIT ───

export async function getAuditLogs(req: Request, res: Response, next: NextFunction) {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 50;

    const logs = await AuditLog.find()
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit)
      .populate('actorId', 'email profile.firstName profile.lastName')
      .lean();

    const total = await AuditLog.countDocuments();

    sendSuccess(res, {
      logs,
      pagination: { total, page, limit, pages: Math.ceil(total / limit) }
    });
  } catch (error) {
    next(error);
  }
}
