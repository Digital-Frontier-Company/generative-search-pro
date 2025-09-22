import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { CheckCircle, Loader2, Crown, Users, Zap, X } from "lucide-react";
import Header from "@/components/Header";
import { useSubscription } from "@/contexts/SubscriptionContext";
import { toast } from "sonner";
import Breadcrumbs from "@/components/Breadcrumbs";

const Upgrade = () => {
  const navigate = useNavigate();
  const { subscribed, subscriptionTier, isTrialActive, trialEnd, createCheckoutSession, openCustomerPortal } = useSubscription();
  const [loadingTier, setLoadingTier] = useState<string | null>(null);

  // Load Stripe pricing table script
  useEffect(() => {
    const script = document.createElement('script');
    script.src = 'https://js.stripe.com/v3/pricing-table.js';
    script.async = true;
    document.head.appendChild(script);

    return () => {
      // Cleanup script on unmount
      const existingScript = document.querySelector('script[src="https://js.stripe.com/v3/pricing-table.js"]');
      if (existingScript) {
        document.head.removeChild(existingScript);
      }
    };
  }, []);

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

  return (
    <>
      <Header />
      <Breadcrumbs />
      <div className="container mx-auto py-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12">
            <h1 className="text-4xl font-bold mb-4">Choose Your AEO Plan</h1>
            <p className="text-xl text-gray-600 mb-6">
              Start dominating AI search results with our AEO optimization platform
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
          
          {/* Stripe Pricing Table */}
          <div className="flex justify-center mb-16">
            <stripe-pricing-table 
              pricing-table-id="prctbl_1Rj6u2QrntSTmFE1Sf8kXW3B"
              publishable-key="pk_live_51Rj6P5QrntSTmFE1xOTkWDrPkXxVV8IRWmglWFTVBKH3uqMpkof2g03ILVLEZZTojeNi4ji0wPukgc74zVlCoyj500joOZt9E5"
            />
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
