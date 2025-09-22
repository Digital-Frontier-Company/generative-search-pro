import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Sparkles,
  Brain,
  Search,
  Crown,
  Target,
  Zap,
  Building2,
  TrendingUp,
  CheckCircle,
  ArrowRight,
  PlayCircle,
  BookOpen,
  Users,
  BarChart3,
  Network,
  Mic,
  Eye,
  Award,
  Lightbulb,
  Rocket,
  Shield,
  Globe
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { useDomain } from '@/contexts/DomainContext';

interface ToolStatus {
  id: string;
  name: string;
  description: string;
  icon: React.ReactNode;
  status: 'not-started' | 'in-progress' | 'completed';
  category: string;
  path: string;
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  estimatedTime: string;
  impact: 'high' | 'medium' | 'low';
  prerequisites?: string[];
}

const TSODashboard = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { defaultDomain } = useDomain();
  const [activeCategory, setActiveCategory] = useState('overview');
  const [completedTools, setCompletedTools] = useState<Set<string>>(new Set());

  const tsoTools: ToolStatus[] = [
    // AI Foundations & Monitoring
    {
      id: 'ai-visibility',
      name: 'AI Visibility Tracker',
      description: 'Monitor how your content appears across ChatGPT, Perplexity, Gemini, and Claude',
      icon: <Eye className="w-5 h-5" />,
      status: 'not-started',
      category: 'ai-foundations',
      path: '/ai-visibility-tracker',
      difficulty: 'beginner',
      estimatedTime: '10 minutes',
      impact: 'high'
    },
    {
      id: 'technical-readiness',
      name: 'Technical AI Readiness',
      description: 'Assess your website\'s technical infrastructure for AI crawler optimization',
      icon: <Shield className="w-5 h-5" />,
      status: 'not-started',
      category: 'ai-foundations',
      path: '/technical-ai-readiness',
      difficulty: 'intermediate',
      estimatedTime: '15 minutes',
      impact: 'high'
    },
    {
      id: 'zero-click',
      name: 'Zero-Click Optimizer',
      description: 'Optimize content for featured snippets and answer boxes',
      icon: <Zap className="w-5 h-5" />,
      status: 'not-started',
      category: 'ai-foundations',
      path: '/zero-click-optimizer',
      difficulty: 'intermediate',
      estimatedTime: '20 minutes',
      impact: 'high',
      prerequisites: ['ai-visibility']
    },
    
    // Content Strategy & Research
    {
      id: 'intent-research',
      name: 'Intent-Driven Research',
      description: 'Research AI platform responses to understand user intent and identify opportunities',
      icon: <Search className="w-5 h-5" />,
      status: 'not-started',
      category: 'content-strategy',
      path: '/intent-driven-research',
      difficulty: 'intermediate',
      estimatedTime: '25 minutes',
      impact: 'high'
    },
    {
      id: 'semantic-analyzer',
      name: 'Semantic Structure Analyzer',
      description: 'Analyze content using semantic triples and knowledge graphs for AI optimization',
      icon: <Network className="w-5 h-5" />,
      status: 'not-started',
      category: 'content-strategy',
      path: '/semantic-analyzer',
      difficulty: 'advanced',
      estimatedTime: '20 minutes',
      impact: 'medium'
    },
    {
      id: 'voice-search',
      name: 'Voice Search Optimizer',
      description: 'Optimize content for voice assistants and conversational AI queries',
      icon: <Mic className="w-5 h-5" />,
      status: 'not-started',
      category: 'content-strategy',
      path: '/voice-search-optimizer',
      difficulty: 'intermediate',
      estimatedTime: '18 minutes',
      impact: 'medium'
    },

    // Authority & Competition
    {
      id: 'authority-tracker',
      name: 'Authority Signal Tracker',
      description: 'Monitor brand mentions, citations, and expert recognition across platforms',
      icon: <Crown className="w-5 h-5" />,
      status: 'not-started',
      category: 'authority-competition',
      path: '/authority-tracker',
      difficulty: 'intermediate',
      estimatedTime: '15 minutes',
      impact: 'high'
    },
    {
      id: 'competitive-analysis',
      name: 'Competitive AI Analysis',
      description: 'Analyze how your AI visibility compares to competitors and identify opportunities',
      icon: <BarChart3 className="w-5 h-5" />,
      status: 'not-started',
      category: 'authority-competition',
      path: '/competitive-ai-analysis',
      difficulty: 'advanced',
      estimatedTime: '30 minutes',
      impact: 'high',
      prerequisites: ['ai-visibility', 'authority-tracker']
    },

    // Business & Implementation
    {
      id: 'business-templates',
      name: 'Business-Type Templates',
      description: 'Get customized optimization strategies based on your business type',
      icon: <Building2 className="w-5 h-5" />,
      status: 'not-started',
      category: 'business-implementation',
      path: '/business-type-templates',
      difficulty: 'beginner',
      estimatedTime: '12 minutes',
      impact: 'high'
    },
    {
      id: 'llm-generation',
      name: 'LLM.txt Generation',
      description: 'Generate metadata files for AI systems from your content and sitemaps',
      icon: <Globe className="w-5 h-5" />,
      status: 'not-started',
      category: 'business-implementation',
      path: '/ai-sitemap',
      difficulty: 'beginner',
      estimatedTime: '8 minutes',
      impact: 'medium'
    }
  ];

  const categories = [
    {
      id: 'ai-foundations',
      name: 'AI Foundations & Monitoring',
      description: 'Essential tools for AI search optimization',
      icon: <Brain className="w-6 h-6" />,
      color: 'from-blue-500 to-cyan-500',
      tools: tsoTools.filter(tool => tool.category === 'ai-foundations')
    },
    {
      id: 'content-strategy',
      name: 'Content Strategy & Research',
      description: 'Advanced content optimization and analysis',
      icon: <BookOpen className="w-6 h-6" />,
      color: 'from-green-500 to-emerald-500',
      tools: tsoTools.filter(tool => tool.category === 'content-strategy')
    },
    {
      id: 'authority-competition',
      name: 'Authority & Competition',
      description: 'Build authority and outperform competitors',
      icon: <Award className="w-6 h-6" />,
      color: 'from-purple-500 to-pink-500',
      tools: tsoTools.filter(tool => tool.category === 'authority-competition')
    },
    {
      id: 'business-implementation',
      name: 'Business & Implementation',
      description: 'Business-specific strategies and deployment',
      icon: <Rocket className="w-6 h-6" />,
      color: 'from-orange-500 to-red-500',
      tools: tsoTools.filter(tool => tool.category === 'business-implementation')
    }
  ];

  useEffect(() => {
    // Load completion status from localStorage
    const saved = localStorage.getItem('tso-tool-completion');
    if (saved) {
      setCompletedTools(new Set(JSON.parse(saved)));
    }
  }, []);

  const markAsCompleted = (toolId: string) => {
    const newCompleted = new Set(completedTools);
    newCompleted.add(toolId);
    setCompletedTools(newCompleted);
    localStorage.setItem('tso-tool-completion', JSON.stringify(Array.from(newCompleted)));
  };

  const getOverallProgress = () => {
    return Math.round((completedTools.size / tsoTools.length) * 100);
  };

  const getCategoryProgress = (categoryId: string) => {
    const categoryTools = tsoTools.filter(tool => tool.category === categoryId);
    const completedInCategory = categoryTools.filter(tool => completedTools.has(tool.id)).length;
    return Math.round((completedInCategory / categoryTools.length) * 100);
  };

  const getRecommendedNextTool = () => {
    // Find tools with completed prerequisites
    const availableTools = tsoTools.filter(tool => {
      if (completedTools.has(tool.id)) {
        return false;
      }
      if (!tool.prerequisites) {
        return true;
      }
      return tool.prerequisites.every(prereq => completedTools.has(prereq));
    });

    // Sort by impact and difficulty
    return availableTools.sort((a, b) => {
      const impactScore = { high: 3, medium: 2, low: 1 };
      const difficultyScore = { beginner: 3, intermediate: 2, advanced: 1 };
      
      const aScore = impactScore[a.impact] + difficultyScore[a.difficulty];
      const bScore = impactScore[b.impact] + difficultyScore[b.difficulty];
      
      return bScore - aScore;
    })[0];
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'beginner': return 'bg-green-500/20 text-green-400';
      case 'intermediate': return 'bg-yellow-500/20 text-yellow-400';
      case 'advanced': return 'bg-red-500/20 text-red-400';
      default: return 'bg-gray-500/20 text-gray-400';
    }
  };

  const getImpactColor = (impact: string) => {
    switch (impact) {
      case 'high': return 'bg-red-500/20 text-red-400';
      case 'medium': return 'bg-yellow-500/20 text-yellow-400';
      case 'low': return 'bg-blue-500/20 text-blue-400';
      default: return 'bg-gray-500/20 text-gray-400';
    }
  };

  const navigateToTool = (tool: ToolStatus) => {
    navigate(tool.path);
    markAsCompleted(tool.id);
  };

  const recommendedTool = getRecommendedNextTool();

  return (
    <div className="container mx-auto p-6 max-w-7xl">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-4">
          <div className="p-3 rounded-lg bg-gradient-to-r from-matrix-green/20 to-cyan-500/20">
            <Sparkles className="w-8 h-8 text-matrix-green" />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-matrix-green">Total Search Optimization (TSO)</h1>
            <p className="text-matrix-green/70">
              Your complete AI-first optimization command center
            </p>
          </div>
        </div>

        {/* Overall Progress */}
        <Card className="content-card">
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-lg font-semibold text-matrix-green">Your TSO Progress</h3>
                <p className="text-matrix-green/70">
                  {completedTools.size} of {tsoTools.length} optimization tools completed
                </p>
              </div>
              <div className="text-right">
                <div className="text-3xl font-bold text-matrix-green">{getOverallProgress()}%</div>
                <p className="text-sm text-matrix-green/70">Complete</p>
              </div>
            </div>
            <Progress value={getOverallProgress()} className="h-3" />
          </CardContent>
        </Card>
      </div>

      <Tabs value={activeCategory} onValueChange={setActiveCategory} className="w-full">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="ai-foundations">AI Foundations</TabsTrigger>
          <TabsTrigger value="content-strategy">Content Strategy</TabsTrigger>
          <TabsTrigger value="authority-competition">Authority & Competition</TabsTrigger>
          <TabsTrigger value="business-implementation">Business Implementation</TabsTrigger>
        </TabsList>

        <TabsContent value="overview">
          <div className="space-y-6">
            {/* Quick Start */}
            {recommendedTool && (
              <Card className="content-card border-matrix-green/30">
                <CardHeader>
                  <CardTitle className="text-matrix-green flex items-center gap-2">
                    <Target className="w-5 h-5" />
                    Recommended Next Step
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className="p-3 rounded-lg bg-matrix-green/10">
                        {recommendedTool.icon}
                      </div>
                      <div>
                        <h4 className="font-semibold text-matrix-green">{recommendedTool.name}</h4>
                        <p className="text-matrix-green/70 text-sm">{recommendedTool.description}</p>
                        <div className="flex items-center gap-2 mt-2">
                          <Badge className={getDifficultyColor(recommendedTool.difficulty)}>
                            {recommendedTool.difficulty}
                          </Badge>
                          <Badge className={getImpactColor(recommendedTool.impact)}>
                            {recommendedTool.impact} impact
                          </Badge>
                          <span className="text-xs text-matrix-green/60">
                            ~{recommendedTool.estimatedTime}
                          </span>
                        </div>
                      </div>
                    </div>
                    <Button 
                      onClick={() => navigateToTool(recommendedTool)}
                      className="glow-button text-black font-semibold"
                    >
                      <PlayCircle className="w-4 h-4 mr-2" />
                      Start Now
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Category Overview */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {categories.map((category) => (
                <Card key={category.id} className="content-card group hover:border-matrix-green/50 transition-colors cursor-pointer" 
                      onClick={() => setActiveCategory(category.id)}>
                  <CardHeader>
                    <CardTitle className="text-matrix-green flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className={`p-2 rounded-lg bg-gradient-to-r ${category.color} opacity-20`}>
                          {category.icon}
                        </div>
                        <div>
                          <h3 className="text-lg">{category.name}</h3>
                          <p className="text-sm text-matrix-green/70 font-normal">
                            {category.description}
                          </p>
                        </div>
                      </div>
                      <ArrowRight className="w-5 h-5 text-matrix-green/50 group-hover:text-matrix-green transition-colors" />
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center justify-between mb-3">
                      <span className="text-sm text-matrix-green/70">
                        {category.tools.filter(tool => completedTools.has(tool.id)).length} of {category.tools.length} completed
                      </span>
                      <span className="text-sm font-semibold text-matrix-green">
                        {getCategoryProgress(category.id)}%
                      </span>
                    </div>
                    <Progress value={getCategoryProgress(category.id)} className="h-2" />
                    
                    <div className="mt-4 grid grid-cols-2 gap-2">
                      {category.tools.map((tool) => (
                        <div key={tool.id} className="flex items-center gap-2 text-xs">
                          {completedTools.has(tool.id) ? (
                            <CheckCircle className="w-3 h-3 text-green-500" />
                          ) : (
                            <div className="w-3 h-3 rounded-full border border-matrix-green/30" />
                          )}
                          <span className={completedTools.has(tool.id) ? 'text-green-400' : 'text-matrix-green/70'}>
                            {tool.name}
                          </span>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            {/* Getting Started Guide */}
            <Card className="content-card">
              <CardHeader>
                <CardTitle className="text-matrix-green flex items-center gap-2">
                  <Lightbulb className="w-5 h-5" />
                  Getting Started with TSO
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="text-center">
                    <div className="p-4 rounded-lg bg-blue-500/10 mb-4">
                      <span className="text-2xl font-bold text-blue-400">1</span>
                    </div>
                    <h4 className="font-semibold text-matrix-green mb-2">Start with Foundations</h4>
                    <p className="text-sm text-matrix-green/70">
                      Begin with AI Visibility Tracker and Technical Readiness to establish your baseline
                    </p>
                  </div>
                  <div className="text-center">
                    <div className="p-4 rounded-lg bg-green-500/10 mb-4">
                      <span className="text-2xl font-bold text-green-400">2</span>
                    </div>
                    <h4 className="font-semibold text-matrix-green mb-2">Optimize Content</h4>
                    <p className="text-sm text-matrix-green/70">
                      Use Zero-Click Optimizer and Intent Research to improve your content strategy
                    </p>
                  </div>
                  <div className="text-center">
                    <div className="p-4 rounded-lg bg-purple-500/10 mb-4">
                      <span className="text-2xl font-bold text-purple-400">3</span>
                    </div>
                    <h4 className="font-semibold text-matrix-green mb-2">Scale & Compete</h4>
                    <p className="text-sm text-matrix-green/70">
                      Build authority, analyze competitors, and implement business-specific strategies
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Category-specific tabs */}
        {categories.map((category) => (
          <TabsContent key={category.id} value={category.id}>
            <div className="space-y-6">
              {/* Category Header */}
              <Card className="content-card">
                <CardHeader>
                  <CardTitle className="text-matrix-green flex items-center gap-3">
                    <div className={`p-3 rounded-lg bg-gradient-to-r ${category.color} opacity-20`}>
                      {category.icon}
                    </div>
                    <div>
                      <h2 className="text-2xl">{category.name}</h2>
                      <p className="text-matrix-green/70 font-normal">{category.description}</p>
                    </div>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-6">
                      <div className="text-center">
                        <div className="text-2xl font-bold text-matrix-green">{category.tools.length}</div>
                        <p className="text-sm text-matrix-green/70">Tools</p>
                      </div>
                      <div className="text-center">
                        <div className="text-2xl font-bold text-matrix-green">
                          {category.tools.filter(tool => completedTools.has(tool.id)).length}
                        </div>
                        <p className="text-sm text-matrix-green/70">Completed</p>
                      </div>
                      <div className="text-center">
                        <div className="text-2xl font-bold text-matrix-green">{getCategoryProgress(category.id)}%</div>
                        <p className="text-sm text-matrix-green/70">Progress</p>
                      </div>
                    </div>
                    <Progress value={getCategoryProgress(category.id)} className="h-3 w-32" />
                  </div>
                </CardContent>
              </Card>

              {/* Tools Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {category.tools.map((tool) => {
                  const isCompleted = completedTools.has(tool.id);
                  const hasPrerequisites = tool.prerequisites && tool.prerequisites.length > 0;
                  const prerequisitesMet = !hasPrerequisites || tool.prerequisites!.every(prereq => completedTools.has(prereq));
                  
                  return (
                    <Card key={tool.id} className={`content-card group hover:border-matrix-green/50 transition-all ${isCompleted ? 'bg-green-500/5 border-green-500/30' : ''}`}>
                      <CardHeader>
                        <CardTitle className="text-matrix-green flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <div className={`p-2 rounded-lg ${isCompleted ? 'bg-green-500/20' : 'bg-matrix-green/10'}`}>
                              {tool.icon}
                            </div>
                            <div>
                              <h3 className="text-lg">{tool.name}</h3>
                              <div className="flex items-center gap-2 mt-1">
                                <Badge className={getDifficultyColor(tool.difficulty)}>
                                  {tool.difficulty}
                                </Badge>
                                <Badge className={getImpactColor(tool.impact)}>
                                  {tool.impact}
                                </Badge>
                                {isCompleted && (
                                  <Badge className="bg-green-500/20 text-green-400">
                                    ✓ Complete
                                  </Badge>
                                )}
                              </div>
                            </div>
                          </div>
                          <div className="text-right">
                            <div className="text-sm text-matrix-green/70">~{tool.estimatedTime}</div>
                            {isCompleted && <CheckCircle className="w-5 h-5 text-green-500 mt-1" />}
                          </div>
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <p className="text-matrix-green/90 mb-4">{tool.description}</p>
                        
                        {hasPrerequisites && (
                          <div className="mb-4">
                            <p className="text-sm text-matrix-green/70 mb-2">Prerequisites:</p>
                            <div className="flex flex-wrap gap-1">
                              {tool.prerequisites!.map((prereq) => {
                                const prereqTool = tsoTools.find(t => t.id === prereq);
                                const prereqCompleted = completedTools.has(prereq);
                                return (
                                  <Badge key={prereq} className={prereqCompleted ? 'bg-green-500/20 text-green-400' : 'bg-yellow-500/20 text-yellow-400'}>
                                    {prereqCompleted ? '✓' : '○'} {prereqTool?.name}
                                  </Badge>
                                );
                              })}
                            </div>
                          </div>
                        )}
                        
                        <Button 
                          onClick={() => navigateToTool(tool)}
                          disabled={!prerequisitesMet}
                          className={`w-full ${isCompleted ? 'bg-green-600 hover:bg-green-700' : prerequisitesMet ? 'glow-button text-black' : 'opacity-50 cursor-not-allowed'}`}
                        >
                          {isCompleted ? (
                            <>
                              <CheckCircle className="w-4 h-4 mr-2" />
                              View Results
                            </>
                          ) : prerequisitesMet ? (
                            <>
                              <PlayCircle className="w-4 h-4 mr-2" />
                              Start Tool
                            </>
                          ) : (
                            <>
                              Complete Prerequisites First
                            </>
                          )}
                        </Button>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            </div>
          </TabsContent>
        ))}
      </Tabs>

      {/* Footer with domain info */}
      {defaultDomain && (
        <div className="mt-8 text-center text-sm text-matrix-green/60">
          Optimizing for: <span className="font-semibold text-matrix-green">{defaultDomain}</span>
        </div>
      )}
    </div>
  );
};

export default TSODashboard;