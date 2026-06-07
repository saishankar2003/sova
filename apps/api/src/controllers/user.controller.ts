import { Request, Response, NextFunction } from 'express';
import { User } from '../models/User';
import { hashPassword, comparePassword } from '../utils/crypto';
import { sendSuccess, sendNoContent } from '../utils/apiResponse';
import { ApiError } from '../utils/apiError';

export async function getMe(req: Request, res: Response, next: NextFunction) {
  try {
    const user = await User.findById(req.user!.userId);
    if (!user) throw ApiError.notFound('User');
    sendSuccess(res, user);
  } catch (error) {
    next(error);
  }
}

export async function updateProfile(req: Request, res: Response, next: NextFunction) {
  try {
    const updates: Record<string, unknown> = {};
    const { firstName, lastName, phone } = req.body;
    if (firstName !== undefined) updates['profile.firstName'] = firstName;
    if (lastName !== undefined) updates['profile.lastName'] = lastName;
    if (phone !== undefined) updates['profile.phone'] = phone;

    const user = await User.findByIdAndUpdate(req.user!.userId, { $set: updates }, { new: true });
    if (!user) throw ApiError.notFound('User');
    sendSuccess(res, user);
  } catch (error) {
    next(error);
  }
}

export async function changePassword(req: Request, res: Response, next: NextFunction) {
  try {
    const { currentPassword, newPassword } = req.body;
    const user = await User.findById(req.user!.userId).select('+passwordHash');
    if (!user || !user.passwordHash) throw ApiError.badRequest('Cannot change password for social accounts');

    const isValid = await comparePassword(currentPassword, user.passwordHash);
    if (!isValid) throw ApiError.unauthorized('Current password is incorrect');

    user.passwordHash = await hashPassword(newPassword);
    await user.save();
    sendSuccess(res, { message: 'Password changed successfully' });
  } catch (error) {
    next(error);
  }
}

export async function uploadAvatar(req: Request, res: Response, next: NextFunction) {
  try {
    // TODO: Handle multer file upload to Firebase
    sendSuccess(res, { message: 'Avatar upload not yet implemented' });
  } catch (error) {
    next(error);
  }
}

export async function updatePreferences(req: Request, res: Response, next: NextFunction) {
  try {
    const updates: Record<string, unknown> = {};
    const { emailNotifications, reminderEmails, weeklyDigest } = req.body;
    if (emailNotifications !== undefined) updates['preferences.emailNotifications'] = emailNotifications;
    if (reminderEmails !== undefined) updates['preferences.reminderEmails'] = reminderEmails;
    if (weeklyDigest !== undefined) updates['preferences.weeklyDigest'] = weeklyDigest;

    const user = await User.findByIdAndUpdate(req.user!.userId, { $set: updates }, { new: true });
    if (!user) throw ApiError.notFound('User');
    sendSuccess(res, user);
  } catch (error) {
    next(error);
  }
}

export async function deleteAccount(req: Request, res: Response, next: NextFunction) {
  try {
    await User.findByIdAndDelete(req.user!.userId);
    sendNoContent(res);
  } catch (error) {
    next(error);
  }
}
