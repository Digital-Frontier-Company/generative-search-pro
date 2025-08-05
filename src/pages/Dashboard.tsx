import { useAuth } from "@/contexts/AuthContext";
import { useSubscription } from "@/contexts/SubscriptionContext";
import { useDomain } from "@/contexts/DomainContext";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { FileText, Search, BarChart3, CheckSquare, Map, BookOpen, Microscope, Settings, Bell, Download, ArrowUp, Quote, TrendingUp, Target, AlertTriangle, Wrench, Users, PieChart, Code, Gem } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";

const Dashboard = () => {
  const { user } = useAuth();
  const { subscribed, isTrialActive } = useSubscription();
  const { defaultDomain } = useDomain();
  const navigate = useNavigate();

  const handleToolClick = (path: string, usesDomain: boolean = false) => {
    if (usesDomain && !defaultDomain) {
      toast.error('Please set a default domain first to use this tool!');
      return;
    }
    navigate(path, { state: { domain: defaultDomain } });
  };

  return (
    <div className="bg-gradient-to-br from-[#0F1B3A] via-[#1E2A4A] to-[#2A4A3A] text-white font-sans min-h-screen">
      <div className="flex h-screen overflow-hidden">
        {/* Sidebar */}
        <div className="w-64 bg-gradient-to-b from-black/30 to-black/20 backdrop-blur-lg border-r border-white/10 flex flex-col">
          <div className="p-4 border-b border-gray-800">
            <div className="flex items-center justify-center">
              <div className="relative">
                <div className="text-[#00E047] text-4xl font-bold relative">
                  <div className="absolute -inset-1 bg-[#00E047] opacity-20 rounded-lg blur-xl"></div>
                  <div className="relative flex items-center">
                    <div className="bg-[#00E047]/10 border-2 border-[#00E047] rounded-lg w-12 h-12 flex items-center justify-center mr-2">
                      <span className="text-[#00E047] text-2xl">G</span>
                    </div>
                    <div>
                      <div className="text-[#00E047] text-xl leading-none">Generative</div>
                      <div className="text-white text-xl leading-none">Search.pro</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            <div className="text-xs text-center text-gray-400 mt-1">Generative Engine Optimization</div>
          </div>
          
          <nav className="flex-1 py-4 overflow-y-auto">
            <div className="px-4 mb-3 text-xs font-semibold text-gray-400 uppercase">Main</div>
            <div className="flex items-center px-4 py-2.5 text-sm bg-[#00E047]/10 text-[#00E047] border-l-4 border-[#00E047] cursor-pointer">
              <BarChart3 className="w-5 h-5 mr-3" />
              <span>Dashboard</span>
            </div>
            <div 
              className="flex items-center px-4 py-2.5 text-sm text-gray-300 hover:bg-gray-800 cursor-pointer"
              onClick={() => handleToolClick('/analysis', true)}
            >
              <Search className="w-5 h-5 mr-3" />
              <span>AI Visibility</span>
            </div>
            <div 
              className="flex items-center px-4 py-2.5 text-sm text-gray-300 hover:bg-gray-800 cursor-pointer"
              onClick={() => handleToolClick('/tso-dashboard')}
            >
              <Target className="w-5 h-5 mr-3" />
              <span>Zero-Click Strategy</span>
            </div>
            <div 
              className="flex items-center px-4 py-2.5 text-sm text-gray-300 hover:bg-gray-800 cursor-pointer"
              onClick={() => handleToolClick('/tso-dashboard')}
            >
              <Code className="w-5 h-5 mr-3" />
              <span>Technical Optimization</span>
            </div>
            
            <div className="px-4 my-3 text-xs font-semibold text-gray-400 uppercase">Analytics</div>
            <div 
              className="flex items-center px-4 py-2.5 text-sm text-gray-300 hover:bg-gray-800 cursor-pointer"
              onClick={() => handleToolClick('/analysis', true)}
            >
              <PieChart className="w-5 h-5 mr-3" />
              <span>Performance Metrics</span>
            </div>
            <div 
              className="flex items-center px-4 py-2.5 text-sm text-gray-300 hover:bg-gray-800 cursor-pointer"
              onClick={() => handleToolClick('/analysis', true)}
            >
              <Users className="w-5 h-5 mr-3" />
              <span>Engagement Analytics</span>
            </div>
            <div 
              className="flex items-center px-4 py-2.5 text-sm text-gray-300 hover:bg-gray-800 cursor-pointer"
              onClick={() => handleToolClick('/analysis', true)}
            >
              <TrendingUp className="w-5 h-5 mr-3" />
              <span>Competitive Analysis</span>
            </div>
            
            <div className="px-4 my-3 text-xs font-semibold text-gray-400 uppercase">Tools</div>
            <div 
              className="flex items-center px-4 py-2.5 text-sm text-gray-300 hover:bg-gray-800 cursor-pointer"
              onClick={() => handleToolClick('/generator')}
            >
              <Wrench className="w-5 h-5 mr-3" />
              <span>Implementation Tools</span>
            </div>
            <div 
              className="flex items-center px-4 py-2.5 text-sm text-gray-300 hover:bg-gray-800 cursor-pointer"
              onClick={() => handleToolClick('/settings')}
            >
              <Settings className="w-5 h-5 mr-3" />
              <span>Settings</span>
            </div>
          </nav>
          
          <div className="p-4 border-t border-gray-800">
            <div className="flex items-center">
              <div className="w-8 h-8 rounded-full bg-[#00E047]/20 flex items-center justify-center mr-2">
                <span className="text-[#00E047] text-sm font-bold">
                  {user?.user_metadata?.full_name?.[0] || user?.email?.[0] || 'U'}
                </span>
              </div>
              <div>
                <div className="text-sm font-medium">
                  {user?.user_metadata?.full_name || user?.email?.split('@')[0] || 'User'}
                </div>
                <div className="text-xs text-gray-400">SEO Specialist</div>
              </div>
            </div>
          </div>
        </div>
        
        {/* Main Content */}
        <div className="flex-1 overflow-y-auto">
          {/* Header */}
          <header className="bg-gradient-to-r from-black/20 to-black/10 backdrop-blur-lg border-b border-white/10 py-4 px-6 sticky top-0 z-10">
            <div className="flex justify-between items-center">
              <div>
                <h1 className="text-xl font-semibold">Generative Search Pro Dashboard</h1>
                <p className="text-sm text-gray-400">AI Visibility Overview & Optimization Tools</p>
              </div>
              <div className="flex items-center space-x-4">
                <Button className="bg-gray-800 hover:bg-gray-700 text-white px-4 py-2 rounded-lg text-sm flex items-center">
                  <Download className="w-4 h-4 mr-2" />
                  Export Report
                </Button>
                <div className="relative">
                  <Button className="bg-gray-800 hover:bg-gray-700 p-2 rounded-full">
                    <Bell className="w-4 h-4 text-gray-300" />
                    <span className="absolute top-0 right-0 w-2 h-2 bg-[#00E047] rounded-full"></span>
                  </Button>
                </div>
              </div>
            </div>
          </header>
          
          {/* Dashboard Content */}
          <div className="p-6">
            {/* AI Visibility Score Section */}
            <div className="mb-6">
              <div className="bg-gradient-to-br from-black/40 via-black/30 to-black/20 backdrop-blur-sm border border-white/10 rounded-xl p-6">
                <div className="flex items-center justify-between mb-6">
                  <div>
                    <h2 className="text-2xl font-bold mb-2">AI Visibility Score</h2>
                    <p className="text-gray-400">Track your presence across AI-powered search platforms</p>
                  </div>
                  <div className="text-right">
                    <div className="text-4xl font-bold text-[#00E047] mb-1">86<span className="text-2xl text-gray-400">/100</span></div>
                    <div className="text-[#00C853] text-sm flex items-center justify-end">
                      <ArrowUp className="w-4 h-4 mr-1" />
                      12% improvement this month
                    </div>
                  </div>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  <div className="bg-gradient-to-br from-black/50 via-black/40 to-black/30 backdrop-blur-sm border border-white/10 rounded-lg p-4">
                    <div className="flex items-center mb-2">
                      <div className="bg-[#00E047]/10 p-2 rounded-lg mr-3">
                        <Search className="w-4 h-4 text-[#00E047]" />
                      </div>
                      <div>
                        <div className="text-sm text-gray-400">ChatGPT</div>
                        <div className="font-semibold">92%</div>
                      </div>
                    </div>
                  </div>
                  
                  <div className="bg-gradient-to-br from-black/50 via-black/40 to-black/30 backdrop-blur-sm border border-white/10 rounded-lg p-4">
                    <div className="flex items-center mb-2">
                      <div className="bg-[#2196F3]/10 p-2 rounded-lg mr-3">
                        <Search className="w-4 h-4 text-[#2196F3]" />
                      </div>
                      <div>
                        <div className="text-sm text-gray-400">Perplexity</div>
                        <div className="font-semibold">85%</div>
                      </div>
                    </div>
                  </div>
                  
                  <div className="bg-gradient-to-br from-black/50 via-black/40 to-black/30 backdrop-blur-sm border border-white/10 rounded-lg p-4">
                    <div className="flex items-center mb-2">
                      <div className="bg-[#FFB300]/10 p-2 rounded-lg mr-3">
                        <Search className="w-4 h-4 text-[#FFB300]" />
                      </div>
                      <div>
                        <div className="text-sm text-gray-400">Google AI</div>
                        <div className="font-semibold">78%</div>
                      </div>
                    </div>
                  </div>
                  
                  <div className="bg-gradient-to-br from-black/50 via-black/40 to-black/30 backdrop-blur-sm border border-white/10 rounded-lg p-4">
                    <div className="flex items-center mb-2">
                      <div className="bg-[#FF3D00]/10 p-2 rounded-lg mr-3">
                        <Gem className="w-4 h-4 text-[#FF3D00]" />
                      </div>
                      <div>
                        <div className="text-sm text-gray-400">Gemini</div>
                        <div className="font-semibold">81%</div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            
            {/* Citation Monitoring Section */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
              <div className="bg-gradient-to-br from-black/40 via-black/30 to-black/20 backdrop-blur-sm border border-white/10 rounded-xl p-5">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-semibold text-lg">Citation Monitoring</h3>
                  <Button 
                    className="bg-gray-800 hover:bg-gray-700 px-3 py-1 rounded-lg text-xs"
                    onClick={() => handleToolClick('/citation-checker', true)}
                  >
                    View All
                  </Button>
                </div>
                
                <div className="space-y-4">
                  <div className="flex items-start p-3 bg-gradient-to-r from-black/50 to-black/30 backdrop-blur-sm rounded-lg border border-white/10">
                    <div className="bg-[#00C853]/10 p-2 rounded-lg mr-3">
                      <Quote className="w-4 h-4 text-[#00C853]" />
                    </div>
                    <div className="flex-1">
                      <h4 className="font-medium text-sm">Latest Citation</h4>
                      <p className="text-xs text-gray-400 mb-1">Mentioned in ChatGPT response about "AI SEO strategies"</p>
                      <div className="flex items-center text-xs text-gray-500">
                        <span>2 hours ago</span>
                        <span className="mx-2">•</span>
                        <span className="text-[#00C853]">High relevance</span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-start p-3 bg-gradient-to-r from-black/50 to-black/30 backdrop-blur-sm rounded-lg border border-white/10">
                    <div className="bg-[#2196F3]/10 p-2 rounded-lg mr-3">
                      <Quote className="w-4 h-4 text-[#2196F3]" />
                    </div>
                    <div className="flex-1">
                      <h4 className="font-medium text-sm">Source Attribution</h4>
                      <p className="text-xs text-gray-400 mb-1">Referenced in Perplexity for "zero-click optimization"</p>
                      <div className="flex items-center text-xs text-gray-500">
                        <span>5 hours ago</span>
                        <span className="mx-2">•</span>
                        <span className="text-[#2196F3]">Medium relevance</span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-start p-3 bg-gradient-to-r from-black/50 to-black/30 backdrop-blur-sm rounded-lg border border-white/10">
                    <div className="bg-[#FFB300]/10 p-2 rounded-lg mr-3">
                      <Quote className="w-4 h-4 text-[#FFB300]" />
                    </div>
                    <div className="flex-1">
                      <h4 className="font-medium text-sm">Brand Mention</h4>
                      <p className="text-xs text-gray-400 mb-1">Featured in Google AI Overview for "GEO tools"</p>
                      <div className="flex items-center text-xs text-gray-500">
                        <span>1 day ago</span>
                        <span className="mx-2">•</span>
                        <span className="text-[#FFB300]">High impact</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="bg-gradient-to-br from-black/40 via-black/30 to-black/20 backdrop-blur-sm border border-white/10 rounded-xl p-5">
                <h3 className="font-semibold text-lg mb-4">AI Visibility Tools</h3>
                
                <div className="space-y-3">
                  <div 
                    className="flex items-center justify-between p-3 bg-gradient-to-r from-black/50 to-black/30 backdrop-blur-sm rounded-lg border border-white/10 cursor-pointer hover:bg-gradient-to-r hover:from-black/60 hover:to-black/40"
                    onClick={() => handleToolClick('/analysis', true)}
                  >
                    <div className="flex items-center">
                      <div className="bg-[#00E047]/10 p-2 rounded-lg mr-3">
                        <BarChart3 className="w-4 h-4 text-[#00E047]" />
                      </div>
                      <div>
                        <h4 className="font-medium text-sm">SEO Analysis Hub</h4>
                        <p className="text-xs text-gray-400">AI visibility tracking platform</p>
                      </div>
                    </div>
                    <Button className="bg-[#00E047] hover:bg-[#00E047]/80 text-black px-3 py-1 rounded-lg text-xs font-medium">Connect</Button>
                  </div>
                  
                  <div 
                    className="flex items-center justify-between p-3 bg-gradient-to-r from-black/50 to-black/30 backdrop-blur-sm rounded-lg border border-white/10 cursor-pointer hover:bg-gradient-to-r hover:from-black/60 hover:to-black/40"
                    onClick={() => handleToolClick('/citation-checker', true)}
                  >
                    <div className="flex items-center">
                      <div className="bg-[#2196F3]/10 p-2 rounded-lg mr-3">
                        <CheckSquare className="w-4 h-4 text-[#2196F3]" />
                      </div>
                      <div>
                        <h4 className="font-medium text-sm">Citation Checker</h4>
                        <p className="text-xs text-gray-400">Competitive analysis tool</p>
                      </div>
                    </div>
                    <Button className="bg-gray-700 hover:bg-gray-600 text-white px-3 py-1 rounded-lg text-xs">Setup</Button>
                  </div>
                  
                  <div 
                    className="flex items-center justify-between p-3 bg-gradient-to-r from-black/50 to-black/30 backdrop-blur-sm rounded-lg border border-white/10 cursor-pointer hover:bg-gradient-to-r hover:from-black/60 hover:to-black/40"
                    onClick={() => handleToolClick('/generator')}
                  >
                    <div className="flex items-center">
                      <div className="bg-[#FFB300]/10 p-2 rounded-lg mr-3">
                        <FileText className="w-4 h-4 text-[#FFB300]" />
                      </div>
                      <div>
                        <h4 className="font-medium text-sm">Content Generator</h4>
                        <p className="text-xs text-gray-400">DIY content creation</p>
                      </div>
                    </div>
                    <Button className="bg-gray-700 hover:bg-gray-600 text-white px-3 py-1 rounded-lg text-xs">Configure</Button>
                  </div>
                </div>
              </div>
            </div>
            
            {/* Implementation Priorities */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
              <div className="bg-gradient-to-br from-black/40 via-black/30 to-black/20 backdrop-blur-sm border border-white/10 rounded-xl p-5 col-span-2">
                <h3 className="font-semibold mb-4">Implementation Priorities</h3>
                
                <div className="space-y-4">
                  <div>
                    <div className="flex justify-between mb-1">
                      <span className="text-sm">AI Visibility Infrastructure</span>
                      <span className="text-sm text-[#00E047]">95/100</span>
                    </div>
                    <div className="w-full bg-gray-700 rounded-full h-2">
                      <div className="bg-[#00E047] h-2 rounded-full" style={{width: '95%'}}></div>
                    </div>
                  </div>
                  
                  <div>
                    <div className="flex justify-between mb-1">
                      <span className="text-sm">Zero-Click Content Optimization</span>
                      <span className="text-sm text-[#00E047]">92/100</span>
                    </div>
                    <div className="w-full bg-gray-700 rounded-full h-2">
                      <div className="bg-[#00E047] h-2 rounded-full" style={{width: '92%'}}></div>
                    </div>
                  </div>
                  
                  <div>
                    <div className="flex justify-between mb-1">
                      <span className="text-sm">Technical AI Readiness</span>
                      <span className="text-sm text-[#2196F3]">90/100</span>
                    </div>
                    <div className="w-full bg-gray-700 rounded-full h-2">
                      <div className="bg-[#2196F3] h-2 rounded-full" style={{width: '90%'}}></div>
                    </div>
                  </div>
                  
                  <div>
                    <div className="flex justify-between mb-1">
                      <span className="text-sm">Intent-Driven Content Creation</span>
                      <span className="text-sm text-[#2196F3]">88/100</span>
                    </div>
                    <div className="w-full bg-gray-700 rounded-full h-2">
                      <div className="bg-[#2196F3] h-2 rounded-full" style={{width: '88%'}}></div>
                    </div>
                  </div>
                  
                  <div>
                    <div className="flex justify-between mb-1">
                      <span className="text-sm">Authority Signal Amplification</span>
                      <span className="text-sm text-[#2196F3]">85/100</span>
                    </div>
                    <div className="w-full bg-gray-700 rounded-full h-2">
                      <div className="bg-[#2196F3] h-2 rounded-full" style={{width: '85%'}}></div>
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="bg-gradient-to-br from-black/40 via-black/30 to-black/20 backdrop-blur-sm border border-white/10 rounded-xl p-5">
                <h3 className="font-semibold mb-4">Business-Type Adaptation</h3>
                <div className="flex items-center justify-between mb-4">
                  <select className="bg-gray-800 border border-gray-700 text-white rounded-lg px-3 py-2 text-sm w-full">
                    <option>B2B SaaS Companies</option>
                    <option>E-commerce Businesses</option>
                    <option>Local Service Businesses</option>
                  </select>
                </div>
                
                <div className="h-48 mb-4 bg-gradient-to-br from-black/50 to-black/30 rounded-lg flex items-center justify-center">
                  <div className="text-center">
                    <PieChart className="w-16 h-16 text-[#00E047] mx-auto mb-2" />
                    <p className="text-gray-400 text-sm">Chart visualization</p>
                  </div>
                </div>
                
                <div className="space-y-2 text-sm">
                  <div className="flex items-center">
                    <span className="w-3 h-3 bg-[#00E047] rounded-full mr-2"></span>
                    <span>SEO: 30%</span>
                  </div>
                  <div className="flex items-center">
                    <span className="w-3 h-3 bg-[#2196F3] rounded-full mr-2"></span>
                    <span>AEO: 40%</span>
                  </div>
                  <div className="flex items-center">
                    <span className="w-3 h-3 bg-[#FFB300] rounded-full mr-2"></span>
                    <span>GEO: 30%</span>
                  </div>
                </div>
              </div>
            </div>
            
            {/* Action Items and Tools */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="bg-gradient-to-br from-black/40 via-black/30 to-black/20 backdrop-blur-sm border border-white/10 rounded-xl p-5 col-span-2">
                <h3 className="font-semibold mb-4">Recommended Action Items</h3>
                
                <div className="space-y-3">
                  <div className="flex items-start p-3 bg-gradient-to-r from-black/50 to-black/30 backdrop-blur-sm rounded-lg border border-white/10">
                    <div className="bg-[#00C853]/10 p-2 rounded-lg mr-3">
                      <CheckSquare className="w-4 h-4 text-[#00C853]" />
                    </div>
                    <div>
                      <h4 className="font-medium">Deploy AI visibility tracking</h4>
                      <p className="text-sm text-gray-400">Implement comprehensive monitoring to track AI citations</p>
                    </div>
                    <Button 
                      className="ml-auto bg-gray-700 hover:bg-gray-600 px-3 py-1 rounded-lg text-xs"
                      onClick={() => handleToolClick('/analysis', true)}
                    >
                      Start
                    </Button>
                  </div>
                  
                  <div className="flex items-start p-3 bg-gradient-to-r from-black/50 to-black/30 backdrop-blur-sm rounded-lg border border-white/10">
                    <div className="bg-[#FFB300]/10 p-2 rounded-lg mr-3">
                      <AlertTriangle className="w-4 h-4 text-[#FFB300]" />
                    </div>
                    <div>
                      <h4 className="font-medium">Optimize for zero-click searches</h4>
                      <p className="text-sm text-gray-400">Structure content with direct answer paragraphs for key queries</p>
                    </div>
                    <Button 
                      className="ml-auto bg-gray-700 hover:bg-gray-600 px-3 py-1 rounded-lg text-xs"
                      onClick={() => handleToolClick('/tso-dashboard')}
                    >
                      Start
                    </Button>
                  </div>
                  
                  <div className="flex items-start p-3 bg-gradient-to-r from-black/50 to-black/30 backdrop-blur-sm rounded-lg border border-white/10">
                    <div className="bg-[#FF3D00]/10 p-2 rounded-lg mr-3">
                      <AlertTriangle className="w-4 h-4 text-[#FF3D00]" />
                    </div>
                    <div>
                      <h4 className="font-medium">Create LLMs.txt metadata files</h4>
                      <p className="text-sm text-gray-400">Implement AI-specific metadata to guide AI crawlers</p>
                    </div>
                    <Button 
                      className="ml-auto bg-gray-700 hover:bg-gray-600 px-3 py-1 rounded-lg text-xs"
                      onClick={() => handleToolClick('/generator')}
                    >
                      Start
                    </Button>
                  </div>
                </div>
              </div>
              
              <div className="bg-gradient-to-br from-black/40 via-black/30 to-black/20 backdrop-blur-sm border border-white/10 rounded-xl p-5">
                <h3 className="font-semibold mb-4">Quick Access Tools</h3>
                
                <div className="space-y-3">
                  <div 
                    className="block p-3 bg-gradient-to-r from-black/50 to-black/30 backdrop-blur-sm hover:bg-gradient-to-r hover:from-black/60 hover:to-black/40 rounded-lg cursor-pointer border border-white/10"
                    onClick={() => handleToolClick('/analysis', true)}
                  >
                    <div className="flex items-center">
                      <div className="bg-[#00E047]/10 p-2 rounded-lg mr-3">
                        <Search className="w-4 h-4 text-[#00E047]" />
                      </div>
                      <div>
                        <h4 className="font-medium">SEO Analysis</h4>
                        <p className="text-xs text-gray-400">AI visibility tracking platform</p>
                      </div>
                    </div>
                  </div>
                  
                  <div 
                    className="block p-3 bg-gradient-to-r from-black/50 to-black/30 backdrop-blur-sm hover:bg-gradient-to-r hover:from-black/60 hover:to-black/40 rounded-lg cursor-pointer border border-white/10"
                    onClick={() => handleToolClick('/content-analysis')}
                  >
                    <div className="flex items-center">
                      <div className="bg-[#2196F3]/10 p-2 rounded-lg mr-3">
                        <Microscope className="w-4 h-4 text-[#2196F3]" />
                      </div>
                      <div>
                        <h4 className="font-medium">Content Analysis</h4>
                        <p className="text-xs text-gray-400">Competitive analysis tool</p>
                      </div>
                    </div>
                  </div>
                  
                  <div 
                    className="block p-3 bg-gradient-to-r from-black/50 to-black/30 backdrop-blur-sm hover:bg-gradient-to-r hover:from-black/60 hover:to-black/40 rounded-lg cursor-pointer border border-white/10"
                    onClick={() => handleToolClick('/ai-sitemap', true)}
                  >
                    <div className="flex items-center">
                      <div className="bg-[#FFB300]/10 p-2 rounded-lg mr-3">
                        <Map className="w-4 h-4 text-[#FFB300]" />
                      </div>
                      <div>
                        <h4 className="font-medium">AI Sitemap</h4>
                        <p className="text-xs text-gray-400">AI-specific structured data</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Upgrade CTA */}
            {(!subscribed && !isTrialActive) && (
              <Card className="mt-6 bg-gradient-to-br from-black/40 via-black/30 to-black/20 backdrop-blur-sm border border-[#00E047]/50">
                <CardContent className="p-6 text-center">
                  <h3 className="text-xl font-bold text-[#00E047] mb-2">Unlock Premium Features</h3>
                  <p className="text-gray-400 mb-4">Start your 7-day free trial to access all advanced tools and features.</p>
                  <Button 
                    onClick={() => navigate('/upgrade')}
                    className="bg-[#00E047] hover:bg-[#00E047]/80 text-black font-semibold px-8 py-2"
                  >
                    Start Free Trial
                  </Button>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;