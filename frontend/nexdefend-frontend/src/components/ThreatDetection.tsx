import axios from "axios";
import React, { useState } from "react";

const API_URL = "http://localhost:8080";

const ThreatDetection: React.FC = () => {
  const [features, setFeatures] = useState<string>("");

  const submitThreatDetection = async () => {
    try {
      const response = await axios.post(`${API_URL}/api/v1/threats`, { features }); // Use the API URL here
      alert("Threat Detection Result: " + response.data);
    } catch (error) {
      alert("Error submitting threat detection.");
    }
  };

  return (
    <div>
      <h2>Threat Detection</h2>
      <textarea
        value={features}
        onChange={(e) => setFeatures(e.target.value)}
        placeholder="Enter features for threat detection"
      />
      <button onClick={submitThreatDetection}>Submit</button>
    </div>
  );
};

export default ThreatDetection;
