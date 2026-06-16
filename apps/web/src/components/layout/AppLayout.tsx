import { Outlet, NavLink, useNavigate } from 'react-router-dom';
import { useAuthStore } from '../../stores/authStore';
import { useUIStore } from '../../stores/uiStore';
import styles from './AppLayout.module.css';
import clsx from 'clsx';
import { useEffect, useState } from 'react';
import { api } from '../../services/api';

const NAV_ITEMS = [
  { section: 'Main', items: [
    { to: '/dashboard', label: 'Dashboard' },
    { to: '/chat', label: 'AI Chat' },
    { to: '/children', label: 'My Children' },
  ]},
  { section: 'Journey', items: [
    { to: '/journey', label: 'EHCP Journey' },
    { to: '/documents', label: 'Documents' },
    { to: '/reminders', label: 'Reminders' },
  ]},
  { section: 'Resources', items: [
    { to: '/faq', label: 'FAQ' },
    { to: '/ehcp-intro', label: 'EHCP Guide' },
    { to: '/support', label: 'Support' },
    { to: '/subscription', label: 'Subscription' },
  ]},
];

export function AppLayout() {
  const { user, isAuthenticated, logout } = useAuthStore();
  const { sidebarOpen, sidebarCollapsed, setSidebarOpen } = useUIStore();
  const navigate = useNavigate();
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);

  // Redirect to login if not authenticated
  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login', { replace: true });
    }
  }, [isAuthenticated, navigate]);

  if (!isAuthenticated) return null;

  const initials = user
    ? `${user.profile.firstName[0]}${user.profile.lastName[0]}`
    : '?';

  return (
    <div className={styles.layout}>
      {/* Sidebar Overlay (mobile) */}
      <div
        className={clsx(styles.overlay, sidebarOpen && styles.visible)}
        onClick={() => setSidebarOpen(false)}
      />

      {/* Sidebar */}
      <aside
        className={clsx(
          styles.sidebar,
          sidebarOpen && styles.open,
          sidebarCollapsed && styles.collapsed,
        )}
      >
        <div className={styles.sidebarHeader}>
          <div className={styles.logoIcon}>N</div>
          <span className={styles.logo}>NextX</span>
        </div>

        <nav className={styles.nav}>
          {NAV_ITEMS.map((section) => (
            <div key={section.section} className={styles.navSection}>
              <div className={styles.navSectionLabel}>{section.section}</div>
              {section.items.map((item) => (
                <NavLink
                  key={item.to}
                  to={item.to}
                  className={({ isActive }) =>
                    clsx(styles.navItem, isActive && styles.active)
                  }
                  onClick={() => setSidebarOpen(false)}
                >
                  <span className={styles.navItemLabel}>{item.label}</span>
                </NavLink>
              ))}
            </div>
          ))}
        </nav>

        <div className={styles.sidebarFooter}>
          <NavLink
            to="/profile"
            className={({ isActive }) =>
              clsx(styles.navItem, isActive && styles.active)
            }
          >
            <span className={styles.navItemLabel}>Settings</span>
          </NavLink>
          <button
            onClick={() => setShowLogoutConfirm(true)}
            className={clsx(styles.navItem, styles.logoutButton)}
          >
            <span className={styles.navItemLabel}>Log Out</span>
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <div className={clsx(styles.main, sidebarCollapsed && styles.sidebarCollapsed)}>
        {/* Header */}
        <header className={styles.header}>
          <div className={styles.headerLeft}>
            <button
              className={styles.menuButton}
              onClick={() => setSidebarOpen(true)}
              aria-label="Open menu"
            >
              ☰
            </button>
          </div>

          <div className={styles.headerRight}>
            <div className={styles.userMenu} onClick={() => navigate('/profile')}>
              <div className={styles.userAvatar}>{initials}</div>
              <span className={styles.userName}>
                {user?.profile.firstName} {user?.profile.lastName}
              </span>
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className={styles.content}>
          <div className="page-enter">
            <Outlet />
          </div>
        </main>
      </div>

      {/* Logout Confirmation Modal */}
      {showLogoutConfirm && (
        <div className={styles.modalOverlay}>
          <div className={styles.modalContent}>
            <h3>Confirm Logout</h3>
            <p>Are you sure you want to log out of your account?</p>
            <div className={styles.modalFooter}>
              <button 
                className={styles.modalButtonSecondary} 
                onClick={() => setShowLogoutConfirm(false)}
              >
                Cancel
              </button>
              <button 
                className={styles.modalButtonPrimary}
                onClick={async () => {
                  const refreshToken = localStorage.getItem('refreshToken');
                  if (refreshToken) {
                    try {
                      await api.post('/auth/logout', { refreshToken });
                    } catch (err) {
                      console.error('API logout failed:', err);
                    }
                  }
                  logout();
                }}
              >
                Log Out
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
