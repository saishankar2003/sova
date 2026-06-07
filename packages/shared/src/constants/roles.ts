// ─── User roles ───
export enum UserRole {
  USER = 'user',
  ADMIN = 'admin',
}

// ─── Subscription plans ───
export enum Plan {
  FREE = 'free',
  PRO = 'pro',
  PREMIUM = 'premium',
}

// ─── Subscription status ───
export enum SubscriptionStatus {
  ACTIVE = 'active',
  TRIALING = 'trialing',
  PAST_DUE = 'past_due',
  CANCELED = 'canceled',
  UNPAID = 'unpaid',
  MANUAL_OVERRIDE = 'manual_override',
}
