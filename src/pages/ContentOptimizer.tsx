
import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import Header from "@/components/Header";
import { Copy, FileText, TrendingUp, Search, Bot, Lightbulb } from "lucide-react";
import { toast } from "sonner";

interface QAItem {
  question: string;
  answer: string;
}

interface AnalysisResults {
  keywordDensity: number;
  readabilityScore: number;
  wordCount: number;
  sentences: number;
  keywordCount: number;
  avgWordsPerSentence: number;
}

const ContentOptimizer = () => {
  const [targetKeyword, setTargetKeyword] = useState("");
  const [content, setContent] = useState("");
  const [analysisResults, setAnalysisResults] = useState<AnalysisResults | null>(null);
  const [qaItems, setQaItems] = useState<QAItem[]>([]);
  const [schemaMarkup, setSchemaMarkup] = useState("");
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  const loadSample = () => {
    setTargetKeyword("digital marketing");
    setContent(`Digital Frontier is a leading digital marketing agency in Memphis. We specialize in comprehensive digital strategies that drive results. Our team combines innovative approaches with data-driven insights to help businesses thrive online.

Our services include SEO optimization, web design, and brand development. We work with clients across various industries to create customized solutions. Each project is tailored to meet specific business goals and target audience needs.

Digital marketing continues to evolve rapidly. New technologies and platforms emerge regularly. Businesses must adapt to stay competitive. That's why we focus on cutting-edge strategies and continuous learning.`);
  };

  const estimateSyllables = (text: string): number => {
    return text.toLowerCase().replace(/[^a-z]/g, '').replace(/[aeiou]{2,}/g, 'a').match(/[aeiou]/g)?.length || 0;
  };

  const getReadabilityLevel = (score: number): string => {
    if (score >= 90) return '(Very Easy)';
    if (score >= 80) return '(Easy)';
    if (score >= 70) return '(Fairly Easy)';
    if (score >= 60) return '(Standard)';
    if (score >= 50) return '(Fairly Difficult)';
    if (score >= 30) return '(Difficult)';
    return '(Very Difficult)';
  };

  const generateQASuggestions = (content: string, keyword: string): QAItem[] => {
    const sentences = content.split(/[.!?]+/).filter(s => s.trim());
    const questions: QAItem[] = [];

    // Add strategic questions
    questions.push({
      question: `What is ${keyword}?`,
      answer: `${keyword.charAt(0).toUpperCase() + keyword.slice(1)} encompasses the strategies and techniques used to promote products or services online. It includes various channels and methods to reach and engage target audiences.`
    });

    questions.push({
      question: `Why is ${keyword} important for businesses?`,
      answer: `${keyword.charAt(0).toUpperCase() + keyword.slice(1)} is crucial for businesses because it enables them to reach their target audience where they spend most of their time - online. It provides measurable results and cost-effective solutions.`
    });

    questions.push({
      question: `How can ${keyword} help improve business results?`,
      answer: `Effective ${keyword} strategies can increase brand visibility, generate qualified leads, improve customer engagement, and provide measurable ROI through data-driven campaigns.`
    });

    return questions;
  };

  const generateSchemaMarkup = (qaItems: QAItem[]) => {
    const schema = {
      "@context": "https://schema.org",
      "@type": "FAQPage",
      "mainEntity": qaItems.map(qa => ({
        "@type": "Question",
        "name": qa.question,
        "acceptedAnswer": {
          "@type": "Answer",
          "text": qa.answer
        }
      }))
    };

    return JSON.stringify(schema, null, 2);
  };

  const analyzeContent = () => {
    if (!content || !targetKeyword) {
      toast.error("Please enter both content and keyword");
      return;
    }

    setIsAnalyzing(true);

    // Simulate analysis delay
    setTimeout(() => {
      const words = content.split(/\s+/).length;
      const sentences = content.split(/[.!?]+/).filter(s => s.trim()).length;
      const keywordRegex = new RegExp(targetKeyword, 'gi');
      const keywordMatches = content.match(keywordRegex) || [];
      const keywordCount = keywordMatches.length;
      const keywordDensity = ((keywordCount / words) * 100);
      const avgWordsPerSentence = Math.round(words / sentences);

      // Calculate readability score (simplified Flesch Reading Ease)
      const syllables = estimateSyllables(content);
      const readabilityScore = Math.round(206.835 - 1.015 * (words/sentences) - 84.6 * (syllables/words));

      const results: AnalysisResults = {
        keywordDensity: parseFloat(keywordDensity.toFixed(1)),
        readabilityScore,
        wordCount: words,
        sentences,
        keywordCount,
        avgWordsPerSentence
      };

      setAnalysisResults(results);

      // Generate Q&A suggestions
      const qaItems = generateQASuggestions(content, targetKeyword);
      setQaItems(qaItems);

      // Generate schema markup
      const schema = generateSchemaMarkup(qaItems);
      setSchemaMarkup(schema);

      setIsAnalyzing(false);
      toast.success("Content analysis completed!");
    }, 1500);
  };

  const copySchema = () => {
    navigator.clipboard.writeText(schemaMarkup);
    toast.success("Schema copied to clipboard!");
  };

  const getScoreColor = (score: number, type: 'keyword' | 'readability') => {
    if (type === 'keyword') {
      if (score < 1) return 'text-red-500';
      if (score > 3) return 'text-yellow-500';
      return 'text-green-500';
    } else {
      if (score < 30) return 'text-red-500';
      if (score < 60) return 'text-yellow-500';
      return 'text-green-500';
    }
  };

  return (
    <>
      <Header />
      <div className="container mx-auto py-8">
        <div className="max-w-7xl mx-auto space-y-6">
          {/* Header */}
          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold text-[#39FF14] mb-4" style={{textShadow: '0 0 5px #39FF14, 0 0 10px #39FF14'}}>
              Digital Frontier AEO & SEO Optimizer
            </h1>
            <p className="text-lg text-gray-300">Optimize Your Content for AI Answer Engines and Search</p>
          </div>

          {/* Main Content Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
            {/* Input Section */}
            <Card className="bg-[#1E2329] border-[#39FF14]/30">
              <CardHeader>
                <CardTitle className="text-[#39FF14] flex items-center gap-2">
                  <FileText className="w-5 h-5" />
                  Content Input
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-2 text-[#39FF14]">Target Keyword:</label>
                  <Input
                    value={targetKeyword}
                    onChange={(e) => setTargetKeyword(e.target.value)}
                    placeholder="Enter your primary keyword"
                    className="bg-[#0D1117] border-[#39FF14]/30 text-white"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2 text-[#39FF14]">Your Content:</label>
                  <Textarea
                    value={content}
                    onChange={(e) => setContent(e.target.value)}
                    placeholder="Paste your content here..."
                    className="min-h-48 bg-[#0D1117] border-[#39FF14]/30 text-white"
                  />
                </div>
                <div className="flex gap-4">
                  <Button 
                    onClick={analyzeContent}
                    disabled={isAnalyzing || !content || !targetKeyword}
                    className="bg-[#39FF14] text-[#0D1117] font-bold hover:bg-[#39FF14]/80"
                    style={{boxShadow: '0 0 5px #39FF14, 0 0 10px #39FF14'}}
                  >
                    {isAnalyzing ? 'Analyzing...' : 'Analyze Content'}
                  </Button>
                  <Button 
                    onClick={loadSample}
                    variant="outline"
                    className="border-[#39FF14]/30 text-[#39FF14] hover:bg-[#39FF14]/10"
                  >
                    Load Sample
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Analysis Results */}
            <Card className="bg-[#1E2329] border-[#39FF14]/30">
              <CardHeader>
                <CardTitle className="text-[#39FF14] flex items-center gap-2">
                  <TrendingUp className="w-5 h-5" />
                  Analysis Results
                </CardTitle>
              </CardHeader>
              <CardContent>
                {!analysisResults ? (
                  <div className="text-center py-12 text-gray-400">
                    Enter your content and click "Analyze Content" to begin
                  </div>
                ) : (
                  <div className="space-y-4">
                    {/* Keyword Density */}
                    <div className="p-4 bg-[#0D1117] rounded-lg border-l-4 border-[#39FF14]">
                      <div className="flex justify-between items-center mb-2">
                        <span className="font-bold text-white">Keyword Density</span>
                        <span className={`font-bold text-lg ${getScoreColor(analysisResults.keywordDensity, 'keyword')}`}>
                          {analysisResults.keywordDensity}%
                        </span>
                      </div>
                      <Progress value={Math.min(analysisResults.keywordDensity * 20, 100)} className="h-2 mb-2" />
                      <p className="text-sm text-gray-400">Target: 1-3%</p>
                    </div>

                    {/* Readability Score */}
                    <div className="p-4 bg-[#0D1117] rounded-lg border-l-4 border-[#39FF14]">
                      <div className="flex justify-between items-center mb-2">
                        <span className="font-bold text-white">Readability Score</span>
                        <span className={`font-bold text-lg ${getScoreColor(analysisResults.readabilityScore, 'readability')}`}>
                          {analysisResults.readabilityScore}/100
                        </span>
                      </div>
                      <Progress value={analysisResults.readabilityScore} className="h-2 mb-2" />
                      <p className="text-sm text-gray-400">
                        {getReadabilityLevel(analysisResults.readabilityScore)} • Avg words/sentence: {analysisResults.avgWordsPerSentence}
                      </p>
                    </div>

                    {/* Content Stats */}
                    <div className="p-4 bg-[#0D1117] rounded-lg border-l-4 border-[#39FF14]">
                      <h4 className="font-bold text-white mb-2">Content Stats</h4>
                      <ul className="space-y-1 text-sm text-gray-300">
                        <li>→ Word count: {analysisResults.wordCount}</li>
                        <li>→ Sentences: {analysisResults.sentences}</li>
                        <li>→ Keyword appearances: {analysisResults.keywordCount}</li>
                      </ul>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Optimization Tabs */}
          {analysisResults && (
            <Card className="bg-[#1E2329] border-[#39FF14]/30">
              <CardHeader>
                <CardTitle className="text-[#39FF14]">Optimization Tools</CardTitle>
              </CardHeader>
              <CardContent>
                <Tabs defaultValue="qa" className="w-full">
                  <TabsList className="grid w-full grid-cols-5 bg-[#0D1117]">
                    <TabsTrigger value="qa" className="text-[#39FF14] data-[state=active]:bg-[#39FF14] data-[state=active]:text-[#0D1117]">
                      Q&A Format
                    </TabsTrigger>
                    <TabsTrigger value="keywords" className="text-[#39FF14] data-[state=active]:bg-[#39FF14] data-[state=active]:text-[#0D1117]">
                      Keywords
                    </TabsTrigger>
                    <TabsTrigger value="schema" className="text-[#39FF14] data-[state=active]:bg-[#39FF14] data-[state=active]:text-[#0D1117]">
                      Schema
                    </TabsTrigger>
                    <TabsTrigger value="readability" className="text-[#39FF14] data-[state=active]:bg-[#39FF14] data-[state=active]:text-[#0D1117]">
                      Readability
                    </TabsTrigger>
                    <TabsTrigger value="context" className="text-[#39FF14] data-[state=active]:bg-[#39FF14] data-[state=active]:text-[#0D1117]">
                      Context
                    </TabsTrigger>
                  </TabsList>

                  <TabsContent value="qa" className="space-y-4">
                    <h3 className="text-xl font-bold text-[#39FF14] mb-4">Question & Answer Format</h3>
                    <div className="space-y-4">
                      {qaItems.map((qa, index) => (
                        <div key={index} className="p-4 bg-[#0D1117] rounded-lg border border-[#39FF14]/30">
                          <div className="font-bold text-[#39FF14] mb-2">Q{index + 1}: {qa.question}</div>
                          <div className="text-gray-300">A: {qa.answer}</div>
                        </div>
                      ))}
                    </div>
                  </TabsContent>

                  <TabsContent value="keywords" className="space-y-4">
                    <h3 className="text-xl font-bold text-[#39FF14] mb-4">Keyword Density Analysis</h3>
                    <div className="space-y-4">
                      <div className="p-4 bg-[#0D1117] rounded-lg border border-[#39FF14]/30">
                        <h4 className="font-bold text-white mb-3">Current Analysis</h4>
                        <ul className="space-y-2 text-gray-300">
                          <li>→ Keyword: <span className="bg-yellow-200 text-black px-2 py-1 rounded">{targetKeyword}</span></li>
                          <li>→ Current appearances: {analysisResults.keywordCount}</li>
                          <li>→ Current density: {analysisResults.keywordDensity}%</li>
                          <li>→ Recommended appearances: {Math.round(analysisResults.wordCount * 0.02)} (2% density)</li>
                        </ul>
                      </div>
                      
                      {analysisResults.keywordCount < Math.round(analysisResults.wordCount * 0.02) && (
                        <div className="p-4 bg-[#0D1117] rounded-lg border border-[#39FF14]/30">
                          <h4 className="font-bold text-white mb-3">Suggestions to Improve Keyword Density</h4>
                          <ul className="space-y-2 text-gray-300">
                            <li>→ Add {Math.round(analysisResults.wordCount * 0.02) - analysisResults.keywordCount} more instances of "{targetKeyword}"</li>
                            <li>→ Include keyword variations like "{targetKeyword} services" or "{targetKeyword} solutions"</li>
                            <li>→ Use the keyword in headings and subheadings</li>
                            <li>→ Include the keyword in the first and last paragraphs</li>
                            <li>→ Add the keyword to image alt texts</li>
                          </ul>
                        </div>
                      )}
                    </div>
                  </TabsContent>

                  <TabsContent value="schema" className="space-y-4">
                    <div className="flex justify-between items-center">
                      <h3 className="text-xl font-bold text-[#39FF14]">FAQ Schema Markup</h3>
                      <Button
                        onClick={copySchema}
                        size="sm"
                        className="bg-blue-600 hover:bg-blue-700"
                      >
                        <Copy className="w-4 h-4 mr-2" />
                        Copy Schema
                      </Button>
                    </div>
                    
                    <div className="bg-[#0D1117] p-4 rounded-lg border border-[#39FF14]/30">
                      <pre className="text-sm text-gray-300 overflow-x-auto">
                        <code>{schemaMarkup}</code>
                      </pre>
                    </div>

                    <div className="p-4 bg-[#0D1117] rounded-lg border border-[#39FF14]/30">
                      <h4 className="font-bold text-white mb-3">Implementation Instructions</h4>
                      <ul className="space-y-2 text-gray-300">
                        <li>→ Add this schema to your page's &lt;head&gt; section</li>
                        <li>→ Wrap it in &lt;script type="application/ld+json"&gt; tags</li>
                        <li>→ Test with Google's Rich Results Test tool</li>
                        <li>→ Monitor performance in Search Console</li>
                      </ul>
                    </div>
                  </TabsContent>

                  <TabsContent value="readability" className="space-y-4">
                    <h3 className="text-xl font-bold text-[#39FF14] mb-4">Readability Analysis</h3>
                    
                    <div className="p-4 bg-[#0D1117] rounded-lg border border-[#39FF14]/30">
                      <h4 className="font-bold text-white mb-3">Readability Metrics</h4>
                      <ul className="space-y-2 text-gray-300">
                        <li>→ Flesch Reading Ease: {analysisResults.readabilityScore}/100 {getReadabilityLevel(analysisResults.readabilityScore)}</li>
                        <li>→ Average words per sentence: {analysisResults.avgWordsPerSentence}</li>
                        <li>→ Total sentences: {analysisResults.sentences}</li>
                        <li>→ Total words: {analysisResults.wordCount}</li>
                      </ul>
                    </div>

                    <div className="p-4 bg-[#0D1117] rounded-lg border border-[#39FF14]/30">
                      <h4 className="font-bold text-white mb-3">Improvement Suggestions</h4>
                      <ul className="space-y-2 text-gray-300">
                        <li>→ Break long sentences into shorter ones (aim for 15-20 words)</li>
                        <li>→ Use bullet points or numbered lists for complex information</li>
                        <li>→ Replace complex words with simpler alternatives</li>
                        <li>→ Add subheadings to break up long text blocks</li>
                        <li>→ Use active voice instead of passive voice</li>
                      </ul>
                    </div>
                  </TabsContent>

                  <TabsContent value="context" className="space-y-4">
                    <h3 className="text-xl font-bold text-[#39FF14] mb-4">Context Enhancement Suggestions</h3>
                    
                    <div className="p-4 bg-[#0D1117] rounded-lg border border-[#39FF14]/30">
                      <h4 className="font-bold text-white mb-3">Suggested Additions</h4>
                      <ul className="space-y-2 text-gray-300">
                        <li>→ Add case studies or success stories</li>
                        <li>→ Include specific metrics and KPIs</li>
                        <li>→ Mention tools and technologies used</li>
                        <li>→ Add industry-specific terminology</li>
                        <li>→ Include geographical context (Memphis, TN)</li>
                        <li>→ Reference current trends in {targetKeyword}</li>
                      </ul>
                    </div>

                    {targetKeyword.toLowerCase().includes('digital') || targetKeyword.toLowerCase().includes('marketing') ? (
                      <div className="p-4 bg-[#0D1117] rounded-lg border border-[#39FF14]/30">
                        <h4 className="font-bold text-white mb-3">Digital Marketing Specific Context</h4>
                        <ul className="space-y-2 text-gray-300">
                          <li>→ Mention specific platforms (Google Ads, Facebook, LinkedIn)</li>
                          <li>→ Include conversion rate statistics</li>
                          <li>→ Reference ROI improvements</li>
                          <li>→ Add information about AI and automation tools</li>
                          <li>→ Include mobile optimization statistics</li>
                        </ul>
                      </div>
                    ) : null}
                  </TabsContent>
                </Tabs>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </>
  );
};

export default ContentOptimizer;
