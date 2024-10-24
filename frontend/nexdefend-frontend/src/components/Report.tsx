import axios from "axios";
import React from "react";

const API_URL = "http://localhost:8080";

const Report: React.FC = () => {
  const generateReport = async () => {
    try {
      const response = await axios.get(`${API_URL}/api/v1/report`); // Use the API URL here
      // You can handle the report as needed, for example, downloading it or showing the result
      alert("Report generated: " + response.data);
    } catch (error) {
      alert("Error generating report.");
    }
  };

  return (
    <div>
      <h2>Generate Threat Report</h2>
      <button onClick={generateReport}>Generate Report</button>
    </div>
  );
};

export default Report;
