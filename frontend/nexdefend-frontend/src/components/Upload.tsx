import axios, { AxiosResponse } from "axios";
import React, { useState } from "react";

const API_URL = "http://localhost:8080";

const Upload: React.FC = () => {
  const [file, setFile] = useState<File | null>(null);

  const handleFileUpload = async () => {
    if (!file) {
      alert("Please select a file first!");
      return;
    }

    const formData = new FormData();
    formData.append("file", file);

    try {
      const response: AxiosResponse = await axios.post(`${API_URL}/api/v1/upload`, formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });
      // Use the response here
      alert(`File uploaded successfully! Status: ${response.status}`);
    } catch (error) {
      alert("Error uploading file.");
    }
  };

  return (
    <div>
      <h2>Upload a File</h2>
      <input type="file" onChange={(e) => setFile(e.target.files?.[0] || null)} />
      <button onClick={handleFileUpload}>Upload</button>
    </div>
  );
};

export default Upload;
