import { Plan, SubscriptionStatus } from '../constants/roles';

export interface IManualOverride {
  active: boolean;
  grantedBy: string | null;
  reason: string | null;
  expiresAt: string | null;
}

export interface ISubscription {
  _id: string;
  userId: string;
  stripeSubscriptionId: string | null;
  stripePriceId: string | null;
  plan: Plan;
  status: SubscriptionStatus;
  currentPeriodStart: string | null;
  currentPeriodEnd: string | null;
  cancelAtPeriodEnd: boolean;
  manualOverride: IManualOverride;
  createdAt: string;
  updatedAt: string;
}
