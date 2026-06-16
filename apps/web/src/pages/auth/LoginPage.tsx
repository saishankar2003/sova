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

const imgBlob1 = 'https://www.figma.com/api/mcp/asset/f7665fd1-a586-4f7f-a61d-5f54b62a51be';
const imgBlob2 = 'https://www.figma.com/api/mcp/asset/388638a8-f414-4770-870f-018dbdfd2fd8';
const imgBlob3 = 'https://www.figma.com/api/mcp/asset/dbc93fbe-993f-44fe-a280-dc8aaa62bb48';
const imgMain = 'https://www.figma.com/api/mcp/asset/dea453a2-e74f-4735-832e-597122d8d3a0';

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
      {/* Left decorative panel */}
      <div className={styles.authLeft}>
        <div className={styles.blobsContainer}>
          <img src={imgBlob1} alt="" className={`${styles.blob} ${styles.blobBack1}`} />
          <img src={imgBlob2} alt="" className={`${styles.blob} ${styles.blobBack2}`} />
          <img src={imgBlob3} alt="" className={`${styles.blob} ${styles.blobBack3}`} />
        </div>
        <img src={imgMain} alt="NextX illustration" className={styles.mainImage} />
      </div>

      {/* Right form panel */}
      <div className={styles.authRight}>
        <div className={styles.authCard}>
          <div className={styles.authHeader}>
            <div className={styles.authLogo}>
              <div className={styles.authLogoIcon}>N</div>
              <span className={styles.authLogoText}>NextX</span>
            </div>
            <h1 className={styles.authTitle}>Welcome back</h1>
          </div>

          {serverError && <div className={styles.alertError}>{serverError}</div>}

          <form onSubmit={handleSubmit(onSubmit)} className={styles.authForm}>
            <Input
              label="Email"
              type="email"
              placeholder="Enter your Email here"
              autoComplete="email"
              error={errors.email?.message}
              {...register('email')}
            />

            <Input
              label="Password"
              type="password"
              placeholder="Enter your Password here"
              autoComplete="current-password"
              error={errors.password?.message}
              {...register('password')}
            />

            <Link to="/forgot-password" className={styles.forgotLink}>
              Forgot password?
            </Link>

            <Button type="submit" fullWidth size="lg" loading={isSubmitting} className={styles.authSubmitBtn}>
              Sign In
            </Button>
          </form>

          <div className={styles.authFooter}>
            Don't have an account?{' '}
            <Link to="/signup">Create one</Link>
          </div>

          <div className={styles.divider}>
            <span className={styles.dividerText}>- OR -</span>
          </div>

          <div className={styles.socialRow}>
            <div style={{ display: 'flex', justifyContent: 'center', flex: 1 }}>
              <GoogleLogin
                onSuccess={onGoogleSuccess}
                onError={() => setServerError('Google login failed.')}
                useOneTap
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
