import { useEffect, useState } from 'react';
import { adminService } from '../../services/admin.service';
import { Card } from '../../components/ui/Card/Card';
import { Button } from '../../components/ui/Button/Button';
import { ConfirmModal } from '../../components/ui/Modal/Modal';

export function AdminSupportPage() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [activeTicket, setActiveTicket] = useState<any>(null);
  const [replyText, setReplyText] = useState('');
  const [replying, setReplying] = useState(false);
  const [confirmResolve, setConfirmResolve] = useState(false);

  useEffect(() => {
    loadTickets();
  }, []);

  const loadTickets = () => {
    adminService.getSupportTickets().then((res) => {
      setData(res);
      setLoading(false);
    });
  };

  const handleSelectTicket = async (id: string) => {
    const res = await adminService.getSupportTicketById(id);
    setActiveTicket(res.ticket);
    setReplyText('');
  };

  const handleReply = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!replyText.trim() || !activeTicket) return;
    setReplying(true);
    try {
      await adminService.replyToSupportTicket(activeTicket._id, replyText);
      await handleSelectTicket(activeTicket._id);
      loadTickets(); // refresh list
    } finally {
      setReplying(false);
    }
  };

  const handleResolve = async () => {
    if (!activeTicket) return;
    await adminService.updateSupportTicket(activeTicket._id, { status: 'resolved' });
    await handleSelectTicket(activeTicket._id);
    loadTickets();
  };

  if (loading) return <div>Loading support inbox...</div>;

  return (
    <div>
      <h1 style={{ marginBottom: '24px' }}>Support Inbox</h1>
      
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: '24px', height: 'calc(100vh - 160px)' }}>
        {/* Inbox List */}
        <Card style={{ padding: '0', display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
          <div style={{ padding: '16px', borderBottom: '1px solid var(--border-secondary)', background: 'var(--bg-secondary)' }}>
            <h3 style={{ margin: 0 }}>All Tickets</h3>
          </div>
          <div style={{ overflowY: 'auto', flex: 1 }}>
            {data?.tickets?.map((t: any) => (
              <div 
                key={t._id} 
                onClick={() => handleSelectTicket(t._id)}
                style={{ 
                  padding: '16px', 
                  borderBottom: '1px solid var(--border-secondary)',
                  cursor: 'pointer',
                  background: activeTicket?._id === t._id ? 'var(--color-primary-50)' : 'transparent'
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                  <strong style={{ color: activeTicket?._id === t._id ? 'var(--color-primary-700)' : 'var(--text-primary)' }}>{t.subject}</strong>
                  <span style={{ fontSize: '12px', color: 'var(--text-tertiary)' }}>{new Date(t.createdAt).toLocaleDateString()}</span>
                </div>
                <div style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>{t.userId?.email || 'Unknown'}</div>
                <div style={{ marginTop: '8px' }}>
                  <span style={{ fontSize: '11px', padding: '2px 6px', background: 'var(--bg-secondary)', borderRadius: '4px', textTransform: 'uppercase' }}>
                    {t.status}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </Card>

        {/* Ticket Detail / Thread */}
        <Card style={{ padding: '0', display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
          {activeTicket ? (
            <>
              <div style={{ padding: '24px', borderBottom: '1px solid var(--border-secondary)', background: 'var(--bg-secondary)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <h2 style={{ margin: '0 0 8px 0' }}>{activeTicket.subject}</h2>
                  <div style={{ fontSize: '14px', color: 'var(--text-secondary)' }}>
                    From: {activeTicket.userId?.email} | Status: <strong style={{ textTransform: 'uppercase' }}>{activeTicket.status}</strong>
                  </div>
                </div>
                {activeTicket.status !== 'resolved' && (
                  <Button variant="secondary" onClick={() => setConfirmResolve(true)}>Mark Resolved</Button>
                )}
              </div>
              
              <div style={{ flex: 1, overflowY: 'auto', padding: '24px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
                {activeTicket.messages.map((m: any, i: number) => (
                  <div key={i} style={{ 
                    alignSelf: m.senderRole === 'admin' ? 'flex-end' : 'flex-start',
                    maxWidth: '80%',
                    background: m.senderRole === 'admin' ? 'var(--color-primary-100)' : 'var(--bg-secondary)',
                    color: m.senderRole === 'admin' ? 'var(--color-primary-900)' : 'var(--text-primary)',
                    padding: '16px',
                    borderRadius: '12px',
                    borderBottomRightRadius: m.senderRole === 'admin' ? 0 : '12px',
                    borderBottomLeftRadius: m.senderRole === 'admin' ? '12px' : 0,
                  }}>
                    <div style={{ fontSize: '12px', color: m.senderRole === 'admin' ? 'var(--color-primary-600)' : 'var(--text-tertiary)', marginBottom: '8px' }}>
                      {m.senderRole === 'admin' ? 'You' : 'User'} - {new Date(m.createdAt).toLocaleString()}
                    </div>
                    <div style={{ whiteSpace: 'pre-wrap' }}>{m.content}</div>
                  </div>
                ))}
              </div>

              {activeTicket.status !== 'resolved' && (
                <form onSubmit={handleReply} style={{ padding: '24px', borderTop: '1px solid var(--border-secondary)' }}>
                  <textarea 
                    value={replyText}
                    onChange={(e) => setReplyText(e.target.value)}
                    placeholder="Type your reply here..."
                    style={{ width: '100%', padding: '12px', borderRadius: '8px', border: '1px solid var(--border-secondary)', minHeight: '100px', resize: 'vertical', marginBottom: '16px', fontFamily: 'inherit' }}
                  />
                  <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                    <Button type="submit" loading={replying} disabled={!replyText.trim()}>Send Reply</Button>
                  </div>
                </form>
              )}
            </>
          ) : (
            <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-tertiary)' }}>
              Select a ticket to view the conversation.
            </div>
          )}
        </Card>
      </div>
      <ConfirmModal
        isOpen={confirmResolve}
        title="Resolve Ticket"
        message="Mark this ticket as resolved?"
        confirmText="Resolve"
        onConfirm={handleResolve}
        onCancel={() => setConfirmResolve(false)}
      />
    </div>
  );
}
