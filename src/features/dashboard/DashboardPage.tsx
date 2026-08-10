
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
import { TOOLS, TOOL_CATEGORIES } from "@/config/tools";
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

  const handleToolClick = (tool: (typeof TOOLS)[number]) => {
    if (tool.usesDomain && !defaultDomain) {
      toast.error('Set an active domain in the top bar to use this tool.');
      return;
    }
    navigate(tool.path, { state: { domain: defaultDomain } });
  };

  const ToolCard = ({ tool }: { tool: (typeof TOOLS)[number] }) => (
    <Card
      className="content-card cursor-pointer hover-scale"
      onClick={() => handleToolClick(tool)}
    >
      <CardContent className="p-4">
        <div className="flex items-start gap-3">
          <div className="p-2 rounded-lg bg-matrix-green/10 text-matrix-green">
            <tool.icon className="w-5 h-5" />
          </div>
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-1">
              <h3 className="font-medium text-matrix-green">{tool.title}</h3>
              {tool.usesDomain && (
                <span
                  className={`w-2 h-2 rounded-full ${defaultDomain ? 'bg-green-500' : 'bg-yellow-500'}`}
                  title={defaultDomain ? 'Domain ready' : 'Needs a domain'}
                />
              )}
            </div>
            <p className="text-sm text-matrix-green/70">{tool.description}</p>
            <p className="mt-1 text-xs text-matrix-green/50">{tool.outcome}</p>
          </div>
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
              </SEOAnalysisProvider>
            </TabsContent>

            <TabsContent value="citations">
              <CitationMonitoringDashboard />
            </TabsContent>

            <TabsContent value="tools">
              <div className="space-y-8">
                {TOOL_CATEGORIES.map((cat) => {
                  const tools = TOOLS.filter((t) => t.category === cat.id);
                  if (!tools.length) return null;
                  return (
                    <div key={cat.id}>
                      <h3 className="text-lg font-semibold text-matrix-green">{cat.label}</h3>
                      <p className="mb-4 text-sm text-matrix-green/70">{cat.description}</p>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {tools.map((tool) => (
                          <ToolCard key={tool.id} tool={tool} />
                        ))}
                      </div>
                    </div>
                  );
                })}
                <Button variant="outline" onClick={() => navigate("/tools")}>
                  Open the full tools hub
                </Button>
              </div>
            </TabsContent>
          </Tabs>

        </div>
      </div>
    </>
  );
};

export default Dashboard;
