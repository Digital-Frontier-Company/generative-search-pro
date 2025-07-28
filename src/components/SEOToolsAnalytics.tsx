import { useEffect, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { TrendingUp, Users, Globe, BarChart3, Eye } from "lucide-react";
import { useSEOAnalysis } from "@/contexts/SEOAnalysisContext";

const SEOToolsAnalytics = () => {
  const { analysis, keywords } = useSEOAnalysis();

  const [analyticsData, setAnalyticsData] = useState({
    overview: {
      totalVisibility: 85,
      organicTraffic: 12430,
      avgPosition: 8.2,
      impressions: 45600,
    },
    trends: [
      { metric: 'Visibility', value: '+12%', trend: 'up' },
      { metric: 'Clicks', value: '+8%', trend: 'up' },
      { metric: 'Impressions', value: '+15%', trend: 'up' },
      { metric: 'CTR', value: '-2%', trend: 'down' },
    ],
    topPages: [
      { url: '/best-practices', clicks: 2340, impressions: 12500, ctr: 18.7 },
      { url: '/getting-started', clicks: 1890, impressions: 9800, ctr: 19.3 },
      { url: '/advanced-tips', clicks: 1560, impressions: 8200, ctr: 19.0 },
    ],
    keywords: [
      { term: 'AI optimization', position: 3, volume: 8900 },
      { term: 'content analysis', position: 7, volume: 5400 },
      { term: 'SEO tools', position: 12, volume: 12000 },
    ],
  });

  // Update analytics data when analysis or keywords change
  useEffect(() => {
    if (!analysis) return;

    const visibility = analysis.total_score ?? analyticsData.overview.totalVisibility;

    const kwArray = keywords ?? analyticsData.keywords;

    const updatedKeywords = kwArray.map((kw, idx) => ({
      term: kw.word ?? kw.term,
      position: idx + 1,
      volume: kw.count ?? kw.volume,
    }));

    // OrganicTraffic & impressions rough estimations based on keyword counts
    const totalKeywordCount = kwArray?.reduce((acc: number, k: any) => acc + (k.count || 0), 0) ?? analyticsData.overview.organicTraffic;

    setAnalyticsData(prev => ({
      ...prev,
      overview: {
        totalVisibility: visibility,
        organicTraffic: totalKeywordCount * 10,
        avgPosition: updatedKeywords.length ? updatedKeywords.reduce((acc, k) => acc + k.position, 0) / updatedKeywords.length : 0,
        impressions: totalKeywordCount * 30,
      },
      keywords: updatedKeywords,
    }));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [analysis, keywords]);

  const getTrendIcon = (trend: string) => {
    return trend === 'up' ? '↗️' : '↘️';
  };

  const getTrendColor = (trend: string) => {
    return trend === 'up' ? 'text-matrix-green' : 'text-error';
  };

  return (
    <Card className="content-card">
      <CardHeader>
        <CardTitle className="text-matrix-green flex items-center">
          <BarChart3 className="w-5 h-5 mr-2" />
          SEO Tools & Analytics
        </CardTitle>
        <CardDescription>
          Real-time performance metrics and insights
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="overview" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="performance">Performance</TabsTrigger>
            <TabsTrigger value="keywords">Keywords</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-4">
            {/* Key Metrics */}
            <div className="grid grid-cols-2 gap-4">
              <div className="p-4 bg-secondary/50 rounded-lg">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <Eye className="w-4 h-4 text-matrix-green" />
                    <span className="text-sm">Visibility</span>
                  </div>
                  <Badge variant="secondary">{analyticsData.overview.totalVisibility}%</Badge>
                </div>
              </div>
              <div className="p-4 bg-secondary/50 rounded-lg">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <Users className="w-4 h-4 text-matrix-green" />
                    <span className="text-sm">Traffic</span>
                  </div>
                  <Badge variant="secondary">{analyticsData.overview.organicTraffic.toLocaleString()}</Badge>
                </div>
              </div>
              <div className="p-4 bg-secondary/50 rounded-lg">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <TrendingUp className="w-4 h-4 text-matrix-green" />
                    <span className="text-sm">Avg Position</span>
                  </div>
                  <Badge variant="secondary">{analyticsData.overview.avgPosition}</Badge>
                </div>
              </div>
              <div className="p-4 bg-secondary/50 rounded-lg">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <Globe className="w-4 h-4 text-matrix-green" />
                    <span className="text-sm">Impressions</span>
                  </div>
                  <Badge variant="secondary">{analyticsData.overview.impressions.toLocaleString()}</Badge>
                </div>
              </div>
            </div>

            {/* Trends */}
            <div className="space-y-2">
              <h4 className="text-sm font-medium text-matrix-green">Recent Trends</h4>
              {analyticsData.trends.map((trend, index) => (
                <div key={index} className="flex items-center justify-between p-2 bg-secondary/30 rounded">
                  <span className="text-sm">{trend.metric}</span>
                  <div className={`flex items-center space-x-1 ${getTrendColor(trend.trend)}`}>
                    <span className="text-sm">{trend.value}</span>
                    <span>{getTrendIcon(trend.trend)}</span>
                  </div>
                </div>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="performance" className="space-y-4">
            <div className="space-y-2">
              <h4 className="text-sm font-medium text-matrix-green">Top Performing Pages</h4>
              {analyticsData.topPages.map((page, index) => (
                <div key={index} className="p-3 bg-secondary/50 rounded-lg">
                  <div className="font-medium text-sm mb-2">{page.url}</div>
                  <div className="grid grid-cols-3 gap-2 text-xs text-muted-foreground">
                    <div>Clicks: {page.clicks}</div>
                    <div>Impressions: {page.impressions}</div>
                    <div>CTR: {page.ctr}%</div>
                  </div>
                </div>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="keywords" className="space-y-4">
            <div className="space-y-2">
              <h4 className="text-sm font-medium text-matrix-green">Keyword Performance</h4>
              {analyticsData.keywords.map((keyword, index) => (
                <div key={index} className="flex items-center justify-between p-3 bg-secondary/50 rounded-lg">
                  <div>
                    <div className="font-medium text-sm">{keyword.term}</div>
                    <div className="text-xs text-muted-foreground">Volume: {keyword.volume.toLocaleString()}</div>
                  </div>
                  <Badge 
                    variant={keyword.position <= 5 ? "default" : keyword.position <= 10 ? "secondary" : "outline"}
                    className="text-xs"
                  >
                    #{keyword.position}
                  </Badge>
                </div>
              ))}
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
};

export default SEOToolsAnalytics;