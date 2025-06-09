import { currentUser } from '@repo/auth/server';
import { database } from '@repo/database';
import { redirect } from 'next/navigation';
import type { Metadata } from 'next';
import { Header } from '../components/header';
import { Card, CardContent, CardHeader, CardTitle } from '@repo/design-system/components/ui/card';
import { Button } from '@repo/design-system/components/ui/button';
import { Badge } from '@repo/design-system/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@repo/design-system/components/ui/avatar';
import { 
  Users, 
  UserPlus, 
  Star, 
  Package, 
  MessageCircle, 
  ExternalLink,
  Search
} from 'lucide-react';
import Link from 'next/link';

const title = 'Following';
const description = 'Sellers and users you follow';

export const metadata: Metadata = {
  title,
  description,
};

const FollowingPage = async () => {
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

  // Note: Following system would need to be implemented in the database schema
  // For now, we'll show potential users to follow based on recent activity
  
  // Get top sellers (users with most recent products/sales)
  const topSellers = await database.user.findMany({
    where: {
      NOT: {
        id: dbUser.id, // Exclude current user
      },
    },
    include: {
      _count: {
        select: {
          listings: {
            where: {
              status: 'AVAILABLE'
            }
          },
          receivedReviews: true,
        },
      },
      listings: {
        where: {
          status: 'AVAILABLE'
        },
        take: 3,
        orderBy: {
          createdAt: 'desc'
        },
        include: {
          images: {
            take: 1,
            orderBy: {
              displayOrder: 'asc'
            }
          },
          category: {
            select: {
              name: true
            }
          }
        }
      }
    },
    orderBy: [
      { averageRating: 'desc' },
      { joinedAt: 'desc' }
    ],
    take: 12
  });

  const getUserName = (user: any) => {
    if (user.firstName && user.lastName) {
      return `${user.firstName} ${user.lastName}`;
    }
    return user.email?.split('@')[0] || 'Unknown User';
  };

  const getInitials = (user: any) => {
    if (user.firstName && user.lastName) {
      return `${user.firstName[0]}${user.lastName[0]}`;
    }
    const email = user.email?.split('@')[0] || 'U';
    return email[0]?.toUpperCase() || 'U';
  };

  const formatPrice = (price: number) => {
    return `$${(price / 100).toFixed(2)}`;
  };

  return (
    <>
      <Header pages={['Dashboard', 'Following']} page="Following" />
      <div className="flex flex-1 flex-col gap-6 p-4 pt-0">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">Following</h1>
            <p className="text-muted-foreground">
              Discover and follow sellers you love
            </p>
          </div>
          <Button asChild>
            <Link href="/browse">
              <Search className="h-4 w-4 mr-2" />
              Discover Sellers
            </Link>
          </Button>
        </div>

        {/* Currently Following (Empty State) */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5" />
              People You Follow
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-center py-8">
              <UserPlus className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">No one followed yet</h3>
              <p className="text-muted-foreground mb-4">
                Start following sellers to see their latest items and updates
              </p>
              <Button asChild>
                <Link href="/browse">
                  <UserPlus className="h-4 w-4 mr-2" />
                  Find People to Follow
                </Link>
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Suggested Sellers */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold">Suggested Sellers</h2>
            <Badge variant="secondary">
              Based on your activity
            </Badge>
          </div>
          
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {topSellers.map((seller) => (
              <Card key={seller.id} className="hover:shadow-md transition-shadow">
                <CardHeader className="text-center">
                  <Avatar className="w-16 h-16 mx-auto mb-3">
                    <AvatarImage src={seller.imageUrl || undefined} />
                    <AvatarFallback className="text-lg">
                      {getInitials(seller)}
                    </AvatarFallback>
                  </Avatar>
                  <CardTitle className="text-lg">{getUserName(seller)}</CardTitle>
                  
                  <div className="flex items-center justify-center gap-4 text-sm text-muted-foreground">
                    <div className="flex items-center gap-1">
                      <Package className="h-4 w-4" />
                      {seller._count.listings} items
                    </div>
                    {seller.averageRating && seller.averageRating > 0 && (
                      <div className="flex items-center gap-1">
                        <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                        {seller.averageRating.toFixed(1)}
                      </div>
                    )}
                  </div>
                </CardHeader>

                <CardContent>
                  {/* Recent Items Preview */}
                  {seller.listings.length > 0 && (
                    <div className="space-y-3 mb-4">
                      <h4 className="text-sm font-medium">Recent Items</h4>
                      <div className="grid grid-cols-3 gap-2">
                        {seller.listings.map((product) => (
                          <div key={product.id} className="aspect-square relative">
                            {product.images[0] ? (
                              <img
                                src={product.images[0].imageUrl}
                                alt={product.title}
                                className="w-full h-full object-cover rounded-md"
                              />
                            ) : (
                              <div className="w-full h-full bg-gradient-to-br from-purple-400 via-pink-500 to-red-500 rounded-md flex items-center justify-center">
                                <Package className="h-4 w-4 text-white opacity-80" />
                              </div>
                            )}
                            <div className="absolute bottom-0 left-0 right-0 bg-black/50 text-white text-xs p-1 rounded-b-md">
                              {formatPrice(product.price)}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  <div className="flex gap-2">
                    <Button size="sm" className="flex-1">
                      <UserPlus className="h-4 w-4 mr-2" />
                      Follow
                    </Button>
                    <Button size="sm" variant="outline" asChild>
                      <Link href={`/messages?user=${seller.id}`}>
                        <MessageCircle className="h-4 w-4" />
                      </Link>
                    </Button>
                    <Button size="sm" variant="outline" asChild>
                      <Link href={`/seller/${seller.id}`}>
                        <ExternalLink className="h-4 w-4" />
                      </Link>
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* Follow Benefits */}
        <Card className="border-blue-200 bg-blue-50">
          <CardContent className="p-6">
            <h3 className="font-semibold text-blue-900 mb-3">Benefits of Following</h3>
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
              <div className="flex items-center gap-2 text-sm text-blue-800">
                <Package className="h-4 w-4" />
                <span>See new listings first</span>
              </div>
              <div className="flex items-center gap-2 text-sm text-blue-800">
                <Star className="h-4 w-4" />
                <span>Get notified of sales</span>
              </div>
              <div className="flex items-center gap-2 text-sm text-blue-800">
                <MessageCircle className="h-4 w-4" />
                <span>Easier communication</span>
              </div>
              <div className="flex items-center gap-2 text-sm text-blue-800">
                <Users className="h-4 w-4" />
                <span>Discover similar styles</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Popular Categories */}
        <Card>
          <CardHeader>
            <CardTitle>Discover by Category</CardTitle>
            <p className="text-sm text-muted-foreground">
              Find sellers specializing in your favorite styles
            </p>
          </CardHeader>
          <CardContent>
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
              {['Women\'s Fashion', 'Men\'s Style', 'Designer Items', 'Vintage Finds'].map((category) => (
                <Button
                  key={category}
                  variant="outline"
                  className="h-auto p-4 flex-col gap-2"
                  asChild
                >
                  <Link href={`/browse?category=${category.toLowerCase().replace(/\s+/g, '-')}`}>
                    <Package className="h-6 w-6" />
                    <span className="text-sm">{category}</span>
                  </Link>
                </Button>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </>
  );
};

export default FollowingPage;