import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Target, 
  Search, 
  CheckCircle, 
  AlertCircle, 
  Lightbulb, 
  Copy, 
  RefreshCw,
  Loader2,
  FileText,
  MessageSquare,
  List,
  Hash
} from 'lucide-react';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

interface ZeroClickAnalysis {
  snippetPotential: number;
  answerBoxReadiness: number;
  voiceSearchOptimization: number;
  structuredContentScore: number;
  recommendations: {
    type: 'featured_snippet' | 'answer_box' | 'voice_search' | 'faq';
    title: string;
    description: string;
    priority: 'high' | 'medium' | 'low';
    optimizedContent: string;
  }[];
  optimizedContent: {
    directAnswer: string;
    featuredSnippetVersion: string;
    faqStructure: Array<{ question: string; answer: string }>;
    listFormat: string[];
    voiceSearchFriendly: string;
  };
}

const ZeroClickOptimizer = () => {
  const { user } = useAuth();
  const [content, setContent] = useState('');
  const [targetQuery, setTargetQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const [analysis, setAnalysis] = useState<ZeroClickAnalysis | null>(null);
  const [activeTab, setActiveTab] = useState('analyzer');

  const analyzeZeroClickPotential = async () => {
    if (!content.trim() || !targetQuery.trim()) {
      toast.error('Please enter both content and target query');
      return;
    }

    if (!user) {
      toast.error('Please sign in to analyze zero-click potential');
      return;
    }

    setLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('optimize-zero-click', {
        body: JSON.stringify({
          content: content.trim(),
          target_query: targetQuery.trim(),
          user_id: user.id,
          optimization_level: 'comprehensive'
        })
      });

      if (error) throw error;

      if (data.success) {
        setAnalysis(data.analysis);
        toast.success('Zero-click analysis completed!');
      }
    } catch (error: any) {
      console.error('Zero-click analysis error:', error);
      toast.error(error.message || 'Failed to analyze zero-click potential');
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast.success('Copied to clipboard!');
  };

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-green-500';
    if (score >= 60) return 'text-yellow-500';
    return 'text-red-500';
  };

  const getScoreBg = (score: number) => {
    if (score >= 80) return 'bg-green-500/20';
    if (score >= 60) return 'bg-yellow-500/20';
    return 'bg-red-500/20';
  };

  const getPriorityIcon = (priority: string) => {
    switch (priority) {
      case 'high': return <AlertCircle className="w-4 h-4 text-red-500" />;
      case 'medium': return <Target className="w-4 h-4 text-yellow-500" />;
      default: return <Lightbulb className="w-4 h-4 text-blue-500" />;
    }
  };

  return (
    <div className="container mx-auto p-6 max-w-6xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2 text-matrix-green">Zero-Click Optimizer</h1>
        <p className="text-matrix-green/70">
          Optimize your content for featured snippets, answer boxes, and voice search to capture zero-click traffic.
        </p>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="analyzer">Content Analyzer</TabsTrigger>
          <TabsTrigger value="optimizer">Optimized Versions</TabsTrigger>
          <TabsTrigger value="recommendations">Recommendations</TabsTrigger>
        </TabsList>

        <TabsContent value="analyzer">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card className="content-card">
              <CardHeader>
                <CardTitle className="text-matrix-green flex items-center gap-2">
                  <FileText className="w-5 h-5" />
                  Content Input
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium mb-2 text-matrix-green">
                      Target Query
                    </label>
                    <Input
                      placeholder="What question does your content answer?"
                      value={targetQuery}
                      onChange={(e) => setTargetQuery(e.target.value)}
                      className="bg-secondary border-border"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2 text-matrix-green">
                      Content to Optimize
                    </label>
                    <Textarea
                      placeholder="Paste your content here..."
                      value={content}
                      onChange={(e) => setContent(e.target.value)}
                      className="bg-secondary border-border min-h-[200px]"
                    />
                  </div>
                  <Button 
                    onClick={analyzeZeroClickPotential} 
                    disabled={loading} 
                    className="w-full glow-button text-black font-semibold"
                  >
                    {loading ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        Analyzing Content...
                      </>
                    ) : (
                      <>
                        <Search className="w-4 h-4 mr-2" />
                        Analyze Zero-Click Potential
                      </>
                    )}
                  </Button>
                </div>
              </CardContent>
            </Card>

            {analysis && (
              <Card className="content-card">
                <CardHeader>
                  <CardTitle className="text-matrix-green">Zero-Click Scores</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div>
                      <div className="flex justify-between items-center mb-2">
                        <span className="text-sm text-matrix-green/70">Featured Snippet Potential</span>
                        <span className={`font-semibold ${getScoreColor(analysis.snippetPotential)}`}>
                          {analysis.snippetPotential}%
                        </span>
                      </div>
                      <Progress value={analysis.snippetPotential} className="h-2" />
                    </div>

                    <div>
                      <div className="flex justify-between items-center mb-2">
                        <span className="text-sm text-matrix-green/70">Answer Box Readiness</span>
                        <span className={`font-semibold ${getScoreColor(analysis.answerBoxReadiness)}`}>
                          {analysis.answerBoxReadiness}%
                        </span>
                      </div>
                      <Progress value={analysis.answerBoxReadiness} className="h-2" />
                    </div>

                    <div>
                      <div className="flex justify-between items-center mb-2">
                        <span className="text-sm text-matrix-green/70">Voice Search Optimization</span>
                        <span className={`font-semibold ${getScoreColor(analysis.voiceSearchOptimization)}`}>
                          {analysis.voiceSearchOptimization}%
                        </span>
                      </div>
                      <Progress value={analysis.voiceSearchOptimization} className="h-2" />
                    </div>

                    <div>
                      <div className="flex justify-between items-center mb-2">
                        <span className="text-sm text-matrix-green/70">Structured Content Score</span>
                        <span className={`font-semibold ${getScoreColor(analysis.structuredContentScore)}`}>
                          {analysis.structuredContentScore}%
                        </span>
                      </div>
                      <Progress value={analysis.structuredContentScore} className="h-2" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </TabsContent>

        <TabsContent value="optimizer">
          {analysis ? (
            <div className="space-y-6">
              <Card className="content-card">
                <CardHeader>
                  <CardTitle className="text-matrix-green flex items-center gap-2">
                    <Target className="w-5 h-5" />
                    Direct Answer (40-50 words)
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="bg-secondary/50 p-4 rounded-lg border border-matrix-green/20">
                    <p className="text-matrix-green/90 mb-3">{analysis.optimizedContent.directAnswer}</p>
                    <Button 
                      variant="outline" 
                      size="sm" 
                      onClick={() => copyToClipboard(analysis.optimizedContent.directAnswer)}
                      className="border-matrix-green/30 text-matrix-green hover:bg-matrix-green/10"
                    >
                      <Copy className="w-3 h-3 mr-1" />
                      Copy
                    </Button>
                  </div>
                </CardContent>
              </Card>

              <Card className="content-card">
                <CardHeader>
                  <CardTitle className="text-matrix-green flex items-center gap-2">
                    <List className="w-5 h-5" />
                    Featured Snippet Version
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="bg-secondary/50 p-4 rounded-lg border border-matrix-green/20">
                    <p className="text-matrix-green/90 mb-3 whitespace-pre-wrap">
                      {analysis.optimizedContent.featuredSnippetVersion}
                    </p>
                    <Button 
                      variant="outline" 
                      size="sm" 
                      onClick={() => copyToClipboard(analysis.optimizedContent.featuredSnippetVersion)}
                      className="border-matrix-green/30 text-matrix-green hover:bg-matrix-green/10"
                    >
                      <Copy className="w-3 h-3 mr-1" />
                      Copy
                    </Button>
                  </div>
                </CardContent>
              </Card>

              <Card className="content-card">
                <CardHeader>
                  <CardTitle className="text-matrix-green flex items-center gap-2">
                    <MessageSquare className="w-5 h-5" />
                    FAQ Structure
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {analysis.optimizedContent.faqStructure.map((faq, index) => (
                      <div key={index} className="bg-secondary/50 p-4 rounded-lg border border-matrix-green/20">
                        <h4 className="font-semibold text-matrix-green mb-2">{faq.question}</h4>
                        <p className="text-matrix-green/90 mb-3">{faq.answer}</p>
                        <Button 
                          variant="outline" 
                          size="sm" 
                          onClick={() => copyToClipboard(`Q: ${faq.question}\nA: ${faq.answer}`)}
                          className="border-matrix-green/30 text-matrix-green hover:bg-matrix-green/10"
                        >
                          <Copy className="w-3 h-3 mr-1" />
                          Copy FAQ
                        </Button>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              <Card className="content-card">
                <CardHeader>
                  <CardTitle className="text-matrix-green flex items-center gap-2">
                    <Hash className="w-5 h-5" />
                    Voice Search Friendly Version
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="bg-secondary/50 p-4 rounded-lg border border-matrix-green/20">
                    <p className="text-matrix-green/90 mb-3">{analysis.optimizedContent.voiceSearchFriendly}</p>
                    <Button 
                      variant="outline" 
                      size="sm" 
                      onClick={() => copyToClipboard(analysis.optimizedContent.voiceSearchFriendly)}
                      className="border-matrix-green/30 text-matrix-green hover:bg-matrix-green/10"
                    >
                      <Copy className="w-3 h-3 mr-1" />
                      Copy
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          ) : (
            <Card className="content-card">
              <CardContent className="p-8 text-center">
                <Target className="w-12 h-12 text-matrix-green/50 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-matrix-green mb-2">
                  No Analysis Yet
                </h3>
                <p className="text-matrix-green/70">
                  Run an analysis first to see optimized content versions.
                </p>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="recommendations">
          {analysis ? (
            <Card className="content-card">
              <CardHeader>
                <CardTitle className="text-matrix-green">Optimization Recommendations</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {analysis.recommendations.map((rec, index) => (
                    <div key={index} className="border border-matrix-green/20 rounded-lg p-4">
                      <div className="flex items-start gap-3">
                        {getPriorityIcon(rec.priority)}
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <h4 className="font-semibold text-matrix-green">{rec.title}</h4>
                            <Badge 
                              variant={rec.priority === 'high' ? 'destructive' : 
                                     rec.priority === 'medium' ? 'default' : 'secondary'}
                              className="text-xs"
                            >
                              {rec.priority}
                            </Badge>
                          </div>
                          <p className="text-matrix-green/90 mb-3">{rec.description}</p>
                          {rec.optimizedContent && (
                            <div className="bg-secondary/30 p-3 rounded border">
                              <p className="text-sm text-matrix-green/80 mb-2">Suggested optimization:</p>
                              <p className="text-matrix-green/90 text-sm font-mono">
                                {rec.optimizedContent}
                              </p>
                              <Button 
                                variant="outline" 
                                size="sm" 
                                onClick={() => copyToClipboard(rec.optimizedContent)}
                                className="border-matrix-green/30 text-matrix-green hover:bg-matrix-green/10 mt-2"
                              >
                                <Copy className="w-3 h-3 mr-1" />
                                Copy
                              </Button>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          ) : (
            <Card className="content-card">
              <CardContent className="p-8 text-center">
                <Lightbulb className="w-12 h-12 text-matrix-green/50 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-matrix-green mb-2">
                  No Recommendations Yet
                </h3>
                <p className="text-matrix-green/70">
                  Run an analysis to get personalized optimization recommendations.
                </p>
              </CardContent>
            </Card>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default ZeroClickOptimizer;