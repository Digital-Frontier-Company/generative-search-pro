import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Crown,
  TrendingUp,
  Users,
  MessageSquare,
  Award,
  Star,
  Eye,
  Link,
  Globe,
  Calendar,
  BarChart3,
  CheckCircle,
  AlertTriangle,
  ExternalLink,
  Copy,
  RefreshCw,
  Loader2,
  Zap
} from 'lucide-react';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useDomain } from '@/contexts/DomainContext';

interface AuthoritySignal {
  type: 'backlink' | 'mention' | 'citation' | 'social' | 'media' | 'patent' | 'research';
  source: string;
  url: string;
  title: string;
  authorityScore: number;
  sentiment: 'positive' | 'neutral' | 'negative';
  date: string;
  context: string;
  impact: 'high' | 'medium' | 'low';
}

interface BrandMention {
  source: string;
  platform: string;
  content: string;
  sentiment: 'positive' | 'neutral' | 'negative';
  reach: number;
  engagement: number;
  influenceScore: number;
  date: string;
  url: string;
}

interface ExpertRecognition {
  platform: string;
  recognition: string;
  description: string;
  date: string;
  impact: 'high' | 'medium' | 'low';
  authorityBoost: number;
}

interface AuthorityData {
  domain: string;
  overallAuthorityScore: number;
  topicalAuthorityScore: number;
  expertRecognitionScore: number;
  brandMentionScore: number;
  citationScore: number;
  authoritySignals: AuthoritySignal[];
  brandMentions: BrandMention[];
  expertRecognition: ExpertRecognition[];
  competitorComparison: Array<{
    competitor: string;
    authorityScore: number;
    mentionVolume: number;
    difference: number;
  }>;
  trends: Array<{
    period: string;
    authorityScore: number;
    mentions: number;
    citations: number;
  }>;
  recommendations: Array<{
    type: string;
    title: string;
    description: string;
    priority: 'high' | 'medium' | 'low';
    effort: 'low' | 'medium' | 'high';
    expectedImpact: string;
  }>;
  lastAnalyzed: string;
}

const AuthorityTracker = () => {
  const { user } = useAuth();
  const { defaultDomain } = useDomain();
  const [domain, setDomain] = useState(defaultDomain || '');
  const [competitors, setCompetitors] = useState('');
  const [loading, setLoading] = useState(false);
  const [authorityData, setAuthorityData] = useState<AuthorityData | null>(null);
  const [activeTab, setActiveTab] = useState('overview');

  useEffect(() => {
    if (defaultDomain && !domain) {
      setDomain(defaultDomain);
    }
  }, [defaultDomain, domain]);

  const trackAuthority = async () => {
    if (!domain.trim()) {
      toast.error('Please enter a domain to track');
      return;
    }

    if (!user) {
      toast.error('Please sign in to track authority signals');
      return;
    }

    setLoading(true);
    try {
      const competitorsList = competitors.trim()
        ? competitors.split(',').map(c => c.trim()).filter(c => c)
        : [];

      const { data, error } = await supabase.functions.invoke('track-authority-signals', {
        body: JSON.stringify({
          domain: domain.trim(),
          user_id: user.id,
          competitors: competitorsList,
          comprehensive: true
        })
      });

      if (error) throw error;

      if (data.success) {
        setAuthorityData(data.authority);
        toast.success('Authority tracking completed!');
      }
    } catch (error: any) {
      console.error('Authority tracking error:', error);
      toast.error(error.message || 'Failed to track authority signals');
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
    if (score >= 60) return 'text-blue-500';
    if (score >= 40) return 'text-yellow-500';
    return 'text-red-500';
  };

  const getSentimentColor = (sentiment: string) => {
    switch (sentiment) {
      case 'positive': return 'bg-green-500/20 text-green-400';
      case 'negative': return 'bg-red-500/20 text-red-400';
      default: return 'bg-gray-500/20 text-gray-400';
    }
  };

  const getImpactIcon = (impact: string) => {
    switch (impact) {
      case 'high': return <TrendingUp className="w-4 h-4 text-green-500" />;
      case 'medium': return <BarChart3 className="w-4 h-4 text-yellow-500" />;
      case 'low': return <CheckCircle className="w-4 h-4 text-blue-500" />;
      default: return <CheckCircle className="w-4 h-4 text-gray-500" />;
    }
  };

  const getAuthorityTypeIcon = (type: string) => {
    switch (type) {
      case 'backlink': return <Link className="w-4 h-4" />;
      case 'mention': return <MessageSquare className="w-4 h-4" />;
      case 'citation': return <Star className="w-4 h-4" />;
      case 'social': return <Users className="w-4 h-4" />;
      case 'media': return <Globe className="w-4 h-4" />;
      case 'research': return <Award className="w-4 h-4" />;
      default: return <Eye className="w-4 h-4" />;
    }
  };

  return (
    <div className="container mx-auto p-6 max-w-6xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2 text-matrix-green">Authority Signal Tracker</h1>
        <p className="text-matrix-green/70">
          Monitor brand mentions, authority signals, and expert recognition across platforms.
        </p>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-6">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="signals">Authority Signals</TabsTrigger>
          <TabsTrigger value="mentions">Brand Mentions</TabsTrigger>
          <TabsTrigger value="recognition">Expert Recognition</TabsTrigger>
          <TabsTrigger value="competitive">Competitive</TabsTrigger>
          <TabsTrigger value="recommendations">Recommendations</TabsTrigger>
        </TabsList>

        <TabsContent value="overview">
          <div className="space-y-6">
            {/* Setup Card */}
            <Card className="content-card">
              <CardHeader>
                <CardTitle className="text-matrix-green flex items-center gap-2">
                  <Crown className="w-5 h-5" />
                  Track Authority Signals
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium mb-2 text-matrix-green">Domain to Track</label>
                    <Input
                      placeholder="Enter your domain (e.g., example.com)"
                      value={domain}
                      onChange={(e) => setDomain(e.target.value)}
                      className="bg-secondary border-border"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2 text-matrix-green">
                      Competitors (optional)
                    </label>
                    <Input
                      placeholder="Enter competitor domains, separated by commas"
                      value={competitors}
                      onChange={(e) => setCompetitors(e.target.value)}
                      className="bg-secondary border-border"
                    />
                  </div>
                  <Button 
                    onClick={trackAuthority} 
                    disabled={loading} 
                    className="w-full glow-button text-black font-semibold"
                  >
                    {loading ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        Tracking Authority Signals...
                      </>
                    ) : (
                      <>
                        <Crown className="w-4 h-4 mr-2" />
                        Track Authority Signals
                      </>
                    )}
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Authority Scores */}
            {authorityData && (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                <Card className="content-card">
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-matrix-green/70">Overall Authority</p>
                        <p className={`text-2xl font-bold ${getScoreColor(authorityData.overallAuthorityScore)}`}>
                          {authorityData.overallAuthorityScore}/100
                        </p>
                      </div>
                      <div className="p-2 rounded-lg bg-matrix-green/10">
                        <Crown className="w-6 h-6 text-matrix-green" />
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card className="content-card">
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-matrix-green/70">Topical Authority</p>
                        <p className={`text-2xl font-bold ${getScoreColor(authorityData.topicalAuthorityScore)}`}>
                          {authorityData.topicalAuthorityScore}/100
                        </p>
                      </div>
                      <div className="p-2 rounded-lg bg-matrix-green/10">
                        <Award className="w-6 h-6 text-matrix-green" />
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card className="content-card">
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-matrix-green/70">Expert Recognition</p>
                        <p className={`text-2xl font-bold ${getScoreColor(authorityData.expertRecognitionScore)}`}>
                          {authorityData.expertRecognitionScore}/100
                        </p>
                      </div>
                      <div className="p-2 rounded-lg bg-matrix-green/10">
                        <Star className="w-6 h-6 text-matrix-green" />
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card className="content-card">
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-matrix-green/70">Brand Mentions</p>
                        <p className={`text-2xl font-bold ${getScoreColor(authorityData.brandMentionScore)}`}>
                          {authorityData.brandMentionScore}/100
                        </p>
                      </div>
                      <div className="p-2 rounded-lg bg-matrix-green/10">
                        <MessageSquare className="w-6 h-6 text-matrix-green" />
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card className="content-card">
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-matrix-green/70">Citation Score</p>
                        <p className={`text-2xl font-bold ${getScoreColor(authorityData.citationScore)}`}>
                          {authorityData.citationScore}/100
                        </p>
                      </div>
                      <div className="p-2 rounded-lg bg-matrix-green/10">
                        <Link className="w-6 h-6 text-matrix-green" />
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card className="content-card">
                  <CardContent className="p-4">
                    <div className="text-center">
                      <div className="text-2xl font-bold text-matrix-green mb-1">
                        {authorityData.authoritySignals.length}
                      </div>
                      <p className="text-sm text-matrix-green/70">Total Signals</p>
                    </div>
                  </CardContent>
                </Card>
              </div>
            )}

            {/* Authority Trends */}
            {authorityData && authorityData.trends.length > 0 && (
              <Card className="content-card">
                <CardHeader>
                  <CardTitle className="text-matrix-green">Authority Trends</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {authorityData.trends.map((trend, index) => (
                      <div key={index} className="flex items-center justify-between p-3 bg-secondary/30 rounded border">
                        <div className="flex items-center gap-3">
                          <Calendar className="w-4 h-4 text-matrix-green" />
                          <span className="text-matrix-green font-medium">{trend.period}</span>
                        </div>
                        <div className="grid grid-cols-3 gap-4 text-sm">
                          <div className="text-center">
                            <p className="text-matrix-green/70">Authority</p>
                            <p className="font-semibold text-matrix-green">{trend.authorityScore}</p>
                          </div>
                          <div className="text-center">
                            <p className="text-matrix-green/70">Mentions</p>
                            <p className="font-semibold text-matrix-green">{trend.mentions}</p>
                          </div>
                          <div className="text-center">
                            <p className="text-matrix-green/70">Citations</p>
                            <p className="font-semibold text-matrix-green">{trend.citations}</p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </TabsContent>

        <TabsContent value="signals">
          {authorityData ? (
            <Card className="content-card">
              <CardHeader>
                <CardTitle className="text-matrix-green">Authority Signals</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {authorityData.authoritySignals.map((signal, index) => (
                    <div key={index} className="border border-matrix-green/20 rounded-lg p-4">
                      <div className="flex items-start gap-3">
                        {getAuthorityTypeIcon(signal.type)}
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <h4 className="font-semibold text-matrix-green">{signal.title}</h4>
                            <Badge className={getSentimentColor(signal.sentiment)}>
                              {signal.sentiment}
                            </Badge>
                            <Badge variant="outline" className="border-matrix-green/30 text-matrix-green">
                              {signal.type}
                            </Badge>
                            {getImpactIcon(signal.impact)}
                          </div>
                          <p className="text-matrix-green/90 text-sm mb-3">{signal.context}</p>
                          
                          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 text-sm">
                            <div>
                              <p className="text-matrix-green/70">Source</p>
                              <p className="font-semibold text-matrix-green">{signal.source}</p>
                            </div>
                            <div>
                              <p className="text-matrix-green/70">Authority Score</p>
                              <p className={`font-semibold ${getScoreColor(signal.authorityScore)}`}>
                                {signal.authorityScore}/100
                              </p>
                            </div>
                            <div>
                              <p className="text-matrix-green/70">Impact</p>
                              <p className="font-semibold text-matrix-green capitalize">{signal.impact}</p>
                            </div>
                            <div>
                              <p className="text-matrix-green/70">Date</p>
                              <p className="font-semibold text-matrix-green">
                                {new Date(signal.date).toLocaleDateString()}
                              </p>
                            </div>
                          </div>
                          
                          <div className="flex items-center gap-2 mt-3">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => window.open(signal.url, '_blank')}
                              className="border-matrix-green/30 text-matrix-green hover:bg-matrix-green/10"
                            >
                              <ExternalLink className="w-3 h-3 mr-1" />
                              View Source
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => copyToClipboard(signal.url)}
                              className="border-matrix-green/30 text-matrix-green hover:bg-matrix-green/10"
                            >
                              <Copy className="w-3 h-3 mr-1" />
                              Copy URL
                            </Button>
                          </div>
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
                <Link className="w-12 h-12 text-matrix-green/50 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-matrix-green mb-2">
                  No Authority Signals Yet
                </h3>
                <p className="text-matrix-green/70">
                  Run the tracking analysis to discover authority signals for your domain.
                </p>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="mentions">
          {authorityData ? (
            <Card className="content-card">
              <CardHeader>
                <CardTitle className="text-matrix-green">Brand Mentions</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {authorityData.brandMentions.map((mention, index) => (
                    <div key={index} className="border border-matrix-green/20 rounded-lg p-4">
                      <div className="flex items-start gap-3">
                        <MessageSquare className="w-5 h-5 text-matrix-green mt-1" />
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <h4 className="font-semibold text-matrix-green">{mention.source}</h4>
                            <Badge className={getSentimentColor(mention.sentiment)}>
                              {mention.sentiment}
                            </Badge>
                            <Badge variant="outline" className="border-matrix-green/30 text-matrix-green">
                              {mention.platform}
                            </Badge>
                          </div>
                          <p className="text-matrix-green/90 text-sm mb-3">"{mention.content}"</p>
                          
                          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 text-sm">
                            <div>
                              <p className="text-matrix-green/70">Reach</p>
                              <p className="font-semibold text-matrix-green">{mention.reach.toLocaleString()}</p>
                            </div>
                            <div>
                              <p className="text-matrix-green/70">Engagement</p>
                              <p className="font-semibold text-matrix-green">{mention.engagement.toLocaleString()}</p>
                            </div>
                            <div>
                              <p className="text-matrix-green/70">Influence Score</p>
                              <p className={`font-semibold ${getScoreColor(mention.influenceScore)}`}>
                                {mention.influenceScore}/100
                              </p>
                            </div>
                            <div>
                              <p className="text-matrix-green/70">Date</p>
                              <p className="font-semibold text-matrix-green">
                                {new Date(mention.date).toLocaleDateString()}
                              </p>
                            </div>
                          </div>
                          
                          <div className="flex items-center gap-2 mt-3">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => window.open(mention.url, '_blank')}
                              className="border-matrix-green/30 text-matrix-green hover:bg-matrix-green/10"
                            >
                              <ExternalLink className="w-3 h-3 mr-1" />
                              View Mention
                            </Button>
                          </div>
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
                <MessageSquare className="w-12 h-12 text-matrix-green/50 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-matrix-green mb-2">
                  No Brand Mentions Yet
                </h3>
                <p className="text-matrix-green/70">
                  Run the tracking analysis to discover brand mentions across platforms.
                </p>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="recognition">
          {authorityData ? (
            <Card className="content-card">
              <CardHeader>
                <CardTitle className="text-matrix-green">Expert Recognition</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {authorityData.expertRecognition.map((recognition, index) => (
                    <div key={index} className="border border-matrix-green/20 rounded-lg p-4">
                      <div className="flex items-start gap-3">
                        <Star className="w-5 h-5 text-matrix-green mt-1" />
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <h4 className="font-semibold text-matrix-green">{recognition.recognition}</h4>
                            <Badge variant="outline" className="border-matrix-green/30 text-matrix-green">
                              {recognition.platform}
                            </Badge>
                            {getImpactIcon(recognition.impact)}
                          </div>
                          <p className="text-matrix-green/90 text-sm mb-3">{recognition.description}</p>
                          
                          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                            <div>
                              <p className="text-matrix-green/70">Impact Level</p>
                              <p className="font-semibold text-matrix-green capitalize">{recognition.impact}</p>
                            </div>
                            <div>
                              <p className="text-matrix-green/70">Authority Boost</p>
                              <p className="font-semibold text-matrix-green">+{recognition.authorityBoost} points</p>
                            </div>
                            <div>
                              <p className="text-matrix-green/70">Date</p>
                              <p className="font-semibold text-matrix-green">
                                {new Date(recognition.date).toLocaleDateString()}
                              </p>
                            </div>
                          </div>
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
                <Star className="w-12 h-12 text-matrix-green/50 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-matrix-green mb-2">
                  No Expert Recognition Yet
                </h3>
                <p className="text-matrix-green/70">
                  Run the tracking analysis to discover expert recognition opportunities.
                </p>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="competitive">
          {authorityData ? (
            <Card className="content-card">
              <CardHeader>
                <CardTitle className="text-matrix-green">Competitive Authority Analysis</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {authorityData.competitorComparison.map((comp, index) => (
                    <div key={index} className="flex items-center justify-between p-4 bg-secondary/30 rounded border">
                      <div className="flex items-center gap-3">
                        <Globe className="w-5 h-5 text-matrix-green" />
                        <div>
                          <h4 className="font-semibold text-matrix-green">{comp.competitor}</h4>
                          <p className="text-sm text-matrix-green/70">
                            {comp.mentionVolume.toLocaleString()} mentions/month
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className={`text-lg font-bold ${getScoreColor(comp.authorityScore)}`}>
                          {comp.authorityScore}/100
                        </div>
                        <div className={`text-sm ${comp.difference >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                          {comp.difference >= 0 ? '+' : ''}{comp.difference} vs you
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
                <BarChart3 className="w-12 h-12 text-matrix-green/50 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-matrix-green mb-2">
                  No Competitive Analysis Yet
                </h3>
                <p className="text-matrix-green/70">
                  Add competitors and run the analysis to see competitive authority comparison.
                </p>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="recommendations">
          {authorityData ? (
            <Card className="content-card">
              <CardHeader>
                <CardTitle className="text-matrix-green">Authority Building Recommendations</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {authorityData.recommendations.map((rec, index) => (
                    <div key={index} className="border border-matrix-green/20 rounded-lg p-4">
                      <div className="flex items-start gap-3">
                        <Zap className="w-5 h-5 text-matrix-green mt-1" />
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <h4 className="font-semibold text-matrix-green">{rec.title}</h4>
                            <Badge className={`text-xs ${rec.priority === 'high' ? 'bg-red-500/20 text-red-400' : rec.priority === 'medium' ? 'bg-yellow-500/20 text-yellow-400' : 'bg-green-500/20 text-green-400'}`}>
                              {rec.priority}
                            </Badge>
                            <Badge variant="outline" className="text-xs border-matrix-green/30 text-matrix-green">
                              {rec.type}
                            </Badge>
                          </div>
                          <p className="text-matrix-green/90 mb-3">{rec.description}</p>
                          <div className="grid grid-cols-2 gap-4 text-sm text-matrix-green/70">
                            <div className="flex items-center gap-2">
                              <CheckCircle className="w-3 h-3" />
                              <span>Effort: {rec.effort}</span>
                            </div>
                            <div className="flex items-center gap-2">
                              <TrendingUp className="w-3 h-3" />
                              <span>Impact: {rec.expectedImpact}</span>
                            </div>
                          </div>
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
                <Zap className="w-12 h-12 text-matrix-green/50 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-matrix-green mb-2">
                  No Recommendations Yet
                </h3>
                <p className="text-matrix-green/70">
                  Complete the authority analysis to get personalized recommendations.
                </p>
              </CardContent>
            </Card>
          )}
        </TabsContent>
      </Tabs>

      {authorityData && (
        <div className="text-center text-sm text-matrix-green/60 mt-6">
          Last analyzed: {new Date(authorityData.lastAnalyzed).toLocaleString()}
        </div>
      )}
    </div>
  );
};

export default AuthorityTracker;