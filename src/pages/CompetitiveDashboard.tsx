import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import Header from '@/components/Header';
import { Target, TrendingUp, Eye, Users, AlertTriangle, Activity } from 'lucide-react';
import CompetitorGapAnalysis from '@/components/CompetitorGapAnalysis';
import CompetitiveAIAnalysis from '@/components/TSO/CompetitiveAIAnalysis';
import RealtimeSERPMonitor from '@/components/RealtimeSERPMonitor';
import OpportunityScanner from '@/components/OpportunityScanner';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

const CompetitiveDashboard = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState({
    competitorAnalyses: 0,
    gapOpportunities: 0,
    serpTracking: 0,
    alertsActive: 0
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      loadCompetitiveStats();
    }
  }, [user]);

  const loadCompetitiveStats = async () => {
    try {
      // Load competitor analyses
      const { data: competitorAnalyses } = await supabase
        .from('competitor_analyses')
        .select('*')
        .eq('user_id', user?.id);

      // Load opportunity scans
      const { data: opportunityScans } = await supabase
        .from('opportunity_scans')
        .select('*')
        .eq('user_id', user?.id);

      const totalAnalyses = competitorAnalyses?.length || 0;
      const totalOpportunities = opportunityScans?.reduce((sum, scan) => 
        sum + (scan.total_opportunities || 0), 0) || 0;

      setStats({
        competitorAnalyses: totalAnalyses,
        gapOpportunities: totalOpportunities,
        serpTracking: 12, // Placeholder - would track active SERP monitors
        alertsActive: 8 // Placeholder - would track active competitive alerts
      });
    } catch (error) {
      console.error('Error loading competitive stats:', error);
    } finally {
      setLoading(false);
    }
  };

  const StatCard = ({ title, value, trend, icon: Icon, description, color = "matrix-green" }: any) => (
    <Card className="bg-matrix-dark-gray border-matrix-green/30">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium text-matrix-green">{title}</CardTitle>
        <Icon className={`h-4 w-4 text-${color}`} />
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
          <h1 className="text-3xl font-bold text-matrix-green mb-2">Competitive Analysis & Research</h1>
          <p className="text-muted-foreground">Monitor competitors, identify gaps, and track SERP performance</p>
        </div>

        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <StatCard
            title="Competitor Analyses"
            value={loading ? '...' : stats.competitorAnalyses}
            trend="+3"
            icon={Users}
            description="Completed competitor analyses"
          />
          <StatCard
            title="Gap Opportunities"
            value={loading ? '...' : stats.gapOpportunities}
            trend="+15"
            icon={Target}
            description="Identified content gaps"
          />
          <StatCard
            title="SERP Tracking"
            value={loading ? '...' : stats.serpTracking}
            icon={Eye}
            description="Active SERP monitors"
          />
          <StatCard
            title="Active Alerts"
            value={loading ? '...' : stats.alertsActive}
            icon={AlertTriangle}
            description="Competitive alerts"
            color="yellow-500"
          />
        </div>

        {/* Competitive Insights */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          <Card className="bg-matrix-dark-gray border-matrix-green/30">
            <CardHeader>
              <CardTitle className="text-matrix-green flex items-center gap-2">
                <TrendingUp className="h-5 w-5" />
                Top Performing Competitors
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-sm">competitor1.com</span>
                  <span className="text-matrix-green font-semibold">92%</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm">competitor2.com</span>
                  <span className="text-matrix-green font-semibold">88%</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm">competitor3.com</span>
                  <span className="text-matrix-green font-semibold">85%</span>
                </div>
              </div>
              <Button variant="outline" className="w-full mt-4 border-matrix-green text-matrix-green hover:bg-matrix-green hover:text-black">
                View Full Analysis
              </Button>
            </CardContent>
          </Card>

          <Card className="bg-matrix-dark-gray border-matrix-green/30">
            <CardHeader>
              <CardTitle className="text-matrix-green flex items-center gap-2">
                <Activity className="h-5 w-5" />
                Recent SERP Changes
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="text-sm">
                  <span className="text-matrix-lime">competitor1.com</span> moved up 3 positions for "AI optimization"
                </div>
                <div className="text-sm">
                  <span className="text-red-400">competitor2.com</span> dropped 2 positions for "content strategy"
                </div>
                <div className="text-sm">
                  <span className="text-matrix-lime">New competitor</span> entered top 10 for "search optimization"
                </div>
              </div>
              <Button variant="outline" className="w-full mt-4 border-matrix-green text-matrix-green hover:bg-matrix-green hover:text-black">
                View SERP Trends
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Main Tools */}
        <Tabs defaultValue="gap-analysis" className="w-full">
          <TabsList className="grid w-full grid-cols-2 lg:grid-cols-4 bg-matrix-dark-gray border-matrix-green/30">
            <TabsTrigger value="gap-analysis" className="text-matrix-green data-[state=active]:bg-matrix-green data-[state=active]:text-black">
              Gap Analysis
            </TabsTrigger>
            <TabsTrigger value="competitive-ai" className="text-matrix-green data-[state=active]:bg-matrix-green data-[state=active]:text-black">
              AI Competition
            </TabsTrigger>
            <TabsTrigger value="serp-monitor" className="text-matrix-green data-[state=active]:bg-matrix-green data-[state=active]:text-black">
              SERP Monitor
            </TabsTrigger>
            <TabsTrigger value="opportunity-scanner" className="text-matrix-green data-[state=active]:bg-matrix-green data-[state=active]:text-black">
              Opportunity Scanner
            </TabsTrigger>
          </TabsList>

          <TabsContent value="gap-analysis" className="mt-6">
            <CompetitorGapAnalysis />
          </TabsContent>

          <TabsContent value="competitive-ai" className="mt-6">
            <CompetitiveAIAnalysis />
          </TabsContent>

          <TabsContent value="serp-monitor" className="mt-6">
            <RealtimeSERPMonitor />
          </TabsContent>

          <TabsContent value="opportunity-scanner" className="mt-6">
            <OpportunityScanner />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default CompetitiveDashboard;