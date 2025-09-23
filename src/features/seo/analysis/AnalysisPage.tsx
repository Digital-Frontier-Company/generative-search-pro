import { useEffect, useMemo, useState } from "react";
import { useLocation } from "react-router-dom";
import Header from "@/components/global/Header";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { BarChart3, Globe, Target, CheckSquare, Search, Brain, Shield, TrendingUp, Zap, Activity, Eye, FileSearch } from "lucide-react";
import SEOAnalyzer from "@/features/seo/analysis/SEOAnalyzer";
import DomainAnalyzer from "@/features/domain/DomainAnalyzer";
import SchemaAnalyzer from "@/features/schema/SchemaAnalyzer";
import CitationChecker from "@/features/citation/CitationChecker";
import CompetitorGapAnalysis from "@/features/seo/analysis/CompetitorGapAnalysis";
import OpportunityScanner from "@/features/seo/analysis/OpportunityScanner";
import BrandSERPanalysis from "@/features/seo/monitoring/BrandSERPanalysis";
import RealtimeSERPMonitor from "@/features/seo/monitoring/RealtimeSERPMonitor";
import VoiceSearchMonitor from "@/features/seo/monitoring/VoiceSearchMonitor";
import AIPlatformMonitor from "@/features/seo/monitoring/AIPlatformMonitor";
import ContentQualityAnalyzer from "@/features/content/analysis/ContentQualityAnalyzer";
import AIVisibilityScore from "@/features/seo/analysis/AIVisibilityScore";
import { useDomain } from "@/contexts/DomainContext";
import { SEOAnalysisProvider } from "@/contexts/SEOAnalysisContext";

const Analysis = () => {
  const location = useLocation();
  const { defaultDomain } = useDomain();
  const search = useMemo(() => new URLSearchParams(location.search), [location.search]);
  const initialTab = search.get('tab') || 'overview';
  const sub = search.get('sub') || '';
  const [activeTab, setActiveTab] = useState(initialTab);

  // Map sub routes to correct tab group
  const subToGroup = (value: string) => {
    if (["seo", "domain", "schema", "citations"].includes(value)) return "core-analysis";
    if (["brand-serp", "realtime-serp", "voice-search", "ai-platforms"].includes(value)) return "monitoring";
    if (["competitor", "opportunities", "content-quality"].includes(value)) return "advanced";
    return "overview";
  };

  useEffect(() => {
    if (sub) {
      const group = subToGroup(sub);
      if (group !== activeTab) {
        setActiveTab(group);
      }
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sub]);

  // Get domain from navigation state or use default
  const domain = location.state?.domain || defaultDomain || '';

  const analysisCategories = [
    {
      id: "seo",
      title: "SEO Analysis",
      description: "Comprehensive SEO performance analysis",
      icon: <BarChart3 className="w-5 h-5" />,
      component: <SEOAnalyzer />,
      color: "bg-blue-500"
    },
    {
      id: "domain", 
      title: "Domain Analysis",
      description: "Domain keywords and performance metrics",
      icon: <Globe className="w-5 h-5" />,
      component: <DomainAnalyzer />,
      color: "bg-green-500"
    },
    {
      id: "schema",
      title: "Schema & Visibility",
      description: "Schema optimization and AI search visibility", 
      icon: <Target className="w-5 h-5" />,
      component: <SchemaAnalyzer />,
      color: "bg-purple-500"
    },
    {
      id: "citations",
      title: "Citation Tracking",
      description: "Track AI engine citations and references",
      icon: <CheckSquare className="w-5 h-5" />,
      component: <CitationChecker />,
      color: "bg-orange-500"
    },
    {
      id: "competitor",
      title: "Competitor Analysis", 
      description: "Analyze competitors and identify gaps",
      icon: <TrendingUp className="w-5 h-5" />,
      component: <CompetitorGapAnalysis />,
      color: "bg-red-500"
    },
    {
      id: "opportunities",
      title: "Opportunity Scanner",
      description: "Find content and citation opportunities",
      icon: <Search className="w-5 h-5" />,
      component: <OpportunityScanner />,
      color: "bg-yellow-500"
    },
    {
      id: "brand-serp",
      title: "Brand SERP Analysis",
      description: "Analyze your brand's search presence",
      icon: <Eye className="w-5 h-5" />,
      component: <BrandSERPanalysis />,
      color: "bg-indigo-500"
    },
    {
      id: "realtime-serp",
      title: "Real-time SERP Monitor",
      description: "Monitor search results in real-time",
      icon: <Activity className="w-5 h-5" />,
      component: <RealtimeSERPMonitor />,
      color: "bg-teal-500"
    },
    {
      id: "voice-search",
      title: "Voice Search Monitor",
      description: "Track voice search optimization",
      icon: <Brain className="w-5 h-5" />,
      component: <VoiceSearchMonitor />,
      color: "bg-pink-500"
    },
    {
      id: "ai-platforms",
      title: "AI Platform Monitor",
      description: "Monitor AI search platforms",
      icon: <Zap className="w-5 h-5" />,
      component: <AIPlatformMonitor />,
      color: "bg-cyan-500"
    },
    {
      id: "content-quality",
      title: "Content Quality",
      description: "Analyze content quality and readability",
      icon: <FileSearch className="w-5 h-5" />,
      component: <ContentQualityAnalyzer />,
      color: "bg-emerald-500"
    }
  ];

  return (
    <SEOAnalysisProvider>
      <Header />
      <div className="container mx-auto py-8">
        <div className="max-w-7xl mx-auto">
          {/* Header Section */}
          <div className="mb-8">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-3 rounded-lg bg-matrix-green/10">
                <BarChart3 className="w-8 h-8 text-matrix-green" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-matrix-green">SEO Analysis Hub</h1>
                <p className="text-matrix-green/70">
                  Comprehensive SEO analysis and optimization tools for modern search engines
                </p>
              </div>
            </div>
            
            {domain && (
              <div className="flex items-center gap-2 mb-4">
                <Badge variant="outline" className="text-matrix-green border-matrix-green">
                  <Globe className="w-3 h-3 mr-1" />
                  Analyzing: {domain}
                </Badge>
              </div>
            )}
          </div>

          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid w-full grid-cols-4 mb-6">
              <TabsTrigger value="overview">Overview</TabsTrigger>
              <TabsTrigger value="core-analysis">Core Analysis</TabsTrigger>
              <TabsTrigger value="monitoring">Monitoring</TabsTrigger>
              <TabsTrigger value="advanced">Advanced</TabsTrigger>
            </TabsList>

            <TabsContent value="overview">
              <div className="grid lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2">
                  <Card className="content-card">
                    <CardHeader>
                      <CardTitle className="text-matrix-green">AI Visibility Score</CardTitle>
                      <CardDescription>
                        Overall visibility and optimization score for AI search engines
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <AIVisibilityScore />
                    </CardContent>
                  </Card>
                </div>
                
                <div className="space-y-4">
                  <Card className="content-card">
                    <CardHeader>
                      <CardTitle className="text-matrix-green text-lg">Quick Analysis</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      {analysisCategories.slice(0, 4).map((category) => (
                        <Button
                          key={category.id}
                          variant="ghost"
                          className="w-full justify-start text-matrix-green hover:bg-matrix-green/10"
                          onClick={() => setActiveTab("core-analysis")}
                        >
                          <div className={`w-3 h-3 rounded-full ${category.color.replace('bg-', 'bg-')} mr-3`} />
                          {category.title}
                        </Button>
                      ))}
                    </CardContent>
                  </Card>
                </div>
              </div>

              {/* Analysis Categories Grid */}
              <div className="mt-8 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {analysisCategories.map((category) => (
                  <Card 
                    key={category.id}
                    className="content-card cursor-pointer hover-scale"
                    onClick={() => {
                      if (["seo", "domain", "schema", "citations"].includes(category.id)) {
                        setActiveTab("core-analysis");
                      } else if (["brand-serp", "realtime-serp", "voice-search", "ai-platforms"].includes(category.id)) {
                        setActiveTab("monitoring");
                      } else {
                        setActiveTab("advanced");
                      }
                    }}
                  >
                    <CardContent className="p-4">
                      <div className="flex items-center gap-3">
                        <div className={`p-2 rounded-lg ${category.color} text-white`}>
                          {category.icon}
                        </div>
                        <div className="flex-1">
                          <h3 className="font-medium text-matrix-green">{category.title}</h3>
                          <p className="text-sm text-matrix-green/70">{category.description}</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </TabsContent>

            <TabsContent value="core-analysis">
              <div className="space-y-8">
                <div>
                  <h2 className="text-2xl font-semibold text-matrix-green mb-6">Core SEO Analysis</h2>
                  
                  <Tabs defaultValue={sub && ["seo","domain","schema","citations"].includes(sub) ? sub : "seo"} className="w-full">
                    <TabsList className="grid w-full grid-cols-4">
                      <TabsTrigger value="seo">SEO Analysis</TabsTrigger>
                      <TabsTrigger value="domain">Domain Analysis</TabsTrigger>
                      <TabsTrigger value="schema">Schema & Visibility</TabsTrigger>
                      <TabsTrigger value="citations">Citations</TabsTrigger>
                    </TabsList>
                    
                    <TabsContent value="seo" className="mt-6">
                      <SEOAnalyzer />
                    </TabsContent>
                    
                    <TabsContent value="domain" className="mt-6">
                      <DomainAnalyzer />
                    </TabsContent>
                    
                    <TabsContent value="schema" className="mt-6">
                      <SchemaAnalyzer />
                    </TabsContent>
                    
                    <TabsContent value="citations" className="mt-6">
                      <CitationChecker />
                    </TabsContent>
                  </Tabs>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="monitoring">
              <div className="space-y-8">
                <div>
                  <h2 className="text-2xl font-semibold text-matrix-green mb-6">Real-time Monitoring</h2>
                  
                  <Tabs defaultValue={sub && ["brand-serp","realtime-serp","voice-search","ai-platforms"].includes(sub) ? sub : "brand-serp"} className="w-full">
                    <TabsList className="grid w-full grid-cols-4">
                      <TabsTrigger value="brand-serp">Brand SERP</TabsTrigger>
                      <TabsTrigger value="realtime-serp">Real-time SERP</TabsTrigger>
                      <TabsTrigger value="voice-search">Voice Search</TabsTrigger>
                      <TabsTrigger value="ai-platforms">AI Platforms</TabsTrigger>
                    </TabsList>
                    
                    <TabsContent value="brand-serp" className="mt-6">
                      <BrandSERPanalysis />
                    </TabsContent>
                    
                    <TabsContent value="realtime-serp" className="mt-6">
                      <RealtimeSERPMonitor />
                    </TabsContent>
                    
                    <TabsContent value="voice-search" className="mt-6">
                      <VoiceSearchMonitor />
                    </TabsContent>
                    
                    <TabsContent value="ai-platforms" className="mt-6">
                      <AIPlatformMonitor />
                    </TabsContent>
                  </Tabs>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="advanced">
              <div className="space-y-8">
                <div>
                  <h2 className="text-2xl font-semibold text-matrix-green mb-6">Advanced Analysis</h2>
                  
                  <Tabs defaultValue={sub && ["competitor","opportunities","content-quality"].includes(sub) ? sub : "competitor"} className="w-full">
                    <TabsList className="grid w-full grid-cols-3">
                      <TabsTrigger value="competitor">Competitor Analysis</TabsTrigger>
                      <TabsTrigger value="opportunities">Opportunities</TabsTrigger>
                      <TabsTrigger value="content-quality">Content Quality</TabsTrigger>
                    </TabsList>
                    
                    <TabsContent value="competitor" className="mt-6">
                      <CompetitorGapAnalysis />
                    </TabsContent>
                    
                    <TabsContent value="opportunities" className="mt-6">
                      <OpportunityScanner />
                    </TabsContent>
                    
                    <TabsContent value="content-quality" className="mt-6">
                      <ContentQualityAnalyzer />
                    </TabsContent>
                  </Tabs>
                </div>
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </SEOAnalysisProvider>
  );
};

export default Analysis;