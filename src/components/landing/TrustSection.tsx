import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Shield, Lock, Award, Users, Clock, Headphones } from "lucide-react";

const trustElements = [
  {
    icon: Shield,
    title: "Enterprise Security",
    description: "SOC 2 Type II certified with bank-level encryption",
    badge: "Certified"
  },
  {
    icon: Lock,
    title: "Data Privacy",
    description: "GDPR & CCPA compliant. Your data stays private",
    badge: "Protected"
  },
  {
    icon: Award,
    title: "Money-Back Guarantee",
    description: "30-day full refund if you're not satisfied",
    badge: "Guaranteed"
  },
  {
    icon: Users,
    title: "1000+ Happy Customers",
    description: "Join businesses already seeing results",
    badge: "Proven"
  },
  {
    icon: Clock,
    title: "99.9% Uptime",
    description: "Reliable service you can count on",
    badge: "Reliable"
  },
  {
    icon: Headphones,
    title: "24/7 Support",
    description: "Expert help whenever you need it",
    badge: "Supported"
  }
];

const TrustSection = () => {
  return (
    <section className="py-16 bg-secondary/20">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <Badge variant="secondary" className="mb-4">
            <Shield className="w-4 h-4 mr-2" />
            Trusted & Secure
          </Badge>
          <h2 className="text-3xl font-bold mb-4 gradient-text">
            Built for Enterprise Trust
          </h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Security, reliability, and support you can count on
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {trustElements.map((element, index) => (
            <Card key={index} className="content-card">
              <CardContent className="p-6 text-center">
                <div className="flex justify-center mb-4">
                  <div className="p-3 rounded-full bg-primary/10">
                    <element.icon className="w-8 h-8 text-primary" />
                  </div>
                </div>
                
                <div className="mb-2">
                  <Badge variant="outline" className="text-xs mb-2">
                    {element.badge}
                  </Badge>
                </div>
                
                <h3 className="text-lg font-semibold mb-2">{element.title}</h3>
                <p className="text-muted-foreground text-sm leading-relaxed">
                  {element.description}
                </p>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Additional Trust Badges */}
        <div className="flex justify-center items-center space-x-8 mt-12 opacity-60">
          <div className="text-center">
            <div className="text-2xl font-bold text-primary">SOC 2</div>
            <div className="text-xs text-muted-foreground">Type II</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-primary">GDPR</div>
            <div className="text-xs text-muted-foreground">Compliant</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-primary">ISO</div>
            <div className="text-xs text-muted-foreground">27001</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-primary">SSL</div>
            <div className="text-xs text-muted-foreground">Encrypted</div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default TrustSection;