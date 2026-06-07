import { Plan } from './roles';

export interface PlanConfig {
  id: Plan;
  name: string;
  description: string;
  priceMonthly: number; // in pence (GBP)
  features: string[];
  highlighted?: boolean;
}

export const PLAN_CONFIGS: Record<Plan, PlanConfig> = {
  [Plan.FREE]: {
    id: Plan.FREE,
    name: 'Free',
    description: 'Get started with the basics',
    priceMonthly: 0,
    features: [
      'EHCP journey overview',
      'Basic document storage (5 documents)',
      'FAQ access',
      'Community support',
    ],
  },
  [Plan.PRO]: {
    id: Plan.PRO,
    name: 'Pro',
    description: 'Everything you need for your EHCP journey',
    priceMonthly: 999, // £9.99
    highlighted: true,
    features: [
      'Everything in Free',
      'Unlimited AI chat support',
      'Full journey tracker with next steps',
      'Unlimited document storage',
      'Reminders & follow-ups',
      'Priority email support',
    ],
  },
  [Plan.PREMIUM]: {
    id: Plan.PREMIUM,
    name: 'Premium',
    description: 'Maximum support for complex cases',
    priceMonthly: 1999, // £19.99
    features: [
      'Everything in Pro',
      'Multiple children support',
      'AI-generated document drafts',
      'Dedicated support agent',
      'Tribunal & mediation guidance',
      'Weekly progress digest',
    ],
  },
};
