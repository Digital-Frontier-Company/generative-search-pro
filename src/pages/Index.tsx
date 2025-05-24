import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { CheckCircle, ArrowRight, Zap, Database, Globe, Sparkles, ChevronDown, ChevronUp } from "lucide-react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
const Index = () => {
  const navigate = useNavigate();
  const [faqOpen, setFaqOpen] = useState<number | null>(0);
  const faqs = [{
    question: "What is Answer Engine Optimization (AEO)?",
    answer: "AEO is a strategy that focuses on optimizing content specifically for AI-powered answer engines and featured snippets. Unlike traditional SEO that aims for general rankings, AEO targets the specific formats and structures that help content get selected for direct answers in search results."
  }, {
    question: "How does FrontierAEO differ from regular SEO tools?",
    answer: "FrontierAEO is specifically designed to optimize content for AI answers and featured snippets. It generates structured content that includes metadata, schema markup, FAQs, and other components that help search engines understand and prioritize your content for direct answers."
  }, {
    question: "Do I need technical knowledge to use FrontierAEO?",
    answer: "No technical knowledge is required. Our tool generates ready-to-use HTML and structured data that you can simply copy and paste into your content management system or website."
  }, {
    question: "How many content pieces can I generate with the free tier?",
    answer: "The free tier allows you to generate 5 content pieces per month. For unlimited generations and additional features, you can upgrade to our Premium plan at any time."
  }, {
    question: "Can I customize the generated content?",
    answer: "Yes, all generated content can be customized before export. You can edit the hero answer, FAQs, meta descriptions, and other components to better match your brand voice and specific needs."
  }];
  const featureBlocks = [{
    icon: <Zap className="w-10 h-10 text-aeo-blue" />,
    title: "AI-Optimized Content Generation",
    description: "Create content specifically structured for AI answer engines and featured snippets with the click of a button."
  }, {
    icon: <Database className="w-10 h-10 text-aeo-purple" />,
    title: "Schema Markup & Metadata",
    description: "Automatically generate JSON-LD schema markup and metadata to help search engines understand your content."
  }, {
    icon: <Globe className="w-10 h-10 text-aeo-indigo" />,
    title: "FAQ & Structured Data",
    description: "Generate relevant FAQs and structured data that increases your chances of appearing in featured snippets."
  }, {
    icon: <Sparkles className="w-10 h-10 text-aeo-blue" />,
    title: "One-Click Export",
    description: "Export your optimized content as HTML or JSON for easy integration with your website or CMS."
  }];
  const pricingPlans = [{
    name: "Free",
    price: "$0",
    description: "Perfect for trying out AEO content generation",
    features: ["5 content generations per month", "Basic content elements", "HTML export", "Copy & paste implementation"],
    cta: "Get Started",
    ctaAction: () => navigate('/auth', {
      state: {
        signUp: true
      }
    }),
    highlighted: false
  }, {
    name: "Premium",
    price: "$29",
    period: "per month",
    description: "For professionals and growing websites",
    features: ["Unlimited content generations", "Advanced schema markup", "Priority generation queue", "Content performance analytics", "Custom export templates", "Email support"],
    cta: "Upgrade to Premium",
    ctaAction: () => navigate('/auth', {
      state: {
        signUp: true
      }
    }),
    highlighted: true
  }];
  return <div className="min-h-screen flex flex-col">
      <Header />
      
      {/* Hero Section */}
      <section className="hero-gradient py-16 md:py-24">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto text-center">
            <h1 className="text-4xl md:text-6xl font-bold mb-6">
              <span className="gradient-text">Optimize Your Content</span>
              <br /> for AI Answer Engines
            </h1>
            <p className="text-lg md:text-xl text-gray-600 mb-10">
              Generate optimized content that ranks in featured snippets and AI answer boxes. Improve visibility with structured data and AEO best practices.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button size="lg" onClick={() => navigate('/auth', {
              state: {
                signUp: true
              }
            })} className="bg-aeo-blue hover:bg-aeo-blue/90">
                Get Started Free
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
              <Button size="lg" variant="outline">
                View Examples
              </Button>
            </div>
            <div className="mt-16">
              <div className="bg-white rounded-xl shadow-xl border border-gray-100 overflow-hidden">
                <div className="bg-gray-50 border-b border-gray-100 p-4">
                  <div className="flex items-center space-x-2">
                    <div className="w-3 h-3 bg-red-400 rounded-full"></div>
                    <div className="w-3 h-3 bg-yellow-400 rounded-full"></div>
                    <div className="w-3 h-3 bg-green-400 rounded-full"></div>
                    <div className="ml-4 text-sm text-gray-500">FrontierAEO Generator</div>
                  </div>
                </div>
                <div className="p-6">
                  <div className="mb-6">
                    <div className="text-sm text-gray-500 mb-2">Enter your target keyword:</div>
                    <div className="flex gap-4">
                      <div className="flex-1 p-3 border rounded-lg bg-gray-50 text-gray-400">best coffee grinder for home</div>
                      <Button className="bg-aeo-indigo hover:bg-aeo-indigo/90">Generate</Button>
                    </div>
                  </div>
                  <div className="space-y-6">
                    <div className="p-4 border rounded-lg bg-gray-50 animate-pulse h-20"></div>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="p-4 border rounded-lg bg-gray-50 animate-pulse h-16"></div>
                      <div className="p-4 border rounded-lg bg-gray-50 animate-pulse h-16"></div>
                    </div>
                    <div className="p-4 border rounded-lg bg-gray-50 animate-pulse h-32"></div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
      
      {/* Features Section */}
      <section id="features" className="py-16 bg-blue-950">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold mb-4">AEO-Optimized Content in Seconds</h2>
            <p className="max-w-2xl mx-auto text-gray-50">
              FrontierAEO helps you create content that's perfectly structured for AI answer engines and featured snippets.
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {featureBlocks.map((feature, index) => <div key={index} className="content-card p-6 bg-red-800">
                <div className="mb-4">{feature.icon}</div>
                <h3 className="text-xl font-bold mb-2">{feature.title}</h3>
                <p className="text-slate-50">{feature.description}</p>
              </div>)}
          </div>
        </div>
      </section>
      
      {/* How It Works */}
      <section className="py-16 bg-blue-950">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold mb-4">How It Works</h2>
            <p className="max-w-2xl mx-auto text-slate-50">
              Generating AEO-optimized content is simple with our three-step process.
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-4xl mx-auto">
            <div className="content-card p-6 text-center">
              <div className="w-12 h-12 rounded-full bg-aeo-blue/10 text-aeo-blue flex items-center justify-center mx-auto mb-4">
                <span className="font-bold">1</span>
              </div>
              <h3 className="text-xl mb-2 font-extrabold text-red-600">Enter Your Keyword</h3>
              <p className="text-base text-slate-50 font-semibold">
                Simply enter the keyword or topic you want to optimize content for.
              </p>
            </div>
            <div className="content-card p-6 text-center">
              <div className="w-12 h-12 rounded-full bg-aeo-purple/10 text-aeo-purple flex items-center justify-center mx-auto mb-4">
                <span className="font-bold">2</span>
              </div>
              <h3 className="text-xl mb-2 font-extrabold text-red-600">Generate Content</h3>
              <p className="text-slate-50 font-semibold">
                Our AI creates optimized content with all the necessary structured data.
              </p>
            </div>
            <div className="content-card p-6 text-center">
              <div className="w-12 h-12 rounded-full bg-aeo-indigo/10 text-aeo-indigo flex items-center justify-center mx-auto mb-4">
                <span className="font-bold">3</span>
              </div>
              <h3 className="text-xl mb-2 font-extrabold text-red-600">Export & Implement</h3>
              <p className="text-slate-50 text-base font-semibold">
                Export your content as HTML or JSON and add it to your website.
              </p>
            </div>
          </div>
        </div>
      </section>
      
      {/* Pricing Section */}
      <section id="pricing" className="py-16 bg-gray-950">
        <div className="container mx-auto px-4 bg-[#fd2151]/[0.57] rounded-lg">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold mb-4">Simple, Transparent Pricing</h2>
            <p className="max-w-2xl mx-auto text-slate-50">
              Start with our free plan and upgrade when you're ready. No hidden fees or complicated tiers.
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
            {pricingPlans.map((plan, index) => <div key={index} className={`content-card p-8 ${plan.highlighted ? 'border-aeo-blue/30 ring-1 ring-aeo-blue/20' : ''}`}>
                {plan.highlighted && <div className="bg-aeo-blue text-white text-xs font-medium py-1 px-3 rounded-full inline-block mb-4">
                    Most Popular
                  </div>}
                <h3 className="text-2xl font-bold">{plan.name}</h3>
                <div className="mt-4 mb-6">
                  <span className="text-4xl font-bold">{plan.price}</span>
                  {plan.period && <span className="text-gray-500 ml-1">{plan.period}</span>}
                </div>
                <p className="mb-6 text-slate-50">{plan.description}</p>
                <ul className="space-y-3 mb-8">
                  {plan.features.map((feature, fIndex) => <li key={fIndex} className="flex items-start">
                      <CheckCircle className="w-5 h-5 text-aeo-blue mr-2 flex-shrink-0 mt-0.5" />
                      <span className="text-slate-50">{feature}</span>
                    </li>)}
                </ul>
                <Button onClick={plan.ctaAction} className={plan.highlighted ? "w-full bg-aeo-blue hover:bg-aeo-blue/90" : "w-full"} variant={plan.highlighted ? "default" : "outline"}>
                  {plan.cta}
                </Button>
              </div>)}
          </div>
        </div>
      </section>
      
      {/* Examples Section */}
      <section id="examples" className="py-16 bg-gray-950">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold mb-4">See FrontierAEO in Action</h2>
            <p className="max-w-2xl mx-auto text-slate-50">
              Browse examples of AEO-optimized content generated by our platform.
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {["Best Coffee Makers for Home", "How to Start a Podcast", "Top Tourist Attractions in Paris"].map((example, index) => <div key={index} className="content-card p-6 hover:scale-[1.02] transition-all cursor-pointer">
                <div className="h-40 rounded-lg mb-4 bg-[#000a0e]/0"></div>
                <h3 className="text-xl font-bold mb-2">{example}</h3>
                <p className="text-gray-600 mb-4">
                  See how we optimized this content for AI answer engines and featured snippets.
                </p>
                <Button variant="ghost" className="text-aeo-blue hover:text-aeo-blue/90 p-0">
                  View Example <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </div>)}
          </div>
        </div>
      </section>
      
      {/* FAQ Section */}
      <section className="py-16 bg-blue-950">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold mb-4">Frequently Asked Questions</h2>
            <p className="max-w-2xl mx-auto text-slate-50">
              Get answers to common questions about FrontierAEO and Answer Engine Optimization.
            </p>
          </div>
          
          <div className="max-w-3xl mx-auto">
            <div className="divide-y border-t border-b">
              {faqs.map((faq, index) => <div key={index} className="py-5">
                  <button onClick={() => setFaqOpen(faqOpen === index ? null : index)} className="flex justify-between items-center w-full text-left">
                    <h3 className="text-lg font-medium">{faq.question}</h3>
                    {faqOpen === index ? <ChevronUp className="h-5 w-5 text-gray-500" /> : <ChevronDown className="h-5 w-5 text-gray-500" />}
                  </button>
                  {faqOpen === index && <div className="mt-3 text-gray-600">
                      <p className="text-slate-50">{faq.answer}</p>
                    </div>}
                </div>)}
            </div>
          </div>
        </div>
      </section>
      
      {/* CTA Section */}
      <section className="py-16 bg-gradient-to-r from-aeo-blue to-aeo-purple text-white bg-black">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold mb-6">Ready to Optimize Your Content?</h2>
          <p className="text-xl mb-10 max-w-2xl mx-auto">
            Start generating AEO-optimized content today and increase your chances of appearing in AI answer boxes.
          </p>
          <Button size="lg" onClick={() => navigate('/auth', {
          state: {
            signUp: true
          }
        })} className="text-aeo-blue bg-blue-900 hover:bg-blue-800">
            Get Started Free
            <ArrowRight className="ml-2 h-5 w-5" />
          </Button>
        </div>
      </section>
      
      <Footer />
    </div>;
};
export default Index;