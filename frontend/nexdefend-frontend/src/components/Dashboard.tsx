import React, { useEffect, useState } from "react";

interface Alert {
    message: string;
}

const Dashboard: React.FC = () => {
    const [alerts, setAlerts] = useState<Alert[]>([]);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        fetch("/api/v1/alerts")
            .then((response) => {
                if (!response.ok) {
                    throw new Error("Failed to fetch alerts");
                }
                return response.json();
            })
            .then((data) => setAlerts(data))
            .catch((error) => setError(error.message));
    }, []);

    const handleLogout = () => {
        localStorage.removeItem("token");
        window.location.href = "/login"; // Redirect to login after logout
    };

    return (
        <div>
            <h1>NexDefend Dashboard</h1>
            <h2>Security Alerts</h2>
            {error ? (
                <p>Error: {error}</p>
            ) : (
                <ul>
                    {alerts.map((alert, index) => (
                        <li key={index}>{alert.message}</li>
                    ))}
                </ul>
            )}
            <button onClick={handleLogout}>Logout</button>
        </div>
    );
};

export default Dashboard;
