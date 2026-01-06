import { Server, Database, Globe, ArrowRight } from 'lucide-react';

// A simple static topology visualization to demonstrate Observability
const ServiceMap = () => {
  return (
    <div className="p-8 bg-slate-950 min-h-screen text-white relative overflow-hidden">
      <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-indigo-900/20 to-transparent pointer-events-none" />

      <div className="relative z-10">
        <h1 className="text-2xl font-bold mb-8">Service Topology Map</h1>

        <div className="flex justify-center items-center gap-16 mt-20">

          {/* Internet / Ingress */}
          <div className="text-center">
            <div className="w-20 h-20 bg-slate-800 rounded-full border-2 border-slate-600 flex items-center justify-center mx-auto mb-2 shadow-[0_0_30px_rgba(100,116,139,0.2)]">
              <Globe size={32} className="text-blue-400" />
            </div>
            <div className="font-mono text-sm">Internet</div>
            <div className="text-xs text-slate-500">Ingress</div>
          </div>

          <ArrowRight className="text-slate-600 animate-pulse" />

          {/* Load Balancer */}
          <div className="text-center">
             <div className="w-16 h-16 bg-indigo-900/50 rounded-lg border border-indigo-500 flex items-center justify-center mx-auto mb-2">
               <span className="font-bold text-indigo-400">LB</span>
             </div>
             <div className="font-mono text-sm">Nginx</div>
          </div>

          <div className="flex flex-col gap-12">
             {/* Path A */}
             <div className="flex items-center gap-8">
               <div className="h-px w-8 bg-slate-600" />
               <Node name="API Service" type="go" status="healthy" />
               <div className="h-px w-8 bg-slate-600" />
               <Node name="Postgres Primary" type="db" status="healthy" />
             </div>

             {/* Path B */}
             <div className="flex items-center gap-8">
               <div className="h-px w-8 bg-slate-600" />
               <Node name="AI Engine (Python)" type="py" status="warning" />
               <div className="h-px w-8 bg-slate-600" />
               <Node name="Redis Cache" type="db" status="healthy" />
             </div>
          </div>

        </div>
      </div>
    </div>
  );
};

const Node = ({ name, type, status }: any) => (
  <div className={`
    w-48 p-4 rounded-xl border flex items-center gap-3 bg-slate-900
    ${status === 'healthy' ? 'border-green-900 shadow-[0_0_15px_rgba(34,197,94,0.1)]' : 'border-yellow-600 shadow-[0_0_15px_rgba(234,179,8,0.2)]'}
  `}>
    <div className={`p-2 rounded-lg ${type === 'db' ? 'bg-blue-900/30 text-blue-400' : 'bg-slate-800 text-slate-300'}`}>
      {type === 'db' ? <Database size={16} /> : <Server size={16} />}
    </div>
    <div>
      <div className="text-sm font-bold">{name}</div>
      <div className={`text-[10px] uppercase font-bold ${status === 'healthy' ? 'text-green-500' : 'text-yellow-500'}`}>
        {status} • 99.9%
      </div>
    </div>
  </div>
);

export default ServiceMap;
