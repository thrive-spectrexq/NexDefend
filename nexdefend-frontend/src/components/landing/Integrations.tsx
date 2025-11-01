import './Integrations.css';
import suricataLogo from '../../assets/logos/suricata.png';
import goLogo from '../../assets/logos/go.png';
import pythonLogo from '../../assets/logos/python.png';
import postgresqlLogo from '../../assets/logos/postgresql.png';
import dockerLogo from '../../assets/logos/docker.svg';
import grafanaLogo from '../../assets/logos/grafana.svg';
import prometheusLogo from '../../assets/logos/prometheus.svg';

const integrations = [
  { name: 'Suricata', logo: suricataLogo },
  { name: 'Go', logo: goLogo },
  { name: 'Python', logo: pythonLogo },
  { name: 'PostgreSQL', logo: postgresqlLogo },
  { name: 'Docker', logo: dockerLogo },
  { name: 'Grafana', logo: grafanaLogo },
  { name: 'Prometheus', logo: prometheusLogo },
];

const Integrations = () => {
  return (
    <section className="integrations-section py-20">
      <div className="container mx-auto">
        <h2 className="text-4xl font-bold text-center mb-12">Integrations & Tech Stack</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-8">
          {integrations.map((integration, index) => (
            <div key={index} className="integration-card flex justify-center items-center">
              <img src={integration.logo} alt={integration.name} className="h-24" />
            </div>
          ))}
        </div>
        <p className="text-center mt-8">
          Built on proven technologies — Go for ingestion, Python for AI, PostgreSQL for data, and Grafana for visualization.
        </p>
      </div>
    </section>
  );
};

export default Integrations;
