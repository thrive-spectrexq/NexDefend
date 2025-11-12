import axios from 'axios';
import useAuthStore from '../stores/authStore';

// Get API base URLs from environment variables
// These are set by Vite (see vite.config.ts proxy) or Docker
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || '/api/v1';
const AUTH_BASE_URL = import.meta.env.VITE_AUTH_BASE_URL || '/';

// --- Main API Client (Authenticated) ---
export const apiClient = axios.create({
  baseURL: API_BASE_URL,
});

apiClient.interceptors.request.use(
  (config) => {
    const token = useAuthStore.getState().token;
    if (token) {
      config.headers['Authorization'] = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      // Token is invalid or expired
      useAuthStore.getState().logout();
    }
    return Promise.reject(error);
  }
);

// --- Auth API Client (Public) ---
export const authApiClient = axios.create({
  baseURL: AUTH_BASE_URL,
});

// --- Shared Types ---
// We'll define types here for our API data
export interface Threat {
  id: number;
  description: string;
  severity: string;
  timestamp: string;
  source_ip: string;
  destination: string;
  event_type: string;
  protocol: string;
  alert_category: string;
}

export interface Incident {
  id: number;
  description: string;
  severity: string;
  status: 'Open' | 'In Progress' | 'Resolved' | 'Escalated';
  assigned_to: { String: string; Valid: boolean };
  notes: string; // JSON string
  created_at: string;
  updated_at: string;
  related_event_id: { Int64: number; Valid: boolean };
}

export interface Vulnerability {
  id: number;
  description: string;
  severity: string;
  status: 'Detected' | 'Assessed' | 'Resolved';
  host_ip: { String: string; Valid: boolean };
  port: { Int32: number; Valid: boolean };
  discovered_at: string;
  updated_at: string;
}

export interface SystemMetric {
  id: number;
  metric_type: string;
  value: number;
  timestamp: string;
}
