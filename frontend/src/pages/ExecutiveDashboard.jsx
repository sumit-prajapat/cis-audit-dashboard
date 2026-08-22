/**
 * ExecutiveDashboard.jsx - C-Level security posture dashboard
 */
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  BarChart, Bar, LineChart, Line, PieChart, Pie, Cell,
  ResponsiveContainer, XAxis, YAxis, CartesianGrid, Tooltip, Legend
} from 'recharts';
import { Zap } from 'lucide-react';
import Card from '../components/common/Card';
import LoadingSkeleton from '../components/common/LoadingSkeleton';
import { useTheme } from '../contexts/ThemeContext';
import { scanService, deviceService } from '../services';
import { readStoredUser } from '../api';

const ExecutiveDashboard = ({ orgId }) => {
  const navigate = useNavigate();
  const currentUser = readStoredUser()
  const resolvedOrgId = orgId || currentUser.org_id || currentUser.orgId
  const { colors } = useTheme();
  const [loading, setLoading] = useState(true);
  const [metrics, setMetrics] = useState(null);
  const [complianceTrend, setComplianceTrend] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      if (!resolvedOrgId) {
        setLoading(false)
        return
      }

      try {
        const [compliance, devices, scans] = await Promise.all([
          scanService.getOrgCompliance(resolvedOrgId),
          deviceService.getDeviceStats(resolvedOrgId),
          scanService.getOrgScans(resolvedOrgId, { limit: 5 })
        ]);

        setMetrics({
          securityScore: compliance.org_compliance_score,
          deviceCount: devices.total_devices,
          activeDevices: devices.active_devices,
          criticalFindings: compliance.failed_checks,
          complianceStatus: compliance.org_compliance_score > 80 ? 'Healthy' : 'At Risk',
          osBreakdown: devices.os_breakdown,
          recentScans: scans,
        });

        // Simulate trend data
        setComplianceTrend([
          { date: '7d ago', score: compliance.org_compliance_score - 5 },
          { date: '6d ago', score: compliance.org_compliance_score - 3 },
          { date: '5d ago', score: compliance.org_compliance_score - 2 },
          { date: '4d ago', score: compliance.org_compliance_score },
          { date: '3d ago', score: compliance.org_compliance_score + 2 },
          { date: 'Today', score: compliance.org_compliance_score },
        ]);

        setLoading(false);
      } catch (error) {
        console.error('Dashboard data error:', error);
        setLoading(false);
      }
    };

    fetchData();
  }, [resolvedOrgId]);

  if (loading) {
    return <div className="space-y-6 p-6"><LoadingSkeleton count={4} /></div>;
  }

  return (
    <div className="space-y-6 p-6">
      {/* Quick Scan Button - Prominent */}
      <div className="bg-gradient-to-r from-emerald-500/10 via-cyan-500/10 to-blue-500/10 border border-emerald-500/20 rounded-xl p-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-white mb-2 flex items-center gap-2">
              <Zap className="w-6 h-6 text-emerald-400" />
              Ready to Scan Your Systems?
            </h2>
            <p className="text-slate-300">
              Download our one-click scanner for Windows or Linux. No Python, no command line - just run the file and see results here!
            </p>
          </div>
          <button
            onClick={() => navigate('/quick-scan')}
            className="ml-4 px-8 py-4 bg-gradient-to-r from-emerald-500 to-cyan-500 hover:from-emerald-600 hover:to-cyan-600 text-white font-bold rounded-lg shadow-lg shadow-emerald-500/25 transition-all transform hover:scale-105 flex items-center gap-2 whitespace-nowrap"
          >
            <Zap className="w-5 h-5" />
            Quick Scan
          </button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <div className="text-sm font-medium text-gray-400">Security Score</div>
          <div className="mt-2 text-3xl font-bold text-sky-400">{(metrics?.securityScore || 0).toFixed(1)}%</div>
          <div className="mt-1 text-xs text-gray-500">Organization-wide compliance</div>
        </Card>

        <Card>
          <div className="text-sm font-medium text-gray-400">Devices</div>
          <div className="mt-2 text-3xl font-bold text-emerald-400">{metrics?.deviceCount}</div>
          <div className="mt-1 text-xs text-gray-500">{metrics?.activeDevices} active</div>
        </Card>

        <Card>
          <div className="text-sm font-medium text-gray-400">Critical Findings</div>
          <div className="mt-2 text-3xl font-bold text-red-400">{metrics?.criticalFindings}</div>
          <div className="mt-1 text-xs text-gray-500">Require remediation</div>
        </Card>

        <Card>
          <div className="text-sm font-medium text-gray-400">Status</div>
          <div className={`mt-2 text-lg font-bold ${metrics?.securityScore > 80 ? 'text-emerald-400' : 'text-red-400'}`}>
            {metrics?.complianceStatus}
          </div>
          <div className="mt-1 text-xs text-gray-500">Current posture</div>
        </Card>
      </div>

      {/* Compliance Trend */}
      <Card>
        <h3 className="text-lg font-semibold text-gray-100 mb-4">Compliance Trend (7 Days)</h3>
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={complianceTrend}>
            <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
            <XAxis dataKey="date" stroke="#9CA3AF" />
            <YAxis stroke="#9CA3AF" />
            <Tooltip contentStyle={{ backgroundColor: '#1F2937', border: 'none', borderRadius: '8px' }} />
            <Line type="monotone" dataKey="score" stroke="#0EA5E9" strokeWidth={2} dot={{ fill: '#0EA5E9' }} />
          </LineChart>
        </ResponsiveContainer>
      </Card>

      {/* OS Distribution & Recent Scans */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <h3 className="text-lg font-semibold text-gray-100 mb-4">OS Distribution</h3>
          <ResponsiveContainer width="100%" height={250}>
            <PieChart>
              <Pie
                data={metrics?.osBreakdown || []}
                dataKey="count"
                nameKey="os_type"
                cx="50%"
                cy="50%"
                outerRadius={80}
              >
                {metrics?.osBreakdown?.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={[colors.primary[500], colors.info[500], colors.success[500]][index % 3]} />
                ))}
              </Pie>
              <Tooltip contentStyle={{ backgroundColor: '#1F2937', border: 'none' }} />
            </PieChart>
          </ResponsiveContainer>
        </Card>

        <Card>
          <h3 className="text-lg font-semibold text-gray-100 mb-4">Recent Scans</h3>
          <div className="space-y-3">
            {metrics?.recentScans?.map((scan) => (
              <div key={scan.id} className="flex justify-between items-center p-3 bg-gray-700 rounded-lg">
                <span className="text-sm text-gray-300">{scan.device_id}</span>
                <span className={`text-sm font-bold ${scan.compliance_score > 80 ? 'text-emerald-400' : 'text-red-400'}`}>
                  {(scan.compliance_score || 0).toFixed(1)}%
                </span>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </div>
  );
};

export default ExecutiveDashboard;
