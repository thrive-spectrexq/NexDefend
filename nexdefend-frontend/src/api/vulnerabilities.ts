import client from './client';

export const getVulnerabilities = async () => {
  const response = await client.get('/vulnerabilities');
  return response.data;
};
