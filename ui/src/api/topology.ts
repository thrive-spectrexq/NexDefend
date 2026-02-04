import client from './client';

export const getTopology = async () => {
  const response = await client.get('/topology');
  return response.data;
};
