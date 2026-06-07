import mongoose, { Schema, Document, Types } from 'mongoose';
import { EHCPStage } from '@nextx/shared';

export interface IChildDocument extends Document {
  userId: Types.ObjectId;
  firstName: string;
  lastName: string;
  dateOfBirth: Date;
  school: string;
  localAuthority: string;
  ehcpStage: EHCPStage;
  notes: string;
  createdAt: Date;
  updatedAt: Date;
}

const childSchema = new Schema<IChildDocument>(
  {
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    firstName: { type: String, required: true, trim: true },
    lastName: { type: String, required: true, trim: true },
    dateOfBirth: { type: Date, required: true },
    school: { type: String, required: true, trim: true },
    localAuthority: { type: String, required: true, trim: true },
    ehcpStage: { type: String, enum: Object.values(EHCPStage), required: true },
    notes: { type: String, default: '' },
  },
  { timestamps: true },
);

export const Child = mongoose.model<IChildDocument>('Child', childSchema);
