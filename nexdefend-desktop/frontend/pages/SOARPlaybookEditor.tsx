import { useQuery } from '@tanstack/react-query';
import { apiClient } from '../api/apiClient';
import type { Playbook } from '../api/apiClient';
import { Loader2, Play } from 'lucide-react';
import './SOAR.css';

const SOARPlaybookEditor = () => {
  const { data, isLoading, error } = useQuery({
    queryKey: ['playbooks'],
    queryFn: (): Promise<Playbook[]> =>
      apiClient.get('/playbooks').then((res) => res.data),
  });

  return (
    <div className="soar-page">
      <h1 className="text-3xl font-bold mb-6">SOAR Playbooks</h1>

      {isLoading && (
        <div className="flex justify-center items-center p-12">
          <Loader2 size={40} className="animate-spin">
            <title>Loading...</title>
          </Loader2>
        </div>
      )}

      {error && (
        <p className="text-red-500">Failed to load playbooks. Please try again later.</p>
      )}

      {data && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {data.map((playbook) => (
            <div key={playbook.id} className="bg-gray-800 border border-gray-700 rounded-lg shadow-lg p-6">
              <div className="flex items-center mb-4">
                <Play className="text-blue-400 mr-4" size={24} />
                <h2 className="text-xl font-bold">{playbook.name}</h2>
              </div>
              <p className="text-gray-400 mb-4">{playbook.description}</p>
              <button
                className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
              >
                View/Edit
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default SOARPlaybookEditor;
