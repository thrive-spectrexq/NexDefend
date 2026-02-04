import React, { useEffect, useState } from 'react';
import { GlassCard } from '../components/ui/GlassCard';
import { NeonButton } from '../components/ui/NeonButton';
import {
    Save, RefreshCw, Settings, Bell,
    Share2, Shield, Slack, Mail,
    Terminal, Globe, Server, Key, X
} from 'lucide-react';
import client from '../api/client';

interface Setting {
    key: string;
    value: string;
    category: string;
    description: string;
    is_secret: boolean;
}

const SettingsPage: React.FC = () => {
    const [settings, setSettings] = useState<Setting[]>([]);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState<string | null>(null);
    const [activeTab, setActiveTab] = useState<'general' | 'notifications' | 'integrations' | 'access'>('general');

    // Integration editing state
    const [editingIntegration, setEditingIntegration] = useState<string | null>(null);
    const [integrationValue, setIntegrationValue] = useState('');

    const fetchSettings = async () => {
        setLoading(true);
        try {
            const response = await client.get<Setting[]>('/settings');
            setSettings(response.data || []);
            setError(null);
        } catch {
            setError('Failed to load settings.');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchSettings();
    }, []);

    const handleChange = (key: string, value: string) => {
        setSettings((prev) => prev.map((s) => (s.key === key ? { ...s, value } : s)));
    };

    const handleSave = async () => {
        setSaving(true);
        try {
            await client.put('/settings', settings);
            setSuccess('Settings saved successfully.');
            setTimeout(() => setSuccess(null), 3000);
        } catch {
            setError('Failed to save settings.');
            setTimeout(() => setError(null), 3000);
        } finally {
            setSaving(false);
        }
    };

    const openIntegrationEdit = (key: string) => {
        const setting = settings.find(s => s.key === key);
        if (setting) {
            setEditingIntegration(key);
            setIntegrationValue(setting.value);
        }
    };

    const saveIntegrationEdit = () => {
        if (editingIntegration) {
            handleChange(editingIntegration, integrationValue);
            setEditingIntegration(null);
        }
    };

    const tabs = [
        { id: 'general', label: 'General', icon: <Settings size={18} /> },
        { id: 'notifications', label: 'Notifications', icon: <Bell size={18} /> },
        { id: 'integrations', label: 'Integrations', icon: <Share2 size={18} /> },
        { id: 'access', label: 'Access Control', icon: <Shield size={18} /> },
    ];

    const integrationsList = [
        { key: 'slack_webhook', name: 'Slack', icon: <Slack />, color: 'bg-emerald-500' },
        { key: 'jira_url', name: 'Jira', icon: <Terminal />, color: 'bg-blue-500' },
        { key: 'aws_access_key', name: 'AWS CloudWatch', icon: <Server />, color: 'bg-orange-500' },
        { key: 'splunk_url', name: 'Splunk', icon: <ActivityIcon />, color: 'bg-gray-500' },
        { key: 'github_token', name: 'GitHub', icon: <GithubIcon />, color: 'bg-white text-black' },
    ];

    return (
        <div className="space-y-6 max-w-6xl mx-auto pb-10 relative">
            {/* Header */}
            <div className="flex flex-col md:flex-row justify-between items-end gap-4">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight text-white mb-2 flex items-center gap-3">
                        <Settings className="text-cyan-400" size={32} />
                        System Configuration
                    </h1>
                    <p className="text-gray-400">Manage global preferences, integrations, and security policies.</p>
                </div>
                <div className="flex gap-3">
                    <NeonButton variant="ghost" onClick={fetchSettings} disabled={loading}>
                        <RefreshCw size={16} className={loading ? "animate-spin" : ""} />
                    </NeonButton>
                    <NeonButton variant="primary" glow onClick={handleSave} disabled={saving}>
                        <Save size={16} />
                        {saving ? 'Saving...' : 'Save Changes'}
                    </NeonButton>
                </div>
            </div>

            {/* Notifications */}
            {error && (
                <div className="bg-red-500/10 border border-red-500/50 text-red-400 p-4 rounded-lg flex items-center gap-3">
                    <Shield size={20} /> {error}
                </div>
            )}
            {success && (
                <div className="bg-green-500/10 border border-green-500/50 text-green-400 p-4 rounded-lg flex items-center gap-3">
                    <Shield size={20} /> {success}
                </div>
            )}

            {/* Tabs */}
            <div className="flex overflow-x-auto gap-2 border-b border-white/10 pb-1">
                {tabs.map(tab => (
                    <button
                        key={tab.id}
                        onClick={() => setActiveTab(tab.id as any)}
                        className={`flex items-center gap-2 px-6 py-3 text-sm font-mono font-bold uppercase transition-all border-b-2 whitespace-nowrap ${activeTab === tab.id
                                ? 'text-cyan-400 border-cyan-400 bg-white/5'
                                : 'text-gray-500 border-transparent hover:text-gray-300 hover:bg-white/5'
                            }`}
                    >
                        {tab.icon} {tab.label}
                    </button>
                ))}
            </div>

            {/* Content */}
            <div className="min-h-[400px]">
                {activeTab === 'general' && (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <GlassCard title="Display Settings">
                            <div className="space-y-4">
                                <div>
                                    <label className="block text-xs text-gray-500 uppercase tracking-wider mb-2">UI Theme</label>
                                    <select
                                        className="w-full bg-[#050505] border border-white/10 text-white p-2.5 rounded hover:border-cyan-500/50 focus:border-cyan-500 outline-none transition-colors"
                                        value={settings.find(s => s.key === 'theme')?.value || 'cyber'}
                                        onChange={(e) => handleChange('theme', e.target.value)}
                                    >
                                        <option value="cyber">Cyber Tactical (Default)</option>
                                        <option value="dark">Midnight Dark</option>
                                        <option value="light">Solar Light</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-xs text-gray-500 uppercase tracking-wider mb-2">Dashboard Refresh Rate</label>
                                    <div className="flex items-center gap-3">
                                        <input
                                            type="range" min="5" max="60" step="5"
                                            className="flex-1 accent-cyan-400 h-1 bg-gray-700 rounded-lg appearance-none cursor-pointer"
                                            value={settings.find(s => s.key === 'refresh_interval')?.value || 30}
                                            onChange={(e) => handleChange('refresh_interval', e.target.value)}
                                        />
                                        <span className="text-cyan-400 font-mono font-bold w-12 text-right">
                                            {settings.find(s => s.key === 'refresh_interval')?.value || 30}s
                                        </span>
                                    </div>
                                </div>
                            </div>
                        </GlassCard>

                        <GlassCard title="Localization">
                            <div className="space-y-4">
                                <div>
                                    <label className="block text-xs text-gray-500 uppercase tracking-wider mb-2">System Language</label>
                                    <div className="flex items-center gap-3 p-3 border border-white/10 rounded bg-[#050505]">
                                        <Globe size={18} className="text-gray-400" />
                                        <span className="text-gray-300">English (US)</span>
                                        <span className="ml-auto text-xs bg-cyan-500/20 text-cyan-400 px-2 py-0.5 rounded">Active</span>
                                    </div>
                                </div>
                                <div>
                                    <label className="block text-xs text-gray-500 uppercase tracking-wider mb-2">Time Zone</label>
                                    <div className="flex items-center gap-3 p-3 border border-white/10 rounded bg-[#050505]">
                                        <span className="text-gray-300">UTC (Coordinated Universal Time)</span>
                                    </div>
                                </div>
                            </div>
                        </GlassCard>
                    </div>
                )}

                {activeTab === 'notifications' && (
                    <div className="grid grid-cols-1 gap-6">
                        <GlassCard title="Alert Channels">
                            <div className="space-y-4">
                                {[
                                    { id: 'email', label: 'Email Notifications', icon: <Mail size={18} />, desc: 'Send daily digests and critical alerts.' },
                                    { id: 'slack', label: 'Slack Integration', icon: <Slack size={18} />, desc: 'Post real-time incidents to #security-ops.' },
                                    { id: 'pagerduty', label: 'PagerDuty', icon: <Server size={18} />, desc: 'Trigger incidents for high-severity threats.' }
                                ].map(channel => (
                                    <div key={channel.id} className="flex items-center justify-between p-4 border border-white/5 rounded-lg hover:bg-white/5 transition-colors">
                                        <div className="flex items-center gap-4">
                                            <div className="p-2 bg-white/5 rounded text-cyan-400">{channel.icon}</div>
                                            <div>
                                                <div className="text-white font-bold">{channel.label}</div>
                                                <div className="text-xs text-gray-500">{channel.desc}</div>
                                            </div>
                                        </div>
                                        <label className="relative inline-flex items-center cursor-pointer">
                                            <input type="checkbox" className="sr-only peer" defaultChecked />
                                            <div className="w-11 h-6 bg-gray-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-cyan-500"></div>
                                        </label>
                                    </div>
                                ))}
                            </div>
                        </GlassCard>
                    </div>
                )}

                {activeTab === 'integrations' && (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {integrationsList.map((integ, i) => {
                            const setting = settings.find(s => s.key === integ.key);
                            const isConfigured = setting && setting.value && setting.value.length > 5;
                            const status = isConfigured ? 'Connected' : 'Not Configured';

                            return (
                                <GlassCard key={i} className="flex flex-col gap-4">
                                    <div className="flex justify-between items-start">
                                        <div className={`p-3 rounded-lg ${integ.color}/20 text-white`}>
                                            {integ.icon}
                                        </div>
                                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase border ${isConfigured ? 'border-emerald-500/30 text-emerald-400 bg-emerald-500/10' :
                                                'border-gray-500/30 text-gray-400 bg-gray-500/10'
                                            }`}>
                                            {status}
                                        </span>
                                    </div>
                                    <div>
                                        <h3 className="font-bold text-white text-lg">{integ.name}</h3>
                                        <p className="text-xs text-gray-500 mt-1">
                                            {isConfigured ? 'Integration active.' : 'Setup required.'}
                                        </p>
                                    </div>
                                    <NeonButton
                                        variant={isConfigured ? 'ghost' : 'primary'}
                                        className="w-full justify-center text-xs"
                                        onClick={() => openIntegrationEdit(integ.key)}
                                        disabled={!setting && false} // Allow clicking if setting key not found? No, better to handle gracefully.
                                    >
                                        {isConfigured ? 'Configure' : 'Connect'}
                                    </NeonButton>
                                </GlassCard>
                            );
                        })}
                    </div>
                )}

                {activeTab === 'access' && (
                    <div className="space-y-6">
                        <GlassCard title="API Keys">
                            <div className="p-4 bg-black/40 rounded border border-white/10 font-mono text-sm flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                    <Key size={16} className="text-yellow-500" />
                                    <span className="text-gray-400">sk-live-****************************9d4a</span>
                                </div>
                                <NeonButton variant="ghost" className="text-xs">Revoke</NeonButton>
                            </div>
                            <div className="mt-4">
                                <NeonButton variant="primary">Generate New Key</NeonButton>
                            </div>
                        </GlassCard>
                    </div>
                )}
            </div>

            {/* Integration Edit Modal */}
            {editingIntegration && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm">
                    <GlassCard className="w-full max-w-md p-6 m-4 shadow-2xl border-cyan-500/30">
                        <div className="flex justify-between items-center mb-4">
                            <h3 className="text-lg font-bold text-white">Configure Integration</h3>
                            <button onClick={() => setEditingIntegration(null)} className="text-gray-400 hover:text-white">
                                <X size={20} />
                            </button>
                        </div>
                        <div className="mb-4">
                            <label className="block text-xs text-gray-500 uppercase tracking-wider mb-2">
                                {settings.find(s => s.key === editingIntegration)?.description || editingIntegration}
                            </label>
                            <input
                                type="text"
                                value={integrationValue}
                                onChange={(e) => setIntegrationValue(e.target.value)}
                                className="w-full bg-[#050505] border border-white/10 text-white p-3 rounded focus:border-cyan-500 outline-none font-mono text-sm"
                                placeholder="Enter configuration value..."
                            />
                        </div>
                        <div className="flex gap-3 justify-end">
                            <NeonButton variant="ghost" onClick={() => setEditingIntegration(null)}>Cancel</NeonButton>
                            <NeonButton variant="primary" glow onClick={saveIntegrationEdit}>Save Configuration</NeonButton>
                        </div>
                    </GlassCard>
                </div>
            )}
        </div>
    );
};

// Helper icons
const ActivityIcon = () => (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 12h-4l-3 9L9 3l-3 9H2" /></svg>
)
const GithubIcon = () => (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M15 22v-4a4.8 4.8 0 0 0-1-3.5c3 0 6-2 6-5.5.08-1.25-.27-2.48-1-3.5.28-1.15.28-2.35 0-3.5 0 0-1 0-3 1.5-2.64-.5-5.36.5-8 4-2.64-3.5-5.36-4.5-8-4 0 0 0-1.5 3c-.28 1.15-.28 2.35 0 3.5A5.403 5.403 0 0 0 4 9c0 3.5 3 5.5 6 5.5-.39.49-.68 1.05-.85 1.65-.17.6-.22 1.23-.15 1.85v4" /><path d="M9 18c-4.51 2-5-2-7-2" /></svg>
)

export default SettingsPage;
