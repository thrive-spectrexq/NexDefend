import client from './client';

export const getEvents = async (query?: string) => {
  const params = query ? { q: query } : {};
  const response = await client.get('/events', { params });
  return response.data;
};
