import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Mic, 
  Volume2, 
  MessageSquare, 
  Users, 
  MapPin, 
  Clock,
  CheckCircle, 
  AlertTriangle, 
  Lightbulb, 
  Copy, 
  RefreshCw,
  Loader2,
  Search,
  Headphones,
  Smartphone
} from 'lucide-react';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

interface VoiceSearchAnalysis {
  conversationalScore: number;
  localOptimization: number;
  questionBasedContent: number;
  naturalLanguageScore: number;
  voiceKeywords: {
    keyword: string;
    searchVolume: number;
    difficulty: string;
    intent: 'informational' | 'navigational' | 'transactional' | 'local';
    optimizedVersion: string;
  }[];
  optimizedContent: {
    conversationalVersion: string;
    questionAnswerPairs: Array<{ question: string; answer: string }>;
    localVariations: string[];
    voiceFriendlySnippets: string[];
  };
  recommendations: Array<{
    type: 'conversational' | 'local' | 'technical' | 'content';
    title: string;
    description: string;
    priority: 'high' | 'medium' | 'low';
    optimizedContent: string;
  }>;
}

const VoiceSearchOptimizer = () => {
  const { user } = useAuth();
  const [content, setContent] = useState('');
  const [targetKeywords, setTargetKeywords] = useState('');
  const [businessLocation, setBusinessLocation] = useState('');
  const [loading, setLoading] = useState(false);
  const [analysis, setAnalysis] = useState<VoiceSearchAnalysis | null>(null);
  const [activeTab, setActiveTab] = useState('analyzer');

  const analyzeVoiceSearchOptimization = async () => {
    if (!content.trim()) {
      toast.error('Please enter content to analyze');
      return;
    }

    if (!user) {
      toast.error('Please sign in to analyze voice search optimization');
      return;
    }

    setLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('optimize-voice-search', {
        body: JSON.stringify({
          content: content.trim(),
          target_keywords: targetKeywords.trim(),
          business_location: businessLocation.trim(),
          user_id: user.id,
          comprehensive: true
        })
      });

      if (error) throw error;

      if (data.success) {
        setAnalysis(data.analysis);
        toast.success('Voice search analysis completed!');
      }
    } catch (error: any) {
      console.error('Voice search analysis error:', error);
      toast.error(error.message || 'Failed to analyze voice search optimization');
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

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'easy': return 'bg-green-500/20 text-green-400';
      case 'medium': return 'bg-yellow-500/20 text-yellow-400';
      case 'hard': return 'bg-red-500/20 text-red-400';
      default: return 'bg-gray-500/20 text-gray-400';
    }
  };

  const getIntentIcon = (intent: string) => {
    switch (intent) {
      case 'informational': return <Lightbulb className="w-4 h-4" />;
      case 'navigational': return <MapPin className="w-4 h-4" />;
      case 'transactional': return <Users className="w-4 h-4" />;
      case 'local': return <MapPin className="w-4 h-4" />;
      default: return <Search className="w-4 h-4" />;
    }
  };

  const getPriorityIcon = (priority: string) => {
    switch (priority) {
      case 'high': return <AlertTriangle className="w-4 h-4 text-red-500" />;
      case 'medium': return <Clock className="w-4 h-4 text-yellow-500" />;
      case 'low': return <CheckCircle className="w-4 h-4 text-green-500" />;
      default: return <Clock className="w-4 h-4 text-gray-500" />;
    }
  };

  return (
    <div className="container mx-auto p-6 max-w-6xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2 text-matrix-green">Voice Search Optimizer</h1>
        <p className="text-matrix-green/70">
          Optimize your content for voice search queries and conversational AI assistants.
        </p>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="analyzer">Content Analyzer</TabsTrigger>
          <TabsTrigger value="keywords">Voice Keywords</TabsTrigger>
          <TabsTrigger value="optimizations">Optimizations</TabsTrigger>
          <TabsTrigger value="recommendations">Recommendations</TabsTrigger>
        </TabsList>

        <TabsContent value="analyzer">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card className="content-card">
              <CardHeader>
                <CardTitle className="text-matrix-green flex items-center gap-2">
                  <Mic className="w-5 h-5" />
                  Voice Search Analysis
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium mb-2 text-matrix-green">
                      Content to Optimize
                    </label>
                    <Textarea
                      placeholder="Paste your content here..."
                      value={content}
                      onChange={(e) => setContent(e.target.value)}
                      className="bg-secondary border-border min-h-[150px]"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2 text-matrix-green">
                      Target Keywords (optional)
                    </label>
                    <Input
                      placeholder="Enter keywords separated by commas"
                      value={targetKeywords}
                      onChange={(e) => setTargetKeywords(e.target.value)}
                      className="bg-secondary border-border"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2 text-matrix-green">
                      Business Location (optional)
                    </label>
                    <Input
                      placeholder="e.g., San Francisco, CA"
                      value={businessLocation}
                      onChange={(e) => setBusinessLocation(e.target.value)}
                      className="bg-secondary border-border"
                    />
                  </div>
                  <Button 
                    onClick={analyzeVoiceSearchOptimization} 
                    disabled={loading} 
                    className="w-full glow-button text-black font-semibold"
                  >
                    {loading ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        Analyzing Voice Search...
                      </>
                    ) : (
                      <>
                        <Volume2 className="w-4 h-4 mr-2" />
                        Analyze Voice Search Optimization
                      </>
                    )}
                  </Button>
                </div>
              </CardContent>
            </Card>

            {analysis && (
              <Card className="content-card">
                <CardHeader>
                  <CardTitle className="text-matrix-green">Voice Search Scores</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div>
                      <div className="flex justify-between items-center mb-2">
                        <span className="text-sm text-matrix-green/70">Conversational Score</span>
                        <span className={`font-semibold ${getScoreColor(analysis.conversationalScore)}`}>
                          {analysis.conversationalScore}%
                        </span>
                      </div>
                      <Progress value={analysis.conversationalScore} className="h-2" />
                    </div>

                    <div>
                      <div className="flex justify-between items-center mb-2">
                        <span className="text-sm text-matrix-green/70">Local Optimization</span>
                        <span className={`font-semibold ${getScoreColor(analysis.localOptimization)}`}>
                          {analysis.localOptimization}%
                        </span>
                      </div>
                      <Progress value={analysis.localOptimization} className="h-2" />
                    </div>

                    <div>
                      <div className="flex justify-between items-center mb-2">
                        <span className="text-sm text-matrix-green/70">Question-Based Content</span>
                        <span className={`font-semibold ${getScoreColor(analysis.questionBasedContent)}`}>
                          {analysis.questionBasedContent}%
                        </span>
                      </div>
                      <Progress value={analysis.questionBasedContent} className="h-2" />
                    </div>

                    <div>
                      <div className="flex justify-between items-center mb-2">
                        <span className="text-sm text-matrix-green/70">Natural Language Score</span>
                        <span className={`font-semibold ${getScoreColor(analysis.naturalLanguageScore)}`}>
                          {analysis.naturalLanguageScore}%
                        </span>
                      </div>
                      <Progress value={analysis.naturalLanguageScore} className="h-2" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </TabsContent>

        <TabsContent value="keywords">
          {analysis ? (
            <Card className="content-card">
              <CardHeader>
                <CardTitle className="text-matrix-green flex items-center gap-2">
                  <Headphones className="w-5 h-5" />
                  Voice Search Keywords
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {analysis.voiceKeywords.map((keyword, index) => (
                    <div key={index} className="border border-matrix-green/20 rounded-lg p-4">
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center gap-2">
                          {getIntentIcon(keyword.intent)}
                          <h4 className="font-semibold text-matrix-green">{keyword.keyword}</h4>
                        </div>
                        <div className="flex gap-2">
                          <Badge className={getDifficultyColor(keyword.difficulty)}>
                            {keyword.difficulty}
                          </Badge>
                          <Badge variant="outline" className="border-matrix-green/30 text-matrix-green">
                            {keyword.intent}
                          </Badge>
                        </div>
                      </div>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-3">
                        <div>
                          <p className="text-sm text-matrix-green/70">Search Volume</p>
                          <p className="font-semibold text-matrix-green">{keyword.searchVolume.toLocaleString()}/month</p>
                        </div>
                        <div>
                          <p className="text-sm text-matrix-green/70">Difficulty</p>
                          <p className="font-semibold text-matrix-green capitalize">{keyword.difficulty}</p>
                        </div>
                      </div>

                      <div className="bg-secondary/30 p-3 rounded border">
                        <p className="text-sm text-matrix-green/80 mb-2">Voice-Optimized Version:</p>
                        <p className="text-matrix-green/90 text-sm">{keyword.optimizedVersion}</p>
                        <Button 
                          variant="outline" 
                          size="sm" 
                          onClick={() => copyToClipboard(keyword.optimizedVersion)}
                          className="border-matrix-green/30 text-matrix-green hover:bg-matrix-green/10 mt-2"
                        >
                          <Copy className="w-3 h-3 mr-1" />
                          Copy
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          ) : (
            <Card className="content-card">
              <CardContent className="p-8 text-center">
                <Headphones className="w-12 h-12 text-matrix-green/50 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-matrix-green mb-2">
                  No Keywords Analysis Yet
                </h3>
                <p className="text-matrix-green/70">
                  Run an analysis to see voice search keyword opportunities.
                </p>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="optimizations">
          {analysis ? (
            <div className="space-y-6">
              <Card className="content-card">
                <CardHeader>
                  <CardTitle className="text-matrix-green flex items-center gap-2">
                    <MessageSquare className="w-5 h-5" />
                    Conversational Version
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="bg-secondary/50 p-4 rounded-lg border border-matrix-green/20">
                    <p className="text-matrix-green/90 mb-3 whitespace-pre-wrap">
                      {analysis.optimizedContent.conversationalVersion}
                    </p>
                    <Button 
                      variant="outline" 
                      size="sm" 
                      onClick={() => copyToClipboard(analysis.optimizedContent.conversationalVersion)}
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
                    Question-Answer Pairs
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {analysis.optimizedContent.questionAnswerPairs.map((qa, index) => (
                      <div key={index} className="bg-secondary/50 p-4 rounded-lg border border-matrix-green/20">
                        <h4 className="font-semibold text-matrix-green mb-2">{qa.question}</h4>
                        <p className="text-matrix-green/90 mb-3">{qa.answer}</p>
                        <Button 
                          variant="outline" 
                          size="sm" 
                          onClick={() => copyToClipboard(`Q: ${qa.question}\nA: ${qa.answer}`)}
                          className="border-matrix-green/30 text-matrix-green hover:bg-matrix-green/10"
                        >
                          <Copy className="w-3 h-3 mr-1" />
                          Copy Q&A
                        </Button>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              <Card className="content-card">
                <CardHeader>
                  <CardTitle className="text-matrix-green flex items-center gap-2">
                    <MapPin className="w-5 h-5" />
                    Local Variations
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {analysis.optimizedContent.localVariations.map((variation, index) => (
                      <div key={index} className="bg-secondary/50 p-3 rounded border border-matrix-green/20">
                        <p className="text-matrix-green/90 mb-2">{variation}</p>
                        <Button 
                          variant="outline" 
                          size="sm" 
                          onClick={() => copyToClipboard(variation)}
                          className="border-matrix-green/30 text-matrix-green hover:bg-matrix-green/10"
                        >
                          <Copy className="w-3 h-3 mr-1" />
                          Copy
                        </Button>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              <Card className="content-card">
                <CardHeader>
                  <CardTitle className="text-matrix-green flex items-center gap-2">
                    <Smartphone className="w-5 h-5" />
                    Voice-Friendly Snippets
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {analysis.optimizedContent.voiceFriendlySnippets.map((snippet, index) => (
                      <div key={index} className="bg-secondary/50 p-3 rounded border border-matrix-green/20">
                        <p className="text-matrix-green/90 mb-2">{snippet}</p>
                        <Button 
                          variant="outline" 
                          size="sm" 
                          onClick={() => copyToClipboard(snippet)}
                          className="border-matrix-green/30 text-matrix-green hover:bg-matrix-green/10"
                        >
                          <Copy className="w-3 h-3 mr-1" />
                          Copy
                        </Button>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          ) : (
            <Card className="content-card">
              <CardContent className="p-8 text-center">
                <Volume2 className="w-12 h-12 text-matrix-green/50 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-matrix-green mb-2">
                  No Optimizations Yet
                </h3>
                <p className="text-matrix-green/70">
                  Run an analysis to see voice search optimizations.
                </p>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="recommendations">
          {analysis ? (
            <Card className="content-card">
              <CardHeader>
                <CardTitle className="text-matrix-green">Voice Search Recommendations</CardTitle>
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
                            <Badge variant="outline" className="text-xs border-matrix-green/30 text-matrix-green">
                              {rec.type}
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
                  Run an analysis to get voice search optimization recommendations.
                </p>
              </CardContent>
            </Card>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default VoiceSearchOptimizer;