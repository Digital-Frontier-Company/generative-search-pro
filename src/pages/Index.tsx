
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { CheckCircle, ArrowRight, Zap, Database, Globe, Sparkles, ChevronDown, ChevronUp, Star, Users, TrendingUp, Search, Bot, Lightbulb, Upload, Clipboard, Bell, User, Info, Clock, CheckSquare, Target } from "lucide-react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import JsonLdSchema from "@/components/JsonLdSchema";
import { getHomepageSchema, getHomepageFAQSchema } from "@/utils/jsonLdSchemas";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import LeadCaptureModal from "@/components/landing/LeadCaptureModal";
import NewsletterSignup from "@/components/landing/NewsletterSignup";
import TestimonialSection from "@/components/landing/TestimonialSection";
import SocialProofSection from "@/components/landing/SocialProofSection";
import HowItWorksSection from "@/components/landing/HowItWorksSection";
import FeatureComparisonSection from "@/components/landing/FeatureComparisonSection";
import TrustSection from "@/components/landing/TrustSection";
import AnimatedGSPLogo from "@/components/AnimatedGSPLogo";

const Index = () => {
  const navigate = useNavigate();
  const [faqOpen, setFaqOpen] = useState<number | null>(0);
  const [contentInput, setContentInput] = useState("");
  const [analysis, setAnalysis] = useState<any>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  // Real-time social-proof toast notifications
  useEffect(() => {
    const names = [
      "John", "Sarah", "Alex", "Emily", "Michael", "Olivia", "Daniel", "Sophia", "David", "Emma"
    ];
    const cities = ["NYC", "London", "Berlin", "Toronto", "Sydney", "San Francisco", "Singapore", "Tokyo"];
    const plans = ["Starter", "Professional", "Enterprise"];

    const randomMessage = () => {
      const name = names[Math.floor(Math.random() * names.length)];
      const city = cities[Math.floor(Math.random() * cities.length)];
      const plan = plans[Math.floor(Math.random() * plans.length)];
      return `${name} from ${city} just signed up for the ${plan} plan!`;
    };

    // Show first toast after 6 s, then every 35 s
    const firstTimeout = setTimeout(() => toast(randomMessage()), 6000);
    const interval = setInterval(() => toast(randomMessage()), 35000);
    return () => {
      clearTimeout(firstTimeout);
      clearInterval(interval);
    };
  }, []);

  // Enhanced analysis functions using Supabase
  const performAnalysis = async (text: string) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        // Fallback to basic analysis if not authenticated
        return performBasicAnalysis(text);
      }

      // Call enhanced database functions using type assertion
      const { data: qualityData, error: qualityError } = await supabase
        .rpc('analyze_content_quality' as any, {
          content_text: text
        });

      if (qualityError) throw qualityError;

      const { data: aiData, error: aiError } = await supabase
        .rpc('check_ai_friendliness' as any, {
          content_text: text
        });

      if (aiError) throw aiError;

      const qualityResult = qualityData as any;
      const aiResult = aiData as any;

      return {
        basicStats: {
          wordCount: qualityResult.word_count,
          sentences: qualityResult.sentence_count,
          readingTime: qualityResult.reading_time_minutes,
          readabilityScore: Math.min(100, Math.max(0, 100 - (qualityResult.word_count / qualityResult.sentence_count) * 2))
        },
        aiOptimization: {
          hasHeadings: aiResult.has_clear_structure,
          hasCitations: aiResult.has_citations,
          hasLinks: qualityResult.link_count > 0,
          isWellStructured: aiResult.has_clear_structure && qualityResult.sentence_count > 3,
          readabilityGood: aiResult.avg_paragraph_length < 500
        },
        score: Math.max(qualityResult.quality_score, aiResult.ai_score),
        recommendations: aiResult.recommendations
      };
    } catch (error) {
      console.error('Enhanced analysis failed, using basic analysis:', error);
      return performBasicAnalysis(text);
    }
  };

  // Fallback basic analysis function
  const performBasicAnalysis = (text: string) => {
    const words = text.split(/\s+/).length;
    const sentences = text.split(/[.!?]+/).filter(s => s.trim()).length;
    const headings = (text.match(/#{1,6}\s/g) || []).length;
    const links = (text.match(/\[.*?\]\(.*?\)/g) || []).length;
    const citations = (text.match(/\(\w+,?\s?\d{4}\)/g) || []).length;
    
    const readingTimeMinutes = Math.ceil(words / 200);
    
    return {
      basicStats: {
        wordCount: words,
        sentences: sentences,
        readingTime: readingTimeMinutes,
        readabilityScore: Math.min(100, Math.max(0, 100 - (words / sentences) * 2))
      },
      aiOptimization: {
        hasHeadings: headings > 0,
        hasCitations: citations > 0,
        hasLinks: links > 0,
        isWellStructured: headings > 0 && sentences > 3,
        readabilityGood: words / sentences < 20
      },
      score: calculateScore(headings, citations, links, words, sentences),
      recommendations: generateRecommendations(headings, citations, links, words, sentences)
    };
  };

  const calculateScore = (headings: number, citations: number, links: number, words: number, sentences: number) => {
    let score = 0;
    if (headings > 0) score += 25;
    if (citations > 0) score += 25;
    if (links > 0) score += 20;
    if (words > 300) score += 15;
    if (sentences > 5) score += 15;
    return Math.min(100, score);
  };

  const generateRecommendations = (headings: number, citations: number, links: number, words: number, sentences: number) => {
    const recs = [];
    if (headings === 0) recs.push("Add clear headings (H2, H3) to structure your content");
    if (citations === 0) recs.push("Include citations to credible sources (Author, Year)");
    if (links === 0) recs.push("Add relevant external links to authoritative sources");
    if (words < 300) recs.push("Expand content - AI prefers comprehensive information");
    if (words / sentences > 20) recs.push("Use shorter sentences for better AI readability");
    if (recs.length === 0) recs.push("Great job! Your content is well-optimized for AI engines");
    return recs;
  };

  const handleAnalyzeContent = async () => {
    if (contentInput.trim()) {
      setIsAnalyzing(true);
      try {
        const results = await performAnalysis(contentInput);
        setAnalysis(results);
        toast.success("Content analysis completed!");
      } catch (error) {
        console.error('Analysis error:', error);
        toast.error('Analysis failed. Please try again.');
      } finally {
        setIsAnalyzing(false);
      }
    }
  };

  const handleStartOptimization = () => {
    navigate('/generator');
  };

  const handleWatchDemo = () => {
    navigate('/resources');
  };

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-[#39FF14]';
    if (score >= 60) return 'text-yellow-500';
    return 'text-red-500';
  };

  const getScoreLabel = (score: number) => {
    if (score >= 80) return 'Excellent';
    if (score >= 60) return 'Good';
    return 'Needs Work';
  };

  return (
    <div className="min-h-screen flex flex-col">
      <JsonLdSchema schema={[...getHomepageSchema(), getHomepageFAQSchema()]} />
      
      {/* Header */}
      <Header />

      {/* Main Content */}
      <main className="container mx-auto p-6">
        {/* Hero Section */}
        <section className="mb-12">
          <div className="flex flex-col md:flex-row items-center justify-between">
            <div className="md:w-1/2 mb-8 md:mb-0">
              {/* Animated GSP Logo positioned above the title */}
              <div className="mb-6">
                <AnimatedGSPLogo />
              </div>
              <h1 
                className="text-4xl font-bold mb-4 font-orbitron transform-gpu transition-all duration-300 hover:scale-105"
                style={{
                  textShadow: '0 0 20px #39FF14, 0 0 40px #39FF14, 0 8px 16px rgba(0, 0, 0, 0.5)',
                  transform: 'translateZ(15px)',
                  transformStyle: 'preserve-3d',
                  filter: 'drop-shadow(0 10px 20px rgba(57, 255, 20, 0.3))'
                }}
              >
                Optimize Your Content for <span className="text-[#39FF14]">AI Visibility</span>
              </h1>
              <p className="text-lg mb-6 text-gray-300">
                Create SEO-friendly content that ranks well in both traditional search engines and new AI-powered answer engines.
              </p>
              <div className="flex flex-col sm:flex-row gap-4">
                <Button 
                  size="cta"
                  onClick={() => navigate('/upgrade')}
                  className="bg-[#39FF14] text-[#0D1117] hover:bg-[#39FF14]/90"
                  style={{boxShadow: '0 0 10px #39FF14'}}
                >
                  Start Free Trial
                </Button>
                <LeadCaptureModal 
                  triggerText="Watch Demo"
                  title="Book Your Demo"
                  description="See how GenerativeSearch.pro works for your business"
                  type="demo"
                />
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
        <section id="features" className="mb-12">
          <h2 
            className="text-3xl font-bold mb-8 text-center text-[#39FF14] font-orbitron transform-gpu transition-all duration-300 hover:scale-105"
            style={{
              textShadow: '0 0 20px #39FF14, 0 0 40px #39FF14, 0 8px 16px rgba(0, 0, 0, 0.5)',
              transform: 'translateZ(15px)',
              transformStyle: 'preserve-3d',
              filter: 'drop-shadow(0 10px 20px rgba(57, 255, 20, 0.3))'
            }}
          >
            Powerful Features for AI-Ready Content
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="border border-[#1E2329] bg-[#1E2329] rounded-lg p-6 hover:border-[#39FF14] transition-all">
              <div className="text-[#39FF14] text-3xl mb-4">
                <Search className="w-8 h-8" />
              </div>
              <h3 
                className="text-xl font-bold mb-2 text-[#39FF14] font-orbitron transform-gpu transition-all duration-300 hover:scale-105"
                style={{
                  textShadow: '0 0 15px #39FF14, 0 0 30px #39FF14, 0 6px 12px rgba(0, 0, 0, 0.5)',
                  transform: 'translateZ(10px)',
                  transformStyle: 'preserve-3d',
                  filter: 'drop-shadow(0 8px 15px rgba(57, 255, 20, 0.3))'
                }}
              >
                Advanced SEO Analysis
              </h3>
              <p className="text-gray-300">Get comprehensive insights into your website's performance with our advanced SEO analysis tools. Track rankings, identify issues, and optimize for both traditional and AI search engines.</p>
            </div>
            <div className="border border-[#1E2329] bg-[#1E2329] rounded-lg p-6 hover:border-[#39FF14] transition-all">
              <div className="text-[#39FF14] text-3xl mb-4">
                <Bot className="w-8 h-8" />
              </div>
              <h3 
                className="text-xl font-bold mb-2 text-[#39FF14] font-orbitron transform-gpu transition-all duration-300 hover:scale-105"
                style={{
                  textShadow: '0 0 15px #39FF14, 0 0 30px #39FF14, 0 6px 12px rgba(0, 0, 0, 0.5)',
                  transform: 'translateZ(10px)',
                  transformStyle: 'preserve-3d',
                  filter: 'drop-shadow(0 8px 15px rgba(57, 255, 20, 0.3))'
                }}
              >
                AI Visibility Scoring
              </h3>
              <p className="text-gray-300">Evaluate how well your content performs with AI-powered answer engines like ChatGPT, Claude, and Perplexity. Get actionable suggestions to improve your AI search rankings.</p>
            </div>
            <div className="border border-[#1E2329] bg-[#1E2329] rounded-lg p-6 hover:border-[#39FF14] transition-all">
              <div className="text-[#39FF14] text-3xl mb-4">
                <Lightbulb className="w-8 h-8" />
              </div>
              <h3 
                className="text-xl font-bold mb-2 text-[#39FF14] font-orbitron transform-gpu transition-all duration-300 hover:scale-105"
                style={{
                  textShadow: '0 0 15px #39FF14, 0 0 30px #39FF14, 0 6px 12px rgba(0, 0, 0, 0.5)',
                  transform: 'translateZ(10px)',
                  transformStyle: 'preserve-3d',
                  filter: 'drop-shadow(0 8px 15px rgba(57, 255, 20, 0.3))'
                }}
              >
                Smart Content Generator
              </h3>
              <p className="text-gray-300">Create AEO-optimized content that ranks well in both traditional search and AI answer engines. Our AI generates fact-based, well-structured content with proper citations.</p>
            </div>
            <div className="border border-[#1E2329] bg-[#1E2329] rounded-lg p-6 hover:border-[#39FF14] transition-all">
              <div className="text-[#39FF14] text-3xl mb-4">
                <CheckSquare className="w-8 h-8" />
              </div>
              <h3 
                className="text-xl font-bold mb-2 text-[#39FF14] font-orbitron transform-gpu transition-all duration-300 hover:scale-105"
                style={{
                  textShadow: '0 0 15px #39FF14, 0 0 30px #39FF14, 0 6px 12px rgba(0, 0, 0, 0.5)',
                  transform: 'translateZ(10px)',
                  transformStyle: 'preserve-3d',
                  filter: 'drop-shadow(0 8px 15px rgba(57, 255, 20, 0.3))'
                }}
              >
                Citation Monitoring
              </h3>
              <p className="text-gray-300">Track how often your content is cited by AI engines. Monitor your brand mentions and see which competitors are being referenced more frequently.</p>
            </div>
            <div className="border border-[#1E2329] bg-[#1E2329] rounded-lg p-6 hover:border-[#39FF14] transition-all">
              <div className="text-[#39FF14] text-3xl mb-4">
                <Globe className="w-8 h-8" />
              </div>
              <h3 
                className="text-xl font-bold mb-2 text-[#39FF14] font-orbitron transform-gpu transition-all duration-300 hover:scale-105"
                style={{
                  textShadow: '0 0 15px #39FF14, 0 0 30px #39FF14, 0 6px 12px rgba(0, 0, 0, 0.5)',
                  transform: 'translateZ(10px)',
                  transformStyle: 'preserve-3d',
                  filter: 'drop-shadow(0 8px 15px rgba(57, 255, 20, 0.3))'
                }}
              >
                Domain Analytics
              </h3>
              <p className="text-gray-300">Comprehensive domain analysis including keyword tracking, backlink analysis, and competitive intelligence specifically designed for the AI search era.</p>
            </div>
            <div className="border border-[#1E2329] bg-[#1E2329] rounded-lg p-6 hover:border-[#39FF14] transition-all">
              <div className="text-[#39FF14] text-3xl mb-4">
                <Target className="w-8 h-8" />
              </div>
              <h3 
                className="text-xl font-bold mb-2 text-[#39FF14] font-orbitron transform-gpu transition-all duration-300 hover:scale-105"
                style={{
                  textShadow: '0 0 15px #39FF14, 0 0 30px #39FF14, 0 6px 12px rgba(0, 0, 0, 0.5)',
                  transform: 'translateZ(10px)',
                  transformStyle: 'preserve-3d',
                  filter: 'drop-shadow(0 8px 15px rgba(57, 255, 20, 0.3))'
                }}
              >
                Schema Optimization
              </h3>
              <p className="text-gray-300">Automatically generate and optimize structured data markup to help AI engines better understand and index your content for improved visibility.</p>
            </div>
          </div>
        </section>

        {/* Pricing Section */}
        <section id="pricing" className="mb-12">
          <h2 
            className="text-3xl font-bold mb-8 text-center text-[#39FF14] font-orbitron transform-gpu transition-all duration-300 hover:scale-105"
            style={{
              textShadow: '0 0 20px #39FF14, 0 0 40px #39FF14, 0 8px 16px rgba(0, 0, 0, 0.5)',
              transform: 'translateZ(15px)',
              transformStyle: 'preserve-3d',
              filter: 'drop-shadow(0 10px 20px rgba(57, 255, 20, 0.3))'
            }}
          >
            Choose Your Plan
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Starter Plan */}
            <div className="border border-[#1E2329] bg-[#1E2329] rounded-lg p-6 hover:border-[#39FF14] transition-all">
              <div className="text-center mb-6">
                <h3 
                  className="text-xl font-bold mb-2 text-[#39FF14] font-orbitron transform-gpu transition-all duration-300 hover:scale-105"
                  style={{
                    textShadow: '0 0 15px #39FF14, 0 0 30px #39FF14, 0 6px 12px rgba(0, 0, 0, 0.5)',
                    transform: 'translateZ(10px)',
                    transformStyle: 'preserve-3d',
                    filter: 'drop-shadow(0 8px 15px rgba(57, 255, 20, 0.3))'
                  }}
                >
                  Starter
                </h3>
                <div className="text-3xl font-bold text-[#39FF14] mb-2">$29<span className="text-lg text-gray-400">/month</span></div>
                <p className="text-gray-400">Perfect for small businesses</p>
              </div>
              <ul className="space-y-3 mb-6">
                <li className="flex items-center"><CheckCircle className="w-4 h-4 text-[#39FF14] mr-2" /> 5 Domain analyses per month</li>
                <li className="flex items-center"><CheckCircle className="w-4 h-4 text-[#39FF14] mr-2" /> Basic SEO reports</li>
                <li className="flex items-center"><CheckCircle className="w-4 h-4 text-[#39FF14] mr-2" /> AI visibility scoring</li>
                <li className="flex items-center"><CheckCircle className="w-4 h-4 text-[#39FF14] mr-2" /> Email support</li>
              </ul>
              <Button 
                size="cta"
                variant="outline"
                onClick={() => navigate('/upgrade')}
                className="w-full border-[#39FF14] text-[#39FF14] hover:bg-[#39FF14] hover:text-[#0D1117]"
              >
                Start Free Trial
              </Button>
            </div>

            {/* Professional Plan */}
            <div className="border-2 border-[#39FF14] bg-[#1E2329] rounded-lg p-6 relative" style={{boxShadow: '0 0 10px #39FF14'}}>
              <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                <span className="bg-[#39FF14] text-[#0D1117] px-3 py-1 rounded-full text-sm font-bold">Most Popular</span>
              </div>
              <div className="text-center mb-6">
                <h3 
                  className="text-xl font-bold mb-2 text-[#39FF14] font-orbitron transform-gpu transition-all duration-300 hover:scale-105"
                  style={{
                    textShadow: '0 0 15px #39FF14, 0 0 30px #39FF14, 0 6px 12px rgba(0, 0, 0, 0.5)',
                    transform: 'translateZ(10px)',
                    transformStyle: 'preserve-3d',
                    filter: 'drop-shadow(0 8px 15px rgba(57, 255, 20, 0.3))'
                  }}
                >
                  Professional
                </h3>
                <div className="text-3xl font-bold text-[#39FF14] mb-2">$79<span className="text-lg text-gray-400">/month</span></div>
                <p className="text-gray-400">For growing businesses</p>
              </div>
              <ul className="space-y-3 mb-6">
                <li className="flex items-center"><CheckCircle className="w-4 h-4 text-[#39FF14] mr-2" /> 25 Domain analyses per month</li>
                <li className="flex items-center"><CheckCircle className="w-4 h-4 text-[#39FF14] mr-2" /> Advanced SEO & AI reports</li>
                <li className="flex items-center"><CheckCircle className="w-4 h-4 text-[#39FF14] mr-2" /> Citation monitoring</li>
                <li className="flex items-center"><CheckCircle className="w-4 h-4 text-[#39FF14] mr-2" /> Content generator (unlimited)</li>
                <li className="flex items-center"><CheckCircle className="w-4 h-4 text-[#39FF14] mr-2" /> Priority support</li>
              </ul>
              <Button 
                size="cta"
                onClick={() => navigate('/upgrade')}
                className="w-full bg-[#39FF14] text-[#0D1117] font-bold hover:bg-[#39FF14]/90" 
                style={{boxShadow: '0 0 5px #39FF14'}}
              >
                Start Free Trial
              </Button>
            </div>

            {/* Enterprise Plan */}
            <div className="border border-[#1E2329] bg-[#1E2329] rounded-lg p-6 hover:border-[#39FF14] transition-all">
              <div className="text-center mb-6">
                <h3 
                  className="text-xl font-bold mb-2 text-[#39FF14] font-orbitron transform-gpu transition-all duration-300 hover:scale-105"
                  style={{
                    textShadow: '0 0 15px #39FF14, 0 0 30px #39FF14, 0 6px 12px rgba(0, 0, 0, 0.5)',
                    transform: 'translateZ(10px)',
                    transformStyle: 'preserve-3d',
                    filter: 'drop-shadow(0 8px 15px rgba(57, 255, 20, 0.3))'
                  }}
                >
                  Enterprise
                </h3>
                <div className="text-3xl font-bold text-[#39FF14] mb-2">$199<span className="text-lg text-gray-400">/month</span></div>
                <p className="text-gray-400">For large organizations</p>
              </div>
              <ul className="space-y-3 mb-6">
                <li className="flex items-center"><CheckCircle className="w-4 h-4 text-[#39FF14] mr-2" /> Unlimited domain analyses</li>
                <li className="flex items-center"><CheckCircle className="w-4 h-4 text-[#39FF14] mr-2" /> White-label reports</li>
                <li className="flex items-center"><CheckCircle className="w-4 h-4 text-[#39FF14] mr-2" /> API access</li>
                <li className="flex items-center"><CheckCircle className="w-4 h-4 text-[#39FF14] mr-2" /> Team collaboration tools</li>
                <li className="flex items-center"><CheckCircle className="w-4 h-4 text-[#39FF14] mr-2" /> Dedicated account manager</li>
              </ul>
              <Button size="cta" variant="outline" className="w-full border-[#39FF14] text-[#39FF14] hover:bg-[#39FF14] hover:text-[#0D1117]">
                Contact Sales
              </Button>
            </div>
          </div>
        </section>

        {/* Content Optimizer Tool */}
        <section className="mb-12">
          <h2 
            className="text-2xl font-bold mb-6 text-[#39FF14] font-orbitron transform-gpu transition-all duration-300 hover:scale-105"
            style={{
              textShadow: '0 0 20px #39FF14, 0 0 40px #39FF14, 0 8px 16px rgba(0, 0, 0, 0.5)',
              transform: 'translateZ(15px)',
              transformStyle: 'preserve-3d',
              filter: 'drop-shadow(0 10px 20px rgba(57, 255, 20, 0.3))'
            }}
          >
            Content Optimizer
          </h2>
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
                    disabled={!contentInput.trim() || isAnalyzing}
                    className="px-4 py-2 bg-[#39FF14] text-[#0D1117] font-bold rounded-lg transition-all disabled:opacity-50"
                    style={{boxShadow: '0 0 5px #39FF14, 0 0 10px #39FF14'}}
                  >
                    {isAnalyzing ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-2 border-[#0D1117] border-t-transparent inline-block mr-2"></div>
                        Analyzing...
                      </>
                    ) : (
                      "Analyze Content"
                    )}
                  </button>
                </div>
              </div>
            </div>
            
            <div className="border border-[#1E2329] rounded-lg overflow-hidden">
              <div className="bg-[#1E2329] p-4 flex justify-between items-center">
                <h3 className="font-bold">AI Analysis Results</h3>
                {analysis && (
                  <div className={`text-2xl font-bold ${getScoreColor(analysis.score)}`}>
                    {analysis.score}/100
                  </div>
                )}
              </div>
              <div className="p-4 h-[340px] overflow-y-auto">
                {analysis ? (
                  <div className="space-y-4">
                    {/* Score Display */}
                    <div className="text-center mb-4">
                      <div className={`text-3xl font-bold ${getScoreColor(analysis.score)}`}>
                        {analysis.score}/100
                      </div>
                      <div className={`text-lg ${getScoreColor(analysis.score)}`}>
                        {getScoreLabel(analysis.score)}
                      </div>
                    </div>

                    {/* Basic Stats */}
                    <div className="mb-4 p-3 bg-[#1E2329] rounded">
                      <h4 className="font-bold text-[#39FF14] mb-2">Content Stats</h4>
                      <div className="grid grid-cols-2 gap-2 text-sm text-gray-300">
                        <div>Words: {analysis.basicStats.wordCount}</div>
                        <div>Sentences: {analysis.basicStats.sentences}</div>
                        <div className="flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          <span>Reading time: {analysis.basicStats.readingTime} min</span>
                        </div>
                        <div>
                          Readability: {Math.round(analysis.basicStats.readabilityScore)}%
                        </div>
                      </div>
                    </div>

                    {/* AI Optimization Checks */}
                    <div className="mb-4 p-3 bg-[#1E2329] rounded">
                      <h4 className="font-bold text-[#39FF14] mb-2">AI Optimization Checklist</h4>
                      <div className="space-y-1 text-sm">
                        <div className="flex items-center gap-2">
                          {analysis.aiOptimization.hasHeadings ? (
                            <CheckCircle className="w-4 h-4 text-[#39FF14]" />
                          ) : (
                            <div className="w-4 h-4 rounded-full border border-gray-500"></div>
                          )}
                          <span className={analysis.aiOptimization.hasHeadings ? 'text-[#39FF14]' : 'text-gray-400'}>
                            Clear headings structure
                          </span>
                        </div>
                        <div className="flex items-center gap-2">
                          {analysis.aiOptimization.hasCitations ? (
                            <CheckCircle className="w-4 h-4 text-[#39FF14]" />
                          ) : (
                            <div className="w-4 h-4 rounded-full border border-gray-500"></div>
                          )}
                          <span className={analysis.aiOptimization.hasCitations ? 'text-[#39FF14]' : 'text-gray-400'}>
                            Source citations included
                          </span>
                        </div>
                        <div className="flex items-center gap-2">
                          {analysis.aiOptimization.hasLinks ? (
                            <CheckCircle className="w-4 h-4 text-[#39FF14]" />
                          ) : (
                            <div className="w-4 h-4 rounded-full border border-gray-500"></div>
                          )}
                          <span className={analysis.aiOptimization.hasLinks ? 'text-[#39FF14]' : 'text-gray-400'}>
                            External links present
                          </span>
                        </div>
                        <div className="flex items-center gap-2">
                          {analysis.aiOptimization.isWellStructured ? (
                            <CheckCircle className="w-4 h-4 text-[#39FF14]" />
                          ) : (
                            <div className="w-4 h-4 rounded-full border border-gray-500"></div>
                          )}
                          <span className={analysis.aiOptimization.isWellStructured ? 'text-[#39FF14]' : 'text-gray-400'}>
                            Well-structured content
                          </span>
                        </div>
                        <div className="flex items-center gap-2">
                          {analysis.aiOptimization.readabilityGood ? (
                            <CheckCircle className="w-4 h-4 text-[#39FF14]" />
                          ) : (
                            <div className="w-4 h-4 rounded-full border border-gray-500"></div>
                          )}
                          <span className={analysis.aiOptimization.readabilityGood ? 'text-[#39FF14]' : 'text-gray-400'}>
                            Good readability
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Recommendations */}
                    <div className="mb-4 p-3 bg-[#1E2329] rounded">
                      <h4 className="font-bold text-[#39FF14] mb-2">Recommendations</h4>
                      <ul className="space-y-1 text-sm text-gray-300">
                        {analysis.recommendations.map((rec: string, index: number) => (
                          <li key={index}>• {rec}</li>
                        ))}
                      </ul>
                    </div>
                  </div>
                ) : (
                  <div className="text-center text-gray-400 py-12">
                    <Bot className="w-16 h-16 mx-auto mb-4 text-gray-500" />
                    <p>Enter your content and click "Analyze Content" to see AI optimization suggestions</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </section>

        {/* AI Visibility Metrics */}
        <section className="mb-12">
          <h2 
            className="text-2xl font-bold mb-6 text-[#39FF14] font-orbitron transform-gpu transition-all duration-300 hover:scale-105"
            style={{
              textShadow: '0 0 20px #39FF14, 0 0 40px #39FF14, 0 8px 16px rgba(0, 0, 0, 0.5)',
              transform: 'translateZ(15px)',
              transformStyle: 'preserve-3d',
              filter: 'drop-shadow(0 10px 20px rgba(57, 255, 20, 0.3))'
            }}
          >
            AI Visibility Metrics
          </h2>
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
          <h2 
            className="text-2xl font-bold mb-6 text-[#39FF14] font-orbitron transform-gpu transition-all duration-300 hover:scale-105"
            style={{
              textShadow: '0 0 20px #39FF14, 0 0 40px #39FF14, 0 8px 16px rgba(0, 0, 0, 0.5)',
              transform: 'translateZ(15px)',
              transformStyle: 'preserve-3d',
              filter: 'drop-shadow(0 10px 20px rgba(57, 255, 20, 0.3))'
            }}
          >
            AI Visibility Best Practices
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="flex">
              <div className="text-[#39FF14] text-2xl mr-4">
                <CheckCircle className="w-6 h-6" />
              </div>
              <div>
                <h3 
                  className="text-lg font-bold mb-2 text-[#39FF14] font-orbitron transform-gpu transition-all duration-300 hover:scale-105"
                  style={{
                    textShadow: '0 0 10px #39FF14, 0 0 20px #39FF14, 0 4px 8px rgba(0, 0, 0, 0.5)',
                    transform: 'translateZ(8px)',
                    transformStyle: 'preserve-3d',
                    filter: 'drop-shadow(0 6px 12px rgba(57, 255, 20, 0.3))'
                  }}
                >
                  Structure Content with Clear Headings
                </h3>
                <p className="text-gray-300">Use descriptive H2 and H3 headings that directly address user questions. AI systems use headings to understand content hierarchy and identify key information.</p>
              </div>
            </div>
            <div className="flex">
              <div className="text-[#39FF14] text-2xl mr-4">
                <CheckCircle className="w-6 h-6" />
              </div>
              <div>
                <h3 
                  className="text-lg font-bold mb-2 text-[#39FF14] font-orbitron transform-gpu transition-all duration-300 hover:scale-105"
                  style={{
                    textShadow: '0 0 10px #39FF14, 0 0 20px #39FF14, 0 4px 8px rgba(0, 0, 0, 0.5)',
                    transform: 'translateZ(8px)',
                    transformStyle: 'preserve-3d',
                    filter: 'drop-shadow(0 6px 12px rgba(57, 255, 20, 0.3))'
                  }}
                >
                  Include Concise Definitions
                </h3>
                <p className="text-gray-300">Provide clear, direct definitions of key terms and concepts. AI engines often extract these definitions to answer "what is" type queries.</p>
              </div>
            </div>
            <div className="flex">
              <div className="text-[#39FF14] text-2xl mr-4">
                <CheckCircle className="w-6 h-6" />
              </div>
              <div>
                <h3 
                  className="text-lg font-bold mb-2 text-[#39FF14] font-orbitron transform-gpu transition-all duration-300 hover:scale-105"
                  style={{
                    textShadow: '0 0 10px #39FF14, 0 0 20px #39FF14, 0 4px 8px rgba(0, 0, 0, 0.5)',
                    transform: 'translateZ(8px)',
                    transformStyle: 'preserve-3d',
                    filter: 'drop-shadow(0 6px 12px rgba(57, 255, 20, 0.3))'
                  }}
                >
                  Implement FAQ Schema Markup
                </h3>
                <p className="text-gray-300">Add structured data to your content using FAQ schema. This helps AI systems identify and extract questions and answers from your content.</p>
              </div>
            </div>
            <div className="flex">
              <div className="text-[#39FF14] text-2xl mr-4">
                <CheckCircle className="w-6 h-6" />
              </div>
              <div>
                <h3 
                  className="text-lg font-bold mb-2 text-[#39FF14] font-orbitron transform-gpu transition-all duration-300 hover:scale-105"
                  style={{
                    textShadow: '0 0 10px #39FF14, 0 0 20px #39FF14, 0 4px 8px rgba(0, 0, 0, 0.5)',
                    transform: 'translateZ(8px)',
                    transformStyle: 'preserve-3d',
                    filter: 'drop-shadow(0 6px 12px rgba(57, 255, 20, 0.3))'
                  }}
                >
                  Provide Factual, Verifiable Information
                </h3>
                <p className="text-gray-300">AI systems prioritize factual content with verifiable data. Include statistics, research findings, and citations to increase your content's authority.</p>
              </div>
            </div>
          </div>
        </section>

        {/* Newsletter Signup */}
        <section className="mb-12">
          <NewsletterSignup />
        </section>

        {/* Social Proof */}
        <SocialProofSection />

        {/* Testimonials */}
        <TestimonialSection />

        {/* How It Works */}
        <HowItWorksSection />

        {/* Feature Comparison */}
        <FeatureComparisonSection />

        {/* Trust Section */}
        <TrustSection />

        {/* Final CTA Section */}
        <section className="mb-12">
          <div className="neon-border rounded-lg p-8 text-center">
            <h2 
              className="text-3xl font-bold mb-4 text-[#39FF14] font-orbitron transform-gpu transition-all duration-300 hover:scale-105"
              style={{
                textShadow: '0 0 20px #39FF14, 0 0 40px #39FF14, 0 8px 16px rgba(0, 0, 0, 0.5)',
                transform: 'translateZ(15px)',
                transformStyle: 'preserve-3d',
                filter: 'drop-shadow(0 10px 20px rgba(57, 255, 20, 0.3))'
              }}
            >
              Ready to Dominate AI Search Results?
            </h2>
            <p className="text-lg mb-6 max-w-2xl mx-auto text-muted-foreground">
              Join 1000+ businesses already winning with AI-optimized content. Start your free trial today.
            </p>
            <div className="flex flex-col sm:flex-row justify-center gap-4">
              <Button 
                onClick={() => navigate('/upgrade')}
                className="px-8 py-3 bg-[#39FF14] text-[#0D1117] font-semibold rounded-lg hover:bg-[#39FF14]/90 transition-all"
                style={{boxShadow: '0 0 10px #39FF14'}}
              >
                Start Free Trial
              </Button>
              <LeadCaptureModal 
                triggerText="Schedule Demo"
                title="Book Your Demo"
                description="See how GenerativeSearch.pro works for your business"
                type="demo"
              />
            </div>
            <p className="text-sm text-muted-foreground mt-4">
              Free trial • No credit card required • Setup in minutes
            </p>
          </div>
        </section>
      </main>
      
      <Footer />
    </div>
  );
};

export default Index;
