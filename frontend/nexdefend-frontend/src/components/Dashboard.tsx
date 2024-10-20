import React, { useEffect, useState } from "react";

interface Alert {
    message: string;
}

const Dashboard: React.FC = () => {
    const [alerts, setAlerts] = useState<Alert[]>([]);
    const [error, setError] = useState<string | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetch("/api/v1/alerts", {
            headers: {
                Authorization: `Bearer ${localStorage.getItem("token")}`,
            },
        })
            .then((response) => {
                if (response.status === 401) {
                    localStorage.removeItem("token");
                    window.location.href = "/login";
                    return;
                }
                if (!response.ok) {
                    throw new Error("Failed to fetch alerts");
                }
                return response.json();
            })
            .then((data) => {
                setAlerts(data);
                setLoading(false);
            })
            .catch((error) => {
                if (error.name === "TypeError") {
                    setError("Network error. Please try again later.");
                } else {
                    setError(error.message);
                }
                setLoading(false);
            });
    }, []);

    const handleLogout = () => {
        if (window.confirm("Are you sure you want to log out?")) {
            localStorage.removeItem("token");
            window.location.href = "/login";
        }
    };

    return (
        <div>
            <h1>NexDefend Dashboard</h1>
            <h2>Security Alerts</h2>
            {loading ? (
                <p>Loading alerts...</p>
            ) : error ? (
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
