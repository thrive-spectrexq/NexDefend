import React, { useEffect, useState } from 'react';

// Define the Wails Runtime types (usually auto-generated)
declare global {
  interface Window {
    runtime: {
      EventsOn: (event: string, callback: (data: any) => void) => void;
    };
    go: {
      main: {
        App: {
          SearchLogs: (query: string) => Promise<any>;
        }
      }
    }
  }
}

const NetworkMonitor = () => {
  const [flows, setFlows] = useState<any[]>([]);
  const [alerts, setAlerts] = useState<any[]>([]);

  useEffect(() => {
    if (window.runtime) {
      // Listen for NetFlow events from Go
      window.runtime.EventsOn("network-flow", (flow: any) => {
        setFlows((prev) => [flow, ...prev].slice(0, 20)); // Keep last 20
      });

      // Listen for Security Alerts
      window.runtime.EventsOn("security-alert", (alert: any) => {
        setAlerts((prev) => [alert, ...prev]);
        // Optional: Trigger native desktop notification here
      });
    }
  }, []);

  return (
    <div className="p-6 bg-slate-900 min-h-screen text-white grid grid-cols-1 lg:grid-cols-2 gap-6">

      {/* Live Flow Table */}
      <div className="bg-slate-800 rounded-xl p-4 border border-slate-700">
        <h2 className="text-xl font-bold mb-4 text-blue-400">Live Network Activity</h2>
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead>
              <tr className="border-b border-slate-600 text-slate-400">
                <th className="py-2">Process</th>
                <th className="py-2">Remote Address</th>
                <th className="py-2">State</th>
              </tr>
            </thead>
            <tbody>
              {flows.map((f, i) => (
                <tr key={i} className="border-b border-slate-700 hover:bg-slate-700/50 transition">
                  <td className="py-2 font-mono text-green-400">{f.process_name} <span className="text-slate-500">({f.pid})</span></td>
                  <td className="py-2 font-mono">{f.remote_ip}:{f.remote_port}</td>
                  <td className="py-2">
                    <span className={`px-2 py-0.5 rounded text-xs ${f.status === 'ESTABLISHED' ? 'bg-green-900 text-green-200' : 'bg-yellow-900 text-yellow-200'}`}>
                      {f.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Alerts Panel */}
      <div className="bg-slate-800 rounded-xl p-4 border border-slate-700">
        <h2 className="text-xl font-bold mb-4 text-red-400">Security Alerts</h2>
        {alerts.length === 0 ? (
          <div className="text-slate-500 italic">No active threats detected. System secure.</div>
        ) : (
          <div className="space-y-3">
            {alerts.map((a, i) => (
              <div key={i} className="bg-red-900/20 border-l-4 border-red-500 p-3 rounded">
                <div className="flex justify-between items-start">
                  <span className="font-bold text-red-200">{a.severity}</span>
                  <span className="text-xs text-red-300/70">{new Date().toLocaleTimeString()}</span>
                </div>
                <p className="text-sm text-slate-300 mt-1">{a.message}</p>
              </div>
            ))}
          </div>
        )}
      </div>

    </div>
  );
};

export default NetworkMonitor;
