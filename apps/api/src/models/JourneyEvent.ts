import mongoose, { Schema, Document, Types } from 'mongoose';
import { EHCPStage } from '@nextx/shared';

export interface IJourneyEventDocument extends Document {
  userId: Types.ObjectId;
  childId: Types.ObjectId;
  stage: EHCPStage;
  eventType: 'stage_entered' | 'action_created' | 'action_completed' | 'document_added' | 'note' | 'milestone';
  title: string;
  description: string | null;
  actionStatus: 'pending' | 'completed' | 'overdue' | null;
  dueDate: Date | null;
  completedAt: Date | null;
  relatedDocumentId: Types.ObjectId | null;
}

const journeyEventSchema = new Schema<IJourneyEventDocument>(
  {
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    childId: { type: Schema.Types.ObjectId, ref: 'Child', required: true },
    stage: { type: String, enum: Object.values(EHCPStage), required: true },
    eventType: {
      type: String,
      enum: ['stage_entered', 'action_created', 'action_completed', 'document_added', 'note', 'milestone'],
      required: true,
    },
    title: { type: String, required: true, trim: true },
    description: { type: String, default: null },
    actionStatus: { type: String, enum: ['pending', 'completed', 'overdue', null], default: null },
    dueDate: { type: Date, default: null },
    completedAt: { type: Date, default: null },
    relatedDocumentId: { type: Schema.Types.ObjectId, ref: 'Document', default: null },
  },
  { timestamps: true },
);

journeyEventSchema.index({ userId: 1, childId: 1, createdAt: -1 });
journeyEventSchema.index({ actionStatus: 1, dueDate: 1 });

export const JourneyEvent = mongoose.model<IJourneyEventDocument>('JourneyEvent', journeyEventSchema);
