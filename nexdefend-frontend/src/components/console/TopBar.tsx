import { Search, Bell, HelpCircle, Monitor, ShieldAlert, Info, AlertTriangle } from 'lucide-react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useState, useRef, useEffect } from 'react';
import { cn } from '../../lib/utils';

// Mock Notification Data
const mockNotifications = [
    { id: 1, title: 'High CPU Usage', desc: 'Server FIN-WS-004 is at 92% CPU', time: '2m ago', type: 'warning', read: false },
    { id: 2, title: 'New Agent Registered', desc: 'Host MKT-MAC-05 connected', time: '15m ago', type: 'info', read: false },
    { id: 3, title: 'Malware Detected', desc: 'Ransomware blocked on DEV-SRV-01', time: '1h ago', type: 'critical', read: false },
    { id: 4, title: 'System Update', desc: 'Backend API updated to v2.5.0', time: '3h ago', type: 'info', read: true },
];

// Mock Search Data (in a real app, this would be an API call)
const mockSearchIndex = [
    { type: 'host', label: 'FIN-WS-004', desc: '10.20.1.45 • Windows 11', path: '/dashboard/hosts/H-001' },
    { type: 'host', label: 'DEV-SRV-01', desc: '10.30.5.12 • Ubuntu 22.04', path: '/dashboard/hosts/H-002' },
    { type: 'host', label: 'MKT-MAC-05', desc: '10.20.2.18 • macOS', path: '/dashboard/hosts/H-003' },
    { type: 'detection', label: 'DET-1024', desc: 'Critical • Ransomware', path: '/dashboard/investigate' },
    { type: 'detection', label: 'DET-1023', desc: 'High • Credential Access', path: '/dashboard/investigate' },
    { type: 'detection', label: 'DET-1020', desc: 'Critical • Exfiltration', path: '/dashboard/investigate' },
];

export function TopBar() {
    const location = useLocation();
    const navigate = useNavigate();
    const [query, setQuery] = useState('');
    const [results, setResults] = useState<typeof mockSearchIndex>([]);
    const [isOpen, setIsOpen] = useState(false);
    const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
    const [notifications, setNotifications] = useState(mockNotifications);
    const wrapperRef = useRef<HTMLDivElement>(null);
    const notificationRef = useRef<HTMLDivElement>(null);

    // Simple breadcrumb generation
    const breadcrumbs = location.pathname.split('/').filter(Boolean).map((segment) => {
        // Handle dynamic ID segments (simplified check)
        if (segment.startsWith('H-')) return segment;
        if (segment.length > 20) return 'Details'; // UUID or long ID fallback
        return segment.charAt(0).toUpperCase() + segment.slice(1);
    });

    useEffect(() => {
        if (query.trim() === '') {
            setResults([]);
            return;
        }
        const filtered = mockSearchIndex.filter(item =>
            item.label.toLowerCase().includes(query.toLowerCase()) ||
            item.desc.toLowerCase().includes(query.toLowerCase())
        );
        setResults(filtered);
    }, [query]);

    // Close on click outside
    useEffect(() => {
        function handleClickOutside(event: MouseEvent) {
            if (wrapperRef.current && !wrapperRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
            if (notificationRef.current && !notificationRef.current.contains(event.target as Node)) {
                setIsNotificationsOpen(false);
            }
        }
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, [wrapperRef, notificationRef]);

    const handleSelect = (path: string) => {
        navigate(path);
        setIsOpen(false);
        setQuery('');
    };

    return (
        <header className="h-16 bg-background/50 backdrop-blur border-b border-surface-highlight flex items-center justify-between px-6 sticky top-0 z-40">
            {/* Breadcrumbs / Context */}
            <div className="flex items-center gap-2 text-sm font-mono text-text-muted hidden md:flex">
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
            <div className="flex-1 max-w-2xl px-4 md:px-8" ref={wrapperRef}>
                <div className="relative group">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <Search className="h-4 w-4 text-text-muted group-focus-within:text-brand-blue" />
                    </div>
                    <input
                        type="text"
                        className="block w-full pl-10 pr-3 py-1.5 border border-surface-highlight rounded bg-surface text-sm placeholder-text-muted text-text focus:outline-none focus:border-brand-blue focus:ring-1 focus:ring-brand-blue transition-all font-mono"
                        placeholder="Search IP, Hostname, Hash, User..."
                        value={query}
                        onChange={(e) => { setQuery(e.target.value); setIsOpen(true); }}
                        onFocus={() => setIsOpen(true)}
                    />
                    <div className="absolute inset-y-0 right-0 pr-2 flex items-center pointer-events-none hidden sm:flex">
                        <kbd className="inline-flex items-center border border-surface-highlight rounded px-2 text-xs font-sans font-medium text-text-muted">⌘K</kbd>
                    </div>

                    {/* Search Dropdown */}
                    {isOpen && query.length > 0 && (
                        <div className="absolute top-full left-0 right-0 mt-2 bg-surface border border-surface-highlight rounded-lg shadow-xl overflow-hidden z-50 animate-in fade-in slide-in-from-top-2 duration-200">
                            {results.length > 0 ? (
                                <div className="py-2">
                                    <div className="px-3 py-1 text-xs text-text-muted uppercase tracking-wider font-semibold">Results</div>
                                    {results.map((result, idx) => (
                                        <button
                                            key={idx}
                                            onClick={() => handleSelect(result.path)}
                                            className="w-full text-left px-4 py-2 hover:bg-surface-highlight flex items-center gap-3 transition-colors"
                                        >
                                            <div className="p-1.5 rounded bg-background/50 text-brand-blue border border-surface-highlight">
                                                {result.type === 'host' ? <Monitor size={16} /> : <ShieldAlert size={16} className="text-brand-red" />}
                                            </div>
                                            <div>
                                                <div className="text-sm font-medium text-text">{result.label}</div>
                                                <div className="text-xs text-text-muted font-mono">{result.desc}</div>
                                            </div>
                                        </button>
                                    ))}
                                </div>
                            ) : (
                                <div className="p-4 text-center text-sm text-text-muted">
                                    No results found for "{query}"
                                </div>
                            )}
                        </div>
                    )}
                </div>
            </div>

            {/* Actions */}
            <div className="flex items-center gap-4">
                {/* Notification Center */}
                <div className="relative" ref={notificationRef}>
                    <button
                        onClick={() => setIsNotificationsOpen(!isNotificationsOpen)}
                        className={cn(
                            "text-text-muted hover:text-text relative transition-colors p-1 rounded-md hover:bg-surface-highlight",
                            isNotificationsOpen && "text-text bg-surface-highlight"
                        )}
                    >
                        <Bell size={20} />
                        {notifications.some(n => !n.read) && (
                            <span className="absolute top-0 right-0 block h-2.5 w-2.5 rounded-full bg-brand-red ring-2 ring-background transform translate-x-1/4 -translate-y-1/4"></span>
                        )}
                    </button>

                    {isNotificationsOpen && (
                        <div className="absolute right-0 mt-2 w-80 sm:w-96 bg-surface border border-surface-highlight rounded-lg shadow-xl overflow-hidden z-50 animate-in fade-in slide-in-from-top-2 duration-200">
                            <div className="flex items-center justify-between px-4 py-3 border-b border-surface-highlight bg-background/50 backdrop-blur">
                                <h3 className="font-semibold text-text text-sm">Notifications</h3>
                                <button
                                    onClick={() => setNotifications(prev => prev.map(n => ({ ...n, read: true })))}
                                    className="text-xs text-brand-blue hover:text-brand-blue/80 transition-colors"
                                >
                                    Mark all read
                                </button>
                            </div>
                            <div className="max-h-[400px] overflow-y-auto">
                                {notifications.length > 0 ? (
                                    notifications.map((notification) => (
                                        <div key={notification.id} className={cn(
                                            "px-4 py-3 border-b border-surface-highlight last:border-0 hover:bg-surface-highlight/10 transition-colors flex gap-3",
                                            !notification.read && "bg-surface-highlight/5"
                                        )}>
                                            <div className={cn("mt-1 p-1.5 rounded-full flex-shrink-0 h-fit",
                                                notification.type === 'critical' ? 'bg-brand-red/10 text-brand-red' :
                                                notification.type === 'warning' ? 'bg-brand-orange/10 text-brand-orange' :
                                                'bg-brand-blue/10 text-brand-blue'
                                            )}>
                                                {notification.type === 'critical' ? <ShieldAlert size={14} /> :
                                                 notification.type === 'warning' ? <AlertTriangle size={14} /> :
                                                 <Info size={14} />}
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <div className="flex justify-between items-start mb-0.5">
                                                    <p className={cn("text-sm font-medium truncate pr-2", !notification.read ? "text-text" : "text-text-muted")}>
                                                        {notification.title}
                                                    </p>
                                                    <span className="text-[10px] text-text-muted whitespace-nowrap">{notification.time}</span>
                                                </div>
                                                <p className="text-xs text-text-muted leading-relaxed line-clamp-2">{notification.desc}</p>
                                            </div>
                                            {!notification.read && (
                                                <div className="mt-2 w-1.5 h-1.5 rounded-full bg-brand-blue flex-shrink-0"></div>
                                            )}
                                        </div>
                                    ))
                                ) : (
                                    <div className="p-8 text-center text-text-muted text-sm">
                                        No notifications
                                    </div>
                                )}
                            </div>
                            <div className="p-2 border-t border-surface-highlight bg-background/30 text-center">
                                <button className="text-xs text-text-muted hover:text-text transition-colors w-full py-1">
                                    View All Activity
                                </button>
                            </div>
                        </div>
                    )}
                </div>

                <button className="text-text-muted hover:text-text transition-colors">
                    <HelpCircle size={20} />
                </button>
            </div>
        </header>
    );
}
