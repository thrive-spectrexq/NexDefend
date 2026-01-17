import { Link } from 'react-router-dom';
import { Shield, ArrowRight, Activity, Lock, Globe } from 'lucide-react';

const HomePage = () => {
  return (
    <div className="min-h-screen bg-[#0f172a] text-white overflow-hidden relative selection:bg-cyan-500/30">

      {/* Hero Background Effects */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-blue-600/20 rounded-full blur-[120px]" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-cyan-600/20 rounded-full blur-[120px]" />
      </div>

      {/* Navigation */}
      <nav className="relative z-10 container mx-auto px-6 h-20 flex items-center justify-between border-b border-white/5">
        <div className="flex items-center gap-2">
          <Shield className="h-8 w-8 text-cyan-400" />
          <span className="text-xl font-mono font-bold tracking-widest">NEXDEFEND</span>
        </div>
        <div className="flex items-center gap-4">
          <Link to="/login" className="text-gray-300 hover:text-white font-mono text-sm transition-colors">LOG IN</Link>
          <Link to="/register" className="bg-cyan-500 hover:bg-cyan-400 text-black px-5 py-2 rounded-full font-bold text-sm transition-all hover:shadow-[0_0_20px_rgba(6,182,212,0.5)]">
            GET STARTED
          </Link>
        </div>
      </nav>

      {/* Hero Content */}
      <main className="relative z-10 container mx-auto px-6 pt-32 pb-20 text-center">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/5 border border-white/10 mb-8 backdrop-blur-sm">
          <div className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
          <span className="text-xs font-mono text-green-400 tracking-wide">SYSTEM v2.0 LIVE</span>
        </div>

        <h1 className="text-5xl md:text-7xl font-bold mb-6 tracking-tight leading-tight">
          Next-Gen <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-blue-500">Cyber Intelligence</span>
        </h1>

        <p className="text-xl text-gray-400 max-w-2xl mx-auto mb-12 leading-relaxed">
          Advanced threat detection, cognitive AI analysis, and real-time infrastructure monitoring in one unified platform.
        </p>

        <div className="flex flex-col md:flex-row items-center justify-center gap-6">
          <Link to="/register" className="w-full md:w-auto px-8 py-4 bg-gradient-to-r from-cyan-600 to-blue-600 rounded-xl font-bold text-lg flex items-center justify-center gap-2 hover:scale-105 transition-transform shadow-lg shadow-blue-900/50">
            Deploy Now <ArrowRight className="h-5 w-5" />
          </Link>
          <Link to="/login" className="w-full md:w-auto px-8 py-4 bg-white/5 border border-white/10 rounded-xl font-bold text-lg hover:bg-white/10 transition-colors backdrop-blur-sm">
            Access Console
          </Link>
        </div>

        {/* Feature Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-32 text-left">
          {[
            { icon: Activity, title: "Real-time Monitoring", desc: "Live telemetry from all your endpoints and cloud assets." },
            { icon: Lock, title: "AI Threat Defense", desc: "Predictive analysis powered by Isolation Forest models." },
            { icon: Globe, title: "Global Topology", desc: "Visualize your entire network infrastructure in 3D." },
          ].map((item, i) => (
            <div key={i} className="p-6 rounded-2xl bg-white/5 border border-white/5 hover:border-cyan-500/30 transition-colors group">
              <item.icon className="h-10 w-10 text-cyan-400 mb-4 group-hover:scale-110 transition-transform" />
              <h3 className="text-xl font-bold mb-2">{item.title}</h3>
              <p className="text-gray-400 text-sm leading-relaxed">{item.desc}</p>
            </div>
          ))}
        </div>
      </main>
    </div>
  );
};

export default HomePage;
