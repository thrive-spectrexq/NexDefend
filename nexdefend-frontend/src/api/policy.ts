import axios from 'axios';

const API_BASE_URL = '/api/v1/policies';

export interface Playbook {
    id: number;
    name: string;
    actions: string; // JSON string
    threatContext: string;
    score: number;
    createdAt?: string;
}

export const fetchPlaybooks = async (): Promise<Playbook[]> => {
    const response = await axios.get<Playbook[]>(`${API_BASE_URL}/playbooks`);
    return response.data;
};

export const savePolicyPlaybook = async (playbook: any): Promise<Playbook> => {
    const response = await axios.post<Playbook>(`${API_BASE_URL}/playbooks`, playbook);
    return response.data;
};

export const evaluatePolicy = async (data: { score: number;[key: string]: any }) => {
    const response = await axios.post(`${API_BASE_URL}/evaluate`, data);
    return response.data;
};

export const generatePlaybook = async (data: { process_id: string; score: number;[key: string]: any }): Promise<Playbook> => {
    const response = await axios.post<Playbook>(`${API_BASE_URL}/generate-playbook`, data);
    return response.data;
};

export const fetchPolicyStatus = async () => {
    const response = await axios.get(`${API_BASE_URL}/status`);
    return response.data;
};
