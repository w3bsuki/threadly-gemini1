import { currentUser } from '@repo/auth/server';
import { redirect } from 'next/navigation';
import type { Metadata } from 'next';
import { Header } from '../../components/header';
import { Card, CardContent, CardHeader, CardTitle } from '@repo/design-system/components/ui/card';
import { Button } from '@repo/design-system/components/ui/button';
import { Input } from '@repo/design-system/components/ui/input';
import { Label } from '@repo/design-system/components/ui/label';
import { Textarea } from '@repo/design-system/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@repo/design-system/components/ui/select';
import { Badge } from '@repo/design-system/components/ui/badge';
import { Separator } from '@repo/design-system/components/ui/separator';
import { 
  Send, 
  MessageSquare, 
  Star, 
  Lightbulb, 
  Bug, 
  Heart,
  ThumbsUp,
  Smile,
  AlertCircle
} from 'lucide-react';

const title = 'Send Feedback';
const description = 'Help us improve Threadly with your thoughts';

export const metadata: Metadata = {
  title,
  description,
};

const FeedbackPage = async () => {
  const user = await currentUser();
  
  if (!user) {
    redirect('/sign-in');
  }

  const feedbackTypes = [
    {
      value: 'suggestion',
      label: 'Feature Suggestion',
      icon: Lightbulb,
      description: 'Ideas for new features or improvements',
      color: 'bg-yellow-50 text-yellow-600 border-yellow-200'
    },
    {
      value: 'bug',
      label: 'Bug Report',
      icon: Bug,
      description: 'Something isn\'t working as expected',
      color: 'bg-red-50 text-red-600 border-red-200'
    },
    {
      value: 'compliment',
      label: 'Compliment',
      icon: Heart,
      description: 'Share what you love about Threadly',
      color: 'bg-green-50 text-green-600 border-green-200'
    },
    {
      value: 'general',
      label: 'General Feedback',
      icon: MessageSquare,
      description: 'General thoughts and comments',
      color: 'bg-blue-50 text-blue-600 border-blue-200'
    }
  ];

  const recentUpdates = [
    {
      title: 'Enhanced Search Filters',
      description: 'Added more filtering options based on your feedback',
      date: '2 days ago',
      status: 'completed'
    },
    {
      title: 'Mobile App Improvements',
      description: 'Faster loading and better navigation',
      date: '1 week ago',
      status: 'completed'
    },
    {
      title: 'Seller Dashboard Analytics',
      description: 'More detailed sales insights coming soon',
      date: '2 weeks ago',
      status: 'in-progress'
    }
  ];

  return (
    <>
      <Header pages={['Dashboard', 'Feedback']} page="Feedback" />
      <div className="flex flex-1 flex-col gap-6 p-4 pt-0">
        <div className="text-center">
          <MessageSquare className="h-16 w-16 text-primary mx-auto mb-4" />
          <h1 className="text-3xl font-bold mb-2">We'd love your feedback!</h1>
          <p className="text-muted-foreground text-lg">
            Your input helps us make Threadly better for everyone
          </p>
        </div>

        <div className="grid gap-6 lg:grid-cols-2">
          {/* Feedback Form */}
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Send className="h-5 w-5" />
                  Send Feedback
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="feedback-type">What type of feedback is this?</Label>
                  <Select>
                    <SelectTrigger>
                      <SelectValue placeholder="Select feedback type" />
                    </SelectTrigger>
                    <SelectContent>
                      {feedbackTypes.map((type) => (
                        <SelectItem key={type.value} value={type.value}>
                          <div className="flex items-center gap-2">
                            <type.icon className="h-4 w-4" />
                            {type.label}
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="subject">Subject</Label>
                  <Input
                    id="subject"
                    placeholder="Brief summary of your feedback"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="message">Your Feedback</Label>
                  <Textarea
                    id="message"
                    placeholder="Tell us more about your experience, suggestion, or issue..."
                    rows={6}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="email">Email (optional)</Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="your@email.com"
                    defaultValue={user.emailAddresses[0]?.emailAddress}
                  />
                  <p className="text-xs text-muted-foreground">
                    We'll only use this to follow up on your feedback if needed
                  </p>
                </div>

                <Separator />

                <div className="space-y-3">
                  <Label>How would you rate your overall experience?</Label>
                  <div className="flex gap-2">
                    {[1, 2, 3, 4, 5].map((rating) => (
                      <Button
                        key={rating}
                        variant="outline"
                        size="sm"
                        className="w-12 h-12 p-0"
                      >
                        <Star className="h-4 w-4" />
                      </Button>
                    ))}
                  </div>
                </div>

                <Button className="w-full">
                  <Send className="h-4 w-4 mr-2" />
                  Send Feedback
                </Button>
              </CardContent>
            </Card>

            {/* Quick Feedback Options */}
            <Card>
              <CardHeader>
                <CardTitle>Quick Feedback</CardTitle>
                <p className="text-sm text-muted-foreground">
                  Let us know with a single click
                </p>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 gap-3">
                  <Button variant="outline" className="h-auto p-4 flex-col gap-2">
                    <ThumbsUp className="h-6 w-6 text-green-600" />
                    <span className="text-sm">Love it!</span>
                  </Button>
                  <Button variant="outline" className="h-auto p-4 flex-col gap-2">
                    <Smile className="h-6 w-6 text-yellow-600" />
                    <span className="text-sm">It's good</span>
                  </Button>
                  <Button variant="outline" className="h-auto p-4 flex-col gap-2">
                    <AlertCircle className="h-6 w-6 text-orange-600" />
                    <span className="text-sm">Needs work</span>
                  </Button>
                  <Button variant="outline" className="h-auto p-4 flex-col gap-2">
                    <Bug className="h-6 w-6 text-red-600" />
                    <span className="text-sm">Found a bug</span>
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Feedback Types & Recent Updates */}
          <div className="space-y-6">
            {/* Feedback Types */}
            <Card>
              <CardHeader>
                <CardTitle>Feedback Categories</CardTitle>
                <p className="text-sm text-muted-foreground">
                  Choose the right category for better responses
                </p>
              </CardHeader>
              <CardContent className="space-y-3">
                {feedbackTypes.map((type) => (
                  <div 
                    key={type.value}
                    className={`p-3 rounded-lg border ${type.color}`}
                  >
                    <div className="flex items-center gap-3">
                      <type.icon className="h-5 w-5" />
                      <div>
                        <h3 className="font-medium">{type.label}</h3>
                        <p className="text-sm opacity-80">{type.description}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>

            {/* Recent Updates */}
            <Card>
              <CardHeader>
                <CardTitle>Recent Updates</CardTitle>
                <p className="text-sm text-muted-foreground">
                  Changes made based on user feedback
                </p>
              </CardHeader>
              <CardContent className="space-y-4">
                {recentUpdates.map((update, index) => (
                  <div key={index} className="flex items-start gap-3">
                    <div className="mt-1">
                      {update.status === 'completed' ? (
                        <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                      ) : (
                        <div className="w-2 h-2 bg-yellow-500 rounded-full"></div>
                      )}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="font-medium text-sm">{update.title}</h3>
                        <Badge 
                          variant={update.status === 'completed' ? 'default' : 'secondary'}
                          className="text-xs"
                        >
                          {update.status === 'completed' ? 'Done' : 'In Progress'}
                        </Badge>
                      </div>
                      <p className="text-xs text-muted-foreground mb-1">
                        {update.description}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {update.date}
                      </p>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>

            {/* Contact Info */}
            <Card className="border-blue-200 bg-blue-50">
              <CardContent className="p-4">
                <div className="flex items-start gap-3">
                  <MessageSquare className="h-5 w-5 text-blue-600 mt-0.5" />
                  <div>
                    <h3 className="font-semibold text-blue-900 mb-1">
                      Have a detailed suggestion?
                    </h3>
                    <p className="text-sm text-blue-800 mb-2">
                      For complex feature requests or detailed feedback, feel free to email us directly.
                    </p>
                    <Button size="sm" variant="outline" className="border-blue-300 text-blue-700">
                      Email feedback@threadly.com
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </>
  );
};

export default FeedbackPage;