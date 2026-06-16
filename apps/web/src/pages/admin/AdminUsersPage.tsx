import { useEffect, useState } from 'react';
import { adminService } from '../../services/admin.service';
import { Card } from '../../components/ui/Card/Card';
import { Link } from 'react-router-dom';

export function AdminUsersPage() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    adminService.getUsers().then((res) => {
      setData(res);
      setLoading(false);
    });
  }, []);

  if (loading) return <div>Loading users...</div>;

  return (
    <div>
      <h1 style={{ marginBottom: '24px' }}>Users</h1>
      <Card style={{ padding: '0' }}>
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', textAlign: 'left', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid var(--border-secondary)', background: 'var(--bg-secondary)' }}>
                <th style={{ padding: '12px 24px' }}>Name</th>
                <th style={{ padding: '12px 24px' }}>Email</th>
                <th style={{ padding: '12px 24px' }}>Role</th>
                <th style={{ padding: '12px 24px' }}>Joined</th>
                <th style={{ padding: '12px 24px' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {data?.users?.map((u: any) => (
                <tr key={u._id} style={{ borderBottom: '1px solid var(--border-secondary)' }}>
                  <td style={{ padding: '12px 24px' }}>{u.profile?.firstName} {u.profile?.lastName}</td>
                  <td style={{ padding: '12px 24px' }}>{u.email}</td>
                  <td style={{ padding: '12px 24px' }}>
                    <span style={{ 
                      padding: '4px 8px', 
                      background: u.role === 'admin' ? 'var(--color-danger-100)' : 'var(--color-primary-100)',
                      color: u.role === 'admin' ? 'var(--color-danger-700)' : 'var(--color-primary-700)',
                      borderRadius: '4px',
                      fontSize: '12px',
                      fontWeight: 'bold',
                      textTransform: 'uppercase'
                    }}>
                      {u.role}
                    </span>
                  </td>
                  <td style={{ padding: '12px 24px' }}>{new Date(u.createdAt).toLocaleDateString()}</td>
                  <td style={{ padding: '12px 24px' }}>
                    <Link to={`/admin/users/${u._id}`} style={{ color: 'var(--color-primary-600)', textDecoration: 'none', fontWeight: 'bold' }}>
                      View
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}
