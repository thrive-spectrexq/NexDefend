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
  const [successMessage, setSuccessMessage] = useState('');

  const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB

  const handleUpload = async (file: File) => {
    if (!file) {
      setError("No file selected. Please choose a file to upload.");
      return;
    }

    if (file.size > MAX_FILE_SIZE) {
      setError("File size exceeds 10MB limit.");
      return;
    }

    const formData = new FormData();
    formData.append('uploadFile', file);

    try {
      setError('');
      setSuccessMessage('');
      setProgress(10);

      const res = await fetch(`${API_URL}/api/v1/upload`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
        body: formData,
      });

      if (!res.ok) {
        const errorResponse = await res.json();
        throw new Error(errorResponse.message || 'Upload failed.');
      }

      const data = await res.json();

      if (!data.id || !data.filename) {
        throw new Error('Unexpected response format.');
      }

      setUploads((prevUploads) => [...prevUploads, data]);
      setSuccessMessage('File uploaded successfully!');
      setProgress(100);
    } catch (err: any) {
      setError(err.message || 'Failed to upload file. Please try again.');
    } finally {
      setTimeout(() => setProgress(0), 1000); // Reset progress after 1 second
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
      <progress value={progress} max="100" className={styles.progress}>
        {progress}%
      </progress>
      {error && <p className={styles.error}>{error}</p>}
      {successMessage && <p className={styles.success}>{successMessage}</p>}
      <ul className={styles.uploadList}>
        {uploads.map((upload) => (
          <li key={upload.id} className={styles.uploadItem}>
            {upload.filename}
          </li>
        ))}
      </ul>
    </div>
  );
};

export default Upload;
