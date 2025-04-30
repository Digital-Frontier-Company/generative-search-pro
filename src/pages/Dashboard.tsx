
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardFooter, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { ArrowRight, FileText, History, Settings, Loader2 } from "lucide-react";
import { checkUserSubscription, getUserContentHistory } from "@/services/contentService";
import { useQuery } from "@tanstack/react-query";
import Header from "@/components/Header";

const Dashboard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  // Fetch user subscription data
  const { 
    data: subscriptionData,
    isLoading: subscriptionLoading 
  } = useQuery({
    queryKey: ['userSubscription'],
    queryFn: checkUserSubscription
  });
  
  // Fetch user content history
  const {
    data: contentHistory,
    isLoading: contentLoading
  } = useQuery({
    queryKey: ['contentHistory'],
    queryFn: getUserContentHistory
  });

  return (
    <>
      <Header isAuthenticated={true} />
      <div className="container max-w-7xl mx-auto py-8">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
          <div>
            <h1 className="text-3xl font-bold">Dashboard</h1>
            <p className="text-muted-foreground">
              Welcome back, {user?.email?.split('@')[0]}
            </p>
          </div>
          
          <div className="flex items-center gap-3">
            <Button 
              variant="outline"
              onClick={() => navigate('/settings')}
            >
              <Settings className="h-4 w-4 mr-2" />
              Settings
            </Button>
            
            <Button onClick={() => navigate('/generator')}>
              Create New Content
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          {/* Subscription Status */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle>Subscription</CardTitle>
              <CardDescription>
                Your current subscription details
              </CardDescription>
            </CardHeader>
            <CardContent>
              {subscriptionLoading ? (
                <div className="flex justify-center py-4">
                  <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                </div>
              ) : subscriptionData?.subscription ? (
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="font-medium">Plan</span>
                    <Badge className={`capitalize ${
                      subscriptionData.subscription.subscription_type === 'premium' 
                        ? 'bg-gradient-to-r from-amber-400 to-amber-600 text-white border-0' 
                        : ''
                    }`}>
                      {subscriptionData.subscription.subscription_type}
                    </Badge>
                  </div>
                  
                  {subscriptionData.subscription.subscription_type === 'free' && (
                    <div className="flex justify-between items-center">
                      <span className="font-medium">Credits Remaining</span>
                      <span>
                        {subscriptionData.subscription.monthly_credits - subscriptionData.subscription.credits_used} / {subscriptionData.subscription.monthly_credits}
                      </span>
                    </div>
                  )}
                  
                  {subscriptionData.subscription.subscription_end_date && (
                    <div className="flex justify-between items-center">
                      <span className="font-medium">Renews on</span>
                      <span>
                        {new Date(subscriptionData.subscription.subscription_end_date).toLocaleDateString()}
                      </span>
                    </div>
                  )}
                </div>
              ) : (
                <p className="text-center text-muted-foreground">
                  Subscription data not available
                </p>
              )}
            </CardContent>
            <CardFooter className="pt-3">
              {subscriptionData?.subscription?.subscription_type === 'free' && (
                <Button className="w-full" onClick={() => navigate('/upgrade')}>
                  Upgrade to Premium
                </Button>
              )}
              
              {subscriptionData?.subscription?.subscription_type === 'premium' && (
                <Button variant="outline" className="w-full" onClick={() => navigate('/subscription')}>
                  Manage Subscription
                </Button>
              )}
            </CardFooter>
          </Card>

          {/* Quick Actions */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle>Quick Actions</CardTitle>
              <CardDescription>
                Common tasks and shortcuts
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <Button 
                variant="outline" 
                className="w-full justify-start" 
                onClick={() => navigate('/generator')}
              >
                <FileText className="mr-2 h-4 w-4" />
                Generate New Content
              </Button>
              <Button 
                variant="outline" 
                className="w-full justify-start" 
                onClick={() => navigate('/history')}
              >
                <History className="mr-2 h-4 w-4" />
                View Content History
              </Button>
              <Button 
                variant="outline" 
                className="w-full justify-start" 
                onClick={() => navigate('/settings')}
              >
                <Settings className="mr-2 h-4 w-4" />
                Account Settings
              </Button>
            </CardContent>
          </Card>

          {/* Usage Stats */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle>Usage Stats</CardTitle>
              <CardDescription>
                Your content generation activity
              </CardDescription>
            </CardHeader>
            <CardContent>
              {contentLoading ? (
                <div className="flex justify-center py-4">
                  <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                </div>
              ) : contentHistory ? (
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="font-medium">Total Content Created</span>
                    <span>{contentHistory.length}</span>
                  </div>
                  
                  <div className="flex justify-between items-center">
                    <span className="font-medium">This Month</span>
                    <span>
                      {contentHistory.filter(content => 
                        new Date(content.created_at) > new Date(new Date().setDate(1))
                      ).length}
                    </span>
                  </div>
                  
                  <div className="flex justify-between items-center">
                    <span className="font-medium">Last Generation</span>
                    <span>
                      {contentHistory.length > 0 
                        ? new Date(contentHistory[0].created_at).toLocaleDateString() 
                        : 'N/A'}
                    </span>
                  </div>
                </div>
              ) : (
                <p className="text-center text-muted-foreground">
                  No usage data available
                </p>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Recent Content */}
        <Card>
          <CardHeader>
            <CardTitle>Recent Content</CardTitle>
            <CardDescription>
              Your most recently generated content
            </CardDescription>
          </CardHeader>
          <CardContent>
            {contentLoading ? (
              <div className="flex justify-center py-4">
                <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
              </div>
            ) : contentHistory && contentHistory.length > 0 ? (
              <div className="space-y-4">
                {contentHistory.slice(0, 3).map((content, index) => (
                  <div key={content.id} className="flex flex-col">
                    <div className="flex items-start justify-between">
                      <div className="space-y-1">
                        <h4 className="text-base font-medium leading-none">{content.title}</h4>
                        <p className="text-sm text-muted-foreground">
                          Created on {new Date(content.created_at).toLocaleDateString()}
                        </p>
                      </div>
                      <Button 
                        variant="ghost" 
                        size="sm"
                        onClick={() => navigate(`/content/${content.id}`)}
                      >
                        View
                      </Button>
                    </div>
                    {index < contentHistory.slice(0, 3).length - 1 && <Separator className="my-4" />}
                  </div>
                ))}
              </div>
            ) : (
              <div className="py-8 text-center">
                <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-muted">
                  <FileText className="h-6 w-6 text-muted-foreground" />
                </div>
                <h3 className="mb-2 text-lg font-medium">No content yet</h3>
                <p className="mb-4 text-sm text-muted-foreground">
                  You haven't generated any content yet. Create your first content piece now.
                </p>
                <Button onClick={() => navigate('/generator')}>
                  Create Content
                </Button>
              </div>
            )}
          </CardContent>
          {contentHistory && contentHistory.length > 3 && (
            <CardFooter>
              <Button 
                variant="outline" 
                className="w-full"
                onClick={() => navigate('/history')}
              >
                View All Content
              </Button>
            </CardFooter>
          )}
        </Card>
      </div>
    </>
  );
};

export default Dashboard;
