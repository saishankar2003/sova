import mongoose, { Schema, Document, Types } from 'mongoose';

export interface IReminderDocument extends Document {
  userId: Types.ObjectId;
  childId: Types.ObjectId | null;
  journeyEventId: Types.ObjectId | null;
  title: string;
  description: string | null;
  dueAt: Date;
  status: 'pending' | 'sent' | 'completed' | 'snoozed' | 'dismissed';
  snoozedUntil: Date | null;
  deliveryChannels: ('in_app' | 'email')[];
  deliveredAt: Date | null;
  completedAt: Date | null;
}

const reminderSchema = new Schema<IReminderDocument>(
  {
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    childId: { type: Schema.Types.ObjectId, ref: 'Child', default: null },
    journeyEventId: { type: Schema.Types.ObjectId, ref: 'JourneyEvent', default: null },
    title: { type: String, required: true, trim: true },
    description: { type: String, default: null },
    dueAt: { type: Date, required: true },
    status: {
      type: String,
      enum: ['pending', 'sent', 'completed', 'snoozed', 'dismissed'],
      default: 'pending',
    },
    snoozedUntil: { type: Date, default: null },
    deliveryChannels: [{ type: String, enum: ['in_app', 'email'] }],
    deliveredAt: { type: Date, default: null },
    completedAt: { type: Date, default: null },
  },
  { timestamps: true },
);

reminderSchema.index({ userId: 1, status: 1 });
reminderSchema.index({ dueAt: 1, status: 1 });

export const Reminder = mongoose.model<IReminderDocument>('Reminder', reminderSchema);
