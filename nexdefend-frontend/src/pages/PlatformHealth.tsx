import { PageTransition } from '../components/common/PageTransition';
import { Server, Activity, Cpu, HardDrive } from 'lucide-react';

export default function PlatformHealth() {
  return (
    <PageTransition className="space-y-6">
      <h1 className="text-2xl font-bold text-text flex items-center gap-3">
          <Activity className="text-brand-green" />
          Platform Health
      </h1>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-surface border border-surface-highlight rounded-lg p-6">
              <div className="flex items-center gap-4">
                  <div className="p-3 bg-brand-blue/10 rounded-lg text-brand-blue">
                      <Server size={24} />
                  </div>
                  <div>
                      <div className="text-text-muted text-sm">Active Containers</div>
                      <div className="text-2xl font-bold text-text font-mono">12 / 12</div>
                  </div>
              </div>
          </div>
          <div className="bg-surface border border-surface-highlight rounded-lg p-6">
              <div className="flex items-center gap-4">
                  <div className="p-3 bg-brand-orange/10 rounded-lg text-brand-orange">
                      <Cpu size={24} />
                  </div>
                  <div>
                      <div className="text-text-muted text-sm">Cluster CPU Load</div>
                      <div className="text-2xl font-bold text-text font-mono">42%</div>
                  </div>
              </div>
          </div>
          <div className="bg-surface border border-surface-highlight rounded-lg p-6">
              <div className="flex items-center gap-4">
                  <div className="p-3 bg-brand-red/10 rounded-lg text-brand-red">
                      <HardDrive size={24} />
                  </div>
                  <div>
                      <div className="text-text-muted text-sm">Disk Usage</div>
                      <div className="text-2xl font-bold text-text font-mono">68%</div>
                  </div>
              </div>
          </div>
      </div>

      <div className="bg-surface border border-surface-highlight rounded-lg p-6">
          <h3 className="text-lg font-semibold text-text mb-4">Service Status</h3>
          <div className="space-y-3">
              {[
                  { name: 'nexdefend-api', status: 'Healthy', version: 'v2.4.1', uptime: '14d 2h' },
                  { name: 'nexdefend-ai-engine', status: 'Healthy', version: 'v1.2.0', uptime: '4d 12h' },
                  { name: 'nexdefend-ingestor', status: 'Healthy', version: 'v2.4.1', uptime: '14d 2h' },
                  { name: 'postgres-db', status: 'Healthy', version: '15.4', uptime: '30d 1h' },
                  { name: 'kafka-broker', status: 'Warning', version: '3.6.0', uptime: '1d 4h' },
              ].map((svc) => (
                  <div key={svc.name} className="flex items-center justify-between p-3 bg-surface-highlight/10 rounded border border-surface-highlight/50">
                      <div className="font-mono text-sm text-text">{svc.name}</div>
                      <div className="flex items-center gap-6 text-sm">
                          <span className="text-text-muted">{svc.version}</span>
                          <span className="text-text-muted">{svc.uptime}</span>
                          <span className={`font-bold ${svc.status === 'Healthy' ? 'text-brand-green' : 'text-brand-orange'}`}>
                              {svc.status}
                          </span>
                      </div>
                  </div>
              ))}
          </div>
      </div>
    </PageTransition>
  );
}
