import { createBrowserRouter, Navigate } from 'react-router-dom';

// Layouts
import { MainLayout } from './components/layout/MainLayout';
import AuthLayout from './layouts/AuthLayout';

// Public Pages
import HomePage from './pages/HomePage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';

// Dashboard / Feature Pages
import DashboardPage from './pages/DashboardPage';
import ConsolePage from './pages/ConsolePage';
import AlertsPage from './pages/AlertsPage';
import IncidentsPage from './pages/IncidentsPage';
import NetworkDashboardPage from './pages/NetworkDashboardPage';
import CloudDashboardPage from './pages/CloudDashboardPage';
import AgentsPage from './pages/AgentsPage';
import VulnerabilitiesPage from './pages/VulnerabilitiesPage';
import TopologyPage from './pages/TopologyPage';
import DataExplorerPage from './pages/DataExplorerPage';
import GrafanaPage from './pages/GrafanaPage';
import PrometheusPage from './pages/PrometheusPage';
import PlaybooksPage from './pages/PlaybooksPage';
import SettingsPage from './pages/SettingsPage';
import ProfilePage from './pages/ProfilePage';
import UEBAPage from './pages/UEBAPage';
import ThreatIntelPage from './pages/ThreatIntelPage';
import CompliancePage from './pages/CompliancePage';
import RiskPage from './pages/RiskPage';
import UserActivityPage from './pages/UserActivityPage';
import ActivityMonitoringPage from './pages/ActivityMonitoringPage';
import SystemHealthPage from './pages/SystemHealthPage';
import ServiceHealthPage from './pages/ServiceHealthPage';

export const router = createBrowserRouter([
  // 1. Landing & Authentication (Public)
  {
    path: '/',
    element: <HomePage />,
  },
  {
    element: <AuthLayout />,
    children: [
      { path: 'login', element: <LoginPage /> },
      { path: 'register', element: <RegisterPage /> },
    ],
  },

  // 2. The Dashboard (Protected Area with Sidebar)
  {
    element: <MainLayout />,
    children: [
      { path: 'dashboard', element: <DashboardPage /> }, // Main View

      // Operational Consoles
      { path: 'console', element: <ConsolePage /> },
      { path: 'network', element: <NetworkDashboardPage /> },
      { path: 'cloud', element: <CloudDashboardPage /> },

      // Threat Intelligence
      { path: 'alerts', element: <AlertsPage /> },
      { path: 'incidents', element: <IncidentsPage /> },
      { path: 'vulnerabilities', element: <VulnerabilitiesPage /> },
      { path: 'ueba', element: <UEBAPage /> },
      { path: 'threat-intel', element: <ThreatIntelPage /> },
      { path: 'compliance', element: <CompliancePage /> },
      { path: 'risk', element: <RiskPage /> },
      { path: 'user-activity', element: <UserActivityPage /> },
      { path: 'activity-monitoring', element: <ActivityMonitoringPage /> },

      // System & Assets
      { path: 'system-health', element: <SystemHealthPage /> },
      { path: 'service-health', element: <ServiceHealthPage /> },
      { path: 'agents', element: <AgentsPage /> },
      { path: 'topology', element: <TopologyPage /> },

      // Analytics & Tools
      { path: 'data-explorer', element: <DataExplorerPage /> },
      { path: 'grafana', element: <GrafanaPage /> },
      { path: 'prometheus', element: <PrometheusPage /> },
      { path: 'playbooks', element: <PlaybooksPage /> },

      // User Management
      { path: 'settings', element: <SettingsPage /> },
      { path: 'profile', element: <ProfilePage /> },
    ],
  },

  // Fallback: Redirect unknown paths to Home
  { path: '*', element: <Navigate to="/" replace /> },
]);
