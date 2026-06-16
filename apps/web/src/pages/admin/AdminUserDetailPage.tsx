import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { adminService } from '../../services/admin.service';
import { Card } from '../../components/ui/Card/Card';
import { Button } from '../../components/ui/Button/Button';
import { ConfirmModal } from '../../components/ui/Modal/Modal';

export function AdminUserDetailPage() {
  const { id } = useParams<{ id: string }>();
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [confirmConfig, setConfirmConfig] = useState<{isOpen: boolean, plan?: string, isRevoke?: boolean}>({isOpen: false});

  useEffect(() => {
    if (!id) return;
    adminService.getUserById(id).then((res) => {
      setData(res);
      setLoading(false);
    });
  }, [id]);

  const handleOverride = async () => {
    if (!id || !confirmConfig.plan) return;
    setActionLoading(true);
    try {
      const newSub = await adminService.overrideSubscription(id, { plan: confirmConfig.plan, status: 'manual_override' });
      setData((prev: any) => ({ ...prev, subscription: newSub.subscription }));
    } finally {
      setActionLoading(false);
    }
  };

  const handleRevoke = async () => {
    if (!id) return;
    setActionLoading(true);
    try {
      const newSub = await adminService.removeSubscriptionOverride(id);
      setData((prev: any) => ({ ...prev, subscription: newSub.subscription }));
    } finally {
      setActionLoading(false);
    }
  };

  if (loading) return <div>Loading user details...</div>;
  if (!data?.user) return <div>User not found</div>;

  const { user, subscription, documents, tickets } = data;

  return (
    <div>
      <div style={{ marginBottom: '24px', display: 'flex', gap: '16px', alignItems: 'center' }}>
        <Link to="/admin/users" style={{ color: 'var(--text-secondary)', textDecoration: 'none' }}>← Back to Users</Link>
        <h1 style={{ margin: 0 }}>{user.profile?.firstName} {user.profile?.lastName}</h1>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px', marginBottom: '24px' }}>
        <Card style={{ padding: '24px' }}>
          <h2>Profile</h2>
          <p><strong>Email:</strong> {user.email}</p>
          <p><strong>Role:</strong> {user.role}</p>
          <p><strong>Joined:</strong> {new Date(user.createdAt).toLocaleString()}</p>
        </Card>

        <Card style={{ padding: '24px' }}>
          <h2>Subscription Status</h2>
          <p><strong>Current Plan:</strong> <span style={{ textTransform: 'uppercase', fontWeight: 'bold' }}>{subscription?.plan || 'Free'}</span></p>
          <p><strong>Status:</strong> {subscription?.status || 'N/A'}</p>
          
          <div style={{ marginTop: '24px', display: 'flex', gap: '12px' }}>
            <Button size="sm" onClick={() => setConfirmConfig({ isOpen: true, plan: 'premium' })} disabled={actionLoading}>Grant Premium</Button>
            <Button size="sm" onClick={() => setConfirmConfig({ isOpen: true, plan: 'pro' })} disabled={actionLoading} variant="secondary">Grant Pro</Button>
            {subscription?.status === 'manual_override' && (
              <Button size="sm" onClick={() => setConfirmConfig({ isOpen: true, isRevoke: true })} disabled={actionLoading} style={{ background: 'var(--color-danger-600)', color: 'white' }}>Revoke Override</Button>
            )}
          </div>
        </Card>
      </div>

      <Card style={{ padding: '24px', marginBottom: '24px' }}>
        <h2>Uploaded Documents</h2>
        {documents?.length === 0 ? <p>No documents uploaded.</p> : (
          <ul style={{ listStyle: 'none', padding: 0 }}>
            {documents.map((doc: any) => (
              <li key={doc._id} style={{ padding: '12px 0', borderBottom: '1px solid var(--border-secondary)' }}>
                <strong>{doc.originalName}</strong> ({Math.round(doc.sizeBytes / 1024)} KB) - {new Date(doc.createdAt).toLocaleDateString()}
              </li>
            ))}
          </ul>
        )}
      </Card>
      
      <Card style={{ padding: '24px' }}>
        <h2>Support Tickets</h2>
        {tickets?.length === 0 ? <p>No support tickets.</p> : (
          <ul style={{ listStyle: 'none', padding: 0 }}>
            {tickets.map((t: any) => (
              <li key={t._id} style={{ padding: '12px 0', borderBottom: '1px solid var(--border-secondary)' }}>
                <strong>{t.subject}</strong> ({t.status}) - {new Date(t.createdAt).toLocaleDateString()}
              </li>
            ))}
          </ul>
        )}
      </Card>
      <ConfirmModal
        isOpen={confirmConfig.isOpen}
        title={confirmConfig.isRevoke ? "Revoke Override" : "Override Subscription"}
        message={confirmConfig.isRevoke 
          ? "Are you sure you want to revoke this user's manual override?" 
          : `Are you sure you want to override this user to the ${confirmConfig.plan} plan?`
        }
        confirmText={confirmConfig.isRevoke ? "Revoke" : "Grant"}
        isDestructive={confirmConfig.isRevoke}
        onConfirm={confirmConfig.isRevoke ? handleRevoke : handleOverride}
        onCancel={() => setConfirmConfig({ isOpen: false })}
      />
    </div>
  );
}
