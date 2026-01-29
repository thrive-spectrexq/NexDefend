import { useState } from 'react';
import { Link, useLocation, Outlet } from 'react-router-dom';
import {
  ShieldAlert, LayoutDashboard, Terminal, Activity,
  Settings, Menu, Bell, Cpu, Cloud,
  Network, FileText, Globe, Search, BarChart3,
  LogOut, Flame, CheckCircle, Database, Server
} from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import clsx from 'clsx';
import { SentinelChat } from '../dashboard/SentinelChat'; // Import Chat

// Sidebar Navigation Groups
const NAV_ITEMS = [
  {
    group: 'Operations',
    items: [
      { label: 'Dashboard', path: '/dashboard', icon: LayoutDashboard },
      { label: 'Console', path: '/console', icon: Terminal },
    ]
  },
  {
    group: 'Threat Intel',
    items: [
      { label: 'Alerts', path: '/alerts', icon: Bell },
      { label: 'Incidents', path: '/incidents', icon: ShieldAlert },
      { label: 'Vulnerabilities', path: '/vulnerabilities', icon: Activity },
    ]
  },
  {
    group: 'Infrastructure',
    items: [
      { label: 'Network', path: '/network', icon: Network },
      { label: 'Topology', path: '/topology', icon: Globe },
      { label: 'Cloud', path: '/cloud', icon: Cloud },
      { label: 'Agents', path: '/agents', icon: Cpu },
    ]
  },
  {
    group: 'Analysis',
    items: [
      { label: 'Data Explorer', path: '/data-explorer', icon: Search },
      { label: 'Playbooks', path: '/playbooks', icon: FileText },
    ]
  },
  {
    group: 'Monitoring',
    items: [
      { label: 'Grafana', path: '/grafana', icon: BarChart3 },
      { label: 'Prometheus', path: '/prometheus', icon: Flame },
    ]
  },
];

interface SidebarItemProps {
  icon: LucideIcon;
  label: string;
  path: string;
  active: boolean;
}

const SidebarItem = ({ icon: Icon, label, path, active }: SidebarItemProps) => (
  <Link
    to={path}
    className={clsx(
      "flex items-center gap-3 px-4 py-2.5 rounded-xl transition-all duration-200 group relative overflow-hidden",
      active
        ? "bg-cyan-500/10 text-cyan-400 border border-cyan-500/20 shadow-[0_0_15px_rgba(6,182,212,0.15)]"
        : "text-gray-400 hover:text-white hover:bg-white/5"
    )}
  >
    <Icon className={clsx("h-4 w-4 z-10", active && "drop-shadow-[0_0_8px_rgba(6,182,212,0.8)]")} />
    <span className="font-mono text-sm tracking-wide z-10">{label}</span>

    {/* Active Glow Bar */}
    {active && (
      <div className="absolute left-0 top-0 bottom-0 w-1 bg-cyan-400 shadow-[0_0_10px_cyan]" />
    )}
  </Link>
);

export const MainLayout = () => {
  const [isSidebarOpen, setSidebarOpen] = useState(true);
  const [isStatusOpen, setStatusOpen] = useState(false); // State for Status Popover
  const location = useLocation();

  return (
    <div className="flex h-screen overflow-hidden bg-background text-white selection:bg-cyan-500/30">
      {/* 1. Sidebar */}
      <aside
        className={clsx(
          "fixed md:relative z-50 h-full bg-[#050505]/95 backdrop-blur-xl border-r border-white/5 transition-all duration-300 flex flex-col",
          isSidebarOpen ? "w-72" : "w-20"
        )}
      >
        {/* Brand Header */}
        <div className="p-6 flex items-center gap-3 border-b border-white/5">
          <div className="relative group">
            <ShieldAlert className="h-8 w-8 text-cyan-400 transition-transform group-hover:scale-110" />
            <div className="absolute inset-0 bg-cyan-500 blur-xl opacity-20 animate-pulse" />
          </div>
          {isSidebarOpen && (
            <div className="flex flex-col">
              <h1 className="font-mono text-xl font-bold tracking-widest text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-blue-500">
                NEXDEFEND
              </h1>
              <span className="text-[10px] text-gray-500 tracking-widest uppercase">Enterprise Security</span>
            </div>
          )}
        </div>

        {/* Navigation Links (Scrollable) */}
        <nav className="flex-1 overflow-y-auto px-4 py-6 space-y-6 custom-scrollbar">
          {NAV_ITEMS.map((group, idx) => (
            <div key={idx}>
              {isSidebarOpen && (
                <h3 className="text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-3 pl-2">
                  {group.group}
                </h3>
              )}
              <div className="space-y-1">
                {group.items.map((item) => (
                  <SidebarItem
                    key={item.path}
                    {...item}
                    active={location.pathname === item.path}
                  />
                ))}
              </div>
            </div>
          ))}
        </nav>

        {/* User Footer */}
        <div className="p-4 border-t border-white/5 bg-black/20">
           <div className={clsx("flex items-center gap-3", !isSidebarOpen && "justify-center")}>
              <div className="h-9 w-9 rounded-lg bg-gradient-to-tr from-cyan-600 to-blue-600 flex items-center justify-center font-bold text-sm shadow-lg shadow-cyan-900/20">
                BA
              </div>
              {isSidebarOpen && (
                <div className="flex-1 min-w-0">
                   <p className="text-sm font-bold text-white truncate">Nexdefend Admin</p>
                   <div className="flex items-center gap-2">
                     <div className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
                     <p className="text-xs text-gray-500">Lead Admin</p>
                   </div>
                </div>
              )}
              {isSidebarOpen && (
                 <Link to="/settings" className="p-1.5 hover:bg-white/10 rounded-lg transition-colors">
                    <Settings className="h-4 w-4 text-gray-400" />
                 </Link>
              )}
           </div>
        </div>
      </aside>

      {/* 2. Main Content Area */}
      <main className="flex-1 flex flex-col min-w-0 overflow-hidden relative">
        {/* Top Header */}
        <header className="h-16 flex items-center justify-between px-6 border-b border-white/5 bg-[#09090b]/80 backdrop-blur-md z-40">
          <div className="flex items-center gap-4 flex-1">
            <button
              onClick={() => setSidebarOpen(!isSidebarOpen)}
              className="p-2 -ml-2 text-gray-400 hover:text-white hover:bg-white/5 rounded-lg transition-colors cursor-pointer"
            >
              <Menu className="h-5 w-5" />
            </button>
            {/* Breadcrumb Navigation */}
            <div className="hidden md:flex items-center text-sm font-mono text-gray-400 shrink-0">
                <span className="text-gray-600 mr-2">/</span>
                <span className="text-cyan-400 uppercase tracking-wider">
                  {location.pathname === '/' ? 'DASHBOARD' : location.pathname.substring(1).replace('-', ' ')}
                </span>
            </div>

            {/* Global Search Bar (Added) */}
            <div className="relative max-w-md w-full ml-8 hidden lg:block">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                <input
                    type="text"
                    placeholder="Search IPs, Assets, or Logs..."
                    className="w-full bg-white/5 border border-white/10 rounded-lg pl-10 pr-4 py-1.5 text-sm text-gray-300 focus:outline-none focus:border-cyan-500/50 focus:bg-white/10 transition-colors"
                />
            </div>
          </div>

          <div className="flex items-center gap-6">

            {/* System Status with Popover */}
            <div className="relative">
                <button
                    onClick={() => setStatusOpen(!isStatusOpen)}
                    className="hidden md:flex items-center gap-2 px-3 py-1.5 rounded-full bg-green-500/10 border border-green-500/20 hover:bg-green-500/20 transition-colors cursor-pointer"
                >
                  <div className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
                  <span className="text-xs font-mono font-medium text-green-400 tracking-wide">SYSTEM OPTIMAL</span>
                </button>

                {isStatusOpen && (
                    <>
                        <div className="fixed inset-0 z-40" onClick={() => setStatusOpen(false)} />
                        <div className="absolute top-full right-0 mt-2 w-64 bg-[#09090b] border border-white/10 rounded-xl shadow-2xl z-50 p-4 space-y-3">
                            <h4 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Service Status</h4>
                            <div className="flex items-center justify-between">
                                <span className="flex items-center gap-2 text-sm text-gray-300"><Server size={14} className="text-blue-400"/> Core API</span>
                                <CheckCircle size={14} className="text-green-500" />
                            </div>
                            <div className="flex items-center justify-between">
                                <span className="flex items-center gap-2 text-sm text-gray-300"><Database size={14} className="text-purple-400"/> Postgres DB</span>
                                <CheckCircle size={14} className="text-green-500" />
                            </div>
                            <div className="flex items-center justify-between">
                                <span className="flex items-center gap-2 text-sm text-gray-300"><Activity size={14} className="text-yellow-400"/> Event Ingestor</span>
                                <CheckCircle size={14} className="text-green-500" />
                            </div>
                        </div>
                    </>
                )}
            </div>

            <div className="h-6 w-px bg-white/10" />

            <div className="flex items-center gap-4">
              <button className="relative text-gray-400 hover:text-cyan-400 transition-colors cursor-pointer">
                <Bell className="h-5 w-5" />
                <span className="absolute -top-1 -right-1 w-2 h-2 bg-red-500 rounded-full border-2 border-background" />
              </button>
              <Link to="/logout" className="text-gray-400 hover:text-red-400 transition-colors flex items-center gap-2 text-sm font-mono">
                <LogOut className="h-4 w-4" />
                <span className="hidden md:inline">LOGOUT</span>
              </Link>
            </div>
          </div>
        </header>

        {/* Dynamic Page Content */}
        <div className="flex-1 overflow-y-auto p-6 scroll-smooth">
          <div className="max-w-7xl mx-auto space-y-6 pb-10 relative z-10">
             <Outlet />
          </div>
        </div>

        {/* Global Sentinel Chat Overlay */}
        <div className="fixed bottom-6 right-6 z-50 w-96">
            <SentinelChat />
        </div>
      </main>
    </div>
  );
};
