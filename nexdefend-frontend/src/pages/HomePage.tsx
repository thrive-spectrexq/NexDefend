import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  Shield, ArrowRight, Cpu, Activity, Cloud, Zap, 
  ChevronRight
} from 'lucide-react';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';

// --- ANIMATION VARIANTS ---
const containerVariants = {
  hidden: { opacity: 0 },
  visible: { 
    opacity: 1,
    transition: { staggerChildren: 0.1 }
  }
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5 } }
};

const HomePage = () => {
  return (
    <div className="min-h-screen bg-[#0f172a] text-white overflow-x-hidden font-sans selection:bg-cyan-500/30">
      
      {/* --- BACKGROUND FX --- */}
      <div className="fixed inset-0 pointer-events-none">
        {/* Grid lines removed here */}
        <div className="absolute left-0 right-0 top-0 -z-10 m-auto h-[310px] w-[310px] rounded-full bg-cyan-500 opacity-20 blur-[100px]"></div>
        <div className="absolute right-0 bottom-0 -z-10 h-[400px] w-[400px] rounded-full bg-purple-500 opacity-10 blur-[120px]"></div>
      </div>

      <Navbar />

      {/* --- HERO SECTION --- */}
      <section className="relative pt-32 pb-20 lg:pt-48 lg:pb-32 px-6">
        <div className="container mx-auto text-center max-w-5xl relative z-10">
          
          <motion.div 
            initial={{ opacity: 0, scale: 0.9 }} 
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5 }}
            className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-cyan-500/30 bg-cyan-500/10 text-cyan-400 text-sm font-medium mb-8"
          >
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-cyan-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-cyan-500"></span>
            </span>
            NexDefend v2.0 is now live
          </motion.div>

          <motion.h1 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="text-5xl md:text-7xl lg:text-8xl font-bold tracking-tight mb-8 leading-[1.1]"
          >
            NextGen AI-Powered <br />
            <span className="bg-clip-text text-transparent bg-gradient-to-r from-cyan-400 via-blue-500 to-purple-600 animate-gradient bg-300%">
              Threat Intelligence
            </span>
          </motion.h1>

          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.4 }}
            className="text-xl md:text-2xl text-slate-400 mb-12 max-w-3xl mx-auto leading-relaxed"
          >
            Secure your digital frontier with deep visibility, automated defense, and predictive intelligence. The next generation of SOC is here.
          </motion.p>

          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.6 }}
            className="flex flex-col sm:flex-row items-center justify-center gap-4"
          >
            <Link 
              to="/register" 
              className="w-full sm:w-auto px-8 py-4 bg-white text-[#0f172a] hover:bg-slate-200 rounded-xl font-bold text-lg flex items-center justify-center gap-2 transition-transform hover:-translate-y-1 shadow-[0_0_20px_rgba(255,255,255,0.3)]"
            >
              Get Started <ArrowRight className="h-5 w-5" />
            </Link>
            <Link 
              to="/login" 
              className="w-full sm:w-auto px-8 py-4 bg-slate-800/50 border border-slate-700 hover:border-cyan-500/50 text-white rounded-xl font-bold text-lg backdrop-blur-sm transition-all hover:bg-slate-800"
            >
              Live Demo
            </Link>
          </motion.div>
        </div>
      </section>

      {/* --- STATS STRIP --- */}
      <div className="border-y border-white/5 bg-slate-900/50 backdrop-blur-sm">
        <div className="container mx-auto px-6 py-12">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
            {[
              { label: 'Endpoints Secured', value: '10k+' },
              { label: 'Threats Blocked', value: '1.2M' },
              { label: 'Uptime', value: '99.9%' },
              { label: 'AI Models', value: '12' },
            ].map((stat, i) => (
              <div key={i}>
                <div className="text-3xl md:text-4xl font-bold text-white mb-2">{stat.value}</div>
                <div className="text-sm text-slate-500 uppercase tracking-wider font-semibold">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* --- FEATURES GRID --- */}
      <section className="py-24 px-6 relative z-10">
        <div className="container mx-auto">
          <div className="text-center mb-20">
            <h2 className="text-3xl md:text-5xl font-bold mb-6">Complete <span className="text-cyan-400">Observability</span> & Defense</h2>
            <p className="text-slate-400 text-lg max-w-2xl mx-auto">
              NexDefend unifies monitoring, security, and automation into a single glass pane.
            </p>
          </div>

          <motion.div 
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-100px" }}
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
          >
            {/* System Monitoring */}
            <FeatureCard 
              icon={<Activity size={32} className="text-blue-400" />}
              title="System Monitoring"
              description="Real-time resource tracking and deep process inspection across all endpoints."
              color="blue"
              features={["CPU, RAM, Disk & Network", "Process Anomaly Detection", "File Integrity Monitoring (FIM)"]}
            />

            {/* Threat Intelligence */}
            <FeatureCard 
              icon={<Shield size={32} className="text-red-400" />}
              title="Threat Intelligence"
              description="AI-driven security analysis to detect and neutralize threats before they escalate."
              color="red"
              features={["Isolation Forest Anomaly AI", "Automated CVE/Vuln Scanning", "Real-time Threat Hunting"]}
            />

            {/* Auto Remediation */}
            <FeatureCard 
              icon={<Zap size={32} className="text-yellow-400" />}
              title="Auto Remediation"
              description="Self-healing infrastructure with automated incident response workflows."
              color="yellow"
              features={["Automated Incident Creation", "Compliance Checks (SSH/Firewall)", "Dynamic Resource Scaling"]}
            />

            {/* Cloud Monitoring */}
            <FeatureCard 
              icon={<Cloud size={32} className="text-purple-400" />}
              title="Cloud Native"
              description="Seamless integration with modern cloud stacks including Docker and Kubernetes."
              color="purple"
              features={["K8s & Docker Metrics", "Cloud Posture Assessment", "Distributed Health Checks"]}
            />

            {/* Cognitive AI */}
            <FeatureCard 
              icon={<Cpu size={32} className="text-cyan-400" />}
              title="Cognitive AI"
              description="GenAI Copilot and predictive modeling for next-level operations."
              color="cyan"
              features={["Sentinel Copilot (Ollama/Mistral)", "24h Usage Forecasting", "Natural Language Querying"]}
              colSpan="lg:col-span-2"
            />
          </motion.div>
        </div>
      </section>

      {/* --- AI HIGHLIGHT SECTION --- */}
      <section className="py-24 bg-gradient-to-b from-slate-900 to-[#0f172a] border-t border-white/5 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-1/2 h-full bg-cyan-500/5 blur-[100px] pointer-events-none" />
        
        <div className="container mx-auto px-6">
          <div className="flex flex-col lg:flex-row items-center gap-16">
            <div className="lg:w-1/2">
              <div className="inline-block px-4 py-2 rounded-lg bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 font-mono mb-6">
                &gt; initiation_sequence: sentinel_ai
              </div>
              <h2 className="text-4xl md:text-5xl font-bold mb-6 leading-tight">
                Meet <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-blue-500">Sentinel</span>, <br />
                Your AI Security Analyst.
              </h2>
              <p className="text-slate-400 text-lg mb-8 leading-relaxed">
                Stop sifting through logs. Sentinel uses GenAI to understand your infrastructure in plain English. Ask questions, get insights, and predict failures before they happen.
              </p>
              
              <ul className="space-y-4 mb-10">
                {[
                  "Natural Language Threat Queries",
                  "Predictive Resource Exhaustion Alerts",
                  "Automated Root Cause Analysis"
                ].map((item, i) => (
                  <li key={i} className="flex items-center gap-3 text-slate-300">
                    <div className="h-2 w-2 rounded-full bg-cyan-400 shadow-[0_0_10px_rgba(34,211,238,0.5)]" />
                    {item}
                  </li>
                ))}
              </ul>

              <button className="px-8 py-4 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 text-white font-semibold transition-all flex items-center gap-2 group">
                Explore AI Features <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </button>
            </div>

            <div className="lg:w-1/2 w-full">
              <div className="relative rounded-2xl bg-[#0B1120] border border-slate-700/50 p-6 shadow-2xl">
                {/* Mock Chat Interface */}
                <div className="flex items-center gap-3 border-b border-slate-800 pb-4 mb-4">
                  <div className="w-3 h-3 rounded-full bg-red-500" />
                  <div className="w-3 h-3 rounded-full bg-yellow-500" />
                  <div className="w-3 h-3 rounded-full bg-green-500" />
                  <span className="ml-2 text-xs text-slate-500 font-mono">sentinel_core.exe</span>
                </div>
                
                <div className="space-y-4 font-mono text-sm">
                  <div className="flex gap-4">
                    <div className="w-8 h-8 rounded bg-cyan-900/50 flex items-center justify-center text-cyan-400 shrink-0">AI</div>
                    <div className="text-cyan-100">System scan complete. Anomaly detected in process ID 4592 (suspicious outbound traffic).</div>
                  </div>
                  <div className="flex gap-4">
                    <div className="w-8 h-8 rounded bg-slate-700 flex items-center justify-center text-slate-300 shrink-0">User</div>
                    <div className="text-slate-300">Isolate the affected host and generate a report.</div>
                  </div>
                  <div className="flex gap-4">
                    <div className="w-8 h-8 rounded bg-cyan-900/50 flex items-center justify-center text-cyan-400 shrink-0">AI</div>
                    <div className="text-cyan-100">
                      <span className="text-green-400">✓ Host 192.168.1.45 quarantined.</span><br/>
                      Generating incident report #INC-2024-889...<br/>
                      <span className="animate-pulse">_</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* --- CTA SECTION --- */}
      <section className="py-20 px-6">
        <div className="container mx-auto">
          <div className="rounded-3xl bg-gradient-to-r from-cyan-900/20 to-blue-900/20 border border-cyan-500/20 p-12 md:p-24 text-center relative overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(circle_at_50%_50%,rgba(6,182,212,0.1),transparent_70%)]" />
            
            <h2 className="text-4xl md:text-5xl font-bold mb-8 relative z-10">Ready to secure your infrastructure?</h2>
            <p className="text-xl text-slate-400 mb-10 max-w-2xl mx-auto relative z-10">
              Join thousands of developers and security engineers using NexDefend to stay ahead of threats.
            </p>
            
            <div className="relative z-10 flex flex-col sm:flex-row justify-center gap-4">
              <Link 
                to="/register" 
                className="px-8 py-4 bg-cyan-500 hover:bg-cyan-400 text-[#0f172a] font-bold rounded-xl shadow-[0_0_30px_rgba(6,182,212,0.4)] transition-all transform hover:scale-105"
              >
                Start Free Trial
              </Link>
              <Link 
                to="/contact" 
                className="px-8 py-4 bg-[#0f172a] border border-slate-700 hover:border-cyan-500 text-white font-bold rounded-xl transition-all"
              >
                Contact Sales
              </Link>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

// --- SUB-COMPONENTS ---

const FeatureCard = ({ icon, title, description, color, features, colSpan = "" }: any) => {
  const colorClasses: any = {
    blue: "group-hover:border-blue-500/50 hover:shadow-[0_0_30px_rgba(59,130,246,0.15)]",
    red: "group-hover:border-red-500/50 hover:shadow-[0_0_30px_rgba(239,68,68,0.15)]",
    yellow: "group-hover:border-yellow-500/50 hover:shadow-[0_0_30px_rgba(234,179,8,0.15)]",
    purple: "group-hover:border-purple-500/50 hover:shadow-[0_0_30px_rgba(168,85,247,0.15)]",
    cyan: "group-hover:border-cyan-500/50 hover:shadow-[0_0_30px_rgba(6,182,212,0.15)]",
  };

  return (
    <motion.div 
      variants={itemVariants}
      className={`group relative p-8 rounded-2xl bg-slate-900/40 border border-white/5 backdrop-blur-sm transition-all duration-300 ${colSpan} ${colorClasses[color]}`}
    >
      <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-white/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
      
      <div className="relative z-10">
        <div className={`w-14 h-14 rounded-xl flex items-center justify-center mb-6 bg-${color}-500/10 border border-${color}-500/20`}>
          {icon}
        </div>
        
        <h3 className="text-2xl font-bold mb-3 text-white group-hover:text-cyan-200 transition-colors">{title}</h3>
        <p className="text-slate-400 mb-6 leading-relaxed">{description}</p>
        
        <ul className="space-y-3">
          {features.map((feature: string, i: number) => (
            <li key={i} className="flex items-start gap-2 text-sm text-slate-300">
              <span className={`mt-1 h-1.5 w-1.5 rounded-full bg-${color}-400 shadow-[0_0_5px_currentColor]`} />
              {feature}
            </li>
          ))}
        </ul>
      </div>
    </motion.div>
  );
};

export default HomePage;
