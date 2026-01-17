import client from './client';

export interface ForecastPoint {
  timestamp: string;
  value: number;
  is_prediction: boolean;
}

export const aiApi = {
  // Chat with Sentinel
  chat: async (query: string, context?: any) => {
    const response = await client.post('/ai/chat', { query, context });
    return response.data;
  },

  // Get Resource Forecast
  getForecast: async (metric: string = 'cpu_load') => {
    const response = await client.get<{ forecast: ForecastPoint[] }>(`/ai/forecast?metric=${metric}`);
    return response.data.forecast;
  },

  // Trigger Manual Analysis
  analyzeEvent: async (eventId: number) => {
    const response = await client.post(`/ai/analyze-event/${eventId}`);
    return response.data;
  }
};
