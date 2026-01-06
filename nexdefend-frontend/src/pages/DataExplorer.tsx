import { useState } from 'react';
import { Search, Database, Terminal } from 'lucide-react';

const DataExplorer = () => {
  const [query, setQuery] = useState('source="win_event_log" AND severity="error" | limit 50');
  const [results, setResults] = useState<any[]>([]);

  const handleSearch = async () => {
    // Connect to Go Backend SearchLogs function
    if ((window as any).go?.main?.App) {
      const res = await (window as any).go.main.App.SearchLogs(query);
      setResults(res.hits || []);
    }
  };

  return (
    <div className="flex flex-col h-screen bg-slate-950 text-white">
      {/* Search Bar Area */}
      <div className="p-4 border-b border-slate-800 bg-slate-900">
        <div className="flex items-center gap-2 mb-2 text-slate-400 text-sm">
          <Terminal size={14} />
          <span>Advanced Query Language (AQL)</span>
        </div>
        <div className="flex gap-2">
          <div className="flex-1 relative">
            <input
              className="w-full bg-slate-950 border border-slate-700 rounded-lg pl-4 pr-4 py-3 font-mono text-sm text-green-400 focus:outline-none focus:border-indigo-500"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Enter search query..."
            />
          </div>
          <button
            onClick={handleSearch}
            className="bg-indigo-600 hover:bg-indigo-500 px-6 rounded-lg font-medium flex items-center gap-2"
          >
            <Search size={18} /> Search
          </button>
        </div>
      </div>

      {/* Results Timeline (Placeholder) */}
      <div className="h-24 border-b border-slate-800 bg-slate-900/50 flex items-center justify-center text-slate-600 text-sm">
        [ Event Timeline Visualization ]
      </div>

      {/* Results Table */}
      <div className="flex-1 overflow-auto p-4">
        {results.length > 0 ? (
          <div className="space-y-2">
            {results.map((log: any, i) => (
              <div key={i} className="font-mono text-xs p-3 bg-slate-900 rounded border border-slate-800 hover:border-slate-600 cursor-pointer">
                <div className="flex gap-4 text-slate-500 mb-1">
                  <span>{new Date(log.timestamp).toISOString()}</span>
                  <span className="text-blue-400">{log.source}</span>
                  <span className="text-yellow-400">{log.level}</span>
                </div>
                <div className="text-slate-300">{log.message}</div>
              </div>
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center h-full text-slate-600">
            <Database size={48} className="mb-4 opacity-50" />
            <p>Enter a query to hunt through system logs.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default DataExplorer;
