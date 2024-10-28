import axios, { AxiosError } from "axios";
import React, { useEffect, useState } from "react";

const API_URL = "http://localhost:8080";

interface Alert {
    message: string;
}

const Dashboard: React.FC = () => {
    const [alerts, setAlerts] = useState<Alert[]>([]);
    const [error, setError] = useState<string | null>(null);
    const [loading, setLoading] = useState(true);
    const [file, setFile] = useState<File | null>(null);
    const [isDetecting, setIsDetecting] = useState(false);
    const [report, setReport] = useState<string | null>(null);

    useEffect(() => {
        fetchAlerts();
    }, []);

    const fetchAlerts = async () => {
        setLoading(true);
        try {
            const response = await axios.get(`${API_URL}/api/v1/alerts`, {
                headers: {
                    Authorization: `Bearer ${localStorage.getItem("token")}`,
                },
            });

            setAlerts(response.data); // Use the response to set alerts
        } catch (err) {
            const error = err as AxiosError; // Cast to AxiosError type
            if (error.response?.status === 401) {
                localStorage.removeItem("token");
                window.location.href = "/login";
            } else {
                setError(error.message); // Access message property
            }
        } finally {
            setLoading(false);
        }
    };

    const handleLogout = () => {
        if (window.confirm("Are you sure you want to log out?")) {
            localStorage.removeItem("token");
            window.location.href = "/login";
        }
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const selectedFile = e.target.files?.[0];
        if (selectedFile) {
            setFile(selectedFile);
        }
    };

    const handleFileUpload = async () => {
        if (!file) return;
        const formData = new FormData();
        formData.append("file", file);

        try {
            await axios.post(`${API_URL}/api/v1/upload`, formData, {
                headers: {
                    Authorization: `Bearer ${localStorage.getItem("token")}`,
                    "Content-Type": "multipart/form-data", // Set the content type for file uploads
                },
            });

            alert("File uploaded successfully!"); // Provide feedback
            setFile(null); // Clear the selected file
        } catch (err) {
            const error = err as AxiosError; // Cast to AxiosError type
            setError(error.message); // Access message property
        }
    };

    const handleDetectThreat = async () => {
        setIsDetecting(true);
        try {
            const response = await axios.post(`${API_URL}/api/v1/threats`, {}, {
                headers: {
                    Authorization: `Bearer ${localStorage.getItem("token")}`,
                    "Content-Type": "application/json",
                },
            });

            alert(response.data.message || "Threat detection initiated!"); // Use response data
        } catch (err) {
            const error = err as AxiosError; // Cast to AxiosError type
            setError(error.message); // Access message property
        } finally {
            setIsDetecting(false);
        }
    };

    const handleGenerateReport = async () => {
        try {
            const response = await axios.get(`${API_URL}/api/v1/report`, {
                headers: {
                    Authorization: `Bearer ${localStorage.getItem("token")}`,
                },
            });

            setReport(response.data); // Use the response to set the report
        } catch (err) {
            const error = err as AxiosError; // Cast to AxiosError type
            setError(error.message); // Access message property
        }
    };

    return (
        <div>
            <h1>NexDefend Dashboard</h1>
            <h2>Security Alerts</h2>
            {loading ? (
                <p>Loading alerts...</p>
            ) : error ? (
                <p style={{ color: "red" }}>Error: {error}</p>
            ) : (
                <ul>
                    {alerts.map((alert, index) => (
                        <li key={index}>{alert.message}</li>
                    ))}
                </ul>
            )}

            <h2>Upload File</h2>
            <input type="file" onChange={handleFileChange} />
            <button onClick={handleFileUpload}>Upload</button>

            <h2>Threat Detection</h2>
            <button onClick={handleDetectThreat} disabled={isDetecting}>
                {isDetecting ? "Detecting..." : "Start Threat Detection"}
            </button>

            <h2>Generate Threat Report</h2>
            <button onClick={handleGenerateReport}>Generate Report</button>
            {report && <pre>{report}</pre>} {/* Display generated report */}

            <button onClick={handleLogout}>Logout</button>
        </div>
    );
};

export default Dashboard;
