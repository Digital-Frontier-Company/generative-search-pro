
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { CheckCircle, ArrowRight, Zap, Database, Globe, Sparkles, ChevronDown, ChevronUp, Star, Users, TrendingUp } from "lucide-react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import JsonLdSchema from "@/components/JsonLdSchema";
import { getHomepageSchema, getHomepageFAQSchema } from "@/utils/jsonLdSchemas";

const Index = () => {
  const navigate = useNavigate();
  const [faqOpen, setFaqOpen] = useState<number | null>(0);

  const faqs = [
    {
      question: "What is Answer Engine Optimization (AEO)?",
      answer: "AEO is a strategy that focuses on optimizing content specifically for AI-powered answer engines and featured snippets. Unlike traditional SEO that aims for general rankings, AEO targets the specific formats and structures that help content get selected for direct answers in search results."
    },
    {
      question: "How does FrontierAEO differ from regular SEO tools?",
      answer: "FrontierAEO is specifically designed to optimize content for AI answers and featured snippets. It generates structured content that includes metadata, schema markup, FAQs, and other components that help search engines understand and prioritize your content for direct answers."
    },
    {
      question: "Do I need technical knowledge to use FrontierAEO?",
      answer: "No technical knowledge is required. Our tool generates ready-to-use HTML and structured data that you can simply copy and paste into your content management system or website."
    },
    {
      question: "How many content pieces can I generate with the free tier?",
      answer: "The free tier allows you to generate 5 content pieces per month. For unlimited generations and additional features, you can upgrade to our Premium plan at any time."
    },
    {
      question: "Can I customize the generated content?",
      answer: "Yes, all generated content can be customized before export. You can edit the hero answer, FAQs, meta descriptions, and other components to better match your brand voice and specific needs."
    }
  ];

  const featureBlocks = [
    {
      icon: <Zap className="w-10 h-10 text-matrix-green" />,
      title: "AI-Optimized Content Generation",
      description: "Create content specifically structured for AI answer engines and featured snippets with the click of a button.",
      benefit: "Increase featured snippet appearances by 300%"
    },
    {
      icon: <Database className="w-10 h-10 text-matrix-lime" />,
      title: "Schema Markup & Metadata",
      description: "Automatically generate JSON-LD schema markup and metadata to help search engines understand your content.",
      benefit: "Boost search visibility instantly"
    },
    {
      icon: <Globe className="w-10 h-10 text-matrix-emerald" />,
      title: "FAQ & Structured Data",
      description: "Generate relevant FAQs and structured data that increases your chances of appearing in featured snippets.",
      benefit: "Dominate voice search results"
    },
    {
      icon: <Sparkles className="w-10 h-10 text-matrix-neon" />,
      title: "One-Click Export",
      description: "Export your optimized content as HTML or JSON for easy integration with your website or CMS.",
      benefit: "Implement in under 60 seconds"
    }
  ];

  const pricingPlans = [
    {
      name: "Basic",
      price: "$0",
      description: "Perfect for trying out AEO content generation",
      features: [
        "5 content generations per month",
        "Basic content elements",
        "HTML export",
        "Copy & paste implementation"
      ],
      cta: "Get Started Free",
      ctaAction: () => navigate('/auth', { state: { signUp: true } }),
      highlighted: false
    },
    {
      name: "Pro",
      price: "$19",
      period: "per month",
      annualPrice: "$15",
      description: "For professionals and growing websites",
      features: [
        "Unlimited content generations",
        "Advanced schema markup",
        "Priority generation queue",
        "Content performance analytics",
        "Custom export templates",
        "Email support"
      ],
      cta: "Start Free Trial",
      ctaAction: () => navigate('/auth', { state: { signUp: true } }),
      highlighted: true
    },
    {
      name: "Team",
      price: "$49",
      period: "per month",
      annualPrice: "$39",
      description: "For agencies and teams",
      features: [
        "Everything in Pro",
        "Team collaboration features",
        "White-label exports",
        "API access",
        "Priority support",
        "Custom integrations"
      ],
      cta: "Start Free Trial",
      ctaAction: () => navigate('/auth', { state: { signUp: true } }),
      highlighted: false
    }
  ];

  const testimonials = [
    {
      name: "Sarah Chen",
      role: "Content Marketing Manager",
      company: "TechFlow",
      content: "GenerativeSearch.pro helped us increase our featured snippet appearances by 250% in just 3 months. The AEO-optimized content is exactly what Google's AI is looking for.",
      rating: 5
    },
    {
      name: "Marcus Rodriguez",
      role: "SEO Director",
      company: "Digital Growth Co.",
      content: "Finally, a tool that understands how AI search works. Our voice search traffic has tripled since we started using AEO optimization.",
      rating: 5
    },
    {
      name: "Emily Watson",
      role: "Founder",
      company: "Local Biz Hub",
      content: "The structured data generation alone is worth the subscription. We're now appearing in AI answer boxes for our target keywords.",
      rating: 5
    }
  ];

  return (
    <div className="min-h-screen flex flex-col bg-black">
      <JsonLdSchema schema={[...getHomepageSchema(), getHomepageFAQSchema()]} />
      <Header />
      
      {/* Hero Section with Enhanced Value Proposition */}
      <section className="py-16 md:py-24 relative overflow-hidden hero-gradient">
        <div className="absolute inset-0 bg-black/30"></div>
        <div className="container mx-auto px-4 relative z-10">
          <div className="max-w-4xl mx-auto text-center">
            {/* Social Proof Stats */}
            <div className="flex justify-center items-center gap-8 mb-8 text-sm text-matrix-green/80">
              <div className="flex items-center gap-2">
                <Users className="w-4 h-4" />
                <span>Join 2,500+ content creators</span>
              </div>
              <div className="flex items-center gap-2">
                <TrendingUp className="w-4 h-4" />
                <span>300% average snippet increase</span>
              </div>
              <div className="flex items-center gap-2">
                <Star className="w-4 h-4 fill-current" />
                <span>4.9/5 customer rating</span>
              </div>
            </div>

            <h1 className="text-4xl md:text-6xl font-bold mb-6 text-matrix-green drop-shadow-[0_0_10px_rgba(0,255,65,0.4)]">
              <span className="text-matrix-green">Stop Losing Traffic to</span>
              <br /> 
              <span className="gradient-text">AI Search Results</span>
            </h1>
            
            <p className="text-xl md:text-2xl text-matrix-green/90 mb-4 font-medium">
              Optimize your content for ChatGPT, Google AI, and other answer engines
            </p>
            
            <p className="text-lg md:text-xl text-matrix-green/70 mb-10 max-w-3xl mx-auto">
              Generate AI-optimized content that dominates featured snippets, voice search, and answer boxes. Get found when people ask questions about your industry.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12">
              <Button 
                size="lg" 
                onClick={() => navigate('/auth', { state: { signUp: true } })} 
                className="glow-button text-black font-semibold text-lg px-8 py-4"
              >
                Start 7-Day Free Trial
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
              <Button 
                size="lg" 
                variant="outline" 
                className="border-matrix-green text-matrix-green hover:bg-matrix-green/10 hover:border-matrix-lime text-lg px-8 py-4"
              >
                See Live Demo
              </Button>
            </div>

            {/* Trust Indicators */}
            <div className="text-center text-matrix-green/60 text-sm">
              <p>✅ No credit card required • ✅ 7-day free trial • ✅ Cancel anytime</p>
            </div>
            
            {/* Enhanced Preview Section */}
            <div className="mt-16">
              <div className="content-card overflow-hidden">
                <div className="bg-matrix-dark-gray border-b border-matrix-green/30 p-4">
                  <div className="flex items-center space-x-2">
                    <div className="w-3 h-3 bg-red-400 rounded-full"></div>
                    <div className="w-3 h-3 bg-yellow-400 rounded-full"></div>
                    <div className="w-3 h-3 bg-matrix-green rounded-full"></div>
                    <div className="ml-4 text-sm text-matrix-green/70">GenerativeSearch.pro AEO Generator</div>
                  </div>
                </div>
                <div className="p-6">
                  <div className="mb-6">
                    <div className="text-sm text-matrix-green/70 mb-2">Transform any keyword into AI-optimized content:</div>
                    <div className="flex gap-4">
                      <div className="flex-1 p-3 border border-matrix-green/30 rounded-lg bg-matrix-dark-gray text-matrix-green/70">best coffee grinder for home brewing</div>
                      <Button className="glow-button text-black font-semibold">Generate AEO Content</Button>
                    </div>
                  </div>
                  <div className="space-y-6">
                    <div className="p-4 border border-matrix-green/30 rounded-lg bg-matrix-dark-gray">
                      <div className="text-matrix-green text-sm mb-2">✨ Hero Answer (for featured snippets)</div>
                      <div className="animate-pulse h-16 bg-matrix-green/10 rounded"></div>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="p-4 border border-matrix-green/30 rounded-lg bg-matrix-dark-gray">
                        <div className="text-matrix-green text-sm mb-2">🔍 Schema Markup</div>
                        <div className="animate-pulse h-12 bg-matrix-green/10 rounded"></div>
                      </div>
                      <div className="p-4 border border-matrix-green/30 rounded-lg bg-matrix-dark-gray">
                        <div className="text-matrix-green text-sm mb-2">❓ Related FAQs</div>
                        <div className="animate-pulse h-12 bg-matrix-green/10 rounded"></div>
                      </div>
                    </div>
                    <div className="p-4 border border-matrix-green/30 rounded-lg bg-matrix-dark-gray">
                      <div className="text-matrix-green text-sm mb-2">📊 Performance Predictions</div>
                      <div className="animate-pulse h-24 bg-matrix-green/10 rounded"></div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Customer Testimonials Section */}
      <section className="py-16 bg-matrix-dark-gray">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold mb-4 text-matrix-green drop-shadow-[0_0_10px_rgba(0,255,65,0.8)]">Trusted by Content Creators Worldwide</h2>
            <p className="max-w-2xl mx-auto text-matrix-green/70">
              See how businesses are dominating AI search with our AEO optimization platform.
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto">
            {testimonials.map((testimonial, index) => (
              <div key={index} className="content-card p-6">
                <div className="flex mb-4">
                  {[...Array(testimonial.rating)].map((_, i) => (
                    <Star key={i} className="w-5 h-5 text-matrix-green fill-current" />
                  ))}
                </div>
                <p className="text-matrix-green/80 mb-4 italic">"{testimonial.content}"</p>
                <div>
                  <div className="font-bold text-matrix-green">{testimonial.name}</div>
                  <div className="text-sm text-matrix-green/70">{testimonial.role} at {testimonial.company}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
      
      {/* Features Section with Benefits */}
      <section id="features" className="py-16 bg-black">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold mb-4 text-matrix-green drop-shadow-[0_0_10px_rgba(0,255,65,0.8)]">Everything You Need to Dominate AI Search</h2>
            <p className="max-w-2xl mx-auto text-matrix-green/70">
              Our platform provides all the tools you need to optimize content for answer engines and featured snippets.
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {featureBlocks.map((feature, index) => (
              <div key={index} className="content-card p-6 hover:scale-[1.02] transition-all">
                <div className="mb-4">{feature.icon}</div>
                <h3 className="text-xl font-bold mb-2 text-matrix-green">{feature.title}</h3>
                <p className="text-matrix-green/70 mb-3">{feature.description}</p>
                <div className="text-sm text-matrix-lime font-semibold">{feature.benefit}</div>
              </div>
            ))}
          </div>
        </div>
      </section>
      
      {/* How It Works */}
      <section className="py-16 bg-matrix-dark-gray">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold mb-4 text-matrix-green drop-shadow-[0_0_10px_rgba(0,255,65,0.8)]">From Keyword to AI-Optimized Content in 3 Steps</h2>
            <p className="max-w-2xl mx-auto text-matrix-green/70">
              Our streamlined process makes it easy to create content that AI search engines love.
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-4xl mx-auto">
            <div className="content-card p-6 text-center">
              <div className="w-12 h-12 rounded-full bg-gradient-to-r from-matrix-green to-matrix-lime text-black flex items-center justify-center mx-auto mb-4 shadow-green-glow">
                <span className="font-bold">1</span>
              </div>
              <h3 className="text-xl mb-2 font-extrabold text-matrix-green">Enter Your Keyword</h3>
              <p className="text-base text-matrix-green/80 font-semibold">
                Simply enter the keyword or question you want to optimize content for.
              </p>
            </div>
            <div className="content-card p-6 text-center">
              <div className="w-12 h-12 rounded-full bg-gradient-to-r from-matrix-green to-matrix-lime text-black flex items-center justify-center mx-auto mb-4 shadow-green-glow">
                <span className="font-bold">2</span>
              </div>
              <h3 className="text-xl mb-2 font-extrabold text-matrix-green">AI Generates Content</h3>
              <p className="text-matrix-green/80 font-semibold">
                Our AI creates optimized content with schema markup, FAQs, and structured data.
              </p>
            </div>
            <div className="content-card p-6 text-center">
              <div className="w-12 h-12 rounded-full bg-gradient-to-r from-matrix-green to-matrix-lime text-black flex items-center justify-center mx-auto mb-4 shadow-green-glow">
                <span className="font-bold">3</span>
              </div>
              <h3 className="text-xl mb-2 font-extrabold text-matrix-green">Export & Publish</h3>
              <p className="text-matrix-green/80 text-base font-semibold">
                Export your AEO-optimized content and publish it to start ranking in AI search.
              </p>
            </div>
          </div>
        </div>
      </section>
      
      {/* Enhanced Pricing Section */}
      <section id="pricing" className="py-16 bg-black">
        <div className="container mx-auto px-4">
          <div className="content-card rounded-lg backdrop-blur-sm">
            <div className="text-center mb-16 pt-16">
              <h2 className="text-3xl font-bold mb-4 text-matrix-green drop-shadow-[0_0_10px_rgba(0,255,65,0.8)]">Choose Your AEO Plan</h2>
              <p className="max-w-2xl mx-auto text-matrix-green/70 mb-8">
                Start with our free plan and upgrade when you're ready. All plans include a 7-day free trial.
              </p>
              <div className="inline-flex items-center bg-matrix-dark-gray rounded-lg p-1">
                <button className="px-4 py-2 rounded-md bg-matrix-green text-black text-sm font-medium">Monthly</button>
                <button className="px-4 py-2 rounded-md text-matrix-green text-sm">Annual (Save 20%)</button>
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto pb-16">
              {pricingPlans.map((plan, index) => (
                <div key={index} className={`content-card p-8 ${plan.highlighted ? 'neon-border ring-1 ring-matrix-green/50 scale-105' : ''}`}>
                  {plan.highlighted && (
                    <div className="bg-gradient-to-r from-matrix-green to-matrix-lime text-black text-xs font-medium py-1 px-3 rounded-full inline-block mb-4">
                      Most Popular
                    </div>
                  )}
                  <h3 className="text-2xl font-bold text-matrix-green">{plan.name}</h3>
                  <div className="mt-4 mb-6">
                    <span className="text-4xl font-bold text-matrix-green">{plan.price}</span>
                    {plan.period && <span className="text-matrix-green/70 ml-1">{plan.period}</span>}
                    {plan.annualPrice && (
                      <div className="text-sm text-matrix-lime mt-1">
                        ${plan.annualPrice}/month when billed annually
                      </div>
                    )}
                  </div>
                  <p className="mb-6 text-matrix-green/80">{plan.description}</p>
                  <ul className="space-y-3 mb-8">
                    {plan.features.map((feature, fIndex) => (
                      <li key={fIndex} className="flex items-start">
                        <CheckCircle className="w-5 h-5 text-matrix-green mr-2 flex-shrink-0 mt-0.5" />
                        <span className="text-matrix-green/80">{feature}</span>
                      </li>
                    ))}
                  </ul>
                  <Button 
                    onClick={plan.ctaAction} 
                    className={plan.highlighted ? "w-full glow-button text-black font-semibold" : "w-full border-matrix-green text-matrix-green hover:bg-matrix-green/10"} 
                    variant={plan.highlighted ? "default" : "outline"}
                  >
                    {plan.cta}
                  </Button>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>
      
      {/* Examples Section */}
      <section id="examples" className="py-16 bg-matrix-dark-gray">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold mb-4 text-matrix-green drop-shadow-[0_0_10px_rgba(0,255,65,0.8)]">Real AEO Success Stories</h2>
            <p className="max-w-2xl mx-auto text-matrix-green/70">
              See how our platform has helped businesses dominate featured snippets and AI answer boxes.
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              { title: "Best Coffee Makers for Home", metric: "↑ 340% snippet visibility", industry: "E-commerce" },
              { title: "How to Start a Podcast", metric: "↑ 280% voice search traffic", industry: "Education" },
              { title: "Top Tourist Attractions in Paris", metric: "↑ 450% AI answer appearances", industry: "Travel" }
            ].map((example, index) => (
              <div key={index} className="content-card p-6 hover:scale-[1.02] transition-all cursor-pointer">
                <div className="h-40 rounded-lg mb-4 bg-matrix-dark-gray border border-matrix-green/30 flex items-center justify-center">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-matrix-green mb-2">{example.metric}</div>
                    <div className="text-sm text-matrix-green/70">{example.industry}</div>
                  </div>
                </div>
                <h3 className="text-xl font-bold mb-2 text-matrix-green">{example.title}</h3>
                <p className="text-matrix-green/70 mb-4">
                  See how we optimized this content for AI answer engines and achieved outstanding results.
                </p>
                <Button variant="ghost" className="text-matrix-green hover:text-matrix-lime p-0">
                  View Case Study <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </div>
            ))}
          </div>
        </div>
      </section>
      
      {/* FAQ Section */}
      <section className="py-16 bg-black">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold mb-4 text-matrix-green drop-shadow-[0_0_10px_rgba(0,255,65,0.8)]">Frequently Asked Questions</h2>
            <p className="max-w-2xl mx-auto text-matrix-green/70">Get answers to common questions about GenerativeSearch.pro and Answer Engine Optimization.</p>
          </div>
          
          <div className="max-w-3xl mx-auto">
            <div className="divide-y border-t border-b border-matrix-green/30">
              {faqs.map((faq, index) => (
                <div key={index} className="py-5">
                  <button 
                    onClick={() => setFaqOpen(faqOpen === index ? null : index)} 
                    className="flex justify-between items-center w-full text-left"
                  >
                    <h3 className="text-lg font-medium text-matrix-green">{faq.question}</h3>
                    {faqOpen === index ? 
                      <ChevronUp className="h-5 w-5 text-matrix-green" /> : 
                      <ChevronDown className="h-5 w-5 text-matrix-green" />
                    }
                  </button>
                  {faqOpen === index && (
                    <div className="mt-3">
                      <p className="text-matrix-green/80">{faq.answer}</p>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>
      
      {/* Enhanced CTA Section */}
      <section className="py-16 bg-gradient-to-r from-matrix-green to-matrix-lime text-black">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold mb-6">Ready to Dominate AI Search Results?</h2>
          <p className="text-xl mb-10 max-w-2xl mx-auto">
            Join 2,500+ content creators who are already winning with AEO optimization. Start your free trial today.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button 
              size="lg" 
              onClick={() => navigate('/auth', { state: { signUp: true } })} 
              className="text-matrix-green bg-black hover:bg-matrix-dark-gray border border-matrix-green text-lg px-8 py-4"
            >
              Start 7-Day Free Trial
              <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
            <Button 
              size="lg" 
              variant="outline"
              className="border-black text-black hover:bg-black/10 text-lg px-8 py-4"
            >
              Schedule Demo
            </Button>
          </div>
          <p className="mt-6 text-sm opacity-80">No credit card required • Cancel anytime • 24/7 support</p>
        </div>
      </section>
      
      <Footer />
    </div>
  );
};

export default Index;
