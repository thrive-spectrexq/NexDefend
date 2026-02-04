import { useState, useEffect } from 'react';
import { Upload, FileText, HardDrive, Cpu, Activity, CheckCircle, Clock } from 'lucide-react';
import { GlassCard } from '../components/ui/GlassCard';
import { NeonButton } from '../components/ui/NeonButton';

export default function ForensicsPage() {
  const [tasks, setTasks] = useState<any[]>([]);
  const [file, setFile] = useState<File | null>(null);
  const [uploadType, setUploadType] = useState('memory');
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    fetchTasks();
    const interval = setInterval(fetchTasks, 5000);
    return () => clearInterval(interval);
  }, []);

  const fetchTasks = async () => {
    try {
      // In a real scenario, this would hit the API
      // const res = await fetch('/api/v1/forensics/tasks', { headers: { Authorization: `Bearer ${token}` }});
      // const data = await res.json();

      // Mock data for display
      setTasks([
        { id: '1', filename: 'memdump_infected.raw', type: 'memory', status: 'processing', timestamp: new Date().toISOString() },
        { id: '2', filename: 'suspicious_binary.exe', type: 'binary', status: 'complete', timestamp: new Date(Date.now() - 3600000).toISOString() },
      ]);
    } catch (err) {
      console.error(err);
    }
  };

  const handleUpload = async () => {
    if (!file) return;
    setUploading(true);

    const formData = new FormData();
    formData.append('evidence', file);
    formData.append('type', uploadType);

    try {
        const token = localStorage.getItem('token');
        await fetch('/api/v1/forensics/upload', {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${token}`
            },
            body: formData
        });
        setFile(null);
        alert('Upload started!');
    } catch (err) {
        console.error("Upload failed", err);
    } finally {
        setUploading(false);
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold font-mono tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-blue-600">
            DIGITAL FORENSICS LAB
          </h1>
          <p className="text-gray-400 mt-1">Analyze artifacts, reverse engineer binaries, and inspect memory dumps.</p>
        </div>
        <div className="flex gap-2">
            <div className="flex items-center gap-2 px-3 py-1 bg-green-500/10 border border-green-500/20 rounded-full">
                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                <span className="text-xs text-green-400 font-mono">WORKER ACTIVE</span>
            </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Upload Card */}
        <GlassCard className="lg:col-span-1 space-y-6">
            <h3 className="text-lg font-bold text-white flex items-center gap-2">
                <Upload className="text-cyan-400" size={20} /> Evidence Locker
            </h3>

            <div className="space-y-4">
                <div className="border-2 border-dashed border-white/10 rounded-xl p-8 flex flex-col items-center justify-center text-center hover:border-cyan-500/50 hover:bg-cyan-500/5 transition-all cursor-pointer relative">
                    <input
                        type="file"
                        className="absolute inset-0 opacity-0 cursor-pointer"
                        onChange={(e) => setFile(e.target.files?.[0] || null)}
                    />
                    <Upload size={32} className="text-gray-500 mb-2" />
                    {file ? (
                        <p className="text-cyan-400 font-mono text-sm">{file.name}</p>
                    ) : (
                        <>
                            <p className="text-gray-300 font-medium">Drop evidence file here</p>
                            <p className="text-xs text-gray-500 mt-1">Supports .raw, .mem, .exe, .pcap (Max 5GB)</p>
                        </>
                    )}
                </div>

                <div className="grid grid-cols-3 gap-2">
                    {['memory', 'binary', 'network'].map(t => (
                        <button
                            key={t}
                            onClick={() => setUploadType(t)}
                            className={`p-2 rounded-lg border text-xs font-mono capitalize transition-all ${
                                uploadType === t
                                ? 'bg-cyan-500/20 border-cyan-500 text-cyan-300'
                                : 'bg-black/20 border-white/10 text-gray-500 hover:border-white/30'
                            }`}
                        >
                            {t}
                        </button>
                    ))}
                </div>

                <NeonButton
                    className="w-full justify-center"
                    variant="primary"
                    onClick={handleUpload}
                    disabled={!file || uploading}
                >
                    {uploading ? 'UPLOADING...' : 'INITIATE ANALYSIS'}
                </NeonButton>
            </div>
        </GlassCard>

        {/* Active Tasks */}
        <div className="lg:col-span-2 space-y-4">
            <h3 className="text-lg font-bold text-white flex items-center gap-2">
                <Activity className="text-blue-400" size={20} /> Analysis Pipeline
            </h3>

            <div className="grid gap-3">
                {tasks.map(task => (
                    <GlassCard key={task.id} className="flex items-center justify-between p-4 hover:bg-white/5 transition-colors group">
                        <div className="flex items-center gap-4">
                            <div className={`p-3 rounded-lg ${task.type === 'memory' ? 'bg-purple-500/10 text-purple-400' : 'bg-orange-500/10 text-orange-400'}`}>
                                {task.type === 'memory' ? <HardDrive size={20} /> : <Cpu size={20} />}
                            </div>
                            <div>
                                <p className="font-mono text-sm text-white group-hover:text-cyan-300 transition-colors">{task.filename}</p>
                                <p className="text-xs text-gray-500 flex items-center gap-2">
                                    <Clock size={12} /> {new Date(task.timestamp).toLocaleString()}
                                    <span className="px-1.5 py-0.5 rounded bg-white/5 border border-white/5 uppercase text-[10px]">{task.type}</span>
                                </p>
                            </div>
                        </div>

                        <div className="flex items-center gap-4">
                            {task.status === 'processing' ? (
                                <div className="flex items-center gap-2 text-yellow-400 text-xs font-mono">
                                    <div className="w-1.5 h-1.5 rounded-full bg-yellow-400 animate-bounce" />
                                    PROCESSING
                                </div>
                            ) : (
                                <div className="flex items-center gap-2 text-green-400 text-xs font-mono">
                                    <CheckCircle size={14} />
                                    COMPLETE
                                </div>
                            )}
                            <button className="text-gray-500 hover:text-white transition-colors">
                                <FileText size={18} />
                            </button>
                        </div>
                    </GlassCard>
                ))}
            </div>
        </div>
      </div>
    </div>
  );
}
