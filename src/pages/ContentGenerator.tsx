import { useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from "@/components/ui/select";
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardFooter, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Loader2, ArrowRight, Download, Copy, Check } from "lucide-react";
import { Separator } from "@/components/ui/separator";
import { toast } from "sonner";
import { 
  ContentGenerationRequest, 
  ContentBlock,
  generateContent 
} from "@/services/contentService";

const ContentGenerator = () => {
  const { user } = useAuth();
  const [topic, setTopic] = useState("");
  const [keywords, setKeywords] = useState("");
  const [contentType, setContentType] = useState<'blog' | 'article' | 'faq'>('blog');
  const [toneStyle, setToneStyle] = useState("professional");
  const [loading, setLoading] = useState(false);
  const [generatedContent, setGeneratedContent] = useState<ContentBlock | null>(null);
  const [activeTab, setActiveTab] = useState("preview");
  const [copied, setCopied] = useState(false);

  // New state for displaying schema warnings
  const [schemaIssues, setSchemaIssues] = useState<string[] | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!topic.trim()) {
      toast.error("Please enter a topic");
      return;
    }
    
    setLoading(true);
    
    try {
      const request: ContentGenerationRequest = {
        topic,
        keywords: keywords.split(',').map(k => k.trim()).filter(k => k),
        contentType,
        toneStyle,
      };
      
      const content = await generateContent(request);
      
      if (content) {
        setGeneratedContent(content);
        setActiveTab("preview");
        toast.success("Content generated successfully!");
        
        // Set schema issues if any
        if (content.metadata?.schemaWarnings || content.metadata?.schemaRecommendations) {
          setSchemaIssues([
            ...(content.metadata?.schemaWarnings || []),
            ...(content.metadata?.schemaRecommendations || [])
          ]);
        } else {
          setSchemaIssues(null);
        }
      }
    } catch (error) {
      console.error("Error generating content:", error);
      toast.error("Failed to generate content. Please try again.");
    } finally {
      setLoading(false);
    }
  };
  
  const copyToClipboard = (text: string, type: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    toast.success(`${type} copied to clipboard!`);
    setTimeout(() => setCopied(false), 2000);
  };
  
  const downloadHTML = () => {
    if (!generatedContent) return;
    
    const blob = new Blob([generatedContent.content], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${generatedContent.title.replace(/\s+/g, '-').toLowerCase()}.html`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    
    toast.success("HTML file downloaded successfully!");
  };
  
  const downloadJSON = () => {
    if (!generatedContent) return;
    
    const jsonData = JSON.stringify({
      title: generatedContent.title,
      content: generatedContent.content,
      metadata: generatedContent.metadata
    }, null, 2);
    
    const blob = new Blob([jsonData], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${generatedContent.title.replace(/\s+/g, '-').toLowerCase()}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    
    toast.success("JSON file downloaded successfully!");
  };

  return (
    <div className="container max-w-7xl mx-auto py-8">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold">AEO Content Generator</h1>
          <p className="text-muted-foreground">Generate SEO-optimized content with answer-first approach</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Input Form */}
        <Card className="md:col-span-1">
          <CardHeader>
            <CardTitle>Content Details</CardTitle>
            <CardDescription>
              Enter your topic and keywords to generate AEO-optimized content
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="topic">Main Topic</Label>
                <Input 
                  id="topic" 
                  placeholder="e.g., Content Marketing Strategies" 
                  value={topic}
                  onChange={(e) => setTopic(e.target.value)}
                  required
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="keywords">Keywords (comma separated)</Label>
                <Textarea 
                  id="keywords" 
                  placeholder="e.g., SEO, content strategy, digital marketing" 
                  value={keywords}
                  onChange={(e) => setKeywords(e.target.value)}
                  rows={3}
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="contentType">Content Type</Label>
                <Select 
                  value={contentType} 
                  onValueChange={(value) => setContentType(value as 'blog' | 'article' | 'faq')}
                >
                  <SelectTrigger id="contentType">
                    <SelectValue placeholder="Select content type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="blog">Blog Post</SelectItem>
                    <SelectItem value="article">Article</SelectItem>
                    <SelectItem value="faq">FAQ Page</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="toneStyle">Tone Style</Label>
                <Select 
                  value={toneStyle} 
                  onValueChange={(value) => setToneStyle(value)}
                >
                  <SelectTrigger id="toneStyle">
                    <SelectValue placeholder="Select tone style" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="professional">Professional</SelectItem>
                    <SelectItem value="conversational">Conversational</SelectItem>
                    <SelectItem value="technical">Technical</SelectItem>
                    <SelectItem value="edgy">Edgy</SelectItem>
                    <SelectItem value="narrative">Narrative</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <Button 
                type="submit" 
                className="w-full" 
                disabled={loading}
              >
                {loading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Generating...
                  </>
                ) : (
                  <>
                    Generate Content
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </>
                )}
              </Button>
            </form>
          </CardContent>
        </Card>

        {/* Output Section with updated hero answer display */}
        <Card className="md:col-span-2">
          <CardHeader>
            <CardTitle>
              {generatedContent ? generatedContent.title : "Generated Content"}
            </CardTitle>
            <CardDescription>
              {generatedContent 
                ? "Preview your AEO-optimized content and metadata" 
                : "Content will appear here after generation"}
            </CardDescription>
          </CardHeader>
        
        {generatedContent ? (
          <>
            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
              <div className="px-6">
                <TabsList className="grid grid-cols-4 w-full">
                  <TabsTrigger value="preview">Content Preview</TabsTrigger>
                  <TabsTrigger value="metadata">SEO Metadata</TabsTrigger>
                  <TabsTrigger value="schema">JSON-LD Schema</TabsTrigger>
                  <TabsTrigger value="export">Export</TabsTrigger>
                </TabsList>
              </div>
              
              <TabsContent value="preview" className="p-0">
                <CardContent className="pt-6">
                  {/* Hero Answer Section */}
                  {generatedContent.heroAnswer && (
                    <div className="mb-6">
                      <h3 className="font-medium text-lg mb-2">Hero Answer</h3>
                      <div className="bg-primary/10 p-4 rounded-lg border border-primary/20">
                        <p className="italic">{generatedContent.heroAnswer}</p>
                      </div>
                    </div>
                  )}
                  
                  <div 
                    className="prose prose-slate max-w-none" 
                    dangerouslySetInnerHTML={{ __html: generatedContent.content }} 
                  />
                </CardContent>
                <CardFooter className="flex justify-end">
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => copyToClipboard(generatedContent.content, "HTML content")}
                  >
                    {copied ? (
                      <>
                        <Check className="mr-2 h-4 w-4" />
                        Copied!
                      </>
                    ) : (
                      <>
                        <Copy className="mr-2 h-4 w-4" />
                        Copy HTML
                      </>
                    )}
                  </Button>
                </CardFooter>
              </TabsContent>
              
              <TabsContent value="metadata" className="p-0">
                <CardContent className="pt-6">
                  <div className="space-y-6">
                    <div className="space-y-3">
                      <h3 className="text-lg font-medium">SEO Metadata</h3>
                      <div className="space-y-2">
                        <div className="grid grid-cols-1 md:grid-cols-4 gap-2">
                          <Label className="md:col-span-1">Title</Label>
                          <div className="md:col-span-3">
                            <code className="relative rounded bg-muted px-[0.3rem] py-[0.2rem] font-mono text-sm">
                              {generatedContent.metadata?.seoTitle}
                            </code>
                          </div>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-4 gap-2">
                          <Label className="md:col-span-1">Description</Label>
                          <div className="md:col-span-3">
                            <code className="relative rounded bg-muted px-[0.3rem] py-[0.2rem] font-mono text-sm">
                              {generatedContent.metadata?.metaDescription}
                            </code>
                          </div>
                        </div>
                      </div>
                    </div>
                    
                    <Separator />
                    
                    <div className="space-y-3">
                      <h3 className="text-lg font-medium">Open Graph</h3>
                      <div className="space-y-2">
                        <div className="grid grid-cols-1 md:grid-cols-4 gap-2">
                          <Label className="md:col-span-1">OG Title</Label>
                          <div className="md:col-span-3">
                            <code className="relative rounded bg-muted px-[0.3rem] py-[0.2rem] font-mono text-sm">
                              {generatedContent.metadata?.ogTitle}
                            </code>
                          </div>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-4 gap-2">
                          <Label className="md:col-span-1">OG Description</Label>
                          <div className="md:col-span-3">
                            <code className="relative rounded bg-muted px-[0.3rem] py-[0.2rem] font-mono text-sm">
                              {generatedContent.metadata?.ogDescription}
                            </code>
                          </div>
                        </div>
                      </div>
                    </div>
                    
                    <Separator />
                    
                    <div className="space-y-3">
                      <h3 className="text-lg font-medium">Twitter</h3>
                      <div className="space-y-2">
                        <div className="grid grid-cols-1 md:grid-cols-4 gap-2">
                          <Label className="md:col-span-1">Twitter Title</Label>
                          <div className="md:col-span-3">
                            <code className="relative rounded bg-muted px-[0.3rem] py-[0.2rem] font-mono text-sm">
                              {generatedContent.metadata?.twitterTitle}
                            </code>
                          </div>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-4 gap-2">
                          <Label className="md:col-span-1">Twitter Description</Label>
                          <div className="md:col-span-3">
                            <code className="relative rounded bg-muted px-[0.3rem] py-[0.2rem] font-mono text-sm">
                              {generatedContent.metadata?.twitterDescription}
                            </code>
                          </div>
                        </div>
                      </div>
                    </div>
                    
                    <Separator />
                    
                    <div className="space-y-3">
                      <h3 className="text-lg font-medium">JSON-LD Schema</h3>
                      <pre className="bg-muted p-4 rounded-md overflow-x-auto text-xs">
                        {JSON.stringify(generatedContent.metadata?.jsonLdSchema, null, 2)}
                      </pre>
                    </div>
                    
                    <Separator />
                    
                    <div className="space-y-3">
                      <h3 className="text-lg font-medium">CTA Variants</h3>
                      <div className="space-y-2">
                        {generatedContent.metadata?.ctaVariants?.map((cta, index) => (
                          <div key={index} className="p-3 bg-muted rounded-md">
                            {cta}
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </TabsContent>
              
              <TabsContent value="schema" className="p-0">
                <CardContent className="pt-6">
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <h3 className="text-lg font-medium">JSON-LD Schema</h3>
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => copyToClipboard(JSON.stringify(generatedContent.metadata?.jsonLdSchema, null, 2), "JSON-LD Schema")}
                      >
                        {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                        <span className="ml-2">{copied ? "Copied!" : "Copy"}</span>
                      </Button>
                    </div>
                    
                    {/* Schema Issues */}
                    {schemaIssues && schemaIssues.length > 0 && (
                      <div className="p-3 bg-yellow-50 dark:bg-yellow-900/30 border border-yellow-200 dark:border-yellow-700 rounded-md mb-4">
                        <h4 className="font-medium text-yellow-800 dark:text-yellow-300 mb-2">Schema Recommendations</h4>
                        <ul className="list-disc pl-5 text-sm text-yellow-700 dark:text-yellow-300">
                          {schemaIssues.map((issue, i) => (
                            <li key={i}>{issue}</li>
                          ))}
                        </ul>
                      </div>
                    )}
                    
                    <pre className="bg-muted p-4 rounded-md overflow-x-auto text-xs max-h-[400px]">
                      {JSON.stringify(generatedContent.metadata?.jsonLdSchema, null, 2)}
                    </pre>
                  </div>
                </CardContent>
              </TabsContent>
              
              <TabsContent value="export" className="p-0">
                <CardContent className="pt-6">
                  <div className="space-y-6">
                    <div>
                      <h3 className="text-lg font-medium mb-2">Export Options</h3>
                      <p className="text-muted-foreground text-sm mb-4">
                        Download or copy your content in different formats
                      </p>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <Button 
                          variant="outline" 
                          className="w-full justify-start gap-3"
                          onClick={downloadHTML}
                        >
                          <Download className="h-5 w-5" />
                          <div className="text-left">
                            <p className="font-medium">HTML</p>
                            <p className="text-xs text-muted-foreground">Download as HTML file</p>
                          </div>
                        </Button>
                        
                        <Button 
                          variant="outline" 
                          className="w-full justify-start gap-3"
                          onClick={downloadJSON}
                        >
                          <Download className="h-5 w-5" />
                          <div className="text-left">
                            <p className="font-medium">JSON</p>
                            <p className="text-xs text-muted-foreground">Download as JSON file</p>
                          </div>
                        </Button>
                        
                        <Button 
                          variant="outline" 
                          className="w-full justify-start gap-3"
                          onClick={() => copyToClipboard(generatedContent.content, "HTML content")}
                        >
                          <Copy className="h-5 w-5" />
                          <div className="text-left">
                            <p className="font-medium">Copy HTML</p>
                            <p className="text-xs text-muted-foreground">Copy HTML to clipboard</p>
                          </div>
                        </Button>
                        
                        <Button 
                          variant="outline" 
                          className="w-full justify-start gap-3"
                          onClick={() => copyToClipboard(JSON.stringify(generatedContent.metadata?.jsonLdSchema, null, 2), "JSON-LD Schema")}
                        >
                          <Copy className="h-5 w-5" />
                          <div className="text-left">
                            <p className="font-medium">Copy JSON-LD</p>
                            <p className="text-xs text-muted-foreground">Copy schema to clipboard</p>
                          </div>
                        </Button>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </TabsContent>
            </Tabs>
          </>
        ) : (
          <CardContent className="min-h-[300px] flex flex-col items-center justify-center text-center p-6">
            <div className="mb-4 rounded-full bg-muted p-6">
              <ArrowRight className="h-10 w-10 text-muted-foreground" />
            </div>
            <h3 className="text-xl font-medium mb-2">Generate Your First Content</h3>
            <p className="text-muted-foreground max-w-md">
              Fill out the form on the left and click "Generate Content" to create 
              SEO-optimized content with an answer-first approach.
            </p>
          </CardContent>
        )}
        </Card>
      </div>
    </div>
  );
};

export default ContentGenerator;
