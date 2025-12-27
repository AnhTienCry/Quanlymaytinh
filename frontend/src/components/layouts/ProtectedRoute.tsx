/**
 * Protected Route Component
 * Handles authentication and authorization checks
 */

import { useEffect, useState } from 'react';
import { Navigate } from 'react-router-dom';
import { useAuthStore } from '../../stores/authStore';
import { LoadingScreen } from './LoadingScreen';

interface ProtectedRouteProps {
  children: React.ReactNode;
  requireAdmin?: boolean;
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({
  children,
  requireAdmin = false,
}) => {
  const { token, checkAuth } = useAuthStore();
  const [isChecking, setIsChecking] = useState(true);
  const [isAuthorized, setIsAuthorized] = useState(false);

  useEffect(() => {
    const verifyAuth = async () => {
      // Check if token exists
      const currentToken = token || localStorage.getItem('token');
      if (!currentToken) {
        setIsChecking(false);
        setIsAuthorized(false);
        return;
      }

      // Verify token is valid by calling checkAuth
      const isValid = await checkAuth();
      const currentUser = useAuthStore.getState().user;

      if (!isValid || !currentUser) {
        setIsChecking(false);
        setIsAuthorized(false);
        return;
      }

      // Check admin requirement
      if (requireAdmin && currentUser.role !== 'admin') {
        setIsChecking(false);
        setIsAuthorized(false);
        return;
      }

      setIsChecking(false);
      setIsAuthorized(true);
    };

    verifyAuth();
  }, [token, requireAdmin, checkAuth]);

  if (isChecking) {
    return <LoadingScreen />;
  }

  if (!isAuthorized) {
    if (requireAdmin) {
      // User trying to access admin route without permission
      return <Navigate to="/user-home" replace />;
    }
    return <Navigate to="/login" replace />;
  }

  return <>{children}</>;
};

