import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import Header from '@/components/Header';
import { FileText, Zap, BarChart3, Sparkles, TrendingUp, Clock } from 'lucide-react';
// Content generation and optimization components will be integrated
import AIAnswerOptimizer from '@/components/AIAnswerOptimizer';
import ContentQualityAnalyzer from '@/components/ContentQualityAnalyzer';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useNavigate } from 'react-router-dom';

const ContentDashboard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [stats, setStats] = useState({
    totalContent: 0,
    averageQuality: 0,
    recentOptimizations: 0,
    aiReadiness: 0
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      loadContentStats();
    }
  }, [user]);

  const loadContentStats = async () => {
    try {
      // Load content blocks
      const { data: content } = await supabase
        .from('content_blocks')
        .select('*')
        .eq('user_id', user?.id);

      const totalContent = content?.length || 0;
      const recentOptimizations = content?.filter(c => 
        new Date(c.created_at) > new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
      ).length || 0;

      setStats({
        totalContent,
        averageQuality: 85, // Placeholder - would calculate from actual quality scores
        recentOptimizations,
        aiReadiness: 78 // Placeholder - would calculate from AI optimization scores
      });
    } catch (error) {
      console.error('Error loading content stats:', error);
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
            {trend} from last week
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
          <h1 className="text-3xl font-bold text-matrix-green mb-2">Content Generation & Optimization</h1>
          <p className="text-muted-foreground">Create and optimize content for AI search engines and traditional SEO</p>
        </div>

        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <StatCard
            title="Total Content"
            value={loading ? '...' : stats.totalContent}
            trend="+3"
            icon={FileText}
            description="Content pieces generated"
            action={{ label: 'View All', onClick: () => navigate('/history') }}
          />
          <StatCard
            title="Average Quality"
            value={loading ? '...' : `${stats.averageQuality}%`}
            trend="+7%"
            icon={BarChart3}
            description="Content quality score"
          />
          <StatCard
            title="Recent Optimizations"
            value={loading ? '...' : stats.recentOptimizations}
            icon={Zap}
            description="Optimized this week"
          />
          <StatCard
            title="AI Readiness"
            value={loading ? '...' : `${stats.aiReadiness}%`}
            trend="+12%"
            icon={Sparkles}
            description="AI search optimization"
          />
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card className="bg-matrix-dark-gray border-matrix-green/30">
            <CardHeader>
              <CardTitle className="text-matrix-green flex items-center gap-2">
                <Sparkles className="h-5 w-5" />
                Quick Generate
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground mb-4">Generate AI-optimized content instantly</p>
              <Button className="w-full bg-matrix-green text-black hover:bg-matrix-lime" onClick={() => navigate('/generator')}>
                Start Generating
              </Button>
            </CardContent>
          </Card>

          <Card className="bg-matrix-dark-gray border-matrix-green/30">
            <CardHeader>
              <CardTitle className="text-matrix-green flex items-center gap-2">
                <TrendingUp className="h-5 w-5" />
                Optimize Existing
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground mb-4">Improve your existing content</p>
              <Button variant="outline" className="w-full border-matrix-green text-matrix-green hover:bg-matrix-green hover:text-black">
                Upload Content
              </Button>
            </CardContent>
          </Card>

          <Card className="bg-matrix-dark-gray border-matrix-green/30">
            <CardHeader>
              <CardTitle className="text-matrix-green flex items-center gap-2">
                <Clock className="h-5 w-5" />
                Content History
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground mb-4">View and manage past content</p>
              <Button variant="outline" className="w-full border-matrix-green text-matrix-green hover:bg-matrix-green hover:text-black" onClick={() => navigate('/history')}>
                View History
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Main Tools */}
        <Tabs defaultValue="generator" className="w-full">
          <TabsList className="grid w-full grid-cols-2 lg:grid-cols-4 bg-matrix-dark-gray border-matrix-green/30">
            <TabsTrigger value="generator" className="text-matrix-green data-[state=active]:bg-matrix-green data-[state=active]:text-black">
              Content Generator
            </TabsTrigger>
            <TabsTrigger value="optimizer" className="text-matrix-green data-[state=active]:bg-matrix-green data-[state=active]:text-black">
              Content Optimizer
            </TabsTrigger>
            <TabsTrigger value="ai-answer" className="text-matrix-green data-[state=active]:bg-matrix-green data-[state=active]:text-black">
              AI Answer Optimizer
            </TabsTrigger>
            <TabsTrigger value="quality-analyzer" className="text-matrix-green data-[state=active]:bg-matrix-green data-[state=active]:text-black">
              Quality Analyzer
            </TabsTrigger>
          </TabsList>

          <TabsContent value="generator" className="mt-6">
            <Card className="bg-matrix-dark-gray border-matrix-green/30">
              <CardHeader>
                <CardTitle className="text-matrix-green">Content Generator</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground mb-4">Generate AI-optimized content for multiple platforms</p>
                <Button className="bg-matrix-green text-black hover:bg-matrix-lime" onClick={() => navigate('/generator')}>
                  Open Content Generator
                </Button>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="optimizer" className="mt-6">
            <Card className="bg-matrix-dark-gray border-matrix-green/30">
              <CardHeader>
                <CardTitle className="text-matrix-green">Content Optimizer</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground mb-4">Optimize existing content for AI search engines</p>
                <Button className="bg-matrix-green text-black hover:bg-matrix-lime">
                  Upload Content to Optimize
                </Button>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="ai-answer" className="mt-6">
            <AIAnswerOptimizer />
          </TabsContent>

          <TabsContent value="quality-analyzer" className="mt-6">
            <ContentQualityAnalyzer />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default ContentDashboard;