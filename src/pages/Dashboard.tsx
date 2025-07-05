
import { useAuth } from "@/contexts/AuthContext";
import { useSubscription } from "@/contexts/SubscriptionContext";
import Header from "@/components/Header";
import SubscriptionStatus from "@/components/SubscriptionStatus";
import AIVisibilityScore from "@/components/AIVisibilityScore";
import CitationMonitoringDashboard from "@/components/CitationMonitoringDashboard";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { FileText, Search, BarChart3, Globe, CheckSquare, Map, Target, BookOpen, Microscope } from "lucide-react";
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
      title: "Content Analysis",
      description: "Analyze and optimize your content for AI search",
      icon: <Microscope className="w-6 h-6" />,
      path: "/content-analysis",
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
    },
    {
      title: "Resources & Learning",
      description: "Guides, tutorials, and best practices",
      icon: <BookOpen className="w-6 h-6" />,
      path: "/resources",
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
        <div className="max-w-7xl mx-auto">
          <div className="mb-8">
            <h1 className="text-3xl font-bold mb-2 text-matrix-green">
              Welcome back, {user?.user_metadata?.full_name || user?.email}!
            </h1>
            <p className="text-matrix-green/70">
              Manage your AEO content generation and SEO analysis tools.
            </p>
          </div>

          <Tabs defaultValue="overview" className="w-full">
            <TabsList className="grid w-full grid-cols-3 mb-6">
              <TabsTrigger value="overview">Overview</TabsTrigger>
              <TabsTrigger value="citations">Citation Monitoring</TabsTrigger>
              <TabsTrigger value="tools">Available Tools</TabsTrigger>
            </TabsList>

            <TabsContent value="overview">
              <div className="grid lg:grid-cols-4 gap-6">
                <div className="lg:col-span-2">
                  <h2 className="text-2xl font-semibold mb-4 text-matrix-green">AI Visibility Overview</h2>
                  <AIVisibilityScore />
                </div>
                <div className="lg:col-span-2">
                  <SubscriptionStatus />
                </div>
              </div>
            </TabsContent>

            <TabsContent value="citations">
              <CitationMonitoringDashboard />
            </TabsContent>

            <TabsContent value="tools">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {features.map((feature) => (
                  <Card 
                    key={feature.title} 
                    className="content-card cursor-pointer hover-scale"
                    onClick={() => navigate(feature.path)}
                  >
                    <CardContent className="p-4">
                      <div className="flex items-center gap-3">
                        <div className="p-2 rounded-lg bg-matrix-green/10 text-matrix-green">
                          {feature.icon}
                        </div>
                        <div className="flex-1">
                          <h3 className="font-medium text-matrix-green">{feature.title}</h3>
                          <p className="text-sm text-matrix-green/70">{feature.description}</p>
                        </div>
                        <Badge className={getTierBadgeColor(feature.tier)} variant="outline">
                          {feature.tier}
                        </Badge>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </TabsContent>
          </Tabs>

          {(!subscribed && !isTrialActive) && (
            <Card className="content-card border-matrix-green/50">
              <CardHeader>
                <CardTitle className="text-center text-matrix-green">Unlock Premium Features</CardTitle>
                <CardDescription className="text-center text-matrix-green/70">
                  Start your 7-day free trial to access all advanced tools and features.
                </CardDescription>
              </CardHeader>
              <CardContent className="text-center">
                <Button 
                  onClick={() => navigate('/upgrade')}
                  className="glow-button text-black font-semibold"
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
