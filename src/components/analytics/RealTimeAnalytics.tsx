import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Button } from '@/components/ui/button';
import { 
  Activity, 
  TrendingUp, 
  TrendingDown, 
  Eye, 
  FileText, 
  Search, 
  Target, 
  Brain,
  Zap,
  Users,
  BarChart3,
  RefreshCw,
  AlertCircle,
  CheckCircle,
  Clock
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { analyticsService } from '@/services/analyticsService';
import { toast } from 'sonner';

// Real-time metric interfaces
interface RealTimeMetric {
  id: string;
  name: string;
  value: number;
  change: number;
  changeType: 'increase' | 'decrease' | 'neutral';
  lastUpdated: string;
  trend: number[];
  target?: number;
  unit?: 'number' | 'percentage' | 'currency';
}

interface LiveActivity {
  id: string;
  type: 'content_generated' | 'seo_analysis' | 'citation_check' | 'user_action';
  description: string;
  timestamp: string;
  score?: number;
  impact?: 'low' | 'medium' | 'high';
}

// Real-time analytics widget component
const RealTimeAnalytics: React.FC = () => {
  const { user } = useAuth();
  
  const [metrics, setMetrics] = useState<RealTimeMetric[]>([]);
  const [activities, setActivities] = useState<LiveActivity[]>([]);
  const [loading, setLoading] = useState(true);
  const [lastUpdate, setLastUpdate] = useState<Date>(new Date());
  const [autoRefresh, setAutoRefresh] = useState(true);

  useEffect(() => {
    if (user) {
      loadRealTimeData();
      
      if (autoRefresh) {
        const interval = setInterval(loadRealTimeData, 30000); // Update every 30 seconds
        return () => clearInterval(interval);
      }
    }
  }, [user, autoRefresh]);

  useEffect(() => {
    if (user) {
      // Subscribe to real-time updates
      const subscription = analyticsService.subscribeToRealTimeAnalytics(
        user.id,
        handleRealTimeUpdate
      );

      return () => {
        subscription.then(sub => sub.unsubscribe());
      };
    }
  }, [user]);

  const loadRealTimeData = async () => {
    if (!user) return;

    try {
      const data = await analyticsService.getRealTimeMetrics(user.id);
      
      setMetrics(data.metrics || generateMockMetrics());
      setActivities(data.activities || generateMockActivities());
      setLastUpdate(new Date());
      
      // Track analytics view
      analyticsService.trackEvent(user.id, 'realtime_analytics_viewed');
      
    } catch (error) {
      console.error('Error loading real-time data:', error);
      toast.error('Failed to load real-time analytics');
      
      // Use mock data as fallback
      setMetrics(generateMockMetrics());
      setActivities(generateMockActivities());
    } finally {
      setLoading(false);
    }
  };

  const handleRealTimeUpdate = (payload: any) => {
    console.log('Real-time update received:', payload);
    
    // Update metrics based on the payload
    if (payload.eventType === 'INSERT') {
      const newActivity: LiveActivity = {
        id: payload.new.id,
        type: determineActivityType(payload.table),
        description: generateActivityDescription(payload.new, payload.table),
        timestamp: new Date().toISOString(),
        score: payload.new.score,
        impact: determineImpact(payload.new)
      };
      
      setActivities(prev => [newActivity, ...prev.slice(0, 9)]);
      
      // Show toast notification for high-impact activities
      if (newActivity.impact === 'high') {
        toast.success(newActivity.description);
      }
    }
    
    setLastUpdate(new Date());
  };

  const generateMockMetrics = (): RealTimeMetric[] => [
    {
      id: '1',
      name: 'Content Generated Today',
      value: 12,
      change: 25,
      changeType: 'increase',
      lastUpdated: new Date().toISOString(),
      trend: [8, 10, 7, 12, 9, 15, 12],
      unit: 'number'
    },
    {
      id: '2',
      name: 'Average AI Score',
      value: 78,
      change: 5,
      changeType: 'increase',
      lastUpdated: new Date().toISOString(),
      trend: [72, 74, 76, 75, 77, 76, 78],
      target: 80,
      unit: 'percentage'
    },
    {
      id: '3',
      name: 'Citation Rate',
      value: 65,
      change: -3,
      changeType: 'decrease',
      lastUpdated: new Date().toISOString(),
      trend: [68, 67, 69, 66, 65, 64, 65],
      target: 70,
      unit: 'percentage'
    },
    {
      id: '4',
      name: 'SEO Analyses',
      value: 8,
      change: 0,
      changeType: 'neutral',
      lastUpdated: new Date().toISOString(),
      trend: [6, 8, 7, 9, 8, 8, 8],
      unit: 'number'
    }
  ];

  const generateMockActivities = (): LiveActivity[] => [
    {
      id: '1',
      type: 'content_generated',
      description: 'Generated blog post: "Advanced SEO Techniques"',
      timestamp: new Date(Date.now() - 2 * 60 * 1000).toISOString(),
      score: 85,
      impact: 'high'
    },
    {
      id: '2',
      type: 'seo_analysis',
      description: 'SEO analysis completed for example.com',
      timestamp: new Date(Date.now() - 5 * 60 * 1000).toISOString(),
      score: 72,
      impact: 'medium'
    },
    {
      id: '3',
      type: 'citation_check',
      description: 'Citation found in ChatGPT response',
      timestamp: new Date(Date.now() - 8 * 60 * 1000).toISOString(),
      impact: 'high'
    },
    {
      id: '4',
      type: 'user_action',
      description: 'Downloaded analytics report',
      timestamp: new Date(Date.now() - 12 * 60 * 1000).toISOString(),
      impact: 'low'
    }
  ];

  const determineActivityType = (table: string): LiveActivity['type'] => {
    switch (table) {
      case 'content_blocks': return 'content_generated';
      case 'seo_analyses': return 'seo_analysis';
      case 'citation_results': return 'citation_check';
      default: return 'user_action';
    }
  };

  const generateActivityDescription = (data: any, table: string): string => {
    switch (table) {
      case 'content_blocks':
        return `Generated ${data.content_type}: "${data.title || 'Untitled'}"`;
      case 'seo_analyses':
        return `SEO analysis completed for ${data.domain}`;
      case 'citation_results':
        return `Citation check: "${data.query}"`;
      default:
        return 'User activity recorded';
    }
  };

  const determineImpact = (data: any): 'low' | 'medium' | 'high' => {
    if (data.score > 80) return 'high';
    if (data.score > 60) return 'medium';
    return 'low';
  };

  const getMetricIcon = (name: string) => {
    if (name.includes('Content')) return FileText;
    if (name.includes('SEO') || name.includes('Score')) return BarChart3;
    if (name.includes('Citation')) return Target;
    return Activity;
  };

  const getActivityIcon = (type: LiveActivity['type']) => {
    switch (type) {
      case 'content_generated': return FileText;
      case 'seo_analysis': return Search;
      case 'citation_check': return Target;
      default: return Activity;
    }
  };

  const getImpactColor = (impact: 'low' | 'medium' | 'high') => {
    switch (impact) {
      case 'high': return 'text-green-500';
      case 'medium': return 'text-yellow-500';
      default: return 'text-gray-500';
    }
  };

  const formatTimeAgo = (timestamp: string) => {
    const now = new Date();
    const time = new Date(timestamp);
    const diffMs = now.getTime() - time.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    
    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffMins < 1440) return `${Math.floor(diffMins / 60)}h ago`;
    return `${Math.floor(diffMins / 1440)}d ago`;
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-center">
            <RefreshCw className="w-6 h-6 animate-spin text-primary" />
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Real-time Metrics */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Activity className="w-5 h-5" />
                Real-time Metrics
              </CardTitle>
              <CardDescription>
                Live updates • Last updated {formatTimeAgo(lastUpdate.toISOString())}
              </CardDescription>
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setAutoRefresh(!autoRefresh)}
              >
                {autoRefresh ? (
                  <>
                    <Eye className="w-4 h-4 mr-2" />
                    Live
                  </>
                ) : (
                  <>
                    <RefreshCw className="w-4 h-4 mr-2" />
                    Manual
                  </>
                )}
              </Button>
              <Button variant="outline" size="sm" onClick={loadRealTimeData}>
                <RefreshCw className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {metrics.map((metric) => {
              const Icon = getMetricIcon(metric.name);
              
              return (
                <Card key={metric.id} className="border-2">
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between mb-2">
                      <Icon className="w-5 h-5 text-primary" />
                      <Badge variant="outline" className="text-xs">
                        {metric.changeType === 'increase' && '+'}
                        {metric.change}%
                      </Badge>
                    </div>
                    <div className="space-y-2">
                      <div className="text-2xl font-bold">
                        {metric.value}
                        {metric.unit === 'percentage' && '%'}
                      </div>
                      <div className="text-sm text-muted-foreground">
                        {metric.name}
                      </div>
                      {metric.target && (
                        <div className="space-y-1">
                          <div className="flex justify-between text-xs">
                            <span>Target: {metric.target}%</span>
                            <span>{Math.round((metric.value / metric.target) * 100)}%</span>
                          </div>
                          <Progress value={(metric.value / metric.target) * 100} className="h-1" />
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Live Activity Feed */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock className="w-5 h-5" />
            Live Activity Feed
          </CardTitle>
          <CardDescription>
            Recent actions and events across your tools
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {activities.map((activity) => {
              const Icon = getActivityIcon(activity.type);
              
              return (
                <div key={activity.id} className="flex items-center gap-3 p-3 border rounded-lg">
                  <div className={`p-2 rounded-full bg-opacity-10 ${getImpactColor(activity.impact || 'low')}`}>
                    <Icon className={`w-4 h-4 ${getImpactColor(activity.impact || 'low')}`} />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center justify-between">
                      <span className="font-medium text-sm">{activity.description}</span>
                      <div className="flex items-center gap-2">
                        {activity.score && (
                          <Badge variant="outline" className="text-xs">
                            Score: {activity.score}%
                          </Badge>
                        )}
                        <span className="text-xs text-muted-foreground">
                          {formatTimeAgo(activity.timestamp)}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default RealTimeAnalytics;
