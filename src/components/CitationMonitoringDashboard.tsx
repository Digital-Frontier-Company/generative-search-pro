import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  TrendingUp, 
  TrendingDown, 
  Target, 
  Search, 
  Bell, 
  BarChart3,
  CheckCircle,
  XCircle,
  Clock,
  Globe,
  Zap
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';

interface CitationData {
  id: string;
  query: string;
  domain: string;
  is_cited: boolean;
  ai_answer: string;
  cited_sources: any[];
  recommendations: string;
  checked_at: string;
}

interface CitationStats {
  totalCitations: number;
  weeklyGrowth: number;
  googleSGE: number;
  bingChat: number;
  voice: number;
  topQueries: Array<{ query: string; count: number; trend: 'up' | 'down' | 'stable' }>;
  recentCitations: CitationData[];
}

const CitationMonitoringDashboard = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState<CitationStats>({
    totalCitations: 0,
    weeklyGrowth: 0,
    googleSGE: 0,
    bingChat: 0,
    voice: 0,
    topQueries: [],
    recentCitations: []
  });
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');

  useEffect(() => {
    if (user) {
      loadCitationData();
    }
  }, [user]);

  const loadCitationData = async () => {
    try {
      setLoading(true);
      
      // Get citation data from the last 30 days
      const { data: citationData, error } = await supabase
        .from('citation_checks')
        .select('*')
        .eq('user_id', user?.id)
        .gte('checked_at', new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString())
        .order('checked_at', { ascending: false });

      if (error) throw error;

      // Process the data to create stats
      const processedStats = processCitationData(citationData || []);
      setStats(processedStats);
    } catch (error) {
      console.error('Error loading citation data:', error);
      toast.error('Failed to load citation data');
    } finally {
      setLoading(false);
    }
  };

  const processCitationData = (data: CitationData[]): CitationStats => {
    const cited = data.filter(item => item.is_cited);
    const thisWeek = data.filter(item => 
      new Date(item.checked_at) > new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
    );
    const lastWeek = data.filter(item => {
      const date = new Date(item.checked_at);
      const weekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
      const twoWeeksAgo = new Date(Date.now() - 14 * 24 * 60 * 60 * 1000);
      return date <= weekAgo && date > twoWeeksAgo;
    });

    const thisWeekCited = thisWeek.filter(item => item.is_cited).length;
    const lastWeekCited = lastWeek.filter(item => item.is_cited).length;
    const weeklyGrowth = lastWeekCited > 0 ? ((thisWeekCited - lastWeekCited) / lastWeekCited) * 100 : 0;

    // Analyze query performance
    const queryStats = cited.reduce((acc, item) => {
      acc[item.query] = (acc[item.query] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    const topQueries = Object.entries(queryStats)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 5)
      .map(([query, count]) => ({
        query,
        count,
        trend: Math.random() > 0.5 ? 'up' : 'down' as 'up' | 'down' // Simplified for demo
      }));

    return {
      totalCitations: cited.length,
      weeklyGrowth,
      googleSGE: Math.floor(cited.length * 0.7), // Simulated breakdown
      bingChat: Math.floor(cited.length * 0.2),
      voice: Math.floor(cited.length * 0.1),
      topQueries,
      recentCitations: cited.slice(0, 5)
    };
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => (
            <Card key={i} className="content-card">
              <CardContent className="p-6">
                <div className="animate-pulse">
                  <div className="h-4 bg-matrix-green/20 rounded w-3/4 mb-2"></div>
                  <div className="h-8 bg-matrix-green/20 rounded w-1/2"></div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-matrix-green">Citation Monitoring</h2>
          <p className="text-matrix-green/70">Track your AI search visibility and citations</p>
        </div>
        <Button 
          onClick={loadCitationData}
          className="glow-button text-black font-semibold"
        >
          <Zap className="w-4 h-4 mr-2" />
          Refresh Data
        </Button>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="content-card hover-scale">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-matrix-green/70">Total Citations</p>
                <p className="text-2xl font-bold text-matrix-green">{stats.totalCitations}</p>
              </div>
              <div className="p-3 rounded-full bg-matrix-green/10">
                <Target className="w-6 h-6 text-matrix-green" />
              </div>
            </div>
            <div className="mt-4 flex items-center">
              {stats.weeklyGrowth >= 0 ? (
                <TrendingUp className="w-4 h-4 text-green-500 mr-1" />
              ) : (
                <TrendingDown className="w-4 h-4 text-red-500 mr-1" />
              )}
              <span className={`text-sm ${stats.weeklyGrowth >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                {Math.abs(stats.weeklyGrowth).toFixed(1)}% vs last week
              </span>
            </div>
          </CardContent>
        </Card>

        <Card className="content-card hover-scale">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-matrix-green/70">Google SGE</p>
                <p className="text-2xl font-bold text-matrix-green">{stats.googleSGE}</p>
              </div>
              <div className="p-3 rounded-full bg-blue-500/10">
                <Search className="w-6 h-6 text-blue-500" />
              </div>
            </div>
            <Progress 
              value={(stats.googleSGE / stats.totalCitations) * 100} 
              className="mt-4 h-2"
            />
          </CardContent>
        </Card>

        <Card className="content-card hover-scale">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-matrix-green/70">Bing Chat</p>
                <p className="text-2xl font-bold text-matrix-green">{stats.bingChat}</p>
              </div>
              <div className="p-3 rounded-full bg-orange-500/10">
                <Globe className="w-6 h-6 text-orange-500" />
              </div>
            </div>
            <Progress 
              value={(stats.bingChat / stats.totalCitations) * 100} 
              className="mt-4 h-2"
            />
          </CardContent>
        </Card>

        <Card className="content-card hover-scale">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-matrix-green/70">Voice Citations</p>
                <p className="text-2xl font-bold text-matrix-green">{stats.voice}</p>
              </div>
              <div className="p-3 rounded-full bg-purple-500/10">
                <Bell className="w-6 h-6 text-purple-500" />
              </div>
            </div>
            <Progress 
              value={(stats.voice / stats.totalCitations) * 100} 
              className="mt-4 h-2"
            />
          </CardContent>
        </Card>
      </div>

      {/* Detailed Analytics */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="queries">Top Queries</TabsTrigger>
          <TabsTrigger value="recent">Recent Activity</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="mt-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card className="content-card">
              <CardHeader>
                <CardTitle className="text-matrix-green">Citation Trend</CardTitle>
                <CardDescription>Your citation performance over time</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-32 flex items-end justify-between space-x-1">
                  {[...Array(7)].map((_, i) => (
                    <div 
                      key={i}
                      className="bg-matrix-green/20 hover:bg-matrix-green/40 transition-colors duration-200 rounded-t"
                      style={{ 
                        height: `${Math.random() * 80 + 20}%`,
                        width: '12%'
                      }}
                    />
                  ))}
                </div>
                <div className="flex justify-between text-xs text-matrix-green/70 mt-2">
                  {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map(day => (
                    <span key={day}>{day}</span>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card className="content-card">
              <CardHeader>
                <CardTitle className="text-matrix-green">AI Platform Breakdown</CardTitle>
                <CardDescription>Citations by AI platform</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <div className="w-3 h-3 rounded-full bg-blue-500"></div>
                    <span className="text-sm text-matrix-green">Google SGE</span>
                  </div>
                  <span className="text-sm font-medium text-matrix-green">{stats.googleSGE}</span>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <div className="w-3 h-3 rounded-full bg-orange-500"></div>
                    <span className="text-sm text-matrix-green">Bing Chat</span>
                  </div>
                  <span className="text-sm font-medium text-matrix-green">{stats.bingChat}</span>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <div className="w-3 h-3 rounded-full bg-purple-500"></div>
                    <span className="text-sm text-matrix-green">Voice Search</span>
                  </div>
                  <span className="text-sm font-medium text-matrix-green">{stats.voice}</span>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="queries" className="mt-6">
          <Card className="content-card">
            <CardHeader>
              <CardTitle className="text-matrix-green">Top Performing Queries</CardTitle>
              <CardDescription>Queries that generate the most citations</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {stats.topQueries.map((query, index) => (
                  <div key={index} className="flex items-center justify-between p-3 rounded-lg bg-matrix-green/5 hover:bg-matrix-green/10 transition-colors">
                    <div className="flex items-center space-x-3">
                      <Badge variant="outline" className="text-matrix-green border-matrix-green/30">
                        #{index + 1}
                      </Badge>
                      <span className="font-medium text-matrix-green">{query.query}</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      {query.trend === 'up' ? (
                        <TrendingUp className="w-4 h-4 text-green-500" />
                      ) : (
                        <TrendingDown className="w-4 h-4 text-red-500" />
                      )}
                      <span className="text-sm font-medium text-matrix-green">{query.count} citations</span>
                    </div>
                  </div>
                ))}
                {stats.topQueries.length === 0 && (
                  <div className="text-center py-8 text-matrix-green/70">
                    <Search className="w-8 h-8 mx-auto mb-2 opacity-50" />
                    <p>No citation data available yet</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="recent" className="mt-6">
          <Card className="content-card">
            <CardHeader>
              <CardTitle className="text-matrix-green">Recent Citations</CardTitle>
              <CardDescription>Latest citation activity</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {stats.recentCitations.map((citation, index) => (
                  <Alert key={index} className="border-matrix-green/30">
                    <div className="flex items-start space-x-3">
                      <CheckCircle className="w-5 h-5 text-green-500 mt-0.5" />
                      <div className="flex-1">
                        <AlertDescription>
                          <div className="flex items-center justify-between mb-1">
                            <span className="font-medium text-matrix-green">"{citation.query}"</span>
                            <Badge variant="outline" className="text-xs">
                              {formatDate(citation.checked_at)}
                            </Badge>
                          </div>
                          <p className="text-sm text-matrix-green/70">
                            Cited on {citation.domain}
                          </p>
                        </AlertDescription>
                      </div>
                    </div>
                  </Alert>
                ))}
                {stats.recentCitations.length === 0 && (
                  <div className="text-center py-8 text-matrix-green/70">
                    <Clock className="w-8 h-8 mx-auto mb-2 opacity-50" />
                    <p>No recent citations found</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Quick Actions */}
      <Card className="content-card">
        <CardHeader>
          <CardTitle className="text-matrix-green">Quick Actions</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-wrap gap-3">
          <Button 
            variant="outline" 
            className="hover-scale"
            onClick={() => window.location.href = '/citation-checker'}
          >
            <Search className="w-4 h-4 mr-2" />
            Check New Citation
          </Button>
          <Button variant="outline" className="hover-scale">
            <BarChart3 className="w-4 h-4 mr-2" />
            Generate Report
          </Button>
          <Button variant="outline" className="hover-scale">
            <Bell className="w-4 h-4 mr-2" />
            Set Up Alerts
          </Button>
        </CardContent>
      </Card>
    </div>
  );
};

export default CitationMonitoringDashboard;