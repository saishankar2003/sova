import { useState, useEffect } from 'react';
import { useAuthStore } from '../stores/authStore';
import { userService } from '../services/user.service';
import { Card } from '../components/ui/Card/Card';
import { Button } from '../components/ui/Button/Button';
import { Input } from '../components/ui/Input/Input';

export function RemindersPage() {
  const { user } = useAuthStore();
  const [reminders, setReminders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  
  const [isCreating, setIsCreating] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newDueDate, setNewDueDate] = useState('');

  useEffect(() => {
    loadReminders();
  }, []);

  const loadReminders = async () => {
    try {
      const res = await userService.getReminders();
      setReminders(res || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim() || !newDueDate) return;
    try {
      await userService.createReminder({
        title: newTitle,
        dueAt: new Date(newDueDate).toISOString()
      });
      await loadReminders();
      setIsCreating(false);
      setNewTitle('');
      setNewDueDate('');
    } catch (err) {
      console.error(err);
    }
  };

  const handleComplete = async (id: string) => {
    try {
      await userService.completeReminder(id);
      await loadReminders();
    } catch (err) {
      console.error(err);
    }
  };

  const handleDismiss = async (id: string) => {
    try {
      await userService.dismissReminder(id);
      await loadReminders();
    } catch (err) {
      console.error(err);
    }
  };

  if (loading) return <div style={{ padding: '24px' }}>Loading reminders...</div>;

  const activeReminders = reminders.filter(r => !r.completed && !r.dismissed);
  const pastReminders = reminders.filter(r => r.completed || r.dismissed);

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
        <h1 className="heading-page" style={{ margin: 0 }}>Reminders</h1>
        <Button onClick={() => setIsCreating(true)}>+ New Reminder</Button>
      </div>

      {isCreating && (
        <Card style={{ padding: '24px', marginBottom: '24px' }}>
          <h2 style={{ marginTop: 0 }}>Create Reminder</h2>
          <form onSubmit={handleCreate} style={{ display: 'flex', gap: '16px', alignItems: 'flex-end' }}>
            <div style={{ flex: 1 }}>
              <Input label="Title" required value={newTitle} onChange={e => setNewTitle(e.target.value)} />
            </div>
            <div>
              <Input label="Due Date" type="date" required value={newDueDate} onChange={e => setNewDueDate(e.target.value)} />
            </div>
            <div style={{ display: 'flex', gap: '8px', paddingBottom: '4px' }}>
              <Button variant="secondary" type="button" onClick={() => setIsCreating(false)}>Cancel</Button>
              <Button type="submit">Add</Button>
            </div>
          </form>
        </Card>
      )}

      <Card style={{ padding: '0', marginBottom: '24px' }}>
        <div style={{ padding: '16px', borderBottom: '1px solid var(--border-secondary)', background: 'var(--bg-secondary)' }}>
          <h3 style={{ margin: 0 }}>Upcoming Reminders</h3>
        </div>
        <div>
          {activeReminders.length === 0 ? (
            <div style={{ padding: '24px', color: 'var(--text-tertiary)', textAlign: 'center' }}>No upcoming reminders.</div>
          ) : (
            activeReminders.map(r => (
              <div key={r._id} style={{ padding: '16px', borderBottom: '1px solid var(--border-secondary)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <strong style={{ display: 'block', marginBottom: '4px' }}>{r.title}</strong>
                  <span style={{ fontSize: '13px', color: new Date(r.dueAt) < new Date() ? 'var(--color-danger-600)' : 'var(--text-secondary)' }}>
                    Due: {new Date(r.dueAt).toLocaleDateString()}
                  </span>
                </div>
                <div style={{ display: 'flex', gap: '8px' }}>
                  <Button size="sm" onClick={() => handleComplete(r._id)}>Complete</Button>
                  <Button size="sm" variant="secondary" onClick={() => handleDismiss(r._id)}>Dismiss</Button>
                </div>
              </div>
            ))
          )}
        </div>
      </Card>

      {pastReminders.length > 0 && (
        <Card style={{ padding: '0' }}>
          <div style={{ padding: '16px', borderBottom: '1px solid var(--border-secondary)', background: 'var(--bg-secondary)' }}>
            <h3 style={{ margin: 0 }}>Past Reminders</h3>
          </div>
          <div>
            {pastReminders.map(r => (
              <div key={r._id} style={{ padding: '16px', borderBottom: '1px solid var(--border-secondary)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', opacity: 0.7 }}>
                <div>
                  <strong style={{ display: 'block', marginBottom: '4px', textDecoration: r.completed ? 'line-through' : 'none' }}>{r.title}</strong>
                  <span style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>
                    {r.completed ? 'Completed' : 'Dismissed'}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </Card>
      )}
    </div>
  );
}
