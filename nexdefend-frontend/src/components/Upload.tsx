// src/components/Upload.tsx
import React, { useState } from 'react';

const API_URL = "http://localhost:8080";

interface UploadFile {
  id: string;
  filename: string;
}

const Upload: React.FC = () => {
  const [uploads, setUploads] = useState<UploadFile[]>([]);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState('');

  const handleUpload = async (file: File) => {
    const formData = new FormData();
    formData.append('file', file);

    try {
      const res = await fetch(`${API_URL}/api/v1/upload`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` },
        body: formData,
      });

      if (!res.ok) throw new Error('Upload failed');
      const data = await res.json();
      setUploads([...uploads, data]);
      setProgress(100);
    } catch (err) {
      setError('Failed to upload file. Please try again.');
    } finally {
      setProgress(0);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setProgress(0);
      handleUpload(e.target.files[0]);
    }
  };

  return (
    <div>
      <h2>Upload Files</h2>
      <input type="file" onChange={handleFileChange} />
      <progress value={progress} max="100">{progress}%</progress>
      {error && <p>{error}</p>}
      <ul>
        {uploads.map((upload) => (
          <li key={upload.id}>{upload.filename}</li>
        ))}
      </ul>
    </div>
  );
};

export default Upload;
