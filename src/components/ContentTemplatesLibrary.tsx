import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { toast } from 'sonner';
import { supabase } from '../integrations/supabase/client';
import { useDomain } from '../contexts/DomainContext';
import { useAuth } from '../contexts/AuthContext';
import { 
  BookOpen, 
  Plus, 
  Download,
  Star,
  RefreshCw,
  Filter,
  Search,
  Eye,
  Copy,
  Save,
  Wand2,
  Target,
  Lightbulb,
  CheckCircle,
  FileText,
  List,
  HelpCircle,
  BarChart3
} from 'lucide-react';

interface ContentTemplate {
  id: string;
  name: string;
  category: 'how-to' | 'comparison' | 'list' | 'FAQ' | 'review' | 'guide' | 'news' | 'opinion';
  contentType: 'article' | 'blog-post' | 'product-page' | 'landing-page' | 'FAQ-page' | 'resource-page';
  structure: TemplateSection[];
  citationOptimizations: CitationOptimization[];
  estimatedCitationPotential: number;
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  wordCountRange: [number, number];
  tags: string[];
  examples: string[];
  createdAt: string;
}

interface TemplateSection {
  id: string;
  title: string;
  type: 'heading' | 'paragraph' | 'list' | 'quote' | 'statistic' | 'definition' | 'example' | 'conclusion';
  content: string;
  citationHooks: string[];
  aiInstructions: string;
  required: boolean;
  order: number;
  generatedContent?: string;
}

interface CitationOptimization {
  technique: string;
  description: string;
  example: string;
  effectiveness: number;
  applicableTypes: string[];
}

interface GeneratedContent {
  template: string;
  topic: string;
  sections: TemplateSection[];
  wordCount: number;
  citationOptimizations: CitationOptimization[];
  schemaMarkup?: string;
  generatedAt: string;
}

const ContentTemplatesLibrary = () => {
  const { defaultDomain } = useDomain();
  const { user } = useAuth();
  const [templates, setTemplates] = useState<ContentTemplate[]>([]);
  const [filteredTemplates, setFilteredTemplates] = useState<ContentTemplate[]>([]);
  const [selectedTemplate, setSelectedTemplate] = useState<ContentTemplate | null>(null);
  const [generatedContent, setGeneratedContent] = useState<GeneratedContent | null>(null);
  const [loading, setLoading] = useState(false);
  
  // Filters
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [difficultyFilter, setDifficultyFilter] = useState('all');
  const [contentTypeFilter, setContentTypeFilter] = useState('all');
  
  // Content generation form
  const [topic, setTopic] = useState('');
  const [targetKeywords, setTargetKeywords] = useState('');
  const [additionalContext, setAdditionalContext] = useState('');
  
  // Custom template creation
  const [showCustomCreator, setShowCustomCreator] = useState(false);
  const [customTopic, setCustomTopic] = useState('');
  const [customKeywords, setCustomKeywords] = useState('');
  const [customGoals, setCustomGoals] = useState('');
  const [customAudience, setCustomAudience] = useState<'beginner' | 'intermediate' | 'expert'>('intermediate');
  const [customWordCount, setCustomWordCount] = useState(2500);
  const [includeSchema, setIncludeSchema] = useState(true);
  const [citationStyle, setCitationStyle] = useState<'academic' | 'journalistic' | 'conversational' | 'authoritative'>('authoritative');

  useEffect(() => {
    loadTemplates();
  }, []);

  useEffect(() => {
    filterTemplates();
  }, [templates, searchTerm, categoryFilter, difficultyFilter, contentTypeFilter]);

  const loadTemplates = async () => {
    try {
      setLoading(true);
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        toast.error('Please sign in to access templates');
        return;
      }

      const { data, error } = await supabase.functions.invoke('content-templates-library', {
        body: JSON.stringify({
          action: 'get_templates',
          user_id: user.id
        })
      });

      if (error) throw error;

      setTemplates(data.templates || []);

    } catch (error: unknown) {
      console.error('Template loading error:', error);
      const errMessage = error instanceof Error ? error.message : 'Failed to load templates';
      toast.error(errMessage);
    } finally {
      setLoading(false);
    }
  };

  const filterTemplates = () => {
    let filtered = templates;

    if (searchTerm) {
      filtered = filtered.filter(template => 
        template.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        template.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()))
      );
    }

    if (categoryFilter !== 'all') {
      filtered = filtered.filter(template => template.category === categoryFilter);
    }

    if (difficultyFilter !== 'all') {
      filtered = filtered.filter(template => template.difficulty === difficultyFilter);
    }

    if (contentTypeFilter !== 'all') {
      filtered = filtered.filter(template => template.contentType === contentTypeFilter);
    }

    setFilteredTemplates(filtered);
  };

  const generateCustomTemplate = async () => {
    if (!customTopic) {
      toast.error('Please enter a topic for your custom template');
      return;
    }

    try {
      setLoading(true);
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        toast.error('Please sign in to create custom templates');
        return;
      }

      const { data, error } = await supabase.functions.invoke('content-templates-library', {
        body: JSON.stringify({
          action: 'generate_custom',
          topic: customTopic,
          target_keywords: customKeywords,
          content_goals: customGoals,
          audience_level: customAudience,
          word_count: customWordCount,
          include_schema: includeSchema,
          citation_style: citationStyle,
          user_id: user.id
        })
      });

      if (error) throw error;

      setSelectedTemplate(data.customTemplate);
      setShowCustomCreator(false);
      toast.success('Custom template generated successfully!');

    } catch (error: unknown) {
      console.error('Custom template generation error:', error);
      const errMessage = error instanceof Error ? error.message : 'Failed to generate custom template';
      toast.error(errMessage);
    } finally {
      setLoading(false);
    }
  };

  const generateContentFromTemplate = async (templateId: string) => {
    if (!topic) {
      toast.error('Please enter a topic for content generation');
      return;
    }

    try {
      setLoading(true);
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        toast.error('Please sign in to generate content');
        return;
      }

      const { data, error } = await supabase.functions.invoke('content-templates-library', {
        body: JSON.stringify({
          action: 'create_content',
          template_id: templateId,
          topic,
          target_keywords: targetKeywords,
          additional_context: additionalContext,
          user_id: user.id
        })
      });

      if (error) throw error;

      setGeneratedContent(data);
      toast.success(`Generated ${data.wordCount} words of citation-optimized content!`);

    } catch (error: unknown) {
      console.error('Content generation error:', error);
      const errMessage = error instanceof Error ? error.message : 'Failed to generate content';
      toast.error(errMessage);
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast.success('Copied to clipboard!');
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'how-to': return <Target className="w-4 h-4" />;
      case 'comparison': return <BarChart3 className="w-4 h-4" />;
      case 'list': return <List className="w-4 h-4" />;
      case 'FAQ': return <HelpCircle className="w-4 h-4" />;
      case 'guide': return <BookOpen className="w-4 h-4" />;
      default: return <FileText className="w-4 h-4" />;
    }
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'beginner': return 'text-green-600 bg-green-50 border-green-200';
      case 'intermediate': return 'text-yellow-600 bg-yellow-50 border-yellow-200';
      case 'advanced': return 'text-red-600 bg-red-50 border-red-200';
      default: return 'text-gray-600 bg-gray-50 border-gray-200';
    }
  };

  const getCitationPotentialColor = (score: number) => {
    if (score >= 85) return 'text-green-600';
    if (score >= 70) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getSectionTypeIcon = (type: string) => {
    switch (type) {
      case 'heading': return '📝';
      case 'paragraph': return '📄';
      case 'list': return '📋';
      case 'quote': return '💬';
      case 'statistic': return '📊';
      case 'definition': return '📖';
      case 'example': return '💡';
      case 'conclusion': return '🎯';
      default: return '📝';
    }
  };

  return (
    <div className="max-w-7xl mx-auto p-6 space-y-6">
      <div className="text-center">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Citation-Ready Content Templates</h1>
        <p className="text-gray-600">
          Professional templates optimized for AI search citations with proven structures and optimization techniques
        </p>
      </div>

      {/* Custom Template Creator */}
      {showCustomCreator && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Wand2 className="w-5 h-5" />
              Create Custom Template
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-2">Topic *</label>
                <Input
                  placeholder="e.g., Social Media Marketing for Small Business"
                  value={customTopic}
                  onChange={(e) => setCustomTopic(e.target.value)}
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Target Keywords</label>
                <Input
                  placeholder="keyword1, keyword2, keyword3"
                  value={customKeywords}
                  onChange={(e) => setCustomKeywords(e.target.value)}
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Content Goals</label>
              <Input
                placeholder="educate readers, drive conversions, build authority"
                value={customGoals}
                onChange={(e) => setCustomGoals(e.target.value)}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium mb-2">Audience Level</label>
                <select
                  className="w-full border border-gray-300 rounded-md p-2"
                  value={customAudience}
                  onChange={(e) => setCustomAudience(e.target.value as 'beginner' | 'intermediate' | 'expert')}
                >
                  <option value="beginner">Beginner</option>
                  <option value="intermediate">Intermediate</option>
                  <option value="expert">Expert</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Target Word Count</label>
                <Input
                  type="number"
                  value={customWordCount}
                  onChange={(e) => setCustomWordCount(parseInt(e.target.value) || 2500)}
                  min={500}
                  max={10000}
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Citation Style</label>
                <select
                  className="w-full border border-gray-300 rounded-md p-2"
                  value={citationStyle}
                  onChange={(e) => setCitationStyle(e.target.value as any)}
                >
                  <option value="authoritative">Authoritative</option>
                  <option value="academic">Academic</option>
                  <option value="journalistic">Journalistic</option>
                  <option value="conversational">Conversational</option>
                </select>
              </div>
            </div>

            <div>
              <label className="flex items-center space-x-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={includeSchema}
                  onChange={(e) => setIncludeSchema(e.target.checked)}
                  className="rounded border-gray-300"
                />
                <span className="text-sm">Include schema markup recommendations</span>
              </label>
            </div>

            <div className="flex gap-3">
              <Button onClick={generateCustomTemplate} disabled={loading || !customTopic}>
                {loading ? (
                  <>
                    <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                    Generating...
                  </>
                ) : (
                  <>
                    <Wand2 className="w-4 h-4 mr-2" />
                    Generate Custom Template
                  </>
                )}
              </Button>
              <Button variant="outline" onClick={() => setShowCustomCreator(false)}>
                Cancel
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Filters and Search */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span className="flex items-center gap-2">
              <Filter className="w-5 h-5" />
              Template Library
            </span>
            <Button onClick={() => setShowCustomCreator(true)} variant="outline">
              <Plus className="w-4 h-4 mr-2" />
              Create Custom
            </Button>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <label className="block text-sm font-medium mb-2">Search Templates</label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <Input
                  placeholder="Search by name or tags"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Category</label>
              <select
                className="w-full border border-gray-300 rounded-md p-2"
                value={categoryFilter}
                onChange={(e) => setCategoryFilter(e.target.value)}
              >
                <option value="all">All Categories</option>
                <option value="how-to">How-To</option>
                <option value="comparison">Comparison</option>
                <option value="list">List</option>
                <option value="FAQ">FAQ</option>
                <option value="guide">Guide</option>
                <option value="review">Review</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Difficulty</label>
              <select
                className="w-full border border-gray-300 rounded-md p-2"
                value={difficultyFilter}
                onChange={(e) => setDifficultyFilter(e.target.value)}
              >
                <option value="all">All Levels</option>
                <option value="beginner">Beginner</option>
                <option value="intermediate">Intermediate</option>
                <option value="advanced">Advanced</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Content Type</label>
              <select
                className="w-full border border-gray-300 rounded-md p-2"
                value={contentTypeFilter}
                onChange={(e) => setContentTypeFilter(e.target.value)}
              >
                <option value="all">All Types</option>
                <option value="article">Article</option>
                <option value="blog-post">Blog Post</option>
                <option value="FAQ-page">FAQ Page</option>
                <option value="landing-page">Landing Page</option>
              </select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Template Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredTemplates.map((template) => (
          <Card key={template.id} className="hover:shadow-lg transition-shadow cursor-pointer">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  {getCategoryIcon(template.category)}
                  <h3 className="font-medium text-lg">{template.name}</h3>
                </div>
                <Badge variant="outline" className={getCitationPotentialColor(template.estimatedCitationPotential)}>
                  {template.estimatedCitationPotential}%
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-center gap-2">
                <Badge className={getDifficultyColor(template.difficulty)}>
                  {template.difficulty}
                </Badge>
                <Badge variant="outline">
                  {template.contentType.replace('-', ' ')}
                </Badge>
                <Badge variant="outline">
                  {template.wordCountRange[0]}-{template.wordCountRange[1]} words
                </Badge>
              </div>

              <p className="text-sm text-gray-600">
                {template.structure.length} sections • {template.citationOptimizations.length} optimization techniques
              </p>

              <div className="flex flex-wrap gap-1">
                {template.tags.slice(0, 3).map((tag) => (
                  <span key={tag} className="text-xs bg-gray-100 text-gray-700 px-2 py-1 rounded">
                    {tag}
                  </span>
                ))}
                {template.tags.length > 3 && (
                  <span className="text-xs text-gray-500">+{template.tags.length - 3} more</span>
                )}
              </div>

              {template.examples.length > 0 && (
                <div>
                  <p className="text-xs font-medium text-gray-700 mb-1">Examples:</p>
                  <p className="text-xs text-gray-600">{template.examples[0]}</p>
                </div>
              )}

              <div className="flex gap-2 pt-2">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => setSelectedTemplate(template)}
                  className="flex-1"
                >
                  <Eye className="w-3 h-3 mr-1" />
                  View
                </Button>
                <Button
                  size="sm"
                  onClick={() => {
                    setSelectedTemplate(template);
                    if (topic) {
                      generateContentFromTemplate(template.id);
                    }
                  }}
                  className="flex-1"
                >
                  <Download className="w-3 h-3 mr-1" />
                  Use
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {filteredTemplates.length === 0 && !loading && (
        <div className="text-center py-12 text-gray-500">
          <BookOpen className="w-12 h-12 mx-auto mb-4 opacity-50" />
          <p>No templates found matching your filters</p>
          <p className="text-sm">Try adjusting your search criteria or create a custom template</p>
        </div>
      )}

      {/* Template Detail Modal */}
      {selectedTemplate && !generatedContent && (
        <Card className="fixed inset-4 z-50 overflow-hidden bg-white">
          <CardHeader className="border-b">
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                {getCategoryIcon(selectedTemplate.category)}
                {selectedTemplate.name}
              </CardTitle>
              <Button variant="ghost" onClick={() => setSelectedTemplate(null)}>
                ✕
              </Button>
            </div>
          </CardHeader>
          <CardContent className="overflow-y-auto max-h-[calc(100vh-200px)] p-6 space-y-6">
            {/* Template Info */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <h4 className="font-medium mb-2">Template Details</h4>
                <div className="space-y-2">
                  <Badge className={getDifficultyColor(selectedTemplate.difficulty)}>
                    {selectedTemplate.difficulty}
                  </Badge>
                  <p className="text-sm text-gray-600">
                    Citation Potential: <span className={getCitationPotentialColor(selectedTemplate.estimatedCitationPotential)}>
                      {selectedTemplate.estimatedCitationPotential}%
                    </span>
                  </p>
                  <p className="text-sm text-gray-600">
                    {selectedTemplate.wordCountRange[0]}-{selectedTemplate.wordCountRange[1]} words
                  </p>
                </div>
              </div>
              <div className="md:col-span-2">
                <h4 className="font-medium mb-2">Content Generation</h4>
                <div className="space-y-3">
                  <Input
                    placeholder="Enter your topic (required)"
                    value={topic}
                    onChange={(e) => setTopic(e.target.value)}
                  />
                  <Input
                    placeholder="Target keywords (optional)"
                    value={targetKeywords}
                    onChange={(e) => setTargetKeywords(e.target.value)}
                  />
                  <Input
                    placeholder="Additional context (optional)"
                    value={additionalContext}
                    onChange={(e) => setAdditionalContext(e.target.value)}
                  />
                  <Button
                    onClick={() => generateContentFromTemplate(selectedTemplate.id)}
                    disabled={loading || !topic}
                    className="w-full"
                  >
                    {loading ? (
                      <>
                        <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                        Generating Content...
                      </>
                    ) : (
                      <>
                        <Wand2 className="w-4 h-4 mr-2" />
                        Generate Citation-Optimized Content
                      </>
                    )}
                  </Button>
                </div>
              </div>
            </div>

            {/* Template Structure */}
            <div>
              <h4 className="font-medium mb-3">Template Structure</h4>
              <div className="space-y-3">
                {selectedTemplate.structure.map((section) => (
                  <div key={section.id} className="border rounded-lg p-4">
                    <div className="flex items-center justify-between mb-2">
                      <h5 className="font-medium flex items-center gap-2">
                        {getSectionTypeIcon(section.type)} {section.title}
                      </h5>
                      <div className="flex items-center gap-2">
                        {section.required && (
                          <Badge variant="outline" className="text-xs">Required</Badge>
                        )}
                        <Badge variant="outline" className="text-xs">{section.type}</Badge>
                      </div>
                    </div>
                    <p className="text-sm text-gray-600 mb-2">{section.content}</p>
                    <div className="text-xs text-gray-500">
                      <strong>Citation hooks:</strong> {section.citationHooks.join(', ')}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Citation Optimizations */}
            <div>
              <h4 className="font-medium mb-3">Citation Optimization Techniques</h4>
              <div className="space-y-3">
                {selectedTemplate.citationOptimizations.map((opt, index) => (
                  <div key={index} className="border rounded-lg p-4">
                    <div className="flex items-center justify-between mb-2">
                      <h5 className="font-medium">{opt.technique}</h5>
                      <Badge variant="outline">{opt.effectiveness}% effectiveness</Badge>
                    </div>
                    <p className="text-sm text-gray-600 mb-2">{opt.description}</p>
                    <div className="bg-gray-50 p-3 rounded text-sm">
                      <strong>Example:</strong> {opt.example}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Generated Content Display */}
      {generatedContent && (
        <Card className="fixed inset-4 z-50 overflow-hidden bg-white">
          <CardHeader className="border-b">
            <div className="flex items-center justify-between">
              <CardTitle>Generated Content: {generatedContent.topic}</CardTitle>
              <Button variant="ghost" onClick={() => setGeneratedContent(null)}>
                ✕
              </Button>
            </div>
            <div className="flex items-center gap-4 text-sm text-gray-600">
              <span>Template: {generatedContent.template}</span>
              <span>Word Count: {generatedContent.wordCount}</span>
              <span>Generated: {new Date(generatedContent.generatedAt).toLocaleString()}</span>
            </div>
          </CardHeader>
          <CardContent className="overflow-y-auto max-h-[calc(100vh-200px)] p-6 space-y-6">
            {generatedContent.sections.map((section) => (
              <div key={section.id} className="border rounded-lg p-4">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="font-medium text-lg">{section.title}</h3>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => copyToClipboard(section.generatedContent || '')}
                  >
                    <Copy className="w-3 h-3 mr-1" />
                    Copy
                  </Button>
                </div>
                <div className="prose prose-sm max-w-none">
                  <div className="whitespace-pre-wrap text-sm text-gray-700">
                    {section.generatedContent}
                  </div>
                </div>
                <div className="mt-3 pt-3 border-t text-xs text-gray-500">
                  <strong>Citation hooks for this section:</strong> {section.citationHooks.join(', ')}
                </div>
              </div>
            ))}

            {/* Copy All Button */}
            <div className="sticky bottom-0 bg-white pt-4 border-t">
              <Button
                onClick={() => {
                  const fullContent = generatedContent.sections
                    .map(section => `# ${section.title}\n\n${section.generatedContent}\n\n`)
                    .join('');
                  copyToClipboard(fullContent);
                }}
                className="w-full"
              >
                <Copy className="w-4 h-4 mr-2" />
                Copy All Content
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default ContentTemplatesLibrary;