import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  Search,
  Target,
  Globe,
  BarChart3,
  CheckCircle,
  AlertTriangle,
  Copy,
  Download,
  Zap,
  TrendingUp
} from 'lucide-react';
import { toast } from 'sonner';

interface SEOMetrics {
  score: number;
  keywords: string[];
  metaTitle: string;
  metaDescription: string;
  recommendations: string[];
  technicalIssues: string[];
  opportunities: string[];
}

interface SEOTemplateProps {
  domain?: string;
  onAnalyze?: (domain: string) => void;
  initialData?: SEOMetrics;
}

const SEOTemplate: React.FC<SEOTemplateProps> = ({ 
  domain: initialDomain = '', 
  onAnalyze,
  initialData 
}) => {
  const [domain, setDomain] = useState(initialDomain);
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('overview');
  const [seoData, setSeoData] = useState<SEOMetrics>(initialData || {
    score: 0,
    keywords: [],
    metaTitle: '',
    metaDescription: '',
    recommendations: [],
    technicalIssues: [],
    opportunities: []
  });

  const handleAnalyze = async () => {
    if (!domain.trim()) {
      toast.error('Please enter a domain to analyze');
      return;
    }

    setLoading(true);
    try {
      if (onAnalyze) {
        await onAnalyze(domain);
      } else {
        // Simulate analysis with sample data
        await new Promise(resolve => setTimeout(resolve, 2000));
        setSeoData({
          score: Math.floor(Math.random() * 40) + 60, // 60-100
          keywords: ['SEO optimization', 'content marketing', 'search visibility'],
          metaTitle: `${domain} - Professional SEO Services`,
          metaDescription: `Improve your search rankings with our comprehensive SEO optimization services for ${domain}. Get more traffic and better visibility.`,
          recommendations: [
            'Optimize page loading speed',
            'Add structured data markup',
            'Improve internal linking structure',
            'Create more quality content'
          ],
          technicalIssues: [
            'Missing alt tags on images',
            'Broken internal links detected',
            'Multiple H1 tags found'
          ],
          opportunities: [
            'Target long-tail keywords',
            'Optimize for voice search',
            'Create FAQ sections',
            'Build topic clusters'
          ]
        });
      }
      toast.success('SEO analysis completed!');
    } catch (error) {
      toast.error('Analysis failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast.success('Copied to clipboard!');
  };

  const downloadReport = () => {
    const report = `
SEO Analysis Report - ${domain}
Generated: ${new Date().toLocaleDateString()}

OVERALL SCORE: ${seoData.score}/100

META INFORMATION:
Title: ${seoData.metaTitle}
Description: ${seoData.metaDescription}

TARGET KEYWORDS:
${seoData.keywords.map(k => `• ${k}`).join('\n')}

RECOMMENDATIONS:
${seoData.recommendations.map(r => `• ${r}`).join('\n')}

TECHNICAL ISSUES:
${seoData.technicalIssues.map(t => `• ${t}`).join('\n')}

OPPORTUNITIES:
${seoData.opportunities.map(o => `• ${o}`).join('\n')}
    `;

    const blob = new Blob([report], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `seo-analysis-${domain.replace(/[^a-z0-9]/gi, '-')}.txt`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-green-500';
    if (score >= 60) return 'text-yellow-500';
    return 'text-red-500';
  };

  const getScoreBadge = (score: number) => {
    if (score >= 80) return { label: 'Excellent', color: 'bg-green-500' };
    if (score >= 60) return { label: 'Good', color: 'bg-yellow-500' };
    return { label: 'Needs Work', color: 'bg-red-500' };
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="text-center">
        <h2 className="text-3xl font-bold text-matrix-green mb-2">🚀 SEO Analysis Template</h2>
        <p className="text-matrix-green/70">Comprehensive SEO optimization and analysis toolkit</p>
      </div>

      {/* Analysis Input */}
      <Card className="content-card">
        <CardHeader>
          <CardTitle className="text-matrix-green flex items-center">
            <Search className="w-5 h-5 mr-2" />
            Domain Analysis
          </CardTitle>
          <CardDescription>Enter a domain to perform comprehensive SEO analysis</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex gap-4 items-end">
            <div className="flex-1">
              <Input
                placeholder="Enter domain (e.g., example.com)"
                value={domain}
                onChange={(e) => setDomain(e.target.value)}
                className="text-lg"
              />
            </div>
            <Button 
              onClick={handleAnalyze}
              disabled={loading}
              className="glow-button text-black font-semibold px-8"
            >
              {loading ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-current mr-2"></div>
                  Analyzing...
                </>
              ) : (
                <>
                  <Zap className="w-4 h-4 mr-2" />
                  Analyze SEO
                </>
              )}
            </Button>
          </div>
        </CardContent>
      </Card>

      {seoData.score > 0 && (
        <>
          {/* SEO Score Overview */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card className="content-card hover-scale">
              <CardContent className="p-6 text-center">
                <div className="text-4xl font-bold mb-2 text-matrix-green">
                  {seoData.score}
                </div>
                <div className="text-sm text-matrix-green/70 mb-4">Overall SEO Score</div>
                <Progress value={seoData.score} className="h-3 mb-3" />
                <Badge className={`${getScoreBadge(seoData.score).color}/10 text-white`}>
                  {getScoreBadge(seoData.score).label}
                </Badge>
              </CardContent>
            </Card>

            <Card className="content-card hover-scale">
              <CardContent className="p-6 text-center">
                <Target className="w-8 h-8 text-matrix-green mx-auto mb-3" />
                <div className="text-2xl font-bold text-matrix-green mb-1">
                  {seoData.keywords.length}
                </div>
                <div className="text-sm text-matrix-green/70">Target Keywords</div>
              </CardContent>
            </Card>

            <Card className="content-card hover-scale">
              <CardContent className="p-6 text-center">
                <TrendingUp className="w-8 h-8 text-matrix-green mx-auto mb-3" />
                <div className="text-2xl font-bold text-matrix-green mb-1">
                  {seoData.opportunities.length}
                </div>
                <div className="text-sm text-matrix-green/70">Growth Opportunities</div>
              </CardContent>
            </Card>
          </div>

          {/* Detailed Analysis */}
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="overview">Overview</TabsTrigger>
              <TabsTrigger value="meta">Meta Data</TabsTrigger>
              <TabsTrigger value="technical">Technical</TabsTrigger>
              <TabsTrigger value="opportunities">Growth</TabsTrigger>
            </TabsList>

            <TabsContent value="overview" className="mt-6">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <Card className="content-card">
                  <CardHeader>
                    <CardTitle className="text-matrix-green">📈 Key Recommendations</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {seoData.recommendations.map((rec, index) => (
                        <div key={index} className="flex items-start space-x-3 p-3 rounded-lg bg-matrix-green/5">
                          <CheckCircle className="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0" />
                          <span className="text-sm text-matrix-green">{rec}</span>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>

                <Card className="content-card">
                  <CardHeader>
                    <CardTitle className="text-matrix-green">⚠️ Issues to Fix</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {seoData.technicalIssues.map((issue, index) => (
                        <div key={index} className="flex items-start space-x-3 p-3 rounded-lg bg-red-500/5">
                          <AlertTriangle className="w-5 h-5 text-red-500 mt-0.5 flex-shrink-0" />
                          <span className="text-sm text-matrix-green">{issue}</span>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            <TabsContent value="meta" className="mt-6">
              <Card className="content-card">
                <CardHeader>
                  <CardTitle className="text-matrix-green">📝 Meta Information</CardTitle>
                  <CardDescription>Optimize your page titles and descriptions</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div>
                    <label className="block text-sm font-medium text-matrix-green mb-2">
                      Meta Title ({seoData.metaTitle.length}/60 characters)
                    </label>
                    <div className="relative">
                      <Textarea
                        value={seoData.metaTitle}
                        onChange={(e) => setSeoData({...seoData, metaTitle: e.target.value})}
                        className="pr-10"
                        rows={2}
                      />
                      <Button
                        size="sm"
                        variant="ghost"
                        className="absolute top-2 right-2"
                        onClick={() => copyToClipboard(seoData.metaTitle)}
                      >
                        <Copy className="w-4 h-4" />
                      </Button>
                    </div>
                    <Progress 
                      value={(seoData.metaTitle.length / 60) * 100} 
                      className="mt-2 h-1"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-matrix-green mb-2">
                      Meta Description ({seoData.metaDescription.length}/160 characters)
                    </label>
                    <div className="relative">
                      <Textarea
                        value={seoData.metaDescription}
                        onChange={(e) => setSeoData({...seoData, metaDescription: e.target.value})}
                        className="pr-10"
                        rows={3}
                      />
                      <Button
                        size="sm"
                        variant="ghost"
                        className="absolute top-2 right-2"
                        onClick={() => copyToClipboard(seoData.metaDescription)}
                      >
                        <Copy className="w-4 h-4" />
                      </Button>
                    </div>
                    <Progress 
                      value={(seoData.metaDescription.length / 160) * 100} 
                      className="mt-2 h-1"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-matrix-green mb-2">
                      Target Keywords
                    </label>
                    <div className="flex flex-wrap gap-2">
                      {seoData.keywords.map((keyword, index) => (
                        <Badge key={index} variant="outline" className="text-matrix-green border-matrix-green/30">
                          {keyword}
                        </Badge>
                      ))}
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="technical" className="mt-6">
              <Card className="content-card">
                <CardHeader>
                  <CardTitle className="text-matrix-green">🔧 Technical SEO</CardTitle>
                  <CardDescription>Fix technical issues for better search performance</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {seoData.technicalIssues.map((issue, index) => (
                      <Alert key={index} className="border-red-500/30">
                        <AlertTriangle className="h-4 w-4 text-red-500" />
                        <AlertDescription className="text-matrix-green">
                          {issue}
                        </AlertDescription>
                      </Alert>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="opportunities" className="mt-6">
              <Card className="content-card">
                <CardHeader>
                  <CardTitle className="text-matrix-green">🚀 Growth Opportunities</CardTitle>
                  <CardDescription>Unlock your SEO potential with these strategies</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {seoData.opportunities.map((opportunity, index) => (
                      <div key={index} className="flex items-start space-x-3 p-4 rounded-lg bg-blue-500/5 border border-blue-500/20">
                        <TrendingUp className="w-5 h-5 text-blue-500 mt-0.5 flex-shrink-0" />
                        <div>
                          <span className="text-sm font-medium text-matrix-green">{opportunity}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>

          {/* Action Panel */}
          <Card className="content-card">
            <CardHeader>
              <CardTitle className="text-matrix-green">🎯 Take Action</CardTitle>
            </CardHeader>
            <CardContent className="flex flex-wrap gap-3">
              <Button onClick={downloadReport} variant="outline" className="hover-scale">
                <Download className="w-4 h-4 mr-2" />
                Download Report
              </Button>
              <Button onClick={() => copyToClipboard(seoData.metaTitle + '\n' + seoData.metaDescription)} variant="outline" className="hover-scale">
                <Copy className="w-4 h-4 mr-2" />
                Copy Meta Tags
              </Button>
              <Button onClick={handleAnalyze} variant="outline" className="hover-scale">
                <BarChart3 className="w-4 h-4 mr-2" />
                Re-analyze
              </Button>
            </CardContent>
          </Card>
        </>
      )}
    </div>
  );
};

export default SEOTemplate;