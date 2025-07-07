import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { CheckCircle, AlertTriangle, XCircle, Lightbulb, Search, Bot } from "lucide-react";

const AIAudit = () => {
  const [auditData] = useState({
    overallScore: 78,
    metrics: {
      contentStructure: 85,
      readability: 72,
      aiOptimization: 80,
      technicalSEO: 76
    },
    findings: [
      { type: 'success', title: 'Clear heading structure', description: 'Proper H1-H6 hierarchy detected' },
      { type: 'warning', title: 'Missing meta description', description: 'Add descriptive meta tags for better AI understanding' },
      { type: 'error', title: 'No structured data', description: 'Implement schema markup for enhanced AI visibility' },
      { type: 'info', title: 'Good internal linking', description: 'Strong internal link structure promotes context understanding' }
    ]
  });

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-matrix-green';
    if (score >= 60) return 'text-warning';
    return 'text-error';
  };

  const getScoreVariant = (score: number) => {
    if (score >= 80) return 'default';
    if (score >= 60) return 'secondary';
    return 'destructive';
  };

  const getIcon = (type: string) => {
    switch (type) {
      case 'success': return <CheckCircle className="w-4 h-4 text-matrix-green" />;
      case 'warning': return <AlertTriangle className="w-4 h-4 text-warning" />;
      case 'error': return <XCircle className="w-4 h-4 text-error" />;
      default: return <Lightbulb className="w-4 h-4 text-info" />;
    }
  };

  return (
    <Card className="content-card">
      <CardHeader>
        <CardTitle className="text-matrix-green flex items-center">
          <Bot className="w-5 h-5 mr-2" />
          AI Audit Results
        </CardTitle>
        <CardDescription>
          Comprehensive AI optimization analysis for your content
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Overall Score */}
        <div className="text-center">
          <div className={`text-4xl font-bold ${getScoreColor(auditData.overallScore)} mb-2`}>
            {auditData.overallScore}/100
          </div>
          <Badge variant={getScoreVariant(auditData.overallScore)} className="text-sm">
            {auditData.overallScore >= 80 ? 'Excellent' : auditData.overallScore >= 60 ? 'Good' : 'Needs Work'}
          </Badge>
        </div>

        {/* Metrics Breakdown */}
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span>Content Structure</span>
              <span className="text-matrix-green">{auditData.metrics.contentStructure}%</span>
            </div>
            <Progress value={auditData.metrics.contentStructure} className="h-2" />
          </div>
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span>Readability</span>
              <span className="text-warning">{auditData.metrics.readability}%</span>
            </div>
            <Progress value={auditData.metrics.readability} className="h-2" />
          </div>
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span>AI Optimization</span>
              <span className="text-matrix-green">{auditData.metrics.aiOptimization}%</span>
            </div>
            <Progress value={auditData.metrics.aiOptimization} className="h-2" />
          </div>
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span>Technical SEO</span>
              <span className="text-warning">{auditData.metrics.technicalSEO}%</span>
            </div>
            <Progress value={auditData.metrics.technicalSEO} className="h-2" />
          </div>
        </div>

        {/* Findings */}
        <div className="space-y-3">
          <h4 className="font-medium text-matrix-green">Key Findings</h4>
          {auditData.findings.map((finding, index) => (
            <div key={index} className="flex items-start space-x-3 p-3 rounded-lg bg-secondary/50">
              {getIcon(finding.type)}
              <div className="flex-1">
                <p className="font-medium text-sm">{finding.title}</p>
                <p className="text-xs text-muted-foreground">{finding.description}</p>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

export default AIAudit;