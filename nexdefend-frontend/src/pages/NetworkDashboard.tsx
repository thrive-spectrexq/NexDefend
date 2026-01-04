import { PageTransition } from '../components/common/PageTransition';
import { Globe, Activity, Upload, Download } from 'lucide-react';
import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip, CartesianGrid } from 'recharts';

export default function NetworkDashboard() {
  const trafficData = Array.from({ length: 20 }, (_, i) => ({
    time: `${i}:00`,
    inbound: Math.floor(Math.random() * 800) + 200,
    outbound: Math.floor(Math.random() * 500) + 100,
  }));

  return (
    <PageTransition className="space-y-6">
      <h1 className="text-2xl font-bold text-text flex items-center gap-3">
          <Globe className="text-brand-blue" />
          Network Traffic Analysis
      </h1>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-surface border border-surface-highlight rounded-lg p-6">
              <div className="flex items-center gap-4">
                  <div className="p-3 bg-brand-green/10 rounded-lg text-brand-green">
                      <Download size={24} />
                  </div>
                  <div>
                      <div className="text-text-muted text-sm">Total Inbound</div>
                      <div className="text-2xl font-bold text-text font-mono">142.5 GB</div>
                  </div>
              </div>
          </div>
          <div className="bg-surface border border-surface-highlight rounded-lg p-6">
              <div className="flex items-center gap-4">
                  <div className="p-3 bg-brand-blue/10 rounded-lg text-brand-blue">
                      <Upload size={24} />
                  </div>
                  <div>
                      <div className="text-text-muted text-sm">Total Outbound</div>
                      <div className="text-2xl font-bold text-text font-mono">84.2 GB</div>
                  </div>
              </div>
          </div>
          <div className="bg-surface border border-surface-highlight rounded-lg p-6">
              <div className="flex items-center gap-4">
                  <div className="p-3 bg-brand-orange/10 rounded-lg text-brand-orange">
                      <Activity size={24} />
                  </div>
                  <div>
                      <div className="text-text-muted text-sm">Peak Throughput</div>
                      <div className="text-2xl font-bold text-text font-mono">1.2 GB/s</div>
                  </div>
              </div>
          </div>
      </div>

      <div className="bg-surface border border-surface-highlight rounded-lg p-6 h-96 flex flex-col">
          <h3 className="text-lg font-semibold text-text mb-4">Traffic Volume (Live)</h3>
          <div className="flex-1 w-full min-h-0">
              <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={trafficData}>
                      <defs>
                          <linearGradient id="colorIn" x1="0" y1="0" x2="0" y2="1">
                              <stop offset="5%" stopColor="#34D399" stopOpacity={0.3}/>
                              <stop offset="95%" stopColor="#34D399" stopOpacity={0}/>
                          </linearGradient>
                          <linearGradient id="colorOut" x1="0" y1="0" x2="0" y2="1">
                              <stop offset="5%" stopColor="#38BDF8" stopOpacity={0.3}/>
                              <stop offset="95%" stopColor="#38BDF8" stopOpacity={0}/>
                          </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" stroke="#1E293B" vertical={false} />
                      <XAxis dataKey="time" stroke="#94A3B8" fontSize={12} tickLine={false} axisLine={false} />
                      <YAxis stroke="#94A3B8" fontSize={12} tickLine={false} axisLine={false} />
                      <Tooltip
                          contentStyle={{ backgroundColor: '#162032', borderColor: '#1E293B', color: '#E2E8F0' }}
                      />
                      <Area type="monotone" dataKey="inbound" stroke="#34D399" fillOpacity={1} fill="url(#colorIn)" name="Inbound (MB)" />
                      <Area type="monotone" dataKey="outbound" stroke="#38BDF8" fillOpacity={1} fill="url(#colorOut)" name="Outbound (MB)" />
                  </AreaChart>
              </ResponsiveContainer>
          </div>
      </div>
    </PageTransition>
  )
}
