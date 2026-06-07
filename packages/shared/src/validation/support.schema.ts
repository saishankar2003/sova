import { z } from 'zod';

export const createTicketSchema = z.object({
  subject: z.string().min(1, 'Subject is required').max(200),
  category: z.enum(['general', 'billing', 'technical', 'ehcp_guidance', 'other']),
  content: z.string().min(1, 'Message is required').max(5000),
});

export const replyToTicketSchema = z.object({
  content: z.string().min(1, 'Reply is required').max(5000),
});

export type CreateTicketInput = z.infer<typeof createTicketSchema>;
export type ReplyToTicketInput = z.infer<typeof replyToTicketSchema>;
