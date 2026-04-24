'use client';

import { useEffect, useState } from 'react';
import { useAuthHook } from '@/hooks/useAuth';
import { useRouter } from 'next/navigation';
import apiClient from '@/lib/api';
import { ROUTES } from '@/lib/routes';
import Card from '@/components/ui/Card';
import StatusBadge from '@/components/ui/StatusBadge';
import StatusPieChart from '@/components/charts/StatusPieChart';
import AgentWorkloadBar from '@/components/charts/AgentWorkloadBar';

export default function AdminDashboardPage() {
  const { isAdmin, isLoading } = useAuthHook();
  const router = useRouter();
  const [dashboardData, setDashboardData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!isLoading && !isAdmin) {
      router.push('/dashboard/agent');
    }
  }, [isAdmin, isLoading, router]);

  useEffect(() => {
    const fetchDashboard = async () => {
      try {
        const response = await apiClient.get(ROUTES.ADMIN_DASHBOARD);
        setDashboardData(response.data);
      } catch (error) {
        console.error('Failed to fetch dashboard:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchDashboard();
  }, []);

  if (loading || isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  const statusData = dashboardData?.status_breakdown ? [
    { name: 'Active', value: dashboardData.status_breakdown.active },
    { name: 'At Risk', value: dashboardData.status_breakdown.at_risk },
    { name: 'Completed', value: dashboardData.status_breakdown.completed },
  ] : [];

  const atRiskCount = dashboardData?.status_breakdown?.at_risk || 0;
  const activeCount = dashboardData?.status_breakdown?.active || 0;

  return (
    <div className="space-y-5">
      {/* Stats Cards */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <div className="bg-white rounded-lg border border-gray-200 p-3">
          <p className="text-xs text-gray-500">Total Fields</p>
          <p className="text-2xl font-semibold text-gray-800">{dashboardData?.total_fields || 0}</p>
        </div>
        <div className="bg-white rounded-lg border border-gray-200 p-3">
          <p className="text-xs text-gray-500">Total Agents</p>
          <p className="text-2xl font-semibold text-gray-800">{dashboardData?.total_agents || 0}</p>
        </div>
        <div className="bg-yellow-50 rounded-lg border border-yellow-200 p-3">
          <p className="text-xs text-yellow-700">At Risk</p>
          <p className="text-2xl font-semibold text-yellow-700">{atRiskCount}</p>
        </div>
        <div className="bg-green-50 rounded-lg border border-green-200 p-3">
          <p className="text-xs text-green-700">Active</p>
          <p className="text-2xl font-semibold text-green-700">{activeCount}</p>
        </div>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        <Card title="Field Status Distribution">
          <StatusPieChart data={statusData} />
        </Card>
        <Card title="Agent Workload">
          <AgentWorkloadBar data={dashboardData?.agent_workload || []} />
        </Card>
      </div>

      {/* Crop Distribution */}
      <Card title="Crop Distribution">
        <div className="flex flex-wrap gap-2">
          {dashboardData?.crop_distribution?.map((crop, idx) => (
            <div key={idx} className="bg-gray-100 rounded-full px-3 py-1 text-xs text-gray-700">
              {crop.crop_type}: {crop.count} fields
            </div>
          ))}
        </div>
      </Card>

      {/* At Risk Fields */}
      {dashboardData?.recent_at_risk_fields?.length > 0 && (
        <Card title="Fields Needing Attention">
          <div className="space-y-2">
            {dashboardData.recent_at_risk_fields.slice(0, 5).map((field) => (
              <div key={field.id} className="flex justify-between items-center py-2 border-b border-gray-100 last:border-0">
                <div>
                  <p className="text-sm font-medium text-gray-800">{field.name}</p>
                  <p className="text-xs text-gray-500">{field.crop_type}</p>
                </div>
                <StatusBadge status="At Risk" size="sm" />
              </div>
            ))}
          </div>
        </Card>
      )}
    </div>
  );
}