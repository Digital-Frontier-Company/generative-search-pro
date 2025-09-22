import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Sparkles,
  ArrowRight,
  PlayCircle,
  Eye,
  Zap,
  Shield,
  Search,
  Network,
  Mic,
  Crown,
  BarChart3,
  Building2
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface TSONavigationCardProps {
  onGetStarted?: () => void;
}

const TSONavigationCard = ({ onGetStarted }: TSONavigationCardProps) => {
  const navigate = useNavigate();

  const quickTools = [
    {
      name: 'AI Visibility',
      icon: <Eye className="w-4 h-4" />,
      path: '/ai-visibility-tracker',
      description: 'Track AI platform citations'
    },
    {
      name: 'Zero-Click',
      icon: <Zap className="w-4 h-4" />,
      path: '/zero-click-optimizer',
      description: 'Optimize for snippets'
    },
    {
      name: 'Technical Ready',
      icon: <Shield className="w-4 h-4" />,
      path: '/technical-ai-readiness',
      description: 'AI crawler assessment'
    },
    {
      name: 'Authority',
      icon: <Crown className="w-4 h-4" />,
      path: '/authority-tracker',
      description: 'Brand mention tracking'
    }
  ];

  const handleGetStarted = () => {
    if (onGetStarted) {
      onGetStarted();
    } else {
      navigate('/tso-onboarding');
    }
  };

  return (
    <Card className="content-card border-matrix-green/30 bg-gradient-to-br from-matrix-green/5 to-cyan-500/5">
      <CardHeader>
        <CardTitle className="text-matrix-green flex items-center gap-3">
          <div className="p-2 rounded-lg bg-gradient-to-r from-matrix-green/20 to-cyan-500/20">
            <Sparkles className="w-6 h-6 text-matrix-green" />
          </div>
          <div>
            <h3 className="text-xl">Total Search Optimization</h3>
            <p className="text-sm text-matrix-green/70 font-normal">
              AI-first optimization platform
            </p>
          </div>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          <div>
            <p className="text-matrix-green/90 mb-4">
              Go beyond traditional SEO with our comprehensive TSO framework. 
              Optimize for AI platforms like ChatGPT, Perplexity, and Gemini.
            </p>
            
            <div className="flex items-center gap-2 mb-4">
              <Badge className="bg-matrix-green/20 text-matrix-green">
                10 Optimization Tools
              </Badge>
              <Badge className="bg-cyan-500/20 text-cyan-400">
                4 Categories
              </Badge>
              <Badge className="bg-purple-500/20 text-purple-400">
                Real-time Analysis
              </Badge>
            </div>
          </div>

          <div>
            <h4 className="font-semibold text-matrix-green mb-3">Quick Access Tools</h4>
            <div className="grid grid-cols-2 gap-2">
              {quickTools.map((tool, index) => (
                <Button
                  key={index}
                  variant="outline"
                  size="sm"
                  onClick={() => navigate(tool.path)}
                  className="flex items-center gap-2 h-auto p-3 border-matrix-green/30 text-matrix-green hover:bg-matrix-green/10 hover:border-matrix-green/50"
                >
                  <div className="flex items-center gap-2">
                    {tool.icon}
                    <div className="text-left">
                      <div className="text-sm font-medium">{tool.name}</div>
                      <div className="text-xs text-matrix-green/60">{tool.description}</div>
                    </div>
                  </div>
                </Button>
              ))}
            </div>
          </div>

          <div className="space-y-3">
            <Button 
              onClick={handleGetStarted}
              className="w-full glow-button text-black font-semibold"
            >
              <PlayCircle className="w-4 h-4 mr-2" />
              Get Started with TSO
            </Button>
            
            <Button 
              variant="outline"
              onClick={() => navigate('/tso-dashboard')}
              className="w-full border-matrix-green/30 text-matrix-green hover:bg-matrix-green/10 hover:border-matrix-green/50"
            >
              View Full Dashboard
              <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default TSONavigationCard;