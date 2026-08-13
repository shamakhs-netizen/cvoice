import { Navigate, useLocation } from 'react-router-dom';
import type { ReactNode } from 'react';
import { useAuth } from '@/context/AuthContext';

export default function ProtectedRoute({ children }: { children: ReactNode }) {
  const { user, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <div className="flex items-center gap-3 text-indigo-600">
          <span className="h-2.5 w-2.5 rounded-full bg-indigo-600 animate-pulse" />
          <span className="text-sm font-medium text-gray-500">Loading…</span>
        </div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" state={{ from: location.pathname }} replace />;
  }

  return <>{children}</>;
}
