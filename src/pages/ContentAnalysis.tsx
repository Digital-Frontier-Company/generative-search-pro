
import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import Header from "@/components/Header";
import { Search, FileText, CheckCircle, AlertCircle, TrendingUp, Lightbulb } from "lucide-react";

const ContentAnalysis = () => {
  const [url, setUrl] = useState("");
  const [content, setContent] = useState("");
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  const handleAnalysis = () => {
    setIsAnalyzing(true);
    // Simulate analysis
    setTimeout(() => setIsAnalyzing(false), 3000);
  };

  const analysisResults = {
    overallScore: 78,
    readabilityScore: 85,
    seoScore: 72,
    aiOptimizationScore: 68,
    issues: [
      { type: 'warning', text: 'Missing structured data markup', category: 'SEO' },
      { type: 'error', text: 'No FAQ section found', category: 'AI Optimization' },
      { type: 'success', text: 'Good heading structure', category: 'Structure' },
      { type: 'warning', text: 'Content could be more concise', category: 'Readability' }
    ],
    suggestions: [
      'Add JSON-LD structured data for better AI understanding',
      'Include a FAQ section with common questions',
      'Break up long paragraphs for better readability',
      'Add more specific keywords for target queries'
    ]
  };

  return (
    <>
      <Header />
      <div className="container mx-auto py-8">
        <div className="max-w-6xl mx-auto space-y-6">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-matrix-green mb-2">Content Analysis & Optimization</h1>
            <p className="text-matrix-green/70">Analyze and optimize your content for AI search engines</p>
          </div>

          <Tabs defaultValue="url" className="w-full">
            <TabsList className="grid w-full grid-cols-2 bg-matrix-dark-gray">
              <TabsTrigger value="url" className="text-matrix-green data-[state=active]:bg-matrix-green data-[state=active]:text-black">
                Analyze URL
              </TabsTrigger>
              <TabsTrigger value="content" className="text-matrix-green data-[state=active]:bg-matrix-green data-[state=active]:text-black">
                Analyze Content
              </TabsTrigger>
            </TabsList>

            <TabsContent value="url" className="space-y-6">
              <Card className="content-card">
                <CardHeader>
                  <CardTitle className="text-xl text-matrix-green flex items-center gap-2">
                    <Search className="w-5 h-5" />
                    URL Analysis
                  </CardTitle>
                  <CardDescription className="text-matrix-green/70">
                    Enter a URL to analyze its content for AI optimization
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex gap-4">
                    <Input
                      placeholder="https://example.com/your-content"
                      value={url}
                      onChange={(e) => setUrl(e.target.value)}
                      className="flex-1 bg-matrix-dark-gray border-matrix-green/30 text-matrix-green"
                    />
                    <Button 
                      onClick={handleAnalysis}
                      disabled={isAnalyzing || !url}
                      className="glow-button text-black font-semibold"
                    >
                      {isAnalyzing ? 'Analyzing...' : 'Analyze'}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="content" className="space-y-6">
              <Card className="content-card">
                <CardHeader>
                  <CardTitle className="text-xl text-matrix-green flex items-center gap-2">
                    <FileText className="w-5 h-5" />
                    Content Analysis
                  </CardTitle>
                  <CardDescription className="text-matrix-green/70">
                    Paste your content directly for analysis
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <Textarea
                    placeholder="Paste your content here..."
                    value={content}
                    onChange={(e) => setContent(e.target.value)}
                    className="min-h-32 bg-matrix-dark-gray border-matrix-green/30 text-matrix-green"
                  />
                  <Button 
                    onClick={handleAnalysis}
                    disabled={isAnalyzing || !content}
                    className="glow-button text-black font-semibold"
                  >
                    {isAnalyzing ? 'Analyzing...' : 'Analyze Content'}
                  </Button>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>

          {/* Analysis Results */}
          {!isAnalyzing && (url || content) && (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Score Overview */}
              <div className="lg:col-span-1 space-y-4">
                <Card className="content-card">
                  <CardHeader>
                    <CardTitle className="text-lg text-matrix-green">Overall Score</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="text-center">
                      <div className="text-4xl font-bold text-matrix-green mb-2">{analysisResults.overallScore}%</div>
                      <Badge className="bg-yellow-100 text-yellow-800">Good</Badge>
                    </div>
                    
                    <div className="space-y-3">
                      <div>
                        <div className="flex justify-between text-sm mb-1">
                          <span className="text-matrix-green">Readability</span>
                          <span className="text-matrix-green">{analysisResults.readabilityScore}%</span>
                        </div>
                        <Progress value={analysisResults.readabilityScore} className="h-2" />
                      </div>
                      
                      <div>
                        <div className="flex justify-between text-sm mb-1">
                          <span className="text-matrix-green">SEO Score</span>
                          <span className="text-matrix-green">{analysisResults.seoScore}%</span>
                        </div>
                        <Progress value={analysisResults.seoScore} className="h-2" />
                      </div>
                      
                      <div>
                        <div className="flex justify-between text-sm mb-1">
                          <span className="text-matrix-green">AI Optimization</span>
                          <span className="text-matrix-green">{analysisResults.aiOptimizationScore}%</span>
                        </div>
                        <Progress value={analysisResults.aiOptimizationScore} className="h-2" />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Issues and Suggestions */}
              <div className="lg:col-span-2 space-y-4">
                <Card className="content-card">
                  <CardHeader>
                    <CardTitle className="text-lg text-matrix-green">Issues Found</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    {analysisResults.issues.map((issue, index) => (
                      <div key={index} className="flex items-start gap-3 p-3 rounded-lg bg-matrix-dark-gray border border-matrix-green/30">
                        {issue.type === 'error' && <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />}
                        {issue.type === 'warning' && <AlertCircle className="w-5 h-5 text-yellow-500 flex-shrink-0 mt-0.5" />}
                        {issue.type === 'success' && <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />}
                        <div>
                          <p className="text-matrix-green">{issue.text}</p>
                          <Badge variant="outline" className="text-xs mt-1 border-matrix-green/30 text-matrix-green/70">
                            {issue.category}
                          </Badge>
                        </div>
                      </div>
                    ))}
                  </CardContent>
                </Card>

                <Card className="content-card">
                  <CardHeader>
                    <CardTitle className="text-lg text-matrix-green flex items-center gap-2">
                      <Lightbulb className="w-5 h-5" />
                      Optimization Suggestions
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    {analysisResults.suggestions.map((suggestion, index) => (
                      <div key={index} className="flex items-start gap-3 p-3 rounded-lg bg-matrix-dark-gray border border-matrix-green/30">
                        <TrendingUp className="w-5 h-5 text-matrix-green flex-shrink-0 mt-0.5" />
                        <p className="text-matrix-green">{suggestion}</p>
                      </div>
                    ))}
                  </CardContent>
                </Card>
              </div>
            </div>
          )}

          {isAnalyzing && (
            <Card className="content-card">
              <CardContent className="py-12 text-center">
                <div className="animate-spin w-8 h-8 border-2 border-matrix-green border-t-transparent rounded-full mx-auto mb-4"></div>
                <p className="text-matrix-green">Analyzing your content...</p>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </>
  );
};

export default ContentAnalysis;
