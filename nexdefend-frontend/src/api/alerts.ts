import client from './client';

export const getAlerts = async () => {
  // Mapping to backend /events endpoint, filtering or using incidents if alerts are separate
  // The backend has /events and /incidents. "Alerts" usually map to events or unconfirmed incidents.
  // Using /events for now as "Security Alerts".
  const response = await client.get('/events');
  return response.data;
};

export const getIncidents = async () => {
  const response = await client.get('/incidents');
  return response.data;
};
