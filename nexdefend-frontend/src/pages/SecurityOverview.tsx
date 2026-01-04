import { PageTransition } from '../components/common/PageTransition';
import { ShieldCheck, Lock, Eye, AlertCircle } from 'lucide-react';

export default function SecurityOverview() {
  return (
    <PageTransition className="space-y-6">
      <h1 className="text-2xl font-bold text-text flex items-center gap-3">
          <ShieldCheck className="text-brand-blue" />
          Security Overview
      </h1>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="bg-surface border border-surface-highlight rounded-lg p-6">
              <div className="flex items-center gap-3 mb-2">
                  <Lock size={20} className="text-brand-green" />
                  <span className="text-text-muted text-sm">Auth Success</span>
              </div>
              <div className="text-2xl font-bold text-text font-mono">99.2%</div>
          </div>
          <div className="bg-surface border border-surface-highlight rounded-lg p-6">
              <div className="flex items-center gap-3 mb-2">
                  <AlertCircle size={20} className="text-brand-red" />
                  <span className="text-text-muted text-sm">Auth Failures</span>
              </div>
              <div className="text-2xl font-bold text-text font-mono">142</div>
          </div>
          <div className="bg-surface border border-surface-highlight rounded-lg p-6">
              <div className="flex items-center gap-3 mb-2">
                  <Eye size={20} className="text-brand-blue" />
                  <span className="text-text-muted text-sm">Active Sessions</span>
              </div>
              <div className="text-2xl font-bold text-text font-mono">28</div>
          </div>
          <div className="bg-surface border border-surface-highlight rounded-lg p-6">
              <div className="flex items-center gap-3 mb-2">
                  <ShieldCheck size={20} className="text-brand-orange" />
                  <span className="text-text-muted text-sm">Compliance</span>
              </div>
              <div className="text-2xl font-bold text-text font-mono">SOC2</div>
          </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-surface border border-surface-highlight rounded-lg p-6">
              <h3 className="text-lg font-semibold text-text mb-4">Top Failed Login Sources</h3>
              <div className="space-y-3">
                  {[
                      { ip: '192.168.1.105', location: 'Internal', count: 45 },
                      { ip: '10.20.4.12', location: 'DMZ', count: 12 },
                      { ip: '203.0.113.45', location: 'Unknown', count: 8 },
                  ].map((src, i) => (
                      <div key={i} className="flex justify-between items-center text-sm p-2 hover:bg-surface-highlight/10 rounded">
                          <span className="text-text font-mono">{src.ip}</span>
                          <span className="text-text-muted">{src.location}</span>
                          <span className="text-brand-red font-bold">{src.count}</span>
                      </div>
                  ))}
              </div>
          </div>

          <div className="bg-surface border border-surface-highlight rounded-lg p-6">
              <h3 className="text-lg font-semibold text-text mb-4">Policy Violations</h3>
              <div className="space-y-3">
                  {[
                      { policy: 'Weak Password', count: 12, risk: 'Medium' },
                      { policy: 'Unencrypted Traffic', count: 3, risk: 'High' },
                      { policy: 'Unauthorized Port', count: 1, risk: 'Critical' },
                  ].map((viol, i) => (
                      <div key={i} className="flex justify-between items-center text-sm p-2 hover:bg-surface-highlight/10 rounded">
                          <span className="text-text">{viol.policy}</span>
                          <span className={`font-bold text-xs px-2 py-1 rounded ${
                              viol.risk === 'Critical' ? 'bg-brand-red/20 text-brand-red' :
                              viol.risk === 'High' ? 'bg-brand-orange/20 text-brand-orange' :
                              'bg-brand-blue/20 text-brand-blue'
                          }`}>
                              {viol.risk}
                          </span>
                      </div>
                  ))}
              </div>
          </div>
      </div>
    </PageTransition>
  );
}
