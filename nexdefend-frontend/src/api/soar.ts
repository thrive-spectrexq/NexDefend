import axios from 'axios';

const API_BASE_URL = '/api/v1'; // Assumes proxy or gateway handles routing to SOAR service

export interface PlaybookAction {
  type: string;
  params: Record<string, string>;
}

export interface Playbook {
  id: string;
  name: string;
  trigger: string;
  actions: PlaybookAction[];
}

export const fetchPlaybooks = async (): Promise<Playbook[]> => {
  const response = await axios.get<Playbook[]>(`${API_BASE_URL}/playbooks`);
  return response.data;
};

export const savePlaybooks = async (playbooks: Playbook[]): Promise<void> => {
  await axios.post(`${API_BASE_URL}/playbooks`, playbooks);
};
