import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { ROLES, ROLE_HOME } from '../constants/roles';
import { useAuth } from '../hooks/useAuth';

// Layout & Route Guards
import AppShell from '../components/layout/AppShell';
import ProtectedRoute from './ProtectedRoute';
import PublicOnlyRoute from './PublicOnlyRoute';

// Pages
import LoginPage from '../pages/auth/LoginPage';
import ForbiddenPage from '../pages/auth/ForbiddenPage';
import NotFoundPage from '../pages/auth/NotFoundPage';

import OwnerDashboard from '../pages/owner/OwnerDashboard';
import SalesDashboard from '../pages/sales/SalesDashboard';
import ManagerDashboard from '../pages/manager/ManagerDashboard';
import EmployeeDashboard from '../pages/employee/EmployeeDashboard';
import HrDashboard from '../pages/hr/HrDashboard';

function IndexRedirect() {
  const { user, isAuthenticated, isLoading } = useAuth();
  if (isLoading) return null;
  if (!isAuthenticated || !user) return <Navigate to="/login" replace />;
  return <Navigate to={ROLE_HOME[user.role] || '/login'} replace />;
}

export function AppRoutes() {
  return (
    <Routes>
      {/* Public Login Route */}
      <Route
        path="/login"
        element={
          <PublicOnlyRoute>
            <LoginPage />
          </PublicOnlyRoute>
        }
      />

      {/* Index Redirect */}
      <Route path="/" element={<IndexRedirect />} />

      {/* Authenticated Layout with AppShell */}
      <Route
        element={
          <ProtectedRoute>
            <AppShell />
          </ProtectedRoute>
        }
      >
        {/* Owner Dashboard */}
        <Route
          path="/owner/*"
          element={
            <ProtectedRoute allowedRoles={[ROLES.OWNER]}>
              <OwnerDashboard />
            </ProtectedRoute>
          }
        />

        {/* Sales Dashboard */}
        <Route
          path="/sales/*"
          element={
            <ProtectedRoute allowedRoles={[ROLES.SALES, ROLES.OWNER]}>
              <SalesDashboard />
            </ProtectedRoute>
          }
        />

        {/* Manager Dashboard */}
        <Route
          path="/manager/*"
          element={
            <ProtectedRoute allowedRoles={[ROLES.MANAGER, ROLES.OWNER]}>
              <ManagerDashboard />
            </ProtectedRoute>
          }
        />

        {/* Employee Dashboard */}
        <Route
          path="/employee/*"
          element={
            <ProtectedRoute allowedRoles={[ROLES.EMPLOYEE, ROLES.MANAGER, ROLES.OWNER]}>
              <EmployeeDashboard />
            </ProtectedRoute>
          }
        />

        {/* HR Dashboard */}
        <Route
          path="/hr/*"
          element={
            <ProtectedRoute allowedRoles={[ROLES.HR, ROLES.OWNER]}>
              <HrDashboard />
            </ProtectedRoute>
          }
        />
      </Route>

      {/* Error Pages */}
      <Route path="/403" element={<ForbiddenPage />} />
      <Route path="*" element={<NotFoundPage />} />
    </Routes>
  );
}

export default AppRoutes;

