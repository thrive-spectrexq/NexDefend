import { GlassCard } from '../../components/common/GlassCard';
import { EmbeddedGrafanaPanel } from '../../components/dashboard/EmbeddedGrafanaPanel';
import { Activity } from 'lucide-react';

export default function PlatformHealth() {
  return (
    <div className="p-6 space-y-6 bg-surface-darker min-h-full">
      <div className="flex items-center justify-between mb-4">
        <div>
            <h1 className="text-2xl font-bold text-white">Platform Health & Infrastructure</h1>
            <p className="text-text-muted">Real-time monitoring of NexDefend core services (Kafka, DB, API)</p>
        </div>
        <div className="flex items-center gap-2">
            <div className="flex items-center gap-2 px-3 py-1 bg-brand-green/10 border border-brand-green/20 rounded text-brand-green text-sm">
                <Activity size={14} />
                <span>All Systems Operational</span>
            </div>
        </div>
      </div>

      {/* Top Row: Critical Service Stats (Single Stats from Grafana) */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
         <GlassCard className="h-32" noPadding>
            <EmbeddedGrafanaPanel
                src="/d-solo/nexdefend-overview/nexdefend?orgId=1&panelId=2&refresh=10s"
                title="Kafka Lag (Events)"
            />
         </GlassCard>
         <GlassCard className="h-32" noPadding>
            <EmbeddedGrafanaPanel
                src="/d-solo/nexdefend-overview/nexdefend?orgId=1&panelId=4&refresh=10s"
                title="Postgres Connections"
            />
         </GlassCard>
         <GlassCard className="h-32" noPadding>
            <EmbeddedGrafanaPanel
                src="/d-solo/nexdefend-overview/nexdefend?orgId=1&panelId=6&refresh=10s"
                title="API Latency (p95)"
            />
         </GlassCard>
         <GlassCard className="h-32" noPadding>
            <EmbeddedGrafanaPanel
                src="/d-solo/nexdefend-overview/nexdefend?orgId=1&panelId=8&refresh=10s"
                title="Active Agents"
            />
         </GlassCard>
      </div>

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

          {/* Kafka Performance */}
          <GlassCard title="Event Ingestion Rate (Kafka)" className="h-[350px]" noPadding>
             <EmbeddedGrafanaPanel
                src="/d-solo/nexdefend-overview/nexdefend?orgId=1&panelId=12&refresh=5s"
             />
          </GlassCard>

          {/* Database Health */}
          <GlassCard title="Database Performance (Postgres)" className="h-[350px]" noPadding>
             <EmbeddedGrafanaPanel
                src="/d-solo/nexdefend-overview/nexdefend?orgId=1&panelId=14&refresh=30s"
             />
          </GlassCard>

          {/* API Load */}
          <GlassCard title="API Request Volume" className="h-[350px]" noPadding>
             <EmbeddedGrafanaPanel
                src="/d-solo/nexdefend-overview/nexdefend?orgId=1&panelId=16&refresh=5s"
             />
          </GlassCard>

          {/* System Resources */}
          <GlassCard title="Core Services CPU/RAM" className="h-[350px]" noPadding>
             <EmbeddedGrafanaPanel
                src="/d-solo/nexdefend-overview/nexdefend?orgId=1&panelId=18&refresh=10s"
             />
          </GlassCard>
      </div>
    </div>
  );
}
