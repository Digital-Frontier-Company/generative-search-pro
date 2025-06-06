
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { CheckCircle, Loader2, Crown, Users, Zap } from "lucide-react";
import Header from "@/components/Header";
import { useSubscription } from "@/contexts/SubscriptionContext";
import { toast } from "sonner";

const Upgrade = () => {
  const navigate = useNavigate();
  const { subscribed, subscriptionTier, isTrialActive, trialEnd, createCheckoutSession, openCustomerPortal } = useSubscription();
  const [loadingTier, setLoadingTier] = useState<string | null>(null);

  const handleSelectPlan = async (tier: 'basic' | 'pro' | 'team') => {
    setLoadingTier(tier);
    try {
      await createCheckoutSession(tier);
      toast.success(`Redirecting to checkout for ${tier} plan...`);
    } catch (error) {
      console.error('Error creating checkout session:', error);
      toast.error('Failed to create checkout session. Please try again.');
    } finally {
      setLoadingTier(null);
    }
  };

  const handleManageSubscription = async () => {
    try {
      await openCustomerPortal();
      toast.success('Opening subscription management...');
    } catch (error) {
      console.error('Error opening customer portal:', error);
      toast.error('Failed to open subscription management. Please try again.');
    }
  };

  const formatTrialEndDate = (trialEndDate: string) => {
    return new Date(trialEndDate).toLocaleDateString();
  };

  const plans = [
    {
      id: 'basic',
      name: 'Basic',
      price: '$9.99',
      description: 'Perfect for individuals getting started',
      icon: <Zap className="w-6 h-6" />,
      features: [
        'Up to 50 content generations per month',
        'Basic AEO optimization',
        'Standard schema markup',
        'Email support',
        'Export to HTML/JSON'
      ],
      popular: false
    },
    {
      id: 'pro',
      name: 'Pro',
      price: '$19.99',
      description: 'For professionals and growing businesses',
      icon: <Crown className="w-6 h-6" />,
      features: [
        'Up to 200 content generations per month',
        'Advanced AEO optimization',
        'All content types (Blog, Article, FAQ)',
        'Priority email support',
        'Content history and search',
        'Advanced schema markup',
        'SEO analysis tools',
        'Citation checking'
      ],
      popular: true
    },
    {
      id: 'team',
      name: 'Team',
      price: '$49.99',
      description: 'For teams and enterprises',
      icon: <Users className="w-6 h-6" />,
      features: [
        'Unlimited content generations',
        'All Pro features',
        'Team collaboration tools',
        'Custom export templates',
        'Priority support',
        'API access',
        'White-label options',
        'Advanced analytics',
        'Domain analysis tools'
      ],
      popular: false
    }
  ];

  return (
    <>
      <Header />
      <div className="container mx-auto py-8">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <h1 className="text-4xl font-bold mb-4">Choose Your Plan</h1>
            <p className="text-xl text-gray-600 mb-6">
              Start with a 7-day free trial on any plan. No credit card required.
            </p>
            
            {subscribed && (
              <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-6 inline-block">
                <div className="flex items-center justify-center space-x-2">
                  <CheckCircle className="w-5 h-5 text-green-500" />
                  <span className="text-green-700 font-medium">
                    {isTrialActive 
                      ? `You're on a free trial of the ${subscriptionTier} plan${trialEnd ? ` until ${formatTrialEndDate(trialEnd)}` : ''}`
                      : `You're subscribed to the ${subscriptionTier} plan`
                    }
                  </span>
                </div>
                <Button 
                  onClick={handleManageSubscription}
                  variant="link" 
                  className="text-green-600 mt-2"
                >
                  Manage Subscription
                </Button>
              </div>
            )}
          </div>
          
          <div className="grid md:grid-cols-3 gap-8">
            {plans.map((plan) => (
              <Card 
                key={plan.id} 
                className={`relative ${
                  plan.popular 
                    ? 'ring-2 ring-aeo-blue scale-105 shadow-lg' 
                    : 'border-gray-200'
                } ${
                  subscriptionTier === plan.id 
                    ? 'ring-2 ring-green-500 bg-green-50' 
                    : ''
                }`}
              >
                {plan.popular && (
                  <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                    <span className="bg-aeo-blue text-white text-sm font-medium py-1 px-4 rounded-full">
                      Most Popular
                    </span>
                  </div>
                )}
                
                {subscriptionTier === plan.id && (
                  <div className="absolute -top-3 right-4">
                    <span className="bg-green-500 text-white text-sm font-medium py-1 px-3 rounded-full">
                      Current Plan
                    </span>
                  </div>
                )}

                <CardHeader className="text-center">
                  <div className="flex justify-center mb-4">
                    <div className={`p-3 rounded-full ${
                      plan.popular ? 'bg-aeo-blue text-white' : 'bg-gray-100 text-gray-600'
                    }`}>
                      {plan.icon}
                    </div>
                  </div>
                  <CardTitle className="text-2xl">{plan.name}</CardTitle>
                  <div className="mt-4">
                    <span className="text-4xl font-bold">{plan.price}</span>
                    <span className="text-gray-500 ml-1">/month</span>
                  </div>
                  <CardDescription className="mt-2">
                    {plan.description}
                  </CardDescription>
                </CardHeader>
                
                <CardContent>
                  <ul className="space-y-3">
                    {plan.features.map((feature, index) => (
                      <li key={index} className="flex items-start">
                        <CheckCircle className="w-5 h-5 text-green-500 mr-2 flex-shrink-0 mt-0.5" />
                        <span className="text-sm">{feature}</span>
                      </li>
                    ))}
                  </ul>
                </CardContent>
                
                <CardFooter>
                  {subscriptionTier === plan.id ? (
                    <Button 
                      onClick={handleManageSubscription}
                      className="w-full" 
                      variant="outline"
                    >
                      Manage Subscription
                    </Button>
                  ) : (
                    <Button 
                      onClick={() => handleSelectPlan(plan.id as 'basic' | 'pro' | 'team')}
                      className={`w-full ${
                        plan.popular 
                          ? 'bg-aeo-blue hover:bg-aeo-blue/90' 
                          : ''
                      }`}
                      disabled={loadingTier === plan.id}
                    >
                      {loadingTier === plan.id ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Processing...
                        </>
                      ) : (
                        <>
                          Start 7-Day Free Trial
                        </>
                      )}
                    </Button>
                  )}
                </CardFooter>
              </Card>
            ))}
          </div>
          
          <div className="mt-12 text-center text-sm text-gray-500">
            <p>All plans include a 7-day free trial. Cancel anytime during the trial period.</p>
            <p className="mt-2">Questions? <a href="mailto:support@example.com" className="text-aeo-blue hover:underline">Contact our support team</a></p>
          </div>
        </div>
      </div>
    </>
  );
};

export default Upgrade;
