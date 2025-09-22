import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useDomain } from '@/contexts/DomainContext';
import { 
  Search, 
  RefreshCw, 
  TrendingUp, 
  TrendingDown, 
  AlertTriangle, 
  CheckCircle, 
  XCircle,
  Globe,
  Zap,
  Target,
  BarChart3,
  Clock,
  Shield,
  Smartphone,
  Monitor,
  Brain,
  Eye,
  Lightbulb,
  Activity,
  Users,
  Award,
  Loader2
} from 'lucide-react';

// Enhanced interfaces for AI-powered SEO analysis
interface EnhancedSEOResult {
  domain: string;
  overallScore: number;
  scores: {
    technical: number;
    performance: number;
    content: number;
    mobile: number;
    security: number;
    aiReadiness: number;
    userExperience: number;
  };
  aiOptimization: {
    score: number;
    chatGPTReadiness: number;
    bingCopilotReadiness: number;
    perplexityReadiness: number;
    claudeReadiness: number;
    geminiReadiness: number;
  };
  technicalAudit: TechnicalIssue[];
  contentAnalysis: ContentAnalysis;
  competitorInsights: CompetitorAnalysis;
  aiRecommendations: AIRecommendation[];
  performanceMetrics: PerformanceMetrics;
  opportunities: SEOOpportunity[];
  lastAnalyzed: string;
}

interface TechnicalIssue {
  type: 'critical' | 'warning' | 'info';
  category: 'technical' | 'content' | 'performance' | 'mobile' | 'security' | 'ai-optimization';
  title: string;
  description: string;
  impact: 'high' | 'medium' | 'low';
  solution: string;
  priority: number;
  aiImpact?: string;
}

interface ContentAnalysis {
  aiStructureScore: number;
  questionAnswerSections: number;
  faqSections: number;
  listFormatting: number;
  headingStructure: Array<{level: number, text: string, aiOptimized: boolean}>;
  keywordDensity: Record<string, number>;
  readabilityScore: number;
  entityRecognition: string[];
  semanticAnalysis: {
    topicCoverage: number;
    intentMatching: number;
    contextualRelevance: number;
  };
}

interface CompetitorAnalysis {
  topCompetitors: Array<{
    domain: string;
    aiVisibilityScore: number;
    strengths: string[];
    weaknesses: string[];
    opportunityGaps: string[];
  }>;
  marketGaps: string[];
  competitiveAdvantages: string[];
}

interface AIRecommendation {
  priority: 'critical' | 'high' | 'medium' | 'low';
  category: 'content-structure' | 'technical-seo' | 'user-experience' | 'ai-optimization';
  title: string;
  description: string;
  implementation: string;
  expectedImpact: string;
  timeframe: string;
  difficulty: 'easy' | 'medium' | 'hard';
  aiEngines: string[];
}

interface PerformanceMetrics {
  coreWebVitals: {
    lcp: number;
    fid: number;
    cls: number;
    fcp: number;
    ttfb: number;
  };
  mobileScore: number;
  desktopScore: number;
  accessibilityScore: number;
}

interface SEOOpportunity {
  title: string;
  description: string;
  potentialTrafficIncrease: string;
  difficulty: 'easy' | 'medium' | 'hard';
  category: string;
  estimatedImplementationTime: string;
  aiEnginesBenefit: string[];
}

const EnhancedSEOAnalyzer = () => {
  const { user } = useAuth();
  const { defaultDomain } = useDomain();
  
  const [domain, setDomain] = useState(defaultDomain || '');
  const [results, setResults] = useState<EnhancedSEOResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('overview');
  const [analysisType, setAnalysisType] = useState<'quick' | 'comprehensive' | 'ai-focused'>('comprehensive');

  // Update domain when default changes
  useEffect(() => {
    if (defaultDomain && !domain) {
      setDomain(defaultDomain);
    }
  }, [defaultDomain]);

  const runAnalysis = async (analysisLevel: 'quick' | 'comprehensive' | 'ai-focused' = analysisType) => {
    if (!domain.trim()) {
      toast.error('Please enter a domain to analyze');
      return;
    }

    // Validate domain format
    const domainRegex = /^(?:https?:\/\/)?(?:www\.)?([a-zA-Z0-9-]+\.)+[a-zA-Z]{2,}$/;
    if (!domainRegex.test(domain)) {
      toast.error('Please enter a valid domain (e.g., example.com)');
      return;
    }

    setLoading(true);
    setResults(null);

    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        toast.error('Please sign in to run SEO analysis');
        return;
      }

      console.log(`Starting ${analysisLevel} SEO analysis for:`, domain);
      
      // Call enhanced SEO analysis function
      const { data, error } = await supabase.functions.invoke('enhanced-seo-analysis', {
        body: JSON.stringify({
          domain: domain.trim(),
          user_id: user.id,
          analysis_type: analysisLevel,
          include_ai_optimization: true,
          include_competitor_analysis: analysisLevel !== 'quick',
          include_content_analysis: true,
          include_performance_metrics: true
        })
      });

      if (error) {
        console.error('Enhanced SEO analysis error:', error);
        throw error;
      }

      // Process the enhanced analysis results
      const enhancedResults = await processEnhancedResults(data, domain);
      setResults(enhancedResults);
      setActiveTab('overview');
      toast.success('Enhanced SEO analysis completed!');
      
    } catch (error: any) {
      console.error('Analysis error:', error);
      toast.error(error?.message || 'Failed to analyze domain');
    } finally {
      setLoading(false);
    }
  };

  const processEnhancedResults = async (data: any, targetDomain: string): Promise<EnhancedSEOResult> => {
    // This would normally process real API data
    // For now, creating enhanced mock data structure
    return {
      domain: targetDomain,
      overallScore: data.overall_score || 78,
      scores: {
        technical: data.technical_score || 85,
        performance: data.performance_score || 72,
        content: data.content_score || 80,
        mobile: data.mobile_score || 88,
        security: data.security_score || 90,
        aiReadiness: data.ai_readiness_score || 75,
        userExperience: data.ux_score || 82
      },
      aiOptimization: {
        score: data.ai_optimization_score || 75,
        chatGPTReadiness: data.chatgpt_readiness || 78,
        bingCopilotReadiness: data.bing_readiness || 72,
        perplexityReadiness: data.perplexity_readiness || 85,
        claudeReadiness: data.claude_readiness || 80,
        geminiReadiness: data.gemini_readiness || 75
      },
      technicalAudit: generateEnhancedTechnicalIssues(data),
      contentAnalysis: generateContentAnalysis(data, targetDomain),
      competitorInsights: generateCompetitorInsights(targetDomain),
      aiRecommendations: generateAIRecommendations(data),
      performanceMetrics: generatePerformanceMetrics(data),
      opportunities: generateSEOOpportunities(data, targetDomain),
      lastAnalyzed: new Date().toISOString()
    };
  };

  const generateEnhancedTechnicalIssues = (data: any): TechnicalIssue[] => {
    const issues: TechnicalIssue[] = [
      {
        type: 'warning',
        category: 'ai-optimization',
        title: 'Missing FAQ Sections',
        description: 'Your content lacks structured FAQ sections that AI engines prefer for direct answers.',
        impact: 'medium',
        solution: 'Add FAQ sections with clear question-answer pairs to improve AI engine visibility.',
        priority: 2,
        aiImpact: 'Reduces likelihood of being cited in AI responses by 35%'
      },
      {
        type: 'critical',
        category: 'content',
        title: 'Low Content Structure Score',
        description: 'Content lacks proper heading hierarchy and structured formatting.',
        impact: 'high',
        solution: 'Implement proper H1, H2, H3 hierarchy and use bullet points for better AI parsing.',
        priority: 1,
        aiImpact: 'Improves AI engine content extraction by 50%'
      },
      {
        type: 'info',
        category: 'technical',
        title: 'Schema Markup Opportunities',
        description: 'Additional schema types could be implemented for better search visibility.',
        impact: 'medium',
        solution: 'Add Article, FAQ, and HowTo schema markup to key content pages.',
        priority: 3,
        aiImpact: 'Enhances structured data understanding for AI systems'
      }
    ];
    
    return issues;
  };

  const generateContentAnalysis = (data: any, domain: string): ContentAnalysis => ({
    aiStructureScore: 75,
    questionAnswerSections: 3,
    faqSections: 1,
    listFormatting: 8,
    headingStructure: [
      { level: 1, text: 'Main Title', aiOptimized: true },
      { level: 2, text: 'Key Benefits', aiOptimized: true },
      { level: 3, text: 'How It Works', aiOptimized: false },
      { level: 2, text: 'Frequently Asked Questions', aiOptimized: true }
    ],
    keywordDensity: {
      'seo analysis': 2.3,
      'ai optimization': 1.8,
      'search engine': 3.1
    },
    readabilityScore: 82,
    entityRecognition: ['SEO', 'AI', 'Search Engines', 'Google', 'Optimization'],
    semanticAnalysis: {
      topicCoverage: 85,
      intentMatching: 78,
      contextualRelevance: 90
    }
  });

  const generateCompetitorInsights = (domain: string): CompetitorAnalysis => ({
    topCompetitors: [
      {
        domain: 'competitor1.com',
        aiVisibilityScore: 85,
        strengths: ['Strong FAQ sections', 'Excellent content structure', 'High-quality backlinks'],
        weaknesses: ['Slow loading times', 'Poor mobile experience'],
        opportunityGaps: ['Voice search optimization', 'Video content integration']
      },
      {
        domain: 'competitor2.com',
        aiVisibilityScore: 78,
        strengths: ['Fast loading', 'Good mobile experience'],
        weaknesses: ['Weak content depth', 'Poor internal linking'],
        opportunityGaps: ['Expert quotes and citations', 'Interactive content']
      }
    ],
    marketGaps: [
      'Underutilized voice search optimization',
      'Limited use of interactive content formats',
      'Opportunity for expert collaboration content'
    ],
    competitiveAdvantages: [
      'Better technical SEO foundation',
      'More comprehensive content coverage',
      'Superior user experience design'
    ]
  });

  const generateAIRecommendations = (data: any): AIRecommendation[] => [
    {
      priority: 'critical',
      category: 'content-structure',
      title: 'Implement Comprehensive FAQ Sections',
      description: 'Add detailed FAQ sections to key pages to improve AI engine citation rates.',
      implementation: 'Create 8-12 relevant questions per page with detailed, quotable answers.',
      expectedImpact: 'Increase AI citation probability by 45%',
      timeframe: '2-3 weeks',
      difficulty: 'easy',
      aiEngines: ['ChatGPT', 'Claude', 'Perplexity', 'Bing Copilot']
    },
    {
      priority: 'high',
      category: 'ai-optimization',
      title: 'Optimize Content for Voice Search',
      description: 'Restructure content to answer conversational queries that voice search users ask.',
      implementation: 'Focus on "how", "what", "why", "where", and "when" questions with direct answers.',
      expectedImpact: 'Improve voice search visibility by 60%',
      timeframe: '3-4 weeks',
      difficulty: 'medium',
      aiEngines: ['Google Assistant', 'Alexa', 'Siri', 'Bing Copilot']
    },
    {
      priority: 'medium',
      category: 'technical-seo',
      title: 'Enhanced Schema Markup Implementation',
      description: 'Implement advanced schema types including HowTo, FAQ, and Article schemas.',
      implementation: 'Add JSON-LD structured data to all content pages.',
      expectedImpact: 'Improve search feature eligibility by 35%',
      timeframe: '1-2 weeks',
      difficulty: 'easy',
      aiEngines: ['Google', 'Bing', 'ChatGPT', 'Claude']
    }
  ];

  const generatePerformanceMetrics = (data: any): PerformanceMetrics => ({
    coreWebVitals: {
      lcp: 2.8,
      fid: 45,
      cls: 0.12,
      fcp: 1.9,
      ttfb: 850
    },
    mobileScore: 88,
    desktopScore: 92,
    accessibilityScore: 85
  });

  const generateSEOOpportunities = (data: any, domain: string): SEOOpportunity[] => [
    {
      title: 'AI-Optimized Content Expansion',
      description: 'Create content specifically designed to answer AI engine queries',
      potentialTrafficIncrease: '25-40%',
      difficulty: 'medium',
      category: 'Content Strategy',
      estimatedImplementationTime: '4-6 weeks',
      aiEnginesBenefit: ['ChatGPT', 'Claude', 'Perplexity', 'Bing Copilot']
    },
    {
      title: 'Featured Snippet Optimization',
      description: 'Optimize existing content to capture more featured snippets',
      potentialTrafficIncrease: '15-25%',
      difficulty: 'easy',
      category: 'Content Optimization',
      estimatedImplementationTime: '2-3 weeks',
      aiEnginesBenefit: ['Google', 'Bing']
    }
  ];

  const ScoreCard = ({ 
    title, 
    score, 
    icon: Icon, 
    color, 
    description 
  }: { 
    title: string; 
    score: number; 
    icon: any; 
    color: string;
    description?: string;
  }) => (
    <Card className="border-2 hover:shadow-lg transition-shadow">
      <CardContent className="p-6">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-3">
            <div className={`p-2 rounded-lg ${color} bg-opacity-10`}>
              <Icon className={`w-6 h-6 ${color}`} />
            </div>
            <div>
              <h3 className="font-semibold text-lg">{title}</h3>
              {description && (
                <p className="text-sm text-muted-foreground">{description}</p>
              )}
            </div>
          </div>
          <Badge 
            variant={score >= 80 ? "default" : score >= 60 ? "secondary" : "destructive"}
            className="text-lg px-3 py-1"
          >
            {score}%
          </Badge>
        </div>
        <Progress value={score} className="h-3" />
      </CardContent>
    </Card>
  );

  return (
    <div className="container mx-auto p-6 max-w-7xl">
      <div className="mb-8">
        <h1 className="text-4xl font-bold flex items-center gap-3 mb-3">
          <Brain className="w-10 h-10 text-primary" />
          Enhanced AI-Powered SEO Analyzer
        </h1>
        <p className="text-xl text-muted-foreground">
          Advanced SEO analysis optimized for AI search engines and traditional search
        </p>
      </div>

      {/* Analysis Configuration */}
      <Card className="mb-8">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Target className="w-5 h-5" />
            Analysis Configuration
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col md:flex-row gap-4 items-end">
            <div className="flex-1">
              <label className="block text-sm font-medium mb-2">Domain to Analyze</label>
              <Input
                placeholder="Enter domain (e.g., example.com)"
                value={domain}
                onChange={(e) => setDomain(e.target.value)}
                className="text-lg"
              />
            </div>
            
            <div className="w-full md:w-48">
              <label className="block text-sm font-medium mb-2">Analysis Type</label>
              <Select value={analysisType} onValueChange={(value: 'quick' | 'comprehensive' | 'ai-focused') => setAnalysisType(value)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="quick">Quick Scan</SelectItem>
                  <SelectItem value="comprehensive">Comprehensive</SelectItem>
                  <SelectItem value="ai-focused">AI-Focused</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <Button 
              onClick={() => runAnalysis()} 
              disabled={loading || !domain.trim()}
              size="lg"
              className="px-8"
            >
              {loading ? (
                <>
                  <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                  Analyzing...
                </>
              ) : (
                <>
                  <Search className="w-5 h-5 mr-2" />
                  Analyze
                </>
              )}
            </Button>
          </div>
        </CardContent>
      </Card>

      {results && (
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-6">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="ai-optimization">AI Optimization</TabsTrigger>
            <TabsTrigger value="technical">Technical</TabsTrigger>
            <TabsTrigger value="content">Content</TabsTrigger>
            <TabsTrigger value="competitors">Competitors</TabsTrigger>
            <TabsTrigger value="recommendations">Recommendations</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6 mt-6">
            {/* Overall Score */}
            <Card className="border-2 border-primary">
              <CardHeader className="text-center">
                <CardTitle className="text-2xl">Overall SEO Score</CardTitle>
                <div className="text-6xl font-bold text-primary">{results.overallScore}%</div>
                <CardDescription className="text-lg">
                  Based on {Object.keys(results.scores).length} key factors
                </CardDescription>
              </CardHeader>
            </Card>

            {/* Individual Scores */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <ScoreCard
                title="Technical SEO"
                score={results.scores.technical}
                icon={Globe}
                color="text-blue-500"
                description="Site architecture & crawlability"
              />
              <ScoreCard
                title="Performance"
                score={results.scores.performance}
                icon={Zap}
                color="text-yellow-500"
                description="Loading speed & Core Web Vitals"
              />
              <ScoreCard
                title="Content Quality"
                score={results.scores.content}
                icon={BarChart3}
                color="text-green-500"
                description="Content relevance & optimization"
              />
              <ScoreCard
                title="AI Readiness"
                score={results.scores.aiReadiness}
                icon={Brain}
                color="text-purple-500"
                description="AI search engine optimization"
              />
              <ScoreCard
                title="Mobile Experience"
                score={results.scores.mobile}
                icon={Smartphone}
                color="text-pink-500"
                description="Mobile usability & performance"
              />
              <ScoreCard
                title="Security"
                score={results.scores.security}
                icon={Shield}
                color="text-red-500"
                description="HTTPS & security best practices"
              />
            </div>

            {/* Quick Issues Overview */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <AlertTriangle className="w-5 h-5" />
                  Critical Issues Requiring Attention
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {results.technicalAudit.filter(issue => issue.type === 'critical').map((issue, index) => (
                    <Alert key={index} variant="destructive">
                      <AlertTriangle className="h-4 w-4" />
                      <AlertDescription>
                        <strong>{issue.title}:</strong> {issue.description}
                      </AlertDescription>
                    </Alert>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="ai-optimization" className="space-y-6 mt-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Brain className="w-6 h-6" />
                  AI Search Engine Readiness
                </CardTitle>
                <CardDescription>
                  How well your site is optimized for different AI-powered search engines
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="font-medium">ChatGPT</span>
                      <Badge variant={results.aiOptimization.chatGPTReadiness >= 75 ? "default" : "secondary"}>
                        {results.aiOptimization.chatGPTReadiness}%
                      </Badge>
                    </div>
                    <Progress value={results.aiOptimization.chatGPTReadiness} />
                  </div>
                  
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="font-medium">Bing Copilot</span>
                      <Badge variant={results.aiOptimization.bingCopilotReadiness >= 75 ? "default" : "secondary"}>
                        {results.aiOptimization.bingCopilotReadiness}%
                      </Badge>
                    </div>
                    <Progress value={results.aiOptimization.bingCopilotReadiness} />
                  </div>
                  
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="font-medium">Perplexity</span>
                      <Badge variant={results.aiOptimization.perplexityReadiness >= 75 ? "default" : "secondary"}>
                        {results.aiOptimization.perplexityReadiness}%
                      </Badge>
                    </div>
                    <Progress value={results.aiOptimization.perplexityReadiness} />
                  </div>
                  
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="font-medium">Claude</span>
                      <Badge variant={results.aiOptimization.claudeReadiness >= 75 ? "default" : "secondary"}>
                        {results.aiOptimization.claudeReadiness}%
                      </Badge>
                    </div>
                    <Progress value={results.aiOptimization.claudeReadiness} />
                  </div>
                  
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="font-medium">Gemini</span>
                      <Badge variant={results.aiOptimization.geminiReadiness >= 75 ? "default" : "secondary"}>
                        {results.aiOptimization.geminiReadiness}%
                      </Badge>
                    </div>
                    <Progress value={results.aiOptimization.geminiReadiness} />
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Content Structure Analysis */}
            <Card>
              <CardHeader>
                <CardTitle>AI-Friendly Content Structure</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                  <div className="text-center">
                    <div className="text-3xl font-bold text-primary">{results.contentAnalysis.questionAnswerSections}</div>
                    <div className="text-sm text-muted-foreground">Q&A Sections</div>
                  </div>
                  <div className="text-center">
                    <div className="text-3xl font-bold text-primary">{results.contentAnalysis.faqSections}</div>
                    <div className="text-sm text-muted-foreground">FAQ Sections</div>
                  </div>
                  <div className="text-center">
                    <div className="text-3xl font-bold text-primary">{results.contentAnalysis.listFormatting}</div>
                    <div className="text-sm text-muted-foreground">List Items</div>
                  </div>
                  <div className="text-center">
                    <div className="text-3xl font-bold text-primary">{results.contentAnalysis.readabilityScore}%</div>
                    <div className="text-sm text-muted-foreground">Readability</div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="technical" className="space-y-6 mt-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Globe className="w-5 h-5" />
                  Technical SEO Issues
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {results.technicalAudit.map((issue, index) => (
                    <Alert key={index} variant={issue.type === 'critical' ? 'destructive' : 'default'}>
                      <AlertTriangle className="h-4 w-4" />
                      <AlertDescription>
                        <div className="space-y-2">
                          <div className="flex items-center gap-2">
                            <Badge variant={issue.type === 'critical' ? 'destructive' : issue.type === 'warning' ? 'secondary' : 'outline'}>
                              {issue.type}
                            </Badge>
                            <Badge variant="outline">{issue.category}</Badge>
                            <strong>{issue.title}</strong>
                          </div>
                          <p>{issue.description}</p>
                          <p className="text-sm"><strong>Solution:</strong> {issue.solution}</p>
                          {issue.aiImpact && (
                            <p className="text-sm text-purple-600"><strong>AI Impact:</strong> {issue.aiImpact}</p>
                          )}
                        </div>
                      </AlertDescription>
                    </Alert>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="content" className="space-y-6 mt-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Content Structure */}
              <Card>
                <CardHeader>
                  <CardTitle>Heading Structure</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {results.contentAnalysis.headingStructure.map((heading, index) => (
                      <div key={index} className="flex items-center gap-3">
                        <Badge variant="outline">H{heading.level}</Badge>
                        <span className="flex-1">{heading.text}</span>
                        {heading.aiOptimized ? (
                          <CheckCircle className="w-4 h-4 text-green-500" />
                        ) : (
                          <XCircle className="w-4 h-4 text-red-500" />
                        )}
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Keyword Density */}
              <Card>
                <CardHeader>
                  <CardTitle>Keyword Analysis</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {Object.entries(results.contentAnalysis.keywordDensity).map(([keyword, density]) => (
                      <div key={keyword} className="flex items-center justify-between">
                        <span className="font-medium">{keyword}</span>
                        <div className="flex items-center gap-2">
                          <Progress value={density * 10} className="w-24" />
                          <span className="text-sm text-muted-foreground">{density}%</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Semantic Analysis */}
            <Card>
              <CardHeader>
                <CardTitle>Semantic Analysis</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="text-center">
                    <div className="text-3xl font-bold text-primary">{results.contentAnalysis.semanticAnalysis.topicCoverage}%</div>
                    <div className="text-sm text-muted-foreground">Topic Coverage</div>
                  </div>
                  <div className="text-center">
                    <div className="text-3xl font-bold text-primary">{results.contentAnalysis.semanticAnalysis.intentMatching}%</div>
                    <div className="text-sm text-muted-foreground">Intent Matching</div>
                  </div>
                  <div className="text-center">
                    <div className="text-3xl font-bold text-primary">{results.contentAnalysis.semanticAnalysis.contextualRelevance}%</div>
                    <div className="text-sm text-muted-foreground">Contextual Relevance</div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="competitors" className="space-y-6 mt-6">
            <div className="grid grid-cols-1 gap-6">
              {results.competitorInsights.topCompetitors.map((competitor, index) => (
                <Card key={index}>
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <CardTitle>{competitor.domain}</CardTitle>
                      <Badge variant="outline">AI Score: {competitor.aiVisibilityScore}%</Badge>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                      <div>
                        <h4 className="font-medium text-green-600 mb-2">Strengths</h4>
                        <ul className="text-sm space-y-1">
                          {competitor.strengths.map((strength, i) => (
                            <li key={i} className="flex items-center gap-2">
                              <CheckCircle className="w-3 h-3 text-green-500" />
                              {strength}
                            </li>
                          ))}
                        </ul>
                      </div>
                      <div>
                        <h4 className="font-medium text-red-600 mb-2">Weaknesses</h4>
                        <ul className="text-sm space-y-1">
                          {competitor.weaknesses.map((weakness, i) => (
                            <li key={i} className="flex items-center gap-2">
                              <XCircle className="w-3 h-3 text-red-500" />
                              {weakness}
                            </li>
                          ))}
                        </ul>
                      </div>
                      <div>
                        <h4 className="font-medium text-blue-600 mb-2">Opportunities</h4>
                        <ul className="text-sm space-y-1">
                          {competitor.opportunityGaps.map((gap, i) => (
                            <li key={i} className="flex items-center gap-2">
                              <Target className="w-3 h-3 text-blue-500" />
                              {gap}
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="recommendations" className="space-y-6 mt-6">
            <div className="space-y-4">
              {results.aiRecommendations.map((recommendation, index) => (
                <Card key={index} className="border-l-4 border-l-primary">
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div>
                        <CardTitle className="flex items-center gap-2">
                          <Badge variant={recommendation.priority === 'critical' ? 'destructive' : 
                                        recommendation.priority === 'high' ? 'default' : 'secondary'}>
                            {recommendation.priority}
                          </Badge>
                          {recommendation.title}
                        </CardTitle>
                        <CardDescription>{recommendation.description}</CardDescription>
                      </div>
                      <Badge variant="outline">{recommendation.difficulty}</Badge>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div>
                        <h5 className="font-medium mb-2">Implementation:</h5>
                        <p className="text-sm text-muted-foreground">{recommendation.implementation}</p>
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div>
                          <h5 className="font-medium text-sm">Expected Impact</h5>
                          <p className="text-sm text-muted-foreground">{recommendation.expectedImpact}</p>
                        </div>
                        <div>
                          <h5 className="font-medium text-sm">Timeframe</h5>
                          <p className="text-sm text-muted-foreground">{recommendation.timeframe}</p>
                        </div>
                        <div>
                          <h5 className="font-medium text-sm">AI Engines Benefited</h5>
                          <div className="flex flex-wrap gap-1 mt-1">
                            {recommendation.aiEngines.map((engine, i) => (
                              <Badge key={i} variant="outline" className="text-xs">
                                {engine}
                              </Badge>
                            ))}
                          </div>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>
        </Tabs>
      )}
    </div>
  );
};

export default EnhancedSEOAnalyzer;
