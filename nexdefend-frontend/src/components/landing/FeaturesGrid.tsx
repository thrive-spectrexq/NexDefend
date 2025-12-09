import { Shield, Search, Terminal, Cloud, CheckCircle } from 'lucide-react';
import './FeaturesGrid.css';

const features = [
  {
    title: 'Endpoint Security',
    items: ['Configuration Assessment', 'Malware Detection', 'File Integrity Monitoring'],
    color: 'var(--color-brand-blue)',
    icon: Shield,
  },
  {
    title: 'Threat Intelligence',
    items: ['Threat Hunting', 'Log Data Analysis', 'Vulnerability Detection'],
    color: 'var(--color-brand-red)',
    icon: Search,
  },
  {
    title: 'Security Operations',
    items: ['Incident Response', 'Regulatory Compliance', 'IT Hygiene'],
    color: 'var(--color-brand-green)',
    icon: Terminal,
  },
  {
    title: 'Cloud Security',
    items: ['Container Security', 'Posture Management', 'Workload Protection'],
    color: 'var(--color-brand-purple)', // Assuming purple or orange
    icon: Cloud,
  },
];

const FeaturesGrid = () => {
  return (
    <section className="features-section py-24 bg-surface" aria-labelledby="features-heading">
      <div className="container mx-auto px-6 max-w-7xl">
        <div className="text-center mb-16 space-y-4">
            <h2 id="features-heading" className="text-3xl md:text-4xl font-bold text-white tracking-tight">
                Endpoint and Cloud Workload Protection
            </h2>
            <p className="text-lg text-text-muted max-w-2xl mx-auto">
            NexDefend unifies historically separate functions into a single agent and platform architecture.
            Protection is provided for public clouds, private clouds, and on-premise data centers.
            </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8" role="list" aria-label="Product features">
          {features.map((f, idx) => (
            <article
              key={f.title}
              className="group relative bg-background border border-surface-highlight p-6 rounded-2xl hover:border-brand-blue/30 transition-all hover:-translate-y-1 hover:shadow-xl overflow-hidden"
              role="listitem"
              tabIndex={0}
              aria-labelledby={`feature-${idx}-title`}
            >
              <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity pointer-events-none">
                  <f.icon size={120} />
              </div>

              <div className="relative z-10 flex flex-col h-full">
                <div
                    className="w-12 h-12 rounded-lg flex items-center justify-center mb-6 transition-transform group-hover:scale-110"
                    style={{ backgroundColor: `${f.color}20`, color: f.color }}
                >
                    <f.icon size={24} />
                </div>

                <h3 id={`feature-${idx}-title`} className="text-xl font-bold text-white mb-4">{f.title}</h3>

                <ul className="space-y-3 mt-auto">
                  {f.items.map((it) => (
                    <li key={it} className="flex items-start gap-2 text-sm text-text-muted group-hover:text-text transition-colors">
                        <CheckCircle size={16} className="text-brand-green mt-0.5 shrink-0" />
                        <span>{it}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
};

export default FeaturesGrid;
