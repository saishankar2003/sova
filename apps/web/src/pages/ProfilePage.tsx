import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { updateProfileSchema, changePasswordSchema } from '@nextx/shared';
import { useAuthStore } from '../stores/authStore';
import { useUIStore } from '../stores/uiStore';
import { api } from '../services/api';
import { Card } from '../components/ui/Card/Card';
import { Button } from '../components/ui/Button/Button';
import { Input } from '../components/ui/Input/Input';
import styles from './ProfilePage.module.css';

export function ProfilePage() {
  const { user, setUser, logout } = useAuthStore();
  const { addToast } = useUIStore();

  // ─── Profile Form ───
  const profileForm = useForm({
    resolver: zodResolver(updateProfileSchema),
    defaultValues: {
      firstName: user?.profile.firstName || '',
      lastName: user?.profile.lastName || '',
      phone: user?.profile.phone || '',
    },
  });

  async function onProfileSubmit(data: any) {
    try {
      const res = await api.patch('/users/me', data);
      setUser(res.data.data);
      addToast({ type: 'success', title: 'Profile updated' });
    } catch {
      addToast({ type: 'error', title: 'Failed to update profile' });
    }
  }

  // ─── Password Form ───
  const passwordForm = useForm({
    resolver: zodResolver(changePasswordSchema),
  });

  async function onPasswordSubmit(data: any) {
    try {
      await api.patch('/users/me/password', data);
      passwordForm.reset();
      addToast({ type: 'success', title: 'Password changed' });
    } catch (err: any) {
      addToast({
        type: 'error',
        title: 'Password change failed',
        message: err.response?.data?.error?.message,
      });
    }
  }

  // ─── Preferences ───
  const [prefs, setPrefs] = useState({
    emailNotifications: user?.preferences.emailNotifications ?? true,
    reminderEmails: user?.preferences.reminderEmails ?? true,
    weeklyDigest: user?.preferences.weeklyDigest ?? false,
  });

  async function togglePref(key: keyof typeof prefs) {
    const updated = { ...prefs, [key]: !prefs[key] };
    setPrefs(updated);
    try {
      const res = await api.patch('/users/me/preferences', { [key]: updated[key] });
      setUser(res.data.data);
    } catch {
      setPrefs(prefs); // rollback
      addToast({ type: 'error', title: 'Failed to update preferences' });
    }
  }

  if (!user) return null;

  const initials = `${user.profile.firstName[0]}${user.profile.lastName[0]}`;

  return (
    <div className={styles.profilePage}>
      <h1 className="heading-page" style={{ marginBottom: 'var(--space-6)' }}>
        Profile Settings
      </h1>

      {/* Avatar */}
      <div className={styles.avatarSection}>
        <div className={styles.avatar}>{initials}</div>
        <div className={styles.avatarInfo}>
          <div className={styles.avatarName}>
            {user.profile.firstName} {user.profile.lastName}
          </div>
          <div className={styles.avatarEmail}>{user.email}</div>
        </div>
      </div>

      {/* Profile Info */}
      <Card className={styles.section}>
        <div className={styles.sectionTitle}>👤 Personal Information</div>
        <form onSubmit={profileForm.handleSubmit(onProfileSubmit)}>
          <div className={styles.formGrid}>
            <Input
              label="First name"
              error={profileForm.formState.errors.firstName?.message as string}
              {...profileForm.register('firstName')}
            />
            <Input
              label="Last name"
              error={profileForm.formState.errors.lastName?.message as string}
              {...profileForm.register('lastName')}
            />
          </div>
          <div style={{ marginTop: 'var(--space-4)' }}>
            <Input
              label="Phone"
              type="tel"
              placeholder="+44 ..."
              error={profileForm.formState.errors.phone?.message as string}
              {...profileForm.register('phone')}
            />
          </div>
          <div className={styles.formActions}>
            <Button
              type="submit"
              loading={profileForm.formState.isSubmitting}
            >
              Save Changes
            </Button>
          </div>
        </form>
      </Card>

      {/* Change Password */}
      <Card className={styles.section}>
        <div className={styles.sectionTitle}>🔒 Change Password</div>
        <form onSubmit={passwordForm.handleSubmit(onPasswordSubmit)}>
          <Input
            label="Current password"
            type="password"
            autoComplete="current-password"
            error={passwordForm.formState.errors.currentPassword?.message as string}
            {...passwordForm.register('currentPassword')}
          />
          <div className={styles.formGrid} style={{ marginTop: 'var(--space-4)' }}>
            <Input
              label="New password"
              type="password"
              autoComplete="new-password"
              error={passwordForm.formState.errors.newPassword?.message as string}
              {...passwordForm.register('newPassword')}
            />
            <Input
              label="Confirm new password"
              type="password"
              autoComplete="new-password"
              error={passwordForm.formState.errors.confirmPassword?.message as string}
              {...passwordForm.register('confirmPassword')}
            />
          </div>
          <div className={styles.formActions}>
            <Button variant="secondary" type="button" onClick={() => passwordForm.reset()}>
              Cancel
            </Button>
            <Button type="submit" loading={passwordForm.formState.isSubmitting}>
              Update Password
            </Button>
          </div>
        </form>
      </Card>

      {/* Notification Preferences */}
      <Card className={styles.section}>
        <div className={styles.sectionTitle}>🔔 Notification Preferences</div>
        <div className={styles.prefItem}>
          <div>
            <div className={styles.prefLabel}>Email Notifications</div>
            <div className={styles.prefDescription}>Receive updates about your EHCP journey</div>
          </div>
          <button
            className={`${styles.toggle} ${prefs.emailNotifications ? styles.active : ''}`}
            onClick={() => togglePref('emailNotifications')}
            aria-label="Toggle email notifications"
          />
        </div>
        <div className={styles.prefItem}>
          <div>
            <div className={styles.prefLabel}>Reminder Emails</div>
            <div className={styles.prefDescription}>Get email reminders for upcoming deadlines</div>
          </div>
          <button
            className={`${styles.toggle} ${prefs.reminderEmails ? styles.active : ''}`}
            onClick={() => togglePref('reminderEmails')}
            aria-label="Toggle reminder emails"
          />
        </div>
        <div className={styles.prefItem}>
          <div>
            <div className={styles.prefLabel}>Weekly Digest</div>
            <div className={styles.prefDescription}>Summary of your week's activity every Monday</div>
          </div>
          <button
            className={`${styles.toggle} ${prefs.weeklyDigest ? styles.active : ''}`}
            onClick={() => togglePref('weeklyDigest')}
            aria-label="Toggle weekly digest"
          />
        </div>
      </Card>

      {/* Danger Zone */}
      <div className={styles.dangerZone}>
        <div className={styles.dangerTitle}>Danger Zone</div>
        <p className={styles.dangerDescription}>
          Deleting your account is permanent and cannot be undone. All your data,
          documents, and journey history will be permanently removed.
        </p>
        <Button variant="danger" size="sm" onClick={() => {
          if (confirm('Are you sure you want to delete your account? This cannot be undone.')) {
            api.delete('/users/me').then(() => logout());
          }
        }}>
          Delete Account
        </Button>
      </div>
    </div>
  );
}
