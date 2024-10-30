// src/components/IncidentReport.tsx
import React, { useEffect, useState } from 'react';

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
      headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
    })
      .then(res => res.json())
      .then(data => setReports(data))
      .catch(() => setError('Failed to fetch reports.'));
  }, []);

  const handleAddComment = async (reportId: string) => {
    try {
      const res = await fetch(`${API_URL}/api/v1/incident-report/${reportId}/comment`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({ comment: newComment }),
      });

      if (!res.ok) throw new Error('Failed to add comment.');
      const updatedReport = await res.json();
      setReports((prevReports) =>
        prevReports.map(report => report.id === reportId ? updatedReport : report)
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
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
      });

      if (!res.ok) throw new Error('Failed to resolve report.');
      setReports((prevReports) =>
        prevReports.map(report =>
          report.id === reportId ? { ...report, status: 'Resolved' } : report
        )
      );
    } catch {
      setError('Failed to resolve report.');
    }
  };

  return (
    <div>
      <h2>Incident Reports</h2>
      {error && <p>{error}</p>}
      <ul>
        {reports.map(report => (
          <li key={report.id}>
            <p><strong>Description:</strong> {report.description}</p>
            <p><strong>Date:</strong> {report.date}</p>
            <p><strong>Status:</strong> {report.status}</p>
            <ul>
              <strong>Comments:</strong>
              {report.comments.map((comment, index) => (
                <li key={index}>{comment}</li>
              ))}
            </ul>
            <input
              type="text"
              placeholder="Add a comment"
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
            />
            <button onClick={() => handleAddComment(report.id)}>Add Comment</button>
            {report.status !== 'Resolved' && (
              <button onClick={() => handleResolveReport(report.id)}>Mark as Resolved</button>
            )}
          </li>
        ))}
      </ul>
    </div>
  );
};

export default IncidentReport;
