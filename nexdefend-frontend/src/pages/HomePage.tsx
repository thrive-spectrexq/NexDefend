import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  Shield, ArrowRight, Lock, Globe, Cpu, 
  Activity, Cloud, Zap, AlertTriangle, FileCheck
} from 'lucide-react';
import { GlassCard } from '../components/ui/GlassCard';

// Animation variants for the "Circle Motion Graphics"
const circleVariants = {
  animate: {
    rotate: 360,
    transition: {
      duration: 20,
      repeat: Infinity,
      ease: "linear"
    }
  }
};

const reverseCircleVariants = {
  animate: {
    rotate: -360,
    transition: {
      duration: 15,
      repeat: Infinity,
      ease: "linear"
    }
  }
};

const HomePage = () => {
  return (
    <div className="min-h-screen bg-[#0f172a] text-white overflow-hidden relative selection:bg-cyan-500/30 font-sans">
      
      {/* --- CIRCLE MOTION GRAPHICS (BACKGROUND) --- */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none flex items-center justify-center">
        {/* Outer Ring */}
        <motion.div 
          variants={circleVariants}
          animate="animate"
          className="absolute w-[800px] h-[800px] rounded-full border border-cyan-500/10 border-dashed"
        />
        {/* Middle Ring */}
        <motion.div 
          variants={reverseCircleVariants}
          animate="animate"
          className="absolute w-[600px] h-[600px] rounded-full border border-blue-500/10 border-dotted"
        />
        {/* Inner Ring */}
        <motion.div 
          variants={circleVariants}
          animate="animate"
          className="absolute w-[400px] h-[400px] rounded-full border-2 border-cyan-500/5"
        />
        {/* Glowing Core */}
        <div className="absolute w-[200px] h-[200px] bg-cyan-500/10 blur-[80px] rounded-full animate-pulse" />
      </div>

      {/* --- NAVIGATION --- */}
      <nav className="relative z-10 container mx-auto px-6 h-24 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="relative">
            <Shield className="h-8 w-8 text-cyan-400" />
            <div className="absolute inset-0 bg-cyan-400 blur-lg opacity-40" />
          </div>
          <span className="text-2xl font-mono font-bold tracking-widest text-transparent bg-clip-text bg-gradient-to-r from-white to-gray-400">
            NEXDEFEND
          </span>
        </div>
        <div className="flex items-center gap-6">
          <Link to="/login" className="text-gray-400 hover:text-cyan-400 font-mono text-sm transition-colors tracking-wide">
            // CONSOLE LOGIN
          </Link>
          <Link to="/register" className="group relative px-6 py-2 bg-cyan-500/10 border border-cyan-500/50 rounded text-cyan-400 font-mono text-sm font-bold overflow-hidden hover:bg-cyan-500/20 transition-all">
            <span className="relative z-10 group-hover:text-white transition-colors">INITIALIZE ></span>
            <div className="absolute inset-0 bg-cyan-500/20 transform -translate-x-full group-hover:translate-x-0 transition-transform duration-300" />
          </Link>
        </div>
      </nav>

      {/* --- HERO SECTION --- */}
      <main className="relative z-10 container mx-auto px-6 pt-20 pb-32">
        <div className="text-center max-w-4xl mx-auto mb-24">
          <motion.div 
            initial={{ opacity: 0, y: 20 }} 
            animate={{ opacity: 1, y: 0 }} 
            transition={{ duration: 0.8 }}
          >
            <h1 className="text-5xl md:text-7xl font-bold mb-8 tracking-tight leading-tight">
              AI-Powered <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-blue-500 to-purple-600 animate-gradient">
                Threat Intelligence
              </span>
            </h1>
            
            <p className="text-xl text-gray-400 mb-10 leading-relaxed max-w-2xl mx-auto">
              NexDefend provides deep visibility, automated defense, and predictive intelligence for modern enterprises.
            </p>

            <div className="flex flex-col md:flex-row items-center justify-center gap-6">
              <Link to="/register" className="w-full md:w-auto px-8 py-4 bg-cyan-600 hover:bg-cyan-500 text-white rounded-lg font-bold text-lg flex items-center justify-center gap-2 shadow-[0_0_20px_rgba(8,145,178,0.4)] transition-all hover:scale-105">
                Deploy Sentinel Agent <ArrowRight className="h-5 w-5" />
              </Link>
              <Link to="/login" className="w-full md:w-auto px-8 py-4 bg-surface/50 border border-white/10 hover:border-cyan-500/50 rounded-lg font-bold text-lg text-gray-300 hover:text-white transition-all backdrop-blur-md">
                View Live Demo
              </Link>
            </div>
          </motion.div>
        </div>

        {/* --- FEATURES GRID --- */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          
          {/* System Monitoring */}
          <GlassCard className="col-span-1 lg:col-span-2 group hover:border-cyan-500/30">
            <div className="flex items-start gap-4">
              <div className="p-3 rounded-lg bg-blue-500/10 text-blue-400 group-hover:text-blue-300 transition-colors">
                <Activity size={32} />
              </div>
              <div>
                <h3 className="text-xl font-bold text-white mb-2">System Monitoring</h3>
                <ul className="space-y-3 text-gray-400 text-sm">
                  <li className="flex items-start gap-2">
                    <span className="text-blue-500 mt-1">▹</span>
                    <span><strong>Resource Tracking:</strong> Real-time CPU, Memory, Disk, and Network monitoring across all endpoints.</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-blue-500 mt-1">▹</span>
                    <span><strong>Process Inspection:</strong> Deep inspection to detect anomalies and unauthorized execution.</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-blue-500 mt-1">▹</span>
                    <span><strong>FIM:</strong> Real-time tracking of changes to critical system files.</span>
                  </li>
                </ul>
              </div>
            </div>
          </GlassCard>

          {/* Threat Intelligence */}
          <GlassCard className="group hover:border-red-500/30">
            <div className="flex items-start gap-4">
              <div className="p-3 rounded-lg bg-red-500/10 text-red-400 group-hover:text-red-300 transition-colors">
                <Shield size={32} />
              </div>
              <div>
                <h3 className="text-xl font-bold text-white mb-2">Threat Intel</h3>
                <ul className="space-y-3 text-gray-400 text-sm">
                  <li className="flex items-start gap-2">
                    <span className="text-red-500 mt-1">▹</span>
                    <span><strong>AI Analysis:</strong> Anomaly detection using Isolation Forest & real-time scoring.</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-red-500 mt-1">▹</span>
                    <span><strong>Vulnerability Scan:</strong> Automated Nmap & Trivy scanning for CVEs.</span>
                  </li>
                </ul>
              </div>
            </div>
          </GlassCard>

          {/* Automated Remediation */}
          <GlassCard className="group hover:border-green-500/30">
            <div className="flex items-start gap-4">
              <div className="p-3 rounded-lg bg-green-500/10 text-green-400 group-hover:text-green-300 transition-colors">
                <Zap size={32} />
              </div>
              <div>
                <h3 className="text-xl font-bold text-white mb-2">Auto Remediation</h3>
                <ul className="space-y-3 text-gray-400 text-sm">
                  <li className="flex items-start gap-2">
                    <span className="text-green-500 mt-1">▹</span>
                    <span><strong>Incident Response:</strong> Automated workflow for creation & assignment.</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-green-500 mt-1">▹</span>
                    <span><strong>IT Hygiene:</strong> Compliance checks for SSH & Firewall configs.</span>
                  </li>
                </ul>
              </div>
            </div>
          </GlassCard>

          {/* Cloud Monitoring */}
          <GlassCard className="group hover:border-purple-500/30">
            <div className="flex items-start gap-4">
              <div className="p-3 rounded-lg bg-purple-500/10 text-purple-400 group-hover:text-purple-300 transition-colors">
                <Cloud size={32} />
              </div>
              <div>
                <h3 className="text-xl font-bold text-white mb-2">Cloud Monitor</h3>
                <ul className="space-y-3 text-gray-400 text-sm">
                  <li className="flex items-start gap-2">
                    <span className="text-purple-500 mt-1">▹</span>
                    <span><strong>Container Metrics:</strong> Native Docker & K8s workload integration.</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-purple-500 mt-1">▹</span>
                    <span><strong>Cloud Posture:</strong> Security config assessment for cloud infrastructure.</span>
                  </li>
                </ul>
              </div>
            </div>
          </GlassCard>

          {/* Cognitive Intelligence */}
          <GlassCard className="lg:col-span-1 border-cyan-500/20 bg-cyan-900/10">
            <div className="flex items-start gap-4">
              <div className="p-3 rounded-lg bg-cyan-500/10 text-cyan-400 animate-pulse">
                <Cpu size={32} />
              </div>
              <div>
                <h3 className="text-xl font-bold text-white mb-2">Cognitive AI</h3>
                <ul className="space-y-3 text-gray-400 text-sm">
                  <li className="flex items-start gap-2">
                    <span className="text-cyan-500 mt-1">▹</span>
                    <span><strong>Sentinel Copilot:</strong> Context-aware AI assistant (Ollama/Mistral).</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-cyan-500 mt-1">▹</span>
                    <span><strong>Predictive Forecasting:</strong> Linear regression for 24h usage trends.</span>
                  </li>
                </ul>
              </div>
            </div>
          </GlassCard>

        </div>
      </main>
    </div>
  );
};

export default HomePage;
