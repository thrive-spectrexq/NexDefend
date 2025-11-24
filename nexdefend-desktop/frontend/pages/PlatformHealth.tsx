import EmbeddedGrafanaPanel from '../components/dashboard/EmbeddedGrafanaPanel';

const PlatformHealth = () => {
  return (
    <div>
      <h1 className="text-3xl font-bold mb-6">Platform Health</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <div className="h-96">
          <EmbeddedGrafanaPanel panelUrl="http://localhost:3001/d-solo/null/cadvisor-container-overview?orgId=1&panelId=2" />
        </div>
        <div className="h-96">
          <EmbeddedGrafanaPanel panelUrl="http://localhost:3001/d-solo/null/cadvisor-container-overview?orgId=1&panelId=4" />
        </div>
      </div>
    </div>
  );
};

export default PlatformHealth;
