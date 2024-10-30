import React, { useEffect, useState } from 'react';
import styles from './IncidentReport.module.css';

const API_URL = "http://localhost:8080";

interface Incident {
  id: string;
  description: string;
  date: string;
  status: string;
  comments: string[];
}

const IncidentReport: React.FC = () => {
  const [reports, setReports] = useState<Incident[]>([]);
  const [newComment, setNewComment] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    fetch(`${API_URL}/api/v1/incident-report`, {
      headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
    })
      .then((res) => res.json())
      .then((data) => setReports(data))
      .catch(() => setError('Failed to fetch reports.'));
  }, []);

  const handleAddComment = async (reportId: string) => {
    try {
      const res = await fetch(`${API_URL}/api/v1/incident-report/${reportId}/comment`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
        body: JSON.stringify({ comment: newComment }),
      });

      if (!res.ok) throw new Error('Failed to add comment.');
      const updatedReport = await res.json();
      setReports((prevReports) =>
        prevReports.map((report) => (report.id === reportId ? updatedReport : report))
      );
      setNewComment('');
    } catch {
      setError('Failed to add comment.');
    }
  };

  const handleResolveReport = async (reportId: string) => {
    try {
      const res = await fetch(`${API_URL}/api/v1/incident-report/${reportId}/resolve`, {
        method: 'PUT',
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
      });

      if (!res.ok) throw new Error('Failed to resolve report.');
      setReports((prevReports) =>
        prevReports.map((report) =>
          report.id === reportId ? { ...report, status: 'Resolved' } : report
        )
      );
    } catch {
      setError('Failed to resolve report.');
    }
  };

  return (
    <div className={styles.reportContainer}>
      <h2 className={styles.header}>Incident Reports</h2>
      {error && <p className={styles.error}>{error}</p>}
      <ul className={styles.reportList}>
        {reports.map((report) => (
          <li key={report.id} className={`${styles.reportItem} ${styles[report.status.toLowerCase()]}`}>
            <p><strong>Description:</strong> {report.description}</p>
            <p><strong>Date:</strong> {report.date}</p>
            <p><strong>Status:</strong> {report.status}</p>
            <div className={styles.commentSection}>
              <strong>Comments:</strong>
              <ul>
                {report.comments.map((comment, index) => (
                  <li key={index} className={styles.comment}>{comment}</li>
                ))}
              </ul>
            </div>
            <input
              type="text"
              placeholder="Add a comment"
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              className={styles.input}
            />
            <button onClick={() => handleAddComment(report.id)} className={styles.button}>Add Comment</button>
            {report.status !== 'Resolved' && (
              <button onClick={() => handleResolveReport(report.id)} className={`${styles.button} ${styles.resolveButton}`}>Mark as Resolved</button>
            )}
          </li>
        ))}
      </ul>
    </div>
  );
};

export default IncidentReport;
