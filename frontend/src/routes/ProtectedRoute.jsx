import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import LoadingSpinner from '../components/LoadingSpinner';
import { dashboardPath } from '../utils/constants';

// Guards a group of routes. Not logged in -> login; wrong role -> own dashboard.
// (The API enforces the same rules - this only improves the user experience.)
export default function ProtectedRoute({ roles }) {
  const { user, loading } = useAuth();
  const location = useLocation();

  if (loading) return <LoadingSpinner fullScreen />;
  if (!user) {
    const to = roles?.includes('admin') && roles.length === 1 ? '/admin/login' : '/login';
    return <Navigate to={to} replace state={{ from: location }} />;
  }
  if (roles && !roles.includes(user.role)) return <Navigate to={dashboardPath(user.role)} replace />;
  return <Outlet />;
}
