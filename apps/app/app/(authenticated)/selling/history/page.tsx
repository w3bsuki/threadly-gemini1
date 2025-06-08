import { currentUser } from '@repo/auth/server';
import { database } from '@repo/database';
import { redirect } from 'next/navigation';
import type { Metadata } from 'next';
import { Header } from '../../components/header';
import { SalesHistoryContent } from './components/sales-history-content';

const title = 'Sales History';
const description = 'Track your sales performance and earnings';

export const metadata: Metadata = {
  title,
  description,
};

const SalesHistoryPage = async () => {
  const user = await currentUser();

  if (!user) {
    redirect('/sign-in');
  }

  // Get database user
  const dbUser = await database.user.findUnique({
    where: { clerkId: user.id }
  });

  if (!dbUser) {
    redirect('/sign-in');
  }

  // Fetch sales data for the seller
  const [salesData, recentOrders] = await Promise.all([
    // Get aggregated sales data
    database.order.aggregate({
      where: {
        sellerId: dbUser.id,
        status: 'COMPLETED',
      },
      _sum: {
        amount: true,
      },
      _count: {
        id: true,
      },
    }),

    // Get recent orders with details
    database.order.findMany({
      where: {
        sellerId: dbUser.id,
      },
      include: {
        buyer: true,
        product: {
          include: {
            images: {
              take: 1,
              orderBy: {
                displayOrder: 'asc',
              },
            },
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
      take: 50, // Limit to recent orders
    }),
  ]);

  // Calculate monthly sales for the last 12 months
  const monthlyStats = await database.$queryRaw<Array<{
    month: string;
    total_sales: bigint;
    order_count: bigint;
  }>>`
    SELECT 
      TO_CHAR(created_at, 'YYYY-MM') as month,
      COALESCE(SUM(amount), 0) as total_sales,
      COUNT(DISTINCT id) as order_count
    FROM "Order"
    WHERE seller_id = ${dbUser.id}
      AND status = 'COMPLETED'
      AND created_at >= NOW() - INTERVAL '12 months'
    GROUP BY TO_CHAR(created_at, 'YYYY-MM')
    ORDER BY month DESC
  `;

  // Get product performance data
  const topProducts = await database.order.groupBy({
    by: ['productId'],
    where: {
      sellerId: dbUser.id,
      status: 'COMPLETED',
    },
    _sum: {
      amount: true,
    },
    _count: {
      id: true,
    },
    orderBy: {
      _sum: {
        amount: 'desc',
      },
    },
    take: 10,
  });

  // Get product details for top performers
  const topProductsWithDetails = await database.product.findMany({
    where: {
      id: {
        in: topProducts.map(p => p.productId),
      },
    },
    include: {
      images: {
        take: 1,
        orderBy: {
          displayOrder: 'asc',
        },
      },
    },
  });

  // Combine top products with sales data
  const enrichedTopProducts = topProducts.map(productSales => {
    const productDetails = topProductsWithDetails.find(
      p => p.id === productSales.productId
    );
    return {
      ...productSales,
      product: productDetails,
    };
  });

  return (
    <>
      <Header pages={['Dashboard', 'Selling', 'Sales History']} page="Sales History" />
      <div className="flex flex-1 flex-col gap-4 p-4 pt-0">
        <div className="mx-auto w-full max-w-7xl">
          <div className="mb-6">
            <h1 className="text-2xl font-bold">Sales History & Analytics</h1>
            <p className="text-muted-foreground">
              Track your sales performance, earnings, and top-selling products
            </p>
          </div>
          
          <SalesHistoryContent 
            salesData={salesData}
            recentOrders={recentOrders}
            monthlyStats={monthlyStats}
            topProducts={enrichedTopProducts}
          />
        </div>
      </div>
    </>
  );
};

export default SalesHistoryPage;