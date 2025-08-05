import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import Header from '@/components/Header';
import { Map, Mic, Search, Upload, Globe, FileText } from 'lucide-react';
import AISitemapGenerator from '@/components/AISitemapGenerator';
import VoiceSearchOptimizer from '@/components/TSO/VoiceSearchOptimizer';
import BrandSERPanalysis from '@/components/BrandSERPanalysis';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useNavigate } from 'react-router-dom';

// Placeholder components that should exist based on the project structure
const DocumentUpload = () => (
  <Card className="bg-matrix-dark-gray border-matrix-green/30">
    <CardHeader>
      <CardTitle className="text-matrix-green">Document Upload & Analysis</CardTitle>
    </CardHeader>
    <CardContent>
      <p className="text-muted-foreground mb-4">Upload documents for content analysis and optimization</p>
      <div className="border-2 border-dashed border-matrix-green/30 rounded-lg p-8 text-center">
        <Upload className="h-12 w-12 mx-auto mb-4 text-matrix-green" />
        <p className="text-matrix-green">Drag and drop files here or click to browse</p>
        <Button className="mt-4 bg-matrix-green text-black hover:bg-matrix-lime">Upload Documents</Button>
      </div>
    </CardContent>
  </Card>
);

const LLMTxtGenerator = () => (
  <Card className="bg-matrix-dark-gray border-matrix-green/30">
    <CardHeader>
      <CardTitle className="text-matrix-green">LLM.txt Generator</CardTitle>
    </CardHeader>
    <CardContent>
      <p className="text-muted-foreground mb-4">Generate LLM.txt files for AI model training data</p>
      <Button className="bg-matrix-green text-black hover:bg-matrix-lime">Generate LLM.txt</Button>
    </CardContent>
  </Card>
);

const ToolsDashboard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [stats, setStats] = useState({
    sitemapsGenerated: 0,
    voiceOptimizations: 0,
    documentsUploaded: 0,
    brandAnalyses: 0
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      loadToolsStats();
    }
  }, [user]);

  const loadToolsStats = async () => {
    try {
      // Load AI sitemaps
      const { data: sitemaps } = await supabase
        .from('ai_sitemaps')
        .select('*')
        .eq('user_id', user?.id);

      // Load user documents
      const { data: documents } = await supabase
        .from('user_documents')
        .select('*')
        .eq('user_id', user?.id);

      setStats({
        sitemapsGenerated: sitemaps?.length || 0,
        voiceOptimizations: 8, // Placeholder
        documentsUploaded: documents?.length || 0,
        brandAnalyses: 5 // Placeholder
      });
    } catch (error) {
      console.error('Error loading tools stats:', error);
    } finally {
      setLoading(false);
    }
  };

  const StatCard = ({ title, value, icon: Icon, description, action }: any) => (
    <Card className="bg-matrix-dark-gray border-matrix-green/30">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium text-matrix-green">{title}</CardTitle>
        <Icon className="h-4 w-4 text-matrix-green" />
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold text-white">{value}</div>
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
          <h1 className="text-3xl font-bold text-matrix-green mb-2">Specialized Tools</h1>
          <p className="text-muted-foreground">Advanced tools for specialized SEO and optimization tasks</p>
        </div>

        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <StatCard
            title="AI Sitemaps"
            value={loading ? '...' : stats.sitemapsGenerated}
            icon={Map}
            description="AI-optimized sitemaps created"
            action={{ label: 'Generate New', onClick: () => navigate('/ai-sitemap') }}
          />
          <StatCard
            title="Voice Optimizations"
            value={loading ? '...' : stats.voiceOptimizations}
            icon={Mic}
            description="Voice search optimizations"
          />
          <StatCard
            title="Documents Uploaded"
            value={loading ? '...' : stats.documentsUploaded}
            icon={Upload}
            description="Documents analyzed"
          />
          <StatCard
            title="Brand Analyses"
            value={loading ? '...' : stats.brandAnalyses}
            icon={Search}
            description="Brand SERP analyses"
          />
        </div>

        {/* Quick Tools Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          <Card className="bg-matrix-dark-gray border-matrix-green/30">
            <CardHeader>
              <CardTitle className="text-matrix-green flex items-center gap-2">
                <Map className="h-5 w-5" />
                AI Sitemap
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground mb-4">Generate AI-optimized sitemaps and LLM.txt files</p>
              <Button className="w-full bg-matrix-green text-black hover:bg-matrix-lime" onClick={() => navigate('/ai-sitemap')}>
                Generate Sitemap
              </Button>
            </CardContent>
          </Card>

          <Card className="bg-matrix-dark-gray border-matrix-green/30">
            <CardHeader>
              <CardTitle className="text-matrix-green flex items-center gap-2">
                <Mic className="h-5 w-5" />
                Voice Search
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground mb-4">Optimize content for voice search queries</p>
              <Button className="w-full bg-matrix-green text-black hover:bg-matrix-lime">
                Optimize Voice
              </Button>
            </CardContent>
          </Card>

          <Card className="bg-matrix-dark-gray border-matrix-green/30">
            <CardHeader>
              <CardTitle className="text-matrix-green flex items-center gap-2">
                <Search className="h-5 w-5" />
                Brand SERP
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground mb-4">Analyze your brand's SERP presence</p>
              <Button className="w-full bg-matrix-green text-black hover:bg-matrix-lime">
                Analyze Brand
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Main Tools */}
        <Tabs defaultValue="sitemap-generator" className="w-full">
          <TabsList className="grid w-full grid-cols-2 lg:grid-cols-5 bg-matrix-dark-gray border-matrix-green/30">
            <TabsTrigger value="sitemap-generator" className="text-matrix-green data-[state=active]:bg-matrix-green data-[state=active]:text-black">
              Sitemap Generator
            </TabsTrigger>
            <TabsTrigger value="voice-optimizer" className="text-matrix-green data-[state=active]:bg-matrix-green data-[state=active]:text-black">
              Voice Optimizer
            </TabsTrigger>
            <TabsTrigger value="brand-serp" className="text-matrix-green data-[state=active]:bg-matrix-green data-[state=active]:text-black">
              Brand SERP
            </TabsTrigger>
            <TabsTrigger value="document-upload" className="text-matrix-green data-[state=active]:bg-matrix-green data-[state=active]:text-black">
              Document Upload
            </TabsTrigger>
            <TabsTrigger value="llm-generator" className="text-matrix-green data-[state=active]:bg-matrix-green data-[state=active]:text-black">
              LLM.txt Generator
            </TabsTrigger>
          </TabsList>

          <TabsContent value="sitemap-generator" className="mt-6">
            <AISitemapGenerator />
          </TabsContent>

          <TabsContent value="voice-optimizer" className="mt-6">
            <VoiceSearchOptimizer />
          </TabsContent>

          <TabsContent value="brand-serp" className="mt-6">
            <BrandSERPanalysis />
          </TabsContent>

          <TabsContent value="document-upload" className="mt-6">
            <DocumentUpload />
          </TabsContent>

          <TabsContent value="llm-generator" className="mt-6">
            <LLMTxtGenerator />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default ToolsDashboard;