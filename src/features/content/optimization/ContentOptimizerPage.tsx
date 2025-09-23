
import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import Header from "@/components/global/Header";
import Breadcrumbs from "@/components/global/Breadcrumbs";
import { 
  FileText, 
  BarChart3, 
  Code, 
  Eye, 
  Lightbulb,
  Copy,
  Download
} from "lucide-react";
import { toast } from "sonner";
import { useAuth } from "@/contexts/AuthContext";
import { getUserContentHistory } from "@/services/contentService";

const ContentOptimizer = () => {
  const { user } = useAuth();
  const [targetKeyword, setTargetKeyword] = useState("");
  const [content, setContent] = useState("");
  const [analysisResults, setAnalysisResults] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [userContent, setUserContent] = useState<any[]>([]);

  useEffect(() => {
    if (user) {
      loadUserContent();
    }
  }, [user]);

  const loadUserContent = async () => {
    try {
      const contentHistory = await getUserContentHistory();
      setUserContent(contentHistory);
    } catch (error) {
      console.error('Error loading user content:', error);
    }
  };

  const loadSampleContent = () => {
    setTargetKeyword("digital marketing");
    setContent(`Digital Frontier is a leading digital marketing agency in Memphis. We specialize in comprehensive digital strategies that drive results. Our team combines innovative approaches with data-driven insights to help businesses thrive online.

Our services include SEO optimization, web design, and brand development. We work with clients across various industries to create customized solutions. Each project is tailored to meet specific business goals and target audience needs.

Digital marketing continues to evolve rapidly. New technologies and platforms emerge regularly. Businesses must adapt to stay competitive. That's why we focus on cutting-edge strategies and continuous learning.`);
  };

  const loadFromUserContent = (contentItem: any) => {
    setTargetKeyword(contentItem.metadata?.focusKeywords?.[0] || "");
    setContent(contentItem.content || "");
    setAnalysisResults(null);
  };

  const analyzeContent = async () => {
    if (!targetKeyword.trim() || !content.trim()) {
      toast.error("Please enter both target keyword and content");
      return;
    }

    setLoading(true);
    try {
      // Use real AI-powered content analysis
      const { data, error } = await (await import('@/integrations/supabase/client')).supabase.functions.invoke('ai-answer-optimizer', {
        body: JSON.stringify({
          content,
          targetQuery: targetKeyword,
          domain: 'content-analyzer.com',
          optimizationLevel: 'comprehensive',
          contentType: 'article'
        })
      });

      if (error) {
        console.error('Content analysis error:', error);
        // Fallback to basic analysis if AI fails
        const analysis = performContentAnalysis(content, targetKeyword);
        setAnalysisResults(analysis);
      } else {
        // Use AI-powered analysis results
        const aiAnalysis = data.optimizations || [];
        const basicAnalysis = performContentAnalysis(content, targetKeyword);
        
        // Combine AI suggestions with basic metrics
        const enhancedAnalysis = {
          ...basicAnalysis,
          keywordSuggestions: aiAnalysis.length > 0 ? 
            aiAnalysis.map((opt: any) => opt.description || opt.suggestion).slice(0, 5) :
            basicAnalysis.keywordSuggestions,
          contextSuggestions: aiAnalysis.length > 2 ? 
            aiAnalysis.slice(2).map((opt: any) => opt.description || opt.suggestion).slice(0, 4) :
            basicAnalysis.contextSuggestions,
          readabilitySuggestions: [
            ...basicAnalysis.readabilitySuggestions.slice(0, 2),
            ...(aiAnalysis.length > 1 ? [aiAnalysis[1].description || aiAnalysis[1].suggestion] : [])
          ]
        };
        
        setAnalysisResults(enhancedAnalysis);
      }
      
      toast.success("Content analysis completed successfully!");
    } catch (error) {
      console.error('Analysis error:', error);
      // Fallback to basic analysis
      const analysis = performContentAnalysis(content, targetKeyword);
      setAnalysisResults(analysis);
      toast.success("Content analysis completed (basic mode)!");
    } finally {
      setLoading(false);
    }
  };

  const performContentAnalysis = (text: string, keyword: string) => {
    const words = text.split(/\s+/).length;
    const sentences = text.split(/[.!?]+/).filter(s => s.trim()).length;
    const keywordCount = (text.toLowerCase().match(new RegExp(keyword.toLowerCase(), 'g')) || []).length;
    const keywordDensity = ((keywordCount / words) * 100);
    const avgWordsPerSentence = Math.round(words / sentences);
    
    // Simple readability calculation
    const syllables = estimateSyllables(text);
    const readabilityScore = Math.max(0, Math.min(100, 
      Math.round(206.835 - 1.015 * (words/sentences) - 84.6 * (syllables/words))
    ));

    return {
      words,
      sentences,
      keywordCount,
      keywordDensity: parseFloat(keywordDensity.toFixed(1)),
      avgWordsPerSentence,
      readabilityScore,
      qaQuestions: generateQAQuestions(text, keyword),
      schemaMarkup: generateSchemaMarkup(text, keyword),
      keywordSuggestions: generateKeywordSuggestions(text, keyword),
      readabilitySuggestions: generateReadabilitySuggestions(text, avgWordsPerSentence),
      contextSuggestions: generateContextSuggestions(text, keyword)
    };
  };

  const estimateSyllables = (text: string): number => {
    return text.toLowerCase().replace(/[^a-z]/g, '').replace(/[aeiou]{2,}/g, 'a').match(/[aeiou]/g)?.length || 0;
  };

  const generateQAQuestions = (text: string, keyword: string) => {
    const sentences = text.split(/[.!?]+/).filter(s => s.trim());
    const questions = [];

    // Generate strategic questions
    questions.push({
      question: `What is ${keyword}?`,
      answer: `${keyword.charAt(0).toUpperCase() + keyword.slice(1)} encompasses the strategies and techniques used to promote products or services online.`
    });

    questions.push({
      question: `Why is ${keyword} important for businesses?`,
      answer: `${keyword.charAt(0).toUpperCase() + keyword.slice(1)} is crucial for businesses because it enables them to reach their target audience effectively and provides measurable results.`
    });

    // Extract content-based questions
    sentences.forEach((sentence, index) => {
      if (sentence.toLowerCase().includes('we ') && index < 3) {
        questions.push({
          question: "What services do you offer?",
          answer: sentence.trim()
        });
      }
    });

    return questions;
  };

  const generateSchemaMarkup = (text: string, keyword: string) => {
    const questions = generateQAQuestions(text, keyword);
    return {
      "@context": "https://schema.org",
      "@type": "FAQPage",
      "mainEntity": questions.slice(0, 3).map(qa => ({
        "@type": "Question",
        "name": qa.question,
        "acceptedAnswer": {
          "@type": "Answer",
          "text": qa.answer
        }
      }))
    };
  };

  const generateKeywordSuggestions = (text: string, keyword: string) => {
    const currentDensity = analysisResults?.keywordDensity || 0;
    const optimalDensity = 2.0;
    const suggestions = [];

    if (currentDensity < 0.5) {
      suggestions.push("Keyword density is too low. Consider adding more instances of your target keyword.");
    } else if (currentDensity > 3.0) {
      suggestions.push("Keyword density is too high. Consider reducing keyword usage to avoid over-optimization.");
    } else {
      suggestions.push("Keyword density is within acceptable range.");
    }

    suggestions.push(`Include variations like "${keyword} services" or "${keyword} solutions"`);
    suggestions.push("Use the keyword in headings and subheadings");
    suggestions.push("Add the keyword to the first and last paragraphs");

    return suggestions;
  };

  const generateReadabilitySuggestions = (text: string, avgWords: number) => {
    const suggestions = [];
    
    if (avgWords > 20) {
      suggestions.push("Break long sentences into shorter ones (aim for 15-20 words)");
    }
    
    suggestions.push("Use bullet points or numbered lists for complex information");
    suggestions.push("Replace complex words with simpler alternatives");
    suggestions.push("Add subheadings to break up long text blocks");
    suggestions.push("Use active voice instead of passive voice");

    return suggestions;
  };

  const generateContextSuggestions = (text: string, keyword: string) => {
    const suggestions = [];
    
    if (!text.toLowerCase().includes('example')) {
      suggestions.push("Add specific examples to illustrate your points");
    }
    
    if (!text.match(/\d+%/) && !text.match(/\$\d+/)) {
      suggestions.push("Include relevant statistics or data points");
    }

    suggestions.push("Add case studies or success stories");
    suggestions.push("Include specific metrics and KPIs");
    suggestions.push("Mention tools and technologies used");
    suggestions.push(`Reference current trends in ${keyword}`);

    return suggestions;
  };

  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      toast.success("Copied to clipboard!");
    } catch (error) {
      toast.error("Failed to copy to clipboard");
    }
  };

  const exportAnalysis = () => {
    if (!analysisResults) {
      toast.error("No analysis data to export");
      return;
    }

    const reportData = {
      keyword: targetKeyword,
      analysis: analysisResults,
      content: content,
      exportDate: new Date().toISOString()
    };

    const blob = new Blob([JSON.stringify(reportData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `content-analysis-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    
    toast.success("Analysis exported successfully!");
  };

  return (
    <>
      <Header />
      <Breadcrumbs customBreadcrumbs={[
        { label: "Dashboard", path: "/dashboard" },
        { label: "Content Optimizer", path: "/content-optimizer" }
      ]} />
      
      <div className="container mx-auto py-8">
        <div className="max-w-7xl mx-auto space-y-8">
          {/* Header */}
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold mb-4 text-white">
              Content <span className="text-[#39FF14]" style={{textShadow: '0 0 5px #39FF14, 0 0 10px #39FF14'}}>Optimizer</span>
            </h1>
            <p className="text-gray-300 max-w-2xl mx-auto">
              Optimize your content for both AI answer engines and traditional search. Get actionable insights to improve your content's visibility and performance.
            </p>
          </div>

          {/* Input Section */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <Card className="bg-[#1E2329] border-[#39FF14]/30">
              <CardHeader>
                <CardTitle className="text-white flex items-center">
                  <FileText className="w-5 h-5 mr-2 text-[#39FF14]" />
                  Content Input
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Target Keyword
                  </label>
                  <Input
                    value={targetKeyword}
                    onChange={(e) => setTargetKeyword(e.target.value)}
                    placeholder="Enter your primary keyword"
                    className="bg-[#0D1117] border-[#39FF14]/30 text-white"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Your Content
                  </label>
                  <Textarea
                    value={content}
                    onChange={(e) => setContent(e.target.value)}
                    placeholder="Paste your content here..."
                    rows={10}
                    className="bg-[#0D1117] border-[#39FF14]/30 text-white resize-none"
                  />
                </div>

                <div className="flex space-x-3">
                  <Button 
                    onClick={analyzeContent}
                    disabled={loading}
                    className="bg-[#39FF14] text-[#0D1117] font-bold hover:bg-[#39FF14]/80 flex-1"
                    style={{boxShadow: '0 0 5px #39FF14, 0 0 10px #39FF14'}}
                  >
                    {loading ? "Analyzing..." : "Analyze Content"}
                  </Button>
                  <Button 
                    onClick={loadSampleContent}
                    variant="outline"
                    className="border-[#39FF14] text-[#39FF14] hover:bg-[#39FF14] hover:text-[#0D1117]"
                  >
                    Load Sample
                  </Button>
                </div>

                {userContent.length > 0 && (
                  <div className="mt-4">
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Load from Your Content History
                    </label>
                    <div className="space-y-2 max-h-32 overflow-y-auto">
                      {userContent.slice(0, 5).map((item) => (
                        <button
                          key={item.id}
                          onClick={() => loadFromUserContent(item)}
                          className="w-full text-left p-2 text-sm bg-[#0D1117] border border-[#39FF14]/20 rounded hover:border-[#39FF14]/50 text-gray-300 truncate"
                        >
                          {item.title}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Analysis Results */}
            <Card className="bg-[#1E2329] border-[#39FF14]/30">
              <CardHeader>
                <CardTitle className="text-white flex items-center justify-between">
                  <span className="flex items-center">
                    <BarChart3 className="w-5 h-5 mr-2 text-[#39FF14]" />
                    Analysis Results
                  </span>
                  {analysisResults && (
                    <Button
                      onClick={exportAnalysis}
                      size="sm"
                      variant="outline"
                      className="border-[#39FF14] text-[#39FF14] hover:bg-[#39FF14] hover:text-[#0D1117]"
                    >
                      <Download className="w-4 h-4 mr-1" />
                      Export
                    </Button>
                  )}
                </CardTitle>
              </CardHeader>
              <CardContent>
                {!analysisResults ? (
                  <div className="text-center py-12">
                    <div className="text-gray-400 mb-4">
                      <BarChart3 className="w-12 h-12 mx-auto opacity-50" />
                    </div>
                    <p className="text-gray-400">
                      Enter your content and click "Analyze Content" to begin
                    </p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {/* Overall Metrics */}
                    <div className="grid grid-cols-2 gap-4">
                      <div className="bg-[#0D1117] p-4 rounded">
                        <div className="flex justify-between items-center mb-2">
                          <span className="text-sm text-gray-300">Keyword Density</span>
                          <span className={`font-bold ${
                            analysisResults.keywordDensity < 1 ? 'text-red-400' : 
                            analysisResults.keywordDensity > 3 ? 'text-yellow-400' : 'text-[#39FF14]'
                          }`}>
                            {analysisResults.keywordDensity}%
                          </span>
                        </div>
                        <Progress 
                          value={Math.min(analysisResults.keywordDensity * 20, 100)} 
                          className="h-2"
                        />
                        <p className="text-xs text-gray-400 mt-1">Target: 1-3%</p>
                      </div>

                      <div className="bg-[#0D1117] p-4 rounded">
                        <div className="flex justify-between items-center mb-2">
                          <span className="text-sm text-gray-300">Readability</span>
                          <span className={`font-bold ${
                            analysisResults.readabilityScore < 30 ? 'text-red-400' : 
                            analysisResults.readabilityScore < 60 ? 'text-yellow-400' : 'text-[#39FF14]'
                          }`}>
                            {analysisResults.readabilityScore}/100
                          </span>
                        </div>
                        <Progress 
                          value={analysisResults.readabilityScore} 
                          className="h-2"
                        />
                        <p className="text-xs text-gray-400 mt-1">
                          Avg: {analysisResults.avgWordsPerSentence} words/sentence
                        </p>
                      </div>
                    </div>

                    {/* Content Stats */}
                    <div className="bg-[#0D1117] p-4 rounded">
                      <h4 className="font-medium text-white mb-3">Content Statistics</h4>
                      <div className="grid grid-cols-3 gap-4 text-sm">
                        <div>
                          <span className="text-gray-400">Words:</span>
                          <span className="text-[#39FF14] ml-2 font-bold">{analysisResults.words}</span>
                        </div>
                        <div>
                          <span className="text-gray-400">Sentences:</span>
                          <span className="text-[#39FF14] ml-2 font-bold">{analysisResults.sentences}</span>
                        </div>
                        <div>
                          <span className="text-gray-400">Keywords:</span>
                          <span className="text-[#39FF14] ml-2 font-bold">{analysisResults.keywordCount}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Optimization Tabs */}
          {analysisResults && (
            <Tabs defaultValue="qa" className="w-full">
              <TabsList className="grid w-full grid-cols-5 bg-[#1E2329]">
                <TabsTrigger value="qa" className="data-[state=active]:bg-[#39FF14] data-[state=active]:text-[#0D1117]">
                  Q&A Format
                </TabsTrigger>
                <TabsTrigger value="keywords" className="data-[state=active]:bg-[#39FF14] data-[state=active]:text-[#0D1117]">
                  Keywords
                </TabsTrigger>
                <TabsTrigger value="schema" className="data-[state=active]:bg-[#39FF14] data-[state=active]:text-[#0D1117]">
                  Schema
                </TabsTrigger>
                <TabsTrigger value="readability" className="data-[state=active]:bg-[#39FF14] data-[state=active]:text-[#0D1117]">
                  Readability
                </TabsTrigger>
                <TabsTrigger value="context" className="data-[state=active]:bg-[#39FF14] data-[state=active]:text-[#0D1117]">
                  Context
                </TabsTrigger>
              </TabsList>

              <TabsContent value="qa" className="mt-6">
                <Card className="bg-[#1E2329] border-[#39FF14]/30">
                  <CardHeader>
                    <CardTitle className="text-white">Question & Answer Format</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {analysisResults.qaQuestions.map((qa: any, index: number) => (
                        <div key={index} className="bg-[#0D1117] p-4 rounded border border-[#39FF14]/20">
                          <div className="font-bold text-white mb-2">Q{index + 1}: {qa.question}</div>
                          <div className="text-gray-300">A: {qa.answer}</div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="keywords" className="mt-6">
                <Card className="bg-[#1E2329] border-[#39FF14]/30">
                  <CardHeader>
                    <CardTitle className="text-white">Keyword Analysis</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="bg-[#0D1117] p-4 rounded">
                        <h4 className="font-medium text-white mb-3">Current Analysis</h4>
                        <ul className="space-y-2 text-sm">
                          <li className="text-gray-300">
                            Keyword: <span className="bg-[#39FF14]/20 text-[#39FF14] px-2 py-1 rounded">{targetKeyword}</span>
                          </li>
                          <li className="text-gray-300">Current appearances: <span className="text-[#39FF14]">{analysisResults.keywordCount}</span></li>
                          <li className="text-gray-300">Current density: <span className="text-[#39FF14]">{analysisResults.keywordDensity}%</span></li>
                        </ul>
                      </div>
                      
                      <div className="bg-[#0D1117] p-4 rounded">
                        <h4 className="font-medium text-white mb-3">Optimization Suggestions</h4>
                        <ul className="space-y-2 text-sm">
                          {analysisResults.keywordSuggestions.map((suggestion: string, index: number) => (
                            <li key={index} className="text-gray-300 flex items-start">
                              <span className="text-[#39FF14] mr-2">→</span>
                              {suggestion}
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="schema" className="mt-6">
                <Card className="bg-[#1E2329] border-[#39FF14]/30">
                  <CardHeader>
                    <CardTitle className="text-white flex items-center justify-between">
                      FAQ Schema Markup
                      <Button
                        onClick={() => copyToClipboard(JSON.stringify(analysisResults.schemaMarkup, null, 2))}
                        size="sm"
                        variant="outline"
                        className="border-[#39FF14] text-[#39FF14] hover:bg-[#39FF14] hover:text-[#0D1117]"
                      >
                        <Copy className="w-4 h-4 mr-1" />
                        Copy
                      </Button>
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="bg-[#0D1117] p-4 rounded mb-4">
                      <pre className="text-[#39FF14] text-sm overflow-x-auto">
                        <code>{JSON.stringify(analysisResults.schemaMarkup, null, 2)}</code>
                      </pre>
                    </div>
                    
                    <div className="bg-[#0D1117] p-4 rounded">
                      <h4 className="font-medium text-white mb-3">Implementation Instructions</h4>
                      <ul className="space-y-2 text-sm">
                        <li className="text-gray-300 flex items-start">
                          <span className="text-[#39FF14] mr-2">→</span>
                          Add this schema to your page's &lt;head&gt; section
                        </li>
                        <li className="text-gray-300 flex items-start">
                          <span className="text-[#39FF14] mr-2">→</span>
                          Wrap it in &lt;script type="application/ld+json"&gt; tags
                        </li>
                        <li className="text-gray-300 flex items-start">
                          <span className="text-[#39FF14] mr-2">→</span>
                          Test with Google's Rich Results Test tool
                        </li>
                        <li className="text-gray-300 flex items-start">
                          <span className="text-[#39FF14] mr-2">→</span>
                          Monitor performance in Search Console
                        </li>
                      </ul>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="readability" className="mt-6">
                <Card className="bg-[#1E2329] border-[#39FF14]/30">
                  <CardHeader>
                    <CardTitle className="text-white">Readability Analysis</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="bg-[#0D1117] p-4 rounded">
                        <h4 className="font-medium text-white mb-3">Current Metrics</h4>
                        <ul className="space-y-2 text-sm">
                          <li className="text-gray-300">
                            Flesch Reading Ease: <span className="text-[#39FF14]">{analysisResults.readabilityScore}/100</span>
                          </li>
                          <li className="text-gray-300">
                            Average words per sentence: <span className="text-[#39FF14]">{analysisResults.avgWordsPerSentence}</span>
                          </li>
                        </ul>
                      </div>

                      <div className="bg-[#0D1117] p-4 rounded">
                        <h4 className="font-medium text-white mb-3">Improvement Suggestions</h4>
                        <ul className="space-y-2 text-sm">
                          {analysisResults.readabilitySuggestions.map((suggestion: string, index: number) => (
                            <li key={index} className="text-gray-300 flex items-start">
                              <span className="text-[#39FF14] mr-2">→</span>
                              {suggestion}
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="context" className="mt-6">
                <Card className="bg-[#1E2329] border-[#39FF14]/30">
                  <CardHeader>
                    <CardTitle className="text-white">Context Enhancement</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="bg-[#0D1117] p-4 rounded">
                      <h4 className="font-medium text-white mb-3">Suggested Improvements</h4>
                      <ul className="space-y-2 text-sm">
                        {analysisResults.contextSuggestions.map((suggestion: string, index: number) => (
                          <li key={index} className="text-gray-300 flex items-start">
                            <span className="text-[#39FF14] mr-2">→</span>
                            {suggestion}
                          </li>
                        ))}
                      </ul>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          )}
        </div>
      </div>
    </>
  );
};

export default ContentOptimizer;
