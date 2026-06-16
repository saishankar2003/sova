import { useEffect, useState } from 'react';
import { adminService } from '../../services/admin.service';
import { Card } from '../../components/ui/Card/Card';

export function AdminDashboardPage() {
  const [stats, setStats] = useState<any>(null);
  const [alerts, setAlerts] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      adminService.getStatsOverview(),
      adminService.getStalledAlerts(),
    ]).then(([s, a]) => {
      setStats(s);
      setAlerts(a);
      setLoading(false);
    });
  }, []);

  if (loading) return <div>Loading dashboard...</div>;

  return (
    <div>
      <h1 style={{ marginBottom: '24px' }}>Dashboard Overview</h1>
      
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '24px', marginBottom: '40px' }}>
        <Card style={{ padding: '24px' }}>
          <h3 style={{ margin: 0, color: 'var(--text-secondary)' }}>Total Users</h3>
          <p style={{ fontSize: '32px', fontWeight: 'bold', margin: '8px 0 0' }}>{stats?.totalUsers}</p>
        </Card>
        <Card style={{ padding: '24px' }}>
          <h3 style={{ margin: 0, color: 'var(--text-secondary)' }}>Active Subscriptions</h3>
          <p style={{ fontSize: '32px', fontWeight: 'bold', margin: '8px 0 0' }}>{stats?.activeSubscriptions}</p>
        </Card>
        <Card style={{ padding: '24px' }}>
          <h3 style={{ margin: 0, color: 'var(--text-secondary)' }}>Total Documents</h3>
          <p style={{ fontSize: '32px', fontWeight: 'bold', margin: '8px 0 0' }}>{stats?.totalDocuments}</p>
        </Card>
        <Card style={{ padding: '24px' }}>
          <h3 style={{ margin: 0, color: 'var(--text-secondary)' }}>Open Tickets</h3>
          <p style={{ fontSize: '32px', fontWeight: 'bold', margin: '8px 0 0' }}>{stats?.openTickets}</p>
        </Card>
      </div>

      <h2 style={{ marginBottom: '16px' }}>Stalled Journeys ({alerts?.thresholdDays} days inactive)</h2>
      <Card style={{ padding: '0' }}>
        {alerts?.stalledUsers?.length === 0 ? (
          <p style={{ padding: '24px' }}>No stalled journeys. Everyone is making progress!</p>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', textAlign: 'left', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid var(--border-secondary)', background: 'var(--bg-secondary)' }}>
                  <th style={{ padding: '12px 24px' }}>User</th>
                  <th style={{ padding: '12px 24px' }}>Email</th>
                </tr>
              </thead>
              <tbody>
                {alerts?.stalledUsers?.map((u: any) => (
                  <tr key={u._id} style={{ borderBottom: '1px solid var(--border-secondary)' }}>
                    <td style={{ padding: '12px 24px' }}>{u.profile?.firstName} {u.profile?.lastName}</td>
                    <td style={{ padding: '12px 24px' }}>{u.email}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>
    </div>
  );
}
