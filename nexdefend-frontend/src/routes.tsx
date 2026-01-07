import React from 'react';
import { BrowserRouter, Routes, Route, Navigate, Outlet } from 'react-router-dom';
import { useSelector } from 'react-redux';
import type { RootState } from '@/store';

import MainLayout from '@/layouts/MainLayout';
import AuthLayout from '@/layouts/AuthLayout';
import LoginPage from '@/pages/LoginPage';
import RegisterPage from '@/pages/RegisterPage';
import DashboardPage from '@/pages/DashboardPage';
import GenericPage from '@/components/GenericPage';

// Private Route Guard
const RequireAuth: React.FC = () => {
  const { isAuthenticated } = useSelector((state: RootState) => state.auth);

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return <Outlet />;
};

const AppRoutes: React.FC = () => {
  return (
    <BrowserRouter>
      <Routes>
        {/* Public Routes */}
        <Route element={<AuthLayout />}>
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
        </Route>

        {/* Protected Routes */}
        <Route element={<RequireAuth />}>
          <Route element={<MainLayout />}>
            <Route path="/" element={<Navigate to="/dashboard" replace />} />
            <Route path="/dashboard" element={<DashboardPage />} />

            {/* Placeholders for other pages */}
            <Route path="/console" element={<GenericPage title="Console" description="Terminal access and command execution." />} />
            <Route path="/security-overview" element={<GenericPage title="Security Overview" description="High-level security metrics." />} />
            <Route path="/alerts" element={<GenericPage title="Alerts" description="Manage and triage security alerts." />} />
            <Route path="/incidents" element={<GenericPage title="Incidents" description="Active incident investigation." />} />
            <Route path="/agents" element={<GenericPage title="Agents" description="Agent fleet management." />} />
            <Route path="/vulnerabilities" element={<GenericPage title="Vulnerabilities" description="Vulnerability scanning results." />} />
            <Route path="/processes" element={<GenericPage title="Process Explorer" description="Real-time process monitoring." />} />
            <Route path="/rules" element={<GenericPage title="Rules" description="Detection rule configuration." />} />
            <Route path="/data-explorer" element={<GenericPage title="Data Explorer" description="Log search and analysis." />} />
            <Route path="/reports" element={<GenericPage title="Reports" description="Generate and view reports." />} />
            <Route path="/integrations" element={<GenericPage title="Integrations" description="Manage external integrations." />} />
            <Route path="/mission-control" element={<GenericPage title="Mission Control" description="Centralized operations view." />} />
            <Route path="/topology" element={<GenericPage title="Network Topology" description="Visual network map." />} />
            <Route path="/network-dashboard" element={<GenericPage title="Network Dashboard" description="Network traffic analysis." />} />
            <Route path="/settings" element={<GenericPage title="Settings" description="System and user settings." />} />
            <Route path="/profile" element={<GenericPage title="Profile" description="User profile management." />} />

            {/* Catch-all for undefined routes inside protected area */}
            <Route path="*" element={<GenericPage title="404 Not Found" />} />
          </Route>
        </Route>
      </Routes>
    </BrowserRouter>
  );
};

export default AppRoutes;
