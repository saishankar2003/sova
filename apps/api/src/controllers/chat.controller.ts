import { Request, Response, NextFunction } from 'express';
import { ChatSession, ChatMessage } from '../models/ChatSession';
import { sendSuccess, sendCreated } from '../utils/apiResponse';
import { ApiError } from '../utils/apiError';
import { parsePagination, buildPaginationMeta, getSkip } from '../utils/pagination';

export async function listSessions(req: Request, res: Response, next: NextFunction) {
  try {
    const sessions = await ChatSession.find({ userId: req.user!.userId })
      .sort({ lastMessageAt: -1 })
      .limit(50);
    sendSuccess(res, sessions);
  } catch (error) {
    next(error);
  }
}

export async function createSession(req: Request, res: Response, next: NextFunction) {
  try {
    const session = await ChatSession.create({
      userId: req.user!.userId,
      childId: req.body.childId || null,
      title: req.body.title || 'New Chat',
    });
    sendCreated(res, session);
  } catch (error) {
    next(error);
  }
}

export async function getSession(req: Request, res: Response, next: NextFunction) {
  try {
    const session = await ChatSession.findOne({ _id: req.params.id, userId: req.user!.userId });
    if (!session) throw ApiError.notFound('Chat session');
    sendSuccess(res, session);
  } catch (error) {
    next(error);
  }
}

export async function deleteSession(req: Request, res: Response, next: NextFunction) {
  try {
    const session = await ChatSession.findOneAndDelete({ _id: req.params.id, userId: req.user!.userId });
    if (!session) throw ApiError.notFound('Chat session');
    await ChatMessage.deleteMany({ sessionId: session._id });
    sendSuccess(res, { message: 'Session deleted' });
  } catch (error) {
    next(error);
  }
}

export async function sendMessage(req: Request, res: Response, next: NextFunction) {
  try {
    const session = await ChatSession.findOne({ _id: req.params.id, userId: req.user!.userId });
    if (!session) throw ApiError.notFound('Chat session');

    // Save user message
    const userMessage = await ChatMessage.create({
      sessionId: session._id,
      role: 'user',
      content: req.body.content,
    });

    // TODO: Relay to n8n webhook and get response
    // For now, create a placeholder assistant response
    const assistantMessage = await ChatMessage.create({
      sessionId: session._id,
      role: 'assistant',
      content: 'Thank you for your message. The AI assistant is not yet connected — n8n webhook integration is pending.',
      metadata: { n8nExecutionId: null, processingTimeMs: null, error: false },
    });

    // Update session
    session.lastMessageAt = new Date();
    session.messageCount += 2;
    await session.save();

    sendSuccess(res, { userMessage, assistantMessage });
  } catch (error) {
    next(error);
  }
}

export async function getMessages(req: Request, res: Response, next: NextFunction) {
  try {
    const session = await ChatSession.findOne({ _id: req.params.id, userId: req.user!.userId });
    if (!session) throw ApiError.notFound('Chat session');

    const { page, limit } = parsePagination(req);
    const [messages, total] = await Promise.all([
      ChatMessage.find({ sessionId: session._id })
        .sort({ createdAt: 1 })
        .skip(getSkip(page, limit))
        .limit(limit),
      ChatMessage.countDocuments({ sessionId: session._id }),
    ]);

    sendSuccess(res, messages, 200, buildPaginationMeta(page, limit, total));
  } catch (error) {
    next(error);
  }
}
