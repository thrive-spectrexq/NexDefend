import { AlertCircle, Clock, Filter, Play } from 'lucide-react';

// Mock Incident Data (In real app, fetch from Go backend)
const incidents = [
  { id: 'INC-2024-001', title: 'Suspicious PowerShell Execution', urgency: 'Critical', status: 'New', owner: 'Unassigned', time: '10 mins ago' },
  { id: 'INC-2024-002', title: 'Lateral Movement Detected (SMB)', urgency: 'High', status: 'Investigating', owner: 'brian.a', time: '1 hour ago' },
  { id: 'INC-2024-003', title: 'Failed Login Spike', urgency: 'Medium', status: 'New', owner: 'Unassigned', time: '2 hours ago' },
];

const MissionControl = () => {
  return (
    <div className="p-6 bg-slate-950 min-h-screen text-white">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold flex items-center gap-2">
          <AlertCircle className="text-indigo-500" /> Mission Control
        </h1>
        <div className="flex gap-2">
          <button className="bg-slate-800 hover:bg-slate-700 px-4 py-2 rounded flex items-center gap-2 text-sm border border-slate-700">
            <Filter size={16} /> Filter
          </button>
          <button className="bg-indigo-600 hover:bg-indigo-500 px-4 py-2 rounded text-sm font-medium">
            Run Playbook
          </button>
        </div>
      </div>

      {/* Incident Table */}
      <div className="bg-slate-900 border border-slate-800 rounded-lg overflow-hidden shadow-xl">
        <table className="w-full text-left text-sm">
          <thead className="bg-slate-950 text-slate-400 border-b border-slate-800 uppercase text-xs">
            <tr>
              <th className="p-4">Urgency</th>
              <th className="p-4">Incident</th>
              <th className="p-4">Status</th>
              <th className="p-4">Owner</th>
              <th className="p-4">Time</th>
              <th className="p-4">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800">
            {incidents.map((inc) => (
              <tr key={inc.id} className="hover:bg-slate-800/50 transition cursor-pointer">
                <td className="p-4">
                  <span className={`px-2 py-1 rounded text-[10px] font-bold uppercase
                    ${inc.urgency === 'Critical' ? 'bg-red-900/30 text-red-400 border border-red-900' :
                      inc.urgency === 'High' ? 'bg-orange-900/30 text-orange-400 border border-orange-900' : 'bg-yellow-900/30 text-yellow-400'}`}>
                    {inc.urgency}
                  </span>
                </td>
                <td className="p-4">
                  <div className="font-medium text-slate-200">{inc.title}</div>
                  <div className="text-xs text-slate-500 font-mono">{inc.id}</div>
                </td>
                <td className="p-4">
                  <span className="flex items-center gap-1.5 text-slate-300">
                    {inc.status === 'New' ? <AlertCircle size={14} className="text-blue-400"/> : <Clock size={14} className="text-orange-400"/>}
                    {inc.status}
                  </span>
                </td>
                <td className="p-4 text-slate-400 flex items-center gap-2">
                  <div className="w-6 h-6 rounded-full bg-slate-800 flex items-center justify-center text-xs">
                    {inc.owner[0].toUpperCase()}
                  </div>
                  {inc.owner}
                </td>
                <td className="p-4 text-slate-500">{inc.time}</td>
                <td className="p-4">
                  <button className="text-indigo-400 hover:text-indigo-300 flex items-center gap-1 text-xs font-bold uppercase">
                    <Play size={12} /> Triage
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default MissionControl;
