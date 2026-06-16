import { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { loginSchema, type LoginInput } from '@nextx/shared';
import { api } from '../../services/api';
import { useAuthStore } from '../../stores/authStore';
import { Button } from '../../components/ui/Button/Button';
import { Input } from '../../components/ui/Input/Input';
import styles from '../auth/AuthPage.module.css';

export function AdminLoginPage() {
  const navigate = useNavigate();
  const location = useLocation();
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
      const response = await api.post('/auth/admin/login', data);
      const { accessToken, refreshToken, user } = response.data.data;
      setAuth(user, accessToken, refreshToken);
      
      const from = location.state?.from?.pathname || '/admin/dashboard';
      navigate(from, { replace: true });
    } catch (err: any) {
      setServerError(err.response?.data?.error?.message || 'Login failed. Please check your credentials.');
    }
  }

  return (
    <div className={styles.authPage}>
      <div className={styles.authCard}>
        <div className={styles.authHeader}>
          <div className={styles.authLogo} style={{ background: 'linear-gradient(135deg, var(--color-danger-500), var(--color-warning-500))' }}>
            <div className={styles.authLogoIcon} style={{ background: 'transparent' }}>N</div>
            <span className={styles.authLogoText} style={{ color: 'var(--color-danger-600)', background: 'none', WebkitTextFillColor: 'initial' }}>NextX Admin</span>
          </div>
          <h1 className={styles.authTitle}>Admin Portal</h1>
          <p className={styles.authSubtitle}>
            Authorized personnel only
          </p>
        </div>

        {serverError && <div className={styles.alertError}>{serverError}</div>}

        <form onSubmit={handleSubmit(onSubmit)} className={styles.authForm}>
          <Input
            label="Admin Email"
            type="email"
            placeholder="admin@nextx.co.uk"
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

          <Button type="submit" fullWidth size="lg" loading={isSubmitting} style={{ background: 'var(--color-danger-600)' }}>
            Access Portal
          </Button>
        </form>
      </div>
    </div>
  );
}
