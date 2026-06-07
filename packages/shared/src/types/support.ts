export type TicketCategory = 'general' | 'billing' | 'technical' | 'ehcp_guidance' | 'other';
export type TicketStatus = 'open' | 'in_progress' | 'resolved' | 'closed';
export type TicketPriority = 'low' | 'medium' | 'high';

export interface ITicketMessage {
  senderId: string;
  senderRole: 'user' | 'admin';
  content: string;
  createdAt: string;
}

export interface ISupportTicket {
  _id: string;
  userId: string;
  subject: string;
  category: TicketCategory;
  status: TicketStatus;
  priority: TicketPriority;
  messages: ITicketMessage[];
  assignedTo: string | null;
  resolvedAt: string | null;
  createdAt: string;
  updatedAt: string;
}
