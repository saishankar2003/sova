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

const imgBlob1 = 'https://www.figma.com/api/mcp/asset/f7665fd1-a586-4f7f-a61d-5f54b62a51be';
const imgBlob2 = 'https://www.figma.com/api/mcp/asset/388638a8-f414-4770-870f-018dbdfd2fd8';
const imgBlob3 = 'https://www.figma.com/api/mcp/asset/dbc93fbe-993f-44fe-a280-dc8aaa62bb48';
const imgMain = 'https://www.figma.com/api/mcp/asset/dea453a2-e74f-4735-832e-597122d8d3a0';

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
        <div className={styles.authLeft}>
          <div className={styles.blobsContainer}>
            <img src={imgBlob1} alt="" className={`${styles.blob} ${styles.blobBack1}`} />
            <img src={imgBlob2} alt="" className={`${styles.blob} ${styles.blobBack2}`} />
            <img src={imgBlob3} alt="" className={`${styles.blob} ${styles.blobBack3}`} />
          </div>
          <img src={imgMain} alt="NextX illustration" className={styles.mainImage} />
        </div>
        <div className={styles.authRight}>
          <div className={styles.authCard}>
            <div className={styles.authHeader}>
              <div className={styles.authLogo}>
                <div className={styles.authLogoIcon}>✓</div>
                <span className={styles.authLogoText}>NextX</span>
              </div>
              <h1 className={styles.authTitle}>Check your email</h1>
              <p style={{ fontSize: 14, color: '#7c838a', marginTop: 12, fontFamily: 'Poppins, sans-serif' }}>
                We've sent a verification link to your email address.
                Please click the link to activate your account.
              </p>
            </div>
            <Button fullWidth size="lg" onClick={() => navigate('/login')}>
              Go to Login
            </Button>
          </div>
        </div>
      </div>
    );
  }

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
            <h1 className={styles.authTitle}>Create your Free Account</h1>
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
              placeholder="Enter your Email here"
              autoComplete="email"
              error={errors.email?.message}
              {...register('email')}
            />

            <Input
              label="Password"
              type="password"
              placeholder="Enter your Password here"
              autoComplete="new-password"
              hint="At least 8 characters with uppercase, lowercase, and a number"
              error={errors.password?.message}
              {...register('password')}
            />

            <Button type="submit" fullWidth size="lg" loading={isSubmitting} className={styles.authSubmitBtn}>
              Create Account
            </Button>
          </form>

          <div className={styles.authFooter}>
            Already have an account?{' '}
            <Link to="/login">Log in</Link>
          </div>

          <div className={styles.divider}>
            <span className={styles.dividerText}>- OR -</span>
          </div>

          <div className={styles.socialRow}>
            <div style={{ display: 'flex', justifyContent: 'center', flex: 1 }}>
              <GoogleLogin
                onSuccess={onGoogleSuccess}
                onError={() => setServerError('Google signup failed.')}
                useOneTap
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
