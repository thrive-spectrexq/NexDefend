import { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '../../api/apiClient';
import type { Incident } from '../../api/apiClient';
import { X } from 'lucide-react';

interface IncidentModalProps {
  incident: Incident;
  onClose: () => void;
}

type UpdatePayload = {
  status?: Incident['status'];
  assignee?: string;
  add_note?: string;
};

const users = ['Alice', 'Bob', 'Charlie'];

const IncidentModal: React.FC<IncidentModalProps> = ({ incident, onClose }) => {
  const queryClient = useQueryClient();
  const [status, setStatus] = useState(incident.status);
  const [assignee, setAssignee] = useState(incident.assignee || '');
  const [note, setNote] = useState('');
  const [error, setError] = useState<string | null>(null);

  const mutation = useMutation({
    mutationFn: (payload: UpdatePayload) =>
      apiClient.put(`/incidents/${incident.id}`, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['incidents'] });
      onClose();
    },
    onError: () => {
      setError('Failed to update incident. Please try again.');
    },
  });

  const handleSubmit = () => {
    setError(null);
    const payload: UpdatePayload = {};
    if (status !== incident.status) {
      payload.status = status;
    }
    if (assignee !== incident.assignee) {
      payload.assignee = assignee;
    }
    if (note.trim() !== '') {
      payload.add_note = note.trim();
    }

    if (Object.keys(payload).length > 0) {
      mutation.mutate(payload);
    } else {
      onClose();
    }
  };

  const handleCloseIncident = () => {
    setError(null);
    const payload: UpdatePayload = {
      status: 'Resolved',
    };
    mutation.mutate(payload);
  };

  const notes = JSON.parse(incident.notes || '[]') as { time: string, text: string }[];

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex justify-center items-center">
      <div className="bg-gray-800 rounded-lg shadow-xl p-6 w-full max-w-2xl text-white">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-2xl font-bold">Incident #{incident.id}</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-white">
            <X size={24} />
          </button>
        </div>

        {error && <p className="text-red-500 mb-4">{error}</p>}

        <p className="mb-4">{incident.description}</p>

        <div className="grid grid-cols-2 gap-4 mb-6">
          <div>
            <label className="text-sm text-gray-400">Severity</label>
            <p className="text-lg font-semibold">{incident.severity}</p>
          </div>
          <div>
            <label htmlFor="status" className="text-sm text-gray-400">Status</label>
            <select
              id="status"
              value={status}
              onChange={(e) => setStatus(e.target.value as Incident['status'])}
              className="w-full bg-gray-700 border border-gray-600 rounded p-2"
            >
              <option value="Open">Open</option>
              <option value="In Progress">In Progress</option>
              <option value="Escalated">Escalated</option>
              <option value="Resolved">Resolved</option>
            </select>
          </div>
          <div>
            <label htmlFor="assignee" className="text-sm text-gray-400">Assignee</label>
            <select
              id="assignee"
              value={assignee}
              onChange={(e) => setAssignee(e.target.value)}
              className="w-full bg-gray-700 border border-gray-600 rounded p-2"
            >
              <option value="">Unassigned</option>
              {users.map((user) => (
                <option key={user} value={user}>{user}</option>
              ))}
            </select>
          </div>
        </div>

        <div className="mb-6">
          <label htmlFor="note" className="text-sm text-gray-400">Add Note</label>
          <textarea
            id="note"
            rows={3}
            value={note}
            onChange={(e) => setNote(e.target.value)}
            className="w-full bg-gray-700 border border-gray-600 rounded p-2"
            placeholder="Add investigation notes..."
          />
        </div>

        <div className="mb-4">
          <h3 className="text-lg font-semibold mb-2">Notes History</h3>
          <div className="max-h-40 overflow-y-auto bg-gray-900 p-3 rounded">
            {notes.length === 0 ? (
              <p className="text-gray-500 italic">No notes added yet.</p>
            ) : (
              notes.slice().reverse().map((n, index) => (
                <div key={index} className="border-b border-gray-700 pb-2 mb-2 last:border-b-0">
                  <p className="text-sm">{n.text}</p>
                  <p className="text-xs text-gray-500">{new Date(n.time).toLocaleString()}</p>
                </div>
              ))
            )}
          </div>
        </div>

        <div className="flex justify-between">
          <button
            onClick={handleCloseIncident}
            disabled={mutation.isPending}
            className="bg-red-600 hover:bg-red-700 text-white font-bold py-2 px-4 rounded"
          >
            {mutation.isPending ? 'Closing...' : 'Close Incident'}
          </button>
          <div className="flex justify-end gap-4">
            <button onClick={onClose} className="bg-gray-600 hover:bg-gray-500 text-white font-bold py-2 px-4 rounded">
              Cancel
            </button>
            <button
              onClick={handleSubmit}
              disabled={mutation.isPending}
              className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
            >
              {mutation.isPending ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default IncidentModal;
