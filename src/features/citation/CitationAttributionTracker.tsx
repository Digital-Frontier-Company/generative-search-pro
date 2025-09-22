import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Progress } from '@/components/ui/progress';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import { useDomain } from '@/contexts/DomainContext';
import { useAuth } from '@/contexts/AuthContext';
import { 
  FileText, 
  Search, 
  TrendingUp,
  TrendingDown,
  Target,
  RefreshCw,
  BarChart3,
  Lightbulb,
  AlertCircle,
  CheckCircle,
  ExternalLink,
  Calendar,
  Zap,
  Quote,
  Hash,
  Award,
  Eye,
  Settings,
  Copy,
  Download,
  Filter,
  ArrowUp,
  ArrowDown,
  Minus
} from 'lucide-react';

interface ProcessedSentence {
  id: string;
  text: string;
  position: number;
  wordCount: number;
  hasFactualClaim: boolean;
  hasStatistic: boolean;
  hasQuote: boolean;
  hasDefinition: boolean;
  citationPotential: number;
  topicTags: string[];
  entityMentions: string[];
  semanticFingerprint: string;
}

interface SentenceAttribution {
  sentenceId: string;
  originalSentence: string;
  normalizedSentence: string;
  citationInstances: CitationInstance[];
  citationCount: number;
  citationScore: number;
  semanticMatches: SemanticMatch[];
  contextualRelevance: number;
  authoritySignals: string[];
  improvementSuggestions: string[];
  lastCited: string | null;
  trending: 'up' | 'down' | 'stable';
}

interface CitationInstance {
  id: string;
  source: 'google-sge' | 'bing-copilot' | 'chatgpt' | 'claude' | 'perplexity' | 'voice-assistant';
  query: string;
  aiAnswer: string;
  citedPortion: string;
  contextBefore: string;
  contextAfter: string;
  matchType: 'exact' | 'paraphrased' | 'semantic' | 'conceptual';
  matchConfidence: number;
  position: number;
  citedAt: string;
  language: string;
  region: string;
}

interface SemanticMatch {
  aiPlatform: string;
  similarSentence: string;
  semanticSimilarity: number;
  conceptualOverlap: string[];
  potentialCitation: boolean;
}

interface ContentAnalysis {
  url: string;
  domain: string;
  title: string;
  sentences: ProcessedSentence[];
  totalSentences: number;
  citableSentences: number;
  citationPotentialScore: number;
  contentQualityScore: number;
  authoritySignals: AuthoritySignal[];
  topicClusters: TopicCluster[];
  optimizationRecommendations: OptimizationRecommendation[];
}

interface AuthoritySignal {
  type: 'statistic' | 'expert-quote' | 'research-finding' | 'definition' | 'methodology' | 'case-study';
  sentence: string;
  authority: string;
  credibility: number;
}

interface TopicCluster {
  topic: string;
  sentences: string[];
  citationFrequency: number;
  competitiveAdvantage: number;
}

interface OptimizationRecommendation {
  sentenceId: string;
  type: 'enhance-authority' | 'add-statistics' | 'improve-clarity' | 'increase-specificity' | 'add-context';
  recommendation: string;
  expectedImpact: number;
  implementation: string;
}

interface AnalysisResults {
  analysis: ContentAnalysis;
  sentenceAttributions: SentenceAttribution[];
  insights: {
    highPotentialSentences: number;
    lowPotentialSentences: number;
    averageCitationPotential: number;
    strongestTopics: TopicCluster[];
    improvementOpportunities: number;
  };
  analyzedAt: string;
}

const CitationAttributionTracker = () => {
  const { defaultDomain } = useDomain();
  const { user } = useAuth();
  const [url, setUrl] = useState('');
  const [content, setContent] = useState('');
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState<AnalysisResults | null>(null);
  const [selectedView, setSelectedView] = useState<'overview' | 'sentences' | 'attributions' | 'optimization'>('overview');
  const [selectedSentence, setSelectedSentence] = useState<string | null>(null);
  const [sortBy, setSortBy] = useState<'position' | 'potential' | 'citations'>('potential');
  const [filterBy, setFilterBy] = useState<'all' | 'high-potential' | 'cited' | 'needs-work'>('all');
  
  // Options
  const [includeOptimization, setIncludeOptimization] = useState(true);
  const [includeSemanticAnalysis, setIncludeSemanticAnalysis] = useState(true);
  const [trackCitations, setTrackCitations] = useState(true);

  useEffect(() => {
    if (defaultDomain && !url) {
      setUrl(`https://${defaultDomain}`);
    }
  }, [defaultDomain, url]);

  const analyzeContentAttribution = async () => {
    if (!url && !content) {
      toast.error('Please enter either a URL or paste content to analyze');
      return;
    }

    try {
      setLoading(true);
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        toast.error('Please sign in to analyze content attribution');
        return;
      }

      const { data, error } = await supabase.functions.invoke('citation-attribution-tracker', {
        body: JSON.stringify({
          action: 'analyze_content_attribution',
          url: url || undefined,
          content: content || undefined,
          user_id: user.id,
          include_optimization: includeOptimization,
          include_semantic_analysis: includeSemanticAnalysis,
          track_citations: trackCitations
        })
      });

      if (error) throw error;

      setResults(data);
      
      const citedSentences = data.sentenceAttributions.filter((s: SentenceAttribution) => s.citationCount > 0).length;
      const highPotential = data.insights.highPotentialSentences;
      
      if (citedSentences > 0) {
        toast.success(`🎯 Analysis complete! Found ${citedSentences} cited sentences and ${highPotential} high-potential sentences`);
      } else {
        toast.info(`📊 Analysis complete! Identified ${highPotential} sentences with high citation potential and ${data.insights.improvementOpportunities} optimization opportunities`);
      }

    } catch (error: unknown) {
      console.error('Attribution analysis error:', error);
      const errMessage = error instanceof Error ? error.message : 'Failed to analyze content attribution';
      toast.error(errMessage);
    } finally {
      setLoading(false);
    }
  };

  const getAuthorityIcon = (type: string) => {
    switch (type) {
      case 'statistic': return <Hash className="w-4 h-4" />;
      case 'expert-quote': return <Quote className="w-4 h-4" />;
      case 'research-finding': return <Search className="w-4 h-4" />;
      case 'definition': return <FileText className="w-4 h-4" />;
      case 'methodology': return <Settings className="w-4 h-4" />;
      case 'case-study': return <Award className="w-4 h-4" />;
      default: return <CheckCircle className="w-4 h-4" />;
    }
  };

  const getPotentialColor = (score: number) => {
    if (score >= 80) return 'text-green-600 bg-green-50 border-green-200';
    if (score >= 60) return 'text-yellow-600 bg-yellow-50 border-yellow-200';
    if (score >= 40) return 'text-orange-600 bg-orange-50 border-orange-200';
    return 'text-red-600 bg-red-50 border-red-200';
  };

  const getTrendingIcon = (trending: string) => {
    switch (trending) {
      case 'up': return <ArrowUp className="w-4 h-4 text-green-500" />;
      case 'down': return <ArrowDown className="w-4 h-4 text-red-500" />;
      case 'stable': return <Minus className="w-4 h-4 text-gray-500" />;
      default: return <Minus className="w-4 h-4 text-gray-500" />;
    }
  };

  const getOptimizationIcon = (type: string) => {
    switch (type) {
      case 'add-statistics': return <Hash className="w-4 h-4" />;
      case 'enhance-authority': return <Award className="w-4 h-4" />;
      case 'improve-clarity': return <Eye className="w-4 h-4" />;
      case 'increase-specificity': return <Target className="w-4 h-4" />;
      case 'add-context': return <FileText className="w-4 h-4" />;
      default: return <Lightbulb className="w-4 h-4" />;
    }
  };

  const getSourceIcon = (source: string) => {
    switch (source) {
      case 'google-sge': return '🔍';
      case 'bing-copilot': return '🤖';
      case 'chatgpt': return '💬';
      case 'claude': return '🧠';
      case 'perplexity': return '🔮';
      case 'voice-assistant': return '🎤';
      default: return '🌐';
    }
  };

  const filteredSentences = results?.analysis.sentences.filter(sentence => {
    const attribution = results.sentenceAttributions.find(a => a.sentenceId === sentence.id);
    
    switch (filterBy) {
      case 'high-potential':
        return sentence.citationPotential >= 80;
      case 'cited':
        return attribution && attribution.citationCount > 0;
      case 'needs-work':
        return sentence.citationPotential < 60;
      default:
        return true;
    }
  }).sort((a, b) => {
    switch (sortBy) {
      case 'position':
        return a.position - b.position;
      case 'potential':
        return b.citationPotential - a.citationPotential;
      case 'citations':
        const aAttribution = results?.sentenceAttributions.find(attr => attr.sentenceId === a.id);
        const bAttribution = results?.sentenceAttributions.find(attr => attr.sentenceId === b.id);
        return (bAttribution?.citationCount || 0) - (aAttribution?.citationCount || 0);
      default:
        return 0;
    }
  }) || [];

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast.success('Copied to clipboard!');
  };

  return (
    <div className="max-w-7xl mx-auto p-6 space-y-6">
      <div className="text-center">
        <h1 className="text-3xl font-bold text-gray-900 mb-2 flex items-center justify-center gap-2">
          <Target className="w-8 h-8 text-blue-600" />
          Citation Attribution Tracker
        </h1>
        <p className="text-gray-600">
          Track exactly which sentences get cited by AI systems and optimize your content for maximum citation potential
        </p>
      </div>

      {/* Input Section */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="w-5 h-5" />
            Content Attribution Analysis
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-2">Content URL</label>
              <Input
                placeholder="https://yourdomain.com/article"
                value={url}
                onChange={(e) => setUrl(e.target.value)}
              />
              <p className="text-xs text-gray-500 mt-1">
                We'll extract and analyze the content automatically
              </p>
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Or Paste Content</label>
              <textarea
                className="w-full border border-gray-300 rounded-md p-2 h-20 text-sm"
                placeholder="Paste your content here for analysis..."
                value={content}
                onChange={(e) => setContent(e.target.value)}
              />
            </div>
          </div>

          <div className="flex gap-6">
            <label className="flex items-center space-x-2 cursor-pointer">
              <input
                type="checkbox"
                checked={includeOptimization}
                onChange={(e) => setIncludeOptimization(e.target.checked)}
                className="rounded border-gray-300"
              />
              <span className="text-sm">Include optimization recommendations</span>
            </label>
            <label className="flex items-center space-x-2 cursor-pointer">
              <input
                type="checkbox"
                checked={includeSemanticAnalysis}
                onChange={(e) => setIncludeSemanticAnalysis(e.target.checked)}
                className="rounded border-gray-300"
              />
              <span className="text-sm">Include semantic analysis</span>
            </label>
            <label className="flex items-center space-x-2 cursor-pointer">
              <input
                type="checkbox"
                checked={trackCitations}
                onChange={(e) => setTrackCitations(e.target.checked)}
                className="rounded border-gray-300"
              />
              <span className="text-sm">Track existing citations</span>
            </label>
          </div>

          <Button 
            onClick={analyzeContentAttribution} 
            disabled={loading || (!url && !content)}
            className="w-full"
          >
            {loading ? (
              <>
                <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                Analyzing Content Attribution...
              </>
            ) : (
              <>
                <Target className="w-4 h-4 mr-2" />
                Analyze Citation Attribution
              </>
            )}
          </Button>
        </CardContent>
      </Card>

      {/* Results Section */}
      {results && (
        <div className="space-y-6">
          {/* Overview Cards */}
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
            <Card>
              <CardContent className="p-4 text-center">
                <div className="text-2xl font-bold text-blue-600">{results.analysis.totalSentences}</div>
                <div className="text-sm text-gray-500">Total Sentences</div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4 text-center">
                <div className="text-2xl font-bold text-green-600">{results.analysis.citableSentences}</div>
                <div className="text-sm text-gray-500">Highly Citable</div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4 text-center">
                <div className="text-2xl font-bold text-purple-600">
                  {results.sentenceAttributions.filter(s => s.citationCount > 0).length}
                </div>
                <div className="text-sm text-gray-500">Currently Cited</div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4 text-center">
                <div className={`text-2xl font-bold ${results.analysis.citationPotentialScore >= 70 ? 'text-green-600' : results.analysis.citationPotentialScore >= 50 ? 'text-yellow-600' : 'text-red-600'}`}>
                  {results.analysis.citationPotentialScore}%
                </div>
                <div className="text-sm text-gray-500">Citation Potential</div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4 text-center">
                <div className="text-2xl font-bold text-orange-600">{results.insights.improvementOpportunities}</div>
                <div className="text-sm text-gray-500">Optimization Ops</div>
              </CardContent>
            </Card>
          </div>

          {/* Content Overview */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span>Content Analysis: {results.analysis.title}</span>
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <ExternalLink className="w-4 h-4" />
                  <span>{results.analysis.domain}</span>
                </div>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h4 className="font-medium mb-3">Content Quality Metrics</h4>
                  <div className="space-y-3">
                    <div>
                      <div className="flex justify-between text-sm mb-1">
                        <span>Citation Potential</span>
                        <span>{results.analysis.citationPotentialScore}%</span>
                      </div>
                      <Progress value={results.analysis.citationPotentialScore} />
                    </div>
                    <div>
                      <div className="flex justify-between text-sm mb-1">
                        <span>Content Quality</span>
                        <span>{results.analysis.contentQualityScore}%</span>
                      </div>
                      <Progress value={results.analysis.contentQualityScore} />
                    </div>
                    <div>
                      <div className="flex justify-between text-sm mb-1">
                        <span>Average Sentence Potential</span>
                        <span>{Math.round(results.insights.averageCitationPotential)}%</span>
                      </div>
                      <Progress value={results.insights.averageCitationPotential} />
                    </div>
                  </div>
                </div>
                <div>
                  <h4 className="font-medium mb-3">Authority Signals ({results.analysis.authoritySignals.length})</h4>
                  <div className="space-y-2">
                    {results.analysis.authoritySignals.slice(0, 5).map((signal, index) => (
                      <div key={index} className="flex items-center gap-2 p-2 bg-gray-50 rounded">
                        {getAuthorityIcon(signal.type)}
                        <div className="flex-1">
                          <div className="text-sm font-medium capitalize">{signal.type.replace('-', ' ')}</div>
                          <div className="text-xs text-gray-600">{signal.authority}</div>
                        </div>
                        <Badge variant="outline">{signal.credibility}%</Badge>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* View Toggle */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Detailed Analysis</CardTitle>
                <div className="flex gap-2">
                  {(['overview', 'sentences', 'attributions', 'optimization'] as const).map((view) => (
                    <Button
                      key={view}
                      variant={selectedView === view ? "default" : "outline"}
                      size="sm"
                      onClick={() => setSelectedView(view)}
                    >
                      {view === 'overview' && <BarChart3 className="w-3 h-3 mr-1" />}
                      {view === 'sentences' && <FileText className="w-3 h-3 mr-1" />}
                      {view === 'attributions' && <Target className="w-3 h-3 mr-1" />}
                      {view === 'optimization' && <Lightbulb className="w-3 h-3 mr-1" />}
                      {view.charAt(0).toUpperCase() + view.slice(1)}
                    </Button>
                  ))}
                </div>
              </div>
            </CardHeader>
            <CardContent>
              {/* Overview Tab */}
              {selectedView === 'overview' && (
                <div className="space-y-6">
                  {/* Topic Clusters */}
                  <div>
                    <h4 className="font-medium mb-3">Topic Clusters</h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                      {results.analysis.topicClusters.map((cluster, index) => (
                        <div key={index} className="border rounded-lg p-4">
                          <div className="flex items-center justify-between mb-2">
                            <h5 className="font-medium capitalize">{cluster.topic}</h5>
                            <Badge variant="outline">{cluster.citationFrequency}% potential</Badge>
                          </div>
                          <p className="text-xs text-gray-600 mb-2">
                            {cluster.sentences.length} sentences • {cluster.competitiveAdvantage}% advantage
                          </p>
                          <div className="text-xs text-gray-500">
                            "{cluster.sentences[0]?.substring(0, 60)}..."
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Insights Summary */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <h4 className="font-medium mb-3 flex items-center gap-2">
                        <TrendingUp className="w-4 h-4 text-green-500" />
                        Strongest Performance
                      </h4>
                      <div className="space-y-2">
                        <div className="p-3 bg-green-50 rounded border-l-4 border-green-400">
                          <div className="font-medium text-green-800">
                            {results.insights.highPotentialSentences} High-Potential Sentences
                          </div>
                          <div className="text-sm text-green-700">
                            Strong foundation for AI citations
                          </div>
                        </div>
                        <div className="p-3 bg-blue-50 rounded border-l-4 border-blue-400">
                          <div className="font-medium text-blue-800">
                            {results.analysis.authoritySignals.length} Authority Signals
                          </div>
                          <div className="text-sm text-blue-700">
                            Credible sources and data points
                          </div>
                        </div>
                      </div>
                    </div>
                    <div>
                      <h4 className="font-medium mb-3 flex items-center gap-2">
                        <AlertCircle className="w-4 h-4 text-orange-500" />
                        Improvement Areas
                      </h4>
                      <div className="space-y-2">
                        <div className="p-3 bg-orange-50 rounded border-l-4 border-orange-400">
                          <div className="font-medium text-orange-800">
                            {results.insights.lowPotentialSentences} Low-Potential Sentences
                          </div>
                          <div className="text-sm text-orange-700">
                            Need optimization for better citations
                          </div>
                        </div>
                        <div className="p-3 bg-red-50 rounded border-l-4 border-red-400">
                          <div className="font-medium text-red-800">
                            {results.insights.improvementOpportunities} Optimization Opportunities
                          </div>
                          <div className="text-sm text-red-700">
                            Clear areas for content enhancement
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Sentences Tab */}
              {selectedView === 'sentences' && (
                <div className="space-y-4">
                  {/* Filters and Sorting */}
                  <div className="flex gap-4 items-center">
                    <div>
                      <select
                        className="border border-gray-300 rounded-md p-2"
                        value={filterBy}
                        onChange={(e) => setFilterBy(e.target.value as any)}
                      >
                        <option value="all">All Sentences</option>
                        <option value="high-potential">High Potential (80%+)</option>
                        <option value="cited">Currently Cited</option>
                        <option value="needs-work">Needs Work (&lt;60%)</option>
                      </select>
                    </div>
                    <div>
                      <select
                        className="border border-gray-300 rounded-md p-2"
                        value={sortBy}
                        onChange={(e) => setSortBy(e.target.value as any)}
                      >
                        <option value="potential">By Citation Potential</option>
                        <option value="position">By Position</option>
                        <option value="citations">By Citation Count</option>
                      </select>
                    </div>
                    <Badge variant="outline">
                      {filteredSentences.length} sentences
                    </Badge>
                  </div>

                  {/* Sentence List */}
                  <div className="space-y-3">
                    {filteredSentences.map((sentence, index) => {
                      const attribution = results.sentenceAttributions.find(a => a.sentenceId === sentence.id);
                      return (
                        <Card key={sentence.id} className={`border-l-4 ${getPotentialColor(sentence.citationPotential).includes('green') ? 'border-l-green-500' : getPotentialColor(sentence.citationPotential).includes('yellow') ? 'border-l-yellow-500' : getPotentialColor(sentence.citationPotential).includes('orange') ? 'border-l-orange-500' : 'border-l-red-500'}`}>
                          <CardHeader className="pb-3">
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-3">
                                <Badge variant="outline">#{sentence.position}</Badge>
                                <div className="flex items-center gap-2">
                                   {sentence.hasStatistic && <Hash className="w-4 h-4 text-blue-500" />}
                                   {sentence.hasQuote && <Quote className="w-4 h-4 text-purple-500" />}
                                   {sentence.hasFactualClaim && <CheckCircle className="w-4 h-4 text-green-500" />}
                                   {sentence.hasDefinition && <FileText className="w-4 h-4 text-orange-500" />}
                                </div>
                              </div>
                              <div className="flex items-center gap-2">
                                {attribution && attribution.citationCount > 0 && (
                                  <>
                                    <Badge variant="default">{attribution.citationCount} citations</Badge>
                                    {getTrendingIcon(attribution.trending)}
                                  </>
                                )}
                                <Badge className={getPotentialColor(sentence.citationPotential)}>
                                  {sentence.citationPotential}% potential
                                </Badge>
                                <Button
                                  size="sm"
                                  variant="ghost"
                                  onClick={() => copyToClipboard(sentence.text)}
                                >
                                  <Copy className="w-3 h-3" />
                                </Button>
                              </div>
                            </div>
                          </CardHeader>
                          <CardContent className="space-y-3">
                            <p className="text-sm text-gray-700">{sentence.text}</p>
                            
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                              <div>
                                <h6 className="font-medium text-xs mb-1">Content Features</h6>
                                <p className="text-xs text-gray-600">
                                  {sentence.wordCount} words • {sentence.entityMentions.length} entities
                                </p>
                              </div>
                              <div>
                                <h6 className="font-medium text-xs mb-1">Topic Tags</h6>
                                <div className="flex flex-wrap gap-1">
                                  {sentence.topicTags.slice(0, 3).map((tag, i) => (
                                    <span key={i} className="text-xs bg-gray-100 text-gray-700 px-1 py-0.5 rounded">
                                      {tag}
                                    </span>
                                  ))}
                                </div>
                              </div>
                              <div>
                                <h6 className="font-medium text-xs mb-1">Authority Signals</h6>
                                <p className="text-xs text-gray-600">
                                  {attribution?.authoritySignals.length || 0} signals detected
                                </p>
                              </div>
                            </div>

                            {attribution && attribution.improvementSuggestions.length > 0 && (
                              <div>
                                <h6 className="font-medium text-xs mb-1">Improvement Suggestions</h6>
                                <ul className="text-xs text-gray-600 space-y-1">
                                  {attribution.improvementSuggestions.slice(0, 2).map((suggestion, i) => (
                                    <li key={i} className="flex items-start gap-1">
                                      <Lightbulb className="w-3 h-3 text-yellow-500 mt-0.5 flex-shrink-0" />
                                      {suggestion}
                                    </li>
                                  ))}
                                </ul>
                              </div>
                            )}

                            {attribution && attribution.citationInstances.length > 0 && (
                              <div>
                                <h6 className="font-medium text-xs mb-1">Recent Citations</h6>
                                <div className="space-y-1">
                                  {attribution.citationInstances.slice(0, 2).map((instance, i) => (
                                    <div key={i} className="text-xs bg-blue-50 p-2 rounded">
                                      <div className="flex items-center gap-2 mb-1">
                                        <span>{getSourceIcon(instance.source)}</span>
                                        <span className="font-medium">{instance.source}</span>
                                        <Badge variant="outline" className="text-xs">
                                          {instance.matchConfidence}% match
                                        </Badge>
                                      </div>
                                      <p className="text-gray-600">"{instance.query}"</p>
                                    </div>
                                  ))}
                                </div>
                              </div>
                            )}
                          </CardContent>
                        </Card>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Attributions Tab */}
              {selectedView === 'attributions' && (
                <div className="space-y-4">
                  <div className="text-center py-8">
                    <Target className="w-12 h-12 mx-auto mb-4 text-gray-400" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">Citation Attribution Tracking</h3>
                    <p className="text-gray-600 mb-4">
                      Track how your sentences are being cited across AI platforms in real-time.
                    </p>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div className="text-center p-4 border rounded-lg">
                        <div className="text-2xl font-bold text-blue-600">
                          {results.sentenceAttributions.filter(s => s.citationCount > 0).length}
                        </div>
                        <div className="text-sm text-gray-500">Sentences Cited</div>
                      </div>
                      <div className="text-center p-4 border rounded-lg">
                        <div className="text-2xl font-bold text-green-600">
                          {results.sentenceAttributions.reduce((sum, s) => sum + s.citationCount, 0)}
                        </div>
                        <div className="text-sm text-gray-500">Total Citations</div>
                      </div>
                      <div className="text-center p-4 border rounded-lg">
                        <div className="text-2xl font-bold text-purple-600">
                          {results.sentenceAttributions.filter(s => s.trending === 'up').length}
                        </div>
                        <div className="text-sm text-gray-500">Trending Up</div>
                      </div>
                    </div>
                  </div>

                  {/* Top Cited Sentences */}
                  {results.sentenceAttributions.filter(s => s.citationCount > 0).length > 0 && (
                    <div>
                      <h4 className="font-medium mb-3">Top Cited Sentences</h4>
                      <div className="space-y-3">
                        {results.sentenceAttributions
                          .filter(s => s.citationCount > 0)
                          .sort((a, b) => b.citationCount - a.citationCount)
                          .slice(0, 5)
                          .map((attribution, index) => (
                            <Card key={attribution.sentenceId}>
                              <CardContent className="p-4">
                                <div className="flex items-center justify-between mb-3">
                                  <Badge variant="default">{attribution.citationCount} citations</Badge>
                                  <div className="flex items-center gap-2">
                                    {getTrendingIcon(attribution.trending)}
                                    <span className="text-sm text-gray-500">
                                      {attribution.lastCited && new Date(attribution.lastCited).toLocaleDateString()}
                                    </span>
                                  </div>
                                </div>
                                <p className="text-sm text-gray-700 mb-3">{attribution.originalSentence}</p>
                                
                                {attribution.citationInstances.length > 0 && (
                                  <div>
                                    <h6 className="font-medium text-xs mb-2">Citation Sources</h6>
                                    <div className="flex flex-wrap gap-2">
                                      {attribution.citationInstances.map((instance, i) => (
                                        <div key={i} className="flex items-center gap-1 text-xs bg-gray-100 px-2 py-1 rounded">
                                          <span>{getSourceIcon(instance.source)}</span>
                                          <span>{instance.source}</span>
                                        </div>
                                      ))}
                                    </div>
                                  </div>
                                )}
                              </CardContent>
                            </Card>
                          ))}
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* Optimization Tab */}
              {selectedView === 'optimization' && (
                <div className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <h4 className="font-medium mb-3 flex items-center gap-2">
                        <Lightbulb className="w-4 h-4 text-yellow-500" />
                        Optimization Recommendations
                      </h4>
                      <div className="space-y-3">
                        {results.analysis.optimizationRecommendations.slice(0, 5).map((rec, index) => (
                          <Card key={index}>
                            <CardContent className="p-4">
                              <div className="flex items-center justify-between mb-2">
                                <div className="flex items-center gap-2">
                                  {getOptimizationIcon(rec.type)}
                                  <span className="font-medium text-sm capitalize">{rec.type.replace('-', ' ')}</span>
                                </div>
                                <Badge variant="outline">+{rec.expectedImpact}%</Badge>
                              </div>
                              <p className="text-sm text-gray-700 mb-2">{rec.recommendation}</p>
                              <p className="text-xs text-gray-500">{rec.implementation}</p>
                            </CardContent>
                          </Card>
                        ))}
                      </div>
                    </div>

                    <div>
                      <h4 className="font-medium mb-3 flex items-center gap-2">
                        <BarChart3 className="w-4 h-4 text-blue-500" />
                        Performance Summary
                      </h4>
                      <div className="space-y-4">
                        <div className="p-4 border rounded-lg">
                          <h5 className="font-medium mb-2">Current Performance</h5>
                          <div className="space-y-2">
                            <div className="flex justify-between text-sm">
                              <span>High-potential sentences:</span>
                              <span>{results.insights.highPotentialSentences}/{results.analysis.totalSentences}</span>
                            </div>
                            <div className="flex justify-between text-sm">
                              <span>Currently cited:</span>
                              <span>{results.sentenceAttributions.filter(s => s.citationCount > 0).length}/{results.analysis.totalSentences}</span>
                            </div>
                            <div className="flex justify-between text-sm">
                              <span>Authority signals:</span>
                              <span>{results.analysis.authoritySignals.length}</span>
                            </div>
                          </div>
                        </div>

                        <div className="p-4 border rounded-lg bg-green-50">
                          <h5 className="font-medium mb-2 text-green-800">Optimization Potential</h5>
                          <div className="space-y-2">
                            <div className="flex justify-between text-sm text-green-700">
                              <span>Improvement opportunities:</span>
                              <span>{results.insights.improvementOpportunities}</span>
                            </div>
                            <div className="flex justify-between text-sm text-green-700">
                              <span>Estimated citation increase:</span>
                              <span>+{Math.round(results.insights.improvementOpportunities * 2.5)}%</span>
                            </div>
                            <div className="flex justify-between text-sm text-green-700">
                              <span>Implementation effort:</span>
                              <span>2-4 hours</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
};

export default CitationAttributionTracker;