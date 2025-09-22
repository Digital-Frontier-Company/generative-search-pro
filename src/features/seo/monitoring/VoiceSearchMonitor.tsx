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
  Mic, 
  Smartphone, 
  Speaker, 
  Search, 
  TrendingUp, 
  Volume2,
  RefreshCw,
  ExternalLink
} from 'lucide-react';

interface VoiceSearchResult {
  platform: 'google_assistant' | 'alexa' | 'siri';
  query: string;
  response: string;
  cited: boolean;
  citationScore: number;
  responseLength: number;
  sources?: string[];
}

interface VoiceCheckResult {
  query: string;
  domain: string;
  platforms: string[];
  results: VoiceSearchResult[];
  totalCitations: number;
  averageScore: number;
  checkedAt: string;
}

const VoiceSearchMonitor = () => {
  const { defaultDomain } = useDomain();
  const { user } = useAuth();
  const [query, setQuery] = useState('');
  const [domain, setDomain] = useState('');
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState<VoiceCheckResult | null>(null);
  const [history, setHistory] = useState<VoiceCheckResult[]>([]);
  const [selectedPlatforms, setSelectedPlatforms] = useState({
    google_assistant: true,
    alexa: true,
    siri: true
  });

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
        .from('voice_citations')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(10);

      if (error) throw error;
      
      // Map database columns to expected interface
      const mappedData = (data || []).map(item => ({
        query: item.query,
        domain: item.domain,
        platforms: [item.assistant_platform], // Convert single platform to array
        results: [{
          platform: (item.assistant_platform === 'google_assistant' || item.assistant_platform === 'alexa' || item.assistant_platform === 'siri') 
            ? item.assistant_platform as 'google_assistant' | 'alexa' | 'siri'
            : 'google_assistant',
          query: item.query,
          response: item.response_text || '',
          cited: item.is_cited,
          citationScore: (item.confidence_score || 0) * 100,
          responseLength: (item.response_text || '').length
        }],
        totalCitations: item.is_cited ? 1 : 0,
        averageScore: (item.confidence_score || 0) * 100,
        checkedAt: item.created_at
      }));
      
      setHistory(mappedData);
    } catch (error) {
      console.error('Error loading voice search history:', error);
    }
  };

  const checkVoiceCitations = async () => {
    if (!query || !domain) {
      toast.error('Please enter both query and domain');
      return;
    }

    try {
      setLoading(true);
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        toast.error('Please sign in to check voice citations');
        return;
      }

      const activePlatforms = Object.entries(selectedPlatforms)
        .filter(([_, enabled]) => enabled)
        .map(([platform, _]) => platform);

      if (activePlatforms.length === 0) {
        toast.error('Please select at least one platform');
        return;
      }

      const { data, error } = await supabase.functions.invoke('check-voice-citations', {
        body: JSON.stringify({
          query,
          domain: domain.replace(/^https?:\/\//, ''),
          user_id: user.id,
          platforms: activePlatforms.join(',')
        })
      });

      if (error) throw error;

      setResults(data);
      loadHistory();

      const citedCount = data.results.filter((r: VoiceSearchResult) => r.cited).length;
      if (citedCount > 0) {
        toast.success(`Great! Cited on ${citedCount} of ${data.results.length} voice platforms!`);
      } else {
        toast.error('Not cited on any voice platforms');
      }

    } catch (error: unknown) {
      console.error('Voice citation check error:', error);
      const errMessage = error instanceof Error ? error.message : 'Failed to check voice citations';
      toast.error(errMessage);
    } finally {
      setLoading(false);
    }
  };

  const getPlatformIcon = (platform: string) => {
    switch (platform) {
      case 'google_assistant': return <Smartphone className="w-5 h-5" />;
      case 'alexa': return <Speaker className="w-5 h-5" />;
      case 'siri': return <Mic className="w-5 h-5" />;
      default: return <Volume2 className="w-5 h-5" />;
    }
  };

  const getPlatformName = (platform: string) => {
    switch (platform) {
      case 'google_assistant': return 'Google Assistant';
      case 'alexa': return 'Amazon Alexa';
      case 'siri': return 'Apple Siri';
      default: return platform;
    }
  };

  const getPlatformColor = (platform: string) => {
    switch (platform) {
      case 'google_assistant': return 'text-blue-600 bg-blue-50';
      case 'alexa': return 'text-orange-600 bg-orange-50';
      case 'siri': return 'text-purple-600 bg-purple-50';
      default: return 'text-gray-600 bg-gray-50';
    }
  };

  return (
    <div className="max-w-6xl mx-auto p-6 space-y-6">
      <div className="text-center">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Voice Search Citation Monitor</h1>
        <p className="text-gray-600">
          Track how your content appears in voice search results across Google Assistant, Alexa, and Siri
        </p>
      </div>

      {/* Input Section */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Mic className="w-5 h-5" />
            Voice Search Check
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-2">Search Query</label>
              <Input
                placeholder="What would someone ask a voice assistant?"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && checkVoiceCitations()}
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Domain</label>
              <Input
                placeholder="example.com"
                value={domain}
                onChange={(e) => setDomain(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && checkVoiceCitations()}
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium mb-3">Voice Platforms to Check</label>
            <div className="flex flex-wrap gap-3">
              {Object.entries(selectedPlatforms).map(([platform, enabled]) => (
                <label key={platform} className="flex items-center space-x-2 cursor-pointer">
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
                    <span className="text-sm">{getPlatformName(platform)}</span>
                  </div>
                </label>
              ))}
            </div>
          </div>

          <Button 
            onClick={checkVoiceCitations} 
            disabled={loading || !query || !domain}
            className="w-full"
          >
            {loading ? (
              <>
                <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                Checking Voice Platforms...
              </>
            ) : (
              <>
                <Search className="w-4 h-4 mr-2" />
                Check Voice Citations
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
                <span>Voice Citation Summary</span>
                <Badge variant={results.totalCitations > 0 ? "default" : "destructive"} className="text-lg px-4 py-2">
                  {results.totalCitations} / {results.results.length} Cited
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
                  <div className="text-2xl font-bold text-purple-600">
                    {results.results.length}
                  </div>
                  <div className="text-sm text-gray-500">Platforms Checked</div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Platform Results */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
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
                  <div>
                    <div className="text-sm font-medium mb-1">Citation Score</div>
                    <div className="flex items-center gap-2">
                      <Progress value={result.citationScore} className="flex-1" />
                      <span className="text-sm font-medium">{result.citationScore}%</span>
                    </div>
                  </div>

                  <div>
                    <div className="text-sm font-medium mb-1">Voice Response</div>
                    <div className="text-sm text-gray-600 bg-gray-50 p-2 rounded max-h-20 overflow-y-auto">
                      {result.response || 'No response captured'}
                    </div>
                  </div>

                  <div className="text-xs text-gray-500">
                    Response Length: {result.responseLength} chars
                    {result.sources && result.sources.length > 0 && (
                      <span> • {result.sources.length} sources</span>
                    )}
                  </div>

                  {result.sources && result.sources.length > 0 && (
                    <div>
                      <div className="text-sm font-medium mb-1">Sources</div>
                      <div className="space-y-1">
                        {result.sources.slice(0, 2).map((source, i) => (
                          <a
                            key={i}
                            href={source}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center gap-1 text-xs text-blue-600 hover:underline"
                          >
                            <ExternalLink className="w-3 h-3" />
                            {new URL(source).hostname}
                          </a>
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
              Recent Voice Search Checks
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

export default VoiceSearchMonitor;