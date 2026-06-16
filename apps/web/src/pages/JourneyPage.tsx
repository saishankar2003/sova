import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  EHCP_STAGE_LABELS,
  EHCP_STAGE_DESCRIPTIONS,
  EHCPStage,
  EHCP_STAGE_ORDER,
} from '@nextx/shared';
import type { CreateJourneyEventInput, AdvanceStageInput } from '@nextx/shared';
import { api } from '../services/api';
import { journeyService } from '../services/journey.service';
import { Card } from '../components/ui/Card/Card';
import { Button } from '../components/ui/Button/Button';
import { Modal } from '../components/ui/Modal/Modal';
import styles from './JourneyPage.module.css';

// ─── Types ───────────────────────────────────────────────────────
interface JourneyEvent {
  _id: string;
  stage: EHCPStage;
  eventType: string;
  title: string;
  description?: string | null;
  actionStatus?: 'pending' | 'completed' | 'overdue' | null;
  dueDate?: string | null;
  completedAt?: string | null;
  createdAt: string;
}

interface TimelineData {
  child: { _id: string; firstName: string; lastName: string; ehcpStage: EHCPStage };
  events: JourneyEvent[];
  currentStage: EHCPStage;
  stageProgress: { currentStageIndex: number; totalStages: number; percentComplete: number };
  nextStepsHint: string | null;
  pendingActionsCount: number;
}

// ─── Add Event Modal ──────────────────────────────────────────────
function AddEventModal({
  isOpen,
  onClose,
  childId,
  currentStage,
}: {
  isOpen: boolean;
  onClose: () => void;
  childId: string;
  currentStage: EHCPStage;
}) {
  const qc = useQueryClient();
  const [form, setForm] = useState<{
    eventType: string;
    stage: EHCPStage;
    title: string;
    description: string;
    dueDate: string;
  }>({
    eventType: 'note',
    stage: currentStage,
    title: '',
    description: '',
    dueDate: '',
  });

  const mutation = useMutation({
    mutationFn: (data: CreateJourneyEventInput) => journeyService.createEvent(childId, data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['journey', 'timeline', childId] });
      qc.invalidateQueries({ queryKey: ['journey', 'actions', childId] });
      onClose();
      setForm({ eventType: 'note', stage: currentStage, title: '', description: '', dueDate: '' });
    },
  });

  const isAction = form.eventType === 'action_created';

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    mutation.mutate({
      eventType: form.eventType as CreateJourneyEventInput['eventType'],
      stage: form.stage,
      title: form.title,
      description: form.description || null,
      actionStatus: isAction ? 'pending' : null,
      dueDate: isAction && form.dueDate ? new Date(form.dueDate).toISOString() : null,
    });
  }

  return (
    <Modal isOpen={isOpen} title="Log Event" onClose={onClose}>
      <form onSubmit={handleSubmit}>
        <div className={styles.formGroup}>
          <label className={styles.formLabel}>Event type</label>
          <select
            className={styles.formSelect}
            value={form.eventType}
            onChange={(e) => setForm((f) => ({ ...f, eventType: e.target.value }))}
          >
            <option value="note">Note</option>
            <option value="milestone">Milestone</option>
            <option value="action_created">Action / Task</option>
            <option value="document_added">Document added</option>
          </select>
        </div>
        <div className={styles.formGroup}>
          <label className={styles.formLabel}>Stage</label>
          <select
            className={styles.formSelect}
            value={form.stage}
            onChange={(e) => setForm((f) => ({ ...f, stage: e.target.value as EHCPStage }))}
          >
            {EHCP_STAGE_ORDER.map((s) => (
              <option key={s} value={s}>{EHCP_STAGE_LABELS[s]}</option>
            ))}
          </select>
        </div>
        <div className={styles.formGroup}>
          <label className={styles.formLabel}>Title *</label>
          <input
            className={styles.formInput}
            value={form.title}
            onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))}
            placeholder={isAction ? 'e.g. Submit parental evidence' : 'e.g. Received draft plan'}
            required
          />
        </div>
        <div className={styles.formGroup}>
          <label className={styles.formLabel}>Description</label>
          <textarea
            className={styles.formTextarea}
            value={form.description}
            onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
            placeholder="Optional notes..."
          />
        </div>
        {isAction && (
          <div className={styles.formGroup}>
            <label className={styles.formLabel}>Due date</label>
            <input
              className={styles.formInput}
              type="date"
              value={form.dueDate}
              onChange={(e) => setForm((f) => ({ ...f, dueDate: e.target.value }))}
            />
          </div>
        )}
        {mutation.isError && (
          <p style={{ color: 'var(--color-danger-600)', fontSize: 13, marginBottom: 12 }}>
            Failed to save. Please try again.
          </p>
        )}
        <div className={styles.modalActions}>
          <Button type="button" variant="secondary" onClick={onClose}>Cancel</Button>
          <Button type="submit" loading={mutation.isPending} disabled={!form.title.trim()}>
            Save
          </Button>
        </div>
      </form>
    </Modal>
  );
}

// ─── Advance Stage Modal ──────────────────────────────────────────
function AdvanceStageModal({
  isOpen,
  onClose,
  childId,
  currentStage,
}: {
  isOpen: boolean;
  onClose: () => void;
  childId: string;
  currentStage: EHCPStage;
}) {
  const qc = useQueryClient();
  const [targetStage, setTargetStage] = useState<EHCPStage>(
    EHCP_STAGE_ORDER[Math.min(EHCP_STAGE_ORDER.indexOf(currentStage) + 1, EHCP_STAGE_ORDER.length - 1)],
  );
  const [note, setNote] = useState('');

  const mutation = useMutation({
    mutationFn: (data: AdvanceStageInput) => journeyService.advanceStage(childId, data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['journey', 'timeline', childId] });
      qc.invalidateQueries({ queryKey: ['children'] });
      onClose();
      setNote('');
    },
  });

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    mutation.mutate({ stage: targetStage, note: note || undefined });
  }

  const availableStages = EHCP_STAGE_ORDER.filter((s) => s !== currentStage);

  return (
    <Modal isOpen={isOpen} title="Update Stage" onClose={onClose}>
      <form onSubmit={handleSubmit}>
        <div className={styles.formGroup}>
          <label className={styles.formLabel}>Current stage</label>
          <div style={{ padding: '10px 12px', background: 'var(--bg-secondary)', borderRadius: 8, fontSize: 14, color: 'var(--text-secondary)' }}>
            {EHCP_STAGE_LABELS[currentStage]}
          </div>
        </div>
        <div className={styles.formGroup}>
          <label className={styles.formLabel}>Move to</label>
          <select
            className={styles.formSelect}
            value={targetStage}
            onChange={(e) => setTargetStage(e.target.value as EHCPStage)}
          >
            {availableStages.map((s) => (
              <option key={s} value={s}>{EHCP_STAGE_LABELS[s]}</option>
            ))}
          </select>
        </div>
        <div className={styles.formGroup}>
          <label className={styles.formLabel}>Note (optional)</label>
          <textarea
            className={styles.formTextarea}
            value={note}
            onChange={(e) => setNote(e.target.value)}
            placeholder="What happened at this transition?"
          />
        </div>
        {mutation.isError && (
          <p style={{ color: 'var(--color-danger-600)', fontSize: 13, marginBottom: 12 }}>
            Failed to update stage. Please try again.
          </p>
        )}
        <div className={styles.modalActions}>
          <Button type="button" variant="secondary" onClick={onClose}>Cancel</Button>
          <Button type="submit" loading={mutation.isPending}>Update Stage</Button>
        </div>
      </form>
    </Modal>
  );
}

// ─── Main page ────────────────────────────────────────────────────
export function JourneyPage() {
  const qc = useQueryClient();
  const [selectedChildId, setSelectedChildId] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'nextsteps' | 'actions' | 'events'>('nextsteps');
  const [showAddEvent, setShowAddEvent] = useState(false);
  const [showAdvanceStage, setShowAdvanceStage] = useState(false);

  const { data: children = [], isLoading: loadingChildren } = useQuery({
    queryKey: ['children'],
    queryFn: async () => {
      const res = await api.get('/children');
      return res.data.data;
    },
  });

  const childId = selectedChildId ?? children[0]?._id ?? null;

  const { data: timeline, isLoading: loadingTimeline } = useQuery<TimelineData>({
    queryKey: ['journey', 'timeline', childId],
    queryFn: () => journeyService.getTimeline(childId!),
    enabled: !!childId,
  });

  const { data: nextStepsData } = useQuery({
    queryKey: ['journey', 'nextsteps', childId],
    queryFn: () => journeyService.getNextSteps(childId!),
    enabled: !!childId,
  });

  const completeAction = useMutation({
    mutationFn: (id: string) => journeyService.completeAction(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['journey', 'timeline', childId] });
    },
  });

  const deleteEvent = useMutation({
    mutationFn: (id: string) => journeyService.deleteEvent(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['journey', 'timeline', childId] });
    },
  });

  if (loadingChildren) {
    return <div style={{ padding: 24 }}>Loading...</div>;
  }

  if (children.length === 0) {
    return (
      <div style={{ padding: 24, textAlign: 'center' }}>
        <h1 className="heading-page">EHCP Journey</h1>
        <p style={{ color: 'var(--text-secondary)' }}>
          Add a child profile first to start tracking their EHCP journey.
        </p>
      </div>
    );
  }

  const currentStage = timeline?.currentStage ?? (children[0]?.ehcpStage as EHCPStage) ?? EHCPStage.INITIAL_RESEARCH;
  const events: JourneyEvent[] = timeline?.events ?? [];
  const progress = timeline?.stageProgress;

  // Group events by stage for inline display
  const eventsByStage = events.reduce<Record<string, JourneyEvent[]>>((acc, e) => {
    acc[e.stage] = acc[e.stage] ?? [];
    acc[e.stage].push(e);
    return acc;
  }, {});

  const currentIdx = EHCP_STAGE_ORDER.indexOf(currentStage);

  // Pending + completed actions from events
  const pendingActions = events.filter((e) => e.actionStatus === 'pending');
  const completedActions = events.filter((e) => e.actionStatus === 'completed');

  function formatDate(d?: string | null) {
    if (!d) return '';
    return new Date(d).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });
  }

  function isDuePast(d?: string | null) {
    if (!d) return false;
    return new Date(d) < new Date();
  }

  return (
    <div className={styles.page}>
      {/* Header */}
      <div className={styles.header}>
        <div className={styles.headerLeft}>
          <h1 className="heading-page" style={{ margin: '0 0 4px 0' }}>EHCP Journey</h1>
          <p>Track your child's progress through the EHCP process.</p>
        </div>
        <div className={styles.headerActions}>
          {children.length > 1 && (
            <select
              className={styles.childSelect}
              value={childId ?? ''}
              onChange={(e) => setSelectedChildId(e.target.value)}
            >
              {children.map((c: any) => (
                <option key={c._id} value={c._id}>{c.firstName} {c.lastName}</option>
              ))}
            </select>
          )}
          <Button variant="secondary" size="sm" onClick={() => setShowAddEvent(true)}>
            + Log Event
          </Button>
          <Button size="sm" onClick={() => setShowAdvanceStage(true)}>
            Update Stage
          </Button>
        </div>
      </div>

      {/* Progress */}
      {progress && (
        <div>
          <div className={styles.progressLabel}>
            <span>Stage {progress.currentStageIndex + 1} of {progress.totalStages}: <strong>{EHCP_STAGE_LABELS[currentStage]}</strong></span>
            <span>{progress.percentComplete}% complete</span>
          </div>
          <div className={styles.progressBar}>
            <div className={styles.progressFill} style={{ width: `${progress.percentComplete}%` }} />
          </div>
        </div>
      )}

      {loadingTimeline ? (
        <div style={{ padding: 24, color: 'var(--text-secondary)' }}>Loading timeline...</div>
      ) : (
        <div className={styles.layout}>
          {/* Left: Timeline */}
          <Card className={styles.timelineCard}>
            <h2>Timeline</h2>
            <div className={styles.timeline}>
              {EHCP_STAGE_ORDER.map((stage, idx) => {
                const stageStatus =
                  idx < currentIdx ? 'past' : idx === currentIdx ? 'current' : 'future';
                const stageEvents = eventsByStage[stage] ?? [];

                return (
                  <div key={stage} className={styles.stageRow}>
                    <div className={styles.stageConnector}>
                      <div className={`${styles.stageNode} ${styles[stageStatus]}`}>
                        {stageStatus === 'past' ? '✓' : idx + 1}
                      </div>
                      {idx < EHCP_STAGE_ORDER.length - 1 && (
                        <div className={`${styles.stageLine} ${styles[stageStatus]}`} />
                      )}
                    </div>
                    <div className={styles.stageContent}>
                      <div className={styles.stageHeader}>
                        <span className={`${styles.stageName} ${styles[stageStatus]}`}>
                          {EHCP_STAGE_LABELS[stage]}
                        </span>
                        {stageStatus === 'current' && (
                          <span className={styles.stageCurrentBadge}>Current</span>
                        )}
                      </div>
                      <p className={styles.stageDesc}>{EHCP_STAGE_DESCRIPTIONS[stage]}</p>
                      {stageEvents.length > 0 && (
                        <div className={styles.stageEvents}>
                          {stageEvents.slice(0, 3).map((e) => (
                            <div
                              key={e._id}
                              className={`${styles.stageEventChip} ${e.actionStatus === 'completed' ? styles.completed : e.actionStatus === 'pending' ? styles.action : ''}`}
                            >
                              <span style={{ fontSize: 10 }}>
                                {e.eventType === 'action_created' ? '☐'
                                  : e.eventType === 'action_completed' || e.actionStatus === 'completed' ? '✓'
                                  : e.eventType === 'milestone' ? '★'
                                  : e.eventType === 'document_added' ? '📄'
                                  : '•'}
                              </span>
                              {e.title}
                              {e.dueDate && e.actionStatus === 'pending' && (
                                <span style={{ marginLeft: 'auto', opacity: 0.7 }}>
                                  {formatDate(e.dueDate)}
                                </span>
                              )}
                            </div>
                          ))}
                          {stageEvents.length > 3 && (
                            <div className={styles.stageEventChip} style={{ opacity: 0.6 }}>
                              +{stageEvents.length - 3} more
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </Card>

          {/* Right: Next steps / Actions / Events */}
          <div className={styles.rightPanel}>
            <div className={styles.tabs}>
              {(['nextsteps', 'actions', 'events'] as const).map((t) => (
                <button
                  key={t}
                  className={`${styles.tab} ${activeTab === t ? styles.active : ''}`}
                  onClick={() => setActiveTab(t)}
                >
                  {t === 'nextsteps' ? 'Next Steps' : t === 'actions' ? `Actions${pendingActions.length ? ` (${pendingActions.length})` : ''}` : 'Event Log'}
                </button>
              ))}
            </div>

            {activeTab === 'nextsteps' && (
              <Card className={styles.nextStepsCard}>
                <h3 style={{ margin: '0 0 16px 0', fontSize: 15 }}>
                  What to do at: {EHCP_STAGE_LABELS[currentStage]}
                </h3>
                {nextStepsData?.nextSteps?.length > 0 ? (
                  <ul className={styles.nextStepsList}>
                    {nextStepsData.nextSteps.map((step: string, i: number) => (
                      <li key={i} className={styles.nextStepItem}>
                        <div className={styles.nextStepIcon}>{i + 1}</div>
                        {step}
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className={styles.empty}>No steps defined for this stage yet.</p>
                )}
              </Card>
            )}

            {activeTab === 'actions' && (
              <Card className={styles.actionsCard}>
                <h3 style={{ margin: '0 0 12px 0', fontSize: 15 }}>Pending</h3>
                {pendingActions.length === 0 ? (
                  <p className={styles.empty}>No pending actions. Log an action to track it.</p>
                ) : (
                  pendingActions.map((e) => (
                    <div key={e._id} className={styles.actionItem}>
                      <button
                        className={styles.actionCheck}
                        title="Mark complete"
                        onClick={() => completeAction.mutate(e._id)}
                      >
                        {completeAction.isPending ? '…' : ''}
                      </button>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div className={styles.actionTitle}>{e.title}</div>
                        {e.dueDate && (
                          <div className={`${styles.actionDue} ${isDuePast(e.dueDate) ? styles.overdue : ''}`}>
                            Due {formatDate(e.dueDate)}{isDuePast(e.dueDate) ? ' — overdue' : ''}
                          </div>
                        )}
                        <div style={{ fontSize: 12, color: 'var(--text-tertiary)' }}>
                          {EHCP_STAGE_LABELS[e.stage]}
                        </div>
                      </div>
                      <button
                        onClick={() => deleteEvent.mutate(e._id)}
                        style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-tertiary)', fontSize: 16, padding: '0 4px' }}
                        title="Delete"
                      >
                        ×
                      </button>
                    </div>
                  ))
                )}
                {completedActions.length > 0 && (
                  <>
                    <div className={styles.completedLabel}>Completed ({completedActions.length})</div>
                    {completedActions.slice(0, 5).map((e) => (
                      <div key={e._id} className={styles.actionItem} style={{ opacity: 0.6 }}>
                        <div className={styles.actionCheck} style={{ background: 'var(--color-success-100)', borderColor: 'var(--color-success-400)', color: 'var(--color-success-700)', fontSize: 12 }}>✓</div>
                        <div style={{ flex: 1 }}>
                          <div className={styles.actionTitle} style={{ textDecoration: 'line-through' }}>{e.title}</div>
                          {e.completedAt && <div className={styles.actionDue}>Done {formatDate(e.completedAt)}</div>}
                        </div>
                      </div>
                    ))}
                  </>
                )}
              </Card>
            )}

            {activeTab === 'events' && (
              <Card className={styles.eventLogCard}>
                <h3 style={{ margin: '0 0 12px 0', fontSize: 15 }}>Event Log</h3>
                {events.length === 0 ? (
                  <p className={styles.empty}>No events yet. Use "+ Log Event" to record what happens.</p>
                ) : (
                  events.slice(0, 20).map((e) => (
                    <div key={e._id} className={styles.eventItem}>
                      <div className={`${styles.eventDot} ${styles[e.eventType as keyof typeof styles] ?? ''}`} />
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div className={styles.eventTitle}>{e.title}</div>
                        <div className={styles.eventMeta}>
                          {EHCP_STAGE_LABELS[e.stage]} · {formatDate(e.createdAt)}
                          {e.description && ` — ${e.description}`}
                        </div>
                      </div>
                      <button
                        onClick={() => deleteEvent.mutate(e._id)}
                        style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-tertiary)', fontSize: 16, padding: '0 4px' }}
                        title="Delete"
                      >
                        ×
                      </button>
                    </div>
                  ))
                )}
              </Card>
            )}
          </div>
        </div>
      )}

      {/* Modals */}
      {childId && (
        <>
          <AddEventModal
            isOpen={showAddEvent}
            onClose={() => setShowAddEvent(false)}
            childId={childId}
            currentStage={currentStage}
          />
          <AdvanceStageModal
            isOpen={showAdvanceStage}
            onClose={() => setShowAdvanceStage(false)}
            childId={childId}
            currentStage={currentStage}
          />
        </>
      )}
    </div>
  );
}
