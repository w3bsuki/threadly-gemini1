import { database } from '@repo/database';
import { Card, CardContent, CardHeader, CardTitle } from '@repo/design-system/components/ui/card';
import { Button } from '@repo/design-system/components/ui/button';
import { Badge } from '@repo/design-system/components/ui/badge';
import { Input } from '@repo/design-system/components/ui/input';
import { 
  MoreVertical, 
  Search,
  Shield,
  UserX,
  Mail,
  Eye
} from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@repo/design-system/components/ui/dropdown-menu';
import Link from 'next/link';
import { UserActions } from './user-actions';

interface PageProps {
  searchParams: Promise<{ q?: string; role?: string }>;
}

export default async function AdminUsersPage({ searchParams }: PageProps) {
  const params = await searchParams;
  const search = params.q || '';
  const roleFilter = params.role || 'all';

  // Build where clause
  const where: any = {};
  
  if (search) {
    where.OR = [
      { email: { contains: search } },
      { firstName: { contains: search } },
      { lastName: { contains: search } }
    ];
  }
  
  if (roleFilter !== 'all') {
    where.role = roleFilter.toUpperCase();
  }

  const users = await database.user.findMany({
    where,
    orderBy: { joinedAt: 'desc' },
    include: {
      _count: {
        select: {
          listings: true,
          purchases: true,
          sales: true
        }
      }
    },
    take: 50
  });

  const stats = await database.user.groupBy({
    by: ['role'],
    _count: true
  });

  const roleStats = {
    total: users.length,
    admins: stats.find(s => s.role === 'ADMIN')?._count || 0,
    moderators: stats.find(s => s.role === 'MODERATOR')?._count || 0,
    users: stats.find(s => s.role === 'USER')?._count || 0
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">User Management</h1>
        <p className="text-muted-foreground mt-2">
          Manage users, roles, and permissions
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Total Users</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{roleStats.total}</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Admins</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{roleStats.admins}</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Moderators</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{roleStats.moderators}</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Regular Users</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{roleStats.users}</div>
          </CardContent>
        </Card>
      </div>

      {/* Search and Filters */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Users</CardTitle>
            <div className="flex items-center gap-2">
              <form className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search users..."
                  name="q"
                  defaultValue={search}
                  className="pl-10 w-[300px]"
                />
              </form>
              
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" size="sm">
                    Role: {roleFilter === 'all' ? 'All' : roleFilter}
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent>
                  <DropdownMenuItem asChild>
                    <Link href="/admin/users?role=all">All Roles</Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link href="/admin/users?role=admin">Admins</Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link href="/admin/users?role=moderator">Moderators</Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link href="/admin/users?role=user">Users</Link>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b">
                  <th className="text-left p-2 font-medium">User</th>
                  <th className="text-left p-2 font-medium">Role</th>
                  <th className="text-left p-2 font-medium">Stats</th>
                  <th className="text-left p-2 font-medium">Joined</th>
                  <th className="text-left p-2 font-medium">Status</th>
                  <th className="text-right p-2 font-medium">Actions</th>
                </tr>
              </thead>
              <tbody>
                {users.map((user) => (
                  <tr key={user.id} className="border-b hover:bg-muted/50">
                    <td className="p-2">
                      <div className="flex items-center gap-3">
                        {user.imageUrl ? (
                          <img 
                            src={user.imageUrl} 
                            alt={`${user.firstName} ${user.lastName}`}
                            className="h-10 w-10 rounded-full object-cover"
                          />
                        ) : (
                          <div className="h-10 w-10 rounded-full bg-muted flex items-center justify-center">
                            {user.firstName?.[0] || user.email[0]}
                          </div>
                        )}
                        <div>
                          <p className="font-medium">
                            {user.firstName} {user.lastName}
                          </p>
                          <p className="text-sm text-muted-foreground">
                            {user.email}
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="p-2">
                      <Badge variant={
                        user.role === 'ADMIN' ? 'destructive' : 
                        user.role === 'MODERATOR' ? 'default' : 
                        'secondary'
                      }>
                        {user.role}
                      </Badge>
                    </td>
                    <td className="p-2">
                      <div className="text-sm">
                        <p>{user._count.listings} listings</p>
                        <p className="text-muted-foreground">
                          {user._count.sales} sales • {user._count.purchases} purchases
                        </p>
                      </div>
                    </td>
                    <td className="p-2">
                      <p className="text-sm">
                        {new Date(user.joinedAt).toLocaleDateString()}
                      </p>
                    </td>
                    <td className="p-2">
                      <Badge variant={user.verified ? 'default' : 'outline'}>
                        {user.verified ? 'Verified' : 'Unverified'}
                      </Badge>
                    </td>
                    <td className="p-2 text-right">
                      <UserActions user={user} />
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