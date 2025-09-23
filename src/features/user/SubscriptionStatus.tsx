
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useSubscription } from "@/contexts/SubscriptionContext";
import { Crown, Users, Zap, Calendar, RefreshCw } from "lucide-react";
import { useState } from "react";

const SubscriptionStatus = () => {
  const { 
    subscribed, 
    subscriptionTier, 
    isTrialActive, 
    trialEnd, 
    subscriptionEnd,
    loading,
    refreshSubscription,
    openCustomerPortal 
  } = useSubscription();
  
  const [refreshing, setRefreshing] = useState(false);

  const handleRefresh = async () => {
    setRefreshing(true);
    await refreshSubscription();
    setRefreshing(false);
  };

  const getTierIcon = (tier: string | null) => {
    switch (tier) {
      case 'basic':
        return <Zap className="w-5 h-5" />;
      case 'pro':
        return <Crown className="w-5 h-5" />;
      case 'team':
        return <Users className="w-5 h-5" />;
      default:
        return null;
    }
  };

  const getTierColor = (tier: string | null) => {
    switch (tier) {
      case 'basic':
        return 'bg-blue-100 text-blue-800';
      case 'pro':
        return 'bg-purple-100 text-purple-800';
      case 'team':
        return 'bg-green-100 text-green-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const formatDate = (dateString: string | null) => {
    if (!dateString) return 'Unknown';
    return new Date(dateString).toLocaleDateString();
  };

  const getDaysRemaining = (endDate: string | null) => {
    if (!endDate) return null;
    const now = new Date();
    const end = new Date(endDate);
    const diffTime = end.getTime() - now.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays > 0 ? diffDays : 0;
  };

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <RefreshCw className="w-5 h-5 animate-spin" />
            Loading Subscription Status...
          </CardTitle>
        </CardHeader>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <CardTitle>Subscription Status</CardTitle>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleRefresh}
              disabled={refreshing}
            >
              <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} />
            </Button>
          </div>
          {subscribed && subscriptionTier && (
            <Badge className={getTierColor(subscriptionTier)}>
              <div className="flex items-center gap-1">
                {getTierIcon(subscriptionTier)}
                {subscriptionTier.charAt(0).toUpperCase() + subscriptionTier.slice(1)}
              </div>
            </Badge>
          )}
        </div>
      </CardHeader>
      
      <CardContent className="space-y-4">
        {!subscribed ? (
          <div>
            <CardDescription>
              You don't have an active subscription. Upgrade to unlock premium features.
            </CardDescription>
            <Button className="mt-3" onClick={() => window.location.href = '/upgrade'}>
              View Plans
            </Button>
          </div>
        ) : (
          <div className="space-y-4">
            {isTrialActive && trialEnd && (
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <div className="flex items-center gap-2 mb-2">
                  <Calendar className="w-4 h-4 text-blue-600" />
                  <span className="font-medium text-blue-800">Free Trial Active</span>
                </div>
                <p className="text-sm text-blue-700">
                  Your trial ends on {formatDate(trialEnd)} 
                  {getDaysRemaining(trialEnd) && (
                    <span className="font-medium">
                      {' '}({getDaysRemaining(trialEnd)} days remaining)
                    </span>
                  )}
                </p>
              </div>
            )}

            {!isTrialActive && subscriptionEnd && (
              <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                <div className="flex items-center gap-2 mb-2">
                  <Calendar className="w-4 h-4 text-green-600" />
                  <span className="font-medium text-green-800">Active Subscription</span>
                </div>
                <p className="text-sm text-green-700">
                  Next billing date: {formatDate(subscriptionEnd)}
                </p>
              </div>
            )}

            <div className="flex gap-2">
              <Button onClick={openCustomerPortal} variant="outline">
                Manage Subscription
              </Button>
              <Button onClick={() => window.location.href = '/upgrade'} variant="outline">
                Upgrade Plan
              </Button>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default SubscriptionStatus;
