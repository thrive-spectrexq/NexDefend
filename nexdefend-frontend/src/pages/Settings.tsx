import { useEffect, useState } from 'react';
import { Save, Shield, Database, Activity } from 'lucide-react';

const Settings = () => {
  const [config, setConfig] = useState({
    virustotal_key: '',
    ollama_url: 'http://localhost:11434/api/generate',
    refresh_rate: 2,
    auto_block: false,
    theme: 'dark'
  });
  const [status, setStatus] = useState('');

  useEffect(() => {
    if (window.go?.main?.App) {
      window.go.main.App.GetSettings().then(setConfig);
    }
  }, []);

  const handleSave = async () => {
    if (window.go?.main?.App) {
      const res = await window.go.main.App.SaveSettings(config);
      setStatus(res);
      setTimeout(() => setStatus(''), 3000);
    }
  };

  return (
    <div className="p-8 bg-slate-900 min-h-screen text-white">
      <h1 className="text-3xl font-bold mb-8 flex items-center gap-2">
        <Shield className="text-blue-400" /> System Configuration
      </h1>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">

        {/* API Integrations */}
        <div className="bg-slate-800 p-6 rounded-xl border border-slate-700">
          <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
            <Database size={20} /> External Integrations
          </h2>

          <div className="mb-4">
            <label className="block text-sm text-slate-400 mb-1">VirusTotal API Key</label>
            <input
              type="password"
              className="w-full bg-slate-900 border border-slate-700 rounded p-2 text-white focus:border-blue-500 outline-none"
              value={config.virustotal_key}
              onChange={e => setConfig({...config, virustotal_key: e.target.value})}
              placeholder="Enter VT API Key..."
            />
          </div>

          <div className="mb-4">
            <label className="block text-sm text-slate-400 mb-1">Ollama AI URL</label>
            <input
              type="text"
              className="w-full bg-slate-900 border border-slate-700 rounded p-2 text-white focus:border-blue-500 outline-none"
              value={config.ollama_url}
              onChange={e => setConfig({...config, ollama_url: e.target.value})}
            />
          </div>
        </div>

        {/* Behavior Settings */}
        <div className="bg-slate-800 p-6 rounded-xl border border-slate-700">
          <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
            <Activity size={20} /> Agent Behavior
          </h2>

          <div className="mb-6">
            <label className="block text-sm text-slate-400 mb-1">Refresh Rate (Seconds)</label>
            <input
              type="number"
              className="w-full bg-slate-900 border border-slate-700 rounded p-2 text-white"
              value={config.refresh_rate}
              onChange={e => setConfig({...config, refresh_rate: parseInt(e.target.value)})}
            />
          </div>

          <div className="flex items-center gap-3">
            <input
              type="checkbox"
              id="autoblock"
              checked={config.auto_block}
              onChange={e => setConfig({...config, auto_block: e.target.checked})}
              className="w-5 h-5 rounded bg-slate-700 border-slate-600"
            />
            <label htmlFor="autoblock" className="cursor-pointer">
              <span className="block font-medium">Auto-Response Mode</span>
              <span className="text-sm text-slate-400">Automatically kill processes flagged as Critical Threats</span>
            </label>
          </div>
        </div>
      </div>

      <div className="mt-8 flex items-center gap-4">
        <button
          onClick={handleSave}
          className="bg-blue-600 hover:bg-blue-500 text-white px-6 py-2 rounded-lg font-medium flex items-center gap-2 transition"
        >
          <Save size={18} /> Save Configuration
        </button>
        {status && <span className="text-green-400">{status}</span>}
      </div>
    </div>
  );
};

export default Settings;
