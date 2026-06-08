import { Link } from 'react-router-dom';
import { Button } from '../components/ui/Button/Button';
import styles from './auth/AuthPage.module.css';

export function NotFoundPage() {
  return (
    <div className={styles.authPage}>
      <div className={styles.authCard} style={{ textAlign: 'center' }}>
        <div style={{ fontSize: '4rem', marginBottom: 'var(--space-4)' }}>🔍</div>
        <h1 className={styles.authTitle}>Page Not Found</h1>
        <p className={styles.authSubtitle} style={{ marginBottom: 'var(--space-6)' }}>
          The page you're looking for doesn't exist or has been moved.
        </p>
        <Link to="/dashboard">
          <Button size="lg" fullWidth>Go to Dashboard</Button>
        </Link>
      </div>
    </div>
  );
}
