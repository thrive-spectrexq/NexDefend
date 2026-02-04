import client from './client';

export const getAgents = async () => {
  const response = await client.get('/assets');
  return response.data;
};
