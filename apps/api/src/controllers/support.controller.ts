import { Request, Response, NextFunction } from 'express';
import { SupportTicket } from '../models/SupportTicket';
import { sendSuccess, sendCreated } from '../utils/apiResponse';
import { ApiError } from '../utils/apiError';

export async function listTickets(req: Request, res: Response, next: NextFunction) {
  try {
    const tickets = await SupportTicket.find({ userId: req.user!.userId }).sort({ createdAt: -1 });
    sendSuccess(res, tickets);
  } catch (error) {
    next(error);
  }
}

export async function createTicket(req: Request, res: Response, next: NextFunction) {
  try {
    const { subject, category, content } = req.body;
    const ticket = await SupportTicket.create({
      userId: req.user!.userId,
      subject,
      category,
      messages: [{ senderId: req.user!.userId, senderRole: 'user', content }],
    });
    sendCreated(res, ticket);
  } catch (error) {
    next(error);
  }
}

export async function getTicket(req: Request, res: Response, next: NextFunction) {
  try {
    const ticket = await SupportTicket.findOne({ _id: req.params.id, userId: req.user!.userId });
    if (!ticket) throw ApiError.notFound('Ticket');
    sendSuccess(res, ticket);
  } catch (error) {
    next(error);
  }
}

export async function replyToTicket(req: Request, res: Response, next: NextFunction) {
  try {
    const ticket = await SupportTicket.findOne({ _id: req.params.id, userId: req.user!.userId });
    if (!ticket) throw ApiError.notFound('Ticket');

    ticket.messages.push({
      senderId: req.user!.userId as any,
      senderRole: 'user',
      content: req.body.content,
      createdAt: new Date(),
    });
    await ticket.save();

    sendSuccess(res, ticket);
  } catch (error) {
    next(error);
  }
}
