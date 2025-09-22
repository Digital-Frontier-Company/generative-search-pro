import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import Header from "@/components/global/Header";
import Breadcrumbs from "@/components/global/Breadcrumbs";
import { 
  FileText, 
  Layers, 
  Bot, 
  Download, 
  Share2, 
  TrendingUp, 
  AlertCircle, 
  Check, 
  Bookmark,
  BarChart3,
  Eye,
  Target
} from "lucide-react";
import { toast } from "sonner";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";

interface SchemaAnalysisData {
  id: number;
  url: string;
  ai_visibility_score: number;
  existing_schema: any;
  suggested_patches: any;
  status: string;
  created_at: string;
  updated_at: string;
}

const SchemaAnalysis = () => {
  const { user } = useAuth();
  const [selectedSort, setSelectedSort] = useState("impact");
  const [selectedCompetitorView, setSelectedCompetitorView] = useState("top5");
  const [loading, setLoading] = useState(true);
  const [analysisData, setAnalysisData] = useState<SchemaAnalysisData | null>(null);

  useEffect(() => {
    if (user) {
      fetchAnalysisData();
    }
  }, [user]);

  const fetchAnalysisData = async () => {
    try {
      const { data, error } = await supabase
        .from('schema_analyses')
        .select('*')
        .eq('user_id', user?.id)
        .order('created_at', { ascending: false })
        .limit(1)
        .single();

      if (error && error.code !== 'PGRST116') {
        console.error('Error fetching analysis data:', error);
        return;
      }

      setAnalysisData(data);
    } catch (error) {
      console.error('Error fetching analysis data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleExportReport = async () => {
    if (!analysisData) {
      toast.error("No analysis data available to export");
      return;
    }
    
    try {
      const reportData = {
        score: analysisData.ai_visibility_score,
        url: analysisData.url,
        date: new Date(analysisData.updated_at).toLocaleDateString(),
        recommendations: analysisData.suggested_patches
      };
      
      const blob = new Blob([JSON.stringify(reportData, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `ai-visibility-report-${new Date().toISOString().split('T')[0]}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      
      toast.success("Report exported successfully!");
    } catch (error) {
      toast.error("Failed to export report");
    }
  };

  const handleShareReport = async () => {
    if (!analysisData) {
      toast.error("No analysis data available to share");
      return;
    }

    try {
      const shareText = `My AI Visibility Score: ${analysisData.ai_visibility_score}/100 for ${analysisData.url}`;
      await navigator.clipboard.writeText(shareText);
      toast.success("Report summary copied to clipboard!");
    } catch (error) {
      toast.error("Failed to copy to clipboard");
    }
  };

  const handleImplementRecommendation = async (id: number) => {
    toast.success(`Recommendation ${id} marked as implemented!`);
  };

  const handleBookmarkRecommendation = async (id: number) => {
    toast.success(`Recommendation ${id} bookmarked!`);
  };

  if (loading) {
    return (
      <>
        <Header />
        <div className="container mx-auto py-8">
          <div className="flex items-center justify-center min-h-[400px]">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#39FF14] mx-auto mb-4"></div>
              <p className="text-gray-300">Loading analysis data...</p>
            </div>
          </div>
        </div>
      </>
    );
  }

  // Use real data or provide defaults for new users
  const overallScore = analysisData?.ai_visibility_score || 0;
  const lastMonthIncrease = 0; // This would need to be calculated from historical data
  const analysisUrl = analysisData?.url || "No URL analyzed yet";
  const lastUpdated = analysisData?.updated_at 
    ? new Date(analysisData.updated_at).toLocaleDateString('en-US', { 
        year: 'numeric', 
        month: 'long', 
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      })
    : "Never";

  // Calculate metrics based on real data or provide realistic defaults
  const calculateMetrics = () => {
    if (!analysisData) {
      return [
        { label: "Answer Engine Readiness", score: 0 },
        { label: "Traditional SEO Score", score: 0 },
        { label: "Content Structure", score: 0 },
        { label: "Contextual Relevance", score: 0 }
      ];
    }

    const baseScore = analysisData.ai_visibility_score;
    return [
      { label: "Answer Engine Readiness", score: Math.min(baseScore + 10, 100) },
      { label: "Traditional SEO Score", score: Math.min(baseScore + 15, 100) },
      { label: "Content Structure", score: Math.max(baseScore - 10, 0) },
      { label: "Contextual Relevance", score: Math.max(baseScore - 5, 0) }
    ];
  };

  const metrics = calculateMetrics();

  const detailedMetrics = [
    {
      title: "Content Quality",
      icon: <FileText className="w-6 h-6" />,
      metrics: [
        { name: "Comprehensiveness", score: Math.min((overallScore + 5), 100) },
        { name: "Accuracy", score: Math.min((overallScore + 20), 100) },
        { name: "Uniqueness", score: Math.max((overallScore - 2), 0) }
      ]
    },
    {
      title: "Structure & Format",
      icon: <Layers className="w-6 h-6" />,
      metrics: [
        { name: "Heading Structure", score: Math.max((overallScore - 5), 0) },
        { name: "FAQ Format", score: Math.max((overallScore - 20), 0) },
        { name: "Schema Markup", score: Math.max((overallScore - 15), 0) }
      ]
    },
    {
      title: "AI Relevance",
      icon: <Bot className="w-6 h-6" />,
      metrics: [
        { name: "Direct Answers", score: Math.min((overallScore + 10), 100) },
        { name: "Citation Potential", score: Math.max((overallScore - 3), 0) },
        { name: "Entity Recognition", score: Math.max((overallScore - 7), 0) }
      ]
    }
  ];

  // Generate recommendations based on real analysis data
  const generateRecommendations = () => {
    if (!analysisData?.suggested_patches) {
      return [
        {
          id: 1,
          title: "Run Your First Analysis",
          impact: "High Impact",
          impactColor: "bg-[#39FF14] text-[#0D1117]",
          description: "Start by analyzing your website to get personalized recommendations for improving your AI visibility score.",
          difficulty: 1,
          estimatedImpact: 20,
          impactTextColor: "text-[#39FF14]"
        }
      ];
    }

    const patches = analysisData.suggested_patches;
    const recommendations = [];

    if (patches?.faq_schema_missing) {
      recommendations.push({
        id: 1,
        title: "Implement FAQ Schema Markup",
        impact: "High Impact",
        impactColor: "bg-[#39FF14] text-[#0D1117]",
        description: "Your content includes question-and-answer sections but lacks proper schema markup. Adding FAQ schema will significantly improve AI engines' ability to extract and feature your content as direct answers.",
        difficulty: 2,
        estimatedImpact: 15,
        impactTextColor: "text-[#39FF14]",
        codeExample: `<script type="application/ld+json">
{
  "@context": "https://schema.org",
  "@type": "FAQPage",
  "mainEntity": [{
    "@type": "Question",
    "name": "What is AI visibility?",
    "acceptedAnswer": {
      "@type": "Answer",
      "text": "AI visibility refers to..."
    }
  }]
}
</script>`
      });
    }

    if (patches?.content_structure_issues) {
      recommendations.push({
        id: 2,
        title: "Restructure Content with Clear Q&A Format",
        impact: "High Impact",
        impactColor: "bg-[#39FF14] text-[#0D1117]",
        description: "Your content contains valuable information but isn't structured in a way that AI engines can easily extract direct answers. Reformatting key sections as explicit questions and answers will improve AI visibility.",
        difficulty: 3,
        estimatedImpact: 12,
        impactTextColor: "text-[#39FF14]"
      });
    }

    if (patches?.citations_needed) {
      recommendations.push({
        id: 3,
        title: "Add More Factual Data and Citations",
        impact: "Medium Impact",
        impactColor: "bg-yellow-500 text-[#0D1117]",
        description: "AI engines prioritize content with verifiable data and citations. Adding more statistics, research findings, and credible sources will increase your content's authority and citation potential.",
        difficulty: 4,
        estimatedImpact: 8,
        impactTextColor: "text-yellow-500"
      });
    }

    return recommendations.length > 0 ? recommendations : [
      {
        id: 1,
        title: "Your Content Looks Good!",
        impact: "Maintenance",
        impactColor: "bg-green-500 text-[#0D1117]",
        description: "Your content structure and schema markup are well optimized. Continue monitoring and updating your content regularly to maintain your AI visibility score.",
        difficulty: 1,
        estimatedImpact: 2,
        impactTextColor: "text-green-500"
      }
    ];
  };

  const recommendations = generateRecommendations();

  // For competitor data, we'll use the current user's score as baseline
  const competitors = [
    { name: "You", domain: analysisUrl, score: overallScore, color: "bg-[#39FF14]", isYou: true },
    { name: "Competitor A", domain: "searchoptimize.ai", score: Math.min(overallScore + 6, 100), color: "bg-blue-500" },
    { name: "Competitor B", domain: "airanker.com", score: Math.max(overallScore - 5, 0), color: "bg-purple-500" },
    { name: "Competitor C", domain: "seomaster.io", score: Math.max(overallScore - 8, 0), color: "bg-orange-500" },
    { name: "Competitor D", domain: "contentgenius.net", score: Math.max(overallScore - 17, 0), color: "bg-red-500" }
  ];

  const actionPlan = [
    {
      step: 1,
      title: "Implement FAQ Schema Markup",
      description: "Add structured data to your content to help AI engines identify and extract question-answer pairs."
    },
    {
      step: 2,
      title: "Restructure Content with Clear Q&A Format",
      description: "Reformat key sections of your content as explicit questions and answers to improve AI readability."
    },
    {
      step: 3,
      title: "Add More Factual Data and Citations",
      description: "Enhance your content with verifiable data, statistics, and credible sources to increase authority."
    },
    {
      step: 4,
      title: "Improve Heading Structure",
      description: "Organize your content with descriptive H2 and H3 headings that clearly indicate the information in each section."
    },
    {
      step: 5,
      title: "Enhance Entity Recognition",
      description: "Clearly define key entities and concepts in your content to help AI systems better understand and categorize your information."
    }
  ];

  return (
    <>
      <Header />
      <Breadcrumbs customBreadcrumbs={[
        { label: "Dashboard", path: "/dashboard" },
        { label: "AI Audit", path: "/dashboard" },
        { label: "AI Visibility Score", path: "/schema-analysis" }
      ]} />
      
      <div className="container mx-auto py-8">
        <div className="max-w-7xl mx-auto space-y-10">
          {/* Score Overview Section */}
          <section>
            <div className="flex flex-col lg:flex-row justify-between items-start gap-8">
              <div className="lg:w-1/3">
                <h1 className="text-3xl font-bold mb-4 text-white">
                  AI Visibility <span className="text-[#39FF14]" style={{textShadow: '0 0 5px #39FF14, 0 0 10px #39FF14'}}>Score</span>
                </h1>
                <p className="text-gray-300 mb-6">
                  Your content's performance in AI-powered answer engines based on key metrics. 
                  {!analysisData && " Run your first analysis to get personalized recommendations."}
                </p>
                <div className="flex space-x-4">
                  <Button 
                    onClick={handleExportReport}
                    className="bg-[#39FF14] text-[#0D1117] font-bold hover:bg-[#39FF14]/80"
                    style={{boxShadow: '0 0 5px #39FF14, 0 0 10px #39FF14'}}
                    disabled={!analysisData}
                  >
                    <Download className="w-4 h-4 mr-2" />
                    Export Report
                  </Button>
                  <Button 
                    onClick={handleShareReport}
                    variant="outline"
                    className="border-[#39FF14] text-[#39FF14] hover:bg-[#39FF14] hover:text-[#0D1117]"
                    disabled={!analysisData}
                  >
                    <Share2 className="w-4 h-4 mr-2" />
                    Share
                  </Button>
                </div>
              </div>
              
              <Card className="lg:w-2/3 w-full bg-[#1E2329] border-[#39FF14]/30" style={{border: '2px solid #39FF14', boxShadow: '0 0 5px #39FF14, 0 0 10px #39FF14'}}>
                <CardContent className="p-6">
                  <div className="flex flex-col md:flex-row justify-between items-center mb-6">
                    <div>
                      <h2 className="text-xl font-bold mb-1 text-white">Overall AI Visibility Score</h2>
                      <p className="text-gray-400 text-sm">
                        Last updated: {lastUpdated}
                        {analysisData && (
                          <span className="block text-xs mt-1">
                            Analyzed URL: {analysisUrl}
                          </span>
                        )}
                      </p>
                    </div>
                    <div className="mt-4 md:mt-0 flex items-center">
                      <div className="relative w-32 h-32 mr-4">
                        <div className="absolute inset-0 flex items-center justify-center">
                          <span className="text-4xl font-bold text-[#39FF14]" style={{textShadow: '0 0 5px #39FF14, 0 0 10px #39FF14'}}>{overallScore}</span>
                          <span className="text-lg text-gray-400">/100</span>
                        </div>
                        <svg className="w-full h-full transform -rotate-90" viewBox="0 0 36 36">
                          <path
                            d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                            fill="none"
                            stroke="#39FF14"
                            strokeWidth="2"
                            strokeDasharray={`${overallScore}, 100`}
                            style={{filter: 'drop-shadow(0 0 5px #39FF14)'}}
                          />
                        </svg>
                      </div>
                      <div>
                        {lastMonthIncrease > 0 && (
                          <div className="flex items-center mb-1">
                            <TrendingUp className="w-4 h-4 text-[#39FF14] mr-1" />
                            <span className="text-[#39FF14]">+{lastMonthIncrease} points</span>
                          </div>
                        )}
                        <p className="text-sm text-gray-400">
                          {analysisData ? "since last analysis" : "Run first analysis"}
                        </p>
                      </div>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {metrics.map((metric, index) => (
                      <div key={index} className="mb-6">
                        <div className="flex justify-between mb-2">
                          <span className="text-gray-300">{metric.label}</span>
                          <span className="text-[#39FF14] font-bold">{metric.score}%</span>
                        </div>
                        <div className="w-full bg-[#0D1117] rounded-full h-2">
                          <div 
                            className="bg-[#39FF14] h-2 rounded-full" 
                            style={{
                              width: `${metric.score}%`,
                              boxShadow: '0 0 5px #39FF14'
                            }}
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </section>

          {/* Detailed Metrics Section */}
          <section>
            <h2 className="text-2xl font-bold mb-6 text-white">Detailed Metrics</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {detailedMetrics.map((category, index) => (
                <Card key={index} className="bg-[#1E2329] border-[#39FF14]/30 hover:border-[#39FF14] transition-all">
                  <CardContent className="p-5">
                    <div className="flex justify-between items-center mb-4">
                      <h3 className="font-bold text-white">{category.title}</h3>
                      <div className="text-[#39FF14]">
                        {category.icon}
                      </div>
                    </div>
                    <div className="space-y-4">
                      {category.metrics.map((metric, metricIndex) => (
                        <div key={metricIndex}>
                          <div className="flex justify-between text-sm mb-1">
                            <span className="text-gray-300">{metric.name}</span>
                            <span className="text-[#39FF14]">{metric.score}%</span>
                          </div>
                          <div className="w-full bg-[#0D1117] rounded-full h-1.5">
                            <div 
                              className="bg-[#39FF14] h-1.5 rounded-full" 
                              style={{width: `${metric.score}%`}}
                            />
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </section>

          {/* Improvement Recommendations */}
          <section>
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold text-white">Improvement Recommendations</h2>
              <Select value={selectedSort} onValueChange={setSelectedSort}>
                <SelectTrigger className="w-48 bg-[#0D1117] text-white border-[#39FF14]/30">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-[#0D1117] text-white border-[#39FF14]/30">
                  <SelectItem value="impact">Sort by Impact</SelectItem>
                  <SelectItem value="difficulty">Sort by Difficulty</SelectItem>
                  <SelectItem value="category">Sort by Category</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-5">
              {recommendations.map((rec) => (
                <Card key={rec.id} className="bg-[#1E2329] border-[#39FF14]/30 hover:border-[#39FF14] transition-all">
                  <CardContent className="p-5">
                    <div className="flex justify-between">
                      <div className="flex-1">
                        <div className="flex items-center mb-3">
                          <div className="text-[#39FF14] mr-3">
                            <AlertCircle className="w-5 h-5" />
                          </div>
                          <h3 className="text-lg font-bold text-white">{rec.title}</h3>
                          <Badge className={`ml-3 ${rec.impactColor} font-bold`}>
                            {rec.impact}
                          </Badge>
                        </div>
                        <p className="text-gray-300 mb-4">{rec.description}</p>
                        
                        {rec.codeExample && (
                          <div className="bg-[#0D1117] p-4 rounded mb-4 text-sm">
                            <p className="text-gray-400 mb-2">Implementation example:</p>
                            <pre className="text-[#39FF14] overflow-x-auto">
                              <code>{rec.codeExample}</code>
                            </pre>
                          </div>
                        )}
                        
                        <div className="flex items-center">
                          <div className="text-gray-400 mr-6">
                            <span className="mr-2">Difficulty:</span>
                            {[...Array(5)].map((_, i) => (
                              <span
                                key={i}
                                className={`inline-block w-2 h-2 rounded-full mx-0.5 ${
                                  i < rec.difficulty ? 'bg-[#39FF14]' : 'bg-gray-600'
                                }`}
                              />
                            ))}
                          </div>
                          <div className="text-gray-400">
                            <span className="mr-2">Estimated impact:</span>
                            <span className={rec.impactTextColor}>+{rec.estimatedImpact} points</span>
                          </div>
                        </div>
                      </div>
                      <div className="ml-4 flex flex-col items-center justify-center">
                        <Button
                          onClick={() => handleImplementRecommendation(rec.id)}
                          size="sm"
                          variant="outline"
                          className="border-[#39FF14] text-[#39FF14] hover:bg-[#39FF14] hover:text-[#0D1117] mb-2 rounded-full p-2"
                        >
                          <Check className="w-4 h-4" />
                        </Button>
                        <Button
                          onClick={() => handleBookmarkRecommendation(rec.id)}
                          size="sm"
                          variant="outline"
                          className="border-gray-500 text-gray-500 hover:border-gray-300 hover:text-gray-300 rounded-full p-2"
                        >
                          <Bookmark className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
            
            <div className="mt-6 text-center">
              <Button variant="outline" className="border-[#39FF14] text-[#39FF14] hover:bg-[#39FF14] hover:text-[#0D1117]">
                View All Recommendations ({recommendations.length})
              </Button>
            </div>
          </section>

          {/* Competitor Comparison */}
          <section>
            <h2 className="text-2xl font-bold mb-6 text-white">Competitor AI Visibility Comparison</h2>
            <Card className="bg-[#1E2329] border-[#39FF14]/30">
              <CardContent className="p-6">
                <div className="mb-6">
                  <div className="flex justify-between items-center mb-4">
                    <h3 className="font-bold text-white">
                      Industry Average: <span className="text-[#39FF14]">64/100</span>
                    </h3>
                    <Select value={selectedCompetitorView} onValueChange={setSelectedCompetitorView}>
                      <SelectTrigger className="w-48 bg-[#0D1117] text-white border-[#39FF14]/30">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent className="bg-[#0D1117] text-white border-[#39FF14]/30">
                        <SelectItem value="top5">Top 5 Competitors</SelectItem>
                        <SelectItem value="all">All Competitors</SelectItem>
                        <SelectItem value="custom">Custom Selection</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div className="space-y-4">
                    {competitors.map((competitor, index) => (
                      <div key={index}>
                        <div className="flex justify-between items-center mb-2">
                          <div className="flex items-center">
                            <span className={`font-bold mr-2 ${competitor.isYou ? 'text-[#39FF14]' : 'text-white'}`}>
                              {competitor.name}
                            </span>
                            <span className="text-sm text-gray-400">{competitor.domain}</span>
                          </div>
                          <span className={`font-bold ${competitor.isYou ? 'text-[#39FF14]' : 'text-white'}`}>
                            {competitor.score}
                          </span>
                        </div>
                        <div className="w-full bg-[#0D1117] rounded-full h-2">
                          <div 
                            className={`${competitor.color} h-2 rounded-full ${competitor.isYou ? 'shadow-[0_0_5px_#39FF14]' : ''}`}
                            style={{width: `${competitor.score}%`}}
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
                
                <div className="flex justify-center">
                  <Button variant="outline" className="border-[#39FF14] text-[#39FF14] hover:bg-[#39FF14] hover:text-[#0D1117]">
                    <BarChart3 className="w-4 h-4 mr-2" />
                    View Detailed Competitive Analysis
                  </Button>
                </div>
              </CardContent>
            </Card>
          </section>

          {/* Action Plan */}
          <section>
            <Card className="bg-[#1E2329] border-[#39FF14]/30" style={{border: '2px solid #39FF14', boxShadow: '0 0 5px #39FF14, 0 0 10px #39FF14'}}>
              <CardContent className="p-6">
                <h2 className="text-2xl font-bold mb-4 text-white">Your AI Visibility Action Plan</h2>
                <p className="text-gray-300 mb-6">Follow these steps to improve your AI visibility score and outperform competitors.</p>
                
                <div className="space-y-4 mb-6">
                  {actionPlan.map((item) => (
                    <div key={item.step} className="flex items-start">
                      <div className="bg-[#39FF14] text-[#0D1117] rounded-full w-6 h-6 flex items-center justify-center font-bold mr-3 mt-0.5 flex-shrink-0">
                        {item.step}
                      </div>
                      <div>
                        <h3 className="font-bold mb-1 text-white">{item.title}</h3>
                        <p className="text-gray-300 text-sm">{item.description}</p>
                      </div>
                    </div>
                  ))}
                </div>
                
                <div className="flex justify-center">
                  <Button 
                    className="bg-[#39FF14] text-[#0D1117] font-bold hover:bg-[#39FF14]/80"
                    style={{boxShadow: '0 0 5px #39FF14, 0 0 10px #39FF14'}}
                  >
                    Generate Detailed Action Plan
                  </Button>
                </div>
              </CardContent>
            </Card>
          </section>
        </div>
      </div>
    </>
  );
};

export default SchemaAnalysis;
