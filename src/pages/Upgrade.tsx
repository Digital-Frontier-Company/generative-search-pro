
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { CheckCircle, Loader2, Crown, Users, Zap, X } from "lucide-react";
import Header from "@/components/Header";
import { useSubscription } from "@/contexts/SubscriptionContext";
import { toast } from "sonner";

const Upgrade = () => {
  const navigate = useNavigate();
  const { subscribed, subscriptionTier, isTrialActive, trialEnd, createCheckoutSession, openCustomerPortal } = useSubscription();
  const [loadingTier, setLoadingTier] = useState<string | null>(null);
  const [billingCycle, setBillingCycle] = useState<'monthly' | 'annual'>('monthly');

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
      monthlyPrice: 9.99,
      annualPrice: 8.33,
      description: 'Perfect for individuals and small websites',
      icon: <Zap className="w-6 h-6" />,
      features: [
        'Up to 50 AEO content pieces per month',
        'Basic schema markup generation',
        'Standard FAQ optimization',
        'HTML/JSON export',
        'Email support',
        'Content templates library'
      ],
      notIncluded: [
        'Advanced analytics',
        'Team collaboration',
        'Priority support',
        'Custom export templates'
      ],
      popular: false,
      savings: billingCycle === 'annual' ? 20 : 0
    },
    {
      id: 'pro',
      name: 'Pro',
      monthlyPrice: 29.99,
      annualPrice: 24.99,
      description: 'For professionals and growing businesses',
      icon: <Crown className="w-6 h-6" />,
      features: [
        'Up to 500 AEO content pieces per month',
        'Advanced schema markup & metadata',
        'All content types (Blog, Article, FAQ, Product)',
        'SEO analysis and recommendations',
        'Content performance tracking',
        'Citation checking and validation',
        'Priority email support',
        'Content history and search',
        'Advanced export templates',
        'API access (100 calls/month)'
      ],
      notIncluded: [
        'Team collaboration features',
        'White-label exports',
        'Unlimited API access'
      ],
      popular: true,
      savings: billingCycle === 'annual' ? 17 : 0
    },
    {
      id: 'team',
      name: 'Team',
      monthlyPrice: 79.99,
      annualPrice: 66.66,
      description: 'For teams, agencies, and enterprises',
      icon: <Users className="w-6 h-6" />,
      features: [
        'Unlimited AEO content generation',
        'All Pro features included',
        'Team collaboration tools',
        'Multi-user workspace',
        'White-label export options',
        'Custom branding',
        'Unlimited API access',
        'Advanced analytics dashboard',
        'Domain analysis tools',
        'Priority phone & chat support',
        'Custom integrations',
        'Dedicated account manager'
      ],
      notIncluded: [],
      popular: false,
      savings: billingCycle === 'annual' ? 17 : 0
    }
  ];

  const getPrice = (plan: typeof plans[0]) => {
    return billingCycle === 'annual' ? plan.annualPrice : plan.monthlyPrice;
  };

  const getOriginalPrice = (plan: typeof plans[0]) => {
    return billingCycle === 'annual' ? plan.monthlyPrice : null;
  };

  return (
    <>
      <Header />
      <div className="container mx-auto py-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12">
            <h1 className="text-4xl font-bold mb-4">Choose Your AEO Plan</h1>
            <p className="text-xl text-gray-600 mb-6">
              Start dominating AI search results with our AEO optimization platform
            </p>
            
            {/* Billing Toggle */}
            <div className="inline-flex items-center bg-gray-100 rounded-lg p-1 mb-8">
              <button 
                onClick={() => setBillingCycle('monthly')}
                className={`px-6 py-2 rounded-md text-sm font-medium transition-all ${
                  billingCycle === 'monthly' 
                    ? 'bg-white text-gray-900 shadow' 
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                Monthly
              </button>
              <button 
                onClick={() => setBillingCycle('annual')}
                className={`px-6 py-2 rounded-md text-sm font-medium transition-all ${
                  billingCycle === 'annual' 
                    ? 'bg-white text-gray-900 shadow' 
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                Annual
                <span className="ml-2 text-green-600 font-semibold">Save up to 20%</span>
              </button>
            </div>
            
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
          
          <div className="grid lg:grid-cols-3 gap-8">
            {plans.map((plan) => (
              <Card 
                key={plan.id} 
                className={`relative ${
                  plan.popular 
                    ? 'ring-2 ring-blue-500 scale-105 shadow-xl' 
                    : 'border-gray-200 shadow-lg'
                } ${
                  subscriptionTier === plan.id 
                    ? 'ring-2 ring-green-500 bg-green-50' 
                    : ''
                }`}
              >
                {plan.popular && (
                  <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                    <span className="bg-blue-500 text-white text-sm font-medium py-1 px-4 rounded-full">
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

                <CardHeader className="text-center pb-4">
                  <div className="flex justify-center mb-4">
                    <div className={`p-3 rounded-full ${
                      plan.popular ? 'bg-blue-500 text-white' : 'bg-gray-100 text-gray-600'
                    }`}>
                      {plan.icon}
                    </div>
                  </div>
                  <CardTitle className="text-2xl">{plan.name}</CardTitle>
                  <div className="mt-4">
                    <div className="flex items-center justify-center space-x-2">
                      <span className="text-4xl font-bold">${getPrice(plan).toFixed(2)}</span>
                      <div className="text-left">
                        {getOriginalPrice(plan) && (
                          <div className="text-sm text-gray-500 line-through">
                            ${getOriginalPrice(plan)!.toFixed(2)}
                          </div>
                        )}
                        <div className="text-sm text-gray-500">
                          /{billingCycle === 'annual' ? 'month' : 'month'}
                        </div>
                      </div>
                    </div>
                    {billingCycle === 'annual' && plan.savings > 0 && (
                      <div className="text-green-600 text-sm font-medium mt-1">
                        Save {plan.savings}% annually
                      </div>
                    )}
                    {billingCycle === 'annual' && (
                      <div className="text-xs text-gray-500 mt-1">
                        Billed ${(getPrice(plan) * 12).toFixed(2)} annually
                      </div>
                    )}
                  </div>
                  <CardDescription className="mt-2">
                    {plan.description}
                  </CardDescription>
                </CardHeader>
                
                <CardContent className="px-6">
                  <div className="space-y-4">
                    <div>
                      <h4 className="font-semibold text-sm text-gray-900 mb-3">What's included:</h4>
                      <ul className="space-y-2">
                        {plan.features.map((feature, index) => (
                          <li key={index} className="flex items-start">
                            <CheckCircle className="w-4 h-4 text-green-500 mr-2 flex-shrink-0 mt-0.5" />
                            <span className="text-sm text-gray-700">{feature}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                    
                    {plan.notIncluded.length > 0 && (
                      <div>
                        <h4 className="font-semibold text-sm text-gray-900 mb-3">Not included:</h4>
                        <ul className="space-y-2">
                          {plan.notIncluded.map((feature, index) => (
                            <li key={index} className="flex items-start">
                              <X className="w-4 h-4 text-gray-400 mr-2 flex-shrink-0 mt-0.5" />
                              <span className="text-sm text-gray-500">{feature}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                </CardContent>
                
                <CardFooter className="px-6 pt-4">
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
                          ? 'bg-blue-500 hover:bg-blue-600' 
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
          
          {/* Feature Comparison Table */}
          <div className="mt-16">
            <h2 className="text-2xl font-bold text-center mb-8">Compare All Features</h2>
            <div className="overflow-x-auto">
              <table className="w-full border border-gray-200 rounded-lg">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="text-left p-4 font-semibold">Features</th>
                    <th className="text-center p-4 font-semibold">Basic</th>
                    <th className="text-center p-4 font-semibold">Pro</th>
                    <th className="text-center p-4 font-semibold">Team</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  <tr>
                    <td className="p-4 font-medium">Monthly content pieces</td>
                    <td className="text-center p-4">50</td>
                    <td className="text-center p-4">500</td>
                    <td className="text-center p-4">Unlimited</td>
                  </tr>
                  <tr className="bg-gray-50">
                    <td className="p-4 font-medium">Schema markup generation</td>
                    <td className="text-center p-4"><CheckCircle className="w-5 h-5 text-green-500 mx-auto" /></td>
                    <td className="text-center p-4"><CheckCircle className="w-5 h-5 text-green-500 mx-auto" /></td>
                    <td className="text-center p-4"><CheckCircle className="w-5 h-5 text-green-500 mx-auto" /></td>
                  </tr>
                  <tr>
                    <td className="p-4 font-medium">SEO analysis</td>
                    <td className="text-center p-4"><X className="w-5 h-5 text-gray-400 mx-auto" /></td>
                    <td className="text-center p-4"><CheckCircle className="w-5 h-5 text-green-500 mx-auto" /></td>
                    <td className="text-center p-4"><CheckCircle className="w-5 h-5 text-green-500 mx-auto" /></td>
                  </tr>
                  <tr className="bg-gray-50">
                    <td className="p-4 font-medium">Team collaboration</td>
                    <td className="text-center p-4"><X className="w-5 h-5 text-gray-400 mx-auto" /></td>
                    <td className="text-center p-4"><X className="w-5 h-5 text-gray-400 mx-auto" /></td>
                    <td className="text-center p-4"><CheckCircle className="w-5 h-5 text-green-500 mx-auto" /></td>
                  </tr>
                  <tr>
                    <td className="p-4 font-medium">API access</td>
                    <td className="text-center p-4"><X className="w-5 h-5 text-gray-400 mx-auto" /></td>
                    <td className="text-center p-4">100 calls/month</td>
                    <td className="text-center p-4">Unlimited</td>
                  </tr>
                  <tr className="bg-gray-50">
                    <td className="p-4 font-medium">Priority support</td>
                    <td className="text-center p-4"><X className="w-5 h-5 text-gray-400 mx-auto" /></td>
                    <td className="text-center p-4">Email</td>
                    <td className="text-center p-4">Phone & Chat</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
          
          <div className="mt-12 text-center text-sm text-gray-500">
            <p>All plans include a 7-day free trial. Cancel anytime during the trial period.</p>
            <p className="mt-2">Questions? <a href="mailto:support@generativesearch.pro" className="text-blue-500 hover:underline">Contact our support team</a></p>
          </div>
        </div>
      </div>
    </>
  );
};

export default Upgrade;
