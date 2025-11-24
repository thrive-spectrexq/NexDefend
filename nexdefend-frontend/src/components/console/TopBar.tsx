import { Search, Bell, HelpCircle } from 'lucide-react';
import { useLocation } from 'react-router-dom';

export function TopBar() {
    const location = useLocation();

    // Simple breadcrumb generation
    const breadcrumbs = location.pathname.split('/').filter(Boolean).map(segment =>
        segment.charAt(0).toUpperCase() + segment.slice(1)
    );

    return (
        <header className="h-16 bg-background/50 backdrop-blur border-b border-surface-highlight flex items-center justify-between px-6 sticky top-0 z-40">
            {/* Breadcrumbs / Context */}
            <div className="flex items-center gap-2 text-sm font-mono text-text-muted">
                <span>Console</span>
                {breadcrumbs.map((crumb, i) => (
                    <div key={i} className="flex items-center gap-2">
                        <span>/</span>
                        <span className={i === breadcrumbs.length - 1 ? "text-brand-blue" : ""}>
                            {crumb}
                        </span>
                    </div>
                ))}
            </div>

            {/* Omnibar */}
            <div className="flex-1 max-w-2xl px-8">
                <div className="relative group">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <Search className="h-4 w-4 text-text-muted group-focus-within:text-brand-blue" />
                    </div>
                    <input
                        type="text"
                        className="block w-full pl-10 pr-3 py-1.5 border border-surface-highlight rounded bg-surface text-sm placeholder-text-muted text-text focus:outline-none focus:border-brand-blue focus:ring-1 focus:ring-brand-blue transition-all font-mono"
                        placeholder="Search IP, Hostname, Hash, User..."
                    />
                    <div className="absolute inset-y-0 right-0 pr-2 flex items-center pointer-events-none">
                        <kbd className="inline-flex items-center border border-surface-highlight rounded px-2 text-xs font-sans font-medium text-text-muted">⌘K</kbd>
                    </div>
                </div>
            </div>

            {/* Actions */}
            <div className="flex items-center gap-4">
                <button className="text-text-muted hover:text-text relative">
                    <Bell size={20} />
                    <span className="absolute top-0 right-0 block h-2 w-2 rounded-full bg-brand-red ring-2 ring-background transform translate-x-1/2 -translate-y-1/2"></span>
                </button>
                <button className="text-text-muted hover:text-text">
                    <HelpCircle size={20} />
                </button>
            </div>
        </header>
    );
}
