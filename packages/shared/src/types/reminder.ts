export type ReminderStatus = 'pending' | 'sent' | 'completed' | 'snoozed' | 'dismissed';
export type DeliveryChannel = 'in_app' | 'email';

export interface IReminder {
  _id: string;
  userId: string;
  childId: string | null;
  journeyEventId: string | null;
  title: string;
  description: string | null;
  dueAt: string;
  status: ReminderStatus;
  snoozedUntil: string | null;
  deliveryChannels: DeliveryChannel[];
  deliveredAt: string | null;
  completedAt: string | null;
  createdAt: string;
  updatedAt: string;
}
