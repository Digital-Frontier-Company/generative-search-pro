import { useEffect, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./ui/card";
import { Badge } from "./ui/badge";
import { Progress } from "./ui/progress";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./ui/tabs";
import { CheckCircle, AlertTriangle, XCircle, Lightbulb, Bot, RefreshCw, TrendingUp, Search, Target, Zap } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "../integrations/supabase/client";
import { useSEOAnalysis } from "../contexts/SEOAnalysisContext";
import { useAuth } from "../contexts/AuthContext";
import { useDomain } from "../contexts/DomainContext";
interface AuditFinding {
  type: 'success' | 'warning' | 'error' | 'info';
  title: string;
  description: string;
  impact: 'high' | 'medium' | 'low';
  category: 'content' | 'technical' | 'ai-optimization' | 'performance';
  actionable?: string;
  priority?: number;
}
interface AuditMetrics {
  contentStructure: number;
  readability: number;
  aiOptimization: number;
  technicalSEO: number;
  performance: number;
  accessibility: number;
}
interface CompetitorComparison {
  domain: string;
  overallScore: number;
  strengths: string[];
  weaknesses: string[];
}
const AIAudit = () => {
  const {
    analysis,
    fetchAnalysis
  } = useSEOAnalysis();
  const {
    user
  } = useAuth();
  const {
    defaultDomain
  } = useDomain();
  const [domain, setDomain] = useState(defaultDomain || '');
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('overview');
  const [auditData, setAuditData] = useState({
    overallScore: 0,
    metrics: {
      contentStructure: 0,
      readability: 0,
      aiOptimization: 0,
      technicalSEO: 0,
      performance: 0,
      accessibility: 0
    } as AuditMetrics,
    findings: [] as AuditFinding[],
    competitorComparison: [] as CompetitorComparison[],
    lastUpdated: null as Date | null,
    recommendations: [] as string[],
    priorityActions: [] as AuditFinding[]
  });

  // Update domain when default changes
  useEffect(() => {
    if (defaultDomain && !domain) {
      setDomain(defaultDomain);
    }
  }, [defaultDomain]);

  // Update audit data when analysis changes
  useEffect(() => {
    if (!analysis) return;
    const newFindings: AuditFinding[] = analysis.technical_findings?.map((f: any) => ({
      type: f.status === 'good' ? 'success' : f.status === 'error' ? 'error' : 'warning',
      title: f.finding_type.replace(/_/g, ' '),
      description: f.message,
      impact: f.impact || 'medium',
      category: f.category || 'technical',
      actionable: f.actionable_suggestion,
      priority: f.priority || 5
    })) || [];

    // Add AI-specific findings
    const aiFindings: AuditFinding[] = [{
      type: analysis.schema_count > 0 ? 'success' : 'error',
      title: 'Structured Data Implementation',
      description: analysis.schema_count > 0 ? `${analysis.schema_count} schema types detected` : 'No structured data found - critical for AI visibility',
      impact: 'high',
      category: 'ai-optimization',
      actionable: 'Implement schema markup for better AI understanding',
      priority: 1
    }, {
      type: analysis.meta_description ? 'success' : 'warning',
      title: 'Meta Description Optimization',
      description: analysis.meta_description ? 'Meta description is present' : 'Missing or inadequate meta description',
      impact: 'medium',
      category: 'content',
      actionable: 'Write compelling, descriptive meta descriptions for all pages',
      priority: 3
    }, {
      type: analysis.heading_structure?.h1_count === 1 ? 'success' : 'warning',
      title: 'Heading Structure',
      description: analysis.heading_structure?.h1_count === 1 ? 'Proper H1 structure detected' : 'Multiple or missing H1 tags detected',
      impact: 'medium',
      category: 'content',
      actionable: 'Ensure each page has exactly one H1 tag with clear hierarchy',
      priority: 4
    }];
    const allFindings = [...newFindings, ...aiFindings];
    const priorityActions = allFindings.filter(f => f.priority && f.priority <= 3).sort((a, b) => (a.priority || 5) - (b.priority || 5));
    setAuditData(prev => ({
      overallScore: analysis.total_score || 0,
      metrics: {
        contentStructure: analysis.technical_score ?? 0,
        readability: analysis.performance_score ?? 0,
        aiOptimization: analysis.ai_optimization_score ?? analysis.backlink_score ?? 0,
        technicalSEO: analysis.technical_score ?? 0,
        performance: analysis.performance_score ?? 0,
        accessibility: analysis.accessibility_score ?? 75
      },
      findings: allFindings,
      competitorComparison: analysis.competitor_comparison || [],
      lastUpdated: new Date(),
      recommendations: analysis.recommendations || [],
      priorityActions
    }));
  }, [analysis]);
  const runAudit = async () => {
    if (!domain.trim()) {
      toast.error('Please enter a domain to audit');
      return;
    }
    if (!user) {
      toast.error('Please sign in to run AI audit');
      return;
    }
    setLoading(true);
    try {
      // Run comprehensive analysis
      await fetchAnalysis(domain);

      // Get additional AI-specific analysis
      const {
        data,
        error
      } = await supabase.functions.invoke('analyze-seo', {
        body: JSON.stringify({
          domain: domain.trim(),
          user_id: user.id,
          include_ai_analysis: true,
          include_competitor_comparison: true
        })
      });
      if (error) throw error;
      toast.success('AI audit completed successfully!');
    } catch (error: any) {
      console.error('Audit error:', error);
      toast.error(error.message || 'Failed to run audit');
    } finally {
      setLoading(false);
    }
  };
  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-green-600';
    if (score >= 60) return 'text-yellow-600';
    return 'text-red-600';
  };
  const getScoreBg = (score: number) => {
    if (score >= 80) return 'bg-green-100';
    if (score >= 60) return 'bg-yellow-100';
    return 'bg-red-100';
  };
  const getImpactColor = (impact: string) => {
    switch (impact) {
      case 'high':
        return 'text-red-600 bg-red-100';
      case 'medium':
        return 'text-yellow-600 bg-yellow-100';
      case 'low':
        return 'text-blue-600 bg-blue-100';
      default:
        return 'text-gray-600 bg-gray-100';
    }
  };
  const getFindingIcon = (type: string) => {
    switch (type) {
      case 'success':
        return <CheckCircle className="w-5 h-5 text-green-600" />;
      case 'warning':
        return <AlertTriangle className="w-5 h-5 text-yellow-600" />;
      case 'error':
        return <XCircle className="w-5 h-5 text-red-600" />;
      default:
        return <Lightbulb className="w-5 h-5 text-blue-600" />;
    }
  };
  return <div className="max-w-6xl mx-auto p-6 space-y-6">
      <div className="text-center">
        <h1 className="text-3xl font-bold mb-2 flex items-center justify-center gap-2 text-slate-50">
          <Bot className="w-8 h-8 text-blue-600" />
          AI SEO Audit
        </h1>
        <p className="text-slate-50 font-bold">
          Comprehensive analysis optimized for AI search engines and modern SEO
        </p>
      </div>

      {/* Input Section */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Search className="w-5 h-5" />
            Domain Analysis
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex gap-4 px-0 mx-[3px]">
            <Input placeholder="Enter domain (e.g., example.com)" value={domain} onChange={e => setDomain(e.target.value)} onKeyPress={e => e.key === 'Enter' && runAudit()} className="flex-1 rounded-xl px-[66px] mx-0" />
            <Button onClick={runAudit} disabled={loading} className="text-center my-0 py-0 rounded-lg mx-0 px-[50px] font-extrabold text-sm">
              {loading ? <>
                  <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                  Analyzing...
                </> : <>
                  <Bot className="w-4 h-4 mr-2" />
                  Run AI Audit
                </>}
            </Button>
          </div>
          {auditData.lastUpdated && <p className="text-sm text-gray-500">
              Last updated: {auditData.lastUpdated.toLocaleString()}
            </p>}
        </CardContent>
      </Card>

      {auditData.overallScore > 0 && <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="findings">Findings</TabsTrigger>
            <TabsTrigger value="recommendations">Actions</TabsTrigger>
            <TabsTrigger value="competitors">Competitors</TabsTrigger>
            <TabsTrigger value="metrics">Metrics</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            {/* Overall Score */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <span>Overall AI SEO Score</span>
                  <Badge className={`text-lg px-4 py-2 ${getScoreBg(auditData.overallScore)} ${getScoreColor(auditData.overallScore)}`}>
                    {auditData.overallScore}/100
                  </Badge>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <Progress value={auditData.overallScore} className="mb-4" />
                <p className="text-gray-600">
                  {auditData.overallScore >= 80 ? 'Excellent! Your site is well-optimized for AI search engines.' : auditData.overallScore >= 60 ? 'Good foundation with room for improvement.' : 'Significant optimization needed for AI visibility.'}
                </p>
              </CardContent>
            </Card>

            {/* Metrics Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {Object.entries(auditData.metrics).map(([key, value]) => <Card key={key}>
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium capitalize">
                        {key.replace(/([A-Z])/g, ' $1').trim()}
                      </span>
                      <span className={`font-bold ${getScoreColor(value)}`}>
                        {value}/100
                      </span>
                    </div>
                    <Progress value={value} className="h-2" />
                  </CardContent>
                </Card>)}
            </div>

            {/* Priority Actions */}
            {auditData.priorityActions.length > 0 && <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Target className="w-5 h-5 text-red-600" />
                    Priority Actions
                  </CardTitle>
                  <CardDescription>
                    High-impact improvements for immediate attention
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {auditData.priorityActions.slice(0, 3).map((finding, index) => <div key={index} className="flex items-start gap-3 p-3 border rounded-lg">
                        {getFindingIcon(finding.type)}
                        <div className="flex-1">
                          <h4 className="font-medium">{finding.title}</h4>
                          <p className="text-sm text-gray-600 mb-2">{finding.description}</p>
                          {finding.actionable && <p className="text-sm text-blue-600 font-medium">
                              💡 {finding.actionable}
                            </p>}
                        </div>
                        <Badge className={getImpactColor(finding.impact)}>
                          {finding.impact} impact
                        </Badge>
                      </div>)}
                  </div>
                </CardContent>
              </Card>}
          </TabsContent>

          <TabsContent value="findings" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Detailed Findings</CardTitle>
                <CardDescription>
                  Complete analysis results categorized by area
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {['ai-optimization', 'content', 'technical', 'performance'].map(category => {
                const categoryFindings = auditData.findings.filter(f => f.category === category);
                if (categoryFindings.length === 0) return null;
                return <div key={category} className="space-y-3">
                        <h3 className="font-semibold text-lg capitalize border-b pb-2">
                          {category.replace('-', ' ')} ({categoryFindings.length})
                        </h3>
                        {categoryFindings.map((finding, index) => <div key={index} className="flex items-start gap-3 p-3 border rounded-lg">
                            {getFindingIcon(finding.type)}
                            <div className="flex-1">
                              <div className="flex items-center justify-between mb-2">
                                <h4 className="font-medium">{finding.title}</h4>
                                <Badge className={getImpactColor(finding.impact)}>
                                  {finding.impact}
                                </Badge>
                              </div>
                              <p className="text-sm text-gray-600">{finding.description}</p>
                              {finding.actionable && <p className="text-sm text-blue-600 font-medium mt-2">
                                  💡 {finding.actionable}
                                </p>}
                            </div>
                          </div>)}
                      </div>;
              })}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="recommendations" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Zap className="w-5 h-5 text-yellow-600" />
                  Actionable Recommendations
                </CardTitle>
                <CardDescription>
                  Step-by-step improvements ranked by impact
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {auditData.findings.filter(f => f.actionable).sort((a, b) => (a.priority || 5) - (b.priority || 5)).map((finding, index) => <div key={index} className="p-4 border rounded-lg">
                        <div className="flex items-center justify-between mb-2">
                          <h4 className="font-medium">{finding.title}</h4>
                          <div className="flex items-center gap-2">
                            <Badge className={getImpactColor(finding.impact)}>
                              {finding.impact} impact
                            </Badge>
                            <Badge variant="outline">
                              Priority {finding.priority || 5}
                            </Badge>
                          </div>
                        </div>
                        <p className="text-sm text-gray-600 mb-3">{finding.description}</p>
                        <div className="bg-blue-50 p-3 rounded-lg">
                          <p className="text-sm font-medium text-blue-800">
                            🎯 Action: {finding.actionable}
                          </p>
                        </div>
                      </div>)}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="competitors" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="w-5 h-5 text-green-600" />
                  Competitor Comparison
                </CardTitle>
                <CardDescription>
                  See how you stack up against similar domains
                </CardDescription>
              </CardHeader>
              <CardContent>
                {auditData.competitorComparison.length > 0 ? <div className="space-y-4">
                    {auditData.competitorComparison.map((competitor, index) => <div key={index} className="p-4 border rounded-lg">
                        <div className="flex items-center justify-between mb-3">
                          <h4 className="font-medium">{competitor.domain}</h4>
                          <Badge className={getScoreBg(competitor.overallScore)}>
                            {competitor.overallScore}/100
                          </Badge>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div>
                            <h5 className="font-medium text-green-600 mb-2">Strengths</h5>
                            <ul className="text-sm space-y-1">
                              {competitor.strengths.map((strength, i) => <li key={i} className="flex items-center gap-2">
                                  <CheckCircle className="w-3 h-3 text-green-600" />
                                  {strength}
                                </li>)}
                            </ul>
                          </div>
                          <div>
                            <h5 className="font-medium text-red-600 mb-2">Weaknesses</h5>
                            <ul className="text-sm space-y-1">
                              {competitor.weaknesses.map((weakness, i) => <li key={i} className="flex items-center gap-2">
                                  <XCircle className="w-3 h-3 text-red-600" />
                                  {weakness}
                                </li>)}
                            </ul>
                          </div>
                        </div>
                      </div>)}
                  </div> : <p className="text-gray-500 text-center py-8">
                    Competitor analysis will appear here after running an audit
                  </p>}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="metrics" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {Object.entries(auditData.metrics).map(([key, value]) => <Card key={key}>
                  <CardHeader>
                    <CardTitle className="capitalize">
                      {key.replace(/([A-Z])/g, ' $1').trim()}
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center justify-between mb-4">
                      <Progress value={value} className="flex-1 mr-4" />
                      <span className={`font-bold text-lg ${getScoreColor(value)}`}>
                        {value}/100
                      </span>
                    </div>
                    <p className="text-sm text-gray-600">
                      {value >= 80 ? 'Excellent performance in this area' : value >= 60 ? 'Good performance with room for improvement' : 'Needs significant improvement'}
                    </p>
                  </CardContent>
                </Card>)}
            </div>
          </TabsContent>
        </Tabs>}
    </div>;
};
export default AIAudit;