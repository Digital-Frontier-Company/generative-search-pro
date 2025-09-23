import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  BarChart3, 
  TrendingUp, 
  TrendingDown, 
  Users, 
  FileText, 
  Search, 
  Target, 
  Brain,
  Calendar,
  Download,
  RefreshCw,
  Eye,
  Zap,
  Award,
  Activity,
  PieChart,
  LineChart,
  Globe,
  Clock
} from 'lucide-react';
import { LineChart as RechartsLineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, BarChart as RechartsBarChart, Bar, PieChart as RechartsPieChart, Cell, Pie } from 'recharts';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

// Analytics interfaces
interface AnalyticsOverview {
  totalContent: number;
  totalSEOAnalyses: number;
  totalCitationChecks: number;
  avgContentScore: number;
  avgSEOScore: number;
  avgCitationRate: number;
  weeklyGrowth: {
    content: number;
    seo: number;
    citations: number;
  };
  topPerformingContent: ContentMetric[];
  aiEnginePerformance: AIEngineMetric[];
}

interface ContentMetric {
  id: string;
  title: string;
  type: string;
  seoScore: number;
  aiScore: number;
  createdAt: string;
  views?: number;
  engagement?: number;
}

interface AIEngineMetric {
  engine: string;
  citationRate: number;
  averagePosition: number;
  totalQueries: number;
  improvement: number;
}

interface TrendData {
  date: string;
  contentGenerated: number;
  seoAnalyses: number;
  citationChecks: number;
  avgSeoScore: number;
  avgAiScore: number;
}

interface CompetitorInsight {
  domain: string;
  citationShare: number;
  averagePosition: number;
  gapsIdentified: number;
  opportunityScore: number;
}

const AnalyticsDashboard = () => {
  const { user } = useAuth();
  
  const [overview, setOverview] = useState<AnalyticsOverview | null>(null);
  const [trends, setTrends] = useState<TrendData[]>([]);
  const [competitors, setCompetitors] = useState<CompetitorInsight[]>([]);
  const [loading, setLoading] = useState(true);
  const [dateRange, setDateRange] = useState<'7d' | '30d' | '90d' | '1y'>('30d');
  const [activeTab, setActiveTab] = useState('overview');

  useEffect(() => {
    if (user) {
      loadAnalyticsData();
    }
  }, [user, dateRange]);

  const loadAnalyticsData = async () => {
    setLoading(true);
    try {
      await Promise.all([
        loadOverviewData(),
        loadTrendData(),
        loadCompetitorData()
      ]);
    } catch (error) {
      console.error('Error loading analytics:', error);
      toast.error('Failed to load analytics data');
    } finally {
      setLoading(false);
    }
  };

  const loadOverviewData = async () => {
    try {
      const { data, error } = await supabase.functions.invoke('get-analytics-overview', {
        body: JSON.stringify({
          user_id: user?.id,
          date_range: dateRange
        })
      });

      if (error) throw error;

      // Process real data or use mock data for development
      const mockOverview: AnalyticsOverview = {
        totalContent: data?.totalContent || 45,
        totalSEOAnalyses: data?.totalSEOAnalyses || 23,
        totalCitationChecks: data?.totalCitationChecks || 78,
        avgContentScore: data?.avgContentScore || 82,
        avgSEOScore: data?.avgSEOScore || 75,
        avgCitationRate: data?.avgCitationRate || 68,
        weeklyGrowth: {
          content: data?.weeklyGrowth?.content || 15,
          seo: data?.weeklyGrowth?.seo || 8,
          citations: data?.weeklyGrowth?.citations || 12
        },
        topPerformingContent: data?.topPerformingContent || generateMockContentData(),
        aiEnginePerformance: data?.aiEnginePerformance || generateMockAIEngineData()
      };

      setOverview(mockOverview);
    } catch (error) {
      console.error('Error loading overview:', error);
    }
  };

  const loadTrendData = async () => {
    try {
      const { data, error } = await supabase.functions.invoke('get-analytics-trends', {
        body: JSON.stringify({
          user_id: user?.id,
          date_range: dateRange
        })
      });

      if (error) throw error;

      // Generate mock trend data for development
      const mockTrends: TrendData[] = data || generateMockTrendData();
      setTrends(mockTrends);
    } catch (error) {
      console.error('Error loading trends:', error);
    }
  };

  const loadCompetitorData = async () => {
    try {
      const { data, error } = await supabase.functions.invoke('get-competitor-insights', {
        body: JSON.stringify({
          user_id: user?.id,
          date_range: dateRange
        })
      });

      if (error) throw error;

      const mockCompetitors: CompetitorInsight[] = data || [
        { domain: 'competitor1.com', citationShare: 25, averagePosition: 2.3, gapsIdentified: 8, opportunityScore: 85 },
        { domain: 'competitor2.com', citationShare: 18, averagePosition: 3.1, gapsIdentified: 12, opportunityScore: 72 },
        { domain: 'competitor3.com', citationShare: 15, averagePosition: 2.8, gapsIdentified: 6, opportunityScore: 68 }
      ];

      setCompetitors(mockCompetitors);
    } catch (error) {
      console.error('Error loading competitor data:', error);
    }
  };

  const generateMockContentData = (): ContentMetric[] => [
    {
      id: '1',
      title: 'Advanced SEO Techniques for 2024',
      type: 'blog',
      seoScore: 95,
      aiScore: 88,
      createdAt: '2024-01-15',
      views: 1250,
      engagement: 78
    },
    {
      id: '2', 
      title: 'AI Search Optimization Guide',
      type: 'article',
      seoScore: 92,
      aiScore: 85,
      createdAt: '2024-01-12',
      views: 980,
      engagement: 72
    },
    {
      id: '3',
      title: 'Content Marketing FAQ',
      type: 'faq',
      seoScore: 88,
      aiScore: 90,
      createdAt: '2024-01-10',
      views: 756,
      engagement: 85
    }
  ];

  const generateMockAIEngineData = (): AIEngineMetric[] => [
    { engine: 'ChatGPT', citationRate: 75, averagePosition: 2.1, totalQueries: 45, improvement: 12 },
    { engine: 'Claude', citationRate: 68, averagePosition: 2.8, totalQueries: 38, improvement: 8 },
    { engine: 'Perplexity', citationRate: 82, averagePosition: 1.9, totalQueries: 52, improvement: 18 },
    { engine: 'Bing Copilot', citationRate: 61, averagePosition: 3.2, totalQueries: 34, improvement: 5 },
    { engine: 'Gemini', citationRate: 58, averagePosition: 3.5, totalQueries: 28, improvement: 3 }
  ];

  const generateMockTrendData = (): TrendData[] => {
    const data = [];
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - 30);

    for (let i = 0; i < 30; i++) {
      const date = new Date(startDate);
      date.setDate(date.getDate() + i);
      
      data.push({
        date: date.toISOString().split('T')[0],
        contentGenerated: Math.floor(Math.random() * 5) + 1,
        seoAnalyses: Math.floor(Math.random() * 3) + 1,
        citationChecks: Math.floor(Math.random() * 8) + 2,
        avgSeoScore: Math.floor(Math.random() * 20) + 70,
        avgAiScore: Math.floor(Math.random() * 25) + 65
      });
    }
    
    return data;
  };

  const exportAnalytics = async (format: 'csv' | 'pdf' | 'json') => {
    try {
      const { data, error } = await supabase.functions.invoke('export-analytics', {
        body: JSON.stringify({
          user_id: user?.id,
          date_range: dateRange,
          format,
          include_trends: true,
          include_competitors: true
        })
      });

      if (error) throw error;

      // Create download link
      const blob = new Blob([data], { 
        type: format === 'csv' ? 'text/csv' : format === 'pdf' ? 'application/pdf' : 'application/json' 
      });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `analytics-report-${dateRange}.${format}`;
      a.click();
      URL.revokeObjectURL(url);

      toast.success(`Analytics exported as ${format.toUpperCase()}`);
    } catch (error) {
      console.error('Export error:', error);
      toast.error('Failed to export analytics');
    }
  };

  const MetricCard = ({ 
    title, 
    value, 
    change, 
    icon: Icon, 
    color = "text-blue-500" 
  }: {
    title: string;
    value: string | number;
    change?: number;
    icon: any;
    color?: string;
  }) => (
    <Card>
      <CardContent className="p-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-muted-foreground">{title}</p>
            <p className="text-3xl font-bold">{value}</p>
            {change !== undefined && (
              <div className="flex items-center mt-2">
                {change >= 0 ? (
                  <TrendingUp className="w-4 h-4 text-green-500 mr-1" />
                ) : (
                  <TrendingDown className="w-4 h-4 text-red-500 mr-1" />
                )}
                <span className={`text-sm ${change >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                  {change >= 0 ? '+' : ''}{change}%
                </span>
              </div>
            )}
          </div>
          <div className={`p-3 rounded-full bg-opacity-10 ${color}`}>
            <Icon className={`w-6 h-6 ${color}`} />
          </div>
        </div>
      </CardContent>
    </Card>
  );

  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8'];

  if (loading) {
    return (
      <div className="container mx-auto p-6">
        <div className="flex items-center justify-center h-64">
          <RefreshCw className="w-8 h-8 animate-spin text-primary" />
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 max-w-7xl">
      <div className="mb-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-bold flex items-center gap-3">
              <BarChart3 className="w-10 h-10 text-primary" />
              Analytics Dashboard
            </h1>
            <p className="text-xl text-muted-foreground mt-2">
              Comprehensive insights into your SEO, content, and citation performance
            </p>
          </div>
          
          <div className="flex items-center gap-3">
            <Select value={dateRange} onValueChange={(value: '7d' | '30d' | '90d' | '1y') => setDateRange(value)}>
              <SelectTrigger className="w-32">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="7d">Last 7 days</SelectItem>
                <SelectItem value="30d">Last 30 days</SelectItem>
                <SelectItem value="90d">Last 90 days</SelectItem>
                <SelectItem value="1y">Last year</SelectItem>
              </SelectContent>
            </Select>
            
            <Button variant="outline" onClick={loadAnalyticsData}>
              <RefreshCw className="w-4 h-4 mr-2" />
              Refresh
            </Button>
            
            <Select onValueChange={(format) => exportAnalytics(format as 'csv' | 'pdf' | 'json')}>
              <SelectTrigger className="w-32">
                <SelectValue placeholder="Export" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="csv">Export CSV</SelectItem>
                <SelectItem value="pdf">Export PDF</SelectItem>
                <SelectItem value="json">Export JSON</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="content">Content Analytics</TabsTrigger>
          <TabsTrigger value="seo">SEO Performance</TabsTrigger>
          <TabsTrigger value="citations">Citation Tracking</TabsTrigger>
          <TabsTrigger value="competitors">Competitive Analysis</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6 mt-6">
          {/* Key Metrics */}
          {overview && (
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <MetricCard
                  title="Content Generated"
                  value={overview.totalContent}
                  change={overview.weeklyGrowth.content}
                  icon={FileText}
                  color="text-blue-500"
                />
                <MetricCard
                  title="SEO Analyses"
                  value={overview.totalSEOAnalyses}
                  change={overview.weeklyGrowth.seo}
                  icon={Search}
                  color="text-green-500"
                />
                <MetricCard
                  title="Citation Checks"
                  value={overview.totalCitationChecks}
                  change={overview.weeklyGrowth.citations}
                  icon={Target}
                  color="text-purple-500"
                />
                <MetricCard
                  title="Avg AI Score"
                  value={`${overview.avgContentScore}%`}
                  icon={Brain}
                  color="text-orange-500"
                />
              </div>

              {/* Performance Trends */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <LineChart className="w-5 h-5" />
                    Performance Trends
                  </CardTitle>
                  <CardDescription>
                    Track your content and SEO performance over time
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="h-80">
                    <ResponsiveContainer width="100%" height="100%">
                      <RechartsLineChart data={trends}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="date" />
                        <YAxis />
                        <Tooltip />
                        <Legend />
                        <Line type="monotone" dataKey="avgSeoScore" stroke="#8884d8" strokeWidth={2} name="SEO Score" />
                        <Line type="monotone" dataKey="avgAiScore" stroke="#82ca9d" strokeWidth={2} name="AI Score" />
                      </RechartsLineChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>

              {/* Top Performing Content */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Award className="w-5 h-5" />
                    Top Performing Content
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Title</TableHead>
                        <TableHead>Type</TableHead>
                        <TableHead>SEO Score</TableHead>
                        <TableHead>AI Score</TableHead>
                        <TableHead>Views</TableHead>
                        <TableHead>Engagement</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {overview.topPerformingContent.map((content) => (
                        <TableRow key={content.id}>
                          <TableCell className="font-medium">{content.title}</TableCell>
                          <TableCell>
                            <Badge variant="outline">{content.type}</Badge>
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              <Progress value={content.seoScore} className="w-16" />
                              <span className="text-sm">{content.seoScore}%</span>
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              <Progress value={content.aiScore} className="w-16" />
                              <span className="text-sm">{content.aiScore}%</span>
                            </div>
                          </TableCell>
                          <TableCell>{content.views?.toLocaleString()}</TableCell>
                          <TableCell>{content.engagement}%</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>
            </>
          )}
        </TabsContent>

        <TabsContent value="content" className="space-y-6 mt-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Content Type Distribution */}
            <Card>
              <CardHeader>
                <CardTitle>Content Type Distribution</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <RechartsPieChart>
                      <Pie
                        data={[
                          { name: 'Blog Posts', value: 45, fill: COLORS[0] },
                          { name: 'Articles', value: 30, fill: COLORS[1] },
                          { name: 'FAQs', value: 15, fill: COLORS[2] },
                          { name: 'Social Posts', value: 10, fill: COLORS[3] }
                        ]}
                        cx="50%"
                        cy="50%"
                        outerRadius={80}
                        dataKey="value"
                        label
                      >
                        {[
                          { name: 'Blog Posts', value: 45, fill: COLORS[0] },
                          { name: 'Articles', value: 30, fill: COLORS[1] },
                          { name: 'FAQs', value: 15, fill: COLORS[2] },
                          { name: 'Social Posts', value: 10, fill: COLORS[3] }
                        ].map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.fill} />
                        ))}
                      </Pie>
                      <Tooltip />
                      <Legend />
                    </RechartsPieChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>

            {/* Content Quality Scores */}
            <Card>
              <CardHeader>
                <CardTitle>Average Quality Scores</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="font-medium">SEO Optimization</span>
                    <div className="flex items-center gap-2">
                      <Progress value={85} className="w-24" />
                      <span className="text-sm font-medium">85%</span>
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="font-medium">AI Readiness</span>
                    <div className="flex items-center gap-2">
                      <Progress value={78} className="w-24" />
                      <span className="text-sm font-medium">78%</span>
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="font-medium">Readability</span>
                    <div className="flex items-center gap-2">
                      <Progress value={92} className="w-24" />
                      <span className="text-sm font-medium">92%</span>
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="font-medium">Engagement</span>
                    <div className="flex items-center gap-2">
                      <Progress value={74} className="w-24" />
                      <span className="text-sm font-medium">74%</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Content Performance Over Time */}
          <Card>
            <CardHeader>
              <CardTitle>Content Generation Activity</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <RechartsBarChart data={trends}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="date" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Bar dataKey="contentGenerated" fill="#8884d8" name="Content Generated" />
                  </RechartsBarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="seo" className="space-y-6 mt-6">
          {overview && (
            <>
              {/* SEO Performance Metrics */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <Card>
                  <CardContent className="p-6">
                    <div className="text-center">
                      <div className="text-3xl font-bold text-primary">{overview.avgSEOScore}%</div>
                      <div className="text-sm text-muted-foreground">Average SEO Score</div>
                    </div>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="p-6">
                    <div className="text-center">
                      <div className="text-3xl font-bold text-primary">{overview.totalSEOAnalyses}</div>
                      <div className="text-sm text-muted-foreground">Total Analyses</div>
                    </div>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="p-6">
                    <div className="text-center">
                      <div className="text-3xl font-bold text-green-500">+{overview.weeklyGrowth.seo}%</div>
                      <div className="text-sm text-muted-foreground">Weekly Growth</div>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* SEO Score Trends */}
              <Card>
                <CardHeader>
                  <CardTitle>SEO Score Trends</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="h-80">
                    <ResponsiveContainer width="100%" height="100%">
                      <RechartsLineChart data={trends}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="date" />
                        <YAxis domain={[0, 100]} />
                        <Tooltip />
                        <Legend />
                        <Line type="monotone" dataKey="avgSeoScore" stroke="#8884d8" strokeWidth={2} name="SEO Score" />
                      </RechartsLineChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>

              {/* SEO Analysis Activity */}
              <Card>
                <CardHeader>
                  <CardTitle>SEO Analysis Activity</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="h-80">
                    <ResponsiveContainer width="100%" height="100%">
                      <RechartsBarChart data={trends}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="date" />
                        <YAxis />
                        <Tooltip />
                        <Legend />
                        <Bar dataKey="seoAnalyses" fill="#82ca9d" name="SEO Analyses" />
                      </RechartsBarChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>
            </>
          )}
        </TabsContent>

        <TabsContent value="citations" className="space-y-6 mt-6">
          {overview && (
            <>
              {/* Citation Performance by AI Engine */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Brain className="w-5 h-5" />
                    AI Engine Citation Performance
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {overview.aiEnginePerformance.map((engine) => (
                      <div key={engine.engine} className="flex items-center justify-between p-4 border rounded-lg">
                        <div className="flex items-center gap-3">
                          <Brain className="w-5 h-5 text-primary" />
                          <div>
                            <div className="font-medium">{engine.engine}</div>
                            <div className="text-sm text-muted-foreground">
                              {engine.totalQueries} queries • Avg position: {engine.averagePosition}
                            </div>
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="text-2xl font-bold">{engine.citationRate}%</div>
                          <div className={`text-sm flex items-center gap-1 ${engine.improvement >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                            {engine.improvement >= 0 ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
                            {engine.improvement >= 0 ? '+' : ''}{engine.improvement}%
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Citation Trends */}
              <Card>
                <CardHeader>
                  <CardTitle>Citation Check Activity</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="h-80">
                    <ResponsiveContainer width="100%" height="100%">
                      <RechartsBarChart data={trends}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="date" />
                        <YAxis />
                        <Tooltip />
                        <Legend />
                        <Bar dataKey="citationChecks" fill="#FFBB28" name="Citation Checks" />
                      </RechartsBarChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>
            </>
          )}
        </TabsContent>

        <TabsContent value="competitors" className="space-y-6 mt-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="w-5 h-5" />
                Competitive Landscape
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Competitor</TableHead>
                    <TableHead>Citation Share</TableHead>
                    <TableHead>Avg Position</TableHead>
                    <TableHead>Gaps Identified</TableHead>
                    <TableHead>Opportunity Score</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {competitors.map((competitor) => (
                    <TableRow key={competitor.domain}>
                      <TableCell className="font-medium">{competitor.domain}</TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Progress value={competitor.citationShare} className="w-16" />
                          <span className="text-sm">{competitor.citationShare}%</span>
                        </div>
                      </TableCell>
                      <TableCell>{competitor.averagePosition}</TableCell>
                      <TableCell>
                        <Badge variant="outline">{competitor.gapsIdentified}</Badge>
                      </TableCell>
                      <TableCell>
                        <Badge variant={competitor.opportunityScore >= 80 ? "default" : "secondary"}>
                          {competitor.opportunityScore}%
                        </Badge>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default AnalyticsDashboard;
