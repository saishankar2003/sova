import { UserRole } from '../constants/roles';

export interface IUserProfile {
  firstName: string;
  lastName: string;
  avatarUrl: string | null;
  phone: string | null;
}

export interface IUserPreferences {
  emailNotifications: boolean;
  reminderEmails: boolean;
  weeklyDigest: boolean;
}

export interface IUser {
  _id: string;
  email: string;
  role: UserRole;
  profile: IUserProfile;
  preferences: IUserPreferences;
  emailVerified: boolean;
  stripeCustomerId: string | null;
  lastLoginAt: string;
  createdAt: string;
  updatedAt: string;
}

/** Public-safe user data (no sensitive fields) */
export type IUserPublic = Pick<
  IUser,
  '_id' | 'email' | 'role' | 'profile' | 'preferences' | 'emailVerified' | 'createdAt'
>;
