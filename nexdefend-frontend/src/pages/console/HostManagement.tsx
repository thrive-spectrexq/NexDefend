import { useNavigate } from 'react-router-dom';
import {
    Monitor,
    Server,
    Laptop,
    Search,
    Filter
} from 'lucide-react';
import { cn } from '../../lib/utils';

// Mock Data
const hosts = [
    {
        id: 'H-001',
        hostname: 'FIN-WS-004',
        ip: '10.20.1.45',
        os: 'Windows 11 Pro',
        version: '22H2',
        agentVersion: '4.2.1',
        status: 'Online',
        group: 'Finance',
        lastSeen: 'Just now'
    },
    {
        id: 'H-002',
        hostname: 'DEV-SRV-01',
        ip: '10.30.5.12',
        os: 'Ubuntu 22.04 LTS',
        version: '5.15.0-86',
        agentVersion: '4.2.1',
        status: 'Online',
        group: 'Servers',
        lastSeen: '1 min ago'
    },
    {
        id: 'H-003',
        hostname: 'MKT-MAC-05',
        ip: '10.20.2.18',
        os: 'macOS Sonoma',
        version: '14.1',
        agentVersion: '4.1.9',
        status: 'Offline',
        group: 'Marketing',
        lastSeen: '2 days ago'
    },
    {
        id: 'H-004',
        hostname: 'HR-LAPTOP-02',
        ip: '10.20.1.88',
        os: 'Windows 10 Ent',
        version: '21H2',
        agentVersion: '4.2.0',
        status: 'Reduced',
        group: 'HR',
        lastSeen: '5 mins ago'
    },
];

const statusColors: Record<string, string> = {
    'Online': 'bg-brand-green',
    'Offline': 'bg-text-muted',
    'Reduced': 'bg-brand-orange',
};

import { useState, useEffect } from 'react';

export default function HostManagement() {
    const navigate = useNavigate();
    const [localHost, setLocalHost] = useState<any>(null);

    useEffect(() => {
        if (window.go?.main?.App) {
            window.go.main.App.GetSystemInfo().then((info) => {
                setLocalHost({
                    id: 'LOCAL',
                    hostname: info.hostname || 'Local Machine',
                    ip: '127.0.0.1', // Wails doesn't easily give IP without net interfaces check, simplified for now
                    os: 'Current OS', // GetSystemInfo returns basic info
                    status: info.status,
                    version: 'N/A',
                    agentVersion: 'Embedded',
                    group: 'Local',
                    lastSeen: 'Now'
                });
            });
        }
    }, []);

    const allHosts = localHost ? [localHost, ...hosts] : hosts;

    return (
        <div className="flex h-full gap-6">
            {/* Filter Facets */}
            <div className="w-64 shrink-0 space-y-6">
                <div>
                    <h3 className="text-sm font-semibold text-text uppercase tracking-wider mb-3">Operating System</h3>
                    <div className="space-y-2">
                        {['Windows', 'macOS', 'Linux'].map(os => (
                            <label key={os} className="flex items-center gap-2 text-sm text-text-muted hover:text-text cursor-pointer">
                                <input type="checkbox" className="rounded bg-surface border-surface-highlight text-brand-blue focus:ring-brand-blue" />
                                <span>{os}</span>
                            </label>
                        ))}
                    </div>
                </div>

                <div>
                    <h3 className="text-sm font-semibold text-text uppercase tracking-wider mb-3">Policy Group</h3>
                    <div className="space-y-2">
                        {['Servers', 'Workstations', 'Laptops', 'Critical Infra'].map(group => (
                            <label key={group} className="flex items-center gap-2 text-sm text-text-muted hover:text-text cursor-pointer">
                                <input type="checkbox" className="rounded bg-surface border-surface-highlight text-brand-blue focus:ring-brand-blue" />
                                <span>{group}</span>
                            </label>
                        ))}
                    </div>
                </div>

                <div>
                    <h3 className="text-sm font-semibold text-text uppercase tracking-wider mb-3">Status</h3>
                    <div className="space-y-2">
                        {['Online', 'Offline', 'Reduced Functionality'].map(status => (
                            <label key={status} className="flex items-center gap-2 text-sm text-text-muted hover:text-text cursor-pointer">
                                <input type="checkbox" className="rounded bg-surface border-surface-highlight text-brand-blue focus:ring-brand-blue" />
                                <span>{status}</span>
                            </label>
                        ))}
                    </div>
                </div>
            </div>

            {/* Main Content */}
            <div className="flex-1 flex flex-col gap-4">
                <div className="flex items-center gap-4 bg-surface border border-surface-highlight p-2 rounded-lg">
                    <Search className="text-text-muted ml-2" size={20} />
                    <input
                        type="text"
                        placeholder="Filter hosts..."
                        className="bg-transparent border-none focus:outline-none text-text flex-1"
                    />
                    <button className="px-3 py-1.5 bg-surface-highlight text-text text-sm rounded hover:bg-surface-highlight/80 flex items-center gap-2">
                        <Filter size={16} />
                        Advanced
                    </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                    {allHosts.map(host => (
                        <div
                            key={host.id}
                            onClick={() => navigate(`/dashboard/hosts/${host.id}`)}
                            className="bg-surface border border-surface-highlight rounded-lg p-4 hover:border-brand-blue/50 transition-colors group cursor-pointer relative overflow-hidden"
                        >
                            <div className="flex items-start justify-between mb-4">
                                <div className="p-2 bg-surface-highlight rounded-lg text-brand-blue">
                                    {host.os.includes('Windows') ? <Monitor size={24} /> :
                                     host.os.includes('Ubuntu') ? <Server size={24} /> :
                                     <Laptop size={24} />}
                                </div>
                                <div className="flex items-center gap-2">
                                    <span className={cn("w-2 h-2 rounded-full", statusColors[host.status])}></span>
                                    <span className="text-xs font-medium text-text-muted">{host.status}</span>
                                </div>
                            </div>

                            <h3 className="text-lg font-bold text-text mb-1 font-mono truncate">{host.hostname}</h3>
                            <div className="text-xs text-text-muted font-mono mb-4">{host.ip}</div>

                            <div className="space-y-1 text-sm text-text-muted border-t border-surface-highlight pt-3">
                                <div className="flex justify-between">
                                    <span>OS:</span>
                                    <span className="text-text">{host.os}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span>Agent:</span>
                                    <span className="text-text font-mono">{host.agentVersion}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span>Group:</span>
                                    <span className="text-text">{host.group}</span>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}
