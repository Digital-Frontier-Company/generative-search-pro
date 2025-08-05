import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Server, 
  Code, 
  Zap, 
  CheckCircle, 
  AlertTriangle, 
  X, 
  Clock, 
  Smartphone,
  Search,
  Loader2,
  Globe,
  Shield,
  Database
} from 'lucide-react';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useDomain } from '@/contexts/DomainContext';

interface TechnicalAIReadinessData {
  overallScore: number;
  categories: {
    serverSideRendering: {
      score: number;
      status: 'excellent' | 'good' | 'needs_improvement' | 'critical';
      findings: string[];
      recommendations: string[];
    };
    semanticHTML: {
      score: number;
      status: 'excellent' | 'good' | 'needs_improvement' | 'critical';
      findings: string[];
      recommendations: string[];
    };
    pageSpeed: {
      score: number;
      status: 'excellent' | 'good' | 'needs_improvement' | 'critical';
      findings: string[];
      recommendations: string[];
    };
    mobileOptimization: {
      score: number;
      status: 'excellent' | 'good' | 'needs_improvement' | 'critical';
      findings: string[];
      recommendations: string[];
    };
    aiCrawlerAccess: {
      score: number;
      status: 'excellent' | 'good' | 'needs_improvement' | 'critical';
      findings: string[];
      recommendations: string[];
    };
  };
  priorityActions: Array<{
    category: string;
    action: string;
    impact: 'high' | 'medium' | 'low';
    difficulty: 'easy' | 'medium' | 'hard';
    estimatedTime: string;
  }>;
  lastAnalyzed: string;
}

const TechnicalAIReadiness = () => {
  const { user } = useAuth();
  const { defaultDomain } = useDomain();
  const [domain, setDomain] = useState(defaultDomain || '');
  const [loading, setLoading] = useState(false);
  const [readinessData, setReadinessData] = useState<TechnicalAIReadinessData | null>(null);
  const [activeTab, setActiveTab] = useState('overview');

  useEffect(() => {
    if (defaultDomain && !domain) {
      setDomain(defaultDomain);
    }
  }, [defaultDomain, domain]);

  const analyzeTechnicalReadiness = async () => {
    if (!domain.trim()) {
      toast.error('Please enter a domain to analyze');
      return;
    }

    if (!user) {
      toast.error('Please sign in to analyze technical AI readiness');
      return;
    }

    setLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('analyze-technical-ai-readiness', {
        body: JSON.stringify({
          domain: domain.trim(),
          user_id: user.id,
          comprehensive: true
        })
      });

      if (error) throw error;

      if (data.success) {
        setReadinessData(data.analysis);
        toast.success('Technical AI readiness analysis completed!');
      }
    } catch (error: any) {
      console.error('Technical AI readiness analysis error:', error);
      toast.error(error.message || 'Failed to analyze technical AI readiness');
    } finally {
      setLoading(false);
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'excellent': return <CheckCircle className="w-5 h-5 text-green-500" />;
      case 'good': return <CheckCircle className="w-5 h-5 text-blue-500" />;
      case 'needs_improvement': return <AlertTriangle className="w-5 h-5 text-yellow-500" />;
      case 'critical': return <X className="w-5 h-5 text-red-500" />;
      default: return <AlertTriangle className="w-5 h-5 text-gray-500" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'excellent': return 'text-green-500';
      case 'good': return 'text-blue-500';
      case 'needs_improvement': return 'text-yellow-500';
      case 'critical': return 'text-red-500';
      default: return 'text-gray-500';
    }
  };

  const getScoreColor = (score: number) => {
    if (score >= 90) return 'text-green-500';
    if (score >= 70) return 'text-blue-500';
    if (score >= 50) return 'text-yellow-500';
    return 'text-red-500';
  };

  const getPriorityIcon = (impact: string) => {
    switch (impact) {
      case 'high': return <AlertTriangle className="w-4 h-4 text-red-500" />;
      case 'medium': return <Clock className="w-4 h-4 text-yellow-500" />;
      case 'low': return <CheckCircle className="w-4 h-4 text-green-500" />;
      default: return <Clock className="w-4 h-4 text-gray-500" />;
    }
  };

  const categories = [
    { key: 'serverSideRendering', name: 'Server-Side Rendering', icon: Server },
    { key: 'semanticHTML', name: 'Semantic HTML5', icon: Code },
    { key: 'pageSpeed', name: 'Page Speed', icon: Zap },
    { key: 'mobileOptimization', name: 'Mobile Optimization', icon: Smartphone },
    { key: 'aiCrawlerAccess', name: 'AI Crawler Access', icon: Globe }
  ];

  return (
    <div className="container mx-auto p-6 max-w-6xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2 text-matrix-green">Technical AI Readiness</h1>
        <p className="text-matrix-green/70">
          Analyze your website's technical infrastructure for optimal AI crawler accessibility and processing.
        </p>
      </div>

      <Card className="content-card mb-6">
        <CardHeader>
          <CardTitle className="text-matrix-green flex items-center gap-2">
            <Server className="w-5 h-5" />
            Analyze Technical AI Readiness
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-2 text-matrix-green">Website Domain</label>
              <Input
                placeholder="Enter your domain (e.g., example.com)"
                value={domain}
                onChange={(e) => setDomain(e.target.value)}
                className="bg-secondary border-border"
              />
            </div>
            <Button 
              onClick={analyzeTechnicalReadiness} 
              disabled={loading} 
              className="w-full glow-button text-black font-semibold"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Analyzing Technical Readiness...
                </>
              ) : (
                <>
                  <Search className="w-4 h-4 mr-2" />
                  Analyze Technical AI Readiness
                </>
              )}
            </Button>
          </div>
        </CardContent>
      </Card>

      {readinessData && (
        <div className="space-y-6">
          {/* Overall Score */}
          <Card className="content-card">
            <CardContent className="p-6">
              <div className="text-center">
                <div className={`text-4xl font-bold mb-2 ${getScoreColor(readinessData.overallScore)}`}>
                  {readinessData.overallScore}/100
                </div>
                <p className="text-matrix-green/70 mb-4">Overall Technical AI Readiness Score</p>
                <Progress value={readinessData.overallScore} className="h-3 w-full max-w-md mx-auto" />
              </div>
            </CardContent>
          </Card>

          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="overview">Category Overview</TabsTrigger>
              <TabsTrigger value="priority">Priority Actions</TabsTrigger>
              <TabsTrigger value="details">Detailed Analysis</TabsTrigger>
            </TabsList>

            <TabsContent value="overview">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {categories.map(({ key, name, icon: Icon }) => {
                  const categoryData = readinessData.categories[key];
                  return (
                    <Card key={key} className="content-card">
                      <CardContent className="p-4">
                        <div className="flex items-center justify-between mb-3">
                          <div className="flex items-center gap-2">
                            <Icon className="w-5 h-5 text-matrix-green" />
                            <h3 className="font-semibold text-matrix-green text-sm">{name}</h3>
                          </div>
                          {getStatusIcon(categoryData.status)}
                        </div>
                        <div className="space-y-2">
                          <div className="flex justify-between items-center">
                            <span className="text-sm text-matrix-green/70">Score</span>
                            <span className={`font-bold ${getScoreColor(categoryData.score)}`}>
                              {categoryData.score}/100
                            </span>
                          </div>
                          <Progress value={categoryData.score} className="h-2" />
                          <div className="flex justify-between items-center">
                            <span className="text-sm text-matrix-green/70">Status</span>
                            <Badge 
                              variant={categoryData.status === 'excellent' || categoryData.status === 'good' ? 'default' : 'destructive'}
                              className="text-xs"
                            >
                              {categoryData.status.replace('_', ' ')}
                            </Badge>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            </TabsContent>

            <TabsContent value="priority">
              <Card className="content-card">
                <CardHeader>
                  <CardTitle className="text-matrix-green">Priority Actions</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {readinessData.priorityActions.map((action, index) => (
                      <div key={index} className="border border-matrix-green/20 rounded-lg p-4">
                        <div className="flex items-start gap-3">
                          {getPriorityIcon(action.impact)}
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-2">
                              <h4 className="font-semibold text-matrix-green">{action.category}</h4>
                              <Badge 
                                variant={action.impact === 'high' ? 'destructive' : 
                                       action.impact === 'medium' ? 'default' : 'secondary'}
                                className="text-xs"
                              >
                                {action.impact} impact
                              </Badge>
                              <Badge variant="outline" className="text-xs">
                                {action.difficulty}
                              </Badge>
                            </div>
                            <p className="text-matrix-green/90 mb-2">{action.action}</p>
                            <div className="flex items-center gap-2 text-sm text-matrix-green/70">
                              <Clock className="w-3 h-3" />
                              <span>Estimated time: {action.estimatedTime}</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="details">
              <div className="space-y-6">
                {categories.map(({ key, name, icon: Icon }) => {
                  const categoryData = readinessData.categories[key];
                  return (
                    <Card key={key} className="content-card">
                      <CardHeader>
                        <CardTitle className="text-matrix-green flex items-center gap-2">
                          <Icon className="w-5 h-5" />
                          {name}
                          <Badge 
                            variant={categoryData.status === 'excellent' || categoryData.status === 'good' ? 'default' : 'destructive'}
                            className="ml-auto"
                          >
                            {categoryData.score}/100
                          </Badge>
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-4">
                          {categoryData.findings.length > 0 && (
                            <div>
                              <h4 className="font-semibold text-matrix-green mb-2">Findings</h4>
                              <ul className="space-y-1">
                                {categoryData.findings.map((finding, index) => (
                                  <li key={index} className="text-matrix-green/90 text-sm flex items-start gap-2">
                                    <CheckCircle className="w-3 h-3 text-green-500 mt-1 flex-shrink-0" />
                                    {finding}
                                  </li>
                                ))}
                              </ul>
                            </div>
                          )}
                          
                          {categoryData.recommendations.length > 0 && (
                            <div>
                              <h4 className="font-semibold text-matrix-green mb-2">Recommendations</h4>
                              <ul className="space-y-1">
                                {categoryData.recommendations.map((rec, index) => (
                                  <li key={index} className="text-matrix-green/90 text-sm flex items-start gap-2">
                                    <AlertTriangle className="w-3 h-3 text-yellow-500 mt-1 flex-shrink-0" />
                                    {rec}
                                  </li>
                                ))}
                              </ul>
                            </div>
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            </TabsContent>
          </Tabs>

          <div className="text-center text-sm text-matrix-green/60">
            Last analyzed: {new Date(readinessData.lastAnalyzed).toLocaleString()}
          </div>
        </div>
      )}
    </div>
  );
};

export default TechnicalAIReadiness;