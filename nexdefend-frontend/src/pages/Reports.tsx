import { useState } from 'react';
import { PageTransition } from '../components/common/PageTransition';
import { FileText, Download, Filter, Calendar } from 'lucide-react';

const Reports = () => {
  const [reportType, setReportType] = useState('summary');

  const handleGenerateReport = () => {
    // Generate report logic
    alert(`Generating ${reportType} report... (Simulated)`);
  };

  return (
    <PageTransition className="space-y-6">
      <h1 className="text-2xl font-bold text-text flex items-center gap-3">
          <FileText className="text-brand-blue" />
          Reports & Analytics
      </h1>

      <div className="bg-surface border border-surface-highlight rounded-lg p-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
              <div>
                  <label htmlFor="reportType" className="block text-sm font-medium text-text-muted mb-2">Report Type</label>
                  <div className="relative">
                      <select
                        id="reportType"
                        value={reportType}
                        onChange={(e) => setReportType(e.target.value)}
                        className="w-full bg-background border border-surface-highlight rounded-lg px-4 py-2.5 text-text appearance-none focus:outline-none focus:border-brand-blue"
                      >
                        <option value="summary">Executive Summary</option>
                        <option value="detailed">Detailed Incident Log</option>
                        <option value="compliance">SOC2 Compliance Audit</option>
                        <option value="network">Network Traffic Analysis</option>
                      </select>
                      <Filter className="absolute right-3 top-3 text-text-muted pointer-events-none" size={16} />
                  </div>
              </div>
              <div>
                  <label className="block text-sm font-medium text-text-muted mb-2">Time Range</label>
                  <div className="relative">
                      <select className="w-full bg-background border border-surface-highlight rounded-lg px-4 py-2.5 text-text appearance-none focus:outline-none focus:border-brand-blue">
                        <option>Last 24 Hours</option>
                        <option>Last 7 Days</option>
                        <option>Last 30 Days</option>
                        <option>Custom Range</option>
                      </select>
                      <Calendar className="absolute right-3 top-3 text-text-muted pointer-events-none" size={16} />
                  </div>
              </div>
              <div className="flex items-end">
                  <button
                    onClick={handleGenerateReport}
                    className="w-full bg-brand-blue text-background hover:bg-brand-blue/90 font-semibold py-2.5 px-4 rounded-lg flex items-center justify-center gap-2 transition-colors"
                  >
                      <Download size={18} />
                      Generate Report
                  </button>
              </div>
          </div>
      </div>

      <div className="bg-surface border border-surface-highlight rounded-lg p-12 text-center border-dashed">
          <div className="inline-flex p-4 bg-surface-highlight/30 rounded-full text-text-muted mb-4">
              <FileText size={48} />
          </div>
          <h3 className="text-lg font-medium text-text mb-2">Report Preview</h3>
          <p className="text-text-muted max-w-md mx-auto">
              Select a report type and time range above to generate a preview of your security data.
          </p>
      </div>
    </PageTransition>
  );
};

export default Reports;
