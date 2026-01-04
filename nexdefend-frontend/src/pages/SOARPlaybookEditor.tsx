import { useQuery } from '@tanstack/react-query';
import { apiClient } from '../api/apiClient';
import type { Playbook } from '../api/apiClient';
import { Loader2, Play, GitBranch, AlertTriangle } from 'lucide-react';
import { PageTransition } from '../components/common/PageTransition';

// import './SOAR.css'; // Removed legacy CSS

const SOARPlaybookEditor = () => {
  const { data, isLoading, error } = useQuery({
    queryKey: ['playbooks'],
    queryFn: (): Promise<Playbook[]> =>
      apiClient.get('/playbooks').then((res) => res.data),
  });

  return (
    <PageTransition className="space-y-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-text flex items-center gap-3">
            <GitBranch className="text-brand-blue" />
            SOAR Playbooks
        </h1>
        <button className="px-4 py-2 bg-brand-blue text-background rounded hover:bg-brand-blue/90 text-sm font-semibold">
            Create Playbook
        </button>
      </div>

      {isLoading && (
        <div className="flex justify-center items-center p-12 text-text-muted">
          <Loader2 size={32} className="animate-spin" />
        </div>
      )}

      {error && (
        <div className="p-4 bg-brand-red/10 border border-brand-red/20 text-brand-red rounded text-center flex items-center justify-center gap-2">
            <AlertTriangle size={20} />
            Failed to load playbooks. Please try again later.
        </div>
      )}

      {data && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {data.length === 0 ? (
              <div className="col-span-full p-8 text-center text-text-muted bg-surface border border-surface-highlight rounded-lg">
                  No playbooks defined. Create one to automate responses.
              </div>
          ) : (
            data.map((playbook) => (
                <div key={playbook.id} className="bg-surface border border-surface-highlight rounded-lg p-6 hover:border-brand-blue/50 transition-colors group">
                <div className="flex items-center gap-4 mb-4">
                    <div className="p-3 bg-brand-blue/10 rounded-lg text-brand-blue group-hover:bg-brand-blue/20 transition-colors">
                        <Play size={24} />
                    </div>
                    <h2 className="text-lg font-semibold text-text">{playbook.name}</h2>
                </div>
                <p className="text-text-muted text-sm mb-6 h-10 overflow-hidden line-clamp-2">
                    {playbook.description}
                </p>
                <div className="flex gap-2">
                    <button className="flex-1 bg-surface-highlight hover:bg-surface-highlight/80 text-text rounded py-2 text-sm font-medium transition-colors">
                        Edit Logic
                    </button>
                    <button className="flex-1 bg-brand-blue/10 text-brand-blue hover:bg-brand-blue/20 rounded py-2 text-sm font-medium transition-colors">
                        Run Now
                    </button>
                </div>
                </div>
            ))
          )}
        </div>
      )}
    </PageTransition>
  );
};

export default SOARPlaybookEditor;
