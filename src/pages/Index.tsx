import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { CheckCircle, ArrowRight, Zap, Database, Globe, Sparkles, ChevronDown, ChevronUp, Star, Users, TrendingUp, Search, Bot, Lightbulb, Upload, Clipboard, Bell, User, Info } from "lucide-react";
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
    navigate('/resources');
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#0D1117]">
      <JsonLdSchema schema={[...getHomepageSchema(), getHomepageFAQSchema()]} />
      
      {/* Header */}
      <header className="flex items-center justify-between p-4 border-b border-[#1E2329]">
        <div className="flex items-center">
          <div className="border-2 border-[#39FF14] rounded-lg p-2 mr-3" style={{boxShadow: '0 0 5px #39FF14, 0 0 10px #39FF14'}}>
            <div className="text-[#39FF14] text-4xl" style={{textShadow: '0 0 5px #39FF14, 0 0 10px #39FF14'}}>?</div>
          </div>
          <div>
            <h1 className="text-3xl font-bold text-[#39FF14]" style={{textShadow: '0 0 5px #39FF14, 0 0 10px #39FF14'}}>
              Generative<span className="text-white">Search.pro</span>
            </h1>
            <p className="text-[#39FF14] text-sm">Generative Engine Optimization</p>
          </div>
        </div>
        <nav className="hidden md:flex space-x-6">
          <button 
            onClick={() => navigate('/dashboard')}
            className="text-[#39FF14] hover:opacity-80 transition-all cursor-pointer"
          >
            Dashboard
          </button>
          <button 
            onClick={() => navigate('/content-analysis')}
            className="text-white hover:text-[#39FF14] transition-all cursor-pointer"
          >
            AI Audit
          </button>
          <button 
            onClick={() => navigate('/seo-analysis')}
            className="text-white hover:text-[#39FF14] transition-all cursor-pointer"
          >
            SEO Tools
          </button>
          <button 
            onClick={() => navigate('/dashboard')}
            className="text-white hover:text-[#39FF14] transition-all cursor-pointer"
          >
            Analytics
          </button>
          <button 
            onClick={() => navigate('/resources')}
            className="text-white hover:text-[#39FF14] transition-all cursor-pointer"
          >
            Resources
          </button>
        </nav>
        <div className="flex items-center">
          <button className="mr-4 text-white hover:text-[#39FF14]">
            <Bell className="w-5 h-5" />
          </button>
          <div className="w-10 h-10 rounded-full bg-[#1E2329] flex items-center justify-center">
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
                Optimize Your Content for <span className="text-[#39FF14]" style={{textShadow: '0 0 5px #39FF14, 0 0 10px #39FF14'}}>AI Visibility</span>
              </h1>
              <p className="text-lg mb-6 text-gray-300">
                Create SEO-friendly content that ranks well in both traditional search engines and new AI-powered answer engines.
              </p>
              <div className="flex space-x-4">
                <button 
                  onClick={handleStartOptimization}
                  className="px-6 py-3 bg-[#39FF14] text-[#0D1117] font-bold rounded-lg transition-all"
                  style={{boxShadow: '0 0 5px #39FF14, 0 0 10px #39FF14'}}
                >
                  Start Optimization
                </button>
                <button 
                  onClick={handleWatchDemo}
                  className="px-6 py-3 border border-[#39FF14] text-[#39FF14] rounded-lg hover:bg-[#39FF14] hover:text-[#0D1117] transition-all"
                >
                  Watch Demo
                </button>
              </div>
            </div>
            <div className="md:w-1/2 flex justify-center">
              <div className="relative w-full max-w-md">
                <div className="border-2 border-[#39FF14] rounded-lg p-6 bg-[#1E2329]" style={{boxShadow: '0 0 5px #39FF14, 0 0 10px #39FF14'}}>
                  <div className="flex justify-between items-center mb-4">
                    <h3 className="text-[#39FF14] font-bold">AI Visibility Score</h3>
                    <span className="text-[#39FF14] text-2xl font-bold">78/100</span>
                  </div>
                  <div className="mb-4">
                    <div className="w-full bg-[#0D1117] rounded-full h-2.5">
                      <div className="bg-[#39FF14] h-2.5 rounded-full" style={{width: '78%', boxShadow: '0 0 5px #39FF14, 0 0 10px #39FF14'}}></div>
                    </div>
                  </div>
                  <div className="space-y-4">
                    <div className="flex justify-between items-center">
                      <span>Answer Engine Readiness</span>
                      <span className="text-[#39FF14]">85%</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span>Traditional SEO Score</span>
                      <span className="text-[#39FF14]">92%</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span>Content Structure</span>
                      <span className="text-[#39FF14]">65%</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span>Contextual Relevance</span>
                      <span className="text-[#39FF14]">71%</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section className="mb-12">
          <h2 className="text-2xl font-bold mb-8 text-center">Key Features</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="border border-[#1E2329] bg-[#1E2329] rounded-lg p-6 hover:border-[#39FF14] transition-all">
              <div className="text-[#39FF14] text-3xl mb-4">
                <Search className="w-8 h-8" />
              </div>
              <h3 className="text-xl font-bold mb-2">SEO Analysis</h3>
              <p className="text-gray-300">Comprehensive analysis of your content for traditional search engine optimization factors.</p>
            </div>
            <div className="border border-[#1E2329] bg-[#1E2329] rounded-lg p-6 hover:border-[#39FF14] transition-all">
              <div className="text-[#39FF14] text-3xl mb-4">
                <Bot className="w-8 h-8" />
              </div>
              <h3 className="text-xl font-bold mb-2">AI Visibility Scoring</h3>
              <p className="text-gray-300">Evaluate how well your content performs with AI-powered answer engines and get actionable suggestions.</p>
            </div>
            <div className="border border-[#1E2329] bg-[#1E2329] rounded-lg p-6 hover:border-[#39FF14] transition-all">
              <div className="text-[#39FF14] text-3xl mb-4">
                <Lightbulb className="w-8 h-8" />
              </div>
              <h3 className="text-xl font-bold mb-2">Content Recommendations</h3>
              <p className="text-gray-300">AI-powered suggestions to improve your content structure, clarity, and relevance.</p>
            </div>
          </div>
        </section>

        {/* Content Optimizer Tool */}
        <section className="mb-12">
          <h2 className="text-2xl font-bold mb-6">Content Optimizer</h2>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <div className="border border-[#1E2329] rounded-lg overflow-hidden">
              <div className="bg-[#1E2329] p-4 flex justify-between items-center">
                <h3 className="font-bold">Input Your Content</h3>
                <div className="flex space-x-2">
                  <button className="p-2 text-sm hover:text-[#39FF14] flex items-center">
                    <Upload className="w-4 h-4 mr-1" /> Import
                  </button>
                  <button className="p-2 text-sm hover:text-[#39FF14] flex items-center">
                    <Clipboard className="w-4 h-4 mr-1" /> Paste URL
                  </button>
                </div>
              </div>
              <div className="p-4">
                <textarea 
                  value={contentInput}
                  onChange={(e) => setContentInput(e.target.value)}
                  className="w-full h-64 bg-[#0D1117] border border-[#1E2329] rounded-lg p-4 focus:border-[#39FF14] focus:outline-none text-white" 
                  placeholder="Enter your content here or import from a file/URL..."
                />
                <div className="flex justify-between mt-4">
                  <div className="text-sm text-gray-400 flex items-center">
                    <Info className="w-4 h-4 mr-1" /> Recommended: 300+ words for best results
                  </div>
                  <button 
                    onClick={handleAnalyzeContent}
                    className="px-4 py-2 bg-[#39FF14] text-[#0D1117] font-bold rounded-lg transition-all"
                    style={{boxShadow: '0 0 5px #39FF14, 0 0 10px #39FF14'}}
                  >
                    Analyze Content
                  </button>
                </div>
              </div>
            </div>
            
            <div className="border border-[#1E2329] rounded-lg overflow-hidden">
              <div className="bg-[#1E2329] p-4 flex justify-between items-center">
                <h3 className="font-bold">AI Suggestions</h3>
                <div>
                  <select className="bg-[#0D1117] text-white border border-[#1E2329] rounded p-1 text-sm">
                    <option>All Suggestions</option>
                    <option>SEO Improvements</option>
                    <option>AI Visibility</option>
                    <option>Content Structure</option>
                  </select>
                </div>
              </div>
              <div className="p-4 h-[340px] overflow-y-auto">
                <div className="mb-4 p-3 border-l-4 border-[#39FF14] bg-[#1E2329] rounded">
                  <h4 className="font-bold text-[#39FF14]">Add a Clear Question & Answer Format</h4>
                  <p className="text-sm text-gray-300">Structure key information as direct questions and answers to improve visibility in AI answer engines.</p>
                </div>
                <div className="mb-4 p-3 border-l-4 border-yellow-500 bg-[#1E2329] rounded">
                  <h4 className="font-bold text-yellow-500">Improve Keyword Density</h4>
                  <p className="text-sm text-gray-300">Your primary keyword appears only 2 times. Consider increasing to 5-7 mentions for better SEO.</p>
                </div>
                <div className="mb-4 p-3 border-l-4 border-[#39FF14] bg-[#1E2329] rounded">
                  <h4 className="font-bold text-[#39FF14]">Add Structured Data</h4>
                  <p className="text-sm text-gray-300">Implement FAQ schema markup to enhance your content's visibility in both search and AI results.</p>
                </div>
                <div className="mb-4 p-3 border-l-4 border-blue-400 bg-[#1E2329] rounded">
                  <h4 className="font-bold text-blue-400">Improve Readability</h4>
                  <p className="text-sm text-gray-300">Current readability score is 65/100. Break longer paragraphs into shorter ones for better comprehension.</p>
                </div>
                <div className="mb-4 p-3 border-l-4 border-[#39FF14] bg-[#1E2329] rounded">
                  <h4 className="font-bold text-[#39FF14]">Add Contextual Information</h4>
                  <p className="text-sm text-gray-300">Enhance your content with more specific details and examples to provide better context for AI engines.</p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* AI Visibility Metrics */}
        <section className="mb-12">
          <h2 className="text-2xl font-bold mb-6">AI Visibility Metrics</h2>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div className="border border-[#1E2329] bg-[#1E2329] rounded-lg p-4">
              <div className="flex justify-between items-center mb-2">
                <h3 className="font-bold">Answer Quality</h3>
                <span className="text-[#39FF14] font-bold">82%</span>
              </div>
              <div className="w-full bg-[#0D1117] rounded-full h-2">
                <div className="bg-[#39FF14] h-2 rounded-full" style={{width: '82%'}}></div>
              </div>
              <p className="text-xs mt-2 text-gray-300">How well your content answers potential user queries</p>
            </div>
            <div className="border border-[#1E2329] bg-[#1E2329] rounded-lg p-4">
              <div className="flex justify-between items-center mb-2">
                <h3 className="font-bold">Factual Accuracy</h3>
                <span className="text-[#39FF14] font-bold">95%</span>
              </div>
              <div className="w-full bg-[#0D1117] rounded-full h-2">
                <div className="bg-[#39FF14] h-2 rounded-full" style={{width: '95%'}}></div>
              </div>
              <p className="text-xs mt-2 text-gray-300">Precision and reliability of information provided</p>
            </div>
            <div className="border border-[#1E2329] bg-[#1E2329] rounded-lg p-4">
              <div className="flex justify-between items-center mb-2">
                <h3 className="font-bold">Content Structure</h3>
                <span className="text-[#39FF14] font-bold">65%</span>
              </div>
              <div className="w-full bg-[#0D1117] rounded-full h-2">
                <div className="bg-[#39FF14] h-2 rounded-full" style={{width: '65%'}}></div>
              </div>
              <p className="text-xs mt-2 text-gray-300">Organization and formatting for AI readability</p>
            </div>
            <div className="border border-[#1E2329] bg-[#1E2329] rounded-lg p-4">
              <div className="flex justify-between items-center mb-2">
                <h3 className="font-bold">Citation Potential</h3>
                <span className="text-[#39FF14] font-bold">71%</span>
              </div>
              <div className="w-full bg-[#0D1117] rounded-full h-2">
                <div className="bg-[#39FF14] h-2 rounded-full" style={{width: '71%'}}></div>
              </div>
              <p className="text-xs mt-2 text-gray-300">Likelihood of being cited as a source by AI engines</p>
            </div>
          </div>
        </section>

        {/* Best Practices */}
        <section className="mb-12">
          <h2 className="text-2xl font-bold mb-6">AI Visibility Best Practices</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="flex">
              <div className="text-[#39FF14] text-2xl mr-4">
                <CheckCircle className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-lg font-bold mb-2">Structure Content with Clear Headings</h3>
                <p className="text-gray-300">Use descriptive H2 and H3 headings that directly address user questions. AI systems use headings to understand content hierarchy and identify key information.</p>
              </div>
            </div>
            <div className="flex">
              <div className="text-[#39FF14] text-2xl mr-4">
                <CheckCircle className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-lg font-bold mb-2">Include Concise Definitions</h3>
                <p className="text-gray-300">Provide clear, direct definitions of key terms and concepts. AI engines often extract these definitions to answer "what is" type queries.</p>
              </div>
            </div>
            <div className="flex">
              <div className="text-[#39FF14] text-2xl mr-4">
                <CheckCircle className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-lg font-bold mb-2">Implement FAQ Schema Markup</h3>
                <p className="text-gray-300">Add structured data to your content using FAQ schema. This helps AI systems identify and extract questions and answers from your content.</p>
              </div>
            </div>
            <div className="flex">
              <div className="text-[#39FF14] text-2xl mr-4">
                <CheckCircle className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-lg font-bold mb-2">Provide Factual, Verifiable Information</h3>
                <p className="text-gray-300">AI systems prioritize factual content with verifiable data. Include statistics, research findings, and citations to increase your content's authority.</p>
              </div>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="mb-12">
          <div className="border-2 border-[#39FF14] rounded-lg p-8 text-center" style={{boxShadow: '0 0 5px #39FF14, 0 0 10px #39FF14'}}>
            <h2 className="text-3xl font-bold mb-4">Ready to Optimize Your Content for AI?</h2>
            <p className="text-lg mb-6 max-w-2xl mx-auto">Get comprehensive analysis and actionable recommendations to improve your content's visibility in both traditional search and AI-powered answer engines.</p>
            <div className="flex justify-center space-x-4">
              <button 
                onClick={() => navigate('/auth', { state: { signUp: true } })}
                className="px-6 py-3 bg-[#39FF14] text-[#0D1117] font-bold rounded-lg transition-all"
                style={{boxShadow: '0 0 5px #39FF14, 0 0 10px #39FF14'}}
              >
                Start Free Trial
              </button>
              <button 
                onClick={() => navigate('/resources')}
                className="px-6 py-3 border border-[#39FF14] text-[#39FF14] rounded-lg hover:bg-[#39FF14] hover:text-[#0D1117] transition-all"
              >
                Schedule Demo
              </button>
            </div>
          </div>
        </section>
      </main>
      
      <Footer />
    </div>
  );
};

export default Index;
