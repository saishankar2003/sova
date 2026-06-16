import { Resend } from 'resend';
import { logger } from './logger';

const resend = new Resend(process.env.RESEND_API_KEY || 're_dummy_key_for_testing');
const fromEmail = 'onboarding@resend.dev'; // Default testing email for Resend free tier

export async function sendPasswordResetEmail(to: string, token: string) {
  if (!process.env.RESEND_API_KEY) {
    logger.warn('RESEND_API_KEY is not set. Skipping password reset email.');
    return;
  }

  const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:5173';
  const resetLink = `${frontendUrl}/reset-password?token=${token}`;

  try {
    const { data, error } = await resend.emails.send({
      from: `NextX <${fromEmail}>`,
      to: [to],
      subject: 'Reset your password - NextX',
      html: `
        <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto;">
          <h2>Reset your password</h2>
          <p>We received a request to reset the password for your NextX account.</p>
          <p>Click the button below to choose a new password:</p>
          <div style="margin: 30px 0;">
            <a href="${resetLink}" style="background-color: #2563eb; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: bold;">Reset Password</a>
          </div>
          <p>Or copy and paste this link into your browser:</p>
          <p><a href="${resetLink}">${resetLink}</a></p>
          <p style="color: #666; font-size: 14px; margin-top: 40px;">If you didn't request a password reset, you can safely ignore this email.</p>
        </div>
      `,
    });

    if (error) {
      logger.error(`Failed to send password reset email: ${error.message}`);
    } else {
      logger.info(`Password reset email sent to ${to} (ID: ${data?.id})`);
    }
  } catch (err) {
    logger.error({ err }, 'Error sending password reset email');
  }
}
