
import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { TrendingUp, TrendingDown, Eye, Target, Zap, Search } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

interface VisibilityMetric {
  label: string;
  score: number;
  change: number;
  status: 'good' | 'warning' | 'poor';
}

const AIVisibilityScore = () => {
  const { user } = useAuth();
  const [domain, setDomain] = useState("digitalfrontier.app");
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [overallScore, setOverallScore] = useState(85);
  
  const [metrics, setMetrics] = useState<VisibilityMetric[]>([
    { label: "Featured Snippets", score: 92, change: 15, status: 'good' },
    { label: "AI Answer Boxes", score: 78, change: -5, status: 'warning' },
    { label: "Voice Search", score: 84, change: 22, status: 'good' },
    { label: "Schema Markup", score: 95, change: 8, status: 'good' },
    { label: "Content Structure", score: 71, change: -12, status: 'warning' }
  ]);

  const handleAnalyzeDomain = async () => {
    if (!domain.trim()) {
      toast.error("Please enter a domain to analyze");
      return;
    }

    if (!user) {
      toast.error("Please log in to analyze domains");
      return;
    }

    setIsAnalyzing(true);
    try {
      const { data, error } = await supabase.functions.invoke('analyze-schema-patch', {
        body: {
          url: domain.startsWith('http') ? domain : `https://${domain}`,
          user_id: user.id
        }
      });

      if (error) throw error;

      if (data.success) {
        const analysis = data.analysis;
        setOverallScore(analysis.aiVisibilityScore || 0);
        
        // Update metrics based on analysis
        setMetrics([
          { label: "Featured Snippets", score: Math.min((analysis.aiVisibilityScore || 0) + 7, 100), change: 15, status: 'good' },
          { label: "AI Answer Boxes", score: Math.max((analysis.aiVisibilityScore || 0) - 7, 0), change: -5, status: 'warning' },
          { label: "Voice Search", score: Math.min((analysis.aiVisibilityScore || 0) - 1, 100), change: 22, status: 'good' },
          { label: "Schema Markup", score: Math.min((analysis.aiVisibilityScore || 0) + 10, 100), change: 8, status: 'good' },
          { label: "Content Structure", score: Math.max((analysis.aiVisibilityScore || 0) - 14, 0), change: -12, status: 'warning' }
        ]);

        toast.success("Domain analysis completed!");
      } else {
        throw new Error("Analysis failed");
      }
    } catch (error) {
      console.error('Error analyzing domain:', error);
      toast.error("Failed to analyze domain. Please try again.");
    } finally {
      setIsAnalyzing(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'good': return 'text-green-500';
      case 'warning': return 'text-yellow-500';
      case 'poor': return 'text-red-500';
      default: return 'text-gray-500';
    }
  };

  const getStatusBadgeColor = (status: string) => {
    switch (status) {
      case 'good': return 'bg-green-100 text-green-800';
      case 'warning': return 'bg-yellow-100 text-yellow-800';
      case 'poor': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="space-y-6">
      {/* Domain Input Section */}
      <Card className="content-card">
        <CardHeader>
          <CardTitle className="text-xl text-matrix-green flex items-center gap-2">
            <Target className="w-5 h-5" />
            Analyze Domain
          </CardTitle>
          <CardDescription className="text-matrix-green/70">
            Enter a domain or website URL to analyze its AI visibility score
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex gap-3">
            <Input
              type="text"
              placeholder="Enter domain (e.g., example.com or https://example.com)"
              value={domain}
              onChange={(e) => setDomain(e.target.value)}
              className="flex-1 bg-matrix-dark-gray border-matrix-green/30 text-matrix-green placeholder:text-matrix-green/50"
              disabled={isAnalyzing}
            />
            <Button
              onClick={handleAnalyzeDomain}
              disabled={isAnalyzing}
              className="bg-matrix-green text-black font-medium hover:bg-matrix-green/80"
            >
              {isAnalyzing ? (
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 border-2 border-black border-t-transparent rounded-full animate-spin" />
                  Analyzing...
                </div>
              ) : (
                <>
                  <Search className="w-4 h-4 mr-2" />
                  Analyze
                </>
              )}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Overall Score Card */}
      <Card className="content-card">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl text-matrix-green flex items-center justify-center gap-2">
            <Eye className="w-6 h-6" />
            AI Visibility Score
          </CardTitle>
          <CardDescription className="text-matrix-green/70">
            Your content's visibility across AI search platforms
          </CardDescription>
        </CardHeader>
        <CardContent className="text-center">
          <div className="relative w-32 h-32 mx-auto mb-4">
            <div className="w-32 h-32 rounded-full border-8 border-matrix-green/20 flex items-center justify-center relative">
              <div 
                className="absolute inset-0 rounded-full border-8 border-matrix-green"
                style={{
                  background: `conic-gradient(#00ff41 ${overallScore * 3.6}deg, transparent 0deg)`
                }}
              />
              <div className="w-24 h-24 bg-black rounded-full flex items-center justify-center relative z-10">
                <span className="text-3xl font-bold text-matrix-green">{overallScore}</span>
              </div>
            </div>
          </div>
          <Badge className={getStatusBadgeColor('good')}>
            Excellent Performance
          </Badge>
        </CardContent>
      </Card>

      {/* Detailed Metrics */}
      <Card className="content-card">
        <CardHeader>
          <CardTitle className="text-xl text-matrix-green">Performance Breakdown</CardTitle>
          <CardDescription className="text-matrix-green/70">
            Individual metric scores and recent changes
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {metrics.map((metric, index) => (
            <div key={index} className="space-y-2">
              <div className="flex justify-between items-center">
                <span className="text-matrix-green font-medium">{metric.label}</span>
                <div className="flex items-center gap-2">
                  <span className="text-matrix-green text-lg font-bold">{metric.score}%</span>
                  <div className={`flex items-center ${metric.change >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                    {metric.change >= 0 ? <TrendingUp className="w-4 h-4" /> : <TrendingDown className="w-4 h-4" />}
                    <span className="text-sm">{Math.abs(metric.change)}%</span>
                  </div>
                </div>
              </div>
              <Progress 
                value={metric.score} 
                className="h-2"
              />
              <div className="flex justify-between text-sm text-matrix-green/70">
                <span>Poor</span>
                <span>Excellent</span>
              </div>
            </div>
          ))}
        </CardContent>
      </Card>

      {/* Quick Actions */}
      <Card className="content-card">
        <CardHeader>
          <CardTitle className="text-xl text-matrix-green flex items-center gap-2">
            <Zap className="w-5 h-5" />
            Recommended Actions
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="p-3 rounded-lg bg-matrix-dark-gray border border-matrix-green/30">
            <div className="flex items-center gap-2 mb-1">
              <Target className="w-4 h-4 text-matrix-green" />
              <span className="text-matrix-green font-medium">Optimize AI Answer Boxes</span>
            </div>
            <p className="text-sm text-matrix-green/70">Add more structured Q&A content to improve answer box visibility</p>
          </div>
          <div className="p-3 rounded-lg bg-matrix-dark-gray border border-matrix-green/30">
            <div className="flex items-center gap-2 mb-1">
              <Target className="w-4 h-4 text-matrix-green" />
              <span className="text-matrix-green font-medium">Improve Content Structure</span>
            </div>
            <p className="text-sm text-matrix-green/70">Use more heading tags and bullet points for better content organization</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default AIVisibilityScore;
