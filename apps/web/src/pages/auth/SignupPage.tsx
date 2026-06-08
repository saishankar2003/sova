import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { signupSchema, type SignupInput } from '@nextx/shared';
import { GoogleLogin } from '@react-oauth/google';
import { api } from '../../services/api';
import { useAuthStore } from '../../stores/authStore';
import { Button } from '../../components/ui/Button/Button';
import { Input } from '../../components/ui/Input/Input';
import styles from './AuthPage.module.css';

export function SignupPage() {
  const navigate = useNavigate();
  const setAuth = useAuthStore((s) => s.setAuth);
  const [serverError, setServerError] = useState('');
  const [success, setSuccess] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<SignupInput>({
    resolver: zodResolver(signupSchema),
  });

  async function onSubmit(data: SignupInput) {
    setServerError('');
    try {
      await api.post('/auth/signup', data);
      setSuccess(true);
    } catch (err: any) {
      setServerError(err.response?.data?.error?.message || 'Signup failed. Please try again.');
    }
  }

  const onGoogleSuccess = async (credentialResponse: any) => {
    setServerError('');
    try {
      const response = await api.post('/auth/google', {
        idToken: credentialResponse.credential,
      });
      const { accessToken, refreshToken, user } = response.data.data;
      setAuth(user, accessToken, refreshToken);
      navigate('/dashboard', { replace: true });
    } catch (err: any) {
      setServerError(err.response?.data?.error?.message || 'Google signup failed. Please try again.');
    }
  };

  if (success) {
    return (
      <div className={styles.authPage}>
        <div className={styles.authCard}>
          <div className={styles.authHeader}>
            <div className={styles.authLogo}>
              <div className={styles.authLogoIcon}>✓</div>
              <span className={styles.authLogoText}>NextX</span>
            </div>
            <h1 className={styles.authTitle}>Check your email</h1>
            <p className={styles.authSubtitle}>
              We've sent a verification link to your email address.
              Please click the link to activate your account.
            </p>
          </div>
          <Button fullWidth size="lg" onClick={() => navigate('/login')}>
            Go to Login
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.authPage}>
      <div className={styles.authCard}>
        <div className={styles.authHeader}>
          <div className={styles.authLogo}>
            <div className={styles.authLogoIcon}>N</div>
            <span className={styles.authLogoText}>NextX</span>
          </div>
          <h1 className={styles.authTitle}>Create your account</h1>
          <p className={styles.authSubtitle}>
            Start your EHCP journey with personalised guidance
          </p>
        </div>

        {serverError && <div className={styles.alertError}>{serverError}</div>}

        <form onSubmit={handleSubmit(onSubmit)} className={styles.authForm}>
          <div className={styles.nameRow}>
            <Input
              label="First name"
              placeholder="Jane"
              autoComplete="given-name"
              error={errors.firstName?.message}
              {...register('firstName')}
            />
            <Input
              label="Last name"
              placeholder="Smith"
              autoComplete="family-name"
              error={errors.lastName?.message}
              {...register('lastName')}
            />
          </div>

          <Input
            label="Email"
            type="email"
            placeholder="you@example.com"
            autoComplete="email"
            error={errors.email?.message}
            {...register('email')}
          />

          <Input
            label="Password"
            type="password"
            placeholder="••••••••"
            autoComplete="new-password"
            hint="At least 8 characters with uppercase, lowercase, and a number"
            error={errors.password?.message}
            {...register('password')}
          />

          <Button type="submit" fullWidth size="lg" loading={isSubmitting}>
            Create Account
          </Button>
        </form>

        <div className={styles.divider}>
          <span className={styles.dividerText}>or</span>
        </div>

        <div style={{ display: 'flex', justifyContent: 'center' }}>
          <GoogleLogin
            onSuccess={onGoogleSuccess}
            onError={() => setServerError('Google signup failed.')}
            useOneTap
          />
        </div>

        <div className={styles.authFooter}>
          Already have an account?{' '}
          <Link to="/login">Sign in</Link>
        </div>
      </div>
    </div>
  );
}
