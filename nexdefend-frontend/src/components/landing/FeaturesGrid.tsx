import { Shield, BrainCircuit, Bot, AreaChart, Bug, FileText } from 'lucide-react';
import './FeaturesGrid.css';

const features = [
  {
    icon: <Shield size={48} />,
    title: 'Real-time Threat Detection',
    description: 'Detect, analyze, and act — within milliseconds.',
  },
  {
    icon: <BrainCircuit size={48} />,
    title: 'AI-Powered Analysis',
    description: 'Leverage machine learning to detect anomalies and predict threats.',
  },
  {
    icon: <Bot size={48} />,
    title: 'Incident Response Automation',
    description: 'When NexDefend detects, it reacts, automating the response process.',
  },
  {
    icon: <AreaChart size={48} />,
    title: 'Dashboards & Visualization',
    description: 'Visualize your security posture with our Grafana dashboards.',
  },
  {
    icon: <Bug size={48} />,
    title: 'Vulnerability Scanning',
    description: 'Identify and remediate vulnerabilities in your infrastructure.',
  },
  {
    icon: <FileText size={48} />,
    title: 'Compliance Reporting',
    description: 'Generate compliance reports to meet industry standards.',
  },
];

const FeaturesGrid = () => {
  return (
    <section className="features-grid-section py-20">
      <div className="container mx-auto">
        <h2 className="text-4xl font-bold text-center mb-12">Key Features</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feature, index) => (
            <div
              key={index}
              className="feature-card bg-gray-800 p-8 rounded-lg text-center animate-fade-in-up"
              style={{ animationDelay: `${index * 0.1}s` }}
            >
              <div className="flex justify-center mb-4">{feature.icon}</div>
              <h3 className="text-2xl font-bold mb-2">{feature.title}</h3>
              <p>{feature.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default FeaturesGrid;
