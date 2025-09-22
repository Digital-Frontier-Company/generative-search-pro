import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Button } from '@/components/ui/button';
import { 
  TrendingUp, 
  TrendingDown, 
  Target, 
  Award, 
  Zap, 
  BarChart3,
  PieChart,
  Activity,
  CheckCircle,
  AlertTriangle,
  Info,
  ArrowRight
} from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart as RechartsPieChart, Cell, Pie } from 'recharts';
import { analyticsService } from '@/services/analyticsService';

// Widget component interfaces
interface WidgetProps {
  userId?: string;
  className?: string;
  compact?: boolean;
}

interface PerformanceScore {
  name: string;
  current: number;
  target: number;
  trend: number;
  color: string;
}

interface QuickStat {
  label: string;
  value: string | number;
  change?: number;
  icon: React.ComponentType<{ className?: string }>;
  color: string;
}

// Quick Stats Widget
export const QuickStatsWidget: React.FC<WidgetProps> = ({ userId, className, compact = false }) => {
  const [stats, setStats] = useState<QuickStat[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadQuickStats();
  }, [userId]);

  const loadQuickStats = async () => {
    try {
      // In production, this would call the analytics service
      const mockStats: QuickStat[] = [
        {
          label: 'Content Score',
          value: '85%',
          change: 12,
          icon: BarChart3,
          color: 'text-blue-500'
        },
        {
          label: 'SEO Score',
          value: '78%',
          change: 5,
          icon: TrendingUp,
          color: 'text-green-500'
        },
        {
          label: 'Citations',
          value: 23,
          change: -2,
          icon: Target,
          color: 'text-purple-500'
        },
        {
          label: 'Rank',
          value: '#4',
          change: 1,
          icon: Award,
          color: 'text-yellow-500'
        }
      ];
      
      setStats(mockStats);
    } catch (error) {
      console.error('Error loading quick stats:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <Card className={className}>
        <CardContent className="p-4">
          <div className="animate-pulse space-y-3">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="h-4 bg-gray-200 rounded" />
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className={className}>
      <CardHeader className={compact ? "p-4 pb-2" : ""}>
        <CardTitle className={`flex items-center gap-2 ${compact ? "text-lg" : ""}`}>
          <Activity className="w-5 h-5" />
          Performance Summary
        </CardTitle>
        {!compact && (
          <CardDescription>Key metrics at a glance</CardDescription>
        )}
      </CardHeader>
      <CardContent className={compact ? "p-4 pt-2" : ""}>
        <div className={`grid ${compact ? "grid-cols-2" : "grid-cols-4"} gap-4`}>
          {stats.map((stat, index) => (
            <div key={index} className="text-center">
              <div className={`inline-flex p-2 rounded-full bg-opacity-10 ${stat.color} mb-2`}>
                <stat.icon className={`w-4 h-4 ${stat.color}`} />
              </div>
              <div className="text-xl font-bold">{stat.value}</div>
              <div className="text-xs text-muted-foreground">{stat.label}</div>
              {stat.change !== undefined && (
                <div className={`text-xs flex items-center justify-center gap-1 mt-1 ${
                  stat.change >= 0 ? 'text-green-500' : 'text-red-500'
                }`}>
                  {stat.change >= 0 ? (
                    <TrendingUp className="w-3 h-3" />
                  ) : (
                    <TrendingDown className="w-3 h-3" />
                  )}
                  {Math.abs(stat.change)}%
                </div>
              )}
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

// Performance Scores Widget
export const PerformanceScoresWidget: React.FC<WidgetProps> = ({ userId, className, compact = false }) => {
  const [scores, setScores] = useState<PerformanceScore[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadPerformanceScores();
  }, [userId]);

  const loadPerformanceScores = async () => {
    try {
      const mockScores: PerformanceScore[] = [
        { name: 'SEO Score', current: 78, target: 85, trend: 5, color: 'text-blue-500' },
        { name: 'AI Readiness', current: 82, target: 90, trend: 8, color: 'text-green-500' },
        { name: 'Content Quality', current: 75, target: 80, trend: -2, color: 'text-purple-500' },
        { name: 'Citation Rate', current: 65, target: 75, trend: 3, color: 'text-yellow-500' }
      ];
      
      setScores(mockScores);
    } catch (error) {
      console.error('Error loading performance scores:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <Card className={className}>
        <CardContent className="p-4">
          <div className="animate-pulse space-y-4">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="space-y-2">
                <div className="h-3 bg-gray-200 rounded" />
                <div className="h-2 bg-gray-200 rounded" />
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className={className}>
      <CardHeader className={compact ? "p-4 pb-2" : ""}>
        <CardTitle className={`flex items-center gap-2 ${compact ? "text-lg" : ""}`}>
          <BarChart3 className="w-5 h-5" />
          Performance Scores
        </CardTitle>
        {!compact && (
          <CardDescription>Progress towards your targets</CardDescription>
        )}
      </CardHeader>
      <CardContent className={compact ? "p-4 pt-2" : ""}>
        <div className="space-y-4">
          {scores.map((score, index) => (
            <div key={index}>
              <div className="flex items-center justify-between mb-1">
                <span className="text-sm font-medium">{score.name}</span>
                <div className="flex items-center gap-2">
                  <span className="text-sm">{score.current}%</span>
                  <Badge variant={score.current >= score.target ? "default" : "secondary"}>
                    Target: {score.target}%
                  </Badge>
                  <div className={`flex items-center gap-1 ${
                    score.trend >= 0 ? 'text-green-500' : 'text-red-500'
                  }`}>
                    {score.trend >= 0 ? (
                      <TrendingUp className="w-3 h-3" />
                    ) : (
                      <TrendingDown className="w-3 h-3" />
                    )}
                    <span className="text-xs">{Math.abs(score.trend)}%</span>
                  </div>
                </div>
              </div>
              <Progress value={score.current} className="h-2" />
              <div className="mt-1 text-xs text-muted-foreground">
                Progress: {Math.round((score.current / score.target) * 100)}% of target
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

// Trend Chart Widget
export const TrendChartWidget: React.FC<WidgetProps & { 
  metric: string; 
  data?: Array<{ date: string; value: number }>;
  title?: string;
}> = ({ userId, className, compact = false, metric, data, title }) => {
  const [chartData, setChartData] = useState(data || []);
  const [loading, setLoading] = useState(!data);

  useEffect(() => {
    if (!data) {
      loadTrendData();
    }
  }, [userId, metric, data]);

  const loadTrendData = async () => {
    try {
      // Mock trend data - in production, this would come from analytics service
      const mockData = Array.from({ length: 7 }, (_, i) => ({
        date: new Date(Date.now() - (6 - i) * 24 * 60 * 60 * 1000).toLocaleDateString(),
        value: Math.floor(Math.random() * 20) + 70
      }));
      
      setChartData(mockData);
    } catch (error) {
      console.error('Error loading trend data:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <Card className={className}>
        <CardContent className="p-4">
          <div className="animate-pulse">
            <div className="h-32 bg-gray-200 rounded" />
          </div>
        </CardContent>
      </Card>
    );
  }

  const currentValue = chartData[chartData.length - 1]?.value || 0;
  const previousValue = chartData[chartData.length - 2]?.value || 0;
  const change = currentValue - previousValue;

  return (
    <Card className={className}>
      <CardHeader className={compact ? "p-4 pb-2" : ""}>
        <CardTitle className={`flex items-center justify-between ${compact ? "text-lg" : ""}`}>
          <span className="flex items-center gap-2">
            <PieChart className="w-5 h-5" />
            {title || `${metric} Trend`}
          </span>
          <div className={`flex items-center gap-1 ${
            change >= 0 ? 'text-green-500' : 'text-red-500'
          }`}>
            {change >= 0 ? (
              <TrendingUp className="w-4 h-4" />
            ) : (
              <TrendingDown className="w-4 h-4" />
            )}
            <span className="text-sm">{Math.abs(change)}</span>
          </div>
        </CardTitle>
      </CardHeader>
      <CardContent className={compact ? "p-4 pt-2" : ""}>
        <div className={compact ? "h-24" : "h-32"}>
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={chartData}>
              <XAxis dataKey="date" hide />
              <YAxis hide />
              <Tooltip 
                labelFormatter={(label) => `Date: ${label}`}
                formatter={(value) => [`${value}%`, metric]}
              />
              <Line 
                type="monotone" 
                dataKey="value" 
                stroke="#8884d8" 
                strokeWidth={2}
                dot={false}
                activeDot={{ r: 4 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
        <div className="mt-2 text-center">
          <div className="text-lg font-bold">{currentValue}%</div>
          <div className="text-xs text-muted-foreground">Current {metric}</div>
        </div>
      </CardContent>
    </Card>
  );
};

// Alerts Widget
export const AlertsWidget: React.FC<WidgetProps> = ({ userId, className, compact = false }) => {
  const [alerts, setAlerts] = useState<Array<{
    id: string;
    type: 'info' | 'warning' | 'error' | 'success';
    title: string;
    description: string;
    timestamp: string;
  }>>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadAlerts();
  }, [userId]);

  const loadAlerts = async () => {
    try {
      const mockAlerts = [
        {
          id: '1',
          type: 'success' as const,
          title: 'Citation Found',
          description: 'New citation detected in ChatGPT response',
          timestamp: new Date(Date.now() - 2 * 60 * 1000).toISOString()
        },
        {
          id: '2',
          type: 'warning' as const,
          title: 'SEO Score Drop',
          description: 'Domain score decreased by 5 points',
          timestamp: new Date(Date.now() - 30 * 60 * 1000).toISOString()
        },
        {
          id: '3',
          type: 'info' as const,
          title: 'Report Available',
          description: 'Weekly analytics report is ready',
          timestamp: new Date(Date.now() - 60 * 60 * 1000).toISOString()
        }
      ];
      
      setAlerts(mockAlerts);
    } catch (error) {
      console.error('Error loading alerts:', error);
    } finally {
      setLoading(false);
    }
  };

  const getAlertIcon = (type: string) => {
    switch (type) {
      case 'success': return CheckCircle;
      case 'warning': return AlertTriangle;
      case 'error': return AlertTriangle;
      default: return Info;
    }
  };

  const getAlertColor = (type: string) => {
    switch (type) {
      case 'success': return 'text-green-500';
      case 'warning': return 'text-yellow-500';
      case 'error': return 'text-red-500';
      default: return 'text-blue-500';
    }
  };

  const formatTimeAgo = (timestamp: string) => {
    const now = new Date();
    const time = new Date(timestamp);
    const diffMs = now.getTime() - time.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    
    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    return `${Math.floor(diffMins / 60)}h ago`;
  };

  if (loading) {
    return (
      <Card className={className}>
        <CardContent className="p-4">
          <div className="animate-pulse space-y-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="flex items-center gap-3">
                <div className="w-8 h-8 bg-gray-200 rounded-full" />
                <div className="flex-1 space-y-1">
                  <div className="h-3 bg-gray-200 rounded" />
                  <div className="h-2 bg-gray-200 rounded w-2/3" />
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className={className}>
      <CardHeader className={compact ? "p-4 pb-2" : ""}>
        <CardTitle className={`flex items-center justify-between ${compact ? "text-lg" : ""}`}>
          <span className="flex items-center gap-2">
            <AlertTriangle className="w-5 h-5" />
            Recent Alerts
          </span>
          <Badge variant="outline">{alerts.length}</Badge>
        </CardTitle>
        {!compact && (
          <CardDescription>Latest notifications and updates</CardDescription>
        )}
      </CardHeader>
      <CardContent className={compact ? "p-4 pt-2" : ""}>
        <div className="space-y-3">
          {alerts.slice(0, compact ? 3 : 5).map((alert) => {
            const Icon = getAlertIcon(alert.type);
            const colorClass = getAlertColor(alert.type);
            
            return (
              <div key={alert.id} className="flex items-start gap-3 p-2 rounded-lg border">
                <Icon className={`w-4 h-4 mt-0.5 ${colorClass}`} />
                <div className="flex-1 min-w-0">
                  <div className="font-medium text-sm">{alert.title}</div>
                  <div className="text-xs text-muted-foreground">{alert.description}</div>
                  <div className="text-xs text-muted-foreground mt-1">
                    {formatTimeAgo(alert.timestamp)}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
        {alerts.length > (compact ? 3 : 5) && (
          <div className="mt-3 text-center">
            <Button variant="ghost" size="sm">
              View all alerts
              <ArrowRight className="w-3 h-3 ml-1" />
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

// Export all widgets
export { QuickStatsWidget, PerformanceScoresWidget, TrendChartWidget, AlertsWidget };
