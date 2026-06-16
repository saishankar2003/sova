import { z } from 'zod';
import { EHCPStage } from '../constants/ehcp-stages';

export const journeyEventTypeEnum = z.enum([
  'stage_entered',
  'action_created',
  'action_completed',
  'document_added',
  'note',
  'milestone',
]);

export const createJourneyEventSchema = z.object({
  stage: z.nativeEnum(EHCPStage),
  eventType: journeyEventTypeEnum as z.ZodEnum<['stage_entered', 'action_created', 'action_completed', 'document_added', 'note', 'milestone']>,
  title: z.string().min(1, 'Title is required').max(200),
  description: z.string().max(2000).nullable().optional(),
  actionStatus: z.enum(['pending', 'completed', 'overdue']).nullable().optional(),
  dueDate: z.string().datetime().nullable().optional(),
  relatedDocumentId: z.string().nullable().optional(),
});

export const updateJourneyEventSchema = createJourneyEventSchema.partial();

export const advanceStageSchema = z.object({
  stage: z.nativeEnum(EHCPStage),
  note: z.string().max(500).optional(),
});

export type JourneyEventTypeEnum = z.infer<typeof journeyEventTypeEnum>;
export type CreateJourneyEventInput = z.infer<typeof createJourneyEventSchema>;
export type UpdateJourneyEventInput = z.infer<typeof updateJourneyEventSchema>;
export type AdvanceStageInput = z.infer<typeof advanceStageSchema>;
