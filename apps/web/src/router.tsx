import { createBrowserRouter, Navigate } from 'react-router-dom';
import { AppLayout } from './components/layout/AppLayout';

// ─── Auth Pages (lazy loaded) ───
import { LoginPage } from './pages/auth/LoginPage';
import { SignupPage } from './pages/auth/SignupPage';
import { ForgotPasswordPage } from './pages/auth/ForgotPasswordPage';
import { ResetPasswordPage } from './pages/auth/ResetPasswordPage';

// ─── Main Pages (lazy loaded) ───
import { DashboardPage } from './pages/DashboardPage';
import { ProfilePage } from './pages/ProfilePage';
import { ChildrenPage } from './pages/ChildrenPage';
import { DocumentsPage } from './pages/DocumentsPage';
import { NotFoundPage } from './pages/NotFoundPage';

// ─── M2 Pages ───
import { JourneyPage } from './pages/JourneyPage';
import { RemindersPage } from './pages/RemindersPage';
import { SupportPage } from './pages/SupportPage';

// ─── Admin Pages ───
import { AdminLayout } from './components/layout/AdminLayout';
import { AdminAuthGuard } from './components/auth/AdminAuthGuard';
import { AdminLoginPage } from './pages/admin/AdminLoginPage';
import { AdminDashboardPage } from './pages/admin/AdminDashboardPage';
import { AdminUsersPage } from './pages/admin/AdminUsersPage';
import { AdminUserDetailPage } from './pages/admin/AdminUserDetailPage';
import { AdminDocumentsPage } from './pages/admin/AdminDocumentsPage';
import { AdminSupportPage } from './pages/admin/AdminSupportPage';
import { AdminKnowledgePage } from './pages/admin/AdminKnowledgePage';
import { AdminAuditPage } from './pages/admin/AdminAuditPage';

export const router = createBrowserRouter([
  // ─── Public Routes ───
  { path: '/login', element: <LoginPage /> },
  { path: '/signup', element: <SignupPage /> },
  { path: '/forgot-password', element: <ForgotPasswordPage /> },
  { path: '/reset-password', element: <ResetPasswordPage /> },

  // ─── Admin Routes ───
  { path: '/admin/login', element: <AdminLoginPage /> },
  {
    path: '/admin',
    element: <AdminAuthGuard />,
    children: [
      {
        path: '',
        element: <AdminLayout />,
        children: [
          { index: true, element: <Navigate to="/admin/dashboard" replace /> },
          { path: 'dashboard', element: <AdminDashboardPage /> },
          { path: 'users', element: <AdminUsersPage /> },
          { path: 'users/:id', element: <AdminUserDetailPage /> },
          { path: 'documents', element: <AdminDocumentsPage /> },
          { path: 'support', element: <AdminSupportPage /> },
          { path: 'knowledge', element: <AdminKnowledgePage /> },
          { path: 'audit', element: <AdminAuditPage /> },
        ]
      }
    ]
  },

  // ─── Protected Routes ───
  {
    path: '/',
    element: <AppLayout />,
    children: [
      { index: true, element: <Navigate to="/dashboard" replace /> },
      { path: 'dashboard', element: <DashboardPage /> },
      { path: 'profile', element: <ProfilePage /> },
      { path: 'children', element: <ChildrenPage /> },

      // Placeholder routes — will be implemented
      { path: 'children/:id', element: <DashboardPage /> },
      { path: 'chat', element: <DashboardPage /> },
      { path: 'chat/:sessionId', element: <DashboardPage /> },
      { path: 'journey', element: <JourneyPage /> },
      { path: 'documents', element: <DocumentsPage /> },
      { path: 'reminders', element: <RemindersPage /> },
      { path: 'faq', element: <DashboardPage /> },
      { path: 'ehcp-intro', element: <DashboardPage /> },
      { path: 'subscription', element: <DashboardPage /> },
      { path: 'support', element: <SupportPage /> },
    ],
  },

  // ─── 404 ───
  { path: '*', element: <NotFoundPage /> },
]);
