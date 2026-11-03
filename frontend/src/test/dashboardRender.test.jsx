import React from 'react';
import { describe, it, expect } from 'vitest';
import { render } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { ColorModeProvider } from '../theme/ColorModeContext';
import { AuthProvider } from '../context/AuthContext';
import { NotificationProvider } from '../context/NotificationContext';

import OwnerDashboard from '../pages/owner/OwnerDashboard';
import ManagerDashboard from '../pages/manager/ManagerDashboard';
import EmployeeDashboard from '../pages/employee/EmployeeDashboard';
import SalesDashboard from '../pages/sales/SalesDashboard';
import HrDashboard from '../pages/hr/HrDashboard';
import LogHoursDialog from '../pages/employee/LogHoursDialog';
import LoginPage from '../pages/auth/LoginPage';
import AppShell from '../components/layout/AppShell';

function renderWithProviders(ui) {
  return render(
    <BrowserRouter>
      <ColorModeProvider>
        <AuthProvider>
          <NotificationProvider>
            {ui}
          </NotificationProvider>
        </AuthProvider>
      </ColorModeProvider>
    </BrowserRouter>
  );
}

describe('Dashboard Component Render Tests', () => {
  it('renders AppShell without crashing', () => {
    expect(() => renderWithProviders(<AppShell />)).not.toThrow();
  });

  it('renders LoginPage without crashing', () => {
    expect(() => renderWithProviders(<LoginPage />)).not.toThrow();
  });

  it('renders OwnerDashboard without crashing', () => {
    expect(() => renderWithProviders(<OwnerDashboard />)).not.toThrow();
  });

  it('renders ManagerDashboard without crashing', () => {
    expect(() => renderWithProviders(<ManagerDashboard />)).not.toThrow();
  });

  it('renders EmployeeDashboard without crashing', () => {
    expect(() => renderWithProviders(<EmployeeDashboard />)).not.toThrow();
  });

  it('renders LogHoursDialog open without crashing', () => {
    expect(() =>
      renderWithProviders(
        <LogHoursDialog
          open={true}
          tasks={[{ id: 't-1', title: 'Test Task', projectName: 'Test Proj', estimateHrs: 8, loggedHrs: 2 }]}
          leaves={[{ status: 'approved', fromDate: '2026-11-10', toDate: '2026-11-12' }]}
          onClose={() => {}}
        />
      )
    ).not.toThrow();
  });

  it('renders SalesDashboard without crashing', () => {
    expect(() => renderWithProviders(<SalesDashboard />)).not.toThrow();
  });

  it('renders HrDashboard without crashing', () => {
    expect(() => renderWithProviders(<HrDashboard />)).not.toThrow();
  });
});
