import React, { useEffect, useState } from 'react';
import { Shield, BarChart, AlertTriangle, CheckCircle } from 'lucide-react';
import './Dashboard.css';

const Dashboard: React.FC = () => {
  const [threats, setThreats] = useState(12);
  const [vulnerabilities, setVulnerabilities] = useState(5);
  const [compliance, setCompliance] = useState(98);
  const [cpuUsage, setCpuUsage] = useState(45.5);
  const [memoryUsage, setMemoryUsage] = useState(60.2);

  useEffect(() => {
    const ws = new WebSocket('ws://localhost:8080/ws');

    ws.onopen = () => {
      console.log('connected');
    };

    ws.onmessage = (event) => {
      const data = JSON.parse(event.data);
      if (data.type === 'dashboardUpdate') {
        setThreats(data.threats);
        setVulnerabilities(data.vulnerabilities);
        setCompliance(data.compliance);
        setCpuUsage(data.cpuUsage);
        setMemoryUsage(data.memoryUsage);
      }
    };

    ws.onclose = () => {
      console.log('disconnected');
    };

    return () => {
      ws.close();
    };
  }, []);

  return (
    <div className="dashboard-container">
      <div className="dashboard-header">
        <h1>Security Dashboard</h1>
      </div>
      <div className="dashboard-grid">
        <div className="dashboard-card">
          <div className="card-header">
            <AlertTriangle size={24} />
            <h2>Threats</h2>
          </div>
          <div className="card-content">
            <p>{threats} Active Threats</p>
          </div>
        </div>
        <div className="dashboard-card">
          <div className="card-header">
            <Shield size={24} />
            <h2>Vulnerabilities</h2>
          </div>
          <div className="card-content">
            <p>{vulnerabilities} Critical Vulnerabilities</p>
          </div>
        </div>
        <div className="dashboard-card">
          <div className="card-header">
            <CheckCircle size={24} />
            <h2>Compliance</h2>
          </div>
          <div className="card-content">
            <p>{compliance}% Compliant</p>
          </div>
        </div>
        <div className="dashboard-card">
          <div className="card-header">
            <BarChart size={24} />
            <h2>System Metrics</h2>
          </div>
          <div className="card-content">
            <p>CPU: {cpuUsage}%</p>
            <p>Memory: {memoryUsage}%</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
