import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";

import { Star } from "lucide-react";
import { Helmet } from "react-helmet-async";

const testimonials = [
  {
    name: "Sarah Chen",
    role: "Head of Marketing",
    company: "TechStart Inc",
    content: "GenerativeSearch.pro helped us optimize our content for AI engines. We saw a 300% increase in AI citations within 2 months.",
    rating: 5,
    avatar: "/lovable-uploads/f719da8a-6072-4d0f-ad36-e4eacda55ee7.png"
  },
  {
    name: "Marcus Rodriguez",
    role: "SEO Director", 
    company: "Digital Growth Co",
    content: "The AI visibility scoring is a game-changer. We now rank in ChatGPT and Claude responses for our key topics.",
    rating: 5,
    avatar: "/lovable-uploads/529aa5c1-ba3f-4d12-9363-2f95511fd4bd.png"
  },
  {
    name: "Emily Watson",
    role: "Content Manager",
    company: "SaaS Solutions",
    content: "Easy to use and incredibly effective. Our content now appears in AI-generated answers 10x more often.",
    rating: 5,
    avatar: "/lovable-uploads/96aa1ceb-6858-443c-8bc7-1f9af19024d5.png"
  }
];

// Aggregate rating schema for SEO rich snippets
const aggregateSchema = {
  "@context": "https://schema.org",
  "@type": "Product",
  "name": "GenerativeSearch.pro",
  "aggregateRating": {
    "@type": "AggregateRating",
    "ratingValue": "5",
    "reviewCount": testimonials.length.toString()
  }
};

const TestimonialSection = () => {
  return (
    <section className="py-16">
      <Helmet>
        <script type="application/ld+json">
          {JSON.stringify(aggregateSchema)}
        </script>
      </Helmet>
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold mb-4 gradient-text">
            Trusted by 1000+ Businesses
          </h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            See how companies are using GenerativeSearch.pro to dominate AI search results
          </p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {testimonials.map((testimonial, index) => (
            <Card key={index} className="content-card h-full">
              <CardContent className="p-6">
                <div className="flex mb-4">
                  {[...Array(testimonial.rating)].map((_, i) => (
                    <Star key={i} className="w-5 h-5 text-primary fill-current" />
                  ))}
                </div>
                
                <p className="text-foreground mb-6 leading-relaxed">
                  "{testimonial.content}"
                </p>
                
                <div className="flex items-center">
                  <Avatar className="h-10 w-10 mr-3 overflow-hidden">
                    <img src={testimonial.avatar} alt={testimonial.name} className="h-10 w-10 object-cover" />
                    <AvatarFallback>{testimonial.name.split(' ').map(n => n[0]).join('')}</AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="font-semibold text-foreground">{testimonial.name}</p>
                    <p className="text-sm text-muted-foreground">
                      {testimonial.role} at {testimonial.company}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
};

export default TestimonialSection;