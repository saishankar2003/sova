import { useState } from 'react';
import { Link, useSearchParams, useNavigate } from 'react-router-dom';
import { api } from '../../services/api';
import { Button } from '../../components/ui/Button/Button';
import { Input } from '../../components/ui/Input/Input';
import styles from './AuthPage.module.css';

export function ResetPasswordPage() {
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token');
  const navigate = useNavigate();

  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const [serverError, setServerError] = useState('');

  if (!token) {
    return (
      <div className={styles.authPage}>
        <div className={styles.authCard}>
          <div className={styles.authHeader}>
            <h1 className={styles.authTitle}>Invalid Link</h1>
            <p className={styles.authSubtitle}>
              This password reset link is invalid or missing the reset token.
            </p>
          </div>
          <Button fullWidth size="lg" onClick={() => navigate('/forgot-password')}>
            Request New Link
          </Button>
        </div>
      </div>
    );
  }

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!password || !confirmPassword) return;

    if (password !== confirmPassword) {
      setServerError('Passwords do not match');
      return;
    }

    if (password.length < 8) {
      setServerError('Password must be at least 8 characters long');
      return;
    }

    setIsSubmitting(true);
    setServerError('');
    setSuccessMessage('');

    try {
      const response = await api.post('/auth/reset-password', { token, password });
      setSuccessMessage(response.data.data.message || 'Password has been reset!');
      setPassword('');
      setConfirmPassword('');
    } catch (err: any) {
      setServerError(err.response?.data?.error?.message || 'Failed to reset password. The link might be expired.');
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className={styles.authPage}>
      <div className={styles.authCard}>
        <div className={styles.authHeader}>
          <div className={styles.authLogo}>
            <div className={styles.authLogoIcon}>N</div>
            <span className={styles.authLogoText}>NextX</span>
          </div>
          <h1 className={styles.authTitle}>Reset Password</h1>
          <p className={styles.authSubtitle}>
            Create a new strong password for your account
          </p>
        </div>

        {serverError && <div className={styles.alertError}>{serverError}</div>}
        
        {successMessage ? (
          <div style={{ textAlign: 'center' }}>
            <div className={styles.alertSuccess} style={{ backgroundColor: '#ecfdf5', color: '#065f46', padding: '1rem', borderRadius: '8px', marginBottom: '1.5rem', fontSize: '0.875rem' }}>
              {successMessage}
            </div>
            <Button fullWidth size="lg" onClick={() => navigate('/login')}>
              Go to Login
            </Button>
          </div>
        ) : (
          <form onSubmit={onSubmit} className={styles.authForm}>
            <Input
              label="New Password"
              type="password"
              placeholder="••••••••"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />

            <Input
              label="Confirm New Password"
              type="password"
              placeholder="••••••••"
              required
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
            />

            <Button type="submit" fullWidth size="lg" loading={isSubmitting}>
              Reset Password
            </Button>
          </form>
        )}
      </div>
    </div>
  );
}
