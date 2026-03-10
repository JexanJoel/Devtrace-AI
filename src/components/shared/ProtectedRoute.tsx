import { Navigate } from 'react-router-dom';
import { useAuthStore } from '../../store/authStore';
import type { ReactNode } from 'react';

interface Props { children: ReactNode; }

const ProtectedRoute = ({ children }: Props) => {
  const { user, loading } = useAuthStore();

  // Still checking auth — don't redirect yet
  if (loading) return null;

  // Not logged in → go to login
  if (!user) return <Navigate to="/login" replace />;

  return <>{children}</>;
};

export default ProtectedRoute;