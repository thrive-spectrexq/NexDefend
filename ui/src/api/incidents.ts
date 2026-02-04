import client from './client';

export interface Incident {
    ID: number;
    Title: string;
    Description: string;
    Severity: 'Critical' | 'High' | 'Medium' | 'Low';
    Status: 'Open' | 'Closed' | 'Investigating';
    AssignedTo: string;
    CreatedAt: string;
    UpdatedAt: string;
}

export const incidentsApi = {
    // Get all incidents
    getAll: async (params?: { status?: string; severity?: string; page?: number; limit?: number }) => {
        const response = await client.get<Incident[]>('/incidents', { params });
        return response.data;
    },

    // Get single incident
    get: async (id: number) => {
        const response = await client.get<Incident>(`/incidents/${id}`);
        return response.data;
    },

    // Update an incident
    update: async (id: number, data: Partial<Incident>) => {
        const response = await client.put<Incident>(`/incidents/${id}`, data);
        return response.data;
    },

    // Create an incident
    create: async (data: Partial<Incident>) => {
        const response = await client.post<Incident>('/incidents', data);
        return response.data;
    },

    // Analyze incident with AI
    analyze: async (id: number) => {
        // This expects a raw text/markdown response or JSON with a "response" field?
        // The backend handler does: io.Copy(w, resp.Body) where resp comes from Python /chat 
        // Python /chat returns: {"response": "text..."}
        const response = await client.post<{ response: string }>(`/incidents/${id}/analyze`);
        return response.data;
    }
};
