import client from './client';

export const loginUser = async (email: string, password: string): Promise<any> => {
  const response = await client.post('/auth/login', { email, password });
  return response.data;
};

export const registerUser = async (email: string, password: string): Promise<any> => {
  const response = await client.post('/auth/register', { email, password });
  return response.data;
};
