import { HashRouter as Router, Routes, Route, Navigate, Outlet } from 'react-router-dom';

// --- Layouts ---
import EnterpriseSidebar from './components/common/EnterpriseSidebar';
import SentinelChat from './components/SentinelChat';

// --- Pages (Security Operations) ---
import SecurityPosture from './pages/SecurityPosture'; // The "Glass Table"
import MissionControl from './pages/MissionControl';   // Incident Review
import DataExplorer from './pages/DataExplorer';       // Threat Hunting
import Vulnerabilities from './pages/Vulnerabilities'; // Vuln Management
import SOARPlaybookEditor from './pages/SOARPlaybookEditor'; // Playbooks

// --- Pages (Observability) ---
import ServiceMap from './pages/ServiceMap';           // Topology
import HostManagement from './pages/console/HostManagement'; // Infrastructure
import NetworkMonitor from './components/NetworkMonitor'; // Network Traffic
import ProcessExplorer from './pages/ProcessExplorer'; // Process Manager

// --- Pages (Management) ---
import Reports from './pages/Reports';
import Settings from './pages/Settings';
import Integrations from './pages/Integrations'; // Assuming this exists or map to settings

// --- Auth ---
import Login from './pages/Login';
import Register from './pages/Register';
import PrivateRoute from './layouts/PrivateRoute';

function App() {
  return (
    <Router>
      <Routes>
        {/* Public Routes */}
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />

        {/* Protected Enterprise Routes */}
        <Route path="/" element={
          <PrivateRoute>
            <EnterpriseLayout />
          </PrivateRoute>
        }>
          {/* SOC Routes */}
          <Route index element={<SecurityPosture />} />
          <Route path="mission-control" element={<MissionControl />} />
          <Route path="threat-hunting" element={<DataExplorer />} />
          <Route path="vulnerabilities" element={<Vulnerabilities />} />
          <Route path="playbooks" element={<SOARPlaybookEditor />} />

          {/* Observability Routes */}
          <Route path="service-map" element={<ServiceMap />} />
          <Route path="infrastructure" element={<HostManagement />} />
          <Route path="network" element={<NetworkMonitor />} />
          <Route path="processes" element={<ProcessExplorer />} />

          {/* Admin Routes */}
          <Route path="reports" element={<Reports />} />
          <Route path="integrations" element={<Integrations />} /> {/* Create or Stub */}
          <Route path="settings" element={<Settings />} />
        </Route>

        {/* Catch all */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Router>
  );
}

// --- The Main Layout Wrapper ---
const EnterpriseLayout = () => {
  return (
    <div className="flex h-screen bg-slate-950 font-sans overflow-hidden text-slate-100">
      {/* 1. Sidebar */}
      <EnterpriseSidebar />

      {/* 2. Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 relative">

        {/* Optional: Top Bar for Global Search / Profile (If needed) */}
        {/* <TopBar /> */}

        {/* Scrollable Page Content */}
        <main className="flex-1 overflow-auto scrollbar-thin scrollbar-thumb-slate-800 p-0 relative">
          {/* Render the active route page */}
          <div className="min-h-full">
            <Outlet />
          </div>

          {/* 3. Floating AI Assistant (Available globally) */}
          <SentinelChat />
        </main>
      </div>
    </div>
  );
};

export default App;
