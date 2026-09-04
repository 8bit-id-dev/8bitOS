import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useSession } from '@/features/auth/useSession';

export function RequireAuth() {
  const { user, isLoading } = useSession();
  const location = useLocation();

  if (isLoading) {
    return (
      <div className="fixed inset-0 flex items-center justify-center font-pixel text-small text-gray-300">
        LOADING…
      </div>
    );
  }
  if (!user) {
    return <Navigate to="/sign-in" state={{ from: location }} replace />;
  }
  return <Outlet />;
}
