import React, { useState } from 'react';

const API_URL = process.env.REACT_APP_API_URL;

interface UploadFile {
  id: string;
  filename: string;
  progress: number;
  error: string;
  success: boolean;
}

const Upload: React.FC = () => {
  const [uploads, setUploads] = useState<UploadFile[]>([]);
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB
  const ALLOWED_FILE_TYPES = ['image/jpeg', 'image/png', 'application/pdf'];

  const handleUpload = async (files: FileList) => {
    const newUploads = Array.from(files).map(file => ({
      id: file.name,
      filename: file.name,
      progress: 0,
      error: '',
      success: false,
    }));

    setUploads(prevUploads => [...prevUploads, ...newUploads]);

    for (const file of Array.from(files)) {
      if (!ALLOWED_FILE_TYPES.includes(file.type)) {
        setError(`File type not allowed: ${file.name}`);
        continue;
      }

      if (file.size > MAX_FILE_SIZE) {
        setError(`File size exceeds 10MB limit: ${file.name}`);
        continue;
      }

      const formData = new FormData();
      formData.append('uploadFile', file);

      const xhr = new XMLHttpRequest();
      xhr.open('POST', `${API_URL}/upload`, true);

      xhr.upload.onprogress = (event) => {
        if (event.lengthComputable) {
          const progress = Math.round((event.loaded * 100) / event.total);
          setUploads(prevUploads =>
            prevUploads.map(upload =>
              upload.id === file.name ? { ...upload, progress } : upload
            )
          );
        }
      };

      xhr.onload = () => {
        if (xhr.status === 200) {
          setUploads(prevUploads =>
            prevUploads.map(upload =>
              upload.id === file.name ? { ...upload, success: true } : upload
            )
          );
          setSuccessMessage(`File uploaded successfully: ${file.name}`);
        } else {
          setUploads(prevUploads =>
            prevUploads.map(upload =>
              upload.id === file.name ? { ...upload, error: `Failed to upload file: ${file.name}` } : upload
            )
          );
        }
      };

      xhr.onerror = () => {
        setUploads(prevUploads =>
          prevUploads.map(upload =>
            upload.id === file.name ? { ...upload, error: `Failed to upload file: ${file.name}` } : upload
          )
        );
      };

      xhr.send(formData);
    }
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files) {
      handleUpload(event.target.files);
    }
  };

  return (
    <div>
      <h2>Upload Files</h2>
      {error && <p>{error}</p>}
      {successMessage && <p>{successMessage}</p>}
      <input type="file" multiple onChange={handleFileChange} />
      <div>
        {uploads.map(upload => (
          <div key={upload.id}>
            <p>{upload.filename}</p>
            {upload.progress > 0 && (
              <div>
                <div
                  style={{ width: `${upload.progress}%` }}
                ></div>
              </div>
            )}
            {upload.error && <p>{upload.error}</p>}
            {upload.success && <p>Upload successful</p>}
          </div>
        ))}
      </div>
    </div>
  );
};

export default Upload;
