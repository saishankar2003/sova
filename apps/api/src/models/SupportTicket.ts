import mongoose, { Schema, Document, Types } from 'mongoose';

export interface ITicketMessageSub {
  senderId: Types.ObjectId;
  senderRole: 'user' | 'admin';
  content: string;
  createdAt: Date;
}

export interface ISupportTicketDocument extends Document {
  userId: Types.ObjectId;
  subject: string;
  category: 'general' | 'billing' | 'technical' | 'ehcp_guidance' | 'other';
  status: 'open' | 'in_progress' | 'resolved' | 'closed';
  priority: 'low' | 'medium' | 'high';
  messages: ITicketMessageSub[];
  assignedTo: Types.ObjectId | null;
  resolvedAt: Date | null;
}

const supportTicketSchema = new Schema<ISupportTicketDocument>(
  {
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    subject: { type: String, required: true, trim: true },
    category: {
      type: String,
      enum: ['general', 'billing', 'technical', 'ehcp_guidance', 'other'],
      required: true,
    },
    status: {
      type: String,
      enum: ['open', 'in_progress', 'resolved', 'closed'],
      default: 'open',
    },
    priority: { type: String, enum: ['low', 'medium', 'high'], default: 'medium' },
    messages: [
      {
        senderId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
        senderRole: { type: String, enum: ['user', 'admin'], required: true },
        content: { type: String, required: true },
        createdAt: { type: Date, default: Date.now },
      },
    ],
    assignedTo: { type: Schema.Types.ObjectId, ref: 'User', default: null },
    resolvedAt: { type: Date, default: null },
  },
  { timestamps: true },
);

supportTicketSchema.index({ userId: 1 });
supportTicketSchema.index({ status: 1, createdAt: -1 });

export const SupportTicket = mongoose.model<ISupportTicketDocument>('SupportTicket', supportTicketSchema);
