'use client';

import { useEffect, useState } from 'react';
import { useAuthHook } from '@/hooks/useAuth';
import { useRouter } from 'next/navigation';
import apiClient from '@/lib/api';
import { ROUTES } from '@/lib/routes';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import StatusPieChart from '@/components/charts/StatusPieChart';
import AgentWorkloadBar from '@/components/charts/AgentWorkloadBar';
import CropDistributionBar from '@/components/charts/CropDistributionBar';
import FieldTrendLine from '@/components/charts/FieldTrendLine';
import Spinner from '@/components/ui/Spinner';
import AtRiskFieldsTable from '@/components/ui/AtRiskFieldsTable';
import {
  Leaf,
  Users,
  AlertTriangle,
  CheckCircle2,
  BarChart3,
} from 'lucide-react';

export default function AdminDashboardPage() {
  const { user, isAdmin, isLoading } = useAuthHook();
  const router = useRouter();
  const [dashboardData, setDashboardData] = useState(null);
  const [trendData, setTrendData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadingTrend, setLoadingTrend] = useState(true);

  // Redirect non-admin users - wait for auth to load first
  useEffect(() => {
    if (!isLoading) {
      if (!user) {
        router.replace('/login');
      } else if (!isAdmin) {
        router.replace('/dashboard/agent');
      }
    }
  }, [isAdmin, isLoading, router, user]);

  // Fetch dashboard data - only if admin
  useEffect(() => {
    if (!isAdmin || isLoading) return;
    
    const controller = new AbortController();
    
    const fetchDashboard = async () => {
      try {
        const response = await apiClient.get(ROUTES.ADMIN_DASHBOARD, { 
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
  }, [isAdmin, isLoading]);

  // Fetch trend data - only if admin
  useEffect(() => {
    if (!isAdmin || isLoading) return;
    
    const controller = new AbortController();
    
    const fetchTrends = async () => {
      try {
        const response = await apiClient.get(ROUTES.FIELD_ACTIVITY_TREND, {
          signal: controller.signal
        });
        const chartData = response.data.trend.map(item => ({
          date: new Date(item.date).toLocaleDateString('en-US', { 
            month: 'short', 
            day: 'numeric' 
          }),
          fields: item.fields
        }));
        setTrendData(chartData);
      } catch (error) {
        if (error.name !== 'CanceledError') {
          console.error('Failed to fetch trend data:', error);
        }
      } finally {
        setLoadingTrend(false);
      }
    };
    
    fetchTrends();
    return () => controller.abort();
  }, [isAdmin, isLoading]);

  // Loading state
  if (isLoading || loading || loadingTrend) {
    return (
      <div className="flex items-center justify-center h-64">
        <Spinner size="lg" />
      </div>
    );
  }

  // Don't render if not admin (prevents flash)
  if (!isAdmin) {
    return null;
  }

  // Calculate metrics
  const totalFields = dashboardData?.total_fields || 0;
  const totalAgents = dashboardData?.total_agents || 0;
  const atRiskCount = dashboardData?.status_breakdown?.at_risk || 0;
  const activeCount = dashboardData?.status_breakdown?.active || 0;
  const completedCount = dashboardData?.status_breakdown?.completed || 0;
  const completionRate = totalFields ? Math.round((completedCount / totalFields) * 100) : 0;
  const avgFieldsPerAgent = totalAgents ? Math.round(totalFields / totalAgents) : 0;

  const statusData = [
    { name: 'Active', value: activeCount },
    { name: 'At Risk', value: atRiskCount },
    { name: 'Completed', value: completedCount },
  ];

  const atRiskFields = dashboardData?.recent_at_risk_fields || [];

  const handleViewAllAtRisk = () => {
    router.push('/fields?status=at_risk');
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-xl font-semibold text-gray-900">Dashboard</h1>
          {/* <p className="text-sm text-gray-500 mt-0.5">Field monitoring overview</p> */}
        </div>
        <Button href="/fields" variant="outline" size="sm">
          Manage Fields
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        {[
          { 
            label: 'Fields', 
            value: totalFields, 
            icon: <Leaf className="w-4 h-4 text-emerald-600" />, 
            href: '/fields' 
          },
          { 
            label: 'Agents', 
            value: totalAgents, 
            icon: <Users className="w-4 h-4 text-blue-600" />, 
            href: '/profile' 
          },
          { 
            label: 'Active', 
            value: activeCount, 
            icon: <CheckCircle2 className="w-4 h-4 text-emerald-600" />, 
            href: '/fields?status=active' 
          },
          { 
            label: 'At Risk', 
            value: atRiskCount, 
            icon: <AlertTriangle className="w-4 h-4 text-rose-600" />, 
            href: '/fields?status=at_risk' 
          },
          { 
            label: 'Completion', 
            value: `${completionRate}%`, 
            icon: <BarChart3 className="w-4 h-4 text-gray-600" />, 
            href: null 
          },
          { 
            label: 'Avg / Agent', 
            value: avgFieldsPerAgent, 
            icon: <Users className="w-4 h-4 text-gray-600" />, 
            href: null 
          },
        ].map((item, idx) => (
          <div
            key={idx}
            className="p-4 bg-white border border-gray-300 rounded-xl shadow-sm hover:shadow-md transition-all cursor-pointer"
            onClick={() => item.href && router.push(item.href)}
          >
            <div className="flex justify-between items-center">
              <p className="text-xs font-medium text-gray-500">{item.label}</p>
              {item.icon}
            </div>
            <p className="text-2xl font-bold mt-1 text-gray-900">{item.value}</p>
          </div>
        ))}
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card title="Field Status Distribution" className="border border-gray-300 shadow-sm">
          <StatusPieChart data={statusData} />
        </Card>

        <Card title="Agent Workload Distribution" className="border border-gray-300 shadow-sm">
          <AgentWorkloadBar data={dashboardData?.agent_workload || []} />
        </Card>

        <Card title="Crop Distribution" className="border border-gray-300 shadow-sm">
          <CropDistributionBar data={dashboardData?.crop_distribution || []} />
        </Card>

        <Card title="Field Activity Trend (Last 7 Days)" className="border border-gray-300 shadow-sm">
          <FieldTrendLine data={trendData} />
        </Card>
      </div>

      {/* At Risk Fields Section */}
      {atRiskFields.length > 0 && (
        <Card
          title={`Fields Needing Attention (${Math.min(4, atRiskFields.length)} of ${atRiskCount})`}
          className="border border-gray-300 shadow-sm overflow-hidden"
        >
          <AtRiskFieldsTable 
            fields={atRiskFields} 
            maxDisplay={4}
            onViewAll={handleViewAllAtRisk}
          />
        </Card>
      )}
    </div>
  );
}