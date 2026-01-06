import React from 'react';
import { HashRouter as Router, Routes, Route, NavLink, Navigate } from 'react-router-dom';
import {
  LayoutDashboard,
  Activity,
  Network,
  Settings as SettingsIcon,
  Shield,
  AlertTriangle,
  CheckCircle,
  FileText,
  Server,
  Cpu,
  Bug,
  Search,
  Workflow,
  BookOpen,
  LifeBuoy,
  Zap
} from 'lucide-react';

// Import Pages
import CommandDashboard from './pages/console/CommandDashboard';
import ProcessExplorer from './pages/ProcessExplorer';
import NetworkMonitor from './components/NetworkMonitor';
import Settings from './pages/Settings';
import SentinelChat from './components/SentinelChat';
import AIDashboardPage from './pages/AIDashboardPage';
import Alerts from './pages/Alerts';
import AlertTriage from './pages/AlertTriage';
import DetectionsQueue from './pages/console/DetectionsQueue';
import Incidents from './pages/Incidents';
import HostManagement from './pages/console/HostManagement';
import HostDetails from './pages/console/HostDetails';
import NetworkTopology from './pages/NetworkTopology';
import Vulnerabilities from './pages/Vulnerabilities';
import InvestigationView from './pages/console/InvestigationView';
import SOARPlaybookEditor from './pages/SOARPlaybookEditor';
import Reports from './pages/Reports';
import SecurityOverview from './pages/SecurityOverview';
import PlatformHealth from './pages/console/PlatformHealth';
import Support from './pages/console/Support';

function App() {
  return (
    <Router>
      <div className="flex min-h-screen bg-slate-950 text-slate-100 font-sans">

        {/* Sidebar Navigation */}
        <nav className="w-20 lg:w-64 bg-slate-900 border-r border-slate-800 flex flex-col shrink-0 transition-all duration-300 overflow-y-auto">
          <div className="p-6 flex items-center gap-3 border-b border-slate-800 sticky top-0 bg-slate-900 z-10">
            <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center shrink-0">
              <Shield className="text-white" size={20} />
            </div>
            <span className="font-bold text-xl hidden lg:block tracking-tight">NexDefend</span>
          </div>

          <div className="flex-1 py-6 space-y-1 px-3">
            <div className="px-3 mb-2 text-xs font-semibold text-slate-500 uppercase tracking-wider hidden lg:block">Dashboards</div>
            <NavItem to="/" icon={<LayoutDashboard size={20} />} label="Overview" />
            <NavItem to="/ai-dashboard" icon={<Cpu size={20} />} label="AI Insight" />
            <NavItem to="/security" icon={<Shield size={20} />} label="Security" />
            <NavItem to="/health" icon={<Activity size={20} />} label="Platform Health" />

            <div className="h-px bg-slate-800 my-4 mx-2" />
            <div className="px-3 mb-2 text-xs font-semibold text-slate-500 uppercase tracking-wider hidden lg:block">Operations</div>
            <NavItem to="/alerts" icon={<AlertTriangle size={20} />} label="Alerts" />
            <NavItem to="/triage" icon={<CheckCircle size={20} />} label="Triage" />
            <NavItem to="/detections" icon={<Zap size={20} />} label="Detections" />
            <NavItem to="/incidents" icon={<FileText size={20} />} label="Incidents" />
            <NavItem to="/investigate" icon={<Search size={20} />} label="Investigate" />

            <div className="h-px bg-slate-800 my-4 mx-2" />
            <div className="px-3 mb-2 text-xs font-semibold text-slate-500 uppercase tracking-wider hidden lg:block">Assets & Network</div>
            <NavItem to="/processes" icon={<Activity size={20} />} label="Process Manager" />
            <NavItem to="/network" icon={<Network size={20} />} label="Network Monitor" />
            <NavItem to="/topology" icon={<Network size={20} />} label="Topology Map" />
            <NavItem to="/hosts" icon={<Server size={20} />} label="Hosts" />
            <NavItem to="/vulnerabilities" icon={<Bug size={20} />} label="Vulnerabilities" />

            <div className="h-px bg-slate-800 my-4 mx-2" />
            <div className="px-3 mb-2 text-xs font-semibold text-slate-500 uppercase tracking-wider hidden lg:block">Automation</div>
            <NavItem to="/soar" icon={<Workflow size={20} />} label="Playbooks" />
            <NavItem to="/reports" icon={<BookOpen size={20} />} label="Reports" />

            <div className="h-px bg-slate-800 my-4 mx-2" />
            <NavItem to="/settings" icon={<SettingsIcon size={20} />} label="Configuration" />
            <NavItem to="/support" icon={<LifeBuoy size={20} />} label="Support" />
          </div>

          <div className="p-4 border-t border-slate-800 text-center sticky bottom-0 bg-slate-900 z-10">
            <div className="text-xs text-slate-500 hidden lg:block">
              v1.0.0 (Embedded)
            </div>
          </div>
        </nav>

        {/* Main Content Area */}
        <main className="flex-1 overflow-auto bg-slate-950 relative">
          <Routes>
            {/* Dashboards */}
            <Route path="/" element={<CommandDashboard />} />
            <Route path="/ai-dashboard" element={<AIDashboardPage />} />
            <Route path="/security" element={<SecurityOverview />} />
            <Route path="/health" element={<PlatformHealth />} />

            {/* Operations */}
            <Route path="/alerts" element={<Alerts />} />
            <Route path="/triage" element={<AlertTriage />} />
            <Route path="/detections" element={<DetectionsQueue />} />
            <Route path="/incidents" element={<Incidents />} />
            <Route path="/investigate" element={<InvestigationView />} />

            {/* Assets & Network */}
            <Route path="/processes" element={<ProcessExplorer />} />
            <Route path="/network" element={<NetworkMonitor />} />
            <Route path="/topology" element={<NetworkTopology />} />
            <Route path="/hosts" element={<HostManagement />} />
            <Route path="/hosts/:id" element={<HostDetails />} />
            <Route path="/vulnerabilities" element={<Vulnerabilities />} />

            {/* Automation & Config */}
            <Route path="/soar" element={<SOARPlaybookEditor />} />
            <Route path="/reports" element={<Reports />} />
            <Route path="/settings" element={<Settings />} />
            <Route path="/support" element={<Support />} />

            {/* Fallback */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>

          {/* Floating AI Chat */}
          <SentinelChat />
        </main>
      </div>
    </Router>
  );
}

// Helper Component for Navigation Links
const NavItem = ({ to, icon, label }: { to: string; icon: React.ReactNode; label: string }) => (
  <NavLink
    to={to}
    className={({ isActive }) => `
      flex items-center gap-3 px-3 py-2 rounded-lg transition-colors
      ${isActive ? 'bg-blue-600 text-white shadow-lg shadow-blue-900/20' : 'text-slate-400 hover:bg-slate-800 hover:text-white'}
    `}
  >
    <span className="shrink-0">{icon}</span>
    <span className="hidden lg:block font-medium text-sm">{label}</span>
  </NavLink>
);

export default App;
