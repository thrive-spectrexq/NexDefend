import React, { useState } from 'react';
import styles from './Upload.module.css';

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
    if (!file) {
      setError("No file selected. Please choose a file to upload.");
      return;
    }

    const formData = new FormData();
    formData.append('uploadFile', file); // Updated to match backend

    try {
      setError('');
      setProgress(10); // Start with a small value to indicate progress has begun
      const res = await fetch(`${API_URL}/api/v1/upload`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
        body: formData,
      });

      if (!res.ok) throw new Error('Upload failed');
      const data = await res.json();

      // Check response structure
      if (!data.id || !data.filename) {
        throw new Error('Unexpected response format');
      }

      setUploads((prevUploads) => [...prevUploads, data]);
      setProgress(100);
    } catch (err) {
      setError('Failed to upload file. Please try again.');
      console.error("Error uploading file:", err);
    } finally {
      setTimeout(() => setProgress(0), 500);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      handleUpload(e.target.files[0]);
    }
  };

  return (
    <div className={styles.container}>
      <h2 className={styles.header}>Upload Files</h2>
      <input type="file" onChange={handleFileChange} className={styles.fileInput} />
      <progress value={progress} max="100" className={styles.progress}>{progress}%</progress>
      {error && <p className={styles.error}>{error}</p>}
      <ul className={styles.uploadList}>
        {uploads.map((upload) => (
          <li key={upload.id} className={styles.uploadItem}>{upload.filename}</li>
        ))}
      </ul>
    </div>
  );
};

export default Upload;
