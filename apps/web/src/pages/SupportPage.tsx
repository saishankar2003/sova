import { useState, useEffect } from 'react';
import { useAuthStore } from '../stores/authStore';
import { userService } from '../services/user.service';
import { Card } from '../components/ui/Card/Card';
import { Button } from '../components/ui/Button/Button';
import { Input } from '../components/ui/Input/Input';
import styles from './ChildrenPage.module.css';

export function SupportPage() {
  const { user } = useAuthStore();
  const [tickets, setTickets] = useState<any[]>([]);
  const [activeTicket, setActiveTicket] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  
  const [isCreating, setIsCreating] = useState(false);
  const [newSubject, setNewSubject] = useState('');
  const [newMessage, setNewMessage] = useState('');
  
  const [replyMessage, setReplyMessage] = useState('');

  useEffect(() => {
    loadTickets();
  }, []);

  const loadTickets = async () => {
    try {
      const res = await userService.getSupportTickets();
      setTickets(res || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleSelectTicket = async (id: string) => {
    setIsCreating(false);
    try {
      const res = await userService.getSupportTicketById(id);
      setActiveTicket(res);
    } catch (err) {
      console.error(err);
    }
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newSubject.trim() || !newMessage.trim()) return;
    try {
      const res = await userService.createSupportTicket({ subject: newSubject, message: newMessage });
      await loadTickets();
      setActiveTicket(res);
      setIsCreating(false);
      setNewSubject('');
      setNewMessage('');
    } catch (err) {
      console.error(err);
    }
  };

  const handleReply = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!replyMessage.trim() || !activeTicket) return;
    try {
      await userService.replyToSupportTicket(activeTicket._id, replyMessage);
      await handleSelectTicket(activeTicket._id);
      setReplyMessage('');
    } catch (err) {
      console.error(err);
    }
  };

  if (loading) return <div style={{ padding: '24px' }}>Loading support...</div>;

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
        <h1 className="heading-page" style={{ margin: 0 }}>Support</h1>
        <Button onClick={() => { setIsCreating(true); setActiveTicket(null); }}>+ New Ticket</Button>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: '24px', height: 'calc(100vh - 160px)' }}>
        <Card style={{ padding: '0', display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
          <div style={{ padding: '16px', borderBottom: '1px solid var(--border-secondary)', background: 'var(--bg-secondary)' }}>
            <h3 style={{ margin: 0 }}>My Tickets</h3>
          </div>
          <div style={{ overflowY: 'auto', flex: 1 }}>
            {tickets.length === 0 ? (
              <div style={{ padding: '24px', color: 'var(--text-tertiary)', textAlign: 'center' }}>No support tickets.</div>
            ) : (
              tickets.map((t) => (
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
                  </div>
                  <div style={{ marginTop: '8px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ fontSize: '11px', padding: '2px 6px', background: 'var(--bg-secondary)', borderRadius: '4px', textTransform: 'uppercase' }}>
                      {t.status}
                    </span>
                    <span style={{ fontSize: '12px', color: 'var(--text-tertiary)' }}>{new Date(t.createdAt).toLocaleDateString()}</span>
                  </div>
                </div>
              ))
            )}
          </div>
        </Card>

        <Card style={{ padding: '0', display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
          {isCreating ? (
            <div style={{ padding: '24px', display: 'flex', flexDirection: 'column', height: '100%' }}>
              <h2 style={{ marginTop: 0 }}>Create Support Ticket</h2>
              <form onSubmit={handleCreate} style={{ display: 'flex', flexDirection: 'column', gap: '16px', flex: 1 }}>
                <Input label="Subject" required value={newSubject} onChange={e => setNewSubject(e.target.value)} />
                <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
                  <label style={{ fontSize: '14px', fontWeight: 'bold', marginBottom: '8px' }}>Message</label>
                  <textarea 
                    required
                    value={newMessage}
                    onChange={e => setNewMessage(e.target.value)}
                    style={{ flex: 1, width: '100%', padding: '12px', borderRadius: '8px', border: '1px solid var(--border-secondary)', resize: 'none', fontFamily: 'inherit' }}
                  />
                </div>
                <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px' }}>
                  <Button variant="secondary" type="button" onClick={() => setIsCreating(false)}>Cancel</Button>
                  <Button type="submit">Submit Ticket</Button>
                </div>
              </form>
            </div>
          ) : activeTicket ? (
            <>
              <div style={{ padding: '24px', borderBottom: '1px solid var(--border-secondary)', background: 'var(--bg-secondary)' }}>
                <h2 style={{ margin: '0 0 8px 0' }}>{activeTicket.subject}</h2>
                <div style={{ fontSize: '14px', color: 'var(--text-secondary)' }}>
                  Status: <strong style={{ textTransform: 'uppercase' }}>{activeTicket.status}</strong>
                </div>
              </div>
              
              <div style={{ flex: 1, overflowY: 'auto', padding: '24px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
                {activeTicket.messages.map((m: any, i: number) => (
                  <div key={i} style={{ 
                    alignSelf: m.senderRole === 'user' ? 'flex-end' : 'flex-start',
                    maxWidth: '80%',
                    background: m.senderRole === 'user' ? 'var(--color-primary-100)' : 'var(--bg-secondary)',
                    color: m.senderRole === 'user' ? 'var(--color-primary-900)' : 'var(--text-primary)',
                    padding: '16px',
                    borderRadius: '12px',
                    borderBottomRightRadius: m.senderRole === 'user' ? 0 : '12px',
                    borderBottomLeftRadius: m.senderRole === 'user' ? '12px' : 0,
                  }}>
                    <div style={{ fontSize: '12px', color: m.senderRole === 'user' ? 'var(--color-primary-600)' : 'var(--text-tertiary)', marginBottom: '8px' }}>
                      {m.senderRole === 'user' ? 'You' : 'Support'} - {new Date(m.createdAt).toLocaleString()}
                    </div>
                    <div style={{ whiteSpace: 'pre-wrap' }}>{m.content}</div>
                  </div>
                ))}
              </div>

              {activeTicket.status !== 'resolved' && (
                <form onSubmit={handleReply} style={{ padding: '24px', borderTop: '1px solid var(--border-secondary)' }}>
                  <textarea 
                    value={replyMessage}
                    onChange={(e) => setReplyMessage(e.target.value)}
                    placeholder="Type your reply here..."
                    style={{ width: '100%', padding: '12px', borderRadius: '8px', border: '1px solid var(--border-secondary)', minHeight: '80px', resize: 'vertical', marginBottom: '16px', fontFamily: 'inherit' }}
                  />
                  <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                    <Button type="submit" disabled={!replyMessage.trim()}>Send Reply</Button>
                  </div>
                </form>
              )}
            </>
          ) : (
            <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-tertiary)' }}>
              Select a ticket or create a new one.
            </div>
          )}
        </Card>
      </div>
    </div>
  );
}
