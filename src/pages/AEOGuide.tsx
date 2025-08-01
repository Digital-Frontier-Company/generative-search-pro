import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { 
  ArrowLeft, 
  BookOpen, 
  Clock, 
  Star,
  CheckCircle,
  Code,
  Database,
  Settings,
  Target,
  TrendingUp,
  FileText,
  Zap,
  Shield,
  Users,
  DollarSign
} from "lucide-react";
import { useNavigate } from "react-router-dom";

const AEOGuide = () => {
  const navigate = useNavigate();
  const [activeSection, setActiveSection] = useState("overview");

  const sections = [
    { id: "overview", title: "Overview", icon: BookOpen },
    { id: "product-build", title: "Product Build Manual", icon: Code },
    { id: "schema-patch", title: "Schema Patch Feature", icon: Database },
    { id: "citation-checker", title: "SGE Citation Checker", icon: Target },
    { id: "ai-sitemap", title: "AI Sitemap Generator", icon: FileText },
    { id: "code-artifacts", title: "Sample Code Artifacts", icon: Code },
    { id: "compliance", title: "Compliance Setup", icon: Shield },
    { id: "monetization", title: "Monetization & GTM", icon: DollarSign },
    { id: "maintenance", title: "Maintenance Automation", icon: Settings }
  ];

  return (
    <div className="min-h-screen flex flex-col bg-black">
      <Header />
      <main className="flex-1 bg-black">
        <div className="container mx-auto py-8">
          <div className="max-w-7xl mx-auto">
            {/* Header */}
            <div className="mb-8">
              <Button 
                variant="ghost" 
                onClick={() => navigate('/resources')}
                className="text-matrix-green hover:bg-matrix-green/10 mb-4"
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Resources
              </Button>
              
              <div className="flex items-center gap-4 mb-4">
                <Badge className="bg-matrix-green text-black">
                  <TrendingUp className="w-3 h-3 mr-1" />
                  Popular Guide
                </Badge>
                <Badge variant="outline" className="border-matrix-green/30 text-matrix-green">
                  Beginner Friendly
                </Badge>
              </div>
              
              <h1 className="text-4xl font-bold text-matrix-green mb-4">
                AI Search Visibility Playbook – Step-by-Step Implementation Guide
              </h1>
              
              <div className="flex items-center gap-6 text-matrix-green/70">
                <div className="flex items-center gap-1">
                  <Clock className="w-4 h-4" />
                  <span>45 min read</span>
                </div>
                <div className="flex items-center gap-1">
                  <Star className="w-4 h-4 fill-current text-matrix-green" />
                  <span>4.9 rating</span>
                </div>
                <div className="flex items-center gap-1">
                  <Users className="w-4 h-4" />
                  <span>12.5K readers</span>
                </div>
              </div>
              
              <p className="text-matrix-green/80 mt-4 text-lg leading-relaxed">
                This guide provides a comprehensive, actionable plan to build the AI Search Visibility Playbook using no-code tools. 
                It covers everything from configuring your Bubble.io front-end and Xano back-end, to integrating external APIs, 
                to compliance checklists and go-to-market assets.
              </p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
              {/* Navigation Sidebar */}
              <div className="lg:col-span-1">
                <Card className="content-card sticky top-4">
                  <CardHeader>
                    <CardTitle className="text-matrix-green">Table of Contents</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-2">
                    {sections.map((section) => {
                      const Icon = section.icon;
                      return (
                        <button
                          key={section.id}
                          onClick={() => setActiveSection(section.id)}
                          className={`w-full text-left p-3 rounded-lg transition-all flex items-center gap-2 ${
                            activeSection === section.id 
                              ? 'bg-matrix-green/20 text-matrix-green border border-matrix-green/30' 
                              : 'text-matrix-green/70 hover:bg-matrix-green/10 hover:text-matrix-green'
                          }`}
                        >
                          <Icon className="w-4 h-4" />
                          <span className="text-sm">{section.title}</span>
                        </button>
                      );
                    })}
                  </CardContent>
                </Card>
              </div>

              {/* Main Content */}
              <div className="lg:col-span-3">
                <Card className="content-card">
                  <CardContent className="p-8">
                    {activeSection === "overview" && (
                      <div className="space-y-6">
                        <h2 className="text-2xl font-bold text-matrix-green mb-4">Overview</h2>
                        <p className="text-matrix-green/80 leading-relaxed">
                          Follow these steps to implement the playbook's features in a way that a non-technical founder can manage, 
                          while still leveraging powerful AI and automation.
                        </p>
                        
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
                          <Card className="bg-matrix-dark-gray/50 border-matrix-green/30">
                            <CardContent className="p-4 text-center">
                              <Database className="w-8 h-8 text-matrix-green mx-auto mb-2" />
                              <h3 className="font-semibold text-matrix-green">Schema Optimization</h3>
                              <p className="text-sm text-matrix-green/70 mt-1">
                                Identify and fix missing structured data
                              </p>
                            </CardContent>
                          </Card>
                          
                          <Card className="bg-matrix-dark-gray/50 border-matrix-green/30">
                            <CardContent className="p-4 text-center">
                              <Target className="w-8 h-8 text-matrix-green mx-auto mb-2" />
                              <h3 className="font-semibold text-matrix-green">Citation Tracking</h3>
                              <p className="text-sm text-matrix-green/70 mt-1">
                                Monitor AI search result citations
                              </p>
                            </CardContent>
                          </Card>
                          
                          <Card className="bg-matrix-dark-gray/50 border-matrix-green/30">
                            <CardContent className="p-4 text-center">
                              <FileText className="w-8 h-8 text-matrix-green mx-auto mb-2" />
                              <h3 className="font-semibold text-matrix-green">AI Sitemaps</h3>
                              <p className="text-sm text-matrix-green/70 mt-1">
                                Generate specialized AI-readable sitemaps
                              </p>
                            </CardContent>
                          </Card>
                        </div>
                      </div>
                    )}

                    {activeSection === "product-build" && (
                      <div className="space-y-6">
                        <h2 className="text-2xl font-bold text-matrix-green mb-4">1. Product Build Manual</h2>
                        <p className="text-matrix-green/80 leading-relaxed">
                          Each core component of the app is outlined below with instructions for Bubble (front-end pages and workflows), 
                          Xano (back-end logic and database), external tool integrations, and OpenAI prompt templates.
                        </p>
                        
                        <div className="bg-matrix-dark-gray/30 p-6 rounded-lg border border-matrix-green/20">
                          <h3 className="text-xl font-semibold text-matrix-green mb-3">Core Components Overview</h3>
                          <div className="space-y-3">
                            <div className="flex items-center gap-2">
                              <CheckCircle className="w-5 h-5 text-matrix-green" />
                              <span className="text-matrix-green/80">Schema Patch Recommendation Feature</span>
                            </div>
                            <div className="flex items-center gap-2">
                              <CheckCircle className="w-5 h-5 text-matrix-green" />
                              <span className="text-matrix-green/80">SGE Citation Checker Feature</span>
                            </div>
                            <div className="flex items-center gap-2">
                              <CheckCircle className="w-5 h-5 text-matrix-green" />
                              <span className="text-matrix-green/80">AI Sitemap Generator Feature</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    )}

                    {activeSection === "schema-patch" && (
                      <div className="space-y-6">
                        <h2 className="text-2xl font-bold text-matrix-green mb-4">1.1 Schema Patch Recommendation Feature</h2>
                        
                        <div className="bg-matrix-dark-gray/30 p-6 rounded-lg border border-matrix-green/20">
                          <h3 className="text-lg font-semibold text-matrix-green mb-2">Purpose</h3>
                          <p className="text-matrix-green/80">
                            Identify missing or suboptimal structured data on the user's site and suggest JSON-LD schema patches 
                            to improve AI search visibility (so AI summaries attribute content correctly).
                          </p>
                        </div>

                        <div className="space-y-4">
                          <h3 className="text-xl font-semibold text-matrix-green">Bubble.io (Front-End Configuration)</h3>
                          
                          <div className="space-y-4">
                            <div className="bg-matrix-dark-gray/20 p-4 rounded-lg">
                              <h4 className="font-semibold text-matrix-green mb-2">1. Page & UI Setup</h4>
                              <p className="text-matrix-green/80">
                                Create a page in Bubble (e.g. "SchemaPatcher"). Add an input field for the user's website URL 
                                or select from saved sites. Include a dropdown or multiselect for content types (e.g. Blog, Product, FAQ) 
                                if relevant. Add a button "Analyze Schema".
                              </p>
                            </div>

                            <div className="bg-matrix-dark-gray/20 p-4 rounded-lg">
                              <h4 className="font-semibold text-matrix-green mb-2">2. Workflow (Trigger Analysis)</h4>
                              <p className="text-matrix-green/80">
                                Using Bubble's Workflow editor, configure the "Analyze Schema" button to trigger a custom event 
                                or API call. This will call a Xano API endpoint that fetches the site's content or existing schema data.
                              </p>
                            </div>

                            <div className="bg-matrix-dark-gray/20 p-4 rounded-lg">
                              <h4 className="font-semibold text-matrix-green mb-2">3. API Connection (Bubble to Xano)</h4>
                              <p className="text-matrix-green/80">
                                Install the Bubble API Connector plugin (if not using the official Xano plugin). Configure it with 
                                your Xano base URL and endpoints. For example, set up an API call POST /analyzeSchema that sends 
                                the URL and content type to Xano.
                              </p>
                            </div>

                            <div className="bg-matrix-dark-gray/20 p-4 rounded-lg">
                              <h4 className="font-semibold text-matrix-green mb-2">4. Display Results</h4>
                              <p className="text-matrix-green/80">
                                Add a text element or repeating group to show the recommended fixes. This will be populated after 
                                Xano returns data. Use Bubble's state or a "Data" return in the workflow to capture the JSON-LD 
                                suggestion and show it in a code block or formatted text for easy copy-paste.
                              </p>
                            </div>
                          </div>
                        </div>

                        <div className="space-y-4">
                          <h3 className="text-xl font-semibold text-matrix-green">Xano (Back-End Logic)</h3>
                          
                          <div className="space-y-4">
                            <div className="bg-matrix-dark-gray/20 p-4 rounded-lg">
                              <h4 className="font-semibold text-matrix-green mb-2">1. Database Schema</h4>
                              <p className="text-matrix-green/80">
                                In Xano, create tables/collections such as Sites, SchemaAnalysis. The Sites table can store 
                                user's site URL, site content (if needed), and perhaps last analysis date. The SchemaAnalysis 
                                table can store results of analysis: e.g. site_id, issue_identified (text), 
                                jsonld_suggestion (text or JSON object).
                              </p>
                            </div>

                            <div className="bg-matrix-dark-gray/20 p-4 rounded-lg">
                              <h4 className="font-semibold text-matrix-green mb-2">2. Endpoint Configuration</h4>
                              <p className="text-matrix-green/80 mb-3">Create a Xano /analyzeSchema endpoint. This endpoint's function stack will:</p>
                              <ul className="space-y-2 text-matrix-green/70">
                                <li className="flex items-start gap-2">
                                  <span className="text-matrix-green">•</span>
                                  Accept the site URL (and content type) from Bubble
                                </li>
                                <li className="flex items-start gap-2">
                                  <span className="text-matrix-green">•</span>
                                  Fetch the site's HTML content or existing JSON-LD
                                </li>
                                <li className="flex items-start gap-2">
                                  <span className="text-matrix-green">•</span>
                                  Parse HTML to find existing structured data
                                </li>
                                <li className="flex items-start gap-2">
                                  <span className="text-matrix-green">•</span>
                                  Call OpenAI API with analysis prompt
                                </li>
                                <li className="flex items-start gap-2">
                                  <span className="text-matrix-green">•</span>
                                  Return validated JSON-LD suggestions
                                </li>
                              </ul>
                            </div>
                          </div>
                        </div>

                        <div className="bg-yellow-900/20 border border-yellow-600/30 p-4 rounded-lg">
                          <h4 className="font-semibold text-yellow-400 mb-2">OpenAI Prompt Template (Schema Patch)</h4>
                          <div className="bg-black/50 p-4 rounded font-mono text-sm text-matrix-green">
                            <pre>{`You are an SEO assistant that improves website schema markup for better AI search visibility.

The user's webpage HTML is provided below. Analyze the content and existing schema (if any).

Identify one JSON-LD structured data snippet that should be added or fixed to improve
visibility in AI-generated search results (like Google SGE).

Respond ONLY with a JSON-LD code block (no explanations) that merges with existing schema.
Ensure it's valid JSON and uses appropriate schema.org vocabulary.

Page HTML (excerpt):
[HTML content here]`}</pre>
                          </div>
                        </div>
                      </div>
                    )}

                    {activeSection === "citation-checker" && (
                      <div className="space-y-6">
                        <h2 className="text-2xl font-bold text-matrix-green mb-4">1.2 SGE Citation Checker Feature</h2>
                        
                        <div className="bg-matrix-dark-gray/30 p-6 rounded-lg border border-matrix-green/20">
                          <h3 className="text-lg font-semibold text-matrix-green mb-2">Purpose</h3>
                          <p className="text-matrix-green/80">
                            Verify if and how the user's content is being cited in Google's Search Generative Experience (SGE) results 
                            (or other AI search overviews). This feature will check the AI-generated search summary for references 
                            to the user's site, and flag any missing citations or opportunities.
                          </p>
                        </div>

                        <div className="space-y-4">
                          <h3 className="text-xl font-semibold text-matrix-green">Implementation Steps</h3>
                          
                          <div className="space-y-4">
                            <div className="bg-matrix-dark-gray/20 p-4 rounded-lg">
                              <h4 className="font-semibold text-matrix-green mb-2">Bubble.io Configuration</h4>
                              <ul className="space-y-2 text-matrix-green/80">
                                <li>• Create "CitationChecker" page with query input</li>
                                <li>• Add domain input/selection field</li>
                                <li>• Implement "Check AI Results" workflow</li>
                                <li>• Display results with citation status</li>
                              </ul>
                            </div>

                            <div className="bg-matrix-dark-gray/20 p-4 rounded-lg">
                              <h4 className="font-semibold text-matrix-green mb-2">Xano Back-End Logic</h4>
                              <ul className="space-y-2 text-matrix-green/80">
                                <li>• Create Queries and CitationResults tables</li>
                                <li>• Set up /checkCitation endpoint</li>
                                <li>• Integrate SerpApi for SGE results</li>
                                <li>• Implement domain citation verification</li>
                                <li>• Generate AI recommendations when not cited</li>
                              </ul>
                            </div>

                            <div className="bg-matrix-dark-gray/20 p-4 rounded-lg">
                              <h4 className="font-semibold text-matrix-green mb-2">External Tool Integration</h4>
                              <ul className="space-y-2 text-matrix-green/80">
                                <li>• SerpApi for Google SGE results</li>
                                <li>• OpenAI for citation analysis and recommendations</li>
                                <li>• Optional: Zapier for notifications and logging</li>
                              </ul>
                            </div>
                          </div>
                        </div>

                        <div className="bg-blue-900/20 border border-blue-600/30 p-4 rounded-lg">
                          <h4 className="font-semibold text-blue-400 mb-2">Citation Analysis Pseudocode</h4>
                          <div className="bg-black/50 p-4 rounded font-mono text-sm text-matrix-green">
                            <pre>{`# Pseudocode for SGE Citation Verification
query = "best CRM for startups"
user_domain = "example.com"

# Call SerpApi to get SGE result
sge_result = serpapi_search(engine="google_sge", q=query)
ai_answer_text = sge_result["answer"]
citations = sge_result["sources"]

# Check if user's domain is cited
is_cited = any(user_domain in url for url in citations)

if not is_cited:
    # Generate recommendation via OpenAI
    recommendation = openai_complete(analysis_prompt)
else:
    recommendation = "Your site is cited! Keep up the good content."`}</pre>
                          </div>
                        </div>
                      </div>
                    )}

                    {activeSection === "ai-sitemap" && (
                      <div className="space-y-6">
                        <h2 className="text-2xl font-bold text-matrix-green mb-4">1.3 AI Sitemap Generator Feature</h2>
                        
                        <div className="bg-matrix-dark-gray/30 p-6 rounded-lg border border-matrix-green/20">
                          <h3 className="text-lg font-semibold text-matrix-green mb-2">Purpose</h3>
                          <p className="text-matrix-green/80">
                            Create a specialized AI Sitemap (often in JSON format) to help AI crawlers and agents better understand 
                            and navigate the site's content. This could supplement the standard XML sitemap with more semantic info, 
                            potentially improving how AI models consume the site.
                          </p>
                        </div>

                        <div className="space-y-4">
                          <h3 className="text-xl font-semibold text-matrix-green">Implementation Overview</h3>
                          
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="bg-matrix-dark-gray/20 p-4 rounded-lg">
                              <h4 className="font-semibold text-matrix-green mb-2">Front-End Features</h4>
                              <ul className="space-y-2 text-matrix-green/80">
                                <li>• "Generate AI Sitemap" button</li>
                                <li>• Section selection options</li>
                                <li>• Download/copy functionality</li>
                                <li>• Implementation instructions</li>
                              </ul>
                            </div>

                            <div className="bg-matrix-dark-gray/20 p-4 rounded-lg">
                              <h4 className="font-semibold text-matrix-green mb-2">Back-End Processing</h4>
                              <ul className="space-y-2 text-matrix-green/80">
                                <li>• XML sitemap parsing</li>
                                <li>• Page content summarization</li>
                                <li>• JSON structure generation</li>
                                <li>• Storage and retrieval</li>
                              </ul>
                            </div>
                          </div>
                        </div>

                        <div className="bg-green-900/20 border border-green-600/30 p-4 rounded-lg">
                          <h4 className="font-semibold text-green-400 mb-2">Sample AI Sitemap JSON</h4>
                          <div className="bg-black/50 p-4 rounded font-mono text-sm text-matrix-green">
                            <pre>{`{
  "site": "https://example.com",
  "pages": [
    {
      "url": "https://example.com/post/guide-to-crm",
      "title": "Guide to CRM for Startups",
      "summary": "An in-depth guide comparing top CRM software for new businesses.",
      "lastmod": "2025-04-02",
      "keywords": ["CRM", "startups", "software"],
      "author": "Jane Doe"
    }
  ],
  "generatedOn": "2025-04-23T06:10:00Z",
  "aiPolicy": "/ai-policy.json"
}`}</pre>
                          </div>
                        </div>
                      </div>
                    )}

                    {activeSection === "code-artifacts" && (
                      <div className="space-y-6">
                        <h2 className="text-2xl font-bold text-matrix-green mb-4">2. Sample Code Artifacts</h2>
                        
                        <p className="text-matrix-green/80 leading-relaxed">
                          To illustrate the features, below are sample outputs and code snippets that demonstrate 
                          the playbook's functionality.
                        </p>

                        <div className="space-y-6">
                          <div className="bg-matrix-dark-gray/20 p-6 rounded-lg">
                            <h3 className="text-xl font-semibold text-matrix-green mb-4">2.1 Example JSON-LD Schema Patch</h3>
                            <p className="text-matrix-green/80 mb-4">
                              Scenario: The user's blog article is missing an author and publisher in its structured data. 
                              The Schema Patch feature suggests adding an Article schema.
                            </p>
                            
                            <div className="bg-black/50 p-4 rounded font-mono text-sm text-matrix-green">
                              <pre>{`{
  "@context": "https://schema.org",
  "@type": "Article",
  "headline": "Guide to CRM for Startups",
  "author": {
    "@type": "Person",
    "name": "Jane Doe"
  },
  "publisher": {
    "@type": "Organization",
    "name": "Startup Insight Blog",
    "logo": {
      "@type": "ImageObject",
      "url": "https://example.com/logo.png"
    }
  },
  "datePublished": "2025-04-01",
  "dateModified": "2025-04-02",
  "image": "https://example.com/images/crm-guide-cover.jpg",
  "keywords": "CRM, Startups, Software",
  "url": "https://example.com/post/guide-to-crm"
}`}</pre>
                            </div>
                          </div>

                          <div className="bg-matrix-dark-gray/20 p-6 rounded-lg">
                            <h3 className="text-xl font-semibold text-matrix-green mb-4">2.2 AI-Generated Fix Suggestion</h3>
                            <p className="text-matrix-green/80 mb-4">
                              Scenario: The Citation Checker found that the site was not cited in the SGE result for 
                              "best CRM for startups." The system provides an actionable recommendation.
                            </p>
                            
                            <div className="bg-yellow-900/20 border border-yellow-600/30 p-4 rounded-lg">
                              <p className="text-yellow-100">
                                <strong>Suggestion:</strong> Add a dedicated section comparing the top 5 CRM tools for startups 
                                (including pros and cons) on your site, and mark it up with FAQ schema. This targeted content 
                                could make your site a relevant source for the query.
                              </p>
                            </div>
                          </div>
                        </div>
                      </div>
                    )}

                    {activeSection === "compliance" && (
                      <div className="space-y-6">
                        <h2 className="text-2xl font-bold text-matrix-green mb-4">3. Compliance Setup</h2>
                        
                        <p className="text-matrix-green/80 leading-relaxed">
                          It's critical to address compliance and ethical considerations for AI content. Below are step-by-step 
                          instructions to ensure the product and the user's website adhere to emerging AI web standards and 
                          regulations (GDPR, FTC, LGPD).
                        </p>

                        <div className="space-y-6">
                          <div className="bg-matrix-dark-gray/20 p-6 rounded-lg">
                            <h3 className="text-xl font-semibold text-matrix-green mb-4">3.1 Update robots.txt for LLM Access Control</h3>
                            
                            <div className="space-y-4">
                              <div>
                                <h4 className="font-semibold text-matrix-green mb-2">Allow AI Sitemap Access</h4>
                                <div className="bg-black/50 p-4 rounded font-mono text-sm text-matrix-green">
                                  <pre>{`# Allow AI agents to access AI-specific resources
User-agent: GPTBot
Allow: /ai-sitemap.json

User-agent: Google-Extended
Allow: /ai-sitemap.json`}</pre>
                                </div>
                              </div>

                              <div>
                                <h4 className="font-semibold text-matrix-green mb-2">Disallow Training (Optional)</h4>
                                <div className="bg-black/50 p-4 rounded font-mono text-sm text-matrix-green">
                                  <pre>{`# To block OpenAI's GPTBot entirely
User-agent: GPTBot
Disallow: /

# To opt out of Google's Bard/Vertex training
User-agent: Google-Extended
Disallow: /`}</pre>
                                </div>
                              </div>
                            </div>
                          </div>

                          <div className="bg-matrix-dark-gray/20 p-6 rounded-lg">
                            <h3 className="text-xl font-semibold text-matrix-green mb-4">3.2 Add AI Policy File</h3>
                            
                            <p className="text-matrix-green/80 mb-4">
                              Create human- and machine-readable notices about AI usage and consent by adding an 
                              ai-policy.json file to your site's root:
                            </p>
                            
                            <div className="bg-black/50 p-4 rounded font-mono text-sm text-matrix-green">
                              <pre>{`{
  "site": "https://example.com",
  "contact": "mailto:owner@example.com",
  "allowIndexing": true,
  "allowTraining": false,
  "policyLastUpdated": "2025-04-23T00:00:00Z",
  "preferredAgents": ["GPTBot", "Google-Extended"]
}`}</pre>
                            </div>
                          </div>

                          <div className="bg-matrix-dark-gray/20 p-6 rounded-lg">
                            <h3 className="text-xl font-semibold text-matrix-green mb-4">3.3 Meta Tags and Disclosure</h3>
                            
                            <div className="space-y-4">
                              <div>
                                <h4 className="font-semibold text-matrix-green mb-2">HTML Meta Tags</h4>
                                <div className="bg-black/50 p-4 rounded font-mono text-sm text-matrix-green">
                                  <pre>{`<meta name="robots" content="noai, noimageai">`}</pre>
                                </div>
                                <p className="text-matrix-green/70 text-sm mt-2">
                                  This meta tag declares you do not consent to AI using your text or images for training.
                                </p>
                              </div>

                              <div>
                                <h4 className="font-semibold text-matrix-green mb-2">Privacy Policy Updates</h4>
                                <ul className="space-y-2 text-matrix-green/80">
                                  <li>• Disclose use of external AI APIs (OpenAI, etc.)</li>
                                  <li>• Explain data processing purposes</li>
                                  <li>• Include data retention and deletion rights</li>
                                  <li>• Add GDPR/LGPD compliance statements</li>
                                </ul>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    )}

                    {activeSection === "monetization" && (
                      <div className="space-y-6">
                        <h2 className="text-2xl font-bold text-matrix-green mb-4">4. Monetization & GTM Toolkit</h2>
                        
                        <p className="text-matrix-green/80 leading-relaxed">
                          With the product features built, plan how to monetize and go to market. Below is a toolkit for setting up 
                          a freemium model, creating white-label assets for agencies, and preparing launch materials.
                        </p>

                        <div className="space-y-6">
                          <div className="bg-matrix-dark-gray/20 p-6 rounded-lg">
                            <h3 className="text-xl font-semibold text-matrix-green mb-4">4.1 Freemium Monetization via Stripe</h3>
                            
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                              <div className="bg-matrix-dark-gray/30 p-4 rounded-lg">
                                <h4 className="font-semibold text-matrix-green mb-2">Free Tier</h4>
                                <ul className="space-y-1 text-matrix-green/80 text-sm">
                                  <li>• Limited schema analyses per month</li>
                                  <li>• 1 AI sitemap generation</li>
                                  <li>• Basic citation checks</li>
                                </ul>
                              </div>
                              
                              <div className="bg-matrix-dark-gray/30 p-4 rounded-lg">
                                <h4 className="font-semibold text-matrix-green mb-2">Pro Tier</h4>
                                <ul className="space-y-1 text-matrix-green/80 text-sm">
                                  <li>• Unlimited checks and analyses</li>
                                  <li>• Automated weekly reports</li>
                                  <li>• White-label PDF reports</li>
                                  <li>• Priority support</li>
                                </ul>
                              </div>
                            </div>

                            <div className="space-y-3">
                              <h4 className="font-semibold text-matrix-green">Implementation Steps:</h4>
                              <ul className="space-y-2 text-matrix-green/80">
                                <li>• Set up Stripe account and create subscription products</li>
                                <li>• Integrate Stripe plugin in Bubble</li>
                                <li>• Configure webhooks for subscription status updates</li>
                                <li>• Implement usage limits and access controls</li>
                                <li>• Add upgrade prompts and billing management</li>
                              </ul>
                            </div>
                          </div>

                          <div className="bg-matrix-dark-gray/20 p-6 rounded-lg">
                            <h3 className="text-xl font-semibold text-matrix-green mb-4">4.2 White-Label PDF Reporting</h3>
                            
                            <p className="text-matrix-green/80 mb-4">
                              Agencies can generate professional reports for their clients with custom branding:
                            </p>

                            <div className="space-y-3">
                              <h4 className="font-semibold text-matrix-green">Report Components:</h4>
                              <ul className="space-y-2 text-matrix-green/80">
                                <li>• Schema fixes summary and recommendations</li>
                                <li>• Citation check results for key queries</li>
                                <li>• AI Sitemap implementation status</li>
                                <li>• Compliance checklist and next steps</li>
                                <li>• Overall AI Visibility score (0-100)</li>
                                <li>• Custom agency branding and client details</li>
                              </ul>
                            </div>
                          </div>

                          <div className="bg-matrix-dark-gray/20 p-6 rounded-lg">
                            <h3 className="text-xl font-semibold text-matrix-green mb-4">4.3 Launch Assets</h3>
                            
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                              <div className="bg-matrix-dark-gray/30 p-4 rounded-lg">
                                <h4 className="font-semibold text-matrix-green mb-2">Product Hunt</h4>
                                <ul className="space-y-1 text-matrix-green/80 text-sm">
                                  <li>• Compelling headline and tagline</li>
                                  <li>• Eye-catching thumbnail</li>
                                  <li>• Demo video and screenshots</li>
                                  <li>• Community engagement strategy</li>
                                </ul>
                              </div>
                              
                              <div className="bg-matrix-dark-gray/30 p-4 rounded-lg">
                                <h4 className="font-semibold text-matrix-green mb-2">Email Sequence</h4>
                                <ul className="space-y-1 text-matrix-green/80 text-sm">
                                  <li>• Welcome and onboarding</li>
                                  <li>• Educational content and tips</li>
                                  <li>• Success stories and social proof</li>
                                  <li>• Upgrade prompts and offers</li>
                                </ul>
                              </div>
                              
                              <div className="bg-matrix-dark-gray/30 p-4 rounded-lg">
                                <h4 className="font-semibold text-matrix-green mb-2">Social Proof</h4>
                                <ul className="space-y-1 text-matrix-green/80 text-sm">
                                  <li>• Customer testimonials</li>
                                  <li>• Usage metrics and achievements</li>
                                  <li>• Media mentions and features</li>
                                  <li>• Community sharing templates</li>
                                </ul>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    )}

                    {activeSection === "maintenance" && (
                      <div className="space-y-6">
                        <h2 className="text-2xl font-bold text-matrix-green mb-4">5. Maintenance Automation</h2>
                        
                        <p className="text-matrix-green/80 leading-relaxed">
                          After launching, maintain and improve the product through automation. This ensures the playbook 
                          stays effective as search algorithms change and that user feedback continuously feeds into improvements.
                        </p>

                        <div className="space-y-6">
                          <div className="bg-matrix-dark-gray/20 p-6 rounded-lg">
                            <h3 className="text-xl font-semibold text-matrix-green mb-4">5.1 Automated Weekly Scans</h3>
                            
                            <div className="space-y-4">
                              <div>
                                <h4 className="font-semibold text-matrix-green mb-2">Cron Job Implementation</h4>
                                <ul className="space-y-2 text-matrix-green/80">
                                  <li>• Use Zapier Schedule triggers for weekly automation</li>
                                  <li>• Implement n8n workflows for complex scheduling</li>
                                  <li>• Set up EasyCron or similar services for reliability</li>
                                  <li>• Configure batch processing in Xano endpoints</li>
                                </ul>
                              </div>

                              <div>
                                <h4 className="font-semibold text-matrix-green mb-2">Automated Reporting</h4>
                                <ul className="space-y-2 text-matrix-green/80">
                                  <li>• Weekly citation check summaries</li>
                                  <li>• Schema analysis updates and alerts</li>
                                  <li>• Email notifications with key insights</li>
                                  <li>• Dashboard updates with latest scan results</li>
                                </ul>
                              </div>
                            </div>
                          </div>

                          <div className="bg-matrix-dark-gray/20 p-6 rounded-lg">
                            <h3 className="text-xl font-semibold text-matrix-green mb-4">5.2 Versioning and Updates</h3>
                            
                            <div className="space-y-4">
                              <div>
                                <h4 className="font-semibold text-matrix-green mb-2">Prompt Management</h4>
                                <ul className="space-y-2 text-matrix-green/80">
                                  <li>• Track prompt versions in Xano variables</li>
                                  <li>• Monitor performance of different prompts</li>
                                  <li>• Implement A/B testing for prompt optimization</li>
                                  <li>• Maintain rollback capabilities</li>
                                </ul>
                              </div>

                              <div>
                                <h4 className="font-semibold text-matrix-green mb-2">Feature Updates</h4>
                                <ul className="space-y-2 text-matrix-green/80">
                                  <li>• Monitor search engine algorithm changes</li>
                                  <li>• Adapt to new structured data standards</li>
                                  <li>• Update API integrations as needed</li>
                                  <li>• Implement user feedback improvements</li>
                                </ul>
                              </div>
                            </div>
                          </div>

                          <div className="bg-matrix-dark-gray/20 p-6 rounded-lg">
                            <h3 className="text-xl font-semibold text-matrix-green mb-4">5.3 Feedback Loop Optimization</h3>
                            
                            <div className="space-y-4">
                              <div>
                                <h4 className="font-semibold text-matrix-green mb-2">User Feedback Collection</h4>
                                <ul className="space-y-2 text-matrix-green/80">
                                  <li>• Implement thumbs-up/down rating system</li>
                                  <li>• Collect detailed feedback on suggestions</li>
                                  <li>• Track suggestion implementation success</li>
                                  <li>• Monitor user engagement metrics</li>
                                </ul>
                              </div>

                              <div>
                                <h4 className="font-semibold text-matrix-green mb-2">Continuous Improvement</h4>
                                <ul className="space-y-2 text-matrix-green/80">
                                  <li>• Analyze feedback patterns weekly</li>
                                  <li>• Fine-tune AI prompts based on results</li>
                                  <li>• Update recommendation algorithms</li>
                                  <li>• Expand feature set based on user needs</li>
                                </ul>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Navigation buttons */}
                    <div className="flex justify-between mt-8 pt-6 border-t border-matrix-green/20">
                      <Button
                        variant="outline"
                        onClick={() => {
                          const currentIndex = sections.findIndex(s => s.id === activeSection);
                          if (currentIndex > 0) {
                            setActiveSection(sections[currentIndex - 1].id);
                          }
                        }}
                        disabled={sections[0].id === activeSection}
                        className="border-matrix-green text-matrix-green hover:bg-matrix-green/10"
                      >
                        Previous Section
                      </Button>
                      
                      <Button
                        variant="outline"
                        onClick={() => {
                          const currentIndex = sections.findIndex(s => s.id === activeSection);
                          if (currentIndex < sections.length - 1) {
                            setActiveSection(sections[currentIndex + 1].id);
                          }
                        }}
                        disabled={sections[sections.length - 1].id === activeSection}
                        className="border-matrix-green text-matrix-green hover:bg-matrix-green/10"
                      >
                        Next Section
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default AEOGuide;