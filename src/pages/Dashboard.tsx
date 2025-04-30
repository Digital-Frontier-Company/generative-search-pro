
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardFooter, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card";
import {
  PlusCircle,
  RefreshCw,
  History,
  Download,
  Copy,
  Code,
  FileText,
  Loader2,
  CheckCircle,
  ThumbsUp,
  ThumbsDown,
  Clock
} from "lucide-react";
import Header from "@/components/Header";
import { toast } from "sonner";

const Dashboard = () => {
  const [isGenerating, setIsGenerating] = useState(false);
  const [keyword, setKeyword] = useState("");
  const [generatedContent, setGeneratedContent] = useState<any>(null);
  const [loadingProgress, setLoadingProgress] = useState(0);
  const [loadingPhase, setLoadingPhase] = useState("");
  
  // Simulates the progress of generation
  const simulateGeneration = () => {
    setIsGenerating(true);
    setGeneratedContent(null);
    setLoadingProgress(0);
    setLoadingPhase("Analyzing keyword...");
    
    let progress = 0;
    const phases = [
      "Analyzing keyword...",
      "Generating hero answer...",
      "Creating meta content...",
      "Building FAQ section...",
      "Generating schema markup...",
      "Finalizing content..."
    ];
    
    const interval = setInterval(() => {
      progress += 5;
      setLoadingProgress(progress);
      
      if (progress >= 100) {
        clearInterval(interval);
        setIsGenerating(false);
        setGeneratedContent({
          keyword: keyword,
          heroAnswer: "A coffee grinder is an essential tool for any coffee enthusiast who wants to enjoy the freshest, most flavorful brew possible. The best coffee grinders for home use combine durability, consistency, and ease of use. The top considerations when choosing a home coffee grinder include grind consistency, burr vs. blade design, noise level, capacity, and price point. For most home users, a burr grinder offers superior results by crushing beans between two surfaces for a more uniform grind size, which leads to better extraction and flavor.",
          metaTitle: "The 7 Best Coffee Grinders for Home Use in 2023",
          metaDescription: "Find the perfect coffee grinder for your home brewing needs. Our expert guide covers the top 7 coffee grinders for every budget, brewing method, and experience level.",
          faqs: [
            {
              question: "What's the difference between burr and blade coffee grinders?",
              answer: "Burr grinders crush coffee beans between two abrasive surfaces (burrs), producing uniform particle sizes for consistent extraction and better flavor. Blade grinders use spinning blades to chop beans into inconsistent sizes, leading to uneven extraction. For quality coffee, burr grinders are generally recommended despite their higher price point."
            },
            {
              question: "How much should I spend on a coffee grinder for home use?",
              answer: "For home use, expect to spend $40-$70 for a decent entry-level manual burr grinder, $100-$200 for a good electric burr grinder, and $200-$500 for a high-quality grinder that will last many years. While blade grinders are available for $20-$30, they produce inconsistent results and aren't recommended for quality coffee."
            },
            {
              question: "Are manual coffee grinders better than electric ones?",
              answer: "Manual coffee grinders aren't necessarily better than electric ones, but they offer different advantages. Manual grinders are typically more affordable, portable, quieter, and don't require electricity. Electric grinders are faster, require less effort, and often have more grind settings. Quality manual grinders can produce grinds as consistent as electric ones, making them a good value option."
            }
          ],
          schemaMarkup: {
            "@context": "https://schema.org",
            "@type": "FAQPage",
            "mainEntity": [
              {
                "@type": "Question",
                "name": "What's the difference between burr and blade coffee grinders?",
                "acceptedAnswer": {
                  "@type": "Answer",
                  "text": "Burr grinders crush coffee beans between two abrasive surfaces (burrs), producing uniform particle sizes for consistent extraction and better flavor. Blade grinders use spinning blades to chop beans into inconsistent sizes, leading to uneven extraction. For quality coffee, burr grinders are generally recommended despite their higher price point."
                }
              },
              {
                "@type": "Question",
                "name": "How much should I spend on a coffee grinder for home use?",
                "acceptedAnswer": {
                  "@type": "Answer",
                  "text": "For home use, expect to spend $40-$70 for a decent entry-level manual burr grinder, $100-$200 for a good electric burr grinder, and $200-$500 for a high-quality grinder that will last many years. While blade grinders are available for $20-$30, they produce inconsistent results and aren't recommended for quality coffee."
                }
              },
              {
                "@type": "Question",
                "name": "Are manual coffee grinders better than electric ones?",
                "acceptedAnswer": {
                  "@type": "Answer",
                  "text": "Manual coffee grinders aren't necessarily better than electric ones, but they offer different advantages. Manual grinders are typically more affordable, portable, quieter, and don't require electricity. Electric grinders are faster, require less effort, and often have more grind settings. Quality manual grinders can produce grinds as consistent as electric ones, making them a good value option."
                }
              }
            ]
          }
        });
        toast.success(`Content generated for "${keyword}"!`);
      } else if (progress % 20 === 0 && progress < 100) {
        // Update phase message
        setLoadingPhase(phases[Math.floor(progress / 20)]);
      }
    }, 200);
  };
  
  const handleGenerate = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!keyword.trim()) {
      toast.error("Please enter a keyword");
      return;
    }
    
    simulateGeneration();
  };
  
  const copyToClipboard = (text: string, type: string) => {
    navigator.clipboard.writeText(text);
    toast.success(`${type} copied to clipboard!`);
  };
  
  const renderGeneratedContent = () => {
    if (!generatedContent) return null;
    
    return (
      <div className="space-y-8 animate-fade-in">
        {/* Header */}
        <div className="flex justify-between items-center">
          <h2 className="text-2xl font-bold">Generated Content</h2>
          <div className="flex items-center gap-2">
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => setGeneratedContent(null)}
            >
              <RefreshCw className="h-4 w-4 mr-2" />
              New Content
            </Button>
          </div>
        </div>
        
        {/* Content Preview Tabs */}
        <Tabs defaultValue="hero">
          <TabsList className="grid grid-cols-3 md:grid-cols-5">
            <TabsTrigger value="hero">Hero Answer</TabsTrigger>
            <TabsTrigger value="meta">Meta Data</TabsTrigger>
            <TabsTrigger value="faq">FAQs</TabsTrigger>
            <TabsTrigger value="schema">Schema</TabsTrigger>
            <TabsTrigger value="export">Export</TabsTrigger>
          </TabsList>
          
          <TabsContent value="hero" className="pt-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Hero Answer</CardTitle>
                <CardDescription>
                  Optimized answer for the search query: "{generatedContent.keyword}"
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="p-4 border rounded-md bg-gray-50">
                  <p>{generatedContent.heroAnswer}</p>
                </div>
              </CardContent>
              <CardFooter className="flex justify-between">
                <div className="flex items-center gap-3">
                  <Button 
                    size="sm" 
                    variant="ghost"
                    onClick={() => {}}
                  >
                    <ThumbsUp className="h-4 w-4 mr-2" />
                    Good
                  </Button>
                  <Button 
                    size="sm" 
                    variant="ghost"
                    onClick={() => {}}
                  >
                    <ThumbsDown className="h-4 w-4 mr-2" />
                    Regenerate
                  </Button>
                </div>
                <Button 
                  size="sm"
                  variant="outline"
                  onClick={() => copyToClipboard(generatedContent.heroAnswer, "Hero answer")}
                >
                  <Copy className="h-4 w-4 mr-2" />
                  Copy
                </Button>
              </CardFooter>
            </Card>
          </TabsContent>
          
          <TabsContent value="meta" className="pt-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Meta Data</CardTitle>
                <CardDescription>
                  SEO-optimized metadata for your content
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <h3 className="text-sm font-medium mb-1">Title Tag</h3>
                    <div className="p-3 border rounded-md bg-gray-50">
                      <p className="text-blue-600 text-lg">{generatedContent.metaTitle}</p>
                    </div>
                  </div>
                  <div>
                    <h3 className="text-sm font-medium mb-1">Meta Description</h3>
                    <div className="p-3 border rounded-md bg-gray-50">
                      <p className="text-gray-600">{generatedContent.metaDescription}</p>
                    </div>
                  </div>
                </div>
              </CardContent>
              <CardFooter className="justify-end">
                <Button 
                  size="sm"
                  variant="outline"
                  onClick={() => copyToClipboard(
                    `<title>${generatedContent.metaTitle}</title>
<meta name="description" content="${generatedContent.metaDescription}">`,
                    "Meta tags"
                  )}
                >
                  <Copy className="h-4 w-4 mr-2" />
                  Copy Meta Tags
                </Button>
              </CardFooter>
            </Card>
          </TabsContent>
          
          <TabsContent value="faq" className="pt-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">FAQ Section</CardTitle>
                <CardDescription>
                  Frequently asked questions about "{generatedContent.keyword}"
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {generatedContent.faqs.map((faq: any, index: number) => (
                    <div key={index} className="border rounded-md overflow-hidden">
                      <div className="bg-gray-50 p-3 font-medium">
                        Q: {faq.question}
                      </div>
                      <div className="p-3 border-t">
                        <p>A: {faq.answer}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
              <CardFooter className="justify-end">
                <Button 
                  size="sm"
                  variant="outline"
                  onClick={() => {
                    const faqHtml = generatedContent.faqs.map((faq: any) => 
                      `<div class="faq-item">
  <h3 class="faq-question">${faq.question}</h3>
  <p class="faq-answer">${faq.answer}</p>
</div>`).join('\n');
                    
                    copyToClipboard(
                      `<div class="faq-section">
  <h2>Frequently Asked Questions</h2>
  ${faqHtml}
</div>`,
                      "FAQ HTML"
                    );
                  }}
                >
                  <Copy className="h-4 w-4 mr-2" />
                  Copy HTML
                </Button>
              </CardFooter>
            </Card>
          </TabsContent>
          
          <TabsContent value="schema" className="pt-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Schema Markup</CardTitle>
                <CardDescription>
                  Structured data for search engines
                </CardDescription>
              </CardHeader>
              <CardContent>
                <pre className="p-4 border rounded-md bg-gray-50 overflow-x-auto text-sm">
                  {JSON.stringify(generatedContent.schemaMarkup, null, 2)}
                </pre>
              </CardContent>
              <CardFooter className="justify-between">
                <div className="flex items-center text-sm text-green-600">
                  <CheckCircle className="h-4 w-4 mr-1" />
                  Valid schema markup
                </div>
                <Button 
                  size="sm"
                  variant="outline"
                  onClick={() => copyToClipboard(
                    `<script type="application/ld+json">
${JSON.stringify(generatedContent.schemaMarkup, null, 2)}
</script>`,
                    "Schema markup"
                  )}
                >
                  <Copy className="h-4 w-4 mr-2" />
                  Copy Schema
                </Button>
              </CardFooter>
            </Card>
          </TabsContent>
          
          <TabsContent value="export" className="pt-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Export Options</CardTitle>
                <CardDescription>
                  Export your content in different formats
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <Button className="w-full flex justify-between items-center" variant="outline">
                    <div className="flex items-center">
                      <FileText className="h-5 w-5 mr-2" />
                      Export as HTML
                    </div>
                    <Download className="h-4 w-4" />
                  </Button>
                  <Button className="w-full flex justify-between items-center" variant="outline">
                    <div className="flex items-center">
                      <Code className="h-5 w-5 mr-2" />
                      Export as JSON
                    </div>
                    <Download className="h-4 w-4" />
                  </Button>
                  <Button className="w-full flex justify-between items-center" variant="outline">
                    <div className="flex items-center">
                      <Copy className="h-5 w-5 mr-2" />
                      Copy Full HTML
                    </div>
                    <Copy className="h-4 w-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    );
  };

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <Header isAuthenticated={true} />
      
      <main className="flex-1 container mx-auto p-4 md:p-6">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Sidebar */}
          <div className="lg:col-span-1 space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Usage Stats</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  <div>
                    <div className="flex justify-between mb-2 text-sm">
                      <span>Content Generations</span>
                      <span className="font-medium">3/5</span>
                    </div>
                    <Progress value={60} className="h-2" />
                    <p className="text-xs text-gray-500 mt-2">2 generations remaining this month</p>
                  </div>
                  
                  <div className="pt-4 border-t">
                    <h3 className="font-medium mb-3">Your Plan</h3>
                    <div className="bg-gray-50 p-3 rounded-md border text-center">
                      <p className="font-medium">Free</p>
                      <p className="text-xs text-gray-500 mt-1">5 generations / month</p>
                      <Button className="mt-3 w-full" size="sm">
                        Upgrade to Premium
                      </Button>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle>Recent Content</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <div className="flex items-center gap-2 p-2 rounded-md hover:bg-gray-50 cursor-pointer group">
                  <History className="h-4 w-4 text-gray-400" />
                  <span className="text-sm group-hover:text-aeo-blue transition-colors">Best coffee makers 2023</span>
                </div>
                <div className="flex items-center gap-2 p-2 rounded-md hover:bg-gray-50 cursor-pointer group">
                  <History className="h-4 w-4 text-gray-400" />
                  <span className="text-sm group-hover:text-aeo-blue transition-colors">How to make sourdough bread</span>
                </div>
                <div className="flex items-center justify-center mt-2">
                  <Button variant="ghost" size="sm" className="text-xs">
                    View All History
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
          
          {/* Main Content */}
          <div className="lg:col-span-3 space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Generate AEO Content</CardTitle>
                <CardDescription>
                  Enter a keyword to generate optimized content for AI answer engines
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleGenerate} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="keyword">Keyword or Topic</Label>
                    <div className="flex space-x-2">
                      <Input
                        id="keyword"
                        placeholder="e.g., best coffee grinder for home"
                        value={keyword}
                        onChange={(e) => setKeyword(e.target.value)}
                        disabled={isGenerating}
                        className="flex-1"
                      />
                      <Button 
                        type="submit" 
                        disabled={isGenerating || !keyword.trim()}
                        className="bg-aeo-blue hover:bg-aeo-blue/90"
                      >
                        {isGenerating ? (
                          <>
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            Generating...
                          </>
                        ) : (
                          <>
                            <PlusCircle className="mr-2 h-4 w-4" />
                            Generate
                          </>
                        )}
                      </Button>
                    </div>
                  </div>
                </form>
              </CardContent>
              {isGenerating && (
                <CardFooter>
                  <div className="w-full space-y-2">
                    <div className="flex items-center justify-between text-sm">
                      <div className="flex items-center">
                        <Clock className="mr-2 h-4 w-4" />
                        <span>{loadingPhase}</span>
                      </div>
                      <span>{loadingProgress}%</span>
                    </div>
                    <Progress value={loadingProgress} className="h-1" />
                  </div>
                </CardFooter>
              )}
            </Card>
            
            {renderGeneratedContent()}
          </div>
        </div>
      </main>
    </div>
  );
};

export default Dashboard;
