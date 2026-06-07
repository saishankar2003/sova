export type AuditTargetType = 'user' | 'subscription' | 'document' | 'knowledge' | 'ticket';

export interface IAuditLog {
  _id: string;
  actorId: string;
  action: string;
  targetType: AuditTargetType;
  targetId: string;
  payload: Record<string, unknown>;
  ipAddress: string;
  userAgent: string;
  createdAt: string;
}

export interface IDashboardStats {
  totalUsers: number;
  newUsers: number;
  activeUsers: number;
  totalChatMessages: number;
  activeSubscriptions: number;
  churnedSubscriptions: number;
  newConversions: number;
  totalDocuments: number;
}
