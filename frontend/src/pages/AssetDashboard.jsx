/**
 * AssetDashboard.jsx - Device inventory and asset management
 */
import React, { useEffect, useState } from 'react';
import { BarChart, Bar, LineChart, Line, ResponsiveContainer, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from 'recharts';
import Card from '../components/common/Card';
import LoadingSkeleton from '../components/common/LoadingSkeleton';
import { deviceService } from '../services';
import { readStoredUser } from '../api';

const AssetDashboard = ({ orgId }) => {
  const currentUser = readStoredUser()
  const resolvedOrgId = orgId || currentUser.org_id || currentUser.orgId
  const [devices, setDevices] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');

  useEffect(() => {
    const fetchData = async () => {
      if (!resolvedOrgId) {
        setLoading(false)
        return
      }

      try {
        const [deviceList, deviceStats] = await Promise.all([
          deviceService.getDevices(resolvedOrgId, { limit: 100 }),
          deviceService.getDeviceStats(resolvedOrgId),
        ]);

        setDevices(deviceList);
        setStats(deviceStats);
        setLoading(false);
      } catch (error) {
        console.error('Asset data error:', error);
        setLoading(false);
      }
    };

    fetchData();
  }, [resolvedOrgId]);

  if (loading) {
    return <div className="space-y-6 p-6"><LoadingSkeleton count={3} /></div>;
  }

  const healthTrend = [
    { date: 'Mon', healthy: 45, warning: 12, critical: 3 },
    { date: 'Tue', healthy: 46, warning: 10, critical: 4 },
    { date: 'Wed', healthy: 47, warning: 8, critical: 5 },
    { date: 'Thu', healthy: 48, warning: 7, critical: 5 },
    { date: 'Fri', healthy: 49, warning: 6, critical: 5 },
    { date: 'Sat', healthy: 50, warning: 5, critical: 5 },
    { date: 'Sun', healthy: 51, warning: 4, critical: 5 },
  ];

  const filteredDevices = filter === 'all' 
    ? devices 
    : devices?.filter(d => d.os_type === filter);

  return (
    <div className="space-y-6 p-6">
      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <div className="text-sm text-gray-400">Total Assets</div>
          <div className="mt-2 text-3xl font-bold text-sky-400">{stats?.total_devices}</div>
          <div className="mt-1 text-xs text-gray-500">Tracked devices</div>
        </Card>

        <Card>
          <div className="text-sm text-gray-400">Online</div>
          <div className="mt-2 text-3xl font-bold text-emerald-400">{stats?.online_devices}</div>
          <div className="mt-1 text-xs text-gray-500">{stats?.offline_devices} offline</div>
        </Card>

        <Card>
          <div className="text-sm text-gray-400">Windows</div>
          <div className="mt-2 text-3xl font-bold text-purple-400">
            {stats?.os_breakdown?.find(o => o.os_type === 'windows')?.count || 0}
          </div>
          <div className="mt-1 text-xs text-gray-500">Machines</div>
        </Card>

        <Card>
          <div className="text-sm text-gray-400">Linux</div>
          <div className="mt-2 text-3xl font-bold text-orange-400">
            {stats?.os_breakdown?.find(o => o.os_type === 'linux')?.count || 0}
          </div>
          <div className="mt-1 text-xs text-gray-500">Machines</div>
        </Card>
      </div>

      {/* Asset Health Trend */}
      <Card>
        <h3 className="text-lg font-semibold text-gray-100 mb-4">Device Health Trend</h3>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={healthTrend}>
            <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
            <XAxis dataKey="date" stroke="#9CA3AF" />
            <YAxis stroke="#9CA3AF" />
            <Tooltip contentStyle={{ backgroundColor: '#1F2937', border: 'none' }} />
            <Legend />
            <Bar dataKey="healthy" fill="#22C55E" name="Healthy" />
            <Bar dataKey="warning" fill="#F59E0B" name="Warning" />
            <Bar dataKey="critical" fill="#DC2626" name="Critical" />
          </BarChart>
        </ResponsiveContainer>
      </Card>

      {/* Device List */}
      <Card>
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-semibold text-gray-100">Device Inventory</h3>
          <select
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            className="bg-gray-700 text-gray-200 text-sm px-3 py-1 rounded border border-gray-600"
          >
            <option value="all">All</option>
            <option value="windows">Windows</option>
            <option value="linux">Linux</option>
          </select>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="border-b border-gray-700">
              <tr className="text-gray-400 text-left">
                <th className="pb-2 font-medium">Hostname</th>
                <th className="pb-2 font-medium">OS</th>
                <th className="pb-2 font-medium">IP Address</th>
                <th className="pb-2 font-medium">Status</th>
                <th className="pb-2 font-medium">Compliance</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-700">
              {filteredDevices?.slice(0, 10).map((device) => (
                <tr key={device.id} className="hover:bg-gray-700">
                  <td className="py-3 text-gray-300">{device.hostname}</td>
                  <td className="py-3 text-gray-300">{device.os_type}</td>
                  <td className="py-3 text-gray-400 font-mono text-xs">{device.ip_address}</td>
                  <td className="py-3">
                    <span className={`px-2 py-1 rounded text-xs ${device.is_active ? 'bg-emerald-900 text-emerald-200' : 'bg-gray-700 text-gray-300'}`}>
                      {device.is_active ? 'Active' : 'Inactive'}
                    </span>
                  </td>
                  <td className="py-3 text-gray-300">{(device.compliance_score || 0).toFixed(1)}%</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
};

export default AssetDashboard;
