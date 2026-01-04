import { Link, useLocation } from 'react-router-dom';
import {
  Activity,
  Search,
  Monitor,
  Settings,
  LifeBuoy,
  Menu,
  ShieldAlert,
  Brain
} from 'lucide-react';
import { cn } from '../../lib/utils';
import { useState } from 'react';

const navItems = [
  { icon: Activity, label: 'Activity', path: '/dashboard' }, // Mapping Command Dashboard to Activity/Home
  { icon: Brain, label: 'AI Insights', path: '/dashboard/ai-dashboard' },
  { icon: ShieldAlert, label: 'Detections', path: '/dashboard/detections' },
  { icon: Search, label: 'Investigate', path: '/dashboard/investigate' },
  { icon: Monitor, label: 'Hosts', path: '/dashboard/hosts' },
  { icon: Settings, label: 'Configuration', path: '/dashboard/config' },
  { icon: LifeBuoy, label: 'Support', path: '/dashboard/support' },
];

export function Sidebar() {
  const [collapsed, setCollapsed] = useState(false);
  const location = useLocation();

  return (
    <div
      className={cn(
        "h-screen bg-surface border-r border-surface-highlight flex flex-col transition-all duration-300",
        collapsed ? "w-16" : "w-64"
      )}
    >
      {/* Header */}
      <div className="h-16 flex items-center px-4 border-b border-surface-highlight">
        <div className="flex items-center gap-3 overflow-hidden">
            <div className="w-8 h-8 rounded bg-brand-blue/20 flex items-center justify-center shrink-0">
                <div className="w-4 h-4 rounded-full bg-brand-blue shadow-[0_0_10px_rgba(56,189,248,0.5)]" />
            </div>
            {!collapsed && (
                <span className="font-bold text-lg tracking-wider text-text whitespace-nowrap">
                    NEXDEFEND
                </span>
            )}
        </div>
        <button
            onClick={() => setCollapsed(!collapsed)}
            className="ml-auto p-1 hover:bg-surface-highlight rounded text-text-muted hover:text-text"
        >
            <Menu size={20} />
        </button>
      </div>

      {/* Nav */}
      <nav className="flex-1 py-4 flex flex-col gap-1 px-2">
        {navItems.map((item) => {
          const isActive = location.pathname === item.path;
          return (
            <Link
              key={item.path}
              to={item.path}
              className={cn(
                "flex items-center gap-3 px-3 py-2 rounded transition-colors group relative",
                isActive
                  ? "bg-brand-blue/10 text-brand-blue"
                  : "text-text-muted hover:bg-surface-highlight hover:text-text"
              )}
            >
              <item.icon size={20} className={cn("shrink-0", isActive && "text-brand-blue drop-shadow-[0_0_5px_rgba(56,189,248,0.5)]")} />
              {!collapsed && <span>{item.label}</span>}
              {collapsed && (
                  <div className="absolute left-full top-1/2 -translate-y-1/2 ml-2 bg-surface border border-surface-highlight px-2 py-1 rounded text-xs text-text opacity-0 group-hover:opacity-100 pointer-events-none whitespace-nowrap z-50">
                      {item.label}
                  </div>
              )}
            </Link>
          );
        })}
      </nav>

      {/* Footer User Profile (Simplified) */}
      <div className="p-4 border-t border-surface-highlight">
          <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-brand-green/20 flex items-center justify-center shrink-0 border border-brand-green/30">
                  <span className="text-xs font-mono text-brand-green">OP</span>
              </div>
              {!collapsed && (
                  <div className="overflow-hidden">
                      <div className="text-sm font-medium text-text truncate">Operator</div>
                      <div className="text-xs text-text-muted truncate">SOC Level 1</div>
                  </div>
              )}
          </div>
      </div>
    </div>
  );
}
