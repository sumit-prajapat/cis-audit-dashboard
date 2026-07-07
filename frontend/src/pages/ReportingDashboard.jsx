/**
 * ReportingDashboard.jsx - Report generation and distribution
 */
import React, { useEffect, useState } from 'react';
import Card from '../components/common/Card';
import Button from '../components/common/Button';
import LoadingSkeleton from '../components/common/LoadingSkeleton';
import { reportService } from '../services';
import { readStoredUser } from '../api';

const ReportingDashboard = ({ orgId }) => {
  const currentUser = readStoredUser()
  const resolvedOrgId = orgId || currentUser.org_id || currentUser.orgId
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showNewReportForm, setShowNewReportForm] = useState(false);

  useEffect(() => {
    const fetchReports = async () => {
      if (!resolvedOrgId) {
        setLoading(false)
        return
      }

      try {
        const reportList = await reportService.getReports(resolvedOrgId);
        setReports(reportList || []);
        setLoading(false);
      } catch (error) {
        console.error('Reports data error:', error);
        setLoading(false);
      }
    };

    fetchReports();
  }, [resolvedOrgId]);

  const handleGenerateReport = async (reportType) => {
    try {
      await reportService.createReport({
        org_id: resolvedOrgId,
        title: `${reportType} Report - ${new Date().toLocaleDateString()}`,
        report_type: reportType.toLowerCase(),
        format: 'pdf',
      });
      alert('Report generation started');
    } catch (error) {
      console.error('Error generating report:', error);
    }
  };

  if (loading) {
    return <div className="space-y-6 p-6"><LoadingSkeleton count={3} /></div>;
  }

  const quickReports = [
    { type: 'Executive', icon: '📊', color: 'bg-sky-900' },
    { type: 'Technical', icon: '⚙️', color: 'bg-purple-900' },
    { type: 'Compliance', icon: '✓', color: 'bg-emerald-900' },
    { type: 'Risk', icon: '⚠️', color: 'bg-red-900' },
  ];

  return (
    <div className="space-y-6 p-6">
      {/* Quick Generate */}
      <Card>
        <h3 className="text-lg font-semibold text-gray-100 mb-4">Quick Report Generation</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
          {quickReports.map((report) => (
            <button
              key={report.type}
              onClick={() => handleGenerateReport(report.type)}
              className={`${report.color} p-4 rounded-lg text-white font-medium text-sm hover:opacity-90 transition-opacity flex items-center gap-2`}
            >
              <span>{report.icon}</span>
              {report.type}
            </button>
          ))}
        </div>
      </Card>

      {/* Scheduled Reports */}
      <Card>
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-semibold text-gray-100">Scheduled Reports</h3>
          <Button size="sm" variant="primary" onClick={() => setShowNewReportForm(!showNewReportForm)}>
            + Schedule Report
          </Button>
        </div>

        {showNewReportForm && (
          <div className="mb-6 p-4 bg-gray-700 rounded-lg space-y-3">
            <div>
              <label className="text-sm text-gray-300">Report Type</label>
              <select className="w-full mt-1 bg-gray-600 text-gray-100 px-3 py-2 rounded border border-gray-500">
                <option>Executive</option>
                <option>Technical</option>
                <option>Compliance</option>
              </select>
            </div>

            <div>
              <label className="text-sm text-gray-300">Frequency</label>
              <select className="w-full mt-1 bg-gray-600 text-gray-100 px-3 py-2 rounded border border-gray-500">
                <option>Daily</option>
                <option>Weekly</option>
                <option>Monthly</option>
              </select>
            </div>

            <div className="flex gap-2">
              <Button size="sm" variant="primary">Save Schedule</Button>
              <Button size="sm" variant="secondary" onClick={() => setShowNewReportForm(false)}>Cancel</Button>
            </div>
          </div>
        )}

        <div className="space-y-2">
          {reports?.slice(0, 5).map((report) => (
            <div key={report.id} className="flex items-center justify-between p-3 bg-gray-700 rounded hover:bg-gray-600">
              <div>
                <div className="text-sm font-medium text-gray-300">{report.title}</div>
                <div className="text-xs text-gray-500">
                  {report.schedule} • Last: {new Date(report.last_generated_at).toLocaleDateString()}
                </div>
              </div>
              <div className="flex gap-2">
                <Button size="sm" variant="ghost">↓ Download</Button>
                <Button size="sm" variant="ghost">✎ Edit</Button>
              </div>
            </div>
          ))}
        </div>
      </Card>

      {/* Report History */}
      <Card>
        <h3 className="text-lg font-semibold text-gray-100 mb-4">Report Archive</h3>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="border-b border-gray-700">
              <tr className="text-gray-400">
                <th className="pb-2 text-left font-medium">Title</th>
                <th className="pb-2 text-left font-medium">Type</th>
                <th className="pb-2 text-left font-medium">Generated</th>
                <th className="pb-2 text-left font-medium">Size</th>
                <th className="pb-2 text-left font-medium">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-700">
              {reports?.slice(0, 8).map((report) => (
                <tr key={report.id} className="hover:bg-gray-700">
                  <td className="py-3 text-gray-300">{report.title}</td>
                  <td className="py-3 text-gray-400 text-xs">
                    <span className="bg-sky-900 text-sky-200 px-2 py-1 rounded">
                      {report.report_type}
                    </span>
                  </td>
                  <td className="py-3 text-gray-400 text-xs">
                    {new Date(report.created_at).toLocaleDateString()}
                  </td>
                  <td className="py-3 text-gray-400 text-xs">
                    {report.file_size ? `${(report.file_size / 1024).toFixed(2)} KB` : 'N/A'}
                  </td>
                  <td className="py-3">
                    <Button size="sm" variant="ghost">↓</Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

      {/* Export Options */}
      <Card>
        <h3 className="text-lg font-semibold text-gray-100 mb-4">Bulk Export</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          <Button variant="outline" className="w-full">📋 Export as CSV</Button>
          <Button variant="outline" className="w-full">📊 Export as Excel</Button>
          <Button variant="outline" className="w-full">📄 Export as PDF</Button>
        </div>
      </Card>
    </div>
  );
};

export default ReportingDashboard;
