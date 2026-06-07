import { EHCPStage } from '../constants/ehcp-stages';

export interface IChild {
  _id: string;
  userId: string;
  firstName: string;
  lastName: string;
  dateOfBirth: string;
  school: string;
  localAuthority: string;
  ehcpStage: EHCPStage;
  notes: string;
  createdAt: string;
  updatedAt: string;
}
