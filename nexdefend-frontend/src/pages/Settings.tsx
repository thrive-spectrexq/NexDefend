import { useState } from 'react';
import './Settings.css';
import './Integrations.css';

const Settings = () => {
  const [activeTab, setActiveTab] = useState('general');
  const [provider, setProvider] = useState('aws');
  const [apiKey, setApiKey] = useState('');
  const [apiSecret, setApiSecret] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
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
            <form className="integrations-form" onSubmit={handleSubmit}>
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
      </div>
    </div>
  );
};

export default Settings;
