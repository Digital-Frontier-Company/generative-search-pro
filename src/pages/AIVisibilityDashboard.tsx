import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import Header from '@/components/Header';
import { Eye, TrendingUp, Target, Globe, AlertCircle, Activity } from 'lucide-react';
import AIVisibilityTracker from '@/components/TSO/AIVisibilityTracker';
import AIPlatformMonitor from '@/components/AIPlatformMonitor';
import CitationChecker from '@/components/CitationChecker';
import CitationAttributionTracker from '@/components/CitationAttributionTracker';
import CitationMonitoringDashboard from '@/components/CitationMonitoringDashboard';
import MultiLanguageCitationMonitor from '@/components/MultiLanguageCitationMonitor';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

const AIVisibilityDashboard = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState({
    totalCitations: 0,
    averageScore: 0,
    visibilityTrend: '+15%',
    activePlatforms: 0
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      loadDashboardStats();
    }
  }, [user]);

  const loadDashboardStats = async () => {
    try {
      // Load AI platform citations
      const { data: citations } = await supabase
        .from('ai_platform_citations')
        .select('*')
        .eq('user_id', user?.id);

      // Load citation checks
      const { data: checks } = await supabase
        .from('citation_checks')
        .select('*')
        .eq('user_id', user?.id);

      const totalCitations = citations?.reduce((sum, citation) => sum + (citation.total_citations || 0), 0) || 0;
      const averageScore = citations?.reduce((sum, citation) => sum + (citation.average_score || 0), 0) / (citations?.length || 1) || 0;
      const activePlatforms = new Set(citations?.flatMap(citation => citation.platforms || [])).size;

      setStats({
        totalCitations,
        averageScore: Math.round(averageScore),
        visibilityTrend: '+15%',
        activePlatforms
      });
    } catch (error) {
      console.error('Error loading dashboard stats:', error);
    } finally {
      setLoading(false);
    }
  };

  const StatCard = ({ title, value, trend, icon: Icon, description }: any) => (
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
      </CardContent>
    </Card>
  );

  return (
    <div className="min-h-screen bg-matrix-black">
      <Header />
      
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-matrix-green mb-2">AI Visibility & Citation Tracking</h1>
          <p className="text-muted-foreground">Monitor your content visibility across AI platforms and track citations</p>
        </div>

        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <StatCard
            title="Total Citations"
            value={loading ? '...' : stats.totalCitations}
            trend={stats.visibilityTrend}
            icon={Target}
            description="Citations across all AI platforms"
          />
          <StatCard
            title="Average Score"
            value={loading ? '...' : `${stats.averageScore}%`}
            trend="+5%"
            icon={TrendingUp}
            description="Average visibility score"
          />
          <StatCard
            title="Active Platforms"
            value={loading ? '...' : stats.activePlatforms}
            icon={Globe}
            description="AI platforms monitoring"
          />
          <StatCard
            title="Visibility Trend"
            value={stats.visibilityTrend}
            icon={Activity}
            description="Month over month growth"
          />
        </div>

        {/* Main Tools */}
        <Tabs defaultValue="visibility-tracker" className="w-full">
          <TabsList className="grid w-full grid-cols-3 lg:grid-cols-6 bg-matrix-dark-gray border-matrix-green/30">
            <TabsTrigger value="visibility-tracker" className="text-matrix-green data-[state=active]:bg-matrix-green data-[state=active]:text-black">
              Visibility Tracker
            </TabsTrigger>
            <TabsTrigger value="platform-monitor" className="text-matrix-green data-[state=active]:bg-matrix-green data-[state=active]:text-black">
              Platform Monitor
            </TabsTrigger>
            <TabsTrigger value="citation-checker" className="text-matrix-green data-[state=active]:bg-matrix-green data-[state=active]:text-black">
              Citation Checker
            </TabsTrigger>
            <TabsTrigger value="attribution-tracker" className="text-matrix-green data-[state=active]:bg-matrix-green data-[state=active]:text-black">
              Attribution
            </TabsTrigger>
            <TabsTrigger value="monitoring-dashboard" className="text-matrix-green data-[state=active]:bg-matrix-green data-[state=active]:text-black">
              Monitoring
            </TabsTrigger>
            <TabsTrigger value="multilang-monitor" className="text-matrix-green data-[state=active]:bg-matrix-green data-[state=active]:text-black">
              Multi-Language
            </TabsTrigger>
          </TabsList>

          <TabsContent value="visibility-tracker" className="mt-6">
            <AIVisibilityTracker />
          </TabsContent>

          <TabsContent value="platform-monitor" className="mt-6">
            <AIPlatformMonitor />
          </TabsContent>

          <TabsContent value="citation-checker" className="mt-6">
            <CitationChecker />
          </TabsContent>

          <TabsContent value="attribution-tracker" className="mt-6">
            <CitationAttributionTracker />
          </TabsContent>

          <TabsContent value="monitoring-dashboard" className="mt-6">
            <CitationMonitoringDashboard />
          </TabsContent>

          <TabsContent value="multilang-monitor" className="mt-6">
            <MultiLanguageCitationMonitor />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default AIVisibilityDashboard;