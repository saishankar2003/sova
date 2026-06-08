import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { loginSchema, type LoginInput } from '@nextx/shared';
import { GoogleLogin } from '@react-oauth/google';
import { api } from '../../services/api';
import { useAuthStore } from '../../stores/authStore';
import { Button } from '../../components/ui/Button/Button';
import { Input } from '../../components/ui/Input/Input';
import styles from './AuthPage.module.css';

export function LoginPage() {
  const navigate = useNavigate();
  const setAuth = useAuthStore((s) => s.setAuth);
  const [serverError, setServerError] = useState('');

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginInput>({
    resolver: zodResolver(loginSchema),
  });

  async function onSubmit(data: LoginInput) {
    setServerError('');
    try {
      const response = await api.post('/auth/login', data);
      const { accessToken, refreshToken, user } = response.data.data;
      setAuth(user, accessToken, refreshToken);
      navigate('/dashboard', { replace: true });
    } catch (err: any) {
      setServerError(err.response?.data?.error?.message || 'Login failed. Please try again.');
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
      setServerError(err.response?.data?.error?.message || 'Google login failed. Please try again.');
    }
  };

  return (
    <div className={styles.authPage}>
      <div className={styles.authCard}>
        <div className={styles.authHeader}>
          <div className={styles.authLogo}>
            <div className={styles.authLogoIcon}>N</div>
            <span className={styles.authLogoText}>NextX</span>
          </div>
          <h1 className={styles.authTitle}>Welcome back</h1>
          <p className={styles.authSubtitle}>
            Sign in to continue your EHCP journey
          </p>
        </div>

        {serverError && <div className={styles.alertError}>{serverError}</div>}

        <form onSubmit={handleSubmit(onSubmit)} className={styles.authForm}>
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
            autoComplete="current-password"
            error={errors.password?.message}
            {...register('password')}
          />

          <Link to="/forgot-password" className={styles.forgotLink}>
            Forgot password?
          </Link>

          <Button type="submit" fullWidth size="lg" loading={isSubmitting}>
            Sign In
          </Button>
        </form>

        <div className={styles.divider}>
          <span className={styles.dividerText}>or</span>
        </div>

        <div style={{ display: 'flex', justifyContent: 'center' }}>
          <GoogleLogin
            onSuccess={onGoogleSuccess}
            onError={() => setServerError('Google login failed.')}
            useOneTap
          />
        </div>

        <div className={styles.authFooter}>
          Don't have an account?{' '}
          <Link to="/signup">Create one</Link>
        </div>
      </div>
    </div>
  );
}
