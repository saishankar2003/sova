import { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { EHCP_STAGE_LABELS, EHCPStage, EHCP_STAGE_ORDER } from '@nextx/shared';
import { api } from '../services/api';
import { userService } from '../services/user.service';
import { Card } from '../components/ui/Card/Card';
import { Button } from '../components/ui/Button/Button';

export function JourneyPage() {
  const [selectedChildId, setSelectedChildId] = useState<string | null>(null);

  // Fetch children
  const { data: children = [], isLoading: loadingChildren } = useQuery({
    queryKey: ['children'],
    queryFn: async () => {
      const res = await api.get('/children');
      return res.data.data;
    },
  });

  // Automatically select first child if none selected
  useEffect(() => {
    if (children.length > 0 && !selectedChildId) {
      setSelectedChildId(children[0]._id);
    }
  }, [children, selectedChildId]);

  // Fetch journey for selected child
  const { data: journey, isLoading: loadingJourney } = useQuery({
    queryKey: ['journey', selectedChildId],
    queryFn: () => userService.getJourney(selectedChildId!),
    enabled: !!selectedChildId,
  });

  if (loadingChildren) return <div style={{ padding: '24px' }}>Loading children...</div>;

  if (children.length === 0) {
    return (
      <div style={{ padding: '24px', textAlign: 'center' }}>
        <h1 className="heading-page">Your EHCP Journey</h1>
        <p style={{ color: 'var(--text-secondary)' }}>Please add a child profile first to track their journey.</p>
      </div>
    );
  }

  const STAGES = EHCP_STAGE_ORDER;

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
        <div>
          <h1 className="heading-page" style={{ margin: 0 }}>EHCP Journey Tracker</h1>
          <p style={{ color: 'var(--text-secondary)', margin: '8px 0 0 0' }}>Track your progress and see what's next.</p>
        </div>
        
        {children.length > 1 && (
          <select 
            value={selectedChildId || ''} 
            onChange={e => setSelectedChildId(e.target.value)}
            style={{ padding: '8px 12px', borderRadius: '8px', border: '1px solid var(--border-secondary)', background: 'var(--bg-elevated)', fontFamily: 'inherit' }}
          >
            {children.map((c: any) => (
              <option key={c._id} value={c._id}>{c.firstName} {c.lastName}</option>
            ))}
          </select>
        )}
      </div>

      {loadingJourney ? (
        <div>Loading journey...</div>
      ) : journey ? (
        <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '24px' }}>
          
          {/* Timeline */}
          <Card style={{ padding: '32px' }}>
            <h2 style={{ margin: '0 0 24px 0' }}>Timeline</h2>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0' }}>
              {STAGES.map((stage, index) => {
                const isCurrent = journey.currentStage === stage;
                // Basic logic: if stage index <= current stage index in a linear flow, it's "past"
                // But EHCP isn't perfectly linear. For UI sake, we'll just highlight the current.
                
                return (
                  <div key={stage} style={{ display: 'flex', gap: '16px', position: 'relative' }}>
                    {/* Line connecting nodes */}
                    {index !== STAGES.length - 1 && (
                      <div style={{ position: 'absolute', left: '11px', top: '24px', bottom: '-24px', width: '2px', background: isCurrent ? 'var(--color-primary-200)' : 'var(--border-secondary)' }} />
                    )}
                    
                    {/* Node */}
                    <div style={{ 
                      width: '24px', height: '24px', borderRadius: '50%', 
                      background: isCurrent ? 'var(--color-primary-600)' : 'var(--bg-secondary)',
                      border: isCurrent ? '4px solid var(--color-primary-100)' : '2px solid var(--border-secondary)',
                      zIndex: 1, flexShrink: 0, marginTop: '2px'
                    }} />
                    
                    {/* Content */}
                    <div style={{ paddingBottom: '32px' }}>
                      <h3 style={{ margin: '0 0 4px 0', color: isCurrent ? 'var(--color-primary-700)' : 'var(--text-primary)' }}>
                        {EHCP_STAGE_LABELS[stage]}
                      </h3>
                      {isCurrent && (
                        <div style={{ fontSize: '14px', color: 'var(--text-secondary)' }}>
                          You are currently at this stage. Check your Next Steps to see what you should be doing.
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </Card>

          {/* Next Steps & Info */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
            <Card style={{ padding: '24px', background: 'var(--color-primary-50)', borderColor: 'var(--color-primary-200)' }}>
              <h3 style={{ margin: '0 0 16px 0', color: 'var(--color-primary-900)' }}>Next Steps</h3>
              {journey.nextSteps?.length > 0 ? (
                <ul style={{ margin: 0, paddingLeft: '20px', color: 'var(--color-primary-800)', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  {journey.nextSteps.map((step: string, i: number) => (
                    <li key={i}>{step}</li>
                  ))}
                </ul>
              ) : (
                <p style={{ margin: 0, color: 'var(--color-primary-800)', fontSize: '14px' }}>
                  No immediate next steps. Keep checking back or ask the AI Chat for guidance!
                </p>
              )}
            </Card>

            <Card style={{ padding: '24px' }}>
              <h3 style={{ margin: '0 0 16px 0' }}>Recent Events</h3>
              {journey.events?.length > 0 ? (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  {journey.events.slice().reverse().slice(0, 5).map((e: any, i: number) => (
                    <div key={i} style={{ fontSize: '13px' }}>
                      <strong style={{ display: 'block', color: 'var(--text-primary)' }}>{e.type}</strong>
                      <span style={{ color: 'var(--text-tertiary)' }}>{new Date(e.timestamp).toLocaleDateString()}</span>
                      {e.description && <div style={{ color: 'var(--text-secondary)', marginTop: '2px' }}>{e.description}</div>}
                    </div>
                  ))}
                </div>
              ) : (
                <p style={{ margin: 0, color: 'var(--text-tertiary)', fontSize: '14px' }}>No events recorded yet.</p>
              )}
            </Card>
          </div>

        </div>
      ) : (
        <div>Failed to load journey.</div>
      )}
    </div>
  );
}
