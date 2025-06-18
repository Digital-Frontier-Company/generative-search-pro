import { useAuth } from "@/contexts/AuthContext";
import { useSubscription } from "@/contexts/SubscriptionContext";
import Header from "@/components/Header";
import SubscriptionStatus from "@/components/SubscriptionStatus";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { FileText, Search, BarChart3, Globe, CheckSquare, Map, Target } from "lucide-react";
import { useNavigate } from "react-router-dom";

const Dashboard = () => {
  const { user } = useAuth();
  const { subscribed, subscriptionTier, isTrialActive } = useSubscription();
  const navigate = useNavigate();

  const features = [
    {
      title: "Content Generator",
      description: "Generate AEO-optimized content",
      icon: <FileText className="w-6 h-6" />,
      path: "/generator",
      tier: "basic"
    },
    {
      title: "Content History",
      description: "View and manage your generated content",
      icon: <Search className="w-6 h-6" />,
      path: "/history",
      tier: "basic"
    },
    {
      title: "SEO Analysis",
      description: "Analyze your website's SEO performance",
      icon: <BarChart3 className="w-6 h-6" />,
      path: "/seo-analysis",
      tier: "basic"
    },
    {
      title: "Domain Analysis",
      description: "Analyze domain keywords and performance",
      icon: <Globe className="w-6 h-6" />,
      path: "/domain-analysis",
      tier: "basic"
    },
    {
      title: "AI Visibility Score",
      description: "Get AI search visibility score and schema optimization recommendations",
      icon: <Target className="w-6 h-6" />,
      path: "/schema-analysis",
      tier: "basic"
    },
    {
      title: "Citation Checker",
      description: "Check citations and references",
      icon: <CheckSquare className="w-6 h-6" />,
      path: "/citation-checker",
      tier: "basic"
    },
    {
      title: "AI Sitemap Generator",
      description: "Generate intelligent sitemaps",
      icon: <Map className="w-6 h-6" />,
      path: "/ai-sitemap",
      tier: "basic"
    }
  ];

  const canAccessFeature = (featureTier: string) => {
    // All authenticated users can access all features
    return true;
  };

  const getTierBadgeColor = (tier: string) => {
    switch (tier) {
      case 'basic': return 'bg-blue-100 text-blue-800';
      case 'pro': return 'bg-purple-100 text-purple-800';
      case 'team': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <>
      <Header />
      <div className="container mx-auto py-8">
        <div className="max-w-6xl mx-auto">
          <div className="mb-8">
            <h1 className="text-3xl font-bold mb-2">
              Welcome back, {user?.user_metadata?.full_name || user?.email}!
            </h1>
            <p className="text-gray-600">
              Manage your AEO content generation and SEO analysis tools.
            </p>
          </div>

          <div className="grid lg:grid-cols-3 gap-6 mb-8">
            <div className="lg:col-span-2">
              <h2 className="text-2xl font-semibold mb-4">Available Tools</h2>
              <div className="grid md:grid-cols-2 gap-4">
                {features.map((feature) => {
                  const hasAccess = canAccessFeature(feature.tier);
                  
                  return (
                    <Card 
                      key={feature.title} 
                      className="cursor-pointer transition-all duration-200 hover:shadow-lg hover:scale-105"
                      onClick={() => navigate(feature.path)}
                    >
                      <CardHeader>
                        <div className="flex items-start justify-between">
                          <div className="flex items-center gap-3">
                            <div className="p-2 rounded-lg bg-aeo-blue text-white">
                              {feature.icon}
                            </div>
                            <div>
                              <CardTitle className="text-lg">{feature.title}</CardTitle>
                            </div>
                          </div>
                          <span className={`text-xs px-2 py-1 rounded-full ${getTierBadgeColor(feature.tier)}`}>
                            {feature.tier}
                          </span>
                        </div>
                      </CardHeader>
                      <CardContent>
                        <CardDescription>{feature.description}</CardDescription>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            </div>

            <div>
              <SubscriptionStatus />
            </div>
          </div>

          {(!subscribed && !isTrialActive) && (
            <Card className="border-aeo-blue/30 bg-gradient-to-r from-aeo-blue/5 to-aeo-blue/10">
              <CardHeader>
                <CardTitle className="text-center">Unlock Premium Features</CardTitle>
                <CardDescription className="text-center">
                  Start your 7-day free trial to access all advanced tools and features.
                </CardDescription>
              </CardHeader>
              <CardContent className="text-center">
                <Button 
                  onClick={() => navigate('/upgrade')}
                  className="bg-aeo-blue hover:bg-aeo-blue/90"
                >
                  Start Free Trial
                </Button>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </>
  );
};

export default Dashboard;
