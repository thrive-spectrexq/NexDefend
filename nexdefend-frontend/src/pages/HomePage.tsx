import React from 'react';
import { Link } from 'react-router-dom';
import {
  Shield, Activity, Lock, Cloud, Brain,
  Search, Server, Zap, ArrowRight, CheckCircle
} from 'lucide-react';

const HomePage: React.FC = () => {
  return (
    <div className="min-h-screen bg-gray-950 text-white overflow-hidden selection:bg-cyan-500 selection:text-white">

      {/* Background Grid Effect */}
      <div className="absolute inset-0 z-0 opacity-20 pointer-events-none bg-grid-pattern mask-image-gradient" />

      {/* --- HERO SECTION --- */}
      <section className="relative z-10 container mx-auto px-6 pt-20 pb-32 flex flex-col lg:flex-row items-center gap-16">

        {/* Left Content */}
        <div className="flex-1 space-y-8 text-center lg:text-left">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-900/30 border border-cyan-700/50 text-cyan-400 text-sm font-medium animate-float">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-cyan-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-cyan-500"></span>
            </span>
            NexDefend Platform v1.0 Live
          </div>

          <h1 className="text-5xl lg:text-7xl font-extrabold tracking-tight leading-tight">
            Secure Your <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-blue-600">
              Digital Infrastructure
            </span>
          </h1>

          <p className="text-lg text-gray-400 max-w-2xl mx-auto lg:mx-0 leading-relaxed">
            The all-in-one AI-native security platform. Monitor endpoints, detect anomalies,
            and automate response with military-grade precision across Cloud, On-Prem, and IoT.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
            <Link
              to="/auth/register"
              className="px-8 py-4 bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 rounded-lg font-bold text-white shadow-lg shadow-cyan-500/20 transition-all transform hover:scale-105 flex items-center justify-center gap-2"
            >
              Get Started Free <ArrowRight size={20} />
            </Link>
            <Link
              to="/docs"
              className="px-8 py-4 bg-gray-900 border border-gray-700 hover:border-gray-500 rounded-lg font-bold text-gray-300 hover:text-white transition-all flex items-center justify-center gap-2"
            >
              Documentation
            </Link>
          </div>

          <div className="pt-8 flex items-center justify-center lg:justify-start gap-8 text-gray-500 text-sm">
            <span className="flex items-center gap-2"><CheckCircle size={16} className="text-cyan-500"/> Open Source</span>
            <span className="flex items-center gap-2"><CheckCircle size={16} className="text-cyan-500"/> Privacy First</span>
            <span className="flex items-center gap-2"><CheckCircle size={16} className="text-cyan-500"/> No Agent Bloat</span>
          </div>
        </div>

        {/* Right Content: The "Orbit" Animation */}
        <div className="flex-1 relative w-full max-w-[600px] aspect-square flex items-center justify-center">

          {/* Central Core (Pulsing Globe) */}
          <div className="absolute z-20 bg-gradient-to-br from-cyan-500 to-blue-700 w-32 h-32 rounded-full flex items-center justify-center shadow-[0_0_60px_rgba(6,182,212,0.6)] animate-pulse-slow">
            <Shield size={64} className="text-white drop-shadow-md" />
          </div>

          {/* Inner Ring (Orbiting CW) */}
          <div className="absolute border border-cyan-800/30 w-64 h-64 rounded-full animate-orbit-cw">
            {/* Planet 1: Brain (AI) */}
            <div className="absolute -top-6 left-1/2 -translate-x-1/2 bg-gray-900 p-3 rounded-full border border-cyan-500/50 shadow-lg counter-rotate">
              <Brain size={24} className="text-purple-400" />
            </div>
            {/* Planet 2: Activity (Monitoring) */}
            <div className="absolute -bottom-6 left-1/2 -translate-x-1/2 bg-gray-900 p-3 rounded-full border border-cyan-500/50 shadow-lg counter-rotate">
              <Activity size={24} className="text-green-400" />
            </div>
          </div>

          {/* Outer Ring (Orbiting CCW) */}
          <div className="absolute border border-blue-800/20 w-96 h-96 rounded-full animate-orbit-ccw">
            {/* Planet 3: Cloud */}
            <div className="absolute top-1/2 -right-6 -translate-y-1/2 bg-gray-900 p-4 rounded-full border border-blue-500/50 shadow-lg counter-rotate-slow">
              <Cloud size={28} className="text-blue-400" />
            </div>
            {/* Planet 4: Lock (Security) */}
            <div className="absolute top-1/2 -left-6 -translate-y-1/2 bg-gray-900 p-4 rounded-full border border-blue-500/50 shadow-lg counter-rotate-slow">
              <Lock size={28} className="text-red-400" />
            </div>
            {/* Planet 5: Server (Infra) - Top Left ish */}
            <div className="absolute top-[15%] left-[15%] bg-gray-900 p-3 rounded-full border border-blue-500/50 shadow-lg counter-rotate-slow">
              <Server size={24} className="text-orange-400" />
            </div>
          </div>

          {/* Decorative Glows behind everything */}
          <div className="absolute inset-0 bg-cyan-500/10 blur-[100px] rounded-full z-0" />
        </div>
      </section>

      {/* --- FEATURES BENTO GRID --- */}
      <section className="py-24 bg-gray-950/50 relative z-10">
        <div className="container mx-auto px-6">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <h2 className="text-cyan-400 font-semibold tracking-wide uppercase text-sm mb-3">Capabilities</h2>
            <h3 className="text-3xl lg:text-4xl font-bold text-white mb-4">Complete Visibility. Total Control.</h3>
            <p className="text-gray-400">NexDefend unifies disjointed security tools into one cohesive platform powered by cognitive intelligence.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">

            {/* Feature 1: AI Analysis */}
            <div className="glass-panel p-8 rounded-2xl hover:border-cyan-500/50 transition-colors group">
              <div className="bg-purple-500/10 w-12 h-12 rounded-lg flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                <Brain className="text-purple-400" size={24} />
              </div>
              <h4 className="text-xl font-bold text-white mb-2">Cognitive AI Core</h4>
              <p className="text-gray-400 text-sm leading-relaxed">
                "Sentinel" GenAI analyzes logs, explains alerts in plain English, and forecasts resource exhaustion 24 hours in advance.
              </p>
            </div>

            {/* Feature 2: Threat Detection */}
            <div className="glass-panel p-8 rounded-2xl hover:border-cyan-500/50 transition-colors group">
              <div className="bg-red-500/10 w-12 h-12 rounded-lg flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                <Activity className="text-red-400" size={24} />
              </div>
              <h4 className="text-xl font-bold text-white mb-2">Real-Time Threat Detection</h4>
              <p className="text-gray-400 text-sm leading-relaxed">
                Powered by Isolation Forest ML. Detects SSH brute force, malware beacons, and anomalous data exfiltration instantly.
              </p>
            </div>

            {/* Feature 3: Automated SOAR */}
            <div className="glass-panel p-8 rounded-2xl hover:border-cyan-500/50 transition-colors group">
              <div className="bg-green-500/10 w-12 h-12 rounded-lg flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                <Zap className="text-green-400" size={24} />
              </div>
              <h4 className="text-xl font-bold text-white mb-2">Automated Response (SOAR)</h4>
              <p className="text-gray-400 text-sm leading-relaxed">
                Don't just watch—act. Auto-block IPs via Firewall, isolate compromised hosts, and execute remediation playbooks.
              </p>
            </div>

            {/* Feature 4: Cloud & K8s (Span 2 cols) */}
            <div className="glass-panel p-8 rounded-2xl md:col-span-2 hover:border-cyan-500/50 transition-colors group flex flex-col md:flex-row gap-6 items-start">
              <div className="bg-blue-500/10 w-12 h-12 rounded-lg flex-shrink-0 flex items-center justify-center group-hover:scale-110 transition-transform">
                <Cloud className="text-blue-400" size={24} />
              </div>
              <div>
                <h4 className="text-xl font-bold text-white mb-2">Hybrid Cloud & Kubernetes</h4>
                <p className="text-gray-400 text-sm leading-relaxed mb-4">
                  Native integration with AWS, Azure, and Kubernetes. Monitor pod health, cloud posture, and container vulnerabilities in a single pane of glass.
                </p>
                <div className="flex gap-2">
                  <span className="px-2 py-1 bg-gray-800 rounded text-xs text-gray-300 border border-gray-700">AWS EC2</span>
                  <span className="px-2 py-1 bg-gray-800 rounded text-xs text-gray-300 border border-gray-700">K8s Pods</span>
                  <span className="px-2 py-1 bg-gray-800 rounded text-xs text-gray-300 border border-gray-700">Docker</span>
                </div>
              </div>
            </div>

            {/* Feature 5: Search */}
            <div className="glass-panel p-8 rounded-2xl hover:border-cyan-500/50 transition-colors group">
              <div className="bg-orange-500/10 w-12 h-12 rounded-lg flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                <Search className="text-orange-400" size={24} />
              </div>
              <h4 className="text-xl font-bold text-white mb-2">Deep Search</h4>
              <p className="text-gray-400 text-sm leading-relaxed">
                Query terabytes of logs in milliseconds using ZincSearch/OpenSearch integration.
              </p>
            </div>

          </div>
        </div>
      </section>

      {/* --- FOOTER --- */}
      <footer className="border-t border-gray-800 bg-gray-950 pt-16 pb-8">
        <div className="container mx-auto px-6 flex flex-col md:flex-row justify-between items-center gap-6">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-gradient-to-br from-cyan-500 to-blue-600 rounded flex items-center justify-center text-white font-bold">
              N
            </div>
            <span className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-white to-gray-400">
              NexDefend
            </span>
          </div>
          <div className="text-gray-500 text-sm">
            © 2026 NexDefend Open Source. Licensed under MIT.
          </div>
          <div className="flex gap-6 text-gray-400">
            <a href="#" className="hover:text-cyan-400 transition-colors">GitHub</a>
            <a href="#" className="hover:text-cyan-400 transition-colors">Docs</a>
            <a href="#" className="hover:text-cyan-400 transition-colors">Twitter</a>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default HomePage;
