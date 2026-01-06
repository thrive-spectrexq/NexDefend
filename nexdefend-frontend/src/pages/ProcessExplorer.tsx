import { useEffect, useState } from 'react';
import { RefreshCw, XCircle, Search, Terminal } from 'lucide-react';

const ProcessExplorer = () => {
  const [processes, setProcesses] = useState<any[]>([]);
  const [selectedPid, setSelectedPid] = useState<number | null>(null);
  const [details, setDetails] = useState<any>(null);
  const [filter, setFilter] = useState('');

  // Initial Load
  useEffect(() => {
    refreshList();
    const interval = setInterval(refreshList, 3000);
    return () => clearInterval(interval);
  }, []);

  // Fetch Details when a row is clicked
  useEffect(() => {
    if (selectedPid && window.go?.main?.App) {
      window.go.main.App.GetProcessDetail(selectedPid).then(setDetails);
    }
  }, [selectedPid]);

  const refreshList = async () => {
    if (window.go?.main?.App) {
      const list = await window.go.main.App.GetRunningProcesses();
      setProcesses(list);
    }
  };

  const killProcess = async (pid: number) => {
    if (!confirm(`Are you sure you want to terminate process ${pid}?`)) return;
    if (window.go?.main?.App) {
      const result = await window.go.main.App.KillProcess(pid);
      alert(result);
      refreshList();
      setDetails(null);
    }
  };

  const filtered = processes.filter(p =>
    p.name.toLowerCase().includes(filter.toLowerCase())
  );

  return (
    <div className="p-6 bg-slate-900 min-h-screen text-white flex gap-6 h-screen overflow-hidden">

      {/* Left: Process List */}
      <div className="flex-1 flex flex-col bg-slate-800 rounded-xl border border-slate-700 overflow-hidden">
        <div className="p-4 border-b border-slate-700 flex justify-between items-center">
          <div className="relative">
            <Search className="absolute left-3 top-2.5 text-slate-400" size={16} />
            <input
              className="bg-slate-900 border border-slate-700 rounded-full pl-9 pr-4 py-1.5 text-sm w-64 focus:border-blue-500 outline-none"
              placeholder="Search processes..."
              value={filter}
              onChange={e => setFilter(e.target.value)}
            />
          </div>
          <button onClick={refreshList} className="p-2 hover:bg-slate-700 rounded-full text-slate-400">
            <RefreshCw size={18} />
          </button>
        </div>

        <div className="flex-1 overflow-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-slate-900 sticky top-0">
              <tr>
                <th className="p-3 text-slate-400 font-normal">Name</th>
                <th className="p-3 text-slate-400 font-normal">PID</th>
                <th className="p-3 text-slate-400 font-normal text-right">CPU%</th>
                <th className="p-3 text-slate-400 font-normal text-right">Mem%</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map(p => (
                <tr
                  key={p.pid}
                  onClick={() => setSelectedPid(p.pid)}
                  className={`cursor-pointer border-b border-slate-700/50 hover:bg-slate-700 transition-colors ${selectedPid === p.pid ? 'bg-blue-900/30 border-l-2 border-l-blue-400' : ''}`}
                >
                  <td className="p-3 font-medium">{p.name}</td>
                  <td className="p-3 text-slate-500 font-mono">{p.pid}</td>
                  <td className="p-3 text-right">{p.cpu.toFixed(1)}%</td>
                  <td className="p-3 text-right">{p.mem.toFixed(1)}%</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Right: Inspector Panel */}
      <div className="w-96 bg-slate-800 rounded-xl border border-slate-700 flex flex-col overflow-hidden">
        {details ? (
          <>
            <div className="p-6 border-b border-slate-700 bg-slate-900/50">
              <h2 className="text-xl font-bold mb-1">{details.name}</h2>
              <div className="text-sm text-slate-400 font-mono mb-4">PID: {details.pid} • User: {details.username}</div>

              <button
                onClick={() => killProcess(details.pid)}
                className="w-full bg-red-600/20 hover:bg-red-600/30 text-red-400 border border-red-600/50 py-2 rounded flex justify-center items-center gap-2 transition"
              >
                <XCircle size={16} /> Terminate Process
              </button>
            </div>

            <div className="flex-1 overflow-auto p-4 space-y-6">

              {/* Command Line */}
              <div>
                <h3 className="text-xs uppercase font-bold text-slate-500 mb-2 flex items-center gap-2">
                  <Terminal size={14} /> Command Line
                </h3>
                <div className="bg-slate-950 p-3 rounded font-mono text-xs text-slate-300 break-all border border-slate-800">
                  {details.cmdline || "N/A"}
                </div>
              </div>

              {/* Network Connections */}
              <div>
                <h3 className="text-xs uppercase font-bold text-slate-500 mb-2">Network Connections</h3>
                {details.connections && details.connections.length > 0 ? (
                  <div className="space-y-1">
                    {details.connections.map((c: string, i: number) => (
                      <div key={i} className="text-xs font-mono bg-slate-700/50 p-1.5 rounded text-blue-300">
                        {c}
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-xs text-slate-600 italic">No active connections</div>
                )}
              </div>

              {/* Open Files */}
              <div>
                <h3 className="text-xs uppercase font-bold text-slate-500 mb-2">Open Files (Top 10)</h3>
                <ul className="text-xs text-slate-300 space-y-1 font-mono">
                  {details.open_files?.map((f: string, i: number) => (
                    <li key={i} className="truncate">{f}</li>
                  ))}
                </ul>
              </div>

            </div>
          </>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center text-slate-500 p-8 text-center">
            <Search size={48} className="mb-4 opacity-20" />
            <p>Select a process to view details, active connections, and file handles.</p>
          </div>
        )}
      </div>

    </div>
  );
};

export default ProcessExplorer;
