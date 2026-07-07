/**
 * SecurityOpsDashboard.jsx - Real-time security operations center view
 */
import React, { useEffect, useState } from 'react';
import { BarChart, Bar, ScatterChart, Scatter, ResponsiveContainer, XAxis, YAxis, CartesianGrid, Tooltip } from 'recharts';
import Card from '../components/common/Card';
import LoadingSkeleton from '../components/common/LoadingSkeleton';
import { scanService } from '../services';
import { readStoredUser } from '../api';

const SecurityOpsDashboard = ({ orgId }) => {
  const currentUser = readStoredUser()
  const resolvedOrgId = orgId || currentUser.org_id || currentUser.orgId
  const [findings, setFindings] = useState([]);
  const [activeScans, setActiveScans] = useState(0);
  const [threatLevel, setThreatLevel] = useState('MEDIUM');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      if (!resolvedOrgId) {
        setLoading(false)
        return
      }

      try {
        const scans = await scanService.getOrgScans(resolvedOrgId);
        const activeScanCount = scans?.filter(s => s.status === 'in_progress').length || 0;
        
        setActiveScans(activeScanCount);
        setFindings(scans?.slice(0, 10) || []);
        
        // Calculate threat level
        const failedCount = scans?.reduce((sum, s) => sum + s.failed_checks, 0) || 0;
        setThreatLevel(failedCount > 50 ? 'CRITICAL' : failedCount > 20 ? 'HIGH' : 'MEDIUM');
        
        setLoading(false);
      } catch (error) {
        console.error('SecurityOps data error:', error);
        setLoading(false);
      }
    };

    fetchData();
    const interval = setInterval(fetchData, 10000); // Refresh every 10s
    return () => clearInterval(interval);
  }, [resolvedOrgId]);

  if (loading) {
    return <div className="space-y-6 p-6"><LoadingSkeleton count={3} /></div>;
  }

  const riskData = [
    { severity: 'CRITICAL', count: 12, color: '#dc2626' },
    { severity: 'HIGH', count: 28, color: '#f59e0b' },
    { severity: 'MEDIUM', count: 45, color: '#f97316' },
    { severity: 'LOW', count: 89, color: '#3b82f6' },
  ];

  return (
    <div className="space-y-6 p-6">
      {/* Status Bar */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="border-l-4 border-l-sky-500">
          <div className="text-sm text-gray-400">Active Scans</div>
          <div className="mt-2 text-3xl font-bold text-sky-400">{activeScans}</div>
          <div className="mt-1 text-xs text-gray-500">Currently running</div>
        </Card>

        <Card className={`border-l-4 ${threatLevel === 'CRITICAL' ? 'border-l-red-500' : threatLevel === 'HIGH' ? 'border-l-amber-500' : 'border-l-yellow-500'}`}>
          <div className="text-sm text-gray-400">Threat Level</div>
          <div className={`mt-2 text-3xl font-bold ${threatLevel === 'CRITICAL' ? 'text-red-400' : threatLevel === 'HIGH' ? 'text-amber-400' : 'text-yellow-400'}`}>
            {threatLevel}
          </div>
          <div className="mt-1 text-xs text-gray-500">Latest assessment</div>
        </Card>

        <Card>
          <div className="text-sm text-gray-400">Live Findings</div>
          <div className="mt-2 text-3xl font-bold text-red-400">{findings.length}</div>
          <div className="mt-1 text-xs text-gray-500">Last 24 hours</div>
        </Card>
      </div>

      {/* Risk Matrix */}
      <Card>
        <h3 className="text-lg font-semibold text-gray-100 mb-4">Findings by Severity</h3>
        <ResponsiveContainer width="100%" height={250}>
          <BarChart data={riskData}>
            <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
            <XAxis dataKey="severity" stroke="#9CA3AF" />
            <YAxis stroke="#9CA3AF" />
            <Tooltip contentStyle={{ backgroundColor: '#1F2937', border: 'none' }} />
            <Bar dataKey="count" fill="#0EA5E9" />
          </BarChart>
        </ResponsiveContainer>
      </Card>

      {/* Recent Activity */}
      <Card>
        <h3 className="text-lg font-semibold text-gray-100 mb-4">Recent Activity</h3>
        <div className="space-y-2 max-h-64 overflow-y-auto">
          {findings.map((finding, idx) => (
            <div key={idx} className="flex items-center justify-between p-3 bg-gray-700 rounded hover:bg-gray-600 transition-colors">
              <span className="text-sm text-gray-300">Device: {finding.device_id?.slice(0, 8)}...</span>
              <span className={`text-xs px-2 py-1 rounded ${finding.failed_checks > 20 ? 'bg-red-900 text-red-200' : 'bg-yellow-900 text-yellow-200'}`}>
                {finding.failed_checks} issues
              </span>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
};

export default SecurityOpsDashboard;
