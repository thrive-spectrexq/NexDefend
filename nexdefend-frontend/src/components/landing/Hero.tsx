import React from 'react';
import { Link } from 'react-router-dom';
import { Shield, Lock, ChevronRight, Activity } from 'lucide-react';
import './Hero.css';

const Hero: React.FC = () => {
  return (
    <section className="hero relative overflow-hidden" aria-label="Hero section">
      {/* Background Effects */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-brand-blue/10 via-background to-background pointer-events-none" />
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-7xl h-full pointer-events-none">
          <div className="absolute top-20 right-10 w-96 h-96 bg-brand-blue/20 rounded-full blur-3xl opacity-20 animate-pulse" />
          <div className="absolute bottom-20 left-10 w-72 h-72 bg-brand-purple/20 rounded-full blur-3xl opacity-20 animate-pulse delay-1000" />
      </div>

      <div className="hero-container relative z-10">
        <div className="hero-left space-y-8">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-brand-blue/10 border border-brand-blue/20 text-brand-blue text-sm font-medium animate-in fade-in slide-in-from-bottom-4 duration-700">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-brand-blue opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-brand-blue"></span>
            </span>
            Next-Gen XDR Platform
          </div>

          <h1 className="hero-title text-5xl md:text-6xl font-bold tracking-tight text-white animate-in fade-in slide-in-from-bottom-5 duration-700 delay-100">
            Secure Your <span className="text-transparent bg-clip-text bg-gradient-to-r from-brand-blue to-brand-purple">Infrastructure</span> with AI-Driven Defense
          </h1>

          <p className="hero-subtitle text-lg text-text-muted max-w-2xl leading-relaxed animate-in fade-in slide-in-from-bottom-6 duration-700 delay-200">
            NexDefend unifies endpoint security, network detection, and automated response into a single, cyber-tactical console. Detect threats in real-time and respond with surgical precision.
          </p>

          <div className="hero-buttons flex flex-wrap gap-4 animate-in fade-in slide-in-from-bottom-7 duration-700 delay-300">
            <Link
              to="/register"
              className="btn btn-primary group flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-brand-blue to-brand-purple hover:from-brand-blue/90 hover:to-brand-purple/90 text-white rounded-lg font-semibold transition-all hover:scale-105 shadow-[0_0_20px_rgba(56,189,248,0.3)]"
            >
              Get Started Free
              <ChevronRight size={18} className="group-hover:translate-x-1 transition-transform" />
            </Link>
            <a
              href="#features"
              className="btn btn-ghost px-6 py-3 border border-surface-highlight hover:bg-surface-highlight text-text-muted hover:text-white rounded-lg font-semibold transition-colors"
            >
              Explore Features
            </a>
          </div>

          <div className="hero-features pt-8 border-t border-surface-highlight animate-in fade-in slide-in-from-bottom-8 duration-700 delay-400">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                <div className="flex items-center gap-3">
                    <div className="p-2 rounded-lg bg-brand-blue/10 text-brand-blue">
                        <Activity size={20} />
                    </div>
                    <span className="text-sm font-medium text-text-muted">Real-time Analysis</span>
                </div>
                <div className="flex items-center gap-3">
                    <div className="p-2 rounded-lg bg-brand-purple/10 text-brand-purple">
                        <Shield size={20} />
                    </div>
                    <span className="text-sm font-medium text-text-muted">Automated Defense</span>
                </div>
                <div className="flex items-center gap-3">
                    <div className="p-2 rounded-lg bg-brand-green/10 text-brand-green">
                        <Lock size={20} />
                    </div>
                    <span className="text-sm font-medium text-text-muted">Zero Trust Ready</span>
                </div>
            </div>
          </div>
        </div>

        <div className="hero-right hidden lg:flex justify-center items-center animate-in fade-in slide-in-from-right-10 duration-1000 delay-200">
          <div className="relative w-full max-w-md aspect-square">
            {/* Abstract Cyber Viz */}
            <div className="absolute inset-0 bg-gradient-to-tr from-brand-blue/20 to-brand-purple/20 rounded-full blur-3xl" />
            <div className="relative z-10 w-full h-full border border-surface-highlight bg-surface/50 backdrop-blur-xl rounded-2xl shadow-2xl p-6 overflow-hidden">
                <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-brand-blue via-brand-purple to-brand-blue animate-shimmer" style={{ backgroundSize: '200% 100%' }} />

                {/* Mock Interface Elements */}
                <div className="flex justify-between items-center mb-6">
                    <div className="h-2 w-20 bg-surface-highlight rounded animate-pulse" />
                    <div className="flex gap-2">
                        <div className="h-2 w-2 rounded-full bg-red-500/50" />
                        <div className="h-2 w-2 rounded-full bg-yellow-500/50" />
                        <div className="h-2 w-2 rounded-full bg-green-500/50" />
                    </div>
                </div>

                <div className="space-y-4">
                    {[1, 2, 3].map((i) => (
                        <div key={i} className="flex items-center gap-4 p-3 rounded-lg border border-surface-highlight bg-background/50 transform transition-transform hover:scale-102 cursor-default">
                            <div className={`p-2 rounded ${i === 1 ? 'bg-brand-red/20 text-brand-red' : i === 2 ? 'bg-brand-orange/20 text-brand-orange' : 'bg-brand-blue/20 text-brand-blue'}`}>
                                <Shield size={16} />
                            </div>
                            <div className="flex-1 space-y-2">
                                <div className="h-2 w-24 bg-surface-highlight rounded" />
                                <div className="h-1.5 w-full bg-surface-highlight rounded opacity-50" />
                            </div>
                            <div className="text-xs font-mono text-text-muted">
                                {i === 1 ? 'CRITICAL' : i === 2 ? 'HIGH' : 'INFO'}
                            </div>
                        </div>
                    ))}
                </div>

                <div className="mt-6 pt-6 border-t border-surface-highlight">
                    <div className="grid grid-cols-2 gap-4">
                        <div className="bg-surface-highlight/30 p-3 rounded-lg text-center">
                            <div className="text-2xl font-bold text-white mb-1">98.5%</div>
                            <div className="text-xs text-text-muted uppercase">Coverage</div>
                        </div>
                        <div className="bg-surface-highlight/30 p-3 rounded-lg text-center">
                            <div className="text-2xl font-bold text-brand-blue mb-1">0ms</div>
                            <div className="text-xs text-text-muted uppercase">Latency</div>
                        </div>
                    </div>
                </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Hero;
