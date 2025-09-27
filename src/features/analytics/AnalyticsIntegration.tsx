import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  BarChart3, 
  Download, 
  Settings, 
  RefreshCw,
  TrendingUp,
  TrendingDown,
  Eye,
  Share,
  Calendar,
  Filter,
  Info,
  Lightbulb
} from 'lucide-react';
import { toast } from 'sonner';

// Import our analytics components
import AnalyticsDashboard from './AnalyticsDashboard';
import RealTimeAnalytics from '@/components/analytics/RealTimeAnalytics';
import { 
  QuickStatsWidget, 
  PerformanceScoresWidget, 
  TrendChartWidget, 
  AlertsWidget 
} from '@/components/analytics/PerformanceWidgets';
import { analyticsService } from '@/services/analyticsService';
import { useAuth } from '@/contexts/AuthContext';

// Integration configuration interface
interface AnalyticsConfig {
  showQuickStats?: boolean;
  showPerformanceScores?: boolean;
  showTrendCharts?: boolean;
  showAlerts?: boolean;
  showRealTime?: boolean;
  compact?: boolean;
  metrics?: string[];
  dateRange?: '7d' | '30d' | '90d' | '1y';
}

interface AnalyticsIntegrationProps {
  config?: AnalyticsConfig;
  contextData?: {
    pageType?: string;
    contentId?: string;
    domainId?: string;
    toolName?: string;
  };
  onInsightClick?: (insight: string) => void;
  className?: string;
}

// Main analytics integration component
const AnalyticsIntegration: React.FC<AnalyticsIntegrationProps> = ({
  config = {},
  contextData,
  onInsightClick,
  className
}) => {
  const { user } = useAuth();
  const [activeView, setActiveView] = useState<'widgets' | 'dashboard' | 'realtime'>('widgets');
  const [insights, setInsights] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);

  const defaultConfig: AnalyticsConfig = {
    showQuickStats: true,
    showPerformanceScores: true,
    showTrendCharts: false,
    showAlerts: true,
    showRealTime: false,
    compact: true,
    dateRange: '30d',
    ...config
  };

  useEffect(() => {
    if (user && contextData) {
      loadContextualInsights();
      
      // Track analytics integration view
      analyticsService.trackEvent(user.id, 'analytics_integration_viewed', {
        pageType: contextData.pageType,
        toolName: contextData.toolName
      });
    }
  }, [user, contextData]);

  const loadContextualInsights = async () => {
    if (!user || !contextData) return;

    try {
      setLoading(true);
      
      // Generate contextual insights based on the page/tool being viewed
      const contextualInsights = await generateContextualInsights(contextData);
      setInsights(contextualInsights);
      
    } catch (error) {
      console.error('Error loading contextual insights:', error);
    } finally {
      setLoading(false);
    }
  };

  const generateContextualInsights = async (context: typeof contextData): Promise<string[]> => {
    // This would normally call an AI service to generate insights
    // For now, returning contextual mock insights based on the tool/page
    
    const insightMap: Record<string, string[]> = {
      'content-generator': [
        'Your content generation has improved 23% this month',
        'Blog posts perform 15% better than articles in AI citations',
        'Consider adding more FAQ sections for better AI visibility'
      ],
      'seo-analyzer': [
        'Technical SEO score increased by 8 points this week',
        'Mobile performance needs improvement (currently 72%)',
        'Competitors are gaining ground in voice search optimization'
      ],
      'citation-tracker': [
        'ChatGPT citation rate improved by 12% this month',
        'Perplexity shows highest citation success (85%)',
        'Consider optimizing for Bing Copilot (currently 61%)'
      ],
      'dashboard': [
        'Overall performance trending upward (+15%)',
        'Content quality scores are above industry average',
        'Real-time monitoring detected 3 new opportunities'
      ]
    };

    const toolName = context?.toolName || 'dashboard';
    return insightMap[toolName] || insightMap['dashboard'];
  };

  const exportAnalytics = async (format: 'pdf' | 'csv' | 'json') => {
    if (!user) return;

    try {
      setLoading(true);
      
      const reportConfig = {
        title: `Analytics Report - ${contextData?.toolName || 'Dashboard'}`,
        description: `Generated from ${contextData?.pageType || 'analytics integration'}`,
        date_range: defaultConfig.dateRange || '30d',
        metrics: defaultConfig.metrics || ['all'],
        format
      };

      const reportBlob = await analyticsService.generateReport(reportConfig, user.id);
      
      // Create download
      const url = URL.createObjectURL(reportBlob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `analytics-${Date.now()}.${format}`;
      a.click();
      URL.revokeObjectURL(url);

      toast.success(`Analytics exported as ${format.toUpperCase()}`);
      
      // Track export event
      analyticsService.trackEvent(user.id, 'analytics_exported', {
        format,
        context: contextData?.toolName
      });
      
    } catch (error) {
      console.error('Export error:', error);
      toast.error('Failed to export analytics');
    } finally {
      setLoading(false);
    }
  };

  const refreshAnalytics = () => {
    // Force refresh all components
    window.dispatchEvent(new CustomEvent('analytics-refresh'));
    toast.success('Analytics refreshed');
  };

  // Contextual insights component
  const ContextualInsights: React.FC = () => (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Lightbulb className="w-5 h-5" />
          AI Insights
        </CardTitle>
        <CardDescription>
          Personalized recommendations for {contextData?.toolName || 'your performance'}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {insights.map((insight, index) => (
            <Alert key={index} className="cursor-pointer hover:bg-accent/50" onClick={() => onInsightClick?.(insight)}>
              <Info className="h-4 w-4" />
              <AlertDescription>{insight}</AlertDescription>
            </Alert>
          ))}
          {insights.length === 0 && !loading && (
            <div className="text-center py-4 text-muted-foreground">
              <Lightbulb className="w-8 h-8 mx-auto mb-2 opacity-50" />
              <p>No insights available yet</p>
            </div>
          )}
          {loading && (
            <div className="flex items-center justify-center py-4">
              <RefreshCw className="w-6 h-6 animate-spin text-primary" />
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );

  return (
    <div className={className}>
      {/* Analytics Header */}
      <div className="mb-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold flex items-center gap-2">
              <BarChart3 className="w-6 h-6" />
              Performance Analytics
              {contextData?.toolName && (
                <Badge variant="outline">{contextData.toolName}</Badge>
              )}
            </h2>
            <p className="text-muted-foreground">
              Real-time insights and performance tracking
            </p>
          </div>
          
          <div className="flex items-center gap-2">
            <Select value={activeView} onValueChange={(value: any) => setActiveView(value)}>
              <SelectTrigger className="w-32">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="widgets">Widgets</SelectItem>
                <SelectItem value="dashboard">Dashboard</SelectItem>
                <SelectItem value="realtime">Real-time</SelectItem>
              </SelectContent>
            </Select>
            
            <Button variant="outline" size="sm" onClick={refreshAnalytics}>
              <RefreshCw className="w-4 h-4" />
            </Button>
            
            <Select onValueChange={exportAnalytics}>
              <SelectTrigger className="w-24">
                <SelectValue placeholder="Export" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="pdf">PDF</SelectItem>
                <SelectItem value="csv">CSV</SelectItem>
                <SelectItem value="json">JSON</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>

      {/* Analytics Content */}
      <Tabs value={activeView} onValueChange={(value) => setActiveView(value as "dashboard" | "widgets" | "realtime")} className="w-full">
        <TabsContent value="widgets">
          <div className="space-y-6">
            {/* Contextual Insights */}
            <ContextualInsights />
            
            {/* Analytics Widgets Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
              {defaultConfig.showQuickStats && (
                <QuickStatsWidget userId={user?.id} compact={defaultConfig.compact} />
              )}
              
              {defaultConfig.showPerformanceScores && (
                <PerformanceScoresWidget userId={user?.id} compact={defaultConfig.compact} />
              )}
              
              {defaultConfig.showTrendCharts && (
                <TrendChartWidget 
                  userId={user?.id} 
                  compact={defaultConfig.compact}
                  metric="Performance"
                  title="Performance Trend"
                />
              )}
              
              {defaultConfig.showAlerts && (
                <AlertsWidget userId={user?.id} compact={defaultConfig.compact} />
              )}
            </div>

            {/* Additional Contextual Widgets */}
            {contextData?.toolName === 'content-generator' && (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <TrendChartWidget 
                  userId={user?.id}
                  metric="Content Quality"
                  title="Content Quality Trend"
                  compact={defaultConfig.compact}
                />
                <Card>
                  <CardHeader>
                    <CardTitle>Content Type Performance</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <span>Blog Posts</span>
                        <div className="flex items-center gap-2">
                          <Progress value={85} className="w-20" />
                          <span className="text-sm">85%</span>
                        </div>
                      </div>
                      <div className="flex items-center justify-between">
                        <span>Articles</span>
                        <div className="flex items-center gap-2">
                          <Progress value={78} className="w-20" />
                          <span className="text-sm">78%</span>
                        </div>
                      </div>
                      <div className="flex items-center justify-between">
                        <span>FAQs</span>
                        <div className="flex items-center gap-2">
                          <Progress value={92} className="w-20" />
                          <span className="text-sm">92%</span>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            )}
          </div>
        </TabsContent>
        
        <TabsContent value="dashboard">
          <AnalyticsDashboard />
        </TabsContent>
        
        <TabsContent value="realtime">
          <RealTimeAnalytics />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default AnalyticsIntegration;

// Higher-order component for easy integration
export const withAnalytics = <P extends object>(
  WrappedComponent: React.ComponentType<P>,
  analyticsConfig?: AnalyticsConfig
) => {
  return React.forwardRef<any, P & { showAnalytics?: boolean }>((props, ref) => {
    const { showAnalytics = false, ...componentProps } = props;
    
    if (!showAnalytics) {
      return <WrappedComponent {...(componentProps as P)} ref={ref} />;
    }
    
    return (
      <div className="space-y-6">
        <WrappedComponent {...(componentProps as P)} ref={ref} />
        <AnalyticsIntegration 
          config={analyticsConfig}
          contextData={{
            pageType: 'tool',
            toolName: WrappedComponent.displayName || WrappedComponent.name
          }}
        />
      </div>
    );
  });
};

// Export utility components for standalone use
