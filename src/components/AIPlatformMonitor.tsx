import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Progress } from './ui/progress';
import { toast } from 'sonner';
import { supabase } from '../integrations/supabase/client';
import { useDomain } from '../contexts/DomainContext';
import { useAuth } from '../contexts/AuthContext';
import { 
  Bot, 
  Brain, 
  Search, 
  Zap,
  RefreshCw,
  TrendingUp,
  ExternalLink,
  MessageSquare,
  Sparkles,
  Target
} from 'lucide-react';

interface AIPlatformResult {
  platform: 'chatgpt' | 'claude' | 'perplexity' | 'bard' | 'copilot';
  query: string;
  response: string;
  cited: boolean;
  citationScore: number;
  sources?: string[];
  responseLength: number;
  confidence: number;
}

interface PlatformCheckResult {
  query: string;
  domain: string;
  platforms: string[];
  search_method: string;
  results: AIPlatformResult[];
  totalCitations: number;
  averageScore: number;
  averageConfidence: number;
  checkedAt: string;
}

const AIPlatformMonitor = () => {
  const { defaultDomain } = useDomain();
  const { user } = useAuth();
  const [query, setQuery] = useState('');
  const [domain, setDomain] = useState('');
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState<PlatformCheckResult | null>(null);
  const [history, setHistory] = useState<PlatformCheckResult[]>([]);
  const [selectedPlatforms, setSelectedPlatforms] = useState({
    chatgpt: true,
    claude: true,
    perplexity: true,
    bard: false,
    copilot: false
  });
  const [searchMethod, setSearchMethod] = useState<'simulation' | 'direct' | 'proxy'>('simulation');

  useEffect(() => {
    if (defaultDomain && !domain) {
      setDomain(defaultDomain);
    }
  }, [defaultDomain, domain]);

  useEffect(() => {
    loadHistory();
  }, []);

  const loadHistory = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data, error } = await supabase
        .from('ai_platform_citations')
        .select('*')
        .eq('user_id', user.id)
        .order('checked_at', { ascending: false })
        .limit(10);

      if (error) throw error;
      setHistory(data || []);
    } catch (error) {
      console.error('Error loading AI platform history:', error);
    }
  };

  const checkAIPlatforms = async () => {
    if (!query || !domain) {
      toast.error('Please enter both query and domain');
      return;
    }

    try {
      setLoading(true);
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        toast.error('Please sign in to check AI platforms');
        return;
      }

      const activePlatforms = Object.entries(selectedPlatforms)
        .filter(([_, enabled]) => enabled)
        .map(([platform, _]) => platform);

      if (activePlatforms.length === 0) {
        toast.error('Please select at least one AI platform');
        return;
      }

      const { data, error } = await supabase.functions.invoke('check-ai-platform-citations', {
        body: JSON.stringify({
          query,
          domain: domain.replace(/^https?:\/\//, ''),
          user_id: user.id,
          platforms: activePlatforms.join(','),
          search_method: searchMethod
        })
      });

      if (error) throw error;

      setResults(data);
      loadHistory();

      const citedCount = data.results.filter((r: AIPlatformResult) => r.cited).length;
      if (citedCount > 0) {
        toast.success(`Found citations on ${citedCount} of ${data.results.length} AI platforms!`);
      } else {
        toast.error('No citations found on AI platforms');
      }

    } catch (error: unknown) {
      console.error('AI platform check error:', error);
      const errMessage = error instanceof Error ? error.message : 'Failed to check AI platforms';
      toast.error(errMessage);
    } finally {
      setLoading(false);
    }
  };

  const getPlatformIcon = (platform: string) => {
    switch (platform) {
      case 'chatgpt': return <MessageSquare className="w-5 h-5" />;
      case 'claude': return <Brain className="w-5 h-5" />;
      case 'perplexity': return <Search className="w-5 h-5" />;
      case 'bard': return <Sparkles className="w-5 h-5" />;
      case 'copilot': return <Bot className="w-5 h-5" />;
      default: return <Zap className="w-5 h-5" />;
    }
  };

  const getPlatformName = (platform: string) => {
    switch (platform) {
      case 'chatgpt': return 'ChatGPT';
      case 'claude': return 'Claude';
      case 'perplexity': return 'Perplexity';
      case 'bard': return 'Google Bard';
      case 'copilot': return 'Microsoft Copilot';
      default: return platform;
    }
  };

  const getPlatformColor = (platform: string) => {
    switch (platform) {
      case 'chatgpt': return 'text-green-600 bg-green-50';
      case 'claude': return 'text-orange-600 bg-orange-50';
      case 'perplexity': return 'text-blue-600 bg-blue-50';
      case 'bard': return 'text-purple-600 bg-purple-50';
      case 'copilot': return 'text-indigo-600 bg-indigo-50';
      default: return 'text-gray-600 bg-gray-50';
    }
  };

  const getConfidenceColor = (confidence: number) => {
    if (confidence >= 80) return 'text-green-600';
    if (confidence >= 60) return 'text-yellow-600';
    return 'text-red-600';
  };

  return (
    <div className="max-w-7xl mx-auto p-6 space-y-6">
      <div className="text-center">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">AI Platform Citation Monitor</h1>
        <p className="text-gray-600">
          Track how your content appears in responses from ChatGPT, Claude, Perplexity, and other AI platforms
        </p>
      </div>

      {/* Input Section */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Bot className="w-5 h-5" />
            AI Platform Check
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-2">Search Query</label>
              <Input
                placeholder="What would someone ask an AI assistant?"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && checkAIPlatforms()}
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Domain</label>
              <Input
                placeholder="example.com"
                value={domain}
                onChange={(e) => setDomain(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && checkAIPlatforms()}
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium mb-3">AI Platforms to Check</label>
            <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
              {Object.entries(selectedPlatforms).map(([platform, enabled]) => (
                <label key={platform} className="flex items-center space-x-2 cursor-pointer p-2 border rounded hover:bg-gray-50">
                  <input
                    type="checkbox"
                    checked={enabled}
                    onChange={(e) => setSelectedPlatforms(prev => ({
                      ...prev,
                      [platform]: e.target.checked
                    }))}
                    className="rounded border-gray-300"
                  />
                  <div className="flex items-center space-x-2">
                    {getPlatformIcon(platform)}
                    <span className="text-sm font-medium">{getPlatformName(platform)}</span>
                  </div>
                </label>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Search Method</label>
            <div className="flex gap-3">
              {(['simulation', 'direct', 'proxy'] as const).map((method) => (
                <label key={method} className="flex items-center space-x-2 cursor-pointer">
                  <input
                    type="radio"
                    name="method"
                    value={method}
                    checked={searchMethod === method}
                    onChange={(e) => setSearchMethod(e.target.value as 'simulation' | 'direct' | 'proxy')}
                    className="rounded border-gray-300"
                  />
                  <span className="text-sm capitalize">{method}</span>
                </label>
              ))}
            </div>
            <p className="text-xs text-gray-500 mt-1">
              Simulation: Fast, estimates likely citations | Direct: Uses real APIs (requires keys) | Proxy: Web scraping (slower)
            </p>
          </div>

          <Button 
            onClick={checkAIPlatforms} 
            disabled={loading || !query || !domain}
            className="w-full"
          >
            {loading ? (
              <>
                <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                Checking AI Platforms...
              </>
            ) : (
              <>
                <Target className="w-4 h-4 mr-2" />
                Check AI Platform Citations
              </>
            )}
          </Button>
        </CardContent>
      </Card>

      {/* Results Section */}
      {results && (
        <div className="space-y-6">
          {/* Summary Card */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span>AI Platform Citation Summary</span>
                <Badge variant={results.totalCitations > 0 ? "default" : "destructive"} className="text-lg px-4 py-2">
                  {results.totalCitations} / {results.results.length} Platforms
                </Badge>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="text-center">
                  <div className="text-2xl font-bold text-green-600">
                    {results.totalCitations}
                  </div>
                  <div className="text-sm text-gray-500">Citations Found</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-blue-600">
                    {Math.round(results.averageScore)}%
                  </div>
                  <div className="text-sm text-gray-500">Average Score</div>
                </div>
                <div className="text-center">
                  <div className={`text-2xl font-bold ${getConfidenceColor(results.averageConfidence)}`}>
                    {Math.round(results.averageConfidence)}%
                  </div>
                  <div className="text-sm text-gray-500">Avg Confidence</div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Platform Results */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {results.results.map((result, index) => (
              <Card key={index} className={`border-l-4 ${result.cited ? 'border-l-green-500' : 'border-l-red-500'}`}>
                <CardHeader className="pb-3">
                  <CardTitle className="flex items-center justify-between text-lg">
                    <div className="flex items-center gap-2">
                      {getPlatformIcon(result.platform)}
                      <span>{getPlatformName(result.platform)}</span>
                    </div>
                    <Badge variant={result.cited ? "default" : "destructive"}>
                      {result.cited ? 'Cited' : 'Not Cited'}
                    </Badge>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <div className="text-sm font-medium mb-1">Citation Score</div>
                      <div className="flex items-center gap-2">
                        <Progress value={result.citationScore} className="flex-1" />
                        <span className="text-sm font-medium">{result.citationScore}%</span>
                      </div>
                    </div>
                    <div>
                      <div className="text-sm font-medium mb-1">Confidence</div>
                      <div className="flex items-center gap-2">
                        <Progress value={result.confidence} className="flex-1" />
                        <span className={`text-sm font-medium ${getConfidenceColor(result.confidence)}`}>
                          {result.confidence}%
                        </span>
                      </div>
                    </div>
                  </div>

                  <div>
                    <div className="text-sm font-medium mb-1">AI Response</div>
                    <div className="text-sm text-gray-600 bg-gray-50 p-3 rounded max-h-32 overflow-y-auto">
                      {result.response.substring(0, 300)}
                      {result.response.length > 300 && '...'}
                    </div>
                  </div>

                  <div className="flex justify-between items-center text-xs text-gray-500">
                    <span>Response: {result.responseLength} chars</span>
                    {result.sources && result.sources.length > 0 && (
                      <span>{result.sources.length} sources</span>
                    )}
                  </div>

                  {result.sources && result.sources.length > 0 && (
                    <div>
                      <div className="text-sm font-medium mb-1">Sources Referenced</div>
                      <div className="space-y-1">
                        {result.sources.slice(0, 3).map((source, i) => (
                          <div key={i} className="flex items-center gap-1 text-xs">
                            <ExternalLink className="w-3 h-3" />
                            <span className="text-blue-600 truncate">{source}</span>
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

      {/* History Section */}
      {history.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="w-5 h-5" />
              Recent AI Platform Checks
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {history.slice(0, 5).map((item, index) => (
                <div key={index} className="flex justify-between items-center p-3 border rounded-lg">
                  <div className="flex-1">
                    <p className="font-medium text-sm">"{item.query}"</p>
                    <div className="flex items-center gap-4 mt-1">
                      <p className="text-xs text-gray-500">{item.domain}</p>
                      <p className="text-xs text-gray-500">
                        {new Date(item.checkedAt).toLocaleDateString()}
                      </p>
                      <p className="text-xs text-gray-500">
                        {item.platforms.length} platforms
                      </p>
                      <p className="text-xs text-gray-500">
                        {item.search_method} method
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant={item.totalCitations > 0 ? "default" : "destructive"}>
                      {item.totalCitations}/{item.results.length}
                    </Badge>
                    <span className="text-sm font-medium text-gray-600">
                      {Math.round(item.averageScore)}%
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default AIPlatformMonitor;