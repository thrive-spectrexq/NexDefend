import { useState } from 'react';
import './Settings.css';
import './Integrations.css';

const Settings = () => {
  const [activeTab, setActiveTab] = useState('general');
  const [provider, setProvider] = useState('aws');
  const [apiKey, setApiKey] = useState('');
  const [apiSecret, setApiSecret] = useState('');
  const [agentConfig, setAgentConfig] = useState('');
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
    // TODO: Implement agent config submission
    alert('Agent configuration saved!');
  };

  const handleThreatFeedSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    // TODO: Implement threat feed submission
    alert('Threat feed saved!');
  };

  return (
    <div className="settings-page">
      <h1>Settings</h1>
      <div className="tabs">
        <button
          className={activeTab === 'general' ? 'active' : ''}
          onClick={() => setActiveTab('general')}
        >
          General
        </button>
        <button
          className={activeTab === 'integrations' ? 'active' : ''}
          onClick={() => setActiveTab('integrations')}
        >
          Integrations
        </button>
        <button
          className={activeTab === 'agents' ? 'active' : ''}
          onClick={() => setActiveTab('agents')}
        >
          Agents
        </button>
        <button
          className={activeTab === 'threat-intelligence' ? 'active' : ''}
          onClick={() => setActiveTab('threat-intelligence')}
        >
          Threat Intelligence
        </button>
      </div>
      <div className="tab-content">
        {activeTab === 'general' && (
          <div>
            <h2>General Settings</h2>
            <p>This is where the general settings will be displayed.</p>
          </div>
        )}
        {activeTab === 'integrations' && (
          <div>
            <h2>Cloud Integrations</h2>
            <form className="integrations-form" onSubmit={handleCloudSubmit}>
              <label htmlFor="provider">Provider</label>
              <select id="provider" name="provider" value={provider} onChange={(e) => setProvider(e.target.value)}>
                <option value="aws">AWS</option>
                <option value="azure">Azure</option>
              </select>
              <label htmlFor="apiKey">API Key</label>
              <input type="text" id="apiKey" name="apiKey" value={apiKey} onChange={(e) => setApiKey(e.target.value)} />
              <label htmlFor="apiSecret">API Secret</label>
              <input type="password" id="apiSecret" name="apiSecret" value={apiSecret} onChange={(e) => setApiSecret(e.target.value)} />
              <button type="submit">Save</button>
            </form>
          </div>
        )}
        {activeTab === 'agents' && (
          <div>
            <h2>Agent Configuration</h2>
            <form className="integrations-form" onSubmit={handleAgentSubmit}>
              <label htmlFor="agentConfig">Agent Configuration</label>
              <textarea id="agentConfig" name="agentConfig" value={agentConfig} onChange={(e) => setAgentConfig(e.target.value)} />
              <button type="submit">Save</button>
            </form>
          </div>
        )}
        {activeTab === 'threat-intelligence' && (
          <div>
            <h2>Threat Intelligence Feeds</h2>
            <form className="integrations-form" onSubmit={handleThreatFeedSubmit}>
              <label htmlFor="threatFeed">Threat Feed URL</label>
              <input type="text" id="threatFeed" name="threatFeed" value={threatFeed} onChange={(e) => setThreatFeed(e.target.value)} />
              <button type="submit">Save</button>
            </form>
          </div>
        )}
      </div>
    </div>
  );
};

export default Settings;
