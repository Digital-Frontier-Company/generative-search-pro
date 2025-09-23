
import { useAuth } from "@/contexts/AuthContext";
import { useSubscription } from "@/contexts/SubscriptionContext";
import { useDomain } from "@/contexts/DomainContext";
import Header from "@/components/global/Header";

import AIVisibilityScore from "@/features/seo/analysis/AIVisibilityScore";
import CitationMonitoringDashboard from "@/features/citation/CitationMonitoringDashboard";
import AIAudit from "@/features/seo/analysis/AIAudit";
import SEOToolsAnalytics from "@/features/seo/analysis/SEOToolsAnalytics";
import { SEOAnalysisProvider } from "@/contexts/SEOAnalysisContext";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { FileText, Search, BarChart3, Globe, CheckSquare, Map, Target, BookOpen, Microscope, Settings, Zap } from "lucide-react";
import TSONavigationCard from "@/features/tso/TSO/TSONavigationCard";
import { useNavigate } from "react-router-dom";
import { useState } from "react";
import { toast } from "sonner";

const Dashboard = () => {
  const { user } = useAuth();
  const { subscribed, subscriptionTier, isTrialActive } = useSubscription();
  const { defaultDomain, setDefaultDomain } = useDomain();
  const navigate = useNavigate();
  const [isSaving, setIsSaving] = useState(false);

  const validateDomain = (domain: string) => {
    const domainRegex = /^(?:https?:\/\/)?(?:www\.)?([a-zA-Z0-9-]+\.)+[a-zA-Z]{2,}$/;
    return domainRegex.test(domain);
  };

  const cleanDomain = (domain: string) => {
    return domain.replace(/^https?:\/\//, '').replace(/^www\./, '').replace(/\/$/, '');
  };

  const handleDomainSave = async (domain: string) => {
    if (!domain.trim()) {
      toast.error('Please enter a domain');
      return;
    }

    if (!validateDomain(domain)) {
      toast.error('Please enter a valid domain (e.g., example.com)');
      return;
    }

    setIsSaving(true);
    try {
      const cleanedDomain = cleanDomain(domain);
      await setDefaultDomain(cleanedDomain);
      toast.success('Default domain saved successfully!');
    } catch (error) {
      toast.error('Failed to save default domain');
    } finally {
      setIsSaving(false);
    }
  };

  const analysisTools = [
    {
      title: "SEO Analysis Hub",
      description: "Comprehensive SEO analysis and optimization tools",
      icon: <BarChart3 className="w-6 h-6" />,
      path: "/analysis",
      tier: "basic",
      usesDomain: true
    },
    {
      title: "Citation Checker",
      description: "Track AI engine citations and references",
      icon: <CheckSquare className="w-6 h-6" />,
      path: "/citation-checker",
      tier: "basic",
      usesDomain: true
    }
  ];

  const contentTools = [
    {
      title: "Content Generator",
      description: "Generate AEO-optimized content",
      icon: <FileText className="w-6 h-6" />,
      path: "/generator",
      tier: "basic",
      usesDomain: false
    },
    {
      title: "Content Analysis",
      description: "Analyze and optimize content for AI search",
      icon: <Microscope className="w-6 h-6" />,
      path: "/content-analysis",
      tier: "basic", 
      usesDomain: false
    },
    {
      title: "Content History",
      description: "View and manage generated content",
      icon: <Search className="w-6 h-6" />,
      path: "/history",
      tier: "basic",
      usesDomain: false
    }
  ];

  const utilityTools = [
    {
      title: "AI Sitemap Generator",
      description: "Generate intelligent XML sitemaps",
      icon: <Map className="w-6 h-6" />,
      path: "/ai-sitemap",
      tier: "basic",
      usesDomain: true
    },
    {
      title: "Resources & Learning",
      description: "Guides, tutorials, and best practices",
      icon: <BookOpen className="w-6 h-6" />,
      path: "/resources",
      tier: "basic",
      usesDomain: false
    }
  ];

  const getTierBadgeColor = (tier: string) => {
    switch (tier) {
      case 'basic': return 'bg-blue-100 text-blue-800';
      case 'pro': return 'bg-purple-100 text-purple-800';
      case 'team': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const handleToolClick = (tool: any) => {
    if (tool.usesDomain && !defaultDomain) {
      toast.error('Please set a default domain first to use this tool!');
      return;
    }
    navigate(tool.path, { state: { domain: defaultDomain } });
  };

  const ToolCard = ({ tool }: { tool: any }) => (
    <Card 
      className="content-card cursor-pointer hover-scale"
      onClick={() => handleToolClick(tool)}
    >
      <CardContent className="p-4">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-matrix-green/10 text-matrix-green">
            {tool.icon}
          </div>
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-1">
              <h3 className="font-medium text-matrix-green">{tool.title}</h3>
              {tool.usesDomain && (
                <div className={`w-2 h-2 rounded-full ${defaultDomain ? 'bg-green-500' : 'bg-yellow-500'}`} 
                     title={defaultDomain ? 'Domain configured' : 'Needs domain'} />
              )}
            </div>
            <p className="text-sm text-matrix-green/70">{tool.description}</p>
          </div>
          <Badge className={getTierBadgeColor(tool.tier)} variant="outline">
            {tool.tier}
          </Badge>
        </div>
      </CardContent>
    </Card>
  );

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
              <SEOAnalysisProvider>
                <div className="grid lg:grid-cols-3 gap-6">
                  <div className="lg:col-span-2">
                    <h2 className="text-2xl font-semibold mb-4 text-matrix-green">AI Visibility Overview</h2>
                    <AIVisibilityScore />
                    <div className="mt-6">
                      <AIAudit />
                    </div>
                  </div>
                  <div className="lg:col-span-1">
                    <SEOToolsAnalytics />
                  </div>
                </div>
                <div className="mt-6">
                  <TSONavigationCard />
                </div>
              </SEOAnalysisProvider>
            </TabsContent>

            <TabsContent value="citations">
              <CitationMonitoringDashboard />
            </TabsContent>

            <TabsContent value="tools">
              {/* Global Domain Configuration */}
              <Card className="content-card mb-6">
                <CardHeader>
                  <CardTitle className="text-matrix-green flex items-center">
                    <Settings className="w-5 h-5 mr-2" />
                    Domain Configuration
                  </CardTitle>
                  <CardDescription>
                    Set your primary domain to use across all analysis tools
                  </CardDescription>
                </CardHeader>
                 <CardContent>
                   <div className="flex gap-4 items-end">
                     <div className="flex-1">
                       <Input
                         placeholder="Enter your domain (e.g., example.com)"
                         value={defaultDomain || ''}
                         onChange={(e) => {}}
                         className="text-lg"
                         readOnly
                       />
                     </div>
                     <Button 
                       onClick={() => navigate('/settings')}
                       className="glow-button text-black font-semibold px-8"
                     >
                       <Settings className="w-4 h-4 mr-2" />
                       Configure
                     </Button>
                   </div>
                   {defaultDomain && (
                     <div className="mt-3 text-sm text-matrix-green/70">
                       Current domain: <span className="font-medium text-matrix-green">{defaultDomain}</span>
                     </div>
                   )}
                   {!defaultDomain && (
                     <div className="mt-3 text-sm text-yellow-600">
                       No default domain set. Click "Configure" to set one.
                     </div>
                   )}
                 </CardContent>
              </Card>

              {/* Analysis Tools */}
              <div className="space-y-6">
                <div>
                  <h3 className="text-lg font-semibold text-matrix-green mb-4 flex items-center">
                    <BarChart3 className="w-5 h-5 mr-2" />
                    Analysis Tools
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {analysisTools.map((tool) => (
                      <ToolCard key={tool.title} tool={tool} />
                    ))}
                  </div>
                </div>

                <div>
                  <h3 className="text-lg font-semibold text-matrix-green mb-4 flex items-center">
                    <FileText className="w-5 h-5 mr-2" />
                    Content Tools
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {contentTools.map((tool) => (
                      <ToolCard key={tool.title} tool={tool} />
                    ))}
                  </div>
                </div>

                <div>
                  <h3 className="text-lg font-semibold text-matrix-green mb-4 flex items-center">
                    <Map className="w-5 h-5 mr-2" />
                    Utility Tools
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {utilityTools.map((tool) => (
                      <ToolCard key={tool.title} tool={tool} />
                    ))}
                  </div>
                </div>
              </div>
            </TabsContent>
          </Tabs>

        </div>
      </div>
    </>
  );
};

export default Dashboard;
