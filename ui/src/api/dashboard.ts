import client from './client';

export interface DashboardStats {
  global_latency: number;
  throughput: number;
  error_rate: number;
  threat_velocity: number;
  security_score: number;
  risk_score: number;
}

export interface SystemMetrics {
  cpu_usage: number;
  memory_usage: number;
  disk_usage: number;
  network_in: number;
  network_out: number;
}

export const getDashboardStats = async () => {
  const response = await client.get<DashboardStats>('/dashboard/stats');
  return response.data;
};

export const getSystemMetrics = async () => {
  const response = await client.get<SystemMetrics>('/metrics/system');
  return response.data;
};
