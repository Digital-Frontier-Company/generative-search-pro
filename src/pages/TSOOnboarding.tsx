import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Sparkles,
  Brain,
  Target,
  Zap,
  CheckCircle,
  ArrowRight,
  PlayCircle,
  Star,
  Award,
  TrendingUp,
  Shield,
  Eye
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const TSOOnboarding = () => {
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState(0);

  const onboardingSteps = [
    {
      title: "Welcome to Total Search Optimization",
      description: "The complete AI-first optimization platform for modern search",
      content: (
        <div className="text-center py-8">
          <div className="mb-6">
            <div className="p-4 rounded-full bg-gradient-to-r from-matrix-green/20 to-cyan-500/20 inline-block">
              <Sparkles className="w-12 h-12 text-matrix-green" />
            </div>
          </div>
          <h2 className="text-2xl font-bold text-matrix-green mb-4">
            Transform Your Search Presence
          </h2>
          <p className="text-matrix-green/80 mb-6 max-w-lg mx-auto">
            TSO goes beyond traditional SEO to optimize for AI platforms like ChatGPT, Perplexity, 
            and Gemini. Get ready to dominate the future of search.
          </p>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="p-4 bg-secondary/30 rounded-lg">
              <Eye className="w-6 h-6 text-blue-500 mx-auto mb-2" />
              <p className="text-sm text-matrix-green">AI Visibility</p>
            </div>
            <div className="p-4 bg-secondary/30 rounded-lg">
              <Zap className="w-6 h-6 text-yellow-500 mx-auto mb-2" />
              <p className="text-sm text-matrix-green">Zero-Click</p>
            </div>
            <div className="p-4 bg-secondary/30 rounded-lg">
              <Shield className="w-6 h-6 text-green-500 mx-auto mb-2" />
              <p className="text-sm text-matrix-green">Technical Ready</p>
            </div>
            <div className="p-4 bg-secondary/30 rounded-lg">
              <Award className="w-6 h-6 text-purple-500 mx-auto mb-2" />
              <p className="text-sm text-matrix-green">Authority</p>
            </div>
          </div>
        </div>
      )
    },
    {
      title: "The TSO Framework",
      description: "Four pillars of AI search optimization",
      content: (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="p-6 bg-gradient-to-br from-blue-500/10 to-cyan-500/10 rounded-lg border border-blue-500/20">
              <Brain className="w-8 h-8 text-blue-500 mb-4" />
              <h3 className="text-lg font-semibold text-matrix-green mb-2">AI Foundations</h3>
              <p className="text-matrix-green/80 text-sm">
                Build the technical infrastructure and visibility monitoring needed for AI platforms to understand and cite your content.
              </p>
              <div className="mt-4 space-y-1">
                <div className="flex items-center gap-2 text-xs text-matrix-green/70">
                  <CheckCircle className="w-3 h-3" />
                  <span>Multi-platform AI visibility tracking</span>
                </div>
                <div className="flex items-center gap-2 text-xs text-matrix-green/70">
                  <CheckCircle className="w-3 h-3" />
                  <span>Technical readiness assessment</span>
                </div>
                <div className="flex items-center gap-2 text-xs text-matrix-green/70">
                  <CheckCircle className="w-3 h-3" />
                  <span>Zero-click optimization</span>
                </div>
              </div>
            </div>

            <div className="p-6 bg-gradient-to-br from-green-500/10 to-emerald-500/10 rounded-lg border border-green-500/20">
              <Target className="w-8 h-8 text-green-500 mb-4" />
              <h3 className="text-lg font-semibold text-matrix-green mb-2">Content Strategy</h3>
              <p className="text-matrix-green/80 text-sm">
                Create content optimized for AI understanding using intent research, semantic analysis, and voice search optimization.
              </p>
              <div className="mt-4 space-y-1">
                <div className="flex items-center gap-2 text-xs text-matrix-green/70">
                  <CheckCircle className="w-3 h-3" />
                  <span>Intent-driven content research</span>
                </div>
                <div className="flex items-center gap-2 text-xs text-matrix-green/70">
                  <CheckCircle className="w-3 h-3" />
                  <span>Semantic structure analysis</span>
                </div>
                <div className="flex items-center gap-2 text-xs text-matrix-green/70">
                  <CheckCircle className="w-3 h-3" />
                  <span>Voice search optimization</span>
                </div>
              </div>
            </div>

            <div className="p-6 bg-gradient-to-br from-purple-500/10 to-pink-500/10 rounded-lg border border-purple-500/20">
              <Award className="w-8 h-8 text-purple-500 mb-4" />
              <h3 className="text-lg font-semibold text-matrix-green mb-2">Authority & Competition</h3>
              <p className="text-matrix-green/80 text-sm">
                Build topical authority and outperform competitors through strategic brand mention and citation tracking.
              </p>
              <div className="mt-4 space-y-1">
                <div className="flex items-center gap-2 text-xs text-matrix-green/70">
                  <CheckCircle className="w-3 h-3" />
                  <span>Authority signal tracking</span>
                </div>
                <div className="flex items-center gap-2 text-xs text-matrix-green/70">
                  <CheckCircle className="w-3 h-3" />
                  <span>Competitive AI analysis</span>
                </div>
                <div className="flex items-center gap-2 text-xs text-matrix-green/70">
                  <CheckCircle className="w-3 h-3" />
                  <span>Brand mention monitoring</span>
                </div>
              </div>
            </div>

            <div className="p-6 bg-gradient-to-br from-orange-500/10 to-red-500/10 rounded-lg border border-orange-500/20">
              <TrendingUp className="w-8 h-8 text-orange-500 mb-4" />
              <h3 className="text-lg font-semibold text-matrix-green mb-2">Business Implementation</h3>
              <p className="text-matrix-green/80 text-sm">
                Get customized strategies based on your business type and deploy technical implementations for AI systems.
              </p>
              <div className="mt-4 space-y-1">
                <div className="flex items-center gap-2 text-xs text-matrix-green/70">
                  <CheckCircle className="w-3 h-3" />
                  <span>Business-specific templates</span>
                </div>
                <div className="flex items-center gap-2 text-xs text-matrix-green/70">
                  <CheckCircle className="w-3 h-3" />
                  <span>LLM.txt file generation</span>
                </div>
                <div className="flex items-center gap-2 text-xs text-matrix-green/70">
                  <CheckCircle className="w-3 h-3" />
                  <span>Implementation roadmaps</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )
    },
    {
      title: "Your Success Path",
      description: "Step-by-step guidance to TSO mastery",
      content: (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h3 className="text-xl font-semibold text-matrix-green">Recommended Learning Path</h3>
            <Badge className="bg-matrix-green/20 text-matrix-green">Beginner-Friendly</Badge>
          </div>
          
          <div className="space-y-4">
            {[
              {
                step: 1,
                title: "AI Visibility Tracker",
                description: "Establish your baseline AI visibility across platforms",
                time: "10 minutes",
                difficulty: "Beginner",
                path: "/ai-visibility-tracker"
              },
              {
                step: 2,
                title: "Technical AI Readiness",
                description: "Assess your website's technical foundation",
                time: "15 minutes",
                difficulty: "Intermediate",
                path: "/technical-ai-readiness"
              },
              {
                step: 3,
                title: "Zero-Click Optimizer",
                description: "Optimize for featured snippets and answer boxes",
                time: "20 minutes",
                difficulty: "Intermediate",
                path: "/zero-click-optimizer"
              },
              {
                step: 4,
                title: "Business Templates",
                description: "Get customized strategies for your business type",
                time: "12 minutes",
                difficulty: "Beginner",
                path: "/business-type-templates"
              }
            ].map((item, index) => (
              <div key={index} className="flex items-center gap-4 p-4 bg-secondary/30 rounded-lg border">
                <div className="w-8 h-8 rounded-full bg-matrix-green/20 flex items-center justify-center">
                  <span className="text-sm font-bold text-matrix-green">{item.step}</span>
                </div>
                <div className="flex-1">
                  <h4 className="font-semibold text-matrix-green">{item.title}</h4>
                  <p className="text-sm text-matrix-green/70">{item.description}</p>
                </div>
                <div className="text-right">
                  <p className="text-xs text-matrix-green/60">~{item.time}</p>
                  <Badge variant="outline" className="text-xs border-matrix-green/30 text-matrix-green">
                    {item.difficulty}
                  </Badge>
                </div>
              </div>
            ))}
          </div>

          <div className="p-4 bg-gradient-to-r from-matrix-green/10 to-cyan-500/10 rounded-lg border border-matrix-green/30">
            <div className="flex items-center gap-3 mb-2">
              <Star className="w-5 h-5 text-matrix-green" />
              <h4 className="font-semibold text-matrix-green">Pro Tip</h4>
            </div>
            <p className="text-sm text-matrix-green/80">
              Start with the foundations and work your way up. Each tool builds on the previous ones, 
              creating a comprehensive optimization strategy that covers all aspects of AI search.
            </p>
          </div>
        </div>
      )
    }
  ];

  const currentStepData = onboardingSteps[currentStep];

  const nextStep = () => {
    if (currentStep < onboardingSteps.length - 1) {
      setCurrentStep(currentStep + 1);
    }
  };

  const prevStep = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const startTSO = () => {
    navigate('/tso-dashboard');
  };

  const skipOnboarding = () => {
    navigate('/tso-dashboard');
  };

  return (
    <div className="container mx-auto p-6 max-w-4xl">
      <div className="mb-8">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-gradient-to-r from-matrix-green/20 to-cyan-500/20">
              <Sparkles className="w-6 h-6 text-matrix-green" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-matrix-green">TSO Onboarding</h1>
              <p className="text-matrix-green/70">Get started with Total Search Optimization</p>
            </div>
          </div>
          <Button 
            variant="outline" 
            onClick={skipOnboarding} 
            className="border-matrix-green/30 text-matrix-green hover:bg-matrix-green/10"
          >
            Skip Tour
          </Button>
        </div>

        {/* Progress Bar */}
        <div className="flex items-center gap-2 mb-6">
          {onboardingSteps.map((_, index) => (
            <div 
              key={index} 
              className={`h-2 rounded-full flex-1 ${
                index <= currentStep ? 'bg-matrix-green' : 'bg-secondary'
              }`} 
            />
          ))}
        </div>
      </div>

      <Card className="content-card">
        <CardHeader>
          <CardTitle className="text-matrix-green">
            {currentStepData.title}
          </CardTitle>
          <p className="text-matrix-green/70">{currentStepData.description}</p>
        </CardHeader>
        <CardContent>
          {currentStepData.content}
        </CardContent>
      </Card>

      <div className="flex items-center justify-between mt-6">
        <Button 
          variant="outline" 
          onClick={prevStep} 
          disabled={currentStep === 0}
          className="border-matrix-green/30 text-matrix-green hover:bg-matrix-green/10"
        >
          Previous
        </Button>

        <div className="flex items-center gap-2">
          <span className="text-sm text-matrix-green/70">
            {currentStep + 1} of {onboardingSteps.length}
          </span>
        </div>

        {currentStep === onboardingSteps.length - 1 ? (
          <Button onClick={startTSO} className="glow-button text-black font-semibold">
            <PlayCircle className="w-4 h-4 mr-2" />
            Start TSO Journey
          </Button>
        ) : (
          <Button onClick={nextStep} className="glow-button text-black font-semibold">
            Next
            <ArrowRight className="w-4 h-4 ml-2" />
          </Button>
        )}
      </div>
    </div>
  );
};

export default TSOOnboarding;