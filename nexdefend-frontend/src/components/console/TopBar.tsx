import { Search, Bell, HelpCircle, Monitor, ShieldAlert } from 'lucide-react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useState, useRef, useEffect } from 'react';

// Mock Search Data (in a real app, this would be an API call)
const mockSearchIndex = [
    { type: 'host', label: 'FIN-WS-004', desc: '10.20.1.45 • Windows 11', path: '/dashboard/hosts' },
    { type: 'host', label: 'DEV-SRV-01', desc: '10.30.5.12 • Ubuntu 22.04', path: '/dashboard/hosts' },
    { type: 'detection', label: 'DET-1024', desc: 'Critical • Ransomware', path: '/dashboard/investigate' },
    { type: 'detection', label: 'DET-1023', desc: 'High • Credential Access', path: '/dashboard/investigate' },
];

export function TopBar() {
    const location = useLocation();
    const navigate = useNavigate();
    const [query, setQuery] = useState('');
    const [results, setResults] = useState<typeof mockSearchIndex>([]);
    const [isOpen, setIsOpen] = useState(false);
    const wrapperRef = useRef<HTMLDivElement>(null);

    // Simple breadcrumb generation
    const breadcrumbs = location.pathname.split('/').filter(Boolean).map(segment =>
        segment.charAt(0).toUpperCase() + segment.slice(1)
    );

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
        }
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, [wrapperRef]);

    const handleSelect = (path: string) => {
        navigate(path);
        setIsOpen(false);
        setQuery('');
    };

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
            <div className="flex-1 max-w-2xl px-8" ref={wrapperRef}>
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
                    <div className="absolute inset-y-0 right-0 pr-2 flex items-center pointer-events-none">
                        <kbd className="inline-flex items-center border border-surface-highlight rounded px-2 text-xs font-sans font-medium text-text-muted">⌘K</kbd>
                    </div>

                    {/* Search Dropdown */}
                    {isOpen && query.length > 0 && (
                        <div className="absolute top-full left-0 right-0 mt-2 bg-surface border border-surface-highlight rounded-lg shadow-xl overflow-hidden z-50">
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
