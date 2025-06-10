import { database } from '@repo/database';
import { Card, CardContent, CardHeader, CardTitle } from '@repo/design-system/components/ui/card';
import { Button } from '@repo/design-system/components/ui/button';
import { Badge } from '@repo/design-system/components/ui/badge';
import { 
  AlertTriangle,
  User,
  Package,
  MessageCircle,
  Check,
  X,
  Eye,
  Clock
} from 'lucide-react';
import { ReportActions } from './report-actions';
import Link from 'next/link';

export default async function AdminReportsPage() {
  // For now, we'll use a mock structure since the Report model might not exist
  // In a real implementation, you'd have a Report table with fields like:
  // id, reporterId, targetId, targetType, reason, status, description, createdAt
  
  const mockReports = [
    {
      id: '1',
      type: 'PRODUCT',
      reason: 'Inappropriate content',
      description: 'Product contains inappropriate images',
      status: 'PENDING',
      reportedBy: 'user123',
      reportedAt: new Date(),
      target: {
        id: 'prod1',
        title: 'Sample Product',
        seller: 'John Doe'
      }
    },
    {
      id: '2',
      type: 'USER',
      reason: 'Spam/Scam',
      description: 'User is posting fake listings',
      status: 'UNDER_REVIEW',
      reportedBy: 'user456',
      reportedAt: new Date(Date.now() - 86400000),
      target: {
        id: 'user1',
        name: 'Jane Smith',
        email: 'jane@example.com'
      }
    }
  ];

  // Stats would come from database queries
  const stats = {
    pending: 5,
    underReview: 3,
    resolved: 25,
    dismissed: 12
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Content Moderation</h1>
        <p className="text-muted-foreground mt-2">
          Review and manage user reports
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Pending Reports</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">{stats.pending}</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Under Review</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-600">{stats.underReview}</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Resolved</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{stats.resolved}</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Dismissed</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-gray-600">{stats.dismissed}</div>
          </CardContent>
        </Card>
      </div>

      {/* Reports List */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Reports</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {mockReports.map((report) => (
              <div key={report.id} className="border rounded-lg p-4">
                <div className="flex items-start justify-between">
                  <div className="flex items-start gap-4">
                    <div className="p-2 rounded-lg bg-red-50 text-red-600">
                      {report.type === 'PRODUCT' && <Package className="h-4 w-4" />}
                      {report.type === 'USER' && <User className="h-4 w-4" />}
                      {report.type === 'MESSAGE' && <MessageCircle className="h-4 w-4" />}
                    </div>
                    
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <h3 className="font-semibold">{report.reason}</h3>
                        <Badge variant={
                          report.status === 'PENDING' ? 'destructive' :
                          report.status === 'UNDER_REVIEW' ? 'default' :
                          report.status === 'RESOLVED' ? 'secondary' :
                          'outline'
                        }>
                          {report.status.replace('_', ' ')}
                        </Badge>
                      </div>
                      
                      <p className="text-sm text-muted-foreground mb-2">
                        {report.description}
                      </p>
                      
                      <div className="flex items-center gap-4 text-sm text-muted-foreground">
                        <span>
                          Type: <span className="font-medium">{report.type}</span>
                        </span>
                        <span>
                          Target: {report.type === 'PRODUCT' ? report.target.title : report.target.name}
                        </span>
                        <span className="flex items-center gap-1">
                          <Clock className="h-3 w-3" />
                          {report.reportedAt.toLocaleDateString()}
                        </span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <Button variant="outline" size="sm" asChild>
                      <Link href={`/admin/reports/${report.id}`}>
                        <Eye className="h-3 w-3 mr-1" />
                        Review
                      </Link>
                    </Button>
                    
                    <ReportActions report={report} />
                  </div>
                </div>
              </div>
            ))}
          </div>

          {mockReports.length === 0 && (
            <div className="text-center py-8 text-muted-foreground">
              <AlertTriangle className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <h3 className="text-lg font-semibold mb-2">No reports to review</h3>
              <p>All reports have been processed. Great job!</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle>Moderation Tools</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Button variant="outline" asChild>
              <Link href="/admin/users">
                <User className="h-4 w-4 mr-2" />
                Manage Users
              </Link>
            </Button>
            
            <Button variant="outline" asChild>
              <Link href="/admin/products">
                <Package className="h-4 w-4 mr-2" />
                Review Products
              </Link>
            </Button>
            
            <Button variant="outline" asChild>
              <Link href="/admin">
                <AlertTriangle className="h-4 w-4 mr-2" />
                Dashboard
              </Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}