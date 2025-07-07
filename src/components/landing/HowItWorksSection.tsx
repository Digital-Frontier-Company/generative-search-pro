import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowRight, Search, Bot, TrendingUp, CheckCircle } from "lucide-react";
import LeadCaptureModal from "./LeadCaptureModal";

const steps = [
  {
    step: "01",
    icon: Search,
    title: "Analyze Your Content",
    description: "Upload your existing content or enter your website URL. Our AI scans for optimization opportunities.",
    features: ["SEO analysis", "Content structure review", "Keyword optimization"]
  },
  {
    step: "02", 
    icon: Bot,
    title: "AI Optimization Engine",
    description: "Our advanced algorithms optimize your content for both traditional search and AI answer engines.",
    features: ["Citation formatting", "Question-answer structure", "Factual accuracy check"]
  },
  {
    step: "03",
    icon: TrendingUp,
    title: "Track Your Results",
    description: "Monitor your visibility in AI search results and track performance improvements over time.",
    features: ["AI citation tracking", "Visibility scoring", "Performance analytics"]
  }
];

const HowItWorksSection = () => {
  return (
    <section className="py-16">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold mb-4 gradient-text">
            How It Works
          </h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Three simple steps to dominate AI search results and boost your content visibility
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
          {steps.map((step, index) => (
            <div key={index} className="relative">
              <Card className="content-card h-full">
                <CardContent className="p-6">
                  <div className="flex items-center mb-4">
                    <div className="text-2xl font-bold text-primary mr-3">{step.step}</div>
                    <div className="p-2 rounded-lg bg-primary/10">
                      <step.icon className="w-6 h-6 text-primary" />
                    </div>
                  </div>
                  
                  <h3 className="text-xl font-semibold mb-3">{step.title}</h3>
                  <p className="text-muted-foreground mb-4 leading-relaxed">
                    {step.description}
                  </p>
                  
                  <ul className="space-y-2">
                    {step.features.map((feature, featureIndex) => (
                      <li key={featureIndex} className="flex items-center text-sm">
                        <CheckCircle className="w-4 h-4 text-primary mr-2 flex-shrink-0" />
                        <span>{feature}</span>
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
              
              {/* Arrow between steps */}
              {index < steps.length - 1 && (
                <div className="hidden md:block absolute top-1/2 -right-4 transform -translate-y-1/2 z-10">
                  <ArrowRight className="w-8 h-8 text-primary/60" />
                </div>
              )}
            </div>
          ))}
        </div>

        {/* CTA */}
        <div className="text-center">
          <LeadCaptureModal 
            triggerText="Start Optimizing Now"
            title="Ready to Get Started?"
            description="Join 1000+ businesses already winning with AI-optimized content"
          />
          <p className="text-sm text-muted-foreground mt-3">
            Free trial • No credit card required • Setup in minutes
          </p>
        </div>
      </div>
    </section>
  );
};

export default HowItWorksSection;