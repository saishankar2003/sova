import { Card, CardHeader } from '../components/ui/Card/Card';
import styles from './DashboardPage.module.css';
import { useAuthStore } from '../stores/authStore';
import { useQuery } from '@tanstack/react-query';
import { api } from '../services/api';
import { Link } from 'react-router-dom';

export function DashboardPage() {
  const user = useAuthStore((s) => s.user);

  const { data: documentsData, isLoading: loadingDocs } = useQuery({
    queryKey: ['documents', 'recent'],
    queryFn: async () => {
      const res = await api.get('/documents');
      return res.data;
    },
  });

  const recentDocs = (documentsData?.data || []).slice(0, 3);

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
          {loadingDocs ? (
            <div className={styles.placeholder}>
              <p>Loading documents...</p>
            </div>
          ) : recentDocs.length > 0 ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-2)' }}>
              {recentDocs.map((doc: any) => (
                <div key={doc._id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: 'var(--space-2) 0', borderBottom: '1px solid var(--border-secondary)' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)', overflow: 'hidden' }}>
                    <span style={{ fontSize: '1.25rem', flexShrink: 0 }}>📄</span>
                    <span style={{ fontWeight: 'var(--font-medium)', fontSize: 'var(--text-sm)', color: 'var(--text-primary)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{doc.name}</span>
                  </div>
                  <span style={{ fontSize: 'var(--text-xs)', color: 'var(--text-secondary)', flexShrink: 0, marginLeft: 'var(--space-3)' }}>
                    {new Date(doc.createdAt).toLocaleDateString()}
                  </span>
                </div>
              ))}
              <Link to="/documents" style={{ color: 'var(--color-primary-600)', fontSize: 'var(--text-sm)', fontWeight: 'var(--font-medium)', textDecoration: 'none', marginTop: 'var(--space-2)', alignSelf: 'flex-start' }}>View all documents →</Link>
            </div>
          ) : (
            <div className={styles.placeholder}>
              <span className={styles.placeholderIcon}>📄</span>
              <p>No documents yet</p>
            </div>
          )}
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
