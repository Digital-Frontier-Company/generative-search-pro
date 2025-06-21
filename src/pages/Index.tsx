
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { CheckCircle, ArrowRight, Zap, Database, Globe, Sparkles, ChevronDown, ChevronUp, Star, Users, TrendingUp, Search, Robot, Lightbulb, Upload, Paste, Bell, User, Info } from "lucide-react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import JsonLdSchema from "@/components/JsonLdSchema";
import { getHomepageSchema, getHomepageFAQSchema } from "@/utils/jsonLdSchemas";

const Index = () => {
  const navigate = useNavigate();
  const [faqOpen, setFaqOpen] = useState<number | null>(0);
  const [contentInput, setContentInput] = useState("");

  const handleAnalyzeContent = () => {
    if (contentInput.trim()) {
      navigate('/generator', { state: { initialContent: contentInput } });
    } else {
      navigate('/generator');
    }
  };

  const handleStartOptimization = () => {
    navigate('/generator');
  };

  const handleWatchDemo = () => {
    // Could navigate to a demo page or video
    navigate('/resources');
  };

  return (
    <div className="min-h-screen flex flex-col bg-black">
      <JsonLdSchema schema={[...getHomepageSchema(), getHomepageFAQSchema()]} />
      
      {/* Header */}
      <header className="flex items-center justify-between p-4 border-b border-matrix-green/30">
        <div className="flex items-center">
          <div className="neon-border rounded-lg p-2 mr-3">
            <div className="text-matrix-green text-4xl drop-shadow-[0_0_10px_rgba(0,255,65,0.8)]">?</div>
          </div>
          <div>
            <h1 className="text-3xl font-bold text-matrix-green drop-shadow-[0_0_10px_rgba(0,255,65,0.8)]">
              Generative<span className="text-white">Search.pro</span>
            </h1>
            <p className="text-matrix-green text-sm">Generative Engine Optimization</p>
          </div>
        </div>
        <nav className="hidden md:flex space-x-6">
          <button 
            onClick={() => navigate('/dashboard')}
            className="text-matrix-green hover:drop-shadow-[0_0_8px_rgba(0,255,65,0.8)] transition-all cursor-pointer"
          >
            Dashboard
          </button>
          <button 
            onClick={() => navigate('/content-analysis')}
            className="text-white hover:text-matrix-green transition-all cursor-pointer"
          >
            AI Audit
          </button>
          <button 
            onClick={() => navigate('/seo-analysis')}
            className="text-white hover:text-matrix-green transition-all cursor-pointer"
          >
            SEO Tools
          </button>
          <button 
            onClick={() => navigate('/dashboard')}
            className="text-white hover:text-matrix-green transition-all cursor-pointer"
          >
            Analytics
          </button>
          <button 
            onClick={() => navigate('/resources')}
            className="text-white hover:text-matrix-green transition-all cursor-pointer"
          >
            Resources
          </button>
        </nav>
        <div className="flex items-center">
          <button className="mr-4 text-white hover:text-matrix-green">
            <Bell className="w-5 h-5" />
          </button>
          <div className="w-10 h-10 rounded-full bg-matrix-dark-gray flex items-center justify-center">
            <User className="w-5 h-5" />
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto p-6">
        {/* Hero Section */}
        <section className="mb-12">
          <div className="flex flex-col md:flex-row items-center justify-between">
            <div className="md:w-1/2 mb-8 md:mb-0">
              <h1 className="text-4xl font-bold mb-4">
                Optimize Your Content for <span className="text-matrix-green drop-shadow-[0_0_10px_rgba(0,255,65,0.8)]">AI Visibility</span>
              </h1>
              <p className="text-lg mb-6 text-matrix-green/70">
                Create SEO-friendly content that ranks well in both traditional search engines and new AI-powered answer engines.
              </p>
              <div className="flex space-x-4">
                <Button 
                  onClick={handleStartOptimization}
                  className="glow-button text-black font-bold"
                >
                  Start Optimization
                </Button>
                <Button 
                  onClick={handleWatchDemo}
                  className="border-matrix-green text-matrix-green hover:bg-matrix-green/10 hover:text-matrix-green"
                  variant="outline"
                >
                  Watch Demo
                </Button>
              </div>
            </div>
            <div className="md:w-1/2 flex justify-center">
              <div className="relative w-full max-w-md">
                <div className="content-card p-6">
                  <div className="flex justify-between items-center mb-4">
                    <h3 className="text-matrix-green font-bold">AI Visibility Score</h3>
                    <span className="text-matrix-green text-2xl font-bold">78/100</span>
                  </div>
                  <div className="mb-4">
                    <div className="w-full bg-black rounded-full h-2.5">
                      <div className="bg-matrix-green h-2.5 rounded-full shadow-green-glow" style={{width: '78%'}}></div>
                    </div>
                  </div>
                  <div className="space-y-4">
                    <div className="flex justify-between items-center">
                      <span>Answer Engine Readiness</span>
                      <span className="text-matrix-green">85%</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span>Traditional SEO Score</span>
                      <span className="text-matrix-green">92%</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span>Content Structure</span>
                      <span className="text-matrix-green">65%</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span>Contextual Relevance</span>
                      <span className="text-matrix-green">71%</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section className="mb-12">
          <h2 className="text-2xl font-bold mb-8 text-center text-matrix-green">Key Features</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="content-card p-6 hover:scale-[1.02] transition-all">
              <div className="text-matrix-green text-3xl mb-4">
                <Search className="w-8 h-8" />
              </div>
              <h3 className="text-xl font-bold mb-2 text-matrix-green">SEO Analysis</h3>
              <p className="text-matrix-green/70">Comprehensive analysis of your content for traditional search engine optimization factors.</p>
            </div>
            <div className="content-card p-6 hover:scale-[1.02] transition-all">
              <div className="text-matrix-green text-3xl mb-4">
                <Robot className="w-8 h-8" />
              </div>
              <h3 className="text-xl font-bold mb-2 text-matrix-green">AI Visibility Scoring</h3>
              <p className="text-matrix-green/70">Evaluate how well your content performs with AI-powered answer engines and get actionable suggestions.</p>
            </div>
            <div className="content-card p-6 hover:scale-[1.02] transition-all">
              <div className="text-matrix-green text-3xl mb-4">
                <Lightbulb className="w-8 h-8" />
              </div>
              <h3 className="text-xl font-bold mb-2 text-matrix-green">Content Recommendations</h3>
              <p className="text-matrix-green/70">AI-powered suggestions to improve your content structure, clarity, and relevance.</p>
            </div>
          </div>
        </section>

        {/* Content Optimizer Tool */}
        <section className="mb-12">
          <h2 className="text-2xl font-bold mb-6 text-matrix-green">Content Optimizer</h2>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <div className="content-card overflow-hidden">
              <div className="bg-matrix-dark-gray p-4 flex justify-between items-center border-b border-matrix-green/30">
                <h3 className="font-bold text-matrix-green">Input Your Content</h3>
                <div className="flex space-x-2">
                  <button className="p-2 text-sm hover:text-matrix-green flex items-center">
                    <Upload className="w-4 h-4 mr-1" /> Import
                  </button>
                  <button className="p-2 text-sm hover:text-matrix-green flex items-center">
                    <Paste className="w-4 h-4 mr-1" /> Paste URL
                  </button>
                </div>
              </div>
              <div className="p-4">
                <textarea 
                  value={contentInput}
                  onChange={(e) => setContentInput(e.target.value)}
                  className="w-full h-64 bg-black border border-matrix-green/30 rounded-lg p-4 focus:border-matrix-green focus:outline-none text-matrix-green" 
                  placeholder="Enter your content here or import from a file/URL..."
                />
                <div className="flex justify-between mt-4">
                  <div className="text-sm text-matrix-green/70 flex items-center">
                    <Info className="w-4 h-4 mr-1" /> Recommended: 300+ words for best results
                  </div>
                  <Button 
                    onClick={handleAnalyzeContent}
                    className="glow-button text-black font-bold"
                  >
                    Analyze Content
                  </Button>
                </div>
              </div>
            </div>
            
            <div className="content-card overflow-hidden">
              <div className="bg-matrix-dark-gray p-4 flex justify-between items-center border-b border-matrix-green/30">
                <h3 className="font-bold text-matrix-green">AI Suggestions</h3>
                <div>
                  <select className="bg-black text-matrix-green border border-matrix-green/30 rounded p-1 text-sm">
                    <option>All Suggestions</option>
                    <option>SEO Improvements</option>
                    <option>AI Visibility</option>
                    <option>Content Structure</option>
                  </select>
                </div>
              </div>
              <div className="p-4 h-[340px] overflow-y-auto">
                <div className="mb-4 p-3 border-l-4 border-matrix-green bg-matrix-dark-gray rounded">
                  <h4 className="font-bold text-matrix-green">Add a Clear Question & Answer Format</h4>
                  <p className="text-sm text-matrix-green/70">Structure key information as direct questions and answers to improve visibility in AI answer engines.</p>
                </div>
                <div className="mb-4 p-3 border-l-4 border-yellow-500 bg-matrix-dark-gray rounded">
                  <h4 className="font-bold text-yellow-500">Improve Keyword Density</h4>
                  <p className="text-sm text-matrix-green/70">Your primary keyword appears only 2 times. Consider increasing to 5-7 mentions for better SEO.</p>
                </div>
                <div className="mb-4 p-3 border-l-4 border-matrix-green bg-matrix-dark-gray rounded">
                  <h4 className="font-bold text-matrix-green">Add Structured Data</h4>
                  <p className="text-sm text-matrix-green/70">Implement FAQ schema markup to enhance your content's visibility in both search and AI results.</p>
                </div>
                <div className="mb-4 p-3 border-l-4 border-blue-400 bg-matrix-dark-gray rounded">
                  <h4 className="font-bold text-blue-400">Improve Readability</h4>
                  <p className="text-sm text-matrix-green/70">Current readability score is 65/100. Break longer paragraphs into shorter ones for better comprehension.</p>
                </div>
                <div className="mb-4 p-3 border-l-4 border-matrix-green bg-matrix-dark-gray rounded">
                  <h4 className="font-bold text-matrix-green">Add Contextual Information</h4>
                  <p className="text-sm text-matrix-green/70">Enhance your content with more specific details and examples to provide better context for AI engines.</p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* AI Visibility Metrics */}
        <section className="mb-12">
          <h2 className="text-2xl font-bold mb-6 text-matrix-green">AI Visibility Metrics</h2>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div className="content-card p-4">
              <div className="flex justify-between items-center mb-2">
                <h3 className="font-bold text-matrix-green">Answer Quality</h3>
                <span className="text-matrix-green font-bold">82%</span>
              </div>
              <div className="w-full bg-black rounded-full h-2">
                <div className="bg-matrix-green h-2 rounded-full" style={{width: '82%'}}></div>
              </div>
              <p className="text-xs mt-2 text-matrix-green/70">How well your content answers potential user queries</p>
            </div>
            <div className="content-card p-4">
              <div className="flex justify-between items-center mb-2">
                <h3 className="font-bold text-matrix-green">Factual Accuracy</h3>
                <span className="text-matrix-green font-bold">95%</span>
              </div>
              <div className="w-full bg-black rounded-full h-2">
                <div className="bg-matrix-green h-2 rounded-full" style={{width: '95%'}}></div>
              </div>
              <p className="text-xs mt-2 text-matrix-green/70">Precision and reliability of information provided</p>
            </div>
            <div className="content-card p-4">
              <div className="flex justify-between items-center mb-2">
                <h3 className="font-bold text-matrix-green">Content Structure</h3>
                <span className="text-matrix-green font-bold">65%</span>
              </div>
              <div className="w-full bg-black rounded-full h-2">
                <div className="bg-matrix-green h-2 rounded-full" style={{width: '65%'}}></div>
              </div>
              <p className="text-xs mt-2 text-matrix-green/70">Organization and formatting for AI readability</p>
            </div>
            <div className="content-card p-4">
              <div className="flex justify-between items-center mb-2">
                <h3 className="font-bold text-matrix-green">Citation Potential</h3>
                <span className="text-matrix-green font-bold">71%</span>
              </div>
              <div className="w-full bg-black rounded-full h-2">
                <div className="bg-matrix-green h-2 rounded-full" style={{width: '71%'}}></div>
              </div>
              <p className="text-xs mt-2 text-matrix-green/70">Likelihood of being cited as a source by AI engines</p>
            </div>
          </div>
        </section>

        {/* Best Practices */}
        <section className="mb-12">
          <h2 className="text-2xl font-bold mb-6 text-matrix-green">AI Visibility Best Practices</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="flex">
              <div className="text-matrix-green text-2xl mr-4">
                <CheckCircle className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-lg font-bold mb-2 text-matrix-green">Structure Content with Clear Headings</h3>
                <p className="text-matrix-green/70">Use descriptive H2 and H3 headings that directly address user questions. AI systems use headings to understand content hierarchy and identify key information.</p>
              </div>
            </div>
            <div className="flex">
              <div className="text-matrix-green text-2xl mr-4">
                <CheckCircle className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-lg font-bold mb-2 text-matrix-green">Include Concise Definitions</h3>
                <p className="text-matrix-green/70">Provide clear, direct definitions of key terms and concepts. AI engines often extract these definitions to answer "what is" type queries.</p>
              </div>
            </div>
            <div className="flex">
              <div className="text-matrix-green text-2xl mr-4">
                <CheckCircle className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-lg font-bold mb-2 text-matrix-green">Implement FAQ Schema Markup</h3>
                <p className="text-matrix-green/70">Add structured data to your content using FAQ schema. This helps AI systems identify and extract questions and answers from your content.</p>
              </div>
            </div>
            <div className="flex">
              <div className="text-matrix-green text-2xl mr-4">
                <CheckCircle className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-lg font-bold mb-2 text-matrix-green">Provide Factual, Verifiable Information</h3>
                <p className="text-matrix-green/70">AI systems prioritize factual content with verifiable data. Include statistics, research findings, and citations to increase your content's authority.</p>
              </div>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="mb-12">
          <div className="content-card p-8 text-center neon-border">
            <h2 className="text-3xl font-bold mb-4 text-matrix-green">Ready to Optimize Your Content for AI?</h2>
            <p className="text-lg mb-6 max-w-2xl mx-auto text-matrix-green/70">
              Get comprehensive analysis and actionable recommendations to improve your content's visibility in both traditional search and AI-powered answer engines.
            </p>
            <div className="flex justify-center space-x-4">
              <Button 
                onClick={() => navigate('/auth', { state: { signUp: true } })}
                className="glow-button text-black font-bold"
              >
                Start Free Trial
              </Button>
              <Button 
                onClick={() => navigate('/resources')}
                className="border-matrix-green text-matrix-green hover:bg-matrix-green/10"
                variant="outline"
              >
                Schedule Demo
              </Button>
            </div>
          </div>
        </section>
      </main>
      
      <Footer />
    </div>
  );
};

export default Index;
