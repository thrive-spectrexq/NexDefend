import { useState, type ReactNode } from 'react';
import { Link, useLocation } from 'react-router-dom';
import {
  ShieldAlert, LayoutDashboard, Terminal, Activity,
  Settings, Menu, Bell, Cpu
} from 'lucide-react';
import clsx from 'clsx';

const SidebarItem = ({ icon: Icon, label, path, active }: any) => (
  <Link
    to={path}
    className={clsx(
      "flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 group",
      active
        ? "bg-gradient-to-r from-cyan-500/20 to-transparent border-l-2 border-cyan-500 text-cyan-400"
        : "text-gray-400 hover:bg-white/5 hover:text-white"
    )}
  >
    <Icon className={clsx("h-5 w-5", active && "drop-shadow-[0_0_5px_rgba(6,182,212,0.8)]")} />
    <span className="font-medium tracking-wide">{label}</span>
    {active && (
      <div className="absolute right-4 w-1.5 h-1.5 rounded-full bg-cyan-400 shadow-[0_0_8px_cyan]" />
    )}
  </Link>
);

export const MainLayout = ({ children }: { children: ReactNode }) => {
  const [isSidebarOpen, setSidebarOpen] = useState(true);
  const location = useLocation();

  return (
    <div className="flex h-screen overflow-hidden bg-background text-white selection:bg-cyan-500/30">
      {/* Sidebar */}
      <aside
        className={clsx(
          "fixed md:relative z-50 h-full glass-panel border-r border-white/5 transition-all duration-300 flex flex-col",
          isSidebarOpen ? "w-64" : "w-20"
        )}
      >
        <div className="p-6 flex items-center gap-3">
          <div className="relative">
            <ShieldAlert className="h-8 w-8 text-cyan-400" />
            <div className="absolute inset-0 bg-cyan-500 blur-lg opacity-40 animate-pulse" />
          </div>
          {isSidebarOpen && (
            <h1 className="font-mono text-xl font-bold tracking-widest text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-blue-500">
              NEXDEFEND
            </h1>
          )}
        </div>

        <nav className="flex-1 px-3 space-y-2 mt-4">
          <SidebarItem icon={LayoutDashboard} label="Dashboard" path="/" active={location.pathname === '/'} />
          <SidebarItem icon={Terminal} label="Console" path="/console" active={location.pathname === '/console'} />
          <SidebarItem icon={Activity} label="Threats" path="/threats" active={location.pathname === '/threats'} />
          <SidebarItem icon={Cpu} label="System" path="/system" active={location.pathname === '/system'} />
          <SidebarItem icon={Settings} label="Settings" path="/settings" active={location.pathname === '/settings'} />
        </nav>

        <div className="p-4 border-t border-white/5">
           <div className="flex items-center gap-3 p-2 rounded-lg bg-black/20">
              <div className="h-8 w-8 rounded bg-gradient-to-tr from-cyan-600 to-blue-600 flex items-center justify-center font-bold">
                BA
              </div>
              {isSidebarOpen && (
                <div className="overflow-hidden">
                   <p className="text-sm font-bold text-white">Bright Asiedu</p>
                   <p className="text-xs text-gray-500">Lead Admin</p>
                </div>
              )}
           </div>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col min-w-0 overflow-hidden relative">
        {/* Top Header */}
        <header className="h-16 flex items-center justify-between px-6 border-b border-white/5 bg-background/50 backdrop-blur-md z-40">
          <button onClick={() => setSidebarOpen(!isSidebarOpen)} className="text-gray-400 hover:text-white cursor-pointer">
            <Menu className="h-6 w-6" />
          </button>

          <div className="flex items-center gap-6">
            <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-green-500/10 border border-green-500/20">
              <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
              <span className="text-xs font-mono text-green-400">SYSTEM STABLE</span>
            </div>
            <Bell className="h-5 w-5 text-gray-400 hover:text-cyan-400 cursor-pointer transition-colors" />
          </div>
        </header>

        {/* Scrollable Page Content */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6 relative">
          {/* Background Grid Effect */}
          <div className="fixed inset-0 pointer-events-none opacity-20"
               style={{ backgroundImage: 'linear-gradient(rgba(255, 255, 255, 0.05) 1px, transparent 1px), linear-gradient(90deg, rgba(255, 255, 255, 0.05) 1px, transparent 1px)', backgroundSize: '40px 40px' }}
          />
          {children}
        </div>
      </main>
    </div>
  );
};
