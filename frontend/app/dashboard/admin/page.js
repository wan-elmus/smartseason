'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import apiClient from '@/lib/api';
import { ROUTES } from '@/lib/routes';
import StatusBadge from '@/components/ui/StatusBadge';
import dynamic from 'next/dynamic';

const StatusPieChart = dynamic(() => import('@/components/charts/StatusPieChart'), { ssr: false });
const AgentWorkloadBar = dynamic(() => import('@/components/charts/AgentWorkloadBar'), { ssr: false });

export default function AdminDashboard() {
  const { user } = useAuth();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDashboard = async () => {
      try {
        const response = await apiClient.get(ROUTES.ADMIN_DASHBOARD);
        setData(response.data);
      } catch (error) {
        console.error('Failed to fetch dashboard:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchDashboard();
  }, []);

  if (loading) {
    return <div className="text-center py-10">Loading dashboard...</div>;
  }

  if (!data) {
    return <div className="text-center py-10 text-red-600">Failed to load dashboard data</div>;
  }

  const statusData = [
    { name: 'Active', value: data.status_breakdown.active },
    { name: 'At Risk', value: data.status_breakdown.at_risk },
    { name: 'Completed', value: data.status_breakdown.completed },
  ];

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Admin Dashboard</h1>
      
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
        <div className="bg-white rounded-lg shadow p-6">
          <p className="text-sm text-gray-500">Total Fields</p>
          <p className="text-3xl font-bold text-gray-900">{data.total_fields}</p>
        </div>
        <div className="bg-white rounded-lg shadow p-6">
          <p className="text-sm text-gray-500">Total Agents</p>
          <p className="text-3xl font-bold text-gray-900">{data.total_agents}</p>
        </div>
        <div className="bg-white rounded-lg shadow p-6">
          <p className="text-sm text-gray-500">Active Fields</p>
          <p className="text-3xl font-bold text-green-600">{data.status_breakdown.active}</p>
        </div>
        <div className="bg-white rounded-lg shadow p-6">
          <p className="text-sm text-gray-500">At Risk Fields</p>
          <p className="text-3xl font-bold text-yellow-600">{data.status_breakdown.at_risk}</p>
        </div>
      </div>
      
      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-lg font-semibold mb-4">Field Status Distribution</h2>
          <StatusPieChart data={statusData} />
        </div>
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-lg font-semibold mb-4">Agent Workload</h2>
          <AgentWorkloadBar data={data.agent_workload} />
        </div>
      </div>
      
      {/* At Risk Fields */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="px-6 py-4 border-b">
          <h2 className="text-lg font-semibold">Fields At Risk</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Name</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Crop</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Stage</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Last Update</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {data.recent_at_risk_fields.map((field) => (
                <tr key={field.id}>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{field.name}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{field.crop_type}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{field.current_stage}</td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <StatusBadge status={field.computed_status} />
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {field.last_update ? new Date(field.last_update).toLocaleDateString() : 'N/A'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}