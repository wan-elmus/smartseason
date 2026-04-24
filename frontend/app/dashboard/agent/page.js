'use client';

import { useEffect, useState } from 'react';
import { useAuthHook } from '@/hooks/useAuth';
import { useRouter } from 'next/navigation';
import apiClient from '@/lib/api';
import { ROUTES } from '@/lib/routes';
import Card from '@/components/ui/Card';
import StatusBadge from '@/components/ui/StatusBadge';
import Spinner from '@/components/ui/Spinner';
import Link from 'next/link';

export default function AgentDashboardPage() {
  const { user, isAgent, isLoading } = useAuthHook();
  const router = useRouter();
  const [dashboardData, setDashboardData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!isLoading && !isAgent) {
      router.push('/dashboard/admin');
    }
  }, [isAgent, isLoading, router]);

  useEffect(() => {
    const fetchDashboard = async () => {
      try {
        const response = await apiClient.get(ROUTES.AGENT_DASHBOARD);
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
        <Spinner size="lg" />
      </div>
    );
  }

  const statusData = dashboardData?.status_breakdown || { active: 0, at_risk: 0, completed: 0 };

  return (
    <div className="space-y-5">
      {/* Welcome Header */}
      <div className="mb-4">
        <h1 className="text-lg font-semibold text-gray-800">Welcome back, {user?.full_name?.split(' ')[0]}</h1>
        <p className="text-xs text-gray-500 mt-0.5">Here&apos;s what&apos;s happening with your assigned fields</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <div className="bg-white rounded-lg border border-gray-200 p-3">
          <p className="text-xs text-gray-500">My Fields</p>
          <p className="text-2xl font-semibold text-gray-800">{dashboardData?.total_fields || 0}</p>
        </div>
        <div className="bg-green-50 rounded-lg border border-green-200 p-3">
          <p className="text-xs text-green-700">Active</p>
          <p className="text-2xl font-semibold text-green-700">{statusData.active || 0}</p>
        </div>
        <div className="bg-yellow-50 rounded-lg border border-yellow-200 p-3">
          <p className="text-xs text-yellow-700">At Risk</p>
          <p className="text-2xl font-semibold text-yellow-700">{statusData.at_risk || 0}</p>
        </div>
        <div className="bg-gray-50 rounded-lg border border-gray-200 p-3">
          <p className="text-xs text-gray-500">Pending Updates</p>
          <p className="text-2xl font-semibold text-gray-800">{dashboardData?.pending_updates_count || 0}</p>
        </div>
      </div>

      {/* Recent Updates */}
      <Card title="Recent Activity">
        {dashboardData?.recent_updates?.length > 0 ? (
          <div className="space-y-3">
            {dashboardData.recent_updates.slice(0, 5).map((update) => (
              <div key={update.id} className="flex justify-between items-start py-2 border-b border-gray-100 last:border-0">
                <div className="flex-1">
                  <div className="flex items-center space-x-2 flex-wrap gap-y-1">
                    <StatusBadge status={update.new_stage} size="xs" />
                    <span className="text-xs text-gray-500">
                      {new Date(update.created_at).toLocaleDateString()}
                    </span>
                  </div>
                  {update.notes && (
                    <p className="text-xs text-gray-600 mt-1 line-clamp-2">{update.notes}</p>
                  )}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-xs text-gray-500 text-center py-4">No recent updates</p>
        )}
      </Card>

      {/* Quick Action */}
      {dashboardData?.total_fields > 0 && (
        <Card title="Quick Action">
          <Link
            href="/fields"
            className="block text-center bg-primary/10 text-primary text-sm py-2 rounded-md hover:bg-primary/20 transition-colors"
          >
            Update Field Status →
          </Link>
        </Card>
      )}
    </div>
  );
}