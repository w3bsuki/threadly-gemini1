'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@repo/design-system/components/ui/card';
import { Badge } from '@repo/design-system/components/ui/badge';
import { Button } from '@repo/design-system/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@repo/design-system/components/ui/tabs';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@repo/design-system/components/ui/table';
import { Avatar, AvatarFallback, AvatarImage } from '@repo/design-system/components/ui/avatar';
import { CalendarIcon, DollarSign, Package, TrendingUp, ShoppingBag, Star, ExternalLink } from 'lucide-react';
import { format } from 'date-fns';
import Link from 'next/link';
import Image from 'next/image';

interface SalesData {
  _sum: {
    price: number | null;
  };
  _count: {
    id: number;
  };
}

interface Order {
  id: string;
  status: string;
  total: number;
  createdAt: Date;
  buyer: {
    id: string;
    firstName?: string;
    lastName?: string;
    imageUrl?: string;
  };
}

interface OrderItem {
  id: string;
  price: number;
  quantity: number;
  title: string;
  condition: string;
  createdAt: Date;
  order: Order;
  product: {
    id: string;
    title: string;
    status: string;
    images: Array<{
      url: string;
      altText?: string;
    }>;
  };
}

interface MonthlyStats {
  month: string;
  total_sales: number;
  order_count: number;
}

interface TopProduct {
  productId: string;
  _sum: {
    price: number | null;
  };
  _count: {
    id: number;
  };
  product?: {
    id: string;
    title: string;
    price: number;
    status: string;
    images: Array<{
      url: string;
      altText?: string;
    }>;
  };
}

interface SalesHistoryContentProps {
  salesData: SalesData;
  recentOrders: OrderItem[];
  monthlyStats: MonthlyStats[];
  topProducts: TopProduct[];
}

export function SalesHistoryContent({ 
  salesData, 
  recentOrders, 
  monthlyStats, 
  topProducts 
}: SalesHistoryContentProps) {
  const [selectedPeriod, setSelectedPeriod] = useState('all');

  const totalEarnings = salesData._sum.price || 0;
  const totalSales = salesData._count.id;

  // Calculate this month's performance
  const currentMonth = format(new Date(), 'yyyy-MM');
  const thisMonthStats = monthlyStats.find(stat => stat.month === currentMonth);
  const thisMonthEarnings = thisMonthStats?.total_sales || 0;
  const thisMonthSales = thisMonthStats?.order_count || 0;

  // Calculate average order value
  const averageOrderValue = totalSales > 0 ? totalEarnings / totalSales : 0;

  const getStatusBadge = (status: string) => {
    const statusMap = {
      PENDING: { variant: 'secondary' as const, label: 'Pending' },
      PROCESSING: { variant: 'default' as const, label: 'Processing' },
      SHIPPED: { variant: 'default' as const, label: 'Shipped' },
      DELIVERED: { variant: 'default' as const, label: 'Delivered' },
      COMPLETED: { variant: 'default' as const, label: 'Completed' },
      CANCELLED: { variant: 'destructive' as const, label: 'Cancelled' },
    };

    const statusInfo = statusMap[status as keyof typeof statusMap] || { 
      variant: 'secondary' as const, 
      label: status 
    };

    return (
      <Badge variant={statusInfo.variant}>
        {statusInfo.label}
      </Badge>
    );
  };

  return (
    <div className="space-y-6">
      {/* Stats Overview */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Earnings</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${totalEarnings.toFixed(2)}</div>
            <p className="text-xs text-muted-foreground">All time sales</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">This Month</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${thisMonthEarnings.toFixed(2)}</div>
            <p className="text-xs text-muted-foreground">
              {thisMonthSales} sale{thisMonthSales !== 1 ? 's' : ''}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Sales</CardTitle>
            <Package className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalSales}</div>
            <p className="text-xs text-muted-foreground">Items sold</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Avg. Order Value</CardTitle>
            <ShoppingBag className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${averageOrderValue.toFixed(2)}</div>
            <p className="text-xs text-muted-foreground">Per transaction</p>
          </CardContent>
        </Card>
      </div>

      {/* Tabs for different views */}
      <Tabs value={selectedPeriod} onValueChange={setSelectedPeriod} className="space-y-4">
        <TabsList>
          <TabsTrigger value="all">All Sales</TabsTrigger>
          <TabsTrigger value="recent">Recent Orders</TabsTrigger>
          <TabsTrigger value="top-products">Top Products</TabsTrigger>
          <TabsTrigger value="monthly">Monthly Breakdown</TabsTrigger>
        </TabsList>

        {/* All Sales Tab */}
        <TabsContent value="all" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>All Sales History</CardTitle>
            </CardHeader>
            <CardContent>
              {recentOrders.length === 0 ? (
                <div className="text-center py-8">
                  <Package className="mx-auto h-12 w-12 text-muted-foreground/50 mb-4" />
                  <h3 className="text-lg font-semibold mb-2">No sales yet</h3>
                  <p className="text-muted-foreground mb-4">
                    Your sales history will appear here once you make your first sale.
                  </p>
                  <Button asChild>
                    <Link href="/selling/listings">
                      View Your Listings
                    </Link>
                  </Button>
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Product</TableHead>
                      <TableHead>Buyer</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Date</TableHead>
                      <TableHead className="text-right">Amount</TableHead>
                      <TableHead></TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {recentOrders.map((orderItem) => (
                      <TableRow key={orderItem.id}>
                        <TableCell>
                          <div className="flex items-center gap-3">
                            <div className="relative w-10 h-10 flex-shrink-0">
                              <Image
                                src={orderItem.product.images[0]?.url || '/placeholder.png'}
                                alt={orderItem.product.title}
                                fill
                                className="object-cover rounded-md"
                              />
                            </div>
                            <div>
                              <div className="font-medium">{orderItem.title}</div>
                              <div className="text-sm text-muted-foreground">
                                {orderItem.condition}
                              </div>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <Avatar className="h-6 w-6">
                              <AvatarImage src={orderItem.order.buyer.imageUrl} />
                              <AvatarFallback>
                                {orderItem.order.buyer.firstName?.[0] || 'U'}
                              </AvatarFallback>
                            </Avatar>
                            <span className="text-sm">
                              {orderItem.order.buyer.firstName} {orderItem.order.buyer.lastName}
                            </span>
                          </div>
                        </TableCell>
                        <TableCell>
                          {getStatusBadge(orderItem.order.status)}
                        </TableCell>
                        <TableCell>
                          {format(new Date(orderItem.createdAt), 'MMM d, yyyy')}
                        </TableCell>
                        <TableCell className="text-right font-medium">
                          ${(orderItem.price * orderItem.quantity).toFixed(2)}
                        </TableCell>
                        <TableCell>
                          <Button variant="ghost" size="sm" asChild>
                            <Link href={`/buying/orders/${orderItem.order.id}`}>
                              <ExternalLink className="h-4 w-4" />
                            </Link>
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Recent Orders Tab */}
        <TabsContent value="recent" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Recent Orders</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {recentOrders.slice(0, 10).map((orderItem) => (
                  <div key={orderItem.id} className="flex items-center gap-4 p-4 border rounded-lg">
                    <div className="relative w-12 h-12 flex-shrink-0">
                      <Image
                        src={orderItem.product.images[0]?.url || '/placeholder.png'}
                        alt={orderItem.product.title}
                        fill
                        className="object-cover rounded-md"
                      />
                    </div>
                    <div className="flex-1">
                      <div className="font-medium">{orderItem.title}</div>
                      <div className="text-sm text-muted-foreground">
                        Order #{orderItem.order.id.slice(-8)}
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="font-medium">
                        ${(orderItem.price * orderItem.quantity).toFixed(2)}
                      </div>
                      <div className="text-sm text-muted-foreground">
                        {format(new Date(orderItem.createdAt), 'MMM d')}
                      </div>
                    </div>
                    {getStatusBadge(orderItem.order.status)}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Top Products Tab */}
        <TabsContent value="top-products" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Best Selling Products</CardTitle>
            </CardHeader>
            <CardContent>
              {topProducts.length === 0 ? (
                <div className="text-center py-8">
                  <Star className="mx-auto h-12 w-12 text-muted-foreground/50 mb-4" />
                  <h3 className="text-lg font-semibold mb-2">No top products yet</h3>
                  <p className="text-muted-foreground">
                    Keep selling to see your best performers here!
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
                  {topProducts.map((item, index) => (
                    <div key={item.productId} className="flex items-center gap-4 p-4 border rounded-lg">
                      <div className="flex items-center justify-center w-8 h-8 bg-muted rounded-full text-sm font-medium">
                        {index + 1}
                      </div>
                      {item.product && (
                        <>
                          <div className="relative w-12 h-12 flex-shrink-0">
                            <Image
                              src={item.product.images[0]?.url || '/placeholder.png'}
                              alt={item.product.title}
                              fill
                              className="object-cover rounded-md"
                            />
                          </div>
                          <div className="flex-1">
                            <div className="font-medium">{item.product.title}</div>
                            <div className="text-sm text-muted-foreground">
                              {item._count.id} sale{item._count.id !== 1 ? 's' : ''}
                            </div>
                          </div>
                          <div className="text-right">
                            <div className="font-medium">
                              ${(item._sum.price || 0).toFixed(2)}
                            </div>
                            <div className="text-sm text-muted-foreground">
                              Total earned
                            </div>
                          </div>
                        </>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Monthly Breakdown Tab */}
        <TabsContent value="monthly" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Monthly Performance</CardTitle>
            </CardHeader>
            <CardContent>
              {monthlyStats.length === 0 ? (
                <div className="text-center py-8">
                  <CalendarIcon className="mx-auto h-12 w-12 text-muted-foreground/50 mb-4" />
                  <h3 className="text-lg font-semibold mb-2">No monthly data yet</h3>
                  <p className="text-muted-foreground">
                    Monthly breakdown will appear as you make sales.
                  </p>
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Month</TableHead>
                      <TableHead>Sales Count</TableHead>
                      <TableHead className="text-right">Revenue</TableHead>
                      <TableHead className="text-right">Avg. Order</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {monthlyStats.map((stat) => {
                      const avgOrder = stat.order_count > 0 ? stat.total_sales / stat.order_count : 0;
                      return (
                        <TableRow key={stat.month}>
                          <TableCell>
                            {format(new Date(stat.month + '-01'), 'MMMM yyyy')}
                          </TableCell>
                          <TableCell>{stat.order_count}</TableCell>
                          <TableCell className="text-right font-medium">
                            ${stat.total_sales.toFixed(2)}
                          </TableCell>
                          <TableCell className="text-right">
                            ${avgOrder.toFixed(2)}
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}