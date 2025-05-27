
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { CheckCircle, ArrowRight, Zap, Database, Globe, Sparkles, ChevronDown, ChevronUp } from "lucide-react";
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
      description: "Create content specifically structured for AI answer engines and featured snippets with the click of a button."
    },
    {
      icon: <Database className="w-10 h-10 text-matrix-lime" />,
      title: "Schema Markup & Metadata",
      description: "Automatically generate JSON-LD schema markup and metadata to help search engines understand your content."
    },
    {
      icon: <Globe className="w-10 h-10 text-matrix-emerald" />,
      title: "FAQ & Structured Data",
      description: "Generate relevant FAQs and structured data that increases your chances of appearing in featured snippets."
    },
    {
      icon: <Sparkles className="w-10 h-10 text-matrix-neon" />,
      title: "One-Click Export",
      description: "Export your optimized content as HTML or JSON for easy integration with your website or CMS."
    }
  ];

  const pricingPlans = [
    {
      name: "Free",
      price: "$0",
      description: "Perfect for trying out AEO content generation",
      features: [
        "5 content generations per month",
        "Basic content elements",
        "HTML export",
        "Copy & paste implementation"
      ],
      cta: "Get Started",
      ctaAction: () => navigate('/auth', { state: { signUp: true } }),
      highlighted: false
    },
    {
      name: "Premium",
      price: "$29",
      period: "per month",
      description: "For professionals and growing websites",
      features: [
        "Unlimited content generations",
        "Advanced schema markup",
        "Priority generation queue",
        "Content performance analytics",
        "Custom export templates",
        "Email support"
      ],
      cta: "Upgrade to Premium",
      ctaAction: () => navigate('/auth', { state: { signUp: true } }),
      highlighted: true
    }
  ];

  return (
    <div className="min-h-screen flex flex-col bg-black">
      <JsonLdSchema schema={[...getHomepageSchema(), getHomepageFAQSchema()]} />
      <Header />
      
      {/* Hero Section with Matrix Green Gradient Background */}
      <section className="py-16 md:py-24 relative overflow-hidden hero-gradient">
        <div className="absolute inset-0 bg-black/30"></div>
        <div className="container mx-auto px-4 relative z-10">
          <div className="max-w-3xl mx-auto text-center">
            <h1 className="text-4xl md:text-6xl font-bold mb-6 text-matrix-green drop-shadow-[0_0_20px_rgba(0,255,65,0.8)]">
              <span className="text-matrix-green">Optimize Your Content</span>
              <br /> 
              <span className="gradient-text animate-text-glow">for AI Answer Engines and Generative Engines</span>
            </h1>
            <p className="text-lg md:text-xl text-matrix-green/80 mb-10">
              Generate optimized content that ranks in featured snippets and AI answer boxes. Improve visibility with structured data and AEO best practices.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button 
                size="lg" 
                onClick={() => navigate('/auth', { state: { signUp: true } })} 
                className="glow-button text-black font-semibold"
              >
                Get Started Free
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
              <Button 
                size="lg" 
                variant="outline" 
                className="border-matrix-green text-matrix-green hover:bg-matrix-green/10 hover:border-matrix-lime"
              >
                View Examples
              </Button>
            </div>
            
            {/* Preview Section */}
            <div className="mt-16">
              <div className="content-card overflow-hidden">
                <div className="bg-matrix-dark-gray border-b border-matrix-green/30 p-4">
                  <div className="flex items-center space-x-2">
                    <div className="w-3 h-3 bg-red-400 rounded-full"></div>
                    <div className="w-3 h-3 bg-yellow-400 rounded-full"></div>
                    <div className="w-3 h-3 bg-matrix-green rounded-full"></div>
                    <div className="ml-4 text-sm text-matrix-green/70">GenerativeSearch.pro GEO & AEO Generator</div>
                  </div>
                </div>
                <div className="p-6">
                  <div className="mb-6">
                    <div className="text-sm text-matrix-green/70 mb-2">Enter your target keyword:</div>
                    <div className="flex gap-4">
                      <div className="flex-1 p-3 border border-matrix-green/30 rounded-lg bg-matrix-dark-gray text-matrix-green/70">best coffee grinder for home</div>
                      <Button className="glow-button text-black font-semibold">Generate</Button>
                    </div>
                  </div>
                  <div className="space-y-6">
                    <div className="p-4 border border-matrix-green/30 rounded-lg bg-matrix-dark-gray animate-pulse h-20"></div>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="p-4 border border-matrix-green/30 rounded-lg bg-matrix-dark-gray animate-pulse h-16"></div>
                      <div className="p-4 border border-matrix-green/30 rounded-lg bg-matrix-dark-gray animate-pulse h-16"></div>
                    </div>
                    <div className="p-4 border border-matrix-green/30 rounded-lg bg-matrix-dark-gray animate-pulse h-32"></div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
      
      {/* Features Section */}
      <section id="features" className="py-16 bg-black">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold mb-4 text-matrix-green drop-shadow-[0_0_10px_rgba(0,255,65,0.8)]">AEO-Optimized Content in Seconds</h2>
            <p className="max-w-2xl mx-auto text-matrix-green/70">
              FrontierAEO helps you create content that's perfectly structured for AI answer engines and featured snippets.
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {featureBlocks.map((feature, index) => (
              <div key={index} className="content-card p-6">
                <div className="mb-4">{feature.icon}</div>
                <h3 className="text-xl font-bold mb-2 text-matrix-green">{feature.title}</h3>
                <p className="text-matrix-green/70">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
      
      {/* How It Works */}
      <section className="py-16 bg-matrix-dark-gray">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold mb-4 text-matrix-green drop-shadow-[0_0_10px_rgba(0,255,65,0.8)]">How It Works</h2>
            <p className="max-w-2xl mx-auto text-matrix-green/70">
              Generating AEO-optimized content is simple with our three-step process.
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-4xl mx-auto">
            <div className="content-card p-6 text-center">
              <div className="w-12 h-12 rounded-full bg-gradient-to-r from-matrix-green to-matrix-lime text-black flex items-center justify-center mx-auto mb-4 shadow-green-glow">
                <span className="font-bold">1</span>
              </div>
              <h3 className="text-xl mb-2 font-extrabold text-matrix-green">Enter Your Keyword</h3>
              <p className="text-base text-matrix-green/80 font-semibold">
                Simply enter the keyword or topic you want to optimize content for.
              </p>
            </div>
            <div className="content-card p-6 text-center">
              <div className="w-12 h-12 rounded-full bg-gradient-to-r from-matrix-green to-matrix-lime text-black flex items-center justify-center mx-auto mb-4 shadow-green-glow">
                <span className="font-bold">2</span>
              </div>
              <h3 className="text-xl mb-2 font-extrabold text-matrix-green">Generate Content</h3>
              <p className="text-matrix-green/80 font-semibold">
                Our AI creates optimized content with all the necessary structured data.
              </p>
            </div>
            <div className="content-card p-6 text-center">
              <div className="w-12 h-12 rounded-full bg-gradient-to-r from-matrix-green to-matrix-lime text-black flex items-center justify-center mx-auto mb-4 shadow-green-glow">
                <span className="font-bold">3</span>
              </div>
              <h3 className="text-xl mb-2 font-extrabold text-matrix-green">Export & Implement</h3>
              <p className="text-matrix-green/80 text-base font-semibold">
                Export your content as HTML or JSON and add it to your website.
              </p>
            </div>
          </div>
        </div>
      </section>
      
      {/* Pricing Section */}
      <section id="pricing" className="py-16 bg-black">
        <div className="container mx-auto px-4">
          <div className="content-card rounded-lg backdrop-blur-sm">
            <div className="text-center mb-16 pt-16">
              <h2 className="text-3xl font-bold mb-4 text-matrix-green drop-shadow-[0_0_10px_rgba(0,255,65,0.8)]">Simple, Transparent Pricing</h2>
              <p className="max-w-2xl mx-auto text-matrix-green/70">
                Start with our free plan and upgrade when you're ready. No hidden fees or complicated tiers.
              </p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto pb-16">
              {pricingPlans.map((plan, index) => (
                <div key={index} className={`content-card p-8 ${plan.highlighted ? 'neon-border ring-1 ring-matrix-green/50' : ''}`}>
                  {plan.highlighted && (
                    <div className="bg-gradient-to-r from-matrix-green to-matrix-lime text-black text-xs font-medium py-1 px-3 rounded-full inline-block mb-4">
                      Most Popular
                    </div>
                  )}
                  <h3 className="text-2xl font-bold text-matrix-green">{plan.name}</h3>
                  <div className="mt-4 mb-6">
                    <span className="text-4xl font-bold text-matrix-green">{plan.price}</span>
                    {plan.period && <span className="text-matrix-green/70 ml-1">{plan.period}</span>}
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
            <h2 className="text-3xl font-bold mb-4 text-matrix-green drop-shadow-[0_0_10px_rgba(0,255,65,0.8)]">See GenerativeSearch.pro in Action</h2>
            <p className="max-w-2xl mx-auto text-matrix-green/70">
              Browse examples of AEO-optimized content generated by our platform.
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {["Best Coffee Makers for Home", "How to Start a Podcast", "Top Tourist Attractions in Paris"].map((example, index) => (
              <div key={index} className="content-card p-6 hover:scale-[1.02] transition-all cursor-pointer">
                <div className="h-40 rounded-lg mb-4 bg-matrix-dark-gray border border-matrix-green/30"></div>
                <h3 className="text-xl font-bold mb-2 text-matrix-green">{example}</h3>
                <p className="text-matrix-green/70 mb-4">
                  See how we optimized this content for AI answer engines and featured snippets.
                </p>
                <Button variant="ghost" className="text-matrix-green hover:text-matrix-lime p-0">
                  View Example <ArrowRight className="ml-2 h-4 w-4" />
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
      
      {/* CTA Section */}
      <section className="py-16 bg-gradient-to-r from-matrix-green to-matrix-lime text-black">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold mb-6">Ready to Optimize Your Content?</h2>
          <p className="text-xl mb-10 max-w-2xl mx-auto">
            Start generating AEO-optimized content today and increase your chances of appearing in AI answer boxes.
          </p>
          <Button 
            size="lg" 
            onClick={() => navigate('/auth', { state: { signUp: true } })} 
            className="text-matrix-green bg-black hover:bg-matrix-dark-gray border border-matrix-green"
          >
            Get Started Free
            <ArrowRight className="ml-2 h-5 w-5" />
          </Button>
        </div>
      </section>
      
      <Footer />
    </div>
  );
};

export default Index;
