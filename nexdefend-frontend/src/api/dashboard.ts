import client from './client';

export const getDashboardStats = async () => {
  const response = await client.get('/dashboard/stats');
  return response.data;
};
