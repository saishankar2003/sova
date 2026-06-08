import { useState } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../../services/api';
import { Button } from '../../components/ui/Button/Button';
import { Input } from '../../components/ui/Input/Input';
import styles from './AuthPage.module.css';

export function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const [serverError, setServerError] = useState('');

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!email) return;

    setIsSubmitting(true);
    setServerError('');
    setSuccessMessage('');

    try {
      const response = await api.post('/auth/forgot-password', { email });
      setSuccessMessage(response.data.data.message || 'Reset link sent!');
      setEmail('');
    } catch (err: any) {
      setServerError(err.response?.data?.error?.message || 'Failed to send reset link. Please try again.');
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
          <h1 className={styles.authTitle}>Forgot Password</h1>
          <p className={styles.authSubtitle}>
            Enter your email to receive a password reset link
          </p>
        </div>

        {serverError && <div className={styles.alertError}>{serverError}</div>}
        {successMessage && <div className={styles.alertSuccess} style={{ backgroundColor: '#ecfdf5', color: '#065f46', padding: '1rem', borderRadius: '8px', marginBottom: '1.5rem', fontSize: '0.875rem' }}>{successMessage}</div>}

        <form onSubmit={onSubmit} className={styles.authForm}>
          <Input
            label="Email"
            type="email"
            placeholder="you@example.com"
            autoComplete="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />

          <Button type="submit" fullWidth size="lg" loading={isSubmitting}>
            Send Reset Link
          </Button>
        </form>

        <div className={styles.authFooter}>
          Remember your password?{' '}
          <Link to="/login">Sign in</Link>
        </div>
      </div>
    </div>
  );
}
