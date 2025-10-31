import React from 'react';
import { Link } from 'react-router-dom';
import { ShieldCheck, Cpu, Siren, LayoutDashboard, ScanSearch, FileText } from 'lucide-react';

const features = [
  {
    icon: <ShieldCheck size={48} className="text-blue-500 mx-auto mb-4" />,
    title: 'Real-time Threat Detection',
    description: 'Ingests and analyzes Suricata logs in real-time to identify threats as they happen.',
  },
  {
    icon: <Cpu size={48} className="text-blue-500 mx-auto mb-4" />,
    title: 'AI-Powered Analysis',
    description: 'Utilizes machine learning to detect anomalies and sophisticated, unknown threats.',
  },
  {
    icon: <Siren size={48} className="text-blue-500 mx-auto mb-4" />,
    title: 'Incident Response',
    description: 'Automated incident reporting and management to streamline your security operations.',
  },
  {
    icon: <LayoutDashboard size={48} className="text-blue-500 mx-auto mb-4" />,
    title: 'Dashboards & Visualization',
    description: 'Rich, intuitive dashboards for visualizing security events and system metrics.',
  },
  {
    icon: <ScanSearch size={48} className="text-blue-500 mx-auto mb-4" />,
    title: 'Vulnerability Scanning',
    description: 'Integrated tools for scanning your infrastructure and managing vulnerabilities.',
  },
  {
    icon: <FileText size={48} className="text-blue-500 mx-auto mb-4" />,
    title: 'Compliance Reporting',
    description: 'Generates detailed compliance reports based on system activity and security events.',
  },
];

const FeatureCard: React.FC<{ icon: React.ReactNode; title: string; description: string }> = ({ icon, title, description }) => {
  return (
    <div className="bg-gray-800 p-6 rounded-lg text-center transform hover:scale-105 transition-transform duration-300">
      {icon}
      <h3 className="text-xl font-bold mb-2">{title}</h3>
      <p className="text-gray-400">{description}</p>
    </div>
  );
};

const Home: React.FC = () => {
  return (
    <div className="bg-gray-900 text-white min-h-screen">
      <header className="container mx-auto px-6 py-6 flex justify-between items-center">
        <h1 className="text-3xl font-bold">NexDefend</h1>
        <nav>
          <Link to="/login" className="text-lg hover:text-gray-300 mr-4">Login</Link>
          <Link to="/register" className="text-lg bg-blue-600 hover:bg-blue-700 px-4 py-2 rounded-md font-semibold">Register</Link>
        </nav>
      </header>

      <main className="container mx-auto px-6 py-20 text-center">
        <div className="bg-gradient-to-b from-gray-900 to-gray-800 rounded-lg py-20 mb-20">
            <h2 className="text-5xl font-extrabold mb-4 tracking-tight">Welcome to NexDefend</h2>
            <p className="text-xl text-gray-300 mb-8 max-w-2xl mx-auto">Your all-in-one platform for real-time system monitoring, AI-powered threat detection, and automated incident response.</p>
            <Link to="/register" className="text-lg bg-blue-600 hover:bg-blue-700 px-8 py-4 rounded-full font-bold transition-transform transform hover:scale-105">Get Started</Link>
        </div>

        <section id="features">
            <h2 className="text-4xl font-bold mb-12">Key Features</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {features.map((feature, index) => (
                    <FeatureCard key={index} icon={feature.icon} title={feature.title} description={feature.description} />
                ))}
            </div>
        </section>
      </main>

      <footer className="text-center py-8 mt-20 border-t border-gray-800">
        <p>&copy; 2024 NexDefend. All rights reserved.</p>
      </footer>
    </div>
  );
};

export default Home;
