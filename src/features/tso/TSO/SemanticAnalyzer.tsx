import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Brain,
  Network,
  GitBranch,
  FileText,
  Search,
  Lightbulb,
  Target,
  CheckCircle,
  AlertTriangle,
  ArrowRight,
  Copy,
  Download,
  RefreshCw,
  Loader2,
  Zap,
  BookOpen,
  TreePine
} from 'lucide-react';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

interface SemanticTriple {
  subject: string;
  predicate: string;
  object: string;
  confidence: number;
  context: string;
  importance: 'high' | 'medium' | 'low';
}

interface EntityRelationship {
  entity1: string;
  entity2: string;
  relationship: string;
  strength: number;
  type: 'is-a' | 'part-of' | 'related-to' | 'causes' | 'enables' | 'competes-with';
}

interface ContentStructure {
  hierarchyDepth: number;
  semanticClusters: Array<{
    cluster: string;
    entities: string[];
    relationships: number;
    coherence: number;
  }>;
  topicFlow: Array<{
    section: string;
    topics: string[];
    semanticDensity: number;
    connectionStrength: number;
  }>;
  knowledgeGraph: {
    nodes: Array<{ id: string; label: string; type: string; importance: number }>;
    edges: Array<{ source: string; target: string; relationship: string; weight: number }>;
  };
}

interface SemanticAnalysisData {
  overallSemanticScore: number;
  structureScore: number;
  relationshipScore: number;
  coherenceScore: number;
  extractedTriples: SemanticTriple[];
  entityRelationships: EntityRelationship[];
  contentStructure: ContentStructure;
  semanticGaps: Array<{
    gap: string;
    severity: 'high' | 'medium' | 'low';
    impact: string;
    suggestion: string;
  }>;
  optimizationSuggestions: Array<{
    type: 'structure' | 'relationships' | 'entities' | 'flow';
    title: string;
    description: string;
    priority: 'high' | 'medium' | 'low';
    expectedImpact: string;
    implementation: string;
  }>;
  lastAnalyzed: string;
}

const SemanticAnalyzer = () => {
  const { user } = useAuth();
  const [content, setContent] = useState('');
  const [targetTopic, setTargetTopic] = useState('');
  const [loading, setLoading] = useState(false);
  const [analysisData, setAnalysisData] = useState<SemanticAnalysisData | null>(null);
  const [activeTab, setActiveTab] = useState('analyzer');

  const analyzeSemanticStructure = async () => {
    if (!content.trim()) {
      toast.error('Please enter content to analyze');
      return;
    }

    if (!user) {
      toast.error('Please sign in to analyze semantic structure');
      return;
    }

    setLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('analyze-semantic-structure', {
        body: JSON.stringify({
          content: content.trim(),
          target_topic: targetTopic.trim(),
          user_id: user.id,
          comprehensive: true
        })
      });

      if (error) throw error;

      if (data.success) {
        setAnalysisData(data.analysis);
        toast.success('Semantic analysis completed!');
      }
    } catch (error: any) {
      console.error('Semantic analysis error:', error);
      toast.error(error.message || 'Failed to analyze semantic structure');
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast.success('Copied to clipboard!');
  };

  const downloadKnowledgeGraph = () => {
    if (!analysisData?.contentStructure.knowledgeGraph) return;
    
    const graphData = JSON.stringify(analysisData.contentStructure.knowledgeGraph, null, 2);
    const blob = new Blob([graphData], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'knowledge-graph.json';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    toast.success('Knowledge graph downloaded!');
  };

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-green-500';
    if (score >= 60) return 'text-blue-500'; 
    if (score >= 40) return 'text-yellow-500';
    return 'text-red-500';
  };

  const getImportanceColor = (importance: string) => {
    switch (importance) {
      case 'high': return 'bg-red-500/20 text-red-400';
      case 'medium': return 'bg-yellow-500/20 text-yellow-400';
      case 'low': return 'bg-green-500/20 text-green-400';
      default: return 'bg-gray-500/20 text-gray-400';
    }
  };

  const getSeverityIcon = (severity: string) => {
    switch (severity) {
      case 'high': return <AlertTriangle className="w-4 h-4 text-red-500" />;
      case 'medium': return <Target className="w-4 h-4 text-yellow-500" />;
      case 'low': return <CheckCircle className="w-4 h-4 text-green-500" />;
      default: return <CheckCircle className="w-4 h-4 text-gray-500" />;
    }
  };

  const getRelationshipTypeColor = (type: string) => {
    const colors = {
      'is-a': 'bg-blue-500/20 text-blue-400',
      'part-of': 'bg-green-500/20 text-green-400',
      'related-to': 'bg-purple-500/20 text-purple-400',
      'causes': 'bg-red-500/20 text-red-400',
      'enables': 'bg-cyan-500/20 text-cyan-400',
      'competes-with': 'bg-orange-500/20 text-orange-400'
    };
    return colors[type] || 'bg-gray-500/20 text-gray-400';
  };

  return (
    <div className="container mx-auto p-6 max-w-6xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2 text-matrix-green">Semantic Structure Analyzer</h1>
        <p className="text-matrix-green/70">
          Analyze content using semantic triples, entity relationships, and knowledge graph structure for AI optimization.
        </p>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-6">
          <TabsTrigger value="analyzer">Content Input</TabsTrigger>
          <TabsTrigger value="triples">Semantic Triples</TabsTrigger>
          <TabsTrigger value="relationships">Entity Relations</TabsTrigger>
          <TabsTrigger value="structure">Content Structure</TabsTrigger>
          <TabsTrigger value="gaps">Semantic Gaps</TabsTrigger>
          <TabsTrigger value="optimization">Optimization</TabsTrigger>
        </TabsList>

        <TabsContent value="analyzer">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card className="content-card">
              <CardHeader>
                <CardTitle className="text-matrix-green flex items-center gap-2">
                  <Brain className="w-5 h-5" />
                  Semantic Analysis Setup
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium mb-2 text-matrix-green">
                      Content to Analyze
                    </label>
                    <Textarea
                      placeholder="Paste your content here for semantic analysis..."
                      value={content}
                      onChange={(e) => setContent(e.target.value)}
                      className="bg-secondary border-border min-h-[200px]"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2 text-matrix-green">
                      Target Topic (optional)
                    </label>
                    <Input
                      placeholder="Main topic or theme of the content"
                      value={targetTopic}
                      onChange={(e) => setTargetTopic(e.target.value)}
                      className="bg-secondary border-border"
                    />
                  </div>
                  <Button 
                    onClick={analyzeSemanticStructure} 
                    disabled={loading} 
                    className="w-full glow-button text-black font-semibold"
                  >
                    {loading ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        Analyzing Semantic Structure...
                      </>
                    ) : (
                      <>
                        <Network className="w-4 h-4 mr-2" />
                        Analyze Semantic Structure
                      </>
                    )}
                  </Button>
                </div>
              </CardContent>
            </Card>

            {analysisData && (
              <Card className="content-card">
                <CardHeader>
                  <CardTitle className="text-matrix-green">Semantic Scores</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div>
                      <div className="flex justify-between items-center mb-2">
                        <span className="text-sm text-matrix-green/70">Overall Semantic Score</span>
                        <span className={`font-bold ${getScoreColor(analysisData.overallSemanticScore)}`}>
                          {analysisData.overallSemanticScore}/100
                        </span>
                      </div>
                      <Progress value={analysisData.overallSemanticScore} className="h-2" />
                    </div>

                    <div>
                      <div className="flex justify-between items-center mb-2">
                        <span className="text-sm text-matrix-green/70">Structure Score</span>
                        <span className={`font-bold ${getScoreColor(analysisData.structureScore)}`}>
                          {analysisData.structureScore}/100
                        </span>
                      </div>
                      <Progress value={analysisData.structureScore} className="h-2" />
                    </div>

                    <div>
                      <div className="flex justify-between items-center mb-2">
                        <span className="text-sm text-matrix-green/70">Relationship Score</span>
                        <span className={`font-bold ${getScoreColor(analysisData.relationshipScore)}`}>
                          {analysisData.relationshipScore}/100
                        </span>
                      </div>
                      <Progress value={analysisData.relationshipScore} className="h-2" />
                    </div>

                    <div>
                      <div className="flex justify-between items-center mb-2">
                        <span className="text-sm text-matrix-green/70">Coherence Score</span>
                        <span className={`font-bold ${getScoreColor(analysisData.coherenceScore)}`}>
                          {analysisData.coherenceScore}/100
                        </span>
                      </div>
                      <Progress value={analysisData.coherenceScore} className="h-2" />
                    </div>
                  </div>
                  
                  <div className="mt-6 grid grid-cols-2 gap-4 text-center">
                    <div className="p-3 bg-secondary/30 rounded border">
                      <div className="text-lg font-bold text-matrix-green">
                        {analysisData.extractedTriples.length}
                      </div>
                      <p className="text-xs text-matrix-green/70">Semantic Triples</p>
                    </div>
                    <div className="p-3 bg-secondary/30 rounded border">
                      <div className="text-lg font-bold text-matrix-green">
                        {analysisData.entityRelationships.length}
                      </div>
                      <p className="text-xs text-matrix-green/70">Entity Relations</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </TabsContent>

        <TabsContent value="triples">
          {analysisData ? (
            <Card className="content-card">
              <CardHeader>
                <CardTitle className="text-matrix-green flex items-center gap-2">
                  <GitBranch className="w-5 h-5" />
                  Extracted Semantic Triples
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {analysisData.extractedTriples.map((triple, index) => (
                    <div key={index} className="border border-matrix-green/20 rounded-lg p-4">
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center gap-2">
                          <Badge className={getImportanceColor(triple.importance)}>
                            {triple.importance}
                          </Badge>
                          <span className="text-sm text-matrix-green/70">
                            Confidence: {triple.confidence}%
                          </span>
                        </div>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => copyToClipboard(`${triple.subject} → ${triple.predicate} → ${triple.object}`)}
                          className="border-matrix-green/30 text-matrix-green hover:bg-matrix-green/10"
                        >
                          <Copy className="w-3 h-3 mr-1" />
                          Copy
                        </Button>
                      </div>

                      <div className="flex items-center gap-3 mb-3">
                        <div className="flex items-center gap-2">
                          <div className="px-3 py-1 bg-blue-500/20 text-blue-400 rounded text-sm font-medium">
                            {triple.subject}
                          </div>
                          <ArrowRight className="w-4 h-4 text-matrix-green" />
                          <div className="px-3 py-1 bg-green-500/20 text-green-400 rounded text-sm font-medium">
                            {triple.predicate}
                          </div>
                          <ArrowRight className="w-4 h-4 text-matrix-green" />
                          <div className="px-3 py-1 bg-purple-500/20 text-purple-400 rounded text-sm font-medium">
                            {triple.object}
                          </div>
                        </div>
                      </div>

                      <div className="bg-secondary/30 p-3 rounded border">
                        <p className="text-sm text-matrix-green/80 mb-1">Context:</p>
                        <p className="text-matrix-green/90 text-sm">"{triple.context}"</p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          ) : (
            <Card className="content-card">
              <CardContent className="p-8 text-center">
                <GitBranch className="w-12 h-12 text-matrix-green/50 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-matrix-green mb-2">
                  No Semantic Triples Yet
                </h3>
                <p className="text-matrix-green/70">
                  Run the semantic analysis to extract subject-predicate-object triples from your content.
                </p>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="relationships">
          {analysisData ? (
            <Card className="content-card">
              <CardHeader>
                <CardTitle className="text-matrix-green flex items-center gap-2">
                  <Network className="w-5 h-5" />
                  Entity Relationships
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {analysisData.entityRelationships.map((rel, index) => (
                    <div key={index} className="border border-matrix-green/20 rounded-lg p-4">
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center gap-2">
                          <Badge className={getRelationshipTypeColor(rel.type)}>
                            {rel.type}
                          </Badge>
                          <div className="flex items-center gap-1">
                            <span className="text-sm text-matrix-green/70">Strength:</span>
                            <Progress value={rel.strength} className="h-1 w-16" />
                            <span className="text-sm text-matrix-green">{rel.strength}%</span>
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center justify-center gap-4">
                        <div className="px-4 py-2 bg-secondary/50 rounded-lg border text-center flex-1">
                          <p className="font-medium text-matrix-green">{rel.entity1}</p>
                        </div>
                        <div className="flex flex-col items-center gap-1">
                          <ArrowRight className="w-5 h-5 text-matrix-green" />
                          <span className="text-xs text-matrix-green/70 whitespace-nowrap">
                            {rel.relationship}
                          </span>
                        </div>
                        <div className="px-4 py-2 bg-secondary/50 rounded-lg border text-center flex-1">
                          <p className="font-medium text-matrix-green">{rel.entity2}</p>
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
                <Network className="w-12 h-12 text-matrix-green/50 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-matrix-green mb-2">
                  No Entity Relationships Yet
                </h3>
                <p className="text-matrix-green/70">
                  Run the semantic analysis to discover entity relationships in your content.
                </p>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="structure">
          {analysisData ? (
            <div className="space-y-6">
              {/* Knowledge Graph Controls */}
              <Card className="content-card">
                <CardHeader>
                  <CardTitle className="text-matrix-green flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <TreePine className="w-5 h-5" />
                      Knowledge Graph Structure
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={downloadKnowledgeGraph}
                      className="border-matrix-green/30 text-matrix-green hover:bg-matrix-green/10"
                    >
                      <Download className="w-3 h-3 mr-1" />
                      Download Graph
                    </Button>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                    <div className="text-center p-4 bg-secondary/30 rounded border">
                      <div className="text-2xl font-bold text-matrix-green mb-1">
                        {analysisData.contentStructure.knowledgeGraph.nodes.length}
                      </div>
                      <p className="text-sm text-matrix-green/70">Knowledge Nodes</p>
                    </div>
                    <div className="text-center p-4 bg-secondary/30 rounded border">
                      <div className="text-2xl font-bold text-matrix-green mb-1">
                        {analysisData.contentStructure.knowledgeGraph.edges.length}
                      </div>
                      <p className="text-sm text-matrix-green/70">Connections</p>
                    </div>
                    <div className="text-center p-4 bg-secondary/30 rounded border">
                      <div className="text-2xl font-bold text-matrix-green mb-1">
                        {analysisData.contentStructure.hierarchyDepth}
                      </div>
                      <p className="text-sm text-matrix-green/70">Hierarchy Depth</p>
                    </div>
                  </div>

                  {/* Key Nodes */}
                  <div className="mb-6">
                    <h4 className="font-semibold text-matrix-green mb-3">Key Knowledge Nodes</h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      {analysisData.contentStructure.knowledgeGraph.nodes
                        .sort((a, b) => b.importance - a.importance)
                        .slice(0, 6)
                        .map((node, index) => (
                        <div key={index} className="flex items-center justify-between p-3 bg-secondary/20 rounded border">
                          <div className="flex items-center gap-2">
                            <BookOpen className="w-4 h-4 text-matrix-green" />
                            <span className="font-medium text-matrix-green">{node.label}</span>
                            <Badge variant="outline" className="text-xs border-matrix-green/30 text-matrix-green">
                              {node.type}
                            </Badge>
                          </div>
                          <div className="text-right">
                            <div className="text-sm font-semibold text-matrix-green">{node.importance}%</div>
                            <div className="text-xs text-matrix-green/70">importance</div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Semantic Clusters */}
              <Card className="content-card">
                <CardHeader>
                  <CardTitle className="text-matrix-green">Semantic Clusters</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {analysisData.contentStructure.semanticClusters.map((cluster, index) => (
                      <div key={index} className="border border-matrix-green/20 rounded-lg p-4">
                        <div className="flex items-center justify-between mb-3">
                          <h4 className="font-semibold text-matrix-green">{cluster.cluster}</h4>
                          <div className="text-right text-sm">
                            <div className="text-matrix-green font-semibold">
                              {cluster.coherence}% coherence
                            </div>
                            <div className="text-matrix-green/70">
                              {cluster.relationships} relationships
                            </div>
                          </div>
                        </div>
                        <div className="flex flex-wrap gap-2">
                          {cluster.entities.map((entity, eIndex) => (
                            <Badge key={eIndex} variant="outline" className="text-xs border-matrix-green/30 text-matrix-green">
                              {entity}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Topic Flow */}
              <Card className="content-card">
                <CardHeader>
                  <CardTitle className="text-matrix-green">Content Topic Flow</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {analysisData.contentStructure.topicFlow.map((flow, index) => (
                      <div key={index} className="border border-matrix-green/20 rounded-lg p-4">
                        <div className="flex items-center justify-between mb-3">
                          <h4 className="font-semibold text-matrix-green">{flow.section}</h4>
                          <div className="flex items-center gap-4 text-sm">
                            <div>
                              <span className="text-matrix-green/70">Density:</span>
                              <span className="font-semibold text-matrix-green ml-1">{flow.semanticDensity}%</span>
                            </div>
                            <div>
                              <span className="text-matrix-green/70">Connection:</span>
                              <span className="font-semibold text-matrix-green ml-1">{flow.connectionStrength}%</span>
                            </div>
                          </div>
                        </div>
                        <div className="flex flex-wrap gap-2">
                          {flow.topics.map((topic, tIndex) => (
                            <Badge key={tIndex} variant="secondary" className="text-xs">
                              {topic}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          ) : (
            <Card className="content-card">
              <CardContent className="p-8 text-center">
                <TreePine className="w-12 h-12 text-matrix-green/50 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-matrix-green mb-2">
                  No Content Structure Yet
                </h3>
                <p className="text-matrix-green/70">
                  Run the semantic analysis to see content structure and knowledge graph.
                </p>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="gaps">
          {analysisData ? (
            <Card className="content-card">
              <CardHeader>
                <CardTitle className="text-matrix-green">Semantic Gaps Analysis</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {analysisData.semanticGaps.map((gap, index) => (
                    <div key={index} className="border border-matrix-green/20 rounded-lg p-4">
                      <div className="flex items-start gap-3">
                        {getSeverityIcon(gap.severity)}
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <Badge className={getImportanceColor(gap.severity)}>
                              {gap.severity}
                            </Badge>
                          </div>
                          <h4 className="font-semibold text-matrix-green mb-2">{gap.gap}</h4>
                          <p className="text-matrix-green/90 text-sm mb-3">{gap.impact}</p>
                          <div className="bg-secondary/30 p-3 rounded border">
                            <p className="text-sm text-matrix-green/80 mb-1">Suggestion:</p>
                            <p className="text-matrix-green/90 text-sm">{gap.suggestion}</p>
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
                <Search className="w-12 h-12 text-matrix-green/50 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-matrix-green mb-2">
                  No Semantic Gaps Yet
                </h3>
                <p className="text-matrix-green/70">
                  Run the semantic analysis to identify content gaps and improvement opportunities.
                </p>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="optimization">
          {analysisData ? (
            <Card className="content-card">
              <CardHeader>
                <CardTitle className="text-matrix-green">Semantic Optimization Suggestions</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {analysisData.optimizationSuggestions.map((suggestion, index) => (
                    <div key={index} className="border border-matrix-green/20 rounded-lg p-4">
                      <div className="flex items-start gap-3">
                        <Zap className="w-5 h-5 text-matrix-green mt-1" />
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <h4 className="font-semibold text-matrix-green">{suggestion.title}</h4>
                            <Badge className={getImportanceColor(suggestion.priority)}>
                              {suggestion.priority}
                            </Badge>
                            <Badge variant="outline" className="text-xs border-matrix-green/30 text-matrix-green">
                              {suggestion.type}
                            </Badge>
                          </div>
                          <p className="text-matrix-green/90 mb-3">{suggestion.description}</p>
                          
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-3">
                            <div>
                              <p className="text-sm text-matrix-green/70 mb-1">Expected Impact:</p>
                              <p className="text-sm font-semibold text-matrix-green">{suggestion.expectedImpact}</p>
                            </div>
                            <div>
                              <p className="text-sm text-matrix-green/70 mb-1">Implementation:</p>
                              <p className="text-sm text-matrix-green/90">{suggestion.implementation}</p>
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
                <Lightbulb className="w-12 h-12 text-matrix-green/50 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-matrix-green mb-2">
                  No Optimization Suggestions Yet
                </h3>
                <p className="text-matrix-green/70">
                  Complete the semantic analysis to get personalized optimization recommendations.
                </p>
              </CardContent>
            </Card>
          )}
        </TabsContent>
      </Tabs>

      {analysisData && (
        <div className="text-center text-sm text-matrix-green/60 mt-6">
          Last analyzed: {new Date(analysisData.lastAnalyzed).toLocaleString()}
        </div>
      )}
    </div>
  );
};

export default SemanticAnalyzer;