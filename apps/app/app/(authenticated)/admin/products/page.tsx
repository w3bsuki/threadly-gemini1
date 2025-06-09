import { database } from '@repo/database';
import { Card, CardContent, CardHeader, CardTitle } from '@repo/design-system/components/ui/card';
import { Button } from '@repo/design-system/components/ui/button';
import { Badge } from '@repo/design-system/components/ui/badge';
import { Input } from '@repo/design-system/components/ui/input';
import { 
  Search,
  AlertTriangle,
  CheckCircle,
  XCircle,
  Eye
} from 'lucide-react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@repo/design-system/components/ui/select';
import Image from 'next/image';
import { ProductActions } from './product-actions';

interface PageProps {
  searchParams: Promise<{ q?: string; status?: string }>;
}

export default async function AdminProductsPage({ searchParams }: PageProps) {
  const params = await searchParams;
  const search = params.q || '';
  const statusFilter = params.status || 'all';

  // Build where clause
  const where: any = {};
  
  if (search) {
    where.OR = [
      { title: { contains: search } },
      { description: { contains: search } }
    ];
  }
  
  if (statusFilter !== 'all') {
    where.status = statusFilter.toUpperCase();
  }

  const products = await database.product.findMany({
    where,
    orderBy: { createdAt: 'desc' },
    include: {
      seller: {
        select: {
          id: true,
          firstName: true,
          lastName: true,
          email: true
        }
      },
      category: true,
      images: {
        orderBy: { displayOrder: 'asc' },
        take: 1
      },
      _count: {
        select: {
          favorites: true,
          orders: true
        }
      }
    },
    take: 50
  });

  const stats = await database.product.groupBy({
    by: ['status'],
    _count: true
  });

  const statusStats = {
    total: await database.product.count(),
    available: stats.find(s => s.status === 'AVAILABLE')?._count || 0,
    sold: stats.find(s => s.status === 'SOLD')?._count || 0,
    removed: stats.find(s => s.status === 'REMOVED')?._count || 0,
    reserved: stats.find(s => s.status === 'RESERVED')?._count || 0
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Product Management</h1>
        <p className="text-muted-foreground mt-2">
          Review and moderate product listings
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Total Products</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{statusStats.total}</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Available</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{statusStats.available}</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Sold</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">{statusStats.sold}</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Reserved</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-600">{statusStats.reserved}</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Removed</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">{statusStats.removed}</div>
          </CardContent>
        </Card>
      </div>

      {/* Search and Filters */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Products</CardTitle>
            <div className="flex items-center gap-2">
              <form className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search products..."
                  name="q"
                  defaultValue={search}
                  className="pl-10 w-[300px]"
                />
              </form>
              
              <form>
                <Select name="status" defaultValue={statusFilter}>
                  <SelectTrigger className="w-[150px]">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Status</SelectItem>
                    <SelectItem value="available">Available</SelectItem>
                    <SelectItem value="sold">Sold</SelectItem>
                    <SelectItem value="reserved">Reserved</SelectItem>
                    <SelectItem value="removed">Removed</SelectItem>
                  </SelectContent>
                </Select>
              </form>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b">
                  <th className="text-left p-2 font-medium">Product</th>
                  <th className="text-left p-2 font-medium">Seller</th>
                  <th className="text-left p-2 font-medium">Category</th>
                  <th className="text-left p-2 font-medium">Price</th>
                  <th className="text-left p-2 font-medium">Stats</th>
                  <th className="text-left p-2 font-medium">Status</th>
                  <th className="text-right p-2 font-medium">Actions</th>
                </tr>
              </thead>
              <tbody>
                {products.map((product) => (
                  <tr key={product.id} className="border-b hover:bg-muted/50">
                    <td className="p-2">
                      <div className="flex items-center gap-3">
                        {product.images[0] ? (
                          <Image 
                            src={product.images[0].imageUrl} 
                            alt={product.title}
                            width={64}
                            height={64}
                            className="h-16 w-16 rounded-lg object-cover"
                          />
                        ) : (
                          <div className="h-16 w-16 rounded-lg bg-muted flex items-center justify-center">
                            No image
                          </div>
                        )}
                        <div>
                          <p className="font-medium line-clamp-1">{product.title}</p>
                          <p className="text-sm text-muted-foreground line-clamp-1">
                            {product.description}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {new Date(product.createdAt).toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="p-2">
                      <div>
                        <p className="text-sm font-medium">
                          {product.seller.firstName} {product.seller.lastName}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {product.seller.email}
                        </p>
                      </div>
                    </td>
                    <td className="p-2">
                      <Badge variant="outline">
                        {product.category.name}
                      </Badge>
                    </td>
                    <td className="p-2">
                      <p className="font-medium">${product.price.toFixed(2)}</p>
                    </td>
                    <td className="p-2">
                      <div className="text-sm">
                        <p>{product._count.favorites} favorites</p>
                        <p className="text-muted-foreground">
                          {product._count.orders} orders • {product.views} views
                        </p>
                      </div>
                    </td>
                    <td className="p-2">
                      <Badge variant={
                        product.status === 'AVAILABLE' ? 'default' : 
                        product.status === 'SOLD' ? 'secondary' : 
                        product.status === 'REMOVED' ? 'destructive' :
                        'outline'
                      }>
                        {product.status}
                      </Badge>
                    </td>
                    <td className="p-2 text-right">
                      <ProductActions product={product} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}