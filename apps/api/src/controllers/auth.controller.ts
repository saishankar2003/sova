import { Request, Response, NextFunction } from 'express';
import { User } from '../models/User';
import { Subscription } from '../models/Subscription';
import { Plan, SubscriptionStatus } from '@nextx/shared';
import { hashPassword, comparePassword, generateToken, hashToken } from '../utils/crypto';
import { signAccessToken, signRefreshToken, verifyRefreshToken } from '../utils/jwt';
import { sendSuccess, sendCreated } from '../utils/apiResponse';
import { ApiError } from '../utils/apiError';
import { logger } from '../utils/logger';

/**
 * POST /api/auth/signup
 */
export async function signup(req: Request, res: Response, next: NextFunction) {
  try {
    const { email, password, firstName, lastName } = req.body;

    // Check if user exists
    const existing = await User.findOne({ email: email.toLowerCase() });
    if (existing) {
      throw ApiError.conflict('An account with this email already exists');
    }

    // Hash password
    const passwordHash = await hashPassword(password);

    // Generate email verification token
    const verificationToken = generateToken();

    // Create user
    const user = await User.create({
      email: email.toLowerCase(),
      passwordHash,
      profile: { firstName, lastName, avatarUrl: null, phone: null },
      emailVerificationToken: hashToken(verificationToken),
    });

    // Create free subscription
    await Subscription.create({
      userId: user._id,
      plan: Plan.FREE,
      status: SubscriptionStatus.ACTIVE,
    });

    // TODO: Send verification email via Resend
    logger.info(`New user registered: ${email} (verify token: ${verificationToken})`);

    sendCreated(res, {
      message: 'Account created. Please check your email to verify your address.',
      userId: user._id,
    });
  } catch (error) {
    next(error);
  }
}

/**
 * POST /api/auth/login
 */
export async function login(req: Request, res: Response, next: NextFunction) {
  try {
    const { email, password } = req.body;

    // Find user (include passwordHash for comparison)
    const user = await User.findOne({ email: email.toLowerCase() }).select('+passwordHash +refreshTokens');
    if (!user || !user.passwordHash) {
      throw ApiError.unauthorized('Invalid email or password');
    }

    // Verify password
    const isValid = await comparePassword(password, user.passwordHash);
    if (!isValid) {
      throw ApiError.unauthorized('Invalid email or password');
    }

    // Generate tokens
    const accessToken = signAccessToken({
      userId: user._id.toString(),
      email: user.email,
      role: user.role,
    });

    const refreshToken = signRefreshToken({
      userId: user._id.toString(),
      tokenVersion: Date.now(),
    });

    // Store hashed refresh token
    user.refreshTokens.push(hashToken(refreshToken));
    // Keep only last 5 refresh tokens
    if (user.refreshTokens.length > 5) {
      user.refreshTokens = user.refreshTokens.slice(-5);
    }
    user.lastLoginAt = new Date();
    await user.save();

    sendSuccess(res, {
      accessToken,
      refreshToken,
      user: user.toJSON(),
    });
  } catch (error) {
    next(error);
  }
}

/**
 * POST /api/auth/google
 */
export async function googleAuth(req: Request, res: Response, next: NextFunction) {
  try {
    // TODO: Verify Google ID token with google-auth-library
    const { idToken } = req.body;

    // Placeholder — will implement Google OAuth verification
    logger.info(`Google auth attempt with token: ${idToken.substring(0, 20)}...`);

    sendSuccess(res, { message: 'Google auth not yet implemented' });
  } catch (error) {
    next(error);
  }
}

/**
 * POST /api/auth/refresh
 */
export async function refreshToken(req: Request, res: Response, next: NextFunction) {
  try {
    const token = req.body.refreshToken || (req.headers['x-refresh-token'] as string);
    if (!token) {
      throw ApiError.unauthorized('Refresh token is required');
    }

    // Verify refresh token
    const payload = verifyRefreshToken(token);

    // Find user and check stored token
    const user = await User.findById(payload.userId).select('+refreshTokens');
    if (!user) {
      throw ApiError.unauthorized('User not found');
    }

    const tokenHash = hashToken(token);
    const tokenIndex = user.refreshTokens.indexOf(tokenHash);
    if (tokenIndex === -1) {
      // Token reuse detected — revoke all tokens
      user.refreshTokens = [];
      await user.save();
      throw ApiError.unauthorized('Refresh token has been revoked');
    }

    // Rotate: remove old token, issue new pair
    user.refreshTokens.splice(tokenIndex, 1);

    const newAccessToken = signAccessToken({
      userId: user._id.toString(),
      email: user.email,
      role: user.role,
    });

    const newRefreshToken = signRefreshToken({
      userId: user._id.toString(),
      tokenVersion: Date.now(),
    });

    user.refreshTokens.push(hashToken(newRefreshToken));
    await user.save();

    sendSuccess(res, {
      accessToken: newAccessToken,
      refreshToken: newRefreshToken,
    });
  } catch (error) {
    next(error);
  }
}

/**
 * POST /api/auth/logout
 */
export async function logout(req: Request, res: Response, next: NextFunction) {
  try {
    const token = req.body.refreshToken;
    if (token) {
      const tokenHash = hashToken(token);
      await User.updateOne(
        { refreshTokens: tokenHash },
        { $pull: { refreshTokens: tokenHash } },
      );
    }

    sendSuccess(res, { message: 'Logged out successfully' });
  } catch (error) {
    next(error);
  }
}

/**
 * POST /api/auth/forgot-password
 */
export async function forgotPassword(req: Request, res: Response, next: NextFunction) {
  try {
    const { email } = req.body;

    const user = await User.findOne({ email: email.toLowerCase() });
    if (user) {
      const resetToken = generateToken();
      user.passwordResetToken = hashToken(resetToken);
      user.passwordResetExpires = new Date(Date.now() + 60 * 60 * 1000); // 1 hour
      await user.save();

      // TODO: Send password reset email via Resend
      logger.info(`Password reset requested for ${email} (token: ${resetToken})`);
    }

    // Always return success to prevent email enumeration
    sendSuccess(res, {
      message: 'If an account with that email exists, a password reset link has been sent.',
    });
  } catch (error) {
    next(error);
  }
}

/**
 * POST /api/auth/reset-password
 */
export async function resetPassword(req: Request, res: Response, next: NextFunction) {
  try {
    const { token, password } = req.body;

    const tokenHash = hashToken(token);
    const user = await User.findOne({
      passwordResetToken: tokenHash,
      passwordResetExpires: { $gt: new Date() },
    });

    if (!user) {
      throw ApiError.badRequest('Invalid or expired reset token');
    }

    user.passwordHash = await hashPassword(password);
    user.passwordResetToken = null;
    user.passwordResetExpires = null;
    user.refreshTokens = []; // Revoke all sessions
    await user.save();

    sendSuccess(res, { message: 'Password has been reset. Please log in with your new password.' });
  } catch (error) {
    next(error);
  }
}

/**
 * GET /api/auth/verify-email/:token
 */
export async function verifyEmail(req: Request, res: Response, next: NextFunction) {
  try {
    const token = req.params.token as string;
    const tokenHash = hashToken(token);

    const user = await User.findOne({ emailVerificationToken: tokenHash });
    if (!user) {
      throw ApiError.badRequest('Invalid verification token');
    }

    user.emailVerified = true;
    user.emailVerificationToken = null;
    await user.save();

    sendSuccess(res, { message: 'Email verified successfully' });
  } catch (error) {
    next(error);
  }
}
