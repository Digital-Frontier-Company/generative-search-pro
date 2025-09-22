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
  Globe, 
  Languages, 
  TrendingUp,
  TrendingDown,
  MapPin,
  Target,
  RefreshCw,
  BarChart3,
  Lightbulb,
  AlertTriangle,
  CheckCircle,
  ExternalLink,
  Calendar,
  Zap,
  Users,
  Brain,
  Star,
  Award,
  Filter,
  Eye,
  Settings
} from 'lucide-react';

interface LanguageRegionResult {
  language: string;
  region: string;
  countryCode: string;
  translatedQuery: string;
  engine: 'google' | 'bing';
  isCited: boolean;
  citationPosition: number | null;
  aiAnswer: string;
  citedSources: CitationSource[];
  totalSources: number;
  localCompetitors: string[];
  culturalRelevance: number;
  translationQuality: number;
  marketPotential: number;
  languageSpecificFeatures: LanguageFeatures;
}

interface CitationSource {
  title: string;
  link: string;
  snippet: string;
  language?: string;
  region?: string;
}

interface LanguageFeatures {
  hasLocalizedContent: boolean;
  usesNativeScript: boolean;
  culturallyAppropriate: boolean;
  localizedKeywords: string[];
  marketSpecificTerms: string[];
  searchVolumeIndicator: 'high' | 'medium' | 'low';
}

interface LocalizationRecommendation {
  language: string;
  region: string;
  priority: 'critical' | 'high' | 'medium' | 'low';
  type: 'translation' | 'cultural-adaptation' | 'local-seo' | 'content-creation' | 'technical-optimization';
  recommendation: string;
  expectedImpact: string;
  implementationComplexity: 'simple' | 'moderate' | 'complex';
  estimatedTimeframe: string;
  investmentLevel: 'low' | 'medium' | 'high';
}

interface GlobalCompetitorAnalysis {
  domain: string;
  globalPresence: {
    language: string;
    region: string;
    citationCount: number;
    marketShare: number;
  }[];
  localizationStrategy: string;
  strongestMarkets: string[];
  weakestMarkets: string[];
}

interface MultiLanguageResults {
  query: string;
  domain: string;
  originalLanguage: string;
  results: LanguageRegionResult[];
  crossLanguageAnalysis: {
    totalCitations: number;
    citationsByLanguage: Record<string, number>;
    strongestMarkets: string[];
    weakestMarkets: string[];
    translationOpportunities: string[];
    culturalAdaptationNeeds: string[];
  };
  localizationRecommendations: LocalizationRecommendation[];
  competitorGlobalPresence: GlobalCompetitorAnalysis[];
  totalMarketsAnalyzed: number;
  globalCitationScore: number;
  marketPenetration: number;
  checkedAt: string;
}

const MultiLanguageCitationMonitor = () => {
  const { defaultDomain } = useDomain();
  const { user } = useAuth();
  const [query, setQuery] = useState('');
  const [domain, setDomain] = useState('');
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState<MultiLanguageResults | null>(null);
  const [selectedView, setSelectedView] = useState<'overview' | 'details' | 'recommendations' | 'competitors'>('overview');
  const [selectedLanguage, setSelectedLanguage] = useState<string>('all');
  const [selectedRegion, setSelectedRegion] = useState<string>('all');
  
  // Configuration options
  const [languages, setLanguages] = useState('en,es,fr,de,pt,ja,zh');
  const [regions, setRegions] = useState('us,uk,ca,au,es,fr,de,br,jp,cn');
  const [includeTranslation, setIncludeTranslation] = useState(true);
  const [includeCulturalAnalysis, setIncludeCulturalAnalysis] = useState(true);
  const [priorityMarkets, setPriorityMarkets] = useState('');

  useEffect(() => {
    if (defaultDomain && !domain) {
      setDomain(defaultDomain);
    }
  }, [defaultDomain, domain]);

  const runGlobalCitationMonitoring = async () => {
    if (!query || !domain) {
      toast.error('Please enter both query and domain');
      return;
    }

    try {
      setLoading(true);
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        toast.error('Please sign in to run global monitoring');
        return;
      }

      const { data, error } = await supabase.functions.invoke('multi-language-citation-monitor', {
        body: JSON.stringify({
          action: 'monitor_global_citations',
          query,
          domain: domain.replace(/^https?:\/\//, ''),
          user_id: user.id,
          languages,
          regions,
          include_translation: includeTranslation,
          include_cultural_analysis: includeCulturalAnalysis,
          priority_markets: priorityMarkets || undefined
        })
      });

      if (error) throw error;

      setResults(data);
      
      const strongMarkets = data.crossLanguageAnalysis.strongestMarkets.length;
      const totalCitations = data.crossLanguageAnalysis.totalCitations;
      
      if (totalCitations > 0) {
        toast.success(`🌍 Global analysis complete! Found ${totalCitations} citations across ${strongMarkets} strong markets`);
      } else {
        toast.info(`🔍 Global analysis complete! Analyzed ${data.totalMarketsAnalyzed} markets - check recommendations for opportunities`);
      }

    } catch (error: unknown) {
      console.error('Global monitoring error:', error);
      const errMessage = error instanceof Error ? error.message : 'Failed to run global monitoring';
      toast.error(errMessage);
    } finally {
      setLoading(false);
    }
  };

  const getLanguageName = (code: string) => {
    const names: Record<string, string> = {
      'en': 'English', 'es': 'Spanish', 'fr': 'French', 'de': 'German', 'pt': 'Portuguese',
      'ja': 'Japanese', 'zh': 'Chinese', 'ko': 'Korean', 'ar': 'Arabic', 'hi': 'Hindi',
      'it': 'Italian', 'nl': 'Dutch', 'ru': 'Russian'
    };
    return names[code] || code.toUpperCase();
  };

  const getRegionName = (code: string) => {
    const names: Record<string, string> = {
      'US': '🇺🇸 United States', 'UK': '🇬🇧 United Kingdom', 'CA': '🇨🇦 Canada', 'AU': '🇦🇺 Australia',
      'ES': '🇪🇸 Spain', 'FR': '🇫🇷 France', 'DE': '🇩🇪 Germany', 'BR': '🇧🇷 Brazil', 'JP': '🇯🇵 Japan',
      'CN': '🇨🇳 China', 'KR': '🇰🇷 South Korea', 'SA': '🇸🇦 Saudi Arabia', 'AE': '🇦🇪 UAE',
      'IN': '🇮🇳 India', 'IT': '🇮🇹 Italy', 'NL': '🇳🇱 Netherlands', 'RU': '🇷🇺 Russia'
    };
    return names[code] || `🌍 ${code}`;
  };

  const getFlag = (code: string) => {
    const flags: Record<string, string> = {
      'US': '🇺🇸', 'UK': '🇬🇧', 'CA': '🇨🇦', 'AU': '🇦🇺', 'ES': '🇪🇸', 'FR': '🇫🇷',
      'DE': '🇩🇪', 'BR': '🇧🇷', 'JP': '🇯🇵', 'CN': '🇨🇳', 'KR': '🇰🇷', 'SA': '🇸🇦',
      'AE': '🇦🇪', 'IN': '🇮🇳', 'IT': '🇮🇹', 'NL': '🇳🇱', 'RU': '🇷🇺'
    };
    return flags[code] || '🌍';
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'critical': return 'text-red-600 bg-red-50 border-red-200';
      case 'high': return 'text-orange-600 bg-orange-50 border-orange-200';
      case 'medium': return 'text-yellow-600 bg-yellow-50 border-yellow-200';
      case 'low': return 'text-green-600 bg-green-50 border-green-200';
      default: return 'text-gray-600 bg-gray-50 border-gray-200';
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'translation': return <Languages className="w-4 h-4" />;
      case 'cultural-adaptation': return <Users className="w-4 h-4" />;
      case 'local-seo': return <MapPin className="w-4 h-4" />;
      case 'content-creation': return <Brain className="w-4 h-4" />;
      case 'technical-optimization': return <Settings className="w-4 h-4" />;
      default: return <Target className="w-4 h-4" />;
    }
  };

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-green-600';
    if (score >= 60) return 'text-yellow-600';
    if (score >= 40) return 'text-orange-600';
    return 'text-red-600';
  };

  const getVolumeIcon = (volume: string) => {
    switch (volume) {
      case 'high': return '🔥';
      case 'medium': return '📊';
      case 'low': return '📉';
      default: return '❓';
    }
  };

  const filteredResults = results?.results.filter(result => {
    if (selectedLanguage !== 'all' && result.language !== selectedLanguage) return false;
    if (selectedRegion !== 'all' && result.region !== selectedRegion) return false;
    return true;
  }) || [];

  return (
    <div className="max-w-7xl mx-auto p-6 space-y-6">
      <div className="text-center">
        <h1 className="text-3xl font-bold text-gray-900 mb-2 flex items-center justify-center gap-2">
          <Globe className="w-8 h-8 text-blue-600" />
          Multi-Language Citation Monitor
        </h1>
        <p className="text-gray-600">
          Track your global citation performance across languages, regions, and cultures with AI-powered insights
        </p>
      </div>

      {/* Configuration Section */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Settings className="w-5 h-5" />
            Global Monitoring Configuration
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-2">Search Query *</label>
              <Input
                placeholder="best project management software"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Domain *</label>
              <Input
                placeholder="yourdomain.com"
                value={domain}
                onChange={(e) => setDomain(e.target.value)}
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-2">Languages to Monitor</label>
              <Input
                placeholder="en,es,fr,de,pt,ja,zh,ko,ar,hi"
                value={languages}
                onChange={(e) => setLanguages(e.target.value)}
              />
              <p className="text-xs text-gray-500 mt-1">
                Comma-separated language codes (e.g., en, es, fr, de)
              </p>
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Regions to Monitor</label>
              <Input
                placeholder="us,uk,ca,au,es,fr,de,br,jp,cn"
                value={regions}
                onChange={(e) => setRegions(e.target.value)}
              />
              <p className="text-xs text-gray-500 mt-1">
                Comma-separated region codes (e.g., us, uk, es, fr)
              </p>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Priority Markets (Optional)</label>
            <Input
              placeholder="us,de,jp - markets to prioritize in analysis"
              value={priorityMarkets}
              onChange={(e) => setPriorityMarkets(e.target.value)}
            />
          </div>

          <div className="flex gap-6">
            <label className="flex items-center space-x-2 cursor-pointer">
              <input
                type="checkbox"
                checked={includeTranslation}
                onChange={(e) => setIncludeTranslation(e.target.checked)}
                className="rounded border-gray-300"
              />
              <span className="text-sm">Include AI-powered query translation</span>
            </label>
            <label className="flex items-center space-x-2 cursor-pointer">
              <input
                type="checkbox"
                checked={includeCulturalAnalysis}
                onChange={(e) => setIncludeCulturalAnalysis(e.target.checked)}
                className="rounded border-gray-300"
              />
              <span className="text-sm">Include cultural adaptation analysis</span>
            </label>
          </div>

          <Button 
            onClick={runGlobalCitationMonitoring} 
            disabled={loading || !query || !domain}
            className="w-full"
          >
            {loading ? (
              <>
                <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                Analyzing Global Citations...
              </>
            ) : (
              <>
                <Globe className="w-4 h-4 mr-2" />
                Run Global Citation Analysis
              </>
            )}
          </Button>
        </CardContent>
      </Card>

      {/* Results Section */}
      {results && (
        <div className="space-y-6">
          {/* Global Overview Cards */}
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
            <Card>
              <CardContent className="p-4 text-center">
                <div className="text-2xl font-bold text-blue-600">{results.totalMarketsAnalyzed}</div>
                <div className="text-sm text-gray-500">Markets Analyzed</div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4 text-center">
                <div className="text-2xl font-bold text-green-600">{results.crossLanguageAnalysis.totalCitations}</div>
                <div className="text-sm text-gray-500">Total Citations</div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4 text-center">
                <div className={`text-2xl font-bold ${getScoreColor(results.globalCitationScore)}`}>
                  {results.globalCitationScore}%
                </div>
                <div className="text-sm text-gray-500">Global Score</div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4 text-center">
                <div className={`text-2xl font-bold ${getScoreColor(results.marketPenetration)}`}>
                  {results.marketPenetration}%
                </div>
                <div className="text-sm text-gray-500">Market Penetration</div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4 text-center">
                <div className="text-2xl font-bold text-purple-600">{results.localizationRecommendations.length}</div>
                <div className="text-sm text-gray-500">Recommendations</div>
              </CardContent>
            </Card>
          </div>

          {/* View Toggle */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Global Citation Results</CardTitle>
                <div className="flex gap-2">
                  {(['overview', 'details', 'recommendations', 'competitors'] as const).map((view) => (
                    <Button
                      key={view}
                      variant={selectedView === view ? "default" : "outline"}
                      size="sm"
                      onClick={() => setSelectedView(view)}
                    >
                      {view === 'overview' && <BarChart3 className="w-3 h-3 mr-1" />}
                      {view === 'details' && <Eye className="w-3 h-3 mr-1" />}
                      {view === 'recommendations' && <Lightbulb className="w-3 h-3 mr-1" />}
                      {view === 'competitors' && <Users className="w-3 h-3 mr-1" />}
                      {view.charAt(0).toUpperCase() + view.slice(1)}
                    </Button>
                  ))}
                </div>
              </div>
            </CardHeader>
            <CardContent>
              {/* Filters for detailed view */}
              {selectedView === 'details' && (
                <div className="flex gap-4 mb-6">
                  <div>
                    <select
                      className="border border-gray-300 rounded-md p-2"
                      value={selectedLanguage}
                      onChange={(e) => setSelectedLanguage(e.target.value)}
                    >
                      <option value="all">All Languages</option>
                      {[...new Set(results.results.map(r => r.language))].map(lang => (
                        <option key={lang} value={lang}>{getLanguageName(lang)}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <select
                      className="border border-gray-300 rounded-md p-2"
                      value={selectedRegion}
                      onChange={(e) => setSelectedRegion(e.target.value)}
                    >
                      <option value="all">All Regions</option>
                      {[...new Set(results.results.map(r => r.region))].map(region => (
                        <option key={region} value={region}>{getRegionName(region)}</option>
                      ))}
                    </select>
                  </div>
                </div>
              )}

              {/* Overview Tab */}
              {selectedView === 'overview' && (
                <div className="space-y-6">
                  {/* Language Performance */}
                  <div>
                    <h4 className="font-medium mb-3">Citation Performance by Language</h4>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      {Object.entries(results.crossLanguageAnalysis.citationsByLanguage).map(([lang, count]) => (
                        <div key={lang} className="text-center p-3 border rounded-lg">
                          <div className="text-lg font-bold text-blue-600">{count}</div>
                          <div className="text-sm text-gray-600">{getLanguageName(lang)}</div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Market Analysis */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <h4 className="font-medium mb-3 flex items-center gap-2">
                        <TrendingUp className="w-4 h-4 text-green-500" />
                        Strongest Markets
                      </h4>
                      <div className="space-y-2">
                        {results.crossLanguageAnalysis.strongestMarkets.map((market, index) => (
                          <div key={index} className="flex items-center gap-2 p-2 bg-green-50 rounded border-l-4 border-green-400">
                            <Star className="w-4 h-4 text-green-600" />
                            <span className="text-sm font-medium">{market}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                    <div>
                      <h4 className="font-medium mb-3 flex items-center gap-2">
                        <TrendingDown className="w-4 h-4 text-red-500" />
                        Weakest Markets
                      </h4>
                      <div className="space-y-2">
                        {results.crossLanguageAnalysis.weakestMarkets.map((market, index) => (
                          <div key={index} className="flex items-center gap-2 p-2 bg-red-50 rounded border-l-4 border-red-400">
                            <AlertTriangle className="w-4 h-4 text-red-600" />
                            <span className="text-sm font-medium">{market}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Quick Opportunities */}
                  <div>
                    <h4 className="font-medium mb-3 flex items-center gap-2">
                      <Zap className="w-4 h-4 text-yellow-500" />
                      Translation Opportunities
                    </h4>
                    <div className="space-y-2">
                      {results.crossLanguageAnalysis.translationOpportunities.slice(0, 3).map((opportunity, index) => (
                        <div key={index} className="p-3 bg-yellow-50 rounded border-l-4 border-yellow-400">
                          <p className="text-sm text-yellow-800">{opportunity}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* Details Tab */}
              {selectedView === 'details' && (
                <div className="space-y-4">
                  {filteredResults.map((result, index) => (
                    <Card key={index} className={`border-l-4 ${result.isCited ? 'border-l-green-500' : 'border-l-red-500'}`}>
                      <CardHeader className="pb-3">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <span className="text-lg">{getFlag(result.region)}</span>
                            <div>
                              <h4 className="font-medium">
                                {getLanguageName(result.language)} - {getRegionName(result.region)}
                              </h4>
                              <p className="text-sm text-gray-600">"{result.translatedQuery}"</p>
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            <Badge variant={result.isCited ? "default" : "destructive"}>
                              {result.isCited ? 'Cited' : 'Not Cited'}
                            </Badge>
                            {result.citationPosition && (
                              <Badge variant="outline">#{result.citationPosition}</Badge>
                            )}
                          </div>
                        </div>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        {/* Performance Metrics */}
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                          <div>
                            <div className="text-sm text-gray-500">Market Potential</div>
                            <div className="flex items-center gap-2">
                              <Progress value={result.marketPotential} className="flex-1" />
                              <span className={`text-sm font-medium ${getScoreColor(result.marketPotential)}`}>
                                {result.marketPotential}%
                              </span>
                            </div>
                          </div>
                          <div>
                            <div className="text-sm text-gray-500">Cultural Relevance</div>
                            <div className="flex items-center gap-2">
                              <Progress value={result.culturalRelevance} className="flex-1" />
                              <span className={`text-sm font-medium ${getScoreColor(result.culturalRelevance)}`}>
                                {result.culturalRelevance}%
                              </span>
                            </div>
                          </div>
                          <div>
                            <div className="text-sm text-gray-500">Translation Quality</div>
                            <div className="flex items-center gap-2">
                              <Progress value={result.translationQuality} className="flex-1" />
                              <span className={`text-sm font-medium ${getScoreColor(result.translationQuality)}`}>
                                {result.translationQuality}%
                              </span>
                            </div>
                          </div>
                          <div>
                            <div className="text-sm text-gray-500">Search Volume</div>
                            <div className="flex items-center gap-2">
                              <span className="text-lg">{getVolumeIcon(result.languageSpecificFeatures.searchVolumeIndicator)}</span>
                              <span className="text-sm font-medium capitalize">
                                {result.languageSpecificFeatures.searchVolumeIndicator}
                              </span>
                            </div>
                          </div>
                        </div>

                        {/* Language Features */}
                        <div>
                          <h5 className="font-medium text-sm mb-2">Language-Specific Features</h5>
                          <div className="flex flex-wrap gap-2">
                            {result.languageSpecificFeatures.hasLocalizedContent && (
                              <Badge variant="outline" className="text-green-600">
                                <CheckCircle className="w-3 h-3 mr-1" />
                                Localized Content
                              </Badge>
                            )}
                            {result.languageSpecificFeatures.usesNativeScript && (
                              <Badge variant="outline" className="text-blue-600">
                                <Languages className="w-3 h-3 mr-1" />
                                Native Script
                              </Badge>
                            )}
                            {result.languageSpecificFeatures.culturallyAppropriate && (
                              <Badge variant="outline" className="text-purple-600">
                                <Users className="w-3 h-3 mr-1" />
                                Culturally Appropriate
                              </Badge>
                            )}
                          </div>
                        </div>

                        {/* Local Keywords */}
                        {result.languageSpecificFeatures.localizedKeywords.length > 0 && (
                          <div>
                            <h5 className="font-medium text-sm mb-2">Local Keywords Detected</h5>
                            <div className="flex flex-wrap gap-1">
                              {result.languageSpecificFeatures.localizedKeywords.map((keyword, i) => (
                                <span key={i} className="text-xs bg-gray-100 text-gray-700 px-2 py-1 rounded">
                                  {keyword}
                                </span>
                              ))}
                            </div>
                          </div>
                        )}

                        {/* Local Competitors */}
                        {result.localCompetitors.length > 0 && (
                          <div>
                            <h5 className="font-medium text-sm mb-2">Local Competitors</h5>
                            <div className="flex flex-wrap gap-2">
                              {result.localCompetitors.slice(0, 3).map((competitor, i) => (
                                <div key={i} className="flex items-center gap-1 text-xs bg-orange-50 text-orange-700 px-2 py-1 rounded">
                                  <ExternalLink className="w-3 h-3" />
                                  {competitor}
                                </div>
                              ))}
                            </div>
                          </div>
                        )}

                        {/* AI Answer Preview */}
                        {result.aiAnswer && (
                          <div>
                            <h5 className="font-medium text-sm mb-2">AI Answer Preview</h5>
                            <div className="text-sm text-gray-600 bg-gray-50 p-3 rounded max-h-20 overflow-y-auto">
                              {result.aiAnswer.substring(0, 200)}
                              {result.aiAnswer.length > 200 && '...'}
                            </div>
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}

              {/* Recommendations Tab */}
              {selectedView === 'recommendations' && (
                <div className="space-y-4">
                  {results.localizationRecommendations.map((rec, index) => (
                    <Card key={index} className={`border-l-4 ${getPriorityColor(rec.priority).includes('red') ? 'border-l-red-500' : getPriorityColor(rec.priority).includes('orange') ? 'border-l-orange-500' : getPriorityColor(rec.priority).includes('yellow') ? 'border-l-yellow-500' : 'border-l-green-500'}`}>
                      <CardHeader className="pb-3">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            {getTypeIcon(rec.type)}
                            <div>
                              <h4 className="font-medium">{getLanguageName(rec.language)} - {getRegionName(rec.region)}</h4>
                              <p className="text-sm text-gray-600 capitalize">{rec.type.replace('-', ' ')}</p>
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            <Badge className={getPriorityColor(rec.priority)}>
                              {rec.priority}
                            </Badge>
                            <Badge variant="outline">
                              {rec.estimatedTimeframe}
                            </Badge>
                          </div>
                        </div>
                      </CardHeader>
                      <CardContent className="space-y-3">
                        <p className="text-sm">{rec.recommendation}</p>
                        
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                          <div>
                            <h6 className="font-medium text-xs mb-1">Expected Impact</h6>
                            <p className="text-xs text-gray-600">{rec.expectedImpact}</p>
                          </div>
                          <div>
                            <h6 className="font-medium text-xs mb-1">Complexity</h6>
                            <Badge variant="outline" className="text-xs">
                              {rec.implementationComplexity}
                            </Badge>
                          </div>
                          <div>
                            <h6 className="font-medium text-xs mb-1">Investment Level</h6>
                            <Badge variant="outline" className="text-xs">
                              {rec.investmentLevel}
                            </Badge>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}

              {/* Competitors Tab */}
              {selectedView === 'competitors' && (
                <div className="space-y-4">
                  {results.competitorGlobalPresence.map((competitor, index) => (
                    <Card key={index}>
                      <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                          <ExternalLink className="w-5 h-5" />
                          {competitor.domain}
                        </CardTitle>
                        <p className="text-sm text-gray-600">{competitor.localizationStrategy}</p>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div>
                            <h5 className="font-medium text-sm mb-2 flex items-center gap-1">
                              <Award className="w-4 h-4 text-green-500" />
                              Strongest Markets
                            </h5>
                            <div className="space-y-1">
                              {competitor.strongestMarkets.map((market, i) => (
                                <div key={i} className="text-sm bg-green-50 text-green-700 px-2 py-1 rounded">
                                  {market}
                                </div>
                              ))}
                            </div>
                          </div>
                          <div>
                            <h5 className="font-medium text-sm mb-2 flex items-center gap-1">
                              <Target className="w-4 h-4 text-orange-500" />
                              Opportunity Markets
                            </h5>
                            <div className="space-y-1">
                              {competitor.weakestMarkets.map((market, i) => (
                                <div key={i} className="text-sm bg-orange-50 text-orange-700 px-2 py-1 rounded">
                                  {market}
                                </div>
                              ))}
                            </div>
                          </div>
                        </div>

                        <div>
                          <h5 className="font-medium text-sm mb-2">Global Presence Detail</h5>
                          <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                            {competitor.globalPresence.slice(0, 8).map((presence, i) => (
                              <div key={i} className="text-center p-2 border rounded">
                                <div className="text-xs font-medium">
                                  {getFlag(presence.region)} {presence.language.toUpperCase()}
                                </div>
                                <div className="text-xs text-gray-600">
                                  {presence.citationCount} citations
                                </div>
                                <div className="text-xs text-gray-500">
                                  {presence.marketShare.toFixed(1)}% share
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
};

export default MultiLanguageCitationMonitor;