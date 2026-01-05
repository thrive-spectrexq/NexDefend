import { Bell, HelpCircle, ChevronDown, Terminal } from 'lucide-react';

export function TopBar() {
  return (
    <div className="h-16 bg-surface-dark border-b border-white/5 flex items-center px-6 gap-6 sticky top-0 z-40 shadow-sm">

      {/* Global Search */}
      <div className="flex-1 max-w-3xl relative">
        <div className="relative group">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Terminal className="h-4 w-4 text-brand-blue" />
            </div>
            <input
                type="text"
                className="block w-full pl-10 pr-12 py-2.5 bg-surface-darker border border-white/10 rounded-md leading-5 text-sm text-text placeholder-text-dim focus:outline-none focus:border-brand-blue/50 focus:ring-1 focus:ring-brand-blue/50 transition-all font-mono shadow-inner"
                placeholder="Search logs, metrics, or type a query (e.g. host=* AND status=error)..."
            />
            <div className="absolute inset-y-0 right-0 pr-3 flex items-center">
                <span className="text-xs text-text-dim border border-white/10 px-1.5 py-0.5 rounded">/</span>
            </div>
        </div>
      </div>

      {/* Right Actions */}
      <div className="flex items-center gap-4 ml-auto">
        <button className="p-2 text-text-muted hover:text-text hover:bg-white/5 rounded-full transition-colors relative">
            <Bell size={20} />
            <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-brand-red rounded-full animate-pulse"></span>
        </button>
        <button className="p-2 text-text-muted hover:text-text hover:bg-white/5 rounded-full transition-colors">
            <HelpCircle size={20} />
        </button>

        <div className="h-8 w-[1px] bg-white/10 mx-1"></div>

        <div className="flex items-center gap-3 cursor-pointer hover:bg-white/5 p-1.5 rounded-lg transition-colors group">
            <div className="w-8 h-8 rounded bg-brand-purple/20 border border-brand-purple/30 flex items-center justify-center text-xs font-bold text-brand-purple">
                OP
            </div>
            <div className="hidden md:block text-sm">
                <div className="font-medium text-text group-hover:text-white transition-colors">Admin</div>
            </div>
            <ChevronDown size={14} className="text-text-muted" />
        </div>
      </div>
    </div>
  );
}
