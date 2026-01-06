import { useState, useEffect } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import {
  Shield, Activity, Search, LayoutGrid,
  AlertTriangle, Server, Map, Settings,
  ChevronDown, FileText,
  Bug, Zap, Layers, Globe
} from 'lucide-react';

const EnterpriseSidebar = () => {
  const location = useLocation();
  // State to manage collapsible sections
  const [openSections, setOpenSections] = useState<Record<string, boolean>>({
    sec: true, // Security open by default
    obs: false,
    admin: false
  });

  // Auto-expand section if active route is inside it
  useEffect(() => {
    const path = location.pathname;
    if (['/', '/mission-control', '/threat-hunting', '/vulnerabilities', '/playbooks'].includes(path)) {
      setOpenSections(prev => ({ ...prev, sec: true }));
    } else if (['/service-map', '/network', '/infrastructure'].includes(path)) {
      setOpenSections(prev => ({ ...prev, obs: true }));
    } else if (['/reports', '/integrations', '/settings'].includes(path)) {
      setOpenSections(prev => ({ ...prev, admin: true }));
    }
  }, [location.pathname]);

  const toggle = (section: string) => {
    setOpenSections(prev => ({ ...prev, [section]: !prev[section] }));
  };

  return (
    <nav className="w-64 bg-slate-950 border-r border-slate-800 flex flex-col h-screen text-slate-300 shadow-2xl z-20 shrink-0">

      {/* Brand Header */}
      <div className="h-16 flex items-center gap-3 px-6 border-b border-slate-800 bg-slate-900/50 backdrop-blur-sm">
        <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center text-white shadow-lg shadow-indigo-500/30">
          <Shield size={20} fill="currentColor" />
        </div>
        <div>
          <h1 className="font-bold text-white tracking-tight text-lg">NexDefend</h1>
          <div className="text-[10px] uppercase tracking-widest text-indigo-400 font-bold">Enterprise</div>
        </div>
      </div>

      {/* Scrollable Navigation Area */}
      <div className="flex-1 overflow-y-auto py-6 px-3 space-y-6 scrollbar-thin scrollbar-thumb-slate-800">

        {/* --- SECURITY OPERATIONS CENTER (SOC) --- */}
        <div>
          <SectionHeader
            label="Security Operations"
            icon={<Shield size={14} />}
            isOpen={openSections.sec}
            onClick={() => toggle('sec')}
          />

          <div className={`space-y-1 mt-1 overflow-hidden transition-all duration-300 ${openSections.sec ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0'}`}>
            <NavItem to="/" icon={<LayoutGrid size={18} />} label="Security Posture" />
            <NavItem to="/mission-control" icon={<AlertTriangle size={18} />} label="Mission Control" count={5} activeColor="text-red-400" />
            <NavItem to="/threat-hunting" icon={<Search size={18} />} label="Threat Hunting" />
            <NavItem to="/vulnerabilities" icon={<Bug size={18} />} label="Vulnerabilities" />
            <NavItem to="/playbooks" icon={<Zap size={18} />} label="SOAR Playbooks" />
          </div>
        </div>

        {/* --- OBSERVABILITY & INFRASTRUCTURE --- */}
        <div>
          <SectionHeader
            label="Observability"
            icon={<Activity size={14} />}
            isOpen={openSections.obs}
            onClick={() => toggle('obs')}
          />

          <div className={`space-y-1 mt-1 overflow-hidden transition-all duration-300 ${openSections.obs ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0'}`}>
            <NavItem to="/service-map" icon={<Map size={18} />} label="Service Topology" />
            <NavItem to="/infrastructure" icon={<Server size={18} />} label="Infrastructure" />
            <NavItem to="/network" icon={<Globe size={18} />} label="Network Traffic" />
          </div>
        </div>

        {/* --- MANAGEMENT & CONFIG --- */}
        <div>
          <SectionHeader
            label="Management"
            icon={<Layers size={14} />}
            isOpen={openSections.admin}
            onClick={() => toggle('admin')}
          />

          <div className={`space-y-1 mt-1 overflow-hidden transition-all duration-300 ${openSections.admin ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0'}`}>
            <NavItem to="/reports" icon={<FileText size={18} />} label="Reports" />
            <NavItem to="/integrations" icon={<Zap size={18} />} label="Integrations" />
            <NavItem to="/settings" icon={<Settings size={18} />} label="Configuration" />
          </div>
        </div>

      </div>

      {/* User Footer */}
      <div className="p-4 border-t border-slate-800 bg-slate-900/30">
        <div className="flex items-center gap-3 px-2">
          <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-indigo-500 to-purple-500 flex items-center justify-center text-white font-bold text-xs">
            BA
          </div>
          <div className="flex-1 overflow-hidden">
            <div className="text-sm font-medium text-white truncate">Bright Asiedu</div>
            <div className="text-xs text-slate-500 truncate">Admin • WithBrian</div>
          </div>
        </div>
      </div>
    </nav>
  );
};

// --- Sub-Components ---

const SectionHeader = ({ label, icon, isOpen, onClick }: any) => (
  <button
    onClick={onClick}
    className="w-full px-3 py-2 flex items-center justify-between group hover:text-white transition-colors mb-1"
  >
    <div className="flex items-center gap-2 text-[11px] font-bold uppercase tracking-wider text-slate-500 group-hover:text-indigo-400">
      {icon} {label}
    </div>
    <div className={`text-slate-600 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`}>
      <ChevronDown size={14} />
    </div>
  </button>
);

const NavItem = ({ to, icon, label, count, activeColor = 'text-indigo-400' }: any) => (
  <NavLink
    to={to}
    className={({ isActive }) => `
      flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all relative group
      ${isActive
        ? `bg-indigo-500/10 ${activeColor} shadow-[inset_3px_0_0_0_#6366f1]`
        : 'hover:bg-slate-900 hover:text-white text-slate-400'
      }
    `}
  >
    <span className="relative z-10 shrink-0 group-hover:scale-110 transition-transform">{icon}</span>
    <span className="flex-1 relative z-10 truncate">{label}</span>

    {count && (
      <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded-full ${to.includes('mission') ? 'bg-red-500/20 text-red-400 border border-red-500/50' : 'bg-indigo-500/20 text-indigo-300'}`}>
        {count}
      </span>
    )}
  </NavLink>
);

export default EnterpriseSidebar;
