import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { ROLES } from '../constants/roles';
import { LoadingState } from '../components/common/LoadingState';

export function ProtectedRoute({ children, allowedRoles = [] }) {
  const { user, isAuthenticated, isLoading } = useAuth();
  const location = useLocation();

  if (isLoading) {
    return <LoadingState message="Checking authorization..." minHeight="60vh" />;
  }

  if (!isAuthenticated || !user) {
    const returnUrl = encodeURIComponent(location.pathname + location.search);
    return <Navigate to={`/login?returnTo=${returnUrl}`} replace />;
  }

  // Owner has universal access across all modules
  if (user.role === ROLES.OWNER) {
    return children;
  }

  // Check if role is in allowed list
  if (allowedRoles.length > 0 && !allowedRoles.includes(user.role)) {
    return <Navigate to="/403" replace />;
  }

  return children;
}

export default ProtectedRoute;

