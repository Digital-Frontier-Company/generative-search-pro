import { Badge } from "@/components/ui/badge";
import { TrendingUp, Users, Zap, Award } from "lucide-react";


const stats = [
  {
    icon: Users,
    value: "1,200+",
    label: "Active Users",
    description: "Businesses using our platform"
  },
  {
    icon: TrendingUp,
    value: "350%",
    label: "Average Increase",
    description: "In AI search visibility"
  },
  {
    icon: Zap,
    value: "50K+",
    label: "Content Pieces",
    description: "Optimized for AI engines"
  },
  {
    icon: Award,
    value: "98%",
    label: "Satisfaction Rate",
    description: "Customer approval rating"
  }
];

const companyLogos = [
  { name: "TechCorp", logo: "/lovable-uploads/2c3eeb3c-a917-426c-b21d-4b277d0cbc6f.png" },
  { name: "InnovateLab", logo: "/lovable-uploads/3a1bfbb8-748f-4538-8f38-ad6eb16424ca.png" },
  { name: "DataDriven", logo: "/lovable-uploads/5ae6fe50-9544-4b37-b51f-70c0fc48e037.png" },
  { name: "AIFirst", logo: "/lovable-uploads/717aff3d-6077-4d2f-bac2-4b52d09ea2dc.png" },
  { name: "ScaleUp", logo: "/lovable-uploads/b25396ed-f9a5-48e6-92f5-4539ca31fd72.png" },
  { name: "Growth Co", logo: "/lovable-uploads/d22b9f27-d5b8-42cb-a878-90af67eb3d91.png" }
];

const SocialProofSection = () => {
  return (
    <section className="py-16 border-t border-border/50">
      <div className="container mx-auto px-4">
        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-16">
          {stats.map((stat, index) => (
            <div key={index} className="text-center">
              <div className="flex justify-center mb-3">
                <div className="p-3 rounded-full bg-primary/10">
                  <stat.icon className="w-6 h-6 text-primary" />
                </div>
              </div>
              <div className="text-3xl font-bold text-primary mb-1">{stat.value}</div>
              <div className="font-semibold text-foreground mb-1">{stat.label}</div>
              <div className="text-sm text-muted-foreground">{stat.description}</div>
            </div>
          ))}
        </div>

        {/* Company Logos */}
        <div className="text-center mb-8">
          <Badge variant="secondary" className="mb-4">
            Trusted By Leading Companies
          </Badge>
          <h3 className="text-xl font-semibold text-muted-foreground mb-8">
            Join 1000+ businesses optimizing for the AI search era
          </h3>
        </div>

        <div className="grid grid-cols-3 md:grid-cols-6 gap-8 items-center opacity-60 hover:opacity-80 transition-opacity">
          {companyLogos.map((company, index) => (
            <div key={index} className="flex justify-center">
              <img 
                src={company.logo} 
                alt={`${company.name} logo`}
                className="h-8 w-auto filter grayscale hover:grayscale-0 transition-all duration-300"
              />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default SocialProofSection;