import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import Header from '@/components/Header';
import { Search, Code, TrendingUp, Target, Zap, Settings } from 'lucide-react';
import SEOAnalyzer from '@/components/SEOAnalyzer';
import SchemaAnalyzer from '@/components/SchemaAnalyzer';
import TechnicalAIReadiness from '@/components/TSO/TechnicalAIReadiness';
import SemanticAnalyzer from '@/components/TSO/SemanticAnalyzer';
import IntentDrivenResearch from '@/components/TSO/IntentDrivenResearch';
import BusinessTypeTemplates from '@/components/TSO/BusinessTypeTemplates';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useNavigate } from 'react-router-dom';

const SEOTSODashboard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [stats, setStats] = useState({
    totalAnalyses: 0,
    averageSEOScore: 0,
    schemaImplementations: 0,
    tsoReadiness: 0
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      loadSEOStats();
    }
  }, [user]);

  const loadSEOStats = async () => {
    try {
      // Load SEO analyses
      const { data: seoAnalyses } = await supabase
        .from('seo_analyses')
        .select('*')
        .eq('user_id', user?.id);

      // Load schema analyses
      const { data: schemaAnalyses } = await supabase
        .from('schema_analyses')
        .select('*')
        .eq('user_id', user?.id);

      const totalAnalyses = seoAnalyses?.length || 0;
      const averageSEOScore = seoAnalyses?.reduce((sum, analysis) => 
        sum + (analysis.total_score || 0), 0) / (seoAnalyses?.length || 1) || 0;
      const schemaImplementations = schemaAnalyses?.length || 0;

      setStats({
        totalAnalyses,
        averageSEOScore: Math.round(averageSEOScore),
        schemaImplementations,
        tsoReadiness: 82 // Placeholder - would calculate from TSO metrics
      });
    } catch (error) {
      console.error('Error loading SEO stats:', error);
    } finally {
      setLoading(false);
    }
  };

  const StatCard = ({ title, value, trend, icon: Icon, description, action }: any) => (
    <Card className="bg-matrix-dark-gray border-matrix-green/30">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium text-matrix-green">{title}</CardTitle>
        <Icon className="h-4 w-4 text-matrix-green" />
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold text-white">{value}</div>
        {trend && (
          <p className="text-xs text-matrix-lime">
            {trend} from last month
          </p>
        )}
        <p className="text-xs text-muted-foreground mt-1">{description}</p>
        {action && (
          <Button size="sm" variant="outline" className="mt-2 border-matrix-green text-matrix-green hover:bg-matrix-green hover:text-black" onClick={action.onClick}>
            {action.label}
          </Button>
        )}
      </CardContent>
    </Card>
  );

  return (
    <div className="min-h-screen bg-matrix-black">
      <Header />
      
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-matrix-green mb-2">SEO & Total Search Optimization (TSO)</h1>
          <p className="text-muted-foreground">Comprehensive SEO analysis and Total Search Optimization framework</p>
        </div>

        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <StatCard
            title="SEO Analyses"
            value={loading ? '...' : stats.totalAnalyses}
            trend="+5"
            icon={Search}
            description="Total SEO analyses run"
            action={{ label: 'New Analysis', onClick: () => navigate('/seo-analysis') }}
          />
          <StatCard
            title="Average SEO Score"
            value={loading ? '...' : `${stats.averageSEOScore}%`}
            trend="+8%"
            icon={TrendingUp}
            description="Average SEO performance"
          />
          <StatCard
            title="Schema Implementations"
            value={loading ? '...' : stats.schemaImplementations}
            icon={Code}
            description="Schema markup analyses"
            action={{ label: 'Analyze Schema', onClick: () => navigate('/schema-analysis') }}
          />
          <StatCard
            title="TSO Readiness"
            value={loading ? '...' : `${stats.tsoReadiness}%`}
            trend="+15%"
            icon={Target}
            description="Total Search Optimization score"
          />
        </div>

        {/* TSO Framework Overview */}
        <Card className="mb-8 bg-matrix-dark-gray border-matrix-green/30">
          <CardHeader>
            <CardTitle className="text-matrix-green flex items-center gap-2">
              <Zap className="h-5 w-5" />
              Total Search Optimization Framework
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="text-center">
                <div className="text-2xl font-bold text-matrix-green mb-2">Traditional SEO</div>
                <p className="text-sm text-muted-foreground">Google, Bing, Yahoo optimization</p>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-matrix-green mb-2">AI Search</div>
                <p className="text-sm text-muted-foreground">ChatGPT, Claude, Perplexity optimization</p>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-matrix-green mb-2">Voice & Visual</div>
                <p className="text-sm text-muted-foreground">Alexa, Siri, Google Lens optimization</p>
              </div>
            </div>
            <div className="mt-6 text-center">
              <Button className="bg-matrix-green text-black hover:bg-matrix-lime" onClick={() => navigate('/tso-dashboard')}>
                Access Full TSO Dashboard
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Main Tools */}
        <Tabs defaultValue="seo-analyzer" className="w-full">
          <TabsList className="grid w-full grid-cols-3 lg:grid-cols-6 bg-matrix-dark-gray border-matrix-green/30">
            <TabsTrigger value="seo-analyzer" className="text-matrix-green data-[state=active]:bg-matrix-green data-[state=active]:text-black">
              SEO Analyzer
            </TabsTrigger>
            <TabsTrigger value="schema-analyzer" className="text-matrix-green data-[state=active]:bg-matrix-green data-[state=active]:text-black">
              Schema Analyzer
            </TabsTrigger>
            <TabsTrigger value="technical-ai" className="text-matrix-green data-[state=active]:bg-matrix-green data-[state=active]:text-black">
              Technical AI
            </TabsTrigger>
            <TabsTrigger value="semantic-analyzer" className="text-matrix-green data-[state=active]:bg-matrix-green data-[state=active]:text-black">
              Semantic Analysis
            </TabsTrigger>
            <TabsTrigger value="intent-research" className="text-matrix-green data-[state=active]:bg-matrix-green data-[state=active]:text-black">
              Intent Research
            </TabsTrigger>
            <TabsTrigger value="business-templates" className="text-matrix-green data-[state=active]:bg-matrix-green data-[state=active]:text-black">
              Business Templates
            </TabsTrigger>
          </TabsList>

          <TabsContent value="seo-analyzer" className="mt-6">
            <SEOAnalyzer />
          </TabsContent>

          <TabsContent value="schema-analyzer" className="mt-6">
            <SchemaAnalyzer />
          </TabsContent>

          <TabsContent value="technical-ai" className="mt-6">
            <TechnicalAIReadiness />
          </TabsContent>

          <TabsContent value="semantic-analyzer" className="mt-6">
            <SemanticAnalyzer />
          </TabsContent>

          <TabsContent value="intent-research" className="mt-6">
            <IntentDrivenResearch />
          </TabsContent>

          <TabsContent value="business-templates" className="mt-6">
            <BusinessTypeTemplates />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default SEOTSODashboard;