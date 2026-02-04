import client from './client';

export interface ModuleStat {
  name: string;
  count: number;
  status: string;
  trend: string;
}

export interface ComplianceScore {
  standard: string;
  score: number;
  status: string;
}

export interface DashboardStats {
  modules: ModuleStat[];
  compliance: ComplianceScore[];
  total_events_24h: number;
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
