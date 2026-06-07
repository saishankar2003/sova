import mongoose, { Schema, Document, Types } from 'mongoose';
import { Plan, SubscriptionStatus } from '@nextx/shared';

export interface ISubscriptionDocument extends Document {
  userId: Types.ObjectId;
  stripeSubscriptionId: string | null;
  stripePriceId: string | null;
  plan: Plan;
  status: SubscriptionStatus;
  currentPeriodStart: Date | null;
  currentPeriodEnd: Date | null;
  cancelAtPeriodEnd: boolean;
  manualOverride: {
    active: boolean;
    grantedBy: Types.ObjectId | null;
    reason: string | null;
    expiresAt: Date | null;
  };
  createdAt: Date;
  updatedAt: Date;
}

const subscriptionSchema = new Schema<ISubscriptionDocument>(
  {
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true, unique: true },
    stripeSubscriptionId: { type: String, default: null },
    stripePriceId: { type: String, default: null },
    plan: { type: String, enum: Object.values(Plan), default: Plan.FREE },
    status: { type: String, enum: Object.values(SubscriptionStatus), default: SubscriptionStatus.ACTIVE },
    currentPeriodStart: { type: Date, default: null },
    currentPeriodEnd: { type: Date, default: null },
    cancelAtPeriodEnd: { type: Boolean, default: false },
    manualOverride: {
      active: { type: Boolean, default: false },
      grantedBy: { type: Schema.Types.ObjectId, ref: 'User', default: null },
      reason: { type: String, default: null },
      expiresAt: { type: Date, default: null },
    },
  },
  { timestamps: true },
);

subscriptionSchema.index({ userId: 1 }, { unique: true });
subscriptionSchema.index({ stripeSubscriptionId: 1 }, { sparse: true });

export const Subscription = mongoose.model<ISubscriptionDocument>('Subscription', subscriptionSchema);
