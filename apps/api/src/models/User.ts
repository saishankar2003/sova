import mongoose, { Schema, Document } from 'mongoose';
import { UserRole } from '@nextx/shared';

export interface IUserDocument extends Document {
  email: string;
  passwordHash: string | null;
  googleId: string | null;
  role: UserRole;
  profile: {
    firstName: string;
    lastName: string;
    avatarUrl: string | null;
    phone: string | null;
  };
  preferences: {
    emailNotifications: boolean;
    reminderEmails: boolean;
    weeklyDigest: boolean;
  };
  emailVerified: boolean;
  emailVerificationToken: string | null;
  passwordResetToken: string | null;
  passwordResetExpires: Date | null;
  refreshTokens: string[];
  stripeCustomerId: string | null;
  lastLoginAt: Date;
  createdAt: Date;
  updatedAt: Date;
}

const userSchema = new Schema<IUserDocument>(
  {
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    passwordHash: { type: String, default: null },
    googleId: { type: String, default: null, sparse: true },
    role: { type: String, enum: Object.values(UserRole), default: UserRole.USER },
    profile: {
      firstName: { type: String, required: true, trim: true },
      lastName: { type: String, required: true, trim: true },
      avatarUrl: { type: String, default: null },
      phone: { type: String, default: null },
    },
    preferences: {
      emailNotifications: { type: Boolean, default: true },
      reminderEmails: { type: Boolean, default: true },
      weeklyDigest: { type: Boolean, default: false },
    },
    emailVerified: { type: Boolean, default: false },
    emailVerificationToken: { type: String, default: null },
    passwordResetToken: { type: String, default: null },
    passwordResetExpires: { type: Date, default: null },
    refreshTokens: [{ type: String }],
    stripeCustomerId: { type: String, default: null },
    lastLoginAt: { type: Date, default: Date.now },
  },
  {
    timestamps: true,
    toJSON: {
      transform(_doc, ret) {
        const obj = ret as any;
        delete obj.passwordHash;
        delete obj.refreshTokens;
        delete obj.emailVerificationToken;
        delete obj.passwordResetToken;
        delete obj.passwordResetExpires;
        delete obj.__v;
        return obj;
      },
    },
  },
);

// Indexes
userSchema.index({ email: 1 });
userSchema.index({ googleId: 1 }, { sparse: true });
userSchema.index({ stripeCustomerId: 1 }, { sparse: true });
userSchema.index({ role: 1 });

export const User = mongoose.model<IUserDocument>('User', userSchema);
