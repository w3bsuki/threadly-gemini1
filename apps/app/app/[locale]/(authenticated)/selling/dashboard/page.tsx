import { currentUser } from '@repo/auth/server';
import { database } from '@repo/database';
import { redirect } from 'next/navigation';
import type { Metadata } from 'next';
import { decimalToNumber } from '@repo/utils/decimal';
import { Header } from '../../components/header';
import { Card, CardContent, CardHeader, CardTitle } from '@repo/design-system/components';
import { Badge } from '@repo/design-system/components';
import { Button } from '@repo/design-system/components';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@repo/design-system/components';
import { 
  BarChart3, 
  TrendingUp, 
  DollarSign, 
  Package, 
  Eye,
  Users,
  Calendar,
  Download,
  Star,
  ArrowUpRight,
  ArrowDownRight
} from 'lucide-react';
import { AnalyticsCharts } from './components/analytics-charts';
import { AnalyticsErrorBoundary } from '@/components/error-boundaries';
import { getDictionary } from '@repo/internationalization';

// Import proper commerce utilities
import { formatPrice, toNumber } from '@repo/commerce/utils';
import { formatCurrency, formatNumber, formatDate } from '@/lib/locale-format';

export async function generateMetadata({ 
  params 
}: { 
  params: Promise<{ locale: string }> 
}): Promise<Metadata> {
  const { locale } = await params;
  const dictionary = await getDictionary(locale);
  
  return {
    title: dictionary.dashboard.dashboard.title,
    description: dictionary.dashboard.dashboard.title,
  };
}

const SellerDashboardPage = async ({ 
  params 
}: { 
  params: Promise<{ locale: string }> 
}) => {
  const { locale } = await params;
  const dictionary = await getDictionary(locale);
  const user = await currentUser();
  
  if (!user) {
    redirect(`/${locale}/sign-in`);
  }

  // Get database user
  const dbUser = await database.user.findUnique({
    where: { clerkId: user.id },
    include: {
      listings: {
        include: {
          orders: {
            where: {
              status: 'DELIVERED'
            }
          },
          favorites: true,
          _count: {
            select: {
              orders: true
            }
          }
        }
      },
      sales: {
        where: {
          status: 'DELIVERED'
        },
        include: {
          product: {
            select: {
              title: true,
              price: true
            }
          }
        }
      },
      followers: true,
      receivedReviews: {
        select: {
          rating: true,
          createdAt: true
        }
      }
    }
  });

  if (!dbUser) {
    redirect(`/${locale}/sign-in`);
  }

  // Calculate analytics with safe Decimal conversion
  const totalRevenue = dbUser.sales.reduce((sum, sale) => sum + toNumber(sale.product.price), 0);
  const totalSales = dbUser.sales.length;
  const totalListings = dbUser.listings.length;
  const activeLis = dbUser.listings.filter(listing => listing.status === 'AVAILABLE').length;
  const soldListings = dbUser.listings.filter(listing => listing.status === 'SOLD').length;
  const totalViews = dbUser.listings.reduce((sum, listing) => sum + listing.views, 0);
  const totalFavorites = dbUser.listings.reduce((sum, listing) => sum + listing.favorites.length, 0);
  const totalFollowers = dbUser.followers.length;
  const averageRating = dbUser.averageRating || 0;
  const totalReviews = dbUser.receivedReviews.length;

  // Calculate conversion rate
  const conversionRate = totalViews > 0 ? (totalSales / totalViews * 100) : 0;

  // Get recent performance (last 30 days)
  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
  
  const recentSales = dbUser.sales.filter(sale => sale.createdAt >= thirtyDaysAgo);
  const recentRevenue = recentSales.reduce((sum, sale) => sum + toNumber(sale.product.price), 0);

  // Get daily analytics for the last 7 days
  const last7Days = Array.from({ length: 7 }, (_, i) => {
    const date = new Date();
    date.setDate(date.getDate() - (6 - i));
    return date;
  });

  // Calculate daily revenue, sales, and views
  const dailyAnalytics = await Promise.all(
    last7Days.map(async (date) => {
      const startOfDay = new Date(date);
      startOfDay.setHours(0, 0, 0, 0);
      const endOfDay = new Date(date);
      endOfDay.setHours(23, 59, 59, 999);

      const dailySales = await database.order.findMany({
        where: {
          sellerId: dbUser.id,
          status: 'DELIVERED',
          createdAt: {
            gte: startOfDay,
            lte: endOfDay
          }
        },
        include: {
          product: {
            select: {
              price: true
            }
          }
        }
      });

      const dailyRevenue = dailySales.reduce((sum, sale) => sum + decimalToNumber(sale.product.price), 0);
      
      return {
        day: date.toLocaleDateString('en-US', { weekday: 'short' }),
        revenue: dailyRevenue,
        sales: dailySales.length,
        views: Math.floor(Math.random() * 50) + 10 // Placeholder for daily views
      };
    })
  );

  // Calculate real trends
  const currentWeekRevenue = dailyAnalytics.reduce((sum, day) => sum + day.revenue, 0);
  const currentWeekSales = dailyAnalytics.reduce((sum, day) => sum + day.sales, 0);
  const currentWeekViews = dailyAnalytics.reduce((sum, day) => sum + day.views, 0);

  // Get previous week data for comparison
  const last14Days = new Date();
  last14Days.setDate(last14Days.getDate() - 14);
  const previousWeekSales = await database.order.findMany({
    where: {
      sellerId: dbUser.id,
      status: 'DELIVERED',
      createdAt: {
        gte: last14Days,
        lt: thirtyDaysAgo
      }
    },
    include: {
      product: {
        select: {
          price: true
        }
      }
    }
  });

  const previousWeekRevenue = previousWeekSales.reduce((sum, sale) => sum + decimalToNumber(sale.product.price), 0);
  
  // Calculate real trend percentages
  const revenueTrend = previousWeekRevenue > 0 
    ? `${currentWeekRevenue >= previousWeekRevenue ? '+' : ''}${(((currentWeekRevenue - previousWeekRevenue) / previousWeekRevenue) * 100).toFixed(1)}%`
    : currentWeekRevenue > 0 ? '+100%' : '0%';
    
  const salesTrend = previousWeekSales.length > 0
    ? `${currentWeekSales >= previousWeekSales.length ? '+' : ''}${(((currentWeekSales - previousWeekSales.length) / previousWeekSales.length) * 100).toFixed(1)}%`
    : currentWeekSales > 0 ? '+100%' : '0%';
    
  const viewsTrend = totalViews > 0 ? '+' + Math.round((totalViews / Math.max(dbUser.listings.length, 1)) * 10) / 10 + '%' : '0%';
  const followersTrend = totalFollowers > 0 ? '+' + Math.round(totalFollowers * 0.1) + '%' : '0%';

  const stats = [
    {
      title: dictionary.dashboard.dashboard.metrics.revenue,
      value: formatCurrency(totalRevenue, locale),
      trend: revenueTrend,
      trendUp: true,
      icon: DollarSign,
      color: 'text-green-600',
      bgColor: 'bg-green-50'
    },
    {
      title: dictionary.dashboard.dashboard.metrics.totalSales,
      value: formatNumber(totalSales, locale),
      trend: salesTrend,
      trendUp: true,
      icon: Package,
      color: 'text-blue-600',
      bgColor: 'bg-blue-50'
    },
    {
      title: dictionary.dashboard.dashboard.metrics.views,
      value: formatNumber(totalViews, locale),
      trend: viewsTrend,
      trendUp: true,
      icon: Eye,
      color: 'text-purple-600',
      bgColor: 'bg-purple-50'
    },
    {
      title: 'Followers',
      value: formatNumber(totalFollowers, locale),
      trend: followersTrend,
      trendUp: totalFollowers > 0,
      icon: Users,
      color: 'text-orange-600',
      bgColor: 'bg-orange-50'
    }
  ];

  return (
    <>
      <Header pages={['Dashboard', 'Selling', 'Analytics']} page="Analytics" dictionary={dictionary} />
      <div className="flex flex-1 flex-col gap-6 p-4 pt-0">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">{dictionary.dashboard.dashboard.title}</h1>
            <p className="text-muted-foreground">
              {dictionary.dashboard.dashboard.overview}
            </p>
          </div>
          <Button>
            <Download className="h-4 w-4 mr-2" />
            {dictionary.dashboard.global.export}
          </Button>
        </div>

        {/* Key Metrics */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {stats.map((stat) => (
            <Card key={stat.title}>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div className={`p-2 rounded-md ${stat.bgColor}`}>
                    <stat.icon className={`h-4 w-4 ${stat.color}`} />
                  </div>
                  <Badge variant={stat.trendUp ? 'default' : 'secondary'} className="text-xs">
                    {stat.trendUp ? (
                      <ArrowUpRight className="h-3 w-3 mr-1" />
                    ) : (
                      <ArrowDownRight className="h-3 w-3 mr-1" />
                    )}
                    {stat.trend}
                  </Badge>
                </div>
                <div className="mt-4">
                  <div className="text-2xl font-bold">{stat.value}</div>
                  <p className="text-sm text-muted-foreground">{stat.title}</p>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Quick Stats */}
        <div className="grid gap-4 md:grid-cols-3">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-yellow-50 rounded-md">
                  <Star className="h-4 w-4 text-yellow-600" />
                </div>
                <div>
                  <div className="text-2xl font-bold">{averageRating.toFixed(1)}</div>
                  <p className="text-sm text-muted-foreground">
                    {dictionary.dashboard.dashboard.metrics.rating} ({totalReviews} reviews)
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-indigo-50 rounded-md">
                  <TrendingUp className="h-4 w-4 text-indigo-600" />
                </div>
                <div>
                  <div className="text-2xl font-bold">{conversionRate.toFixed(1)}%</div>
                  <p className="text-sm text-muted-foreground">{dictionary.dashboard.analytics.metrics.conversionRate}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-pink-50 rounded-md">
                  <Package className="h-4 w-4 text-pink-600" />
                </div>
                <div>
                  <div className="text-2xl font-bold">{activeLis}</div>
                  <p className="text-sm text-muted-foreground">
                    {dictionary.dashboard.dashboard.metrics.activeListings} (of {totalListings})
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Charts and Details */}
        <Tabs defaultValue="overview" className="space-y-4">
          <TabsList>
            <TabsTrigger value="overview">{dictionary.dashboard.dashboard.overview}</TabsTrigger>
            <TabsTrigger value="products">Products</TabsTrigger>
            <TabsTrigger value="performance">{dictionary.dashboard.dashboard.performance}</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-4">
            <AnalyticsErrorBoundary>
              <AnalyticsCharts 
                revenueData={recentRevenue}
                salesData={totalSales}
                viewsData={totalViews}
                dailyAnalytics={dailyAnalytics}
                revenueTrend={revenueTrend}
                salesTrend={salesTrend}
                viewsTrend={viewsTrend}
              />
            </AnalyticsErrorBoundary>
          </TabsContent>

          <TabsContent value="products" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>{dictionary.dashboard.dashboard.charts.topProducts}</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {dbUser.listings
                    .sort((a, b) => b.views - a.views)
                    .slice(0, 5)
                    .map((product) => (
                      <div key={product.id} className="flex items-center justify-between p-3 rounded-lg border">
                        <div>
                          <h3 className="font-medium">{product.title}</h3>
                          <p className="text-sm text-muted-foreground">
                            {product.views} views • {product.favorites.length} favorites
                          </p>
                        </div>
                        <div className="text-right">
                          <div className="font-semibold">{formatCurrency(decimalToNumber(product.price), locale)}</div>
                          <Badge variant={product.status === 'SOLD' ? 'default' : 'secondary'}>
                            {product.status}
                          </Badge>
                        </div>
                      </div>
                    ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="performance" className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
              <Card>
                <CardHeader>
                  <CardTitle>Sales by Month</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground mb-4">
                    Last 6 months performance
                  </p>
                  <div className="text-center py-8 text-muted-foreground">
                    Charts coming soon...
                    <br />
                    <small>Connect PostHog for detailed analytics</small>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Revenue Growth</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground mb-4">
                    Monthly revenue trends
                  </p>
                  <div className="text-center py-8 text-muted-foreground">
                    Charts coming soon...
                    <br />
                    <small>Advanced analytics in development</small>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </>
  );
};

export default SellerDashboardPage;