import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Textarea } from './ui/textarea';
import { Progress } from './ui/progress';
import { toast } from 'sonner';
import { supabase } from '../integrations/supabase/client';
import { useDomain } from '../contexts/DomainContext';
import { useAuth } from '../contexts/AuthContext';
import { 
  Zap, 
  Target, 
  CheckCircle, 
  AlertTriangle,
  TrendingUp,
  Copy,
  Download,
  RefreshCw,
  BookOpen,
  BarChart3,
  Settings
} from 'lucide-react';

interface OptimizationSuggestion {
  type: 'structure' | 'content' | 'format' | 'authority';
  priority: 'high' | 'medium' | 'low';
  title: string;
  description: string;
  implementation: string;
  impact: number;
}

interface OptimizedContent {
  originalLength: number;
  optimizedLength: number;
  optimized_text: string;
  structureChanges: string[];
  contentAdditions: string[];
  formatImprovements: string[];
  authorityEnhancements: string[];
  readabilityScore: number;
  citationPotentialScore: number;
}

interface OptimizationResults {
  target_query: string;
  domain: string;
  original_content: string;
  suggestions: OptimizationSuggestion[];
  optimized_content: OptimizedContent;
  optimization_level: string;
  content_type: string;
  optimized_at: string;
}

const AIAnswerOptimizer = () => {
  const { defaultDomain } = useDomain();
  const { user } = useAuth();
  const [content, setContent] = useState('');
  const [targetQuery, setTargetQuery] = useState('');
  const [domain, setDomain] = useState('');
  const [optimizationLevel, setOptimizationLevel] = useState<'basic' | 'advanced' | 'aggressive'>('advanced');
  const [contentType, setContentType] = useState<'article' | 'faq' | 'howto' | 'review'>('article');
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState<OptimizationResults | null>(null);
  const [activeTab, setActiveTab] = useState<'suggestions' | 'optimized' | 'comparison'>('suggestions');

  useEffect(() => {
    if (defaultDomain && !domain) {
      setDomain(defaultDomain);
    }
  }, [defaultDomain, domain]);

  const optimizeContent = async () => {
    if (!content || !targetQuery || !domain) {
      toast.error('Please fill in all required fields');
      return;
    }

    if (content.length < 100) {
      toast.error('Content must be at least 100 characters long');
      return;
    }

    try {
      setLoading(true);
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        toast.error('Please sign in to optimize content');
        return;
      }

      const { data, error } = await supabase.functions.invoke('ai-answer-optimizer', {
        body: JSON.stringify({
          content,
          target_query: targetQuery,
          domain: domain.replace(/^https?:\/\//, ''),
          user_id: user.id,
          optimization_level: optimizationLevel,
          content_type: contentType
        })
      });

      if (error) throw error;

      setResults(data);
      setActiveTab('suggestions');
      toast.success('Content optimization completed!');

    } catch (error: unknown) {
      console.error('Content optimization error:', error);
      const errMessage = error instanceof Error ? error.message : 'Failed to optimize content';
      toast.error(errMessage);
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast.success('Copied to clipboard!');
  };

  const downloadOptimizedContent = () => {
    if (!results) return;
    
    const content = results.optimized_content.optimized_text;
    const blob = new Blob([content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `optimized-content-${Date.now()}.txt`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'bg-red-100 text-red-800';
      case 'medium': return 'bg-yellow-100 text-yellow-800';
      case 'low': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'structure': return <Settings className="w-4 h-4" />;
      case 'content': return <BookOpen className="w-4 h-4" />;
      case 'format': return <BarChart3 className="w-4 h-4" />;
      case 'authority': return <CheckCircle className="w-4 h-4" />;
      default: return <AlertTriangle className="w-4 h-4" />;
    }
  };

  return (
    <div className="max-w-7xl mx-auto p-6 space-y-6">
      <div className="text-center">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">AI Answer Optimizer</h1>
        <p className="text-gray-600">
          Transform your content to maximize citation chances in AI search results
        </p>
      </div>

      {/* Input Section */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Zap className="w-5 h-5" />
            Content Optimization
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-2">Target Query *</label>
              <Input
                placeholder="What question should this content answer?"
                value={targetQuery}
                onChange={(e) => setTargetQuery(e.target.value)}
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Domain *</label>
              <Input
                placeholder="example.com"
                value={domain}
                onChange={(e) => setDomain(e.target.value)}
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-2">Optimization Level</label>
              <select
                className="w-full border border-gray-300 rounded-md p-2"
                value={optimizationLevel}
                onChange={(e) => setOptimizationLevel(e.target.value as 'basic' | 'advanced' | 'aggressive')}
              >
                <option value="basic">Basic - Light improvements</option>
                <option value="advanced">Advanced - Comprehensive optimization</option>
                <option value="aggressive">Aggressive - Maximum restructuring</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Content Type</label>
              <select
                className="w-full border border-gray-300 rounded-md p-2"
                value={contentType}
                onChange={(e) => setContentType(e.target.value as 'article' | 'faq' | 'howto' | 'review')}
              >
                <option value="article">Article</option>
                <option value="faq">FAQ</option>
                <option value="howto">How-to Guide</option>
                <option value="review">Review</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Content to Optimize *</label>
            <Textarea
              placeholder="Paste your content here (minimum 100 characters)..."
              value={content}
              onChange={(e) => setContent(e.target.value)}
              className="min-h-40"
            />
            <p className="text-xs text-gray-500 mt-1">
              Characters: {content.length} / 50,000
            </p>
          </div>

          <Button 
            onClick={optimizeContent} 
            disabled={loading || !content || !targetQuery || !domain || content.length < 100}
            className="w-full"
          >
            {loading ? (
              <>
                <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                Optimizing Content...
              </>
            ) : (
              <>
                <Target className="w-4 h-4 mr-2" />
                Optimize for AI Citations
              </>
            )}
          </Button>
        </CardContent>
      </Card>

      {/* Results Section */}
      {results && (
        <div className="space-y-6">
          {/* Summary Stats */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Card>
              <CardContent className="p-4 text-center">
                <div className="text-2xl font-bold text-blue-600">
                  {results.suggestions.length}
                </div>
                <div className="text-sm text-gray-500">Suggestions</div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4 text-center">
                <div className="text-2xl font-bold text-green-600">
                  {results.optimized_content.citationPotentialScore}%
                </div>
                <div className="text-sm text-gray-500">Citation Potential</div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4 text-center">
                <div className="text-2xl font-bold text-orange-600">
                  {results.optimized_content.readabilityScore}%
                </div>
                <div className="text-sm text-gray-500">Readability</div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4 text-center">
                <div className="text-2xl font-bold text-purple-600">
                  {Math.round((results.optimized_content.optimizedLength / results.optimized_content.originalLength) * 100)}%
                </div>
                <div className="text-sm text-gray-500">Length Change</div>
              </CardContent>
            </Card>
          </div>

          {/* Tab Navigation */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Optimization Results</CardTitle>
                <div className="flex gap-2">
                  <Button
                    variant={activeTab === 'suggestions' ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setActiveTab('suggestions')}
                  >
                    Suggestions
                  </Button>
                  <Button
                    variant={activeTab === 'optimized' ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setActiveTab('optimized')}
                  >
                    Optimized Content
                  </Button>
                  <Button
                    variant={activeTab === 'comparison' ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setActiveTab('comparison')}
                  >
                    Comparison
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              {activeTab === 'suggestions' && (
                <div className="space-y-4">
                  {results.suggestions.map((suggestion, index) => (
                    <div key={index} className="border rounded-lg p-4 space-y-3">
                      <div className="flex items-start justify-between">
                        <div className="flex items-center gap-3">
                          {getTypeIcon(suggestion.type)}
                          <h3 className="font-medium">{suggestion.title}</h3>
                          <Badge className={getPriorityColor(suggestion.priority)}>
                            {suggestion.priority}
                          </Badge>
                        </div>
                        <div className="flex items-center gap-1">
                          <TrendingUp className="w-4 h-4 text-green-500" />
                          <span className="text-sm font-medium text-green-600">
                            +{suggestion.impact}% impact
                          </span>
                        </div>
                      </div>
                      <p className="text-gray-600">{suggestion.description}</p>
                      <div className="bg-blue-50 p-3 rounded border-l-4 border-blue-400">
                        <p className="text-sm text-blue-800">{suggestion.implementation}</p>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {activeTab === 'optimized' && (
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <h3 className="text-lg font-medium">Optimized Content</h3>
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => copyToClipboard(results.optimized_content.optimized_text)}
                      >
                        <Copy className="w-4 h-4 mr-1" />
                        Copy
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={downloadOptimizedContent}
                      >
                        <Download className="w-4 h-4 mr-1" />
                        Download
                      </Button>
                    </div>
                  </div>
                  
                  <div className="bg-gray-50 p-4 rounded-lg max-h-96 overflow-y-auto">
                    <pre className="whitespace-pre-wrap text-sm text-gray-800">
                      {results.optimized_content.optimized_text}
                    </pre>
                  </div>

                  {/* Improvements Summary */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6">
                    <div>
                      <h4 className="font-medium mb-2">Structure Changes</h4>
                      <ul className="text-sm text-gray-600 space-y-1">
                        {results.optimized_content.structureChanges.map((change, i) => (
                          <li key={i}>• {change}</li>
                        ))}
                      </ul>
                    </div>
                    <div>
                      <h4 className="font-medium mb-2">Content Additions</h4>
                      <ul className="text-sm text-gray-600 space-y-1">
                        {results.optimized_content.contentAdditions.map((addition, i) => (
                          <li key={i}>• {addition}</li>
                        ))}
                      </ul>
                    </div>
                    <div>
                      <h4 className="font-medium mb-2">Format Improvements</h4>
                      <ul className="text-sm text-gray-600 space-y-1">
                        {results.optimized_content.formatImprovements.map((improvement, i) => (
                          <li key={i}>• {improvement}</li>
                        ))}
                      </ul>
                    </div>
                    <div>
                      <h4 className="font-medium mb-2">Authority Enhancements</h4>
                      <ul className="text-sm text-gray-600 space-y-1">
                        {results.optimized_content.authorityEnhancements.map((enhancement, i) => (
                          <li key={i}>• {enhancement}</li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </div>
              )}

              {activeTab === 'comparison' && (
                <div className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <h3 className="text-lg font-medium mb-3">Original Content</h3>
                      <div className="bg-red-50 p-4 rounded-lg max-h-64 overflow-y-auto">
                        <pre className="whitespace-pre-wrap text-sm text-gray-800">
                          {results.original_content.substring(0, 1000)}
                          {results.original_content.length > 1000 && '...'}
                        </pre>
                      </div>
                      <div className="mt-2 text-sm text-gray-500">
                        Length: {results.optimized_content.originalLength} characters
                      </div>
                    </div>
                    
                    <div>
                      <h3 className="text-lg font-medium mb-3">Optimized Content</h3>
                      <div className="bg-green-50 p-4 rounded-lg max-h-64 overflow-y-auto">
                        <pre className="whitespace-pre-wrap text-sm text-gray-800">
                          {results.optimized_content.optimized_text.substring(0, 1000)}
                          {results.optimized_content.optimized_text.length > 1000 && '...'}
                        </pre>
                      </div>
                      <div className="mt-2 text-sm text-gray-500">
                        Length: {results.optimized_content.optimizedLength} characters
                      </div>
                    </div>
                  </div>

                  {/* Score Comparison */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-3">
                      <h4 className="font-medium">Readability Score</h4>
                      <div className="flex items-center gap-3">
                        <Progress value={results.optimized_content.readabilityScore} className="flex-1" />
                        <span className="text-sm font-medium">
                          {results.optimized_content.readabilityScore}%
                        </span>
                      </div>
                    </div>
                    <div className="space-y-3">
                      <h4 className="font-medium">Citation Potential</h4>
                      <div className="flex items-center gap-3">
                        <Progress value={results.optimized_content.citationPotentialScore} className="flex-1" />
                        <span className="text-sm font-medium">
                          {results.optimized_content.citationPotentialScore}%
                        </span>
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

export default AIAnswerOptimizer;