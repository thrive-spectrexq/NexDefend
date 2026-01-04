import { useState } from 'react';
import { PageTransition } from '../components/common/PageTransition';
import { Settings as SettingsIcon, Cloud, Shield, Server, Sliders } from 'lucide-react';
import { cn } from '../lib/utils';

// Removed legacy CSS imports to rely on Tailwind
// import './Settings.css';
// import './Integrations.css';

const Settings = () => {
  const [activeTab, setActiveTab] = useState('general');
  const [provider, setProvider] = useState('aws');
  const [apiKey, setApiKey] = useState('');
  const [apiSecret, setApiSecret] = useState('');
  const [agentConfig, setAgentConfig] = useState('{\n  "hostname": "FIN-WS-004",\n  "log_level": "info",\n  "modules": ["process", "network", "file"]\n}');
  const [threatFeed, setThreatFeed] = useState('');

  const handleCloudSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const response = await fetch('/api/v1/cloud-credentials', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({
          provider,
          credentials_encrypted: `${apiKey}:${apiSecret}` // This is not real encryption
        })
      });
      if (response.ok) {
        alert('Credentials saved successfully!');
        setApiKey('');
        setApiSecret('');
      } else {
        alert('Failed to save credentials.');
      }
    } catch (error) {
      console.error('Error saving credentials:', error);
      alert('An error occurred while saving credentials.');
    }
  };

  const handleAgentSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    // We assume the user enters configuration for a specific hostname.
    // In a real UI, this would be a selection from a dropdown or a specific config page per agent.
    // For now, we will try to parse a hostname from the config or prompt for one, but to keep it simple
    // we'll assume there is a 'hostname' field in the text area JSON, or we default to 'all'.

    try {
        let configObj;
        try {
            configObj = JSON.parse(agentConfig);
        } catch {
            alert("Invalid JSON configuration.");
            return;
        }

        const hostname = configObj.hostname || "default-agent"; // Fallback if not specified

        const response = await fetch('/api/v1/agent/config', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${localStorage.getItem('token')}`
            },
            body: JSON.stringify({
                hostname: hostname,
                config: configObj
            })
        });

        if (response.ok) {
            alert('Agent configuration saved!');
        } else {
            alert('Failed to save agent configuration.');
        }
    } catch (error) {
        console.error('Error saving agent config:', error);
        alert('An error occurred.');
    }
  };

  const handleThreatFeedSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    // Currently, there is no backend endpoint for persisting threat feeds in the database
    // other than the TIP integration which is configured via environment variables or specialized services.
    // We will log this for now.
    console.log("Submitting threat feed:", threatFeed);
    alert('Threat feed submitted (Mock)!');
  };

  return (
    <PageTransition className="space-y-6">
      <h1 className="text-2xl font-bold text-text flex items-center gap-3">
          <SettingsIcon className="text-brand-blue" />
          Configuration
      </h1>

      <div className="flex flex-col md:flex-row gap-6">
          {/* Sidebar Tabs */}
          <div className="w-full md:w-64 flex flex-col gap-1">
            {[
                { id: 'general', label: 'General', icon: Sliders },
                { id: 'integrations', label: 'Cloud Integrations', icon: Cloud },
                { id: 'agents', label: 'Agents', icon: Server },
                { id: 'threat-intelligence', label: 'Threat Intel', icon: Shield },
            ].map((tab) => (
                <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={cn(
                        "flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-colors text-left",
                        activeTab === tab.id
                            ? "bg-brand-blue text-background"
                            : "text-text-muted hover:bg-surface-highlight hover:text-text"
                    )}
                >
                    <tab.icon size={18} />
                    {tab.label}
                </button>
            ))}
          </div>

          {/* Content Area */}
          <div className="flex-1 bg-surface border border-surface-highlight rounded-lg p-6">
            {activeTab === 'general' && (
            <div className="space-y-4">
                <h2 className="text-xl font-semibold text-text mb-4 border-b border-surface-highlight pb-2">General Settings</h2>
                <div className="text-text-muted">
                    <p className="mb-4">Global system preferences for the NexDefend console.</p>
                    <div className="flex items-center justify-between p-4 border border-surface-highlight rounded mb-2">
                        <span>Dark Mode</span>
                        <div className="w-10 h-6 bg-brand-blue rounded-full relative cursor-pointer">
                            <div className="absolute right-1 top-1 w-4 h-4 bg-white rounded-full"></div>
                        </div>
                    </div>
                    <div className="flex items-center justify-between p-4 border border-surface-highlight rounded">
                        <span>Email Notifications</span>
                        <div className="w-10 h-6 bg-surface-highlight rounded-full relative cursor-pointer">
                            <div className="absolute left-1 top-1 w-4 h-4 bg-text-muted rounded-full"></div>
                        </div>
                    </div>
                </div>
            </div>
            )}
            {activeTab === 'integrations' && (
            <div className="space-y-4">
                <h2 className="text-xl font-semibold text-text mb-4 border-b border-surface-highlight pb-2">Cloud Integrations</h2>
                <form className="space-y-4" onSubmit={handleCloudSubmit}>
                <div>
                    <label htmlFor="provider" className="block text-sm font-medium text-text-muted mb-1">Provider</label>
                    <select id="provider" name="provider" value={provider} onChange={(e) => setProvider(e.target.value)}
                        className="w-full bg-background border border-surface-highlight rounded px-3 py-2 text-text focus:border-brand-blue focus:outline-none">
                        <option value="aws">AWS</option>
                        <option value="azure">Azure</option>
                    </select>
                </div>
                <div>
                    <label htmlFor="apiKey" className="block text-sm font-medium text-text-muted mb-1">API Key / Access Key ID</label>
                    <input type="text" id="apiKey" name="apiKey" value={apiKey} onChange={(e) => setApiKey(e.target.value)}
                        className="w-full bg-background border border-surface-highlight rounded px-3 py-2 text-text focus:border-brand-blue focus:outline-none" placeholder="AKIA..." />
                </div>
                <div>
                    <label htmlFor="apiSecret" className="block text-sm font-medium text-text-muted mb-1">API Secret / Secret Key</label>
                    <input type="password" id="apiSecret" name="apiSecret" value={apiSecret} onChange={(e) => setApiSecret(e.target.value)}
                        className="w-full bg-background border border-surface-highlight rounded px-3 py-2 text-text focus:border-brand-blue focus:outline-none" placeholder="••••••••" />
                </div>
                <button type="submit" className="px-4 py-2 bg-brand-blue text-background rounded font-semibold hover:bg-brand-blue/90 transition-colors">Save Credentials</button>
                </form>
            </div>
            )}
            {activeTab === 'agents' && (
            <div className="space-y-4">
                <h2 className="text-xl font-semibold text-text mb-4 border-b border-surface-highlight pb-2">Agent Configuration</h2>
                <form className="space-y-4" onSubmit={handleAgentSubmit}>
                <div>
                    <label htmlFor="agentConfig" className="block text-sm font-medium text-text-muted mb-1">JSON Configuration Policy</label>
                    <textarea id="agentConfig" name="agentConfig" rows={10} value={agentConfig} onChange={(e) => setAgentConfig(e.target.value)}
                        className="w-full bg-background border border-surface-highlight rounded px-3 py-2 text-text font-mono text-sm focus:border-brand-blue focus:outline-none" />
                </div>
                <button type="submit" className="px-4 py-2 bg-brand-blue text-background rounded font-semibold hover:bg-brand-blue/90 transition-colors">Push Configuration</button>
                </form>
            </div>
            )}
            {activeTab === 'threat-intelligence' && (
            <div className="space-y-4">
                <h2 className="text-xl font-semibold text-text mb-4 border-b border-surface-highlight pb-2">Threat Intelligence Feeds</h2>
                <form className="space-y-4" onSubmit={handleThreatFeedSubmit}>
                <div>
                    <label htmlFor="threatFeed" className="block text-sm font-medium text-text-muted mb-1">Threat Feed URL (STIX/TAXII)</label>
                    <input type="text" id="threatFeed" name="threatFeed" value={threatFeed} onChange={(e) => setThreatFeed(e.target.value)}
                        className="w-full bg-background border border-surface-highlight rounded px-3 py-2 text-text focus:border-brand-blue focus:outline-none" placeholder="https://..." />
                </div>
                <button type="submit" className="px-4 py-2 bg-brand-blue text-background rounded font-semibold hover:bg-brand-blue/90 transition-colors">Add Feed</button>
                </form>
            </div>
            )}
          </div>
      </div>
    </PageTransition>
  );
};

export default Settings;
