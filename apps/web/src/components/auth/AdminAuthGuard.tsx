import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAuthStore } from '../../stores/authStore';
import { UserRole } from '@nextx/shared';

export function AdminAuthGuard() {
  const { user, isAuthenticated } = useAuthStore();
  const location = useLocation();

  if (!isAuthenticated) {
    return <Navigate to="/admin/login" state={{ from: location }} replace />;
  }

  if (user?.role !== UserRole.ADMIN) {
    return <Navigate to="/dashboard" replace />;
  }

  return <Outlet />;
}
