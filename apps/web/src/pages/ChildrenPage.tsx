import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { createChildSchema, EHCP_STAGE_LABELS, EHCPStage } from '@nextx/shared';
import { api } from '../services/api';
import { useUIStore } from '../stores/uiStore';
import { Button } from '../components/ui/Button/Button';
import { Input } from '../components/ui/Input/Input';
import styles from './ChildrenPage.module.css';

interface Child {
  _id: string;
  firstName: string;
  lastName: string;
  dateOfBirth: string;
  school: string;
  localAuthority: string;
  ehcpStage: EHCPStage;
  notes: string;
}

export function ChildrenPage() {
  const queryClient = useQueryClient();
  const { addToast } = useUIStore();
  const [showModal, setShowModal] = useState(false);
  const [editingChild, setEditingChild] = useState<Child | null>(null);

  // ─── Fetch children ───
  const { data: children = [], isLoading } = useQuery<Child[]>({
    queryKey: ['children'],
    queryFn: async () => {
      const res = await api.get('/children');
      return res.data.data;
    },
  });

  // ─── Create / Update ───
  const form = useForm({
    resolver: zodResolver(createChildSchema),
  });

  function openCreateModal() {
    setEditingChild(null);
    form.reset({
      firstName: '',
      lastName: '',
      dateOfBirth: '',
      school: '',
      localAuthority: '',
      ehcpStage: EHCPStage.INITIAL_RESEARCH,
      notes: '',
    });
    setShowModal(true);
  }

  function openEditModal(child: Child) {
    setEditingChild(child);
    form.reset({
      firstName: child.firstName,
      lastName: child.lastName,
      dateOfBirth: child.dateOfBirth.split('T')[0],
      school: child.school,
      localAuthority: child.localAuthority,
      ehcpStage: child.ehcpStage,
      notes: child.notes || '',
    });
    setShowModal(true);
  }

  const saveMutation = useMutation({
    mutationFn: async (data: any) => {
      if (editingChild) {
        return api.patch(`/children/${editingChild._id}`, data);
      }
      return api.post('/children', data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['children'] });
      setShowModal(false);
      addToast({
        type: 'success',
        title: editingChild ? 'Child updated' : 'Child added',
      });
    },
    onError: () => {
      addToast({ type: 'error', title: 'Failed to save child' });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => api.delete(`/children/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['children'] });
      addToast({ type: 'success', title: 'Child removed' });
    },
  });

  function calculateAge(dob: string): string {
    const birth = new Date(dob);
    const now = new Date();
    const years = now.getFullYear() - birth.getFullYear();
    return `${years} years old`;
  }

  return (
    <div className={styles.childrenPage}>
      <div className={styles.headerRow}>
        <div>
          <h1 className="heading-page">My Children</h1>
          <p className={styles.subtitle}>
            Manage your children's profiles and EHCP journey stages
          </p>
        </div>
        <Button onClick={openCreateModal} leftIcon={<span>+</span>}>
          Add Child
        </Button>
      </div>

      {isLoading ? (
        <div className={styles.emptyState}>
          <div className="animate-pulse" style={{ color: 'var(--text-tertiary)' }}>
            Loading...
          </div>
        </div>
      ) : children.length === 0 ? (
        <div className={styles.emptyState}>
          <div className={styles.emptyIcon}>👶</div>
          <h2 className={styles.emptyTitle}>No children added yet</h2>
          <p className={styles.emptyDescription}>
            Add your child's details to start tracking their EHCP journey and
            get personalised guidance from our AI companion.
          </p>
          <Button size="lg" onClick={openCreateModal}>
            Add Your First Child
          </Button>
        </div>
      ) : (
        <div className={styles.grid}>
          {children.map((child) => (
            <div
              key={child._id}
              className={styles.childCard}
              onClick={() => openEditModal(child)}
            >
              <div className={styles.childAvatar}>👦</div>
              <div className={styles.childName}>
                {child.firstName} {child.lastName}
              </div>
              <div className={styles.childMeta}>
                {calculateAge(child.dateOfBirth)} · {child.school}
              </div>
              <div className={styles.stageBadge}>
                📍 {EHCP_STAGE_LABELS[child.ehcpStage] || child.ehcpStage}
              </div>
              <div className={styles.childActions}>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={(e) => {
                    e.stopPropagation();
                    openEditModal(child);
                  }}
                >
                  Edit
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={(e) => {
                    e.stopPropagation();
                    if (confirm(`Remove ${child.firstName}?`)) {
                      deleteMutation.mutate(child._id);
                    }
                  }}
                  style={{ color: 'var(--color-error-500)' }}
                >
                  Remove
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Add/Edit Modal */}
      {showModal && (
        <div className={styles.modalOverlay} onClick={() => setShowModal(false)}>
          <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
            <h2 className={styles.modalTitle}>
              {editingChild ? 'Edit Child' : 'Add Child'}
            </h2>
            <form
              className={styles.modalForm}
              onSubmit={form.handleSubmit((data) => saveMutation.mutate(data))}
            >
              <div className={styles.modalGrid}>
                <Input
                  label="First name"
                  required
                  error={form.formState.errors.firstName?.message as string}
                  {...form.register('firstName')}
                />
                <Input
                  label="Last name"
                  required
                  error={form.formState.errors.lastName?.message as string}
                  {...form.register('lastName')}
                />
              </div>

              <Input
                label="Date of birth"
                type="date"
                required
                error={form.formState.errors.dateOfBirth?.message as string}
                {...form.register('dateOfBirth')}
              />

              <Input
                label="School"
                required
                placeholder="Enter school name"
                error={form.formState.errors.school?.message as string}
                {...form.register('school')}
              />

              <Input
                label="Local authority"
                required
                placeholder="e.g. Westminster"
                error={form.formState.errors.localAuthority?.message as string}
                {...form.register('localAuthority')}
              />

              <div className={styles.selectWrapper}>
                <label className={styles.selectLabel}>EHCP Stage</label>
                <select className={styles.select} {...form.register('ehcpStage')}>
                  {Object.values(EHCPStage).map((stage) => (
                    <option key={stage} value={stage}>
                      {EHCP_STAGE_LABELS[stage] || stage}
                    </option>
                  ))}
                </select>
              </div>

              <Input
                label="Notes"
                placeholder="Any additional information..."
                {...form.register('notes')}
              />

              <div className={styles.modalActions}>
                <Button
                  variant="secondary"
                  type="button"
                  onClick={() => setShowModal(false)}
                >
                  Cancel
                </Button>
                <Button type="submit" loading={saveMutation.isPending}>
                  {editingChild ? 'Save Changes' : 'Add Child'}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
