/**
 * RiskDashboard.jsx - Risk assessment and threat analysis
 */
import React, { useEffect, useState } from 'react';
import { ScatterChart, Scatter, ResponsiveContainer, XAxis, YAxis, CartesianGrid, Tooltip, Cell, BarChart, Bar, Legend } from 'recharts';
import Card from '../components/common/Card';
import LoadingSkeleton from '../components/common/LoadingSkeleton';
import { readStoredUser } from '../api';

const RiskDashboard = ({ orgId }) => {
  const currentUser = readStoredUser()
  const resolvedOrgId = orgId || currentUser.org_id || currentUser.orgId
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Simulate data load
    setTimeout(() => setLoading(false), 1000);
  }, [resolvedOrgId]);

  if (loading) {
    return <div className="space-y-6 p-6"><LoadingSkeleton count={3} /></div>;
  }

  const riskMatrix = [
    { x: 1, y: 4, name: 'Critical: Unpatched systems', size: 800, fill: '#DC2626' },
    { x: 2, y: 3, name: 'High: Default credentials', size: 600, fill: '#F59E0B' },
    { x: 3, y: 2, name: 'Medium: Missing configs', size: 400, fill: '#F97316' },
    { x: 4, y: 1, name: 'Low: Info disclosure', size: 200, fill: '#3B82F6' },
  ];

  const riskTrend = [
    { date: 'Day 1', critical: 5, high: 12, medium: 28, low: 45 },
    { date: 'Day 2', critical: 5, high: 10, medium: 30, low: 47 },
    { date: 'Day 3', critical: 4, high: 9, medium: 28, low: 48 },
    { date: 'Day 4', critical: 4, high: 8, medium: 25, low: 50 },
    { date: 'Day 5', critical: 3, high: 7, medium: 22, low: 52 },
    { date: 'Day 6', critical: 3, high: 6, medium: 20, low: 54 },
    { date: 'Day 7', critical: 2, high: 5, medium: 18, low: 56 },
  ];

  const topRisks = [
    { id: 1, name: 'Unpatched CVE-2024-1234', severity: 'critical', devices: 12, impact: 'High' },
    { id: 2, name: 'Default Admin Credentials', severity: 'high', devices: 8, impact: 'Critical' },
    { id: 3, name: 'Weak Encryption', severity: 'high', devices: 15, impact: 'Medium' },
    { id: 4, name: 'Missing Firewall Rules', severity: 'medium', devices: 22, impact: 'Medium' },
    { id: 5, name: 'Outdated TLS Version', severity: 'medium', devices: 18, impact: 'Low' },
  ];

  return (
    <div className="space-y-6 p-6">
      {/* Risk Summary */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="border-l-4 border-l-red-500">
          <div className="text-sm text-gray-400">Critical</div>
          <div className="mt-2 text-3xl font-bold text-red-400">2</div>
          <div className="mt-1 text-xs text-gray-500">Immediate action required</div>
        </Card>

        <Card className="border-l-4 border-l-amber-500">
          <div className="text-sm text-gray-400">High</div>
          <div className="mt-2 text-3xl font-bold text-amber-400">5</div>
          <div className="mt-1 text-xs text-gray-500">Within 24 hours</div>
        </Card>

        <Card className="border-l-4 border-l-orange-500">
          <div className="text-sm text-gray-400">Medium</div>
          <div className="mt-2 text-3xl font-bold text-orange-400">18</div>
          <div className="mt-1 text-xs text-gray-500">Within 7 days</div>
        </Card>

        <Card className="border-l-4 border-l-blue-500">
          <div className="text-sm text-gray-400">Low</div>
          <div className="mt-2 text-3xl font-bold text-blue-400">56</div>
          <div className="mt-1 text-xs text-gray-500">Low priority</div>
        </Card>
      </div>

      {/* Risk Matrix */}
      <Card>
        <h3 className="text-lg font-semibold text-gray-100 mb-4">Risk Matrix (Likelihood vs Impact)</h3>
        <ResponsiveContainer width="100%" height={300}>
          <ScatterChart margin={{ top: 20, right: 20, bottom: 20, left: 20 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
            <XAxis dataKey="x" stroke="#9CA3AF" name="Likelihood" />
            <YAxis dataKey="y" stroke="#9CA3AF" name="Impact" />
            <Tooltip cursor={{ strokeDasharray: '3 3' }} contentStyle={{ backgroundColor: '#1F2937' }} />
            <Scatter name="Risk" data={riskMatrix}>
              {riskMatrix.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.fill} />
              ))}
            </Scatter>
          </ScatterChart>
        </ResponsiveContainer>
      </Card>

      {/* Risk Trend */}
      <Card>
        <h3 className="text-lg font-semibold text-gray-100 mb-4">7-Day Risk Trend</h3>
        <ResponsiveContainer width="100%" height={250}>
          <BarChart data={riskTrend}>
            <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
            <XAxis dataKey="date" stroke="#9CA3AF" />
            <YAxis stroke="#9CA3AF" />
            <Tooltip contentStyle={{ backgroundColor: '#1F2937' }} />
            <Legend />
            <Bar dataKey="critical" fill="#DC2626" />
            <Bar dataKey="high" fill="#F59E0B" />
            <Bar dataKey="medium" fill="#F97316" />
            <Bar dataKey="low" fill="#3B82F6" />
          </BarChart>
        </ResponsiveContainer>
      </Card>

      {/* Top Risks */}
      <Card>
        <h3 className="text-lg font-semibold text-gray-100 mb-4">Top Risks</h3>
        <div className="space-y-3">
          {topRisks.map((risk) => (
            <div key={risk.id} className="flex items-center justify-between p-3 bg-gray-700 rounded hover:bg-gray-600">
              <div>
                <div className="text-sm font-medium text-gray-300">{risk.name}</div>
                <div className="text-xs text-gray-500">{risk.devices} devices affected</div>
              </div>
              <div className="flex gap-2">
                <span className={`text-xs px-2 py-1 rounded ${risk.severity === 'critical' ? 'bg-red-900 text-red-200' : risk.severity === 'high' ? 'bg-amber-900 text-amber-200' : 'bg-orange-900 text-orange-200'}`}>
                  {risk.severity.toUpperCase()}
                </span>
              </div>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
};

export default RiskDashboard;
