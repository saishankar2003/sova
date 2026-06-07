import mongoose, { Schema, Document, Types } from 'mongoose';

export interface IChatSessionDocument extends Document {
  userId: Types.ObjectId;
  childId: Types.ObjectId | null;
  title: string;
  lastMessageAt: Date;
  messageCount: number;
}

const chatSessionSchema = new Schema<IChatSessionDocument>(
  {
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    childId: { type: Schema.Types.ObjectId, ref: 'Child', default: null },
    title: { type: String, default: 'New Chat' },
    lastMessageAt: { type: Date, default: Date.now },
    messageCount: { type: Number, default: 0 },
  },
  { timestamps: true },
);

chatSessionSchema.index({ userId: 1, lastMessageAt: -1 });

export const ChatSession = mongoose.model<IChatSessionDocument>('ChatSession', chatSessionSchema);

// ─── Chat Messages ───

export interface IChatMessageDocument extends Document {
  sessionId: Types.ObjectId;
  role: 'user' | 'assistant';
  content: string;
  metadata: {
    n8nExecutionId: string | null;
    processingTimeMs: number | null;
    error: boolean;
  };
  createdAt: Date;
}

const chatMessageSchema = new Schema<IChatMessageDocument>(
  {
    sessionId: { type: Schema.Types.ObjectId, ref: 'ChatSession', required: true },
    role: { type: String, enum: ['user', 'assistant'], required: true },
    content: { type: String, required: true },
    metadata: {
      n8nExecutionId: { type: String, default: null },
      processingTimeMs: { type: Number, default: null },
      error: { type: Boolean, default: false },
    },
  },
  { timestamps: true },
);

chatMessageSchema.index({ sessionId: 1, createdAt: 1 });

export const ChatMessage = mongoose.model<IChatMessageDocument>('ChatMessage', chatMessageSchema);
