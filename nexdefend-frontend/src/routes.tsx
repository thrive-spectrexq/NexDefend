import React from 'react';
import { BrowserRouter, Routes, Route, Navigate, Outlet } from 'react-router-dom';
import { useSelector } from 'react-redux';
import type { RootState } from '@/store';

import MainLayout from '@/layouts/MainLayout';
import AuthLayout from '@/layouts/AuthLayout';
import HomePage from '@/pages/HomePage';
import LoginPage from '@/pages/LoginPage';
import RegisterPage from '@/pages/RegisterPage';
import DashboardPage from '@/pages/DashboardPage';
import GenericPage from '@/components/GenericPage';
import ConsolePage from '@/pages/ConsolePage';
import AlertsPage from '@/pages/AlertsPage';
import IncidentsPage from '@/pages/IncidentsPage';
import AgentsPage from '@/pages/AgentsPage';
import TopologyPage from '@/pages/TopologyPage';
import NetworkDashboardPage from '@/pages/NetworkDashboardPage';
import VulnerabilitiesPage from '@/pages/VulnerabilitiesPage';
import DataExplorerPage from '@/pages/DataExplorerPage';
import SettingsPage from '@/pages/SettingsPage';
import GrafanaPage from '@/pages/GrafanaPage';
import PrometheusPage from '@/pages/PrometheusPage';
import CloudDashboardPage from '@/pages/CloudDashboardPage';
import PlaybooksPage from '@/pages/PlaybooksPage';
import PlaybookEditorPage from '@/pages/PlaybookEditorPage';

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
        <Route path="/" element={<HomePage />} />
        <Route element={<AuthLayout />}>
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
        </Route>

        {/* Protected Routes */}
        <Route element={<RequireAuth />}>
          <Route element={<MainLayout />}>
            <Route path="/dashboard" element={<DashboardPage />} />

            {/* Placeholders for other pages */}
            <Route path="/console" element={<ConsolePage />} />
            <Route path="/security-overview" element={<GenericPage title="Security Overview" description="High-level security metrics." />} />
            <Route path="/alerts" element={<AlertsPage />} />
            <Route path="/incidents" element={<IncidentsPage />} />
            <Route path="/agents" element={<AgentsPage />} />
            <Route path="/vulnerabilities" element={<VulnerabilitiesPage />} />
            <Route path="/processes" element={<GenericPage title="Process Explorer" description="Real-time process monitoring." />} />
            <Route path="/rules" element={<GenericPage title="Rules" description="Detection rule configuration." />} />
            <Route path="/data-explorer" element={<DataExplorerPage />} />
            <Route path="/reports" element={<GenericPage title="Reports" description="Generate and view reports." />} />
            <Route path="/integrations" element={<GenericPage title="Integrations" description="Manage external integrations." />} />
            <Route path="/mission-control" element={<GenericPage title="Mission Control" description="Centralized operations view." />} />
            <Route path="/topology" element={<TopologyPage />} />
            <Route path="/network-dashboard" element={<NetworkDashboardPage />} />
            <Route path="/settings" element={<SettingsPage />} />
            <Route path="/profile" element={<GenericPage title="Profile" description="User profile management." />} />
            <Route path="/grafana" element={<GrafanaPage />} />
            <Route path="/prometheus" element={<PrometheusPage />} />
            <Route path="/cloud-monitoring" element={<CloudDashboardPage />} />
            <Route path="/playbooks" element={<PlaybooksPage />} />
            <Route path="/playbooks/new" element={<PlaybookEditorPage />} />
            <Route path="/playbooks/edit/:id" element={<PlaybookEditorPage />} />

            {/* Catch-all for undefined routes inside protected area */}
            <Route path="*" element={<GenericPage title="404 Not Found" />} />
          </Route>
        </Route>
      </Routes>
    </BrowserRouter>
  );
};

export default AppRoutes;
