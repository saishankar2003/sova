import { EHCPStage } from '../constants/ehcp-stages';

export type JourneyEventType =
  | 'stage_entered'
  | 'action_created'
  | 'action_completed'
  | 'document_added'
  | 'note'
  | 'milestone';

export type ActionStatus = 'pending' | 'completed' | 'overdue';

export interface IJourneyEvent {
  _id: string;
  userId: string;
  childId: string;
  stage: EHCPStage;
  eventType: JourneyEventType;
  title: string;
  description: string | null;
  actionStatus: ActionStatus | null;
  dueDate: string | null;
  completedAt: string | null;
  relatedDocumentId: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface INextStep {
  title: string;
  description: string;
  stage: EHCPStage;
  priority: 'high' | 'medium' | 'low';
  dueDate: string | null;
}
