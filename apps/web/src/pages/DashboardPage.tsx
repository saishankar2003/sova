import { Card, CardHeader } from '../components/ui/Card/Card';
import styles from './DashboardPage.module.css';
import { useAuthStore } from '../stores/authStore';

export function DashboardPage() {
  const user = useAuthStore((s) => s.user);

  return (
    <div>
      <h1 className="heading-page" style={{ marginBottom: 'var(--space-6)' }}>
        Welcome back, {user?.profile.firstName} 👋
      </h1>

      <div className={styles.grid}>
        <Card hoverable>
          <CardHeader title="Journey Progress" subtitle="Your EHCP journey at a glance" />
          <div className={styles.placeholder}>
            <span className={styles.placeholderIcon}>🗺️</span>
            <p>Add a child to start tracking your EHCP journey</p>
          </div>
        </Card>

        <Card hoverable>
          <CardHeader title="Recent Documents" subtitle="Latest uploaded files" />
          <div className={styles.placeholder}>
            <span className={styles.placeholderIcon}>📄</span>
            <p>No documents yet</p>
          </div>
        </Card>

        <Card hoverable>
          <CardHeader title="Upcoming Reminders" subtitle="Don't miss important dates" />
          <div className={styles.placeholder}>
            <span className={styles.placeholderIcon}>🔔</span>
            <p>No reminders set</p>
          </div>
        </Card>

        <Card hoverable>
          <CardHeader title="AI Assistant" subtitle="Get personalised EHCP guidance" />
          <div className={styles.placeholder}>
            <span className={styles.placeholderIcon}>💬</span>
            <p>Start a conversation</p>
          </div>
        </Card>
      </div>
    </div>
  );
}
