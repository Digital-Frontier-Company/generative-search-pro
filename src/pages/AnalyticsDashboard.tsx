import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import Header from '@/components/Header';
import { BarChart3, TrendingUp, Calendar, Eye, Target, Activity } from 'lucide-react';
import SeasonalTrendsPredictor from '@/components/SeasonalTrendsPredictor';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

// Placeholder advanced analytics components
const PerformanceMetrics = () => (
  <Card className="bg-matrix-dark-gray border-matrix-green/30">
    <CardHeader>
      <CardTitle className="text-matrix-green">Performance Metrics</CardTitle>
    </CardHeader>
    <CardContent>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-4">
          <h4 className="text-matrix-green font-semibold">Traffic Sources</h4>
          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <span className="text-sm">Organic Search</span>
              <span className="text-matrix-green">68%</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm">AI Platforms</span>
              <span className="text-matrix-green">24%</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm">Direct</span>
              <span className="text-matrix-green">8%</span>
            </div>
          </div>
        </div>
        
        <div className="space-y-4">
          <h4 className="text-matrix-green font-semibold">Conversion Metrics</h4>
          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <span className="text-sm">Conversion Rate</span>
              <span className="text-matrix-green">3.2%</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm">Avg. Session Duration</span>
              <span className="text-matrix-green">4:23</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm">Bounce Rate</span>
              <span className="text-yellow-500">32%</span>
            </div>
          </div>
        </div>
      </div>
    </CardContent>
  </Card>
);

const EngagementAnalytics = () => (
  <Card className="bg-matrix-dark-gray border-matrix-green/30">
    <CardHeader>
      <CardTitle className="text-matrix-green">Engagement Analytics</CardTitle>
    </CardHeader>
    <CardContent>
      <div className="space-y-6">
        <div>
          <h4 className="text-matrix-green font-semibold mb-3">Content Performance</h4>
          <div className="space-y-3">
            <div className="p-3 border border-matrix-green/30 rounded-lg">
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm font-medium">AI Optimization Guide</span>
                <span className="text-matrix-green">2,340 views</span>
              </div>
              <div className="text-xs text-muted-foreground">Avg. time: 6:45 | Engagement: 87%</div>
            </div>
            <div className="p-3 border border-matrix-green/30 rounded-lg">
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm font-medium">TSO Framework Overview</span>
                <span className="text-matrix-green">1,892 views</span>
              </div>
              <div className="text-xs text-muted-foreground">Avg. time: 5:12 | Engagement: 92%</div>
            </div>
          </div>
        </div>
        
        <div>
          <h4 className="text-matrix-green font-semibold mb-3">User Journey Analytics</h4>
          <div className="text-sm text-muted-foreground">
            Most common path: Landing → AI Analysis → Content Generator → Upgrade
          </div>
        </div>
      </div>
    </CardContent>
  </Card>
);

const ROITracking = () => (
  <Card className="bg-matrix-dark-gray border-matrix-green/30">
    <CardHeader>
      <CardTitle className="text-matrix-green">ROI Tracking</CardTitle>
    </CardHeader>
    <CardContent>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-4">
          <h4 className="text-matrix-green font-semibold">Revenue Impact</h4>
          <div className="text-2xl font-bold text-white">+47%</div>
          <p className="text-sm text-muted-foreground">Revenue increase from AI optimization</p>
          
          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <span className="text-sm">Organic Revenue</span>
              <span className="text-matrix-green">$12,450</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm">AI-driven Revenue</span>
              <span className="text-matrix-green">$8,230</span>
            </div>
          </div>
        </div>
        
        <div className="space-y-4">
          <h4 className="text-matrix-green font-semibold">Cost Savings</h4>
          <div className="text-2xl font-bold text-white">$3,200</div>
          <p className="text-sm text-muted-foreground">Monthly savings from automation</p>
          
          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <span className="text-sm">Content Creation</span>
              <span className="text-matrix-green">-$1,800</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm">SEO Analysis</span>
              <span className="text-matrix-green">-$1,400</span>
            </div>
          </div>
        </div>
      </div>
    </CardContent>
  </Card>
);

const AnalyticsDashboard = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState({
    totalViews: 0,
    conversionRate: 0,
    revenueGrowth: 0,
    engagementScore: 0
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      loadAnalyticsStats();
    }
  }, [user]);

  const loadAnalyticsStats = async () => {
    try {
      // These would be calculated from various analytics sources
      setStats({
        totalViews: 45680,
        conversionRate: 3.2,
        revenueGrowth: 47,
        engagementScore: 89
      });
    } catch (error) {
      console.error('Error loading analytics stats:', error);
    } finally {
      setLoading(false);
    }
  };

  const StatCard = ({ title, value, trend, icon: Icon, description, suffix = '' }: any) => (
    <Card className="bg-matrix-dark-gray border-matrix-green/30">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium text-matrix-green">{title}</CardTitle>
        <Icon className="h-4 w-4 text-matrix-green" />
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold text-white">{value}{suffix}</div>
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
          <h1 className="text-3xl font-bold text-matrix-green mb-2">Advanced Analytics & Monitoring</h1>
          <p className="text-muted-foreground">Comprehensive analytics, reporting, and performance monitoring</p>
        </div>

        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <StatCard
            title="Total Views"
            value={loading ? '...' : stats.totalViews.toLocaleString()}
            trend="+15%"
            icon={Eye}
            description="Total page views this month"
          />
          <StatCard
            title="Conversion Rate"
            value={loading ? '...' : stats.conversionRate}
            suffix="%"
            trend="+0.8%"
            icon={Target}
            description="Overall conversion rate"
          />
          <StatCard
            title="Revenue Growth"
            value={loading ? '...' : stats.revenueGrowth}
            suffix="%"
            trend="+12%"
            icon={TrendingUp}
            description="Revenue growth this quarter"
          />
          <StatCard
            title="Engagement Score"
            value={loading ? '...' : stats.engagementScore}
            suffix="/100"
            trend="+7"
            icon={Activity}
            description="User engagement index"
          />
        </div>

        {/* Analytics Insights */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          <Card className="bg-matrix-dark-gray border-matrix-green/30">
            <CardHeader>
              <CardTitle className="text-matrix-green flex items-center gap-2">
                <BarChart3 className="h-5 w-5" />
                Performance Summary
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <span>AI Optimization Impact</span>
                  <span className="text-matrix-green font-bold">+23%</span>
                </div>
                <div className="flex justify-between items-center">
                  <span>Content Quality Improvement</span>
                  <span className="text-matrix-green font-bold">+31%</span>
                </div>
                <div className="flex justify-between items-center">
                  <span>Citation Success Rate</span>
                  <span className="text-matrix-green font-bold">78%</span>
                </div>
                <div className="flex justify-between items-center">
                  <span>Search Visibility</span>
                  <span className="text-matrix-green font-bold">+45%</span>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-matrix-dark-gray border-matrix-green/30">
            <CardHeader>
              <CardTitle className="text-matrix-green flex items-center gap-2">
                <Calendar className="h-5 w-5" />
                Weekly Trends
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="text-sm">
                  <span className="text-matrix-lime">Monday-Wednesday:</span> Peak content generation activity
                </div>
                <div className="text-sm">
                  <span className="text-matrix-lime">Thursday-Friday:</span> High SEO analysis usage
                </div>
                <div className="text-sm">
                  <span className="text-matrix-lime">Weekend:</span> Competitive research focus
                </div>
                <div className="text-sm">
                  <span className="text-matrix-lime">Best Performance:</span> Tuesday 2-4 PM EST
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Main Analytics Tools */}
        <Tabs defaultValue="performance-metrics" className="w-full">
          <TabsList className="grid w-full grid-cols-2 lg:grid-cols-5 bg-matrix-dark-gray border-matrix-green/30">
            <TabsTrigger value="performance-metrics" className="text-matrix-green data-[state=active]:bg-matrix-green data-[state=active]:text-black">
              Performance
            </TabsTrigger>
            <TabsTrigger value="engagement-analytics" className="text-matrix-green data-[state=active]:bg-matrix-green data-[state=active]:text-black">
              Engagement
            </TabsTrigger>
            <TabsTrigger value="roi-tracking" className="text-matrix-green data-[state=active]:bg-matrix-green data-[state=active]:text-black">
              ROI Tracking
            </TabsTrigger>
            <TabsTrigger value="seo-dashboard" className="text-matrix-green data-[state=active]:bg-matrix-green data-[state=active]:text-black">
              SEO Dashboard
            </TabsTrigger>
            <TabsTrigger value="seasonal-trends" className="text-matrix-green data-[state=active]:bg-matrix-green data-[state=active]:text-black">
              Seasonal Trends
            </TabsTrigger>
          </TabsList>

          <TabsContent value="performance-metrics" className="mt-6">
            <PerformanceMetrics />
          </TabsContent>

          <TabsContent value="engagement-analytics" className="mt-6">
            <EngagementAnalytics />
          </TabsContent>

          <TabsContent value="roi-tracking" className="mt-6">
            <ROITracking />
          </TabsContent>

          <TabsContent value="seo-dashboard" className="mt-6">
            <Card className="bg-matrix-dark-gray border-matrix-green/30">
              <CardHeader>
                <CardTitle className="text-matrix-green">SEO Dashboard</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">Comprehensive SEO metrics and analysis dashboard coming soon.</p>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="seasonal-trends" className="mt-6">
            <SeasonalTrendsPredictor />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default AnalyticsDashboard;