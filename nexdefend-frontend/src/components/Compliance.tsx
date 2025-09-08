import React from 'react';
import styles from './Compliance.module.css';

// Mock data for compliance reports
const mockReports = [
  { id: 1, name: 'SOC 2 Type II', status: 'Compliant', date: '2023-10-26' },
  { id: 2, name: 'ISO/IEC 27001', status: 'In Progress', date: '2023-11-15' },
  { id: 3, name: 'PCI DSS', status: 'Compliant', date: '2023-09-01' },
  { id: 4, name: 'HIPAA', status: 'Non-Compliant', date: '2023-10-05' },
];

const Compliance: React.FC = () => {
  const downloadReport = (report: typeof mockReports[0]) => {
    const csvContent = "data:text/csv;charset=utf-8,"
      + "Report Name,Status,Date\n"
      + `${report.name},${report.status},${report.date}`;

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `${report.name.replace(/ /g, '_')}_report.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const downloadAllReports = () => {
    const csvRows = [
      "Report Name,Status,Date", // CSV header
      ...mockReports.map(report => `${report.name},${report.status},${report.date}`)
    ];
    const csvContent = "data:text/csv;charset=utf-8," + csvRows.join("\n");

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", "all_compliance_reports.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className={styles.complianceContainer}>
      <h1 className={styles.title}>Compliance Management</h1>
      <p>Monitor and manage compliance with various security standards and regulations.</p>
      <div className={styles.reportsTable}>
        <div className={styles.tableHeader}>
          <h2>Compliance Reports</h2>
          <button onClick={downloadAllReports} className={styles.downloadAllButton}>
            Download All Reports
          </button>
        </div>
        <table className={styles.table}>
          <thead>
            <tr>
              <th>Report Name</th>
              <th>Status</th>
              <th>Date</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {mockReports.map((report) => (
              <tr key={report.id}>
                <td>{report.name}</td>
                <td>
                  <span className={`${styles.status} ${styles[report.status.toLowerCase().replace(' ', '')]}`}>
                    {report.status}
                  </span>
                </td>
                <td>{report.date}</td>
                <td>
                  <button onClick={() => downloadReport(report)} className={styles.downloadButton}>
                    Download
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default Compliance;
