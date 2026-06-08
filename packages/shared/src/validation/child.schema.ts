import { z } from 'zod';
import { EHCPStage } from '../constants/ehcp-stages';

const ehcpStageValues = Object.values(EHCPStage) as [string, ...string[]];

export const createChildSchema = z.object({
  firstName: z.string().min(1, 'First name is required').max(50),
  lastName: z.string().min(1, 'Last name is required').max(50),
  dateOfBirth: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, { message: 'Invalid date format' }),
  school: z.string().min(1, 'School is required').max(200),
  localAuthority: z.string().min(1, 'Local authority is required').max(200),
  ehcpStage: z.enum(ehcpStageValues, { message: 'Invalid EHCP stage' }),
  notes: z.string().max(2000).default(''),
});

export const updateChildSchema = createChildSchema.partial();

export type CreateChildInput = z.infer<typeof createChildSchema>;
export type UpdateChildInput = z.infer<typeof updateChildSchema>;
