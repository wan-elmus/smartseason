'use client';

import { useEffect, useState } from 'react';
import { useAuthHook } from '@/hooks/useAuth';
import { useRouter } from 'next/navigation';
import apiClient from '@/lib/api';
import { ROUTES } from '@/lib/routes';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import Spinner from '@/components/ui/Spinner';
import RecentActivityTable from '@/components/ui/RecentActivityTable';
import { Leaf, AlertTriangle, CheckCircle2, Clock } from 'lucide-react';

export default function AgentDashboardPage() {
  const { user, isAgent, isLoading } = useAuthHook();
  const router = useRouter();
  const [dashboardData, setDashboardData] = useState(null);
  const [loading, setLoading] = useState(true);

  // Redirect if not agent
  useEffect(() => {
    if (!isLoading && !isAgent) {
      router.replace('/dashboard/admin');
    }
  }, [isAgent, isLoading, router]);

  // Fetch dashboard data
  useEffect(() => {
    const controller = new AbortController();
    
    const fetchDashboard = async () => {
      try {
        const response = await apiClient.get(ROUTES.AGENT_DASHBOARD, {
          signal: controller.signal
        });
        setDashboardData(response.data);
      } catch (error) {
        if (error.name !== 'CanceledError') {
          console.error('Failed to fetch dashboard:', error);
        }
      } finally {
        setLoading(false);
      }
    };
    
    fetchDashboard();
    return () => controller.abort();
  }, []);

  if (loading || isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Spinner size="lg" />
      </div>
    );
  }

  const totalFields = dashboardData?.total_fields || 0;
  const statusData = dashboardData?.status_breakdown || {
    active: 0,
    at_risk: 0,
    completed: 0,
  };
  const pendingUpdates = dashboardData?.pending_updates_count || 0;
  const recentUpdates = dashboardData?.recent_updates || [];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-xl font-semibold text-gray-900">
          Welcome back, {user?.full_name?.split(' ')[0]}
        </h1>
        <p className="text-sm text-gray-500 mt-1">
          Overview of your assigned fields
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="p-4 bg-white border border-gray-300 rounded-xl shadow-sm hover:shadow-md transition-all">
          <div className="flex justify-between items-center">
            <p className="text-xs font-medium text-gray-500">My Fields</p>
            <Leaf className="w-4 h-4 text-emerald-600" />
          </div>
          <p className="text-2xl font-bold mt-1 text-gray-900">{totalFields}</p>
        </div>

        <div className="p-4 bg-white border border-gray-300 rounded-xl shadow-sm hover:shadow-md transition-all">
          <div className="flex justify-between items-center">
            <p className="text-xs font-medium text-gray-500">Active</p>
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
          </div>
          <p className="text-2xl font-bold mt-1 text-emerald-600">{statusData.active}</p>
        </div>

        <div className="p-4 bg-white border border-gray-300 rounded-xl shadow-sm hover:shadow-md transition-all">
          <div className="flex justify-between items-center">
            <p className="text-xs font-medium text-gray-500">At Risk</p>
            <AlertTriangle className="w-4 h-4 text-rose-600" />
          </div>
          <p className="text-2xl font-bold mt-1 text-rose-600">{statusData.at_risk}</p>
        </div>

        <div className="p-4 bg-white border border-gray-300 rounded-xl shadow-sm hover:shadow-md transition-all">
          <div className="flex justify-between items-center">
            <p className="text-xs font-medium text-gray-500">Pending Updates</p>
            <Clock className="w-4 h-4 text-amber-600" />
          </div>
          <p className="text-2xl font-bold mt-1 text-gray-900">{pendingUpdates}</p>
        </div>
      </div>

      {/* Recent Activity */}
      <Card title="Recent Activity" className="border border-gray-300 shadow-sm overflow-hidden">
        <RecentActivityTable updates={recentUpdates} maxDisplay={5} />
      </Card>

      {/* Quick Action */}
      {totalFields > 0 && (
        <Card className="border border-gray-300 shadow-sm">
          <Button
            href="/fields"
            variant="outline"
            size="md"
            className="w-full justify-center"
          >
            Update Field Status
          </Button>
        </Card>
      )}
    </div>
  );
}