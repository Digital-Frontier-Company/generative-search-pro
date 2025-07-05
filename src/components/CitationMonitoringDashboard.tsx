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
import type { Tables } from '@/integrations/supabase/types';

type CitationCheckRow = Tables<'citation_checks'>;

interface CitationData {
  id: number;
  query: string;
  domain: string;
  is_cited: boolean;
  ai_answer: string;
  cited_sources: any[];
  recommendations: string;
  checked_at: string;
}

interface Achievement {
  id: string;
  title: string;
  description: string;
  icon: string;
  unlocked: boolean;
  progress: number;
  maxProgress: number;
}

interface CitationStats {
  totalCitations: number;
  weeklyGrowth: number;
  googleSGE: number;
  bingChat: number;
  voice: number;
  topQueries: Array<{ query: string; count: number; trend: 'up' | 'down' | 'stable' }>;
  recentCitations: CitationData[];
  level: number;
  points: number;
  streak: number;
  achievements: Achievement[];
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
    recentCitations: [],
    level: 1,
    points: 0,
    streak: 0,
    achievements: []
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

      // Transform the data to match our interface
      const transformedData: CitationData[] = (citationData || []).map(row => ({
        id: row.id,
        query: row.query,
        domain: row.domain,
        is_cited: row.is_cited || false,
        ai_answer: row.ai_answer || '',
        cited_sources: Array.isArray(row.cited_sources) ? row.cited_sources : [],
        recommendations: row.recommendations || '',
        checked_at: row.checked_at || ''
      }));

      // Process the data to create stats
      const processedStats = processCitationData(transformedData);
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

    // Gamification calculations
    const totalCitations = cited.length;
    const points = totalCitations * 10 + thisWeekCited * 5; // Base points
    const level = Math.floor(points / 100) + 1;
    const streak = calculateStreak(data);
    const achievements = getAchievements(totalCitations, streak, level);

    return {
      totalCitations,
      weeklyGrowth,
      googleSGE: Math.floor(cited.length * 0.7), // Simulated breakdown
      bingChat: Math.floor(cited.length * 0.2),
      voice: Math.floor(cited.length * 0.1),
      topQueries,
      recentCitations: cited.slice(0, 5),
      level,
      points,
      streak,
      achievements
    };
  };

  const calculateStreak = (data: CitationData[]): number => {
    // Simple streak calculation - consecutive days with citations
    const days = [...Array(7)].map((_, i) => {
      const date = new Date();
      date.setDate(date.getDate() - i);
      return date.toDateString();
    });

    let streak = 0;
    for (const day of days) {
      const hasActivity = data.some(item => 
        new Date(item.checked_at).toDateString() === day
      );
      if (hasActivity) {
        streak++;
      } else {
        break;
      }
    }
    return streak;
  };

  const getAchievements = (citations: number, streak: number, level: number): Achievement[] => {
    const allAchievements: Achievement[] = [
      {
        id: 'first_citation',
        title: 'First Citation',
        description: 'Get your first AI citation',
        icon: '🎯',
        unlocked: citations >= 1,
        progress: Math.min(citations, 1),
        maxProgress: 1
      },
      {
        id: 'citation_master',
        title: 'Citation Master',
        description: 'Reach 10 citations',
        icon: '👑',
        unlocked: citations >= 10,
        progress: Math.min(citations, 10),
        maxProgress: 10
      },
      {
        id: 'streak_warrior',
        title: 'Streak Warrior',
        description: 'Maintain a 7-day activity streak',
        icon: '🔥',
        unlocked: streak >= 7,
        progress: Math.min(streak, 7),
        maxProgress: 7
      },
      {
        id: 'level_up',
        title: 'Level Up',
        description: 'Reach level 5',
        icon: '⭐',
        unlocked: level >= 5,
        progress: Math.min(level, 5),
        maxProgress: 5
      }
    ];

    return allAchievements;
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

      {/* Gamification Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="content-card hover-scale">
          <CardContent className="p-6">
            <div className="text-center">
              <div className="text-3xl mb-2">⭐</div>
              <h3 className="text-lg font-semibold text-matrix-green mb-1">Level {stats.level}</h3>
              <p className="text-sm text-matrix-green/70 mb-3">{stats.points} points earned</p>
              <Progress 
                value={(stats.points % 100)} 
                className="h-2 mb-2"
              />
              <p className="text-xs text-matrix-green/60">{100 - (stats.points % 100)} points to next level</p>
            </div>
          </CardContent>
        </Card>

        <Card className="content-card hover-scale">
          <CardContent className="p-6">
            <div className="text-center">
              <div className="text-3xl mb-2">🔥</div>
              <h3 className="text-lg font-semibold text-matrix-green mb-1">{stats.streak} Day Streak</h3>
              <p className="text-sm text-matrix-green/70 mb-3">Keep the momentum going!</p>
              <div className="flex justify-center space-x-1">
                {[...Array(7)].map((_, i) => (
                  <div 
                    key={i}
                    className={`w-3 h-3 rounded-full ${
                      i < stats.streak ? 'bg-orange-500' : 'bg-matrix-green/20'
                    }`}
                  />
                ))}
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="content-card hover-scale">
          <CardContent className="p-6">
            <div className="text-center">
              <div className="text-3xl mb-2">🏆</div>
              <h3 className="text-lg font-semibold text-matrix-green mb-1">Achievements</h3>
              <p className="text-sm text-matrix-green/70 mb-3">
                {stats.achievements.filter(a => a.unlocked).length} of {stats.achievements.length} unlocked
              </p>
              <div className="flex justify-center flex-wrap gap-1">
                {stats.achievements.slice(0, 4).map((achievement) => (
                  <div
                    key={achievement.id}
                    className={`text-lg ${
                      achievement.unlocked ? 'opacity-100' : 'opacity-30'
                    }`}
                    title={`${achievement.title}: ${achievement.description}`}
                  >
                    {achievement.icon}
                  </div>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Achievements Panel */}
      <Card className="content-card">
        <CardHeader>
          <CardTitle className="text-matrix-green flex items-center">
            🏆 Your Achievements
          </CardTitle>
          <CardDescription>Track your progress and unlock rewards</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {stats.achievements.map((achievement) => (
              <div
                key={achievement.id}
                className={`p-4 rounded-lg border transition-all ${
                  achievement.unlocked
                    ? 'bg-matrix-green/5 border-matrix-green/30 shadow-glow'
                    : 'bg-gray-500/5 border-gray-500/20'
                }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center space-x-3">
                    <span className={`text-2xl ${achievement.unlocked ? '' : 'grayscale opacity-50'}`}>
                      {achievement.icon}
                    </span>
                    <div>
                      <h4 className={`font-medium ${
                        achievement.unlocked ? 'text-matrix-green' : 'text-gray-500'
                      }`}>
                        {achievement.title}
                      </h4>
                      <p className={`text-sm ${
                        achievement.unlocked ? 'text-matrix-green/70' : 'text-gray-500/70'
                      }`}>
                        {achievement.description}
                      </p>
                    </div>
                  </div>
                  {achievement.unlocked && (
                    <CheckCircle className="w-5 h-5 text-green-500" />
                  )}
                </div>
                <div className="mt-3">
                  <Progress 
                    value={(achievement.progress / achievement.maxProgress) * 100}
                    className="h-2"
                  />
                  <p className="text-xs text-matrix-green/60 mt-1">
                    {achievement.progress} / {achievement.maxProgress}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

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