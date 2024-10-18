import React, { useEffect, useState } from "react";

const Dashboard: React.FC = () => {
    const [alerts, setAlerts] = useState([]);

    useEffect(() => {
        fetch("/api/v1/alerts")
            .then((response) => response.json())
            .then((data) => setAlerts(data));
    }, []);

    return (
        <div>
            <h1>NexDefend Dashboard</h1>
            <h2>Security Alerts</h2>
            <ul>
                {alerts.map((alert, index) => (
                    <li key={index}>{alert.message}</li>
                ))}
            </ul>
        </div>
    );
};

export default Dashboard;
