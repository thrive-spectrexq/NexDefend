import './FeaturesGrid.css';

const features = [
  {
    title: 'Endpoint Security',
    items: ['Configuration Assessment', 'Malware Detection', 'File Integrity Monitoring'],
    color: 'hsl(220 95% 60%)',
    icon: (
      <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false">
        <path d="M12 1 3 5v6c0 5 3.8 10 9 11 5.2-1 9-6 9-11V5l-9-4z" />
      </svg>
    ),
  },
  {
    title: 'Threat Intelligence',
    items: ['Threat Hunting', 'Log Data Analysis', 'Vulnerability Detection'],
    color: 'hsl(10 85% 55%)',
    icon: (
      <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false">
        <path d="M15 3H9v2H5v4H3v8h18V9h-2V5h-4V3zM8 9h8v2H8V9zm0 4h5v2H8v-2z" />
      </svg>
    ),
  },
  {
    title: 'Security Operations',
    items: ['Incident Response', 'Regulatory Compliance', 'IT Hygiene'],
    color: 'hsl(140 60% 45%)',
    icon: (
      <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false">
        <path d="M12 2C6.5 2 2 6.5 2 12s4.5 10 10 10 10-4.5 10-10S17.5 2 12 2zm1 17.9V20h-2v-.1C8.3 19.4 6 16.9 6 14h2c0 2 2.2 4 4 4s4-2 4-4h2c0 2.9-2.3 5.4-5 5.9zM11 7h2v6h-2z" />
      </svg>
    ),
  },
  {
    title: 'Cloud Security',
    items: ['Container Security', 'Posture Management', 'Workload Protection'],
    color: 'hsl(260 70% 60%)',
    icon: (
      <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false">
        <path d="M19.36 10.46A7 7 0 0 0 5.64 9 5.5 5.5 0 0 0 6 20h13a3.5 3.5 0 0 0 .36-9.54z" />
      </svg>
    ),
  },
];

const FeaturesGrid = () => {
  return (
    <section className="features-section" aria-labelledby="features-heading">
      <div className="features-inner">
        <h2 id="features-heading">Endpoint and Cloud Workload Protection</h2>
        <p className="features-lead">
          NexDefend unifies historically separate functions into a single agent and platform architecture.
          Protection is provided for public clouds, private clouds, and on-premise data centers.
        </p>

        <div className="features-grid" role="list" aria-label="Product features">
          {features.map((f) => (
            <article
              key={f.title}
              className="feature-card"
              role="listitem"
              tabIndex={0}
              aria-labelledby={`feature-${f.title.replace(/\s+/g, '-').toLowerCase()}-title`}
              style={{ ['--accent' as any]: f.color }}
            >
              <div className="feature-icon" aria-hidden="true">
                {f.icon}
              </div>
              <div className="feature-content">
                <h3 id={`feature-${f.title.replace(/\s+/g, '-').toLowerCase()}-title`}>{f.title}</h3>
                <ul>
                  {f.items.map((it) => (
                    <li key={it}>{it}</li>
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
