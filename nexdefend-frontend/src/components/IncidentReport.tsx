import React, { useEffect, useState } from 'react';
import styles from './IncidentReport.module.css';

const API_URL = process.env.REACT_APP_API_URL;

interface Incident {
  id: string;
  description: string;
  date: string;
  status: string;
  severity: string;
  assignedTo?: string;
  comments: string[];
}

const IncidentReport: React.FC = () => {
  const [reports, setReports] = useState<Incident[]>([]);
  const [newComment, setNewComment] = useState('');
  const [assignee, setAssignee] = useState('');
  const [error, setError] = useState('');
  const [filter, setFilter] = useState('');
  const [sort, setSort] = useState('');

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
      const response = await fetch(`${API_URL}/api/v1/incident-report/${reportId}/comment`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
        body: JSON.stringify({ comment: newComment }),
      });

      if (!response.ok) {
        throw new Error('Failed to add comment');
      }

      setReports((prevReports) =>
        prevReports.map((report) =>
          report.id === reportId ? { ...report, comments: [...report.comments, newComment] } : report
        )
      );
      setNewComment('');
    } catch (error) {
      setError((error as Error).message);
    }
  };

  const handleAssign = async (reportId: string) => {
    try {
      const response = await fetch(`${API_URL}/api/v1/incident-report/${reportId}/assign`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
        body: JSON.stringify({ assignedTo: assignee }),
      });

      if (!response.ok) {
        throw new Error('Failed to assign incident');
      }

      setReports((prevReports) =>
        prevReports.map((report) =>
          report.id === reportId ? { ...report, assignedTo: assignee } : report
        )
      );
      setAssignee('');
    } catch (error) {
      setError((error as Error).message);
    }
  };

  const handleStatusUpdate = async (reportId: string, status: string) => {
    try {
      const response = await fetch(`${API_URL}/api/v1/incident-report/${reportId}/status`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
        body: JSON.stringify({ status }),
      });

      if (!response.ok) {
        throw new Error('Failed to update status');
      }

      setReports((prevReports) =>
        prevReports.map((report) =>
          report.id === reportId ? { ...report, status } : report
        )
      );
    } catch (error) {
      setError((error as Error).message);
    }
  };

  const filteredReports = reports.filter((report) =>
    report.description.toLowerCase().includes(filter.toLowerCase())
  );

  const sortedReports = [...filteredReports].sort((a, b) => {
    if (sort === 'date') {
      return new Date(a.date).getTime() - new Date(b.date).getTime();
    }
    if (sort === 'severity') {
      return a.severity.localeCompare(b.severity);
    }
    return 0;
  });

  return (
    <div className={styles.incidentReport}>
      <h2>Incident Reports</h2>
      {error && <p className={styles.error}>{error}</p>}
      <div className={styles.filterSort}>
        <input
          type="text"
          placeholder="Filter by description"
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
        />
        <select value={sort} onChange={(e) => setSort(e.target.value)}>
          <option value="">Sort by</option>
          <option value="date">Date</option>
          <option value="severity">Severity</option>
        </select>
      </div>
      <div className={styles.reportList}>
        {sortedReports.map((report) => (
          <div key={report.id} className={styles.reportItem}>
            <p><strong>Description:</strong> {report.description}</p>
            <p><strong>Date:</strong> {report.date}</p>
            <p><strong>Status:</strong> {report.status}</p>
            <p><strong>Severity:</strong> {report.severity}</p>
            <p><strong>Assigned To:</strong> {report.assignedTo || 'Unassigned'}</p>
            <div className={styles.comments}>
              <h4>Comments</h4>
              <ul>
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
            </div>
            <div className={styles.assign}>
              <input
                type="text"
                placeholder="Assign to"
                value={assignee}
                onChange={(e) => setAssignee(e.target.value)}
              />
              <button onClick={() => handleAssign(report.id)}>Assign</button>
            </div>
            <div className={styles.statusUpdate}>
              <select
                value={report.status}
                onChange={(e) => handleStatusUpdate(report.id, e.target.value)}
              >
                <option value="Open">Open</option>
                <option value="In Progress">In Progress</option>
                <option value="Resolved">Resolved</option>
                <option value="Closed">Closed</option>
              </select>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default IncidentReport;