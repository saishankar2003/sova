import mongoose, { Schema, Document, Types } from 'mongoose';

export interface IAuditLogDocument extends Document {
  actorId: Types.ObjectId;
  action: string;
  targetType: 'user' | 'subscription' | 'document' | 'knowledge' | 'ticket';
  targetId: Types.ObjectId;
  payload: Record<string, unknown>;
  ipAddress: string;
  userAgent: string;
  createdAt: Date;
}

const auditLogSchema = new Schema<IAuditLogDocument>(
  {
    actorId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    action: { type: String, required: true },
    targetType: {
      type: String,
      enum: ['user', 'subscription', 'document', 'knowledge', 'ticket'],
      required: true,
    },
    targetId: { type: Schema.Types.ObjectId, required: true },
    payload: { type: Schema.Types.Mixed, default: {} },
    ipAddress: { type: String, default: '' },
    userAgent: { type: String, default: '' },
  },
  { timestamps: true },
);

auditLogSchema.index({ actorId: 1, createdAt: -1 });
auditLogSchema.index({ targetType: 1, targetId: 1 });
auditLogSchema.index({ createdAt: -1 });
// TTL: auto-delete after 1 year
auditLogSchema.index({ createdAt: 1 }, { expireAfterSeconds: 365 * 24 * 60 * 60 });

export const AuditLog = mongoose.model<IAuditLogDocument>('AuditLog', auditLogSchema);
