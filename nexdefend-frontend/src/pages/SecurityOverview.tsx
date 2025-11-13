import EmbeddedGrafanaPanel from '../components/dashboard/EmbeddedGrafanaPanel';

const SecurityOverview = () => {
  return (
    <div>
      <h1 className="text-3xl font-bold mb-6">Security Overview</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <div className="h-96">
          <EmbeddedGrafanaPanel panelUrl="http://localhost:3001/d-solo/9/strimzi-kafka-exporter?orgId=1&panelId=14" />
        </div>
        <div className="h-96">
          <EmbeddedGrafanaPanel panelUrl="http://localhost:3001/d-solo/9/strimzi-kafka-exporter?orgId=1&panelId=18" />
        </div>
        <div className="h-96">
          <EmbeddedGrafanaPanel panelUrl="http://localhost:3001/d-solo/9/strimzi-kafka-exporter?orgId=1&panelId=12" />
        </div>
      </div>
    </div>
  );
};

export default SecurityOverview;
