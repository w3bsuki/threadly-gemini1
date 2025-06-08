import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@repo/design-system/components/card';
import { Button } from '@repo/design-system/components/button';
import { Badge } from '@repo/design-system/components/badge';
import { 
  Users, 
  Package, 
  ShoppingCart, 
  DollarSign, 
  AlertTriangle,
  TrendingUp,
  Activity,
  Clock
} from 'lucide-react';
import { MetricsCards } from './metrics-cards';
import { RevenueChart } from './charts/revenue-chart';
import { UserGrowthChart } from './charts/user-growth-chart';
import { RecentActivity } from './widgets/recent-activity';
import { TopProducts } from './widgets/top-products';
import { SystemHealth } from './system-health';
import type { DashboardMetrics, SystemHealth as SystemHealthType } from '../types';

interface DashboardOverviewProps {
  metrics: DashboardMetrics;
  systemHealth: SystemHealthType;
  onRefresh?: () => void;
  loading?: boolean;
}

export function DashboardOverview({ 
  metrics, 
  systemHealth, 
  onRefresh,
  loading = false 
}: DashboardOverviewProps) {
  const healthStatus = getHealthStatusColor(systemHealth.status);

  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Admin Dashboard</h1>
          <p className="text-muted-foreground mt-1">
            Platform overview and management tools
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Badge variant={healthStatus.variant} className="gap-1">
            <Activity className="h-3 w-3" />
            System {systemHealth.status}
          </Badge>
          <Button 
            onClick={onRefresh} 
            variant="outline" 
            size="sm"
            disabled={loading}
          >
            <Clock className="h-4 w-4 mr-2" />
            {loading ? 'Refreshing...' : 'Refresh'}
          </Button>
        </div>
      </div>

      {/* Metrics Cards */}
      <MetricsCards metrics={metrics} loading={loading} />

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <DollarSign className="h-5 w-5" />
              Revenue Overview
            </CardTitle>
          </CardHeader>
          <CardContent>
            <RevenueChart />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5" />
              User Growth
            </CardTitle>
          </CardHeader>
          <CardContent>
            <UserGrowthChart />
          </CardContent>
        </Card>
      </div>

      {/* Activity and System Health */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Activity className="h-5 w-5" />
                Recent Activity
              </CardTitle>
            </CardHeader>
            <CardContent>
              <RecentActivity />
            </CardContent>
          </Card>
        </div>

        <SystemHealth health={systemHealth} />
      </div>

      {/* Additional Widgets */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Package className="h-5 w-5" />
              Top Performing Products
            </CardTitle>
          </CardHeader>
          <CardContent>
            <TopProducts />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5" />
              Pending Actions
            </CardTitle>
          </CardHeader>
          <CardContent>
            <PendingActions metrics={metrics} />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

function PendingActions({ metrics }: { metrics: DashboardMetrics }) {
  const pendingItems = [
    {
      title: 'Pending Reports',
      count: metrics.pendingReports,
      href: '/admin/reports',
      urgent: metrics.pendingReports > 10,
    },
    {
      title: 'Products Awaiting Approval',
      count: 23, // This would come from actual data
      href: '/admin/products?status=pending',
      urgent: false,
    },
    {
      title: 'Disputed Orders',
      count: 5, // This would come from actual data
      href: '/admin/orders?status=disputed',
      urgent: true,
    },
    {
      title: 'User Verifications',
      count: 12, // This would come from actual data
      href: '/admin/users?status=pending_verification',
      urgent: false,
    },
  ];

  return (
    <div className="space-y-4">
      {pendingItems.map((item, index) => (
        <div 
          key={index}
          className="flex items-center justify-between p-3 rounded-lg border hover:bg-muted/50 transition-colors"
        >
          <div className="flex items-center gap-3">
            <div className={`h-2 w-2 rounded-full ${item.urgent ? 'bg-red-500' : 'bg-orange-500'}`} />
            <span className="font-medium">{item.title}</span>
          </div>
          <div className="flex items-center gap-2">
            <Badge variant={item.urgent ? 'destructive' : 'secondary'}>
              {item.count}
            </Badge>
            <Button variant="ghost" size="sm" asChild>
              <a href={item.href}>View</a>
            </Button>
          </div>
        </div>
      ))}
      
      {pendingItems.every(item => item.count === 0) && (
        <div className="text-center py-6 text-muted-foreground">
          <TrendingUp className="h-8 w-8 mx-auto mb-2" />
          <p>All caught up! No pending actions.</p>
        </div>
      )}
    </div>
  );
}

function getHealthStatusColor(status: SystemHealthType['status']) {
  switch (status) {
    case 'healthy':
      return { variant: 'default' as const, color: 'text-green-600' };
    case 'warning':
      return { variant: 'secondary' as const, color: 'text-orange-600' };
    case 'critical':
      return { variant: 'destructive' as const, color: 'text-red-600' };
    default:
      return { variant: 'outline' as const, color: 'text-gray-600' };
  }
}