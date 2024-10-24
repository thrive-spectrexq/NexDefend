import React, { useEffect, useState } from "react";

const API_URL = "http://localhost:8080";

const Alerts: React.FC = () => {
  const [alerts, setAlerts] = useState<string[]>([]);

  useEffect(() => {
    const eventSource = new EventSource(`${API_URL}/api/v1/alerts`); // Use the API URL here
    eventSource.onmessage = (event) => {
      setAlerts((prevAlerts) => [...prevAlerts, event.data]);
    };

    return () => {
      eventSource.close();
    };
  }, []);

  return (
    <div>
      <h2>Alerts</h2>
      <ul>
        {alerts.map((alert, index) => (
          <li key={index}>{alert}</li>
        ))}
      </ul>
    </div>
  );
};

export default Alerts;
