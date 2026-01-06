import React from 'react';
import { HashRouter as Router, Routes, Route, NavLink } from 'react-router-dom';
import { LayoutDashboard, Activity, Network, Settings as SettingsIcon, Shield } from 'lucide-react';

// Import Pages
// NOTE: Dashboard page likely needs to be created or mapped from an existing one.
// Using CommandDashboard as the main "Dashboard" for now based on previous file structure.
import CommandDashboard from './pages/console/CommandDashboard';
import ProcessExplorer from './pages/ProcessExplorer';
import NetworkMonitor from './components/NetworkMonitor';
import Settings from './pages/Settings';
import SentinelChat from './components/SentinelChat';

function App() {
  return (
    <Router>
      <div className="flex min-h-screen bg-slate-950 text-slate-100 font-sans">

        {/* Sidebar Navigation */}
        <nav className="w-20 lg:w-64 bg-slate-900 border-r border-slate-800 flex flex-col shrink-0 transition-all duration-300">
          <div className="p-6 flex items-center gap-3 border-b border-slate-800">
            <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center shrink-0">
              <Shield className="text-white" size={20} />
            </div>
            <span className="font-bold text-xl hidden lg:block tracking-tight">NexDefend</span>
          </div>

          <div className="flex-1 py-6 space-y-2 px-3">
            <NavItem to="/" icon={<LayoutDashboard size={20} />} label="Overview" />
            <NavItem to="/processes" icon={<Activity size={20} />} label="Process Manager" />
            <NavItem to="/network" icon={<Network size={20} />} label="Network Monitor" />
            <div className="h-px bg-slate-800 my-4 mx-2" />
            <NavItem to="/settings" icon={<SettingsIcon size={20} />} label="Configuration" />
          </div>

          <div className="p-4 border-t border-slate-800 text-center">
            <div className="text-xs text-slate-500 hidden lg:block">
              v1.0.0 (Embedded)
            </div>
          </div>
        </nav>

        {/* Main Content Area */}
        <main className="flex-1 overflow-auto bg-slate-950 relative">
          <Routes>
            <Route path="/" element={<CommandDashboard />} />
            <Route path="/processes" element={<ProcessExplorer />} />
            <Route path="/network" element={<NetworkMonitor />} />
            <Route path="/settings" element={<Settings />} />
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
      flex items-center gap-3 px-3 py-3 rounded-lg transition-colors
      ${isActive ? 'bg-blue-600 text-white shadow-lg shadow-blue-900/20' : 'text-slate-400 hover:bg-slate-800 hover:text-white'}
    `}
  >
    <span className="shrink-0">{icon}</span>
    <span className="hidden lg:block font-medium text-sm">{label}</span>
  </NavLink>
);

export default App;
