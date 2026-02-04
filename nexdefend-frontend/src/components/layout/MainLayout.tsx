import { useState, useEffect } from 'react';
import { Link, useLocation, Outlet } from 'react-router-dom';
import {
  ShieldAlert, LayoutDashboard, Terminal, Activity,
  Settings, Menu, Bell, Cpu, Cloud,
  Network, FileText, Globe, Search, BarChart3,
  LogOut, CheckCircle, Database, Server, Flame,
  Sparkles, Radar, UserCheck, ClipboardCheck, TrendingUp, Users, MessageSquare,
  HelpCircle, User, HardDrive, Zap, X, Lock, FileSearch
} from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import clsx from 'clsx';
import { SentinelChat } from '../dashboard/SentinelChat'; // Import Chat

// Sidebar Navigation Groups
const NAV_ITEMS = [
  {
    group: 'Navigation',
    items: [
      { label: 'Landing Portal', path: '/', icon: Globe },
      { label: 'Security Dashboard', path: '/dashboard', icon: LayoutDashboard },
    ]
  },
  {
    group: 'Observability',
    items: [
      { label: 'Infrastructure Map', path: '/topology', icon: Network },
      { label: 'Cloud Telemetry', path: '/cloud', icon: Cloud },
      { label: 'Perf. Explorer', path: '/grafana', icon: BarChart3 },
      { label: 'Metrics', path: '/prometheus', icon: Flame },
    ]
  },
  {
    group: 'Defense',
    items: [
      { label: 'Notable Events', path: '/alerts', icon: Bell },
      { label: 'Incident Workbench', path: '/incidents', icon: ShieldAlert },
      { label: 'Secure Comms', path: '/secure-chat', icon: Lock },
      { label: 'System Activity', path: '/activity-monitoring', icon: Activity },
      { label: 'Behavioral Analytics', path: '/ueba', icon: UserCheck },
      { label: 'Playbooks', path: '/playbooks', icon: FileText },
      { label: 'Create Playbook', path: '/playbooks/new', icon: Zap },
    ]
  },
  {
    group: 'Intelligence',
    items: [
      { label: 'Threat Feed', path: '/threat-intel', icon: Radar },
      { label: 'Vulnerabilities', path: '/vulnerabilities', icon: Activity },
    ]
  },
  {
    group: 'GRC',
    items: [
      { label: 'Compliance', path: '/compliance', icon: ClipboardCheck },
      { label: 'Risk Scorecard', path: '/risk', icon: TrendingUp },
    ]
  },
  {
    group: 'Infrastructure',
    items: [
      { label: 'System Health', path: '/system-health', icon: HardDrive },
      { label: 'Service Health', path: '/service-health', icon: Sparkles },
      { label: 'Network Control', path: '/network', icon: Network },
      { label: 'Agents/Assets', path: '/agents', icon: Cpu },
      { label: 'Terminal Console', path: '/console', icon: Terminal },
    ]
  },
  {
    group: 'Analysis',
    items: [
      { label: 'Forensics Lab', path: '/forensics', icon: FileSearch },
      { label: 'Data Explorer', path: '/data-explorer', icon: Search },
      { label: 'User Activity', path: '/user-activity', icon: Users },
    ]
  },
  {
    group: 'Account & Settings',
    items: [
      { label: 'My Profile', path: '/profile', icon: User },
      { label: 'Global Settings', path: '/settings', icon: Settings },
    ]
  },
];

interface SidebarItemProps {
  icon: LucideIcon;
  label: string;
  path: string;
  active: boolean;
  collapsed: boolean;
  onClick?: () => void;
}

const SidebarItem = ({ icon: Icon, label, path, active, collapsed, onClick }: SidebarItemProps) => (
  <Link
    to={path}
    onClick={onClick}
    title={collapsed ? label : undefined}
    className={clsx(
      "flex items-center gap-3 px-4 py-2.5 rounded-xl transition-all duration-200 group relative overflow-hidden",
      active
        ? "bg-cyan-500/10 text-cyan-400 border border-cyan-500/20 shadow-[0_0_15px_rgba(6,182,212,0.15)]"
        : "text-gray-400 hover:text-white hover:bg-white/5",
      collapsed && "justify-center px-2"
    )}
  >
    <Icon className={clsx("h-4 w-4 z-10 shrink-0", active && "drop-shadow-[0_0_8px_rgba(6,182,212,0.8)]")} />
    {!collapsed && (
      <span className="font-mono text-sm tracking-wide z-10 whitespace-nowrap overflow-hidden transition-all duration-300">
        {label}
      </span>
    )}

    {/* Active Glow Bar */}
    {active && (
      <div className="absolute left-0 top-0 bottom-0 w-1 bg-cyan-400 shadow-[0_0_10px_cyan]" />
    )}
  </Link>
);

export const MainLayout = () => {
  // Desktop state: true = expanded (w-72), false = collapsed (w-20)
  // Mobile state: controlled by isMobileMenuOpen
  const [isSidebarExpanded, setSidebarExpanded] = useState(true);
  const [isMobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isStatusOpen, setStatusOpen] = useState(false);
  const [isChatOpen, setChatOpen] = useState(false);
  const [isUserMenuOpen, setUserMenuOpen] = useState(false);
  const location = useLocation();

  // Handle Resize for Responsive Behavior
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth < 768) {
        setSidebarExpanded(true); // Always full width when open on mobile
        // setMobileMenuOpen(false); // Close menu on resize to avoid layout shift issues? Optional.
      }
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Close mobile menu on route change
  useEffect(() => {
    setMobileMenuOpen(false);
  }, [location.pathname]);

  const toggleSidebar = () => {
    if (window.innerWidth < 768) {
      setMobileMenuOpen(!isMobileMenuOpen);
    } else {
      setSidebarExpanded(!isSidebarExpanded);
    }
  };

  return (
    <div className="flex h-screen overflow-hidden bg-background text-white selection:bg-cyan-500/30">

      {/* Mobile Backdrop */}
      {isMobileMenuOpen && (
        <div
          className="fixed inset-0 bg-black/80 backdrop-blur-sm z-40 md:hidden animate-in fade-in duration-200"
          onClick={() => setMobileMenuOpen(false)}
        />
      )}

      {/* 1. Sidebar */}
      <aside
        className={clsx(
          "fixed md:static z-50 h-full bg-[#050505]/95 backdrop-blur-xl border-r border-white/5 transition-all duration-300 flex flex-col ease-in-out",
          // Mobile: Slide in from left
          "md:translate-x-0",
          isMobileMenuOpen ? "translate-x-0 w-72" : "-translate-x-full md:translate-x-0",
          // Desktop: Width toggle
          !isMobileMenuOpen && (isSidebarExpanded ? "md:w-72" : "md:w-20")
        )}
      >
        {/* Brand Header */}
        <div className="p-6 flex items-center justify-between md:justify-start gap-3 border-b border-white/5 h-16 shrink-0">
          <div className="flex items-center gap-3">
            <div className="relative group">
              <ShieldAlert className="h-8 w-8 text-cyan-400 transition-transform group-hover:scale-110" />
              <div className="absolute inset-0 bg-cyan-500 blur-xl opacity-20 animate-pulse" />
            </div>
            {(isSidebarExpanded || isMobileMenuOpen) && (
              <div className="flex flex-col animate-in fade-in duration-300">
                <h1 className="font-mono text-xl font-bold tracking-widest text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-blue-500">
                  NEXDEFEND
                </h1>
                <span className="text-[10px] text-gray-500 tracking-widest uppercase">Enterprise Security</span>
              </div>
            )}
          </div>

          {/* Mobile Close Button */}
          <button
            onClick={() => setMobileMenuOpen(false)}
            className="md:hidden text-gray-400 hover:text-white"
          >
            <X size={20} />
          </button>
        </div>

        {/* Navigation Links (Scrollable) */}
        <nav className="flex-1 overflow-y-auto px-4 py-6 space-y-6 custom-scrollbar">
          {NAV_ITEMS.map((group, idx) => (
            <div key={idx}>
              {(isSidebarExpanded || isMobileMenuOpen) && (
                <h3 className="text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-3 pl-2 animate-in fade-in">
                  {group.group}
                </h3>
              )}
              <div className="space-y-1">
                {group.items.map((item) => (
                  <SidebarItem
                    key={item.path}
                    {...item}
                    active={location.pathname === item.path}
                    collapsed={!isSidebarExpanded && !isMobileMenuOpen}
                    onClick={() => setMobileMenuOpen(false)}
                  />
                ))}
              </div>
            </div>
          ))}
        </nav>

        {/* User Footer */}
        <div className="p-4 border-t border-white/5 bg-black/20">
          <div className={clsx("flex items-center gap-3", (!isSidebarExpanded && !isMobileMenuOpen) && "justify-center")}>
            <div className="h-9 w-9 rounded-lg bg-gradient-to-tr from-cyan-600 to-blue-600 flex items-center justify-center font-bold text-sm shadow-lg shadow-cyan-900/20 shrink-0">
              BA
            </div>
            {(isSidebarExpanded || isMobileMenuOpen) && (
              <div className="flex-1 min-w-0 animate-in fade-in">
                <p className="text-sm font-bold text-white truncate">Nexdefend Admin</p>
                <div className="flex items-center gap-2">
                  <div className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
                  <p className="text-xs text-gray-500">Lead Admin</p>
                </div>
              </div>
            )}
            {(isSidebarExpanded || isMobileMenuOpen) && (
              <Link to="/settings" className="p-1.5 hover:bg-white/10 rounded-lg transition-colors">
                <Settings className="h-4 w-4 text-gray-400" />
              </Link>
            )}
          </div>
        </div>
      </aside>

      {/* 2. Main Content Area */}
      <main className="flex-1 flex flex-col min-w-0 overflow-hidden relative transition-all duration-300">
        {/* Top Header */}
        <header className="h-16 flex items-center justify-between px-6 border-b border-white/5 bg-[#09090b]/80 backdrop-blur-md z-30 shrink-0">
          <div className="flex items-center gap-4 flex-1">
            <button
              onClick={toggleSidebar}
              className="p-2 -ml-2 text-gray-400 hover:text-white hover:bg-white/5 rounded-lg transition-colors cursor-pointer"
            >
              <Menu className="h-5 w-5" />
            </button>

            {/* Omni-Search Bar */}
            <div className="relative max-w-lg w-full ml-4 hidden md:block group">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500 group-focus-within:text-cyan-500 transition-colors" />
              <input
                type="text"
                placeholder="Omni-Search: Query OpenSearch, Prometheus, or Assets..."
                className="w-full bg-black/50 border border-white/10 rounded-lg pl-10 pr-24 py-2 text-sm text-gray-300 focus:outline-none focus:border-cyan-500/50 focus:bg-white/5 focus:shadow-[0_0_15px_rgba(6,182,212,0.1)] transition-all placeholder:text-gray-600 font-mono"
              />
              <div className="absolute right-2 top-1/2 -translate-y-1/2 flex gap-1">
                <kbd className="px-1.5 py-0.5 rounded bg-white/10 border border-white/10 text-[10px] text-gray-500 font-mono">⌘K</kbd>
              </div>
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
                      <span className="flex items-center gap-2 text-sm text-gray-300"><Server size={14} className="text-blue-400" /> Core API</span>
                      <CheckCircle size={14} className="text-green-500" />
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="flex items-center gap-2 text-sm text-gray-300"><Database size={14} className="text-purple-400" /> Postgres DB</span>
                      <CheckCircle size={14} className="text-green-500" />
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="flex items-center gap-2 text-sm text-gray-300"><Activity size={14} className="text-yellow-400" /> Event Ingestor</span>
                      <CheckCircle size={14} className="text-green-500" />
                    </div>
                  </div>
                </>
              )}
            </div>

            <div className="h-6 w-px bg-white/10" />

            <div className="flex items-center gap-4">
              <button className="relative text-gray-400 hover:text-cyan-400 transition-colors cursor-pointer">
                <MessageSquare className="h-5 w-5" />
              </button>
              <button className="relative text-gray-400 hover:text-cyan-400 transition-colors cursor-pointer">
                <Bell className="h-5 w-5" />
                <span className="absolute -top-1 -right-1 w-2 h-2 bg-red-500 rounded-full border-2 border-background" />
              </button>

              {/* User Dropdown */}
              <div className="relative">
                <button
                  onClick={() => setUserMenuOpen(!isUserMenuOpen)}
                  className="flex items-center gap-2 text-sm font-mono text-gray-400 hover:text-white transition-colors focus:outline-none"
                >
                  <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-cyan-600 to-blue-600 flex items-center justify-center font-bold text-xs text-white shadow-lg shadow-cyan-900/20">
                    BA
                  </div>
                </button>

                {isUserMenuOpen && (
                  <>
                    <div className="fixed inset-0 z-40" onClick={() => setUserMenuOpen(false)} />
                    <div className="absolute top-full right-0 mt-2 w-56 bg-[#09090b] border border-white/10 rounded-xl shadow-2xl z-50 p-2 animate-in fade-in zoom-in-95 duration-100">
                      <div className="px-3 py-2 border-b border-white/5 mb-2">
                        <p className="text-sm font-bold text-white">Nexdefend Admin</p>
                        <p className="text-xs text-gray-500">admin@nexdefend.io</p>
                      </div>

                      <Link to="/profile" className="flex items-center gap-2 px-3 py-2 text-sm text-gray-300 hover:text-white hover:bg-white/5 rounded-lg transition-colors" onClick={() => setUserMenuOpen(false)}>
                        <User size={14} /> Profile
                      </Link>
                      <Link to="/user-activity" className="flex items-center gap-2 px-3 py-2 text-sm text-gray-300 hover:text-white hover:bg-white/5 rounded-lg transition-colors" onClick={() => setUserMenuOpen(false)}>
                        <Activity size={14} /> Activity
                      </Link>
                      <Link to="/settings" className="flex items-center gap-2 px-3 py-2 text-sm text-gray-300 hover:text-white hover:bg-white/5 rounded-lg transition-colors" onClick={() => setUserMenuOpen(false)}>
                        <Settings size={14} /> Settings
                      </Link>
                      <button className="w-full flex items-center gap-2 px-3 py-2 text-sm text-gray-300 hover:text-white hover:bg-white/5 rounded-lg transition-colors text-left">
                        <HelpCircle size={14} /> Help & Support
                      </button>

                      <div className="h-px bg-white/10 my-2" />

                      <Link to="/logout" className="flex items-center gap-2 px-3 py-2 text-sm text-red-400 hover:bg-red-500/10 rounded-lg transition-colors" onClick={() => setUserMenuOpen(false)}>
                        <LogOut size={14} /> Logout
                      </Link>
                    </div>
                  </>
                )}
              </div>
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
        <div className="fixed bottom-6 right-6 z-50">
          {isChatOpen ? (
            <div className="w-96">
              <SentinelChat onClose={() => setChatOpen(false)} />
            </div>
          ) : (
            <button
              onClick={() => setChatOpen(true)}
              className="p-4 bg-cyan-500/10 hover:bg-cyan-500/20 text-cyan-400 border border-cyan-500/50 rounded-full shadow-[0_0_20px_rgba(6,182,212,0.3)] transition-all hover:scale-110 group backdrop-blur-sm"
            >
              <Sparkles className="h-6 w-6 animate-pulse group-hover:animate-none" />
            </button>
          )}
        </div>
      </main>
    </div>
  );
};
