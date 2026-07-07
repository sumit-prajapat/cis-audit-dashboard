/**
 * ComplianceDashboard.jsx - CIS and framework compliance tracking
 */
import React, { useEffect, useState } from 'react';
import { AreaChart, Area, BarChart, Bar, ResponsiveContainer, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from 'recharts';
import Card from '../components/common/Card';
import LoadingSkeleton from '../components/common/LoadingSkeleton';
import { scanService } from '../services';
import { readStoredUser } from '../api';

const ComplianceDashboard = ({ orgId }) => {
  const currentUser = readStoredUser()
  const resolvedOrgId = orgId || currentUser.org_id || currentUser.orgId
  const [frameworks, setFrameworks] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      if (!resolvedOrgId) {
        setLoading(false)
        return
      }

      try {
        const compliance = await scanService.getOrgCompliance(resolvedOrgId);
        
        // Mock framework data
        const frameworkData = [
          { name: 'CIS', score: 78, controlsPassed: 156, controlsFailed: 44 },
          { name: 'NIST 800-53', score: 85, controlsPassed: 128, controlsFailed: 22 },
          { name: 'ISO 27001', score: 72, controlsPassed: 108, controlsFailed: 42 },
          { name: 'PCI-DSS', score: 88, controlsPassed: 106, controlsFailed: 14 },
        ];
        
        setFrameworks(frameworkData);
        setLoading(false);
      } catch (error) {
        console.error('Compliance data error:', error);
        setLoading(false);
      }
    };

    fetchData();
  }, [resolvedOrgId]);

  if (loading) {
    return <div className="space-y-6 p-6"><LoadingSkeleton count={3} /></div>;
  }

  const complianceTrend = [
    { month: 'Jan', CIS: 65, NIST: 70, ISO: 60, PCI: 75 },
    { month: 'Feb', CIS: 68, NIST: 72, ISO: 62, PCI: 76 },
    { month: 'Mar', CIS: 72, NIST: 78, ISO: 68, PCI: 82 },
    { month: 'Apr', CIS: 75, NIST: 82, ISO: 70, PCI: 85 },
    { month: 'May', CIS: 76, NIST: 84, ISO: 71, PCI: 87 },
    { month: 'Jun', CIS: 78, NIST: 85, ISO: 72, PCI: 88 },
  ];

  return (
    <div className="space-y-6 p-6">
      {/* Framework Scores */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {frameworks.map((fw) => (
          <Card key={fw.name}>
            <div className="text-sm font-medium text-gray-400">{fw.name}</div>
            <div className="mt-2 text-3xl font-bold text-sky-400">{fw.score}%</div>
            <div className="mt-2 text-xs text-gray-500">
              <div>✓ {fw.controlsPassed} passed</div>
              <div>✗ {fw.controlsFailed} failed</div>
            </div>
          </Card>
        ))}
      </div>

      {/* Compliance Trend */}
      <Card>
        <h3 className="text-lg font-semibold text-gray-100 mb-4">6-Month Compliance Trend</h3>
        <ResponsiveContainer width="100%" height={300}>
          <AreaChart data={complianceTrend}>
            <defs>
              <linearGradient id="colorCIS" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#0EA5E9" stopOpacity={0.3} />
                <stop offset="95%" stopColor="#0EA5E9" stopOpacity={0} />
              </linearGradient>
              <linearGradient id="colorNIST" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#22C55E" stopOpacity={0.3} />
                <stop offset="95%" stopColor="#22C55E" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
            <XAxis dataKey="month" stroke="#9CA3AF" />
            <YAxis stroke="#9CA3AF" />
            <Tooltip contentStyle={{ backgroundColor: '#1F2937', border: 'none' }} />
            <Legend />
            <Area type="monotone" dataKey="CIS" stroke="#0EA5E9" fill="url(#colorCIS)" />
            <Area type="monotone" dataKey="NIST" stroke="#22C55E" fill="url(#colorNIST)" />
          </AreaChart>
        </ResponsiveContainer>
      </Card>

      {/* Control Breakdown */}
      <Card>
        <h3 className="text-lg font-semibold text-gray-100 mb-4">Control Status</h3>
        <div className="space-y-4">
          {frameworks.map((fw) => (
            <div key={fw.name}>
              <div className="flex justify-between text-sm mb-1">
                <span className="text-gray-300">{fw.name}</span>
                <span className="text-gray-400">{fw.controlsPassed}/{fw.controlsPassed + fw.controlsFailed}</span>
              </div>
              <div className="w-full bg-gray-700 rounded-full h-2">
                <div
                  className="bg-emerald-500 h-2 rounded-full"
                  style={{ width: `${(fw.controlsPassed / (fw.controlsPassed + fw.controlsFailed)) * 100}%` }}
                />
              </div>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
};

export default ComplianceDashboard;
