import { useEffect, useState } from 'react';
import { adminService } from '../../services/admin.service';
import { Card } from '../../components/ui/Card/Card';

export function AdminAuditPage() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    adminService.getAuditLogs().then((res) => {
      setData(res);
      setLoading(false);
    });
  }, []);

  if (loading) return <div>Loading audit logs...</div>;

  return (
    <div>
      <h1 style={{ marginBottom: '24px' }}>Audit Logs</h1>
      <Card style={{ padding: '0' }}>
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', textAlign: 'left', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid var(--border-secondary)', background: 'var(--bg-secondary)' }}>
                <th style={{ padding: '12px 24px' }}>Date</th>
                <th style={{ padding: '12px 24px' }}>Actor</th>
                <th style={{ padding: '12px 24px' }}>Action</th>
                <th style={{ padding: '12px 24px' }}>Target</th>
                <th style={{ padding: '12px 24px' }}>IP Address</th>
              </tr>
            </thead>
            <tbody>
              {data?.logs?.map((log: any) => (
                <tr key={log._id} style={{ borderBottom: '1px solid var(--border-secondary)' }}>
                  <td style={{ padding: '12px 24px' }}>{new Date(log.createdAt).toLocaleString()}</td>
                  <td style={{ padding: '12px 24px' }}>{log.actorId?.email || 'System'}</td>
                  <td style={{ padding: '12px 24px', fontWeight: 'bold' }}>{log.action}</td>
                  <td style={{ padding: '12px 24px' }}>{log.targetType} ({log.targetId})</td>
                  <td style={{ padding: '12px 24px', fontFamily: 'monospace' }}>{log.ipAddress}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}
