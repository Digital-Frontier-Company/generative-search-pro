import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { CheckCircle, X, Zap } from "lucide-react";
import LeadCaptureModal from "./LeadCaptureModal";

const features = [
  {
    category: "AI Optimization",
    items: [
      { name: "AI Answer Engine Optimization", us: true, traditional: false },
      { name: "Citation Monitoring", us: true, traditional: false },
      { name: "AI Visibility Scoring", us: true, traditional: false },
      { name: "Content Structure Analysis", us: true, traditional: true },
    ]
  },
  {
    category: "Traditional SEO",
    items: [
      { name: "Keyword Research", us: true, traditional: true },
      { name: "Technical SEO Audit", us: true, traditional: true },
      { name: "Backlink Analysis", us: true, traditional: true },
      { name: "Page Speed Optimization", us: true, traditional: true },
    ]
  },
  {
    category: "Advanced Features",
    items: [
      { name: "Real-time AI Citation Tracking", us: true, traditional: false },
      { name: "Automated Content Generation", us: true, traditional: false },
      { name: "Schema Markup Optimization", us: true, traditional: true },
      { name: "Competitive AI Analysis", us: true, traditional: false },
    ]
  }
];

const FeatureComparisonSection = () => {
  return (
    <section className="py-16">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <Badge variant="secondary" className="mb-4">
            <Zap className="w-4 h-4 mr-2" />
            Feature Comparison
          </Badge>
          <h2 className="text-3xl font-bold mb-4 gradient-text">
            Why Choose GenerativeSearch.pro
          </h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Compare our AI-powered features with traditional SEO tools
          </p>
        </div>

        <div className="max-w-4xl mx-auto">
          <Card className="content-card">
            <CardHeader>
              <div className="grid grid-cols-3 gap-4">
                <div></div>
                <div className="text-center">
                  <CardTitle className="gradient-text">GenerativeSearch.pro</CardTitle>
                  <p className="text-sm text-muted-foreground">AI-First SEO Platform</p>
                </div>
                <div className="text-center">
                  <CardTitle>Traditional SEO Tools</CardTitle>
                  <p className="text-sm text-muted-foreground">Legacy Approach</p>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-8">
              {features.map((category, categoryIndex) => (
                <div key={categoryIndex}>
                  <h3 className="font-semibold text-lg mb-4 text-primary">
                    {category.category}
                  </h3>
                  <div className="space-y-3">
                    {category.items.map((feature, featureIndex) => (
                      <div key={featureIndex} className="grid grid-cols-3 gap-4 items-center py-2 border-b border-border/30 last:border-b-0">
                        <div className="text-foreground">
                          {feature.name}
                        </div>
                        <div className="text-center">
                          {feature.us ? (
                            <CheckCircle className="w-6 h-6 text-primary mx-auto" />
                          ) : (
                            <X className="w-6 h-6 text-muted-foreground mx-auto" />
                          )}
                        </div>
                        <div className="text-center">
                          {feature.traditional ? (
                            <CheckCircle className="w-6 h-6 text-primary mx-auto" />
                          ) : (
                            <X className="w-6 h-6 text-muted-foreground mx-auto" />
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>

          <div className="text-center mt-8">
            <LeadCaptureModal 
              triggerText="Get Started with AI-First SEO"
              title="Ready to Upgrade Your SEO Strategy?"
              description="Join the businesses already winning with AI-optimized content"
            />
          </div>
        </div>
      </div>
    </section>
  );
};

export default FeatureComparisonSection;