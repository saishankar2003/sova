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

export const router = createBrowserRouter([
  // ─── Public Routes ───
  { path: '/login', element: <LoginPage /> },
  { path: '/signup', element: <SignupPage /> },
  { path: '/forgot-password', element: <ForgotPasswordPage /> },
  { path: '/reset-password', element: <ResetPasswordPage /> },

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
      { path: 'journey/:childId', element: <DashboardPage /> },
      { path: 'journey/:childId/actions', element: <DashboardPage /> },
      { path: 'documents', element: <DocumentsPage /> },
      { path: 'reminders', element: <DashboardPage /> },
      { path: 'faq', element: <DashboardPage /> },
      { path: 'ehcp-intro', element: <DashboardPage /> },
      { path: 'subscription', element: <DashboardPage /> },
      { path: 'support', element: <DashboardPage /> },
    ],
  },

  // ─── 404 ───
  { path: '*', element: <NotFoundPage /> },
]);
