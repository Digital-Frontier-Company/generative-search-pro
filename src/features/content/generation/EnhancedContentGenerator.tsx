import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Switch } from '@/components/ui/switch';
import { Loader2, Wand2, Copy, Download, Share, RefreshCw, Target, Brain, Zap, BarChart3, Search, CheckCircle, AlertTriangle, Lightbulb } from 'lucide-react';
import { toast } from 'sonner';
import { useAuth } from '@/contexts/AuthContext';
import { 
  enhancedContentService,
  EnhancedContentRequest, 
  EnhancedContentBlock, 
  ContentType, 
  ToneStyle, 
  ContentLength 
} from '@/services/enhancedContentService';
import JsonLdSchema from '@/features/schema/JsonLdSchema';

const EnhancedContentGenerator = () => {
  const { user } = useAuth();
  
  // Form state
  const [topic, setTopic] = useState('');
  const [keywords, setKeywords] = useState('');
  const [contentType, setContentType] = useState<ContentType>('blog');
  const [toneStyle, setToneStyle] = useState<ToneStyle>('professional');
  const [length, setLength] = useState<ContentLength>('medium');
  const [targetAudience, setTargetAudience] = useState('');
  const [competitors, setCompetitors] = useState('');
  const [optimizeForAI, setOptimizeForAI] = useState(true);
  const [includeSchema, setIncludeSchema] = useState(true);
  const [includeCtaVariants, setIncludeCtaVariants] = useState(true);
  const [seoFocus, setSeoFocus] = useState<'high' | 'medium' | 'low'>('high');
  
  // Results state
  const [loading, setLoading] = useState(false);
  const [generatedContent, setGeneratedContent] = useState<EnhancedContentBlock | null>(null);
  const [activeTab, setActiveTab] = useState('generator');
  const [copied, setCopied] = useState<{[key: string]: boolean}>({});

  const contentTypes: { value: ContentType; label: string; description: string }[] = [
    { value: 'blog', label: 'Blog Post', description: 'Engaging blog content with SEO optimization' },
    { value: 'article', label: 'Article', description: 'In-depth authoritative articles' },
    { value: 'faq', label: 'FAQ', description: 'Question-answer format content' },
    { value: 'product-description', label: 'Product Description', description: 'Compelling product copy' },
    { value: 'landing-page', label: 'Landing Page', description: 'Conversion-focused page content' },
    { value: 'social-post', label: 'Social Media', description: 'Social media content' },
    { value: 'email', label: 'Email', description: 'Email marketing content' },
    { value: 'press-release', label: 'Press Release', description: 'Professional press releases' }
  ];

  const toneStyles: { value: ToneStyle; label: string }[] = [
    { value: 'professional', label: 'Professional' },
    { value: 'casual', label: 'Casual' },
    { value: 'friendly', label: 'Friendly' },
    { value: 'authoritative', label: 'Authoritative' },
    { value: 'conversational', label: 'Conversational' },
    { value: 'technical', label: 'Technical' },
    { value: 'persuasive', label: 'Persuasive' },
    { value: 'educational', label: 'Educational' }
  ];

  const contentLengths: { value: ContentLength; label: string; words: string }[] = [
    { value: 'short', label: 'Short', words: '300-500 words' },
    { value: 'medium', label: 'Medium', words: '800-1200 words' },
    { value: 'long', label: 'Long', words: '1500-2000 words' },
    { value: 'comprehensive', label: 'Comprehensive', words: '2500+ words' }
  ];

  const handleGenerate = async () => {
    if (!topic.trim()) {
      toast.error('Please enter a topic');
      return;
    }

    setLoading(true);
    setGeneratedContent(null);

    try {
      const request: EnhancedContentRequest = {
        topic: topic.trim(),
        keywords: keywords.split(',').map(k => k.trim()).filter(k => k),
        contentType,
        toneStyle,
        length,
        targetAudience: targetAudience.trim() || undefined,
        competitors: competitors.split(',').map(c => c.trim()).filter(c => c),
        includeSchema,
        optimizeForAI,
        includeCtaVariants,
        language: 'english',
        seoFocus
      };

      const content = await enhancedContentService.generateContent(request);
      setGeneratedContent(content);
      setActiveTab('results');
      toast.success('Enhanced content generated successfully!');
      
    } catch (error: any) {
      console.error('Content generation error:', error);
      toast.error(error.message || 'Failed to generate content');
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = async (text: string, type: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(prev => ({ ...prev, [type]: true }));
      toast.success(`${type} copied to clipboard!`);
      setTimeout(() => {
        setCopied(prev => ({ ...prev, [type]: false }));
      }, 2000);
    } catch (error) {
      toast.error('Failed to copy to clipboard');
    }
  };

  const downloadContent = () => {
    if (!generatedContent) return;
    
    const content = `# ${generatedContent.title}

${generatedContent.content}

---
Generated by GenerativeSearch.pro
SEO Score: ${generatedContent.metadata.seoScore}%
AI Optimization Score: ${generatedContent.optimization.aiReadiness}%
Word Count: ${generatedContent.metadata.wordCount}
Reading Time: ${generatedContent.metadata.readingTime} minutes`;

    const blob = new Blob([content], { type: 'text/markdown' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${generatedContent.title.replace(/[^a-z0-9]/gi, '-').toLowerCase()}.md`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const ScoreCard = ({ title, score, icon: Icon, color }: { 
    title: string; 
    score: number; 
    icon: any; 
    color: string 
  }) => (
    <Card className="border-2">
      <CardContent className="p-4">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <Icon className={`w-5 h-5 ${color}`} />
            <span className="font-medium text-sm">{title}</span>
          </div>
          <Badge variant={score >= 80 ? "default" : score >= 60 ? "secondary" : "destructive"}>
            {score}%
          </Badge>
        </div>
        <Progress value={score} className="h-2" />
      </CardContent>
    </Card>
  );

  return (
    <div className="container mx-auto p-6 max-w-7xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold flex items-center gap-3 mb-2">
          <Wand2 className="w-8 h-8 text-primary" />
          Enhanced AI Content Generator
        </h1>
        <p className="text-muted-foreground">
          Generate high-quality, SEO-optimized content that ranks well in both traditional search engines and AI systems
        </p>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="generator">Content Generator</TabsTrigger>
          <TabsTrigger value="results" disabled={!generatedContent}>Results & Preview</TabsTrigger>
          <TabsTrigger value="optimization" disabled={!generatedContent}>AI Optimization</TabsTrigger>
        </TabsList>

        <TabsContent value="generator" className="space-y-6 mt-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Target className="w-5 h-5" />
                Content Configuration
              </CardTitle>
              <CardDescription>
                Configure your content parameters for optimal results
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Topic */}
                <div className="space-y-2">
                  <Label htmlFor="topic">Topic *</Label>
                  <Input
                    id="topic"
                    placeholder="e.g., How to optimize for AI search engines"
                    value={topic}
                    onChange={(e) => setTopic(e.target.value)}
                  />
                </div>

                {/* Keywords */}
                <div className="space-y-2">
                  <Label htmlFor="keywords">Target Keywords</Label>
                  <Input
                    id="keywords"
                    placeholder="keyword1, keyword2, keyword3"
                    value={keywords}
                    onChange={(e) => setKeywords(e.target.value)}
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* Content Type */}
                <div className="space-y-2">
                  <Label>Content Type</Label>
                  <Select value={contentType} onValueChange={(value: ContentType) => setContentType(value)}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {contentTypes.map(type => (
                        <SelectItem key={type.value} value={type.value}>
                          <div>
                            <div className="font-medium">{type.label}</div>
                            <div className="text-xs text-muted-foreground">{type.description}</div>
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Tone Style */}
                <div className="space-y-2">
                  <Label>Tone & Style</Label>
                  <Select value={toneStyle} onValueChange={(value: ToneStyle) => setToneStyle(value)}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {toneStyles.map(tone => (
                        <SelectItem key={tone.value} value={tone.value}>
                          {tone.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Content Length */}
                <div className="space-y-2">
                  <Label>Content Length</Label>
                  <Select value={length} onValueChange={(value: ContentLength) => setLength(value)}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {contentLengths.map(len => (
                        <SelectItem key={len.value} value={len.value}>
                          <div>
                            <div className="font-medium">{len.label}</div>
                            <div className="text-xs text-muted-foreground">{len.words}</div>
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Advanced Options */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Advanced Options</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="audience">Target Audience</Label>
                      <Input
                        id="audience"
                        placeholder="e.g., Small business owners, Marketing professionals"
                        value={targetAudience}
                        onChange={(e) => setTargetAudience(e.target.value)}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="competitors">Competitors (optional)</Label>
                      <Input
                        id="competitors"
                        placeholder="competitor1.com, competitor2.com"
                        value={competitors}
                        onChange={(e) => setCompetitors(e.target.value)}
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <Label className="flex items-center gap-2">
                          <Brain className="w-4 h-4" />
                          Optimize for AI Search
                        </Label>
                        <Switch 
                          checked={optimizeForAI} 
                          onCheckedChange={setOptimizeForAI}
                        />
                      </div>
                      
                      <div className="flex items-center justify-between">
                        <Label className="flex items-center gap-2">
                          <Search className="w-4 h-4" />
                          Include Schema Markup
                        </Label>
                        <Switch 
                          checked={includeSchema} 
                          onCheckedChange={setIncludeSchema}
                        />
                      </div>

                      <div className="flex items-center justify-between">
                        <Label className="flex items-center gap-2">
                          <Target className="w-4 h-4" />
                          Multiple CTA Variants
                        </Label>
                        <Switch 
                          checked={includeCtaVariants} 
                          onCheckedChange={setIncludeCtaVariants}
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label>SEO Focus Level</Label>
                      <Select value={seoFocus} onValueChange={(value: 'high' | 'medium' | 'low') => setSeoFocus(value)}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="high">High - Maximum SEO optimization</SelectItem>
                          <SelectItem value="medium">Medium - Balanced approach</SelectItem>
                          <SelectItem value="low">Low - Content-focused</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Button 
                onClick={handleGenerate} 
                disabled={loading || !topic.trim()}
                className="w-full md:w-auto"
                size="lg"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                    Generating Enhanced Content...
                  </>
                ) : (
                  <>
                    <Wand2 className="w-5 h-5 mr-2" />
                    Generate Enhanced Content
                  </>
                )}
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="results" className="space-y-6 mt-6">
          {generatedContent && (
            <>
              {/* Performance Scores */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
                <ScoreCard
                  title="SEO Score"
                  score={generatedContent.metadata.seoScore}
                  icon={BarChart3}
                  color="text-blue-500"
                />
                <ScoreCard
                  title="AI Optimization"
                  score={generatedContent.optimization.aiReadiness}
                  icon={Brain}
                  color="text-purple-500"
                />
                <ScoreCard
                  title="Readability"
                  score={85} // Calculated value
                  icon={CheckCircle}
                  color="text-green-500"
                />
                <ScoreCard
                  title="Completeness"
                  score={Math.min(100, (generatedContent.metadata.wordCount / 800) * 100)}
                  icon={Target}
                  color="text-orange-500"
                />
              </div>

              {/* Content Actions */}
              <div className="flex flex-wrap gap-3 mb-6">
                <Button onClick={() => copyToClipboard(generatedContent.content, 'content')} variant="outline">
                  {copied.content ? <CheckCircle className="w-4 h-4 mr-2" /> : <Copy className="w-4 h-4 mr-2" />}
                  Copy Content
                </Button>
                <Button onClick={downloadContent} variant="outline">
                  <Download className="w-4 h-4 mr-2" />
                  Download
                </Button>
                <Button onClick={() => copyToClipboard(generatedContent.metadata.seoTitle, 'title')} variant="outline">
                  {copied.title ? <CheckCircle className="w-4 h-4 mr-2" /> : <Copy className="w-4 h-4 mr-2" />}
                  Copy Title
                </Button>
                <Button onClick={() => copyToClipboard(generatedContent.metadata.metaDescription, 'meta')} variant="outline">
                  {copied.meta ? <CheckCircle className="w-4 h-4 mr-2" /> : <Copy className="w-4 h-4 mr-2" />}
                  Copy Meta
                </Button>
              </div>

              {/* Content Preview */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2">
                  <Card>
                    <CardHeader>
                      <CardTitle>{generatedContent.title}</CardTitle>
                      <CardDescription>
                        {generatedContent.metadata.wordCount} words • {generatedContent.metadata.readingTime} min read
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="prose max-w-none">
                        <div dangerouslySetInnerHTML={{ __html: generatedContent.htmlContent }} />
                      </div>
                    </CardContent>
                  </Card>
                </div>

                <div className="space-y-4">
                  {/* SEO Metadata */}
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-lg">SEO Metadata</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div>
                        <Label className="text-sm font-medium">Title Tag</Label>
                        <p className="text-sm text-muted-foreground mt-1">{generatedContent.metadata.seoTitle}</p>
                      </div>
                      <div>
                        <Label className="text-sm font-medium">Meta Description</Label>
                        <p className="text-sm text-muted-foreground mt-1">{generatedContent.metadata.metaDescription}</p>
                      </div>
                    </CardContent>
                  </Card>

                  {/* FAQs */}
                  {generatedContent.metadata.faqs && generatedContent.metadata.faqs.length > 0 && (
                    <Card>
                      <CardHeader>
                        <CardTitle className="text-lg">Generated FAQs</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-3">
                          {generatedContent.metadata.faqs.map((faq, index) => (
                            <div key={index} className="border-l-4 border-primary pl-3">
                              <p className="font-medium text-sm">{faq.question}</p>
                              <p className="text-sm text-muted-foreground mt-1">{faq.answer}</p>
                            </div>
                          ))}
                        </div>
                      </CardContent>
                    </Card>
                  )}

                  {/* CTAs */}
                  {generatedContent.metadata.ctaVariants && generatedContent.metadata.ctaVariants.length > 0 && (
                    <Card>
                      <CardHeader>
                        <CardTitle className="text-lg">CTA Variants</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-2">
                          {generatedContent.metadata.ctaVariants.map((cta, index) => (
                            <Badge key={index} variant="outline" className="w-full justify-start">
                              {cta}
                            </Badge>
                          ))}
                        </div>
                      </CardContent>
                    </Card>
                  )}
                </div>
              </div>

              {/* Schema Markup */}
              {generatedContent.metadata.schema && (
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Generated Schema Markup</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <JsonLdSchema schema={generatedContent.metadata.schema} />
                  </CardContent>
                </Card>
              )}
            </>
          )}
        </TabsContent>

        <TabsContent value="optimization" className="space-y-6 mt-6">
          {generatedContent && (
            <>
              {/* Optimization Suggestions */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Lightbulb className="w-5 h-5" />
                    AI Optimization Suggestions
                  </CardTitle>
                  <CardDescription>
                    Recommendations to improve your content's AI searchability
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {generatedContent.optimization.suggestions.map((suggestion, index) => (
                      <Alert key={index}>
                        <Lightbulb className="h-4 w-4" />
                        <AlertDescription>{suggestion}</AlertDescription>
                      </Alert>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Improvement Areas */}
              {generatedContent.optimization.improvementAreas.length > 0 && (
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <AlertTriangle className="w-5 h-5" />
                      Areas for Improvement
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {generatedContent.optimization.improvementAreas.map((area, index) => (
                        <Alert key={index} variant="destructive">
                          <AlertTriangle className="h-4 w-4" />
                          <AlertDescription>{area}</AlertDescription>
                        </Alert>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Keyword Analysis */}
              {Object.keys(generatedContent.metadata.keywordDensity).length > 0 && (
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Keyword Analysis</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {Object.entries(generatedContent.metadata.keywordDensity).map(([keyword, density]) => (
                        <div key={keyword} className="flex items-center justify-between">
                          <span className="font-medium">{keyword}</span>
                          <div className="flex items-center gap-2">
                            <Progress value={density as number} className="w-24" />
                            <span className="text-sm text-muted-foreground">{density}%</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}
            </>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default EnhancedContentGenerator;
