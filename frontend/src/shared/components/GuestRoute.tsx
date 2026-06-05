import { Navigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import type { ReactNode } from 'react';

export default function GuestRoute({ children }: { children: ReactNode }) {
  const { isAuthenticated } = useAuth();
  if (isAuthenticated) return <Navigate to="/" replace />;
  return <>{children}</>;
}
