import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { ROLE_HOME } from '../constants/roles';
import { LoadingState } from '../components/common/LoadingState';

export function PublicOnlyRoute({ children }) {
  const { user, isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return <LoadingState message="Loading..." minHeight="60vh" />;
  }

  if (isAuthenticated && user?.role) {
    return <Navigate to={ROLE_HOME[user.role] || '/'} replace />;
  }

  return children;
}

export default PublicOnlyRoute;

