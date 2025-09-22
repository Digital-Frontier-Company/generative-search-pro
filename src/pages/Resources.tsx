
import { useState } from "react";
import { Link } from "react-router-dom";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import Header from "@/components/global/Header";
import { 
  BookOpen, 
  Video, 
  FileText, 
  HelpCircle, 
  Search, 
  ExternalLink, 
  Clock,
  Star,
  Users,
  TrendingUp
} from "lucide-react";

const Resources = () => {
  const [searchQuery, setSearchQuery] = useState("");

  const guides = [
    {
      title: "Complete Guide to Answer Engine Optimization",
      description: "Learn the fundamentals of AEO and how to optimize content for AI search engines.",
      readTime: "15 min read",
      category: "Beginner",
      rating: 4.9,
      isPopular: true
    },
    {
      title: "Advanced Schema Markup Strategies",
      description: "Deep dive into JSON-LD implementation and advanced structured data techniques.",
      readTime: "25 min read",
      category: "Advanced",
      rating: 4.8,
      isPopular: false
    },
    {
      title: "Voice Search Optimization Tactics",
      description: "Optimize your content for voice assistants and conversational AI.",
      readTime: "12 min read",
      category: "Intermediate",
      rating: 4.7,
      isPopular: true
    }
  ];

  const tutorials = [
    {
      title: "Getting Started with GenerativeSearch.pro",
      description: "A complete walkthrough of all platform features and tools.",
      duration: "18:30",
      views: "12.5K",
      isNew: true
    },
    {
      title: "Creating AI-Optimized Content",
      description: "Step-by-step tutorial on generating content that ranks in AI search.",
      duration: "24:15",
      views: "8.7K",
      isNew: false
    },
    {
      title: "Schema Markup Implementation",
      description: "How to implement and test structured data for better AI visibility.",
      duration: "16:45",
      views: "6.2K",
      isNew: false
    }
  ];

  const faqs = [
    {
      question: "What is Answer Engine Optimization (AEO)?",
      answer: "AEO is the practice of optimizing content specifically for AI-powered answer engines like ChatGPT, Google's AI search, and voice assistants. It focuses on creating structured, easily digestible content that AI can understand and present as direct answers.",
      category: "Basics"
    },
    {
      question: "How is AEO different from traditional SEO?",
      answer: "While SEO focuses on ranking in search results, AEO targets getting your content selected for featured snippets, voice search responses, and AI answer boxes. AEO emphasizes content structure, question-answer formats, and machine-readable data.",
      category: "Basics"
    },
    {
      question: "How long does it take to see AEO results?",
      answer: "AEO results can appear faster than traditional SEO, often within 2-4 weeks for well-optimized content. However, consistent implementation and content quality are key factors in achieving sustained visibility.",
      category: "Results"
    },
    {
      question: "Can I use AEO for local businesses?",
      answer: "Absolutely! Local AEO is highly effective. Focus on location-based questions, local schema markup, and creating content that answers common local queries about your business or industry.",
      category: "Local SEO"
    }
  ];

  return (
    <>
      <Header />
      <div className="container mx-auto py-8">
        <div className="max-w-6xl mx-auto space-y-6">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-matrix-green mb-2">Resources & Learning Center</h1>
            <p className="text-matrix-green/70">Master Answer Engine Optimization with our comprehensive guides and tutorials</p>
          </div>

          {/* Search */}
          <Card className="content-card">
            <CardContent className="py-6">
              <div className="relative max-w-md mx-auto">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-matrix-green/50 w-4 h-4" />
                <Input
                  placeholder="Search guides, tutorials, and FAQs..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 bg-matrix-dark-gray border-matrix-green/30 text-matrix-green"
                />
              </div>
            </CardContent>
          </Card>

          <Tabs defaultValue="guides" className="w-full">
            <TabsList className="grid w-full grid-cols-3 bg-matrix-dark-gray">
              <TabsTrigger value="guides" className="text-matrix-green data-[state=active]:bg-matrix-green data-[state=active]:text-black">
                <BookOpen className="w-4 h-4 mr-2" />
                Guides
              </TabsTrigger>
              <TabsTrigger value="tutorials" className="text-matrix-green data-[state=active]:bg-matrix-green data-[state=active]:text-black">
                <Video className="w-4 h-4 mr-2" />
                Video Tutorials
              </TabsTrigger>
              <TabsTrigger value="faq" className="text-matrix-green data-[state=active]:bg-matrix-green data-[state=active]:text-black">
                <HelpCircle className="w-4 h-4 mr-2" />
                FAQ
              </TabsTrigger>
            </TabsList>

            <TabsContent value="guides" className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {guides.map((guide, index) => (
                  <Card key={index} className="content-card hover:scale-[1.02] transition-all cursor-pointer">
                    <CardHeader>
                      <div className="flex justify-between items-start mb-2">
                        <Badge variant={guide.category === 'Beginner' ? 'default' : guide.category === 'Advanced' ? 'destructive' : 'secondary'}>
                          {guide.category}
                        </Badge>
                        {guide.isPopular && (
                          <Badge className="bg-matrix-green text-black">
                            <TrendingUp className="w-3 h-3 mr-1" />
                            Popular
                          </Badge>
                        )}
                      </div>
                      <CardTitle className="text-lg text-matrix-green">{guide.title}</CardTitle>
                      <CardDescription className="text-matrix-green/70">
                        {guide.description}
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      <div className="flex items-center justify-between text-sm text-matrix-green/70">
                        <div className="flex items-center gap-1">
                          <Clock className="w-4 h-4" />
                          {guide.readTime}
                        </div>
                        <div className="flex items-center gap-1">
                          <Star className="w-4 h-4 fill-current text-matrix-green" />
                          {guide.rating}
                        </div>
                      </div>
                      {guide.title === "Advanced Schema Markup Strategies" ? (
                        <Link to="/schema-markup-guide">
                          <Button variant="outline" className="w-full border-matrix-green text-matrix-green hover:bg-matrix-green/10">
                            Read Guide
                            <ExternalLink className="w-4 h-4 ml-2" />
                          </Button>
                        </Link>
                      ) : (
                        <Button variant="outline" className="w-full border-matrix-green text-matrix-green hover:bg-matrix-green/10">
                          Read Guide
                          <ExternalLink className="w-4 h-4 ml-2" />
                        </Button>
                      )}
                    </CardContent>
                  </Card>
                ))}
              </div>
            </TabsContent>

            <TabsContent value="tutorials" className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {tutorials.map((tutorial, index) => (
                  <Card key={index} className="content-card hover:scale-[1.02] transition-all cursor-pointer">
                    <CardHeader>
                      <div className="aspect-video bg-matrix-dark-gray rounded-lg mb-4 flex items-center justify-center border border-matrix-green/30">
                        <Video className="w-12 h-12 text-matrix-green/50" />
                        {tutorial.isNew && (
                          <Badge className="absolute top-2 right-2 bg-matrix-green text-black">
                            New
                          </Badge>
                        )}
                      </div>
                      <CardTitle className="text-lg text-matrix-green">{tutorial.title}</CardTitle>
                      <CardDescription className="text-matrix-green/70">
                        {tutorial.description}
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      <div className="flex items-center justify-between text-sm text-matrix-green/70">
                        <div className="flex items-center gap-1">
                          <Clock className="w-4 h-4" />
                          {tutorial.duration}
                        </div>
                        <div className="flex items-center gap-1">
                          <Users className="w-4 h-4" />
                          {tutorial.views} views
                        </div>
                      </div>
                      <Button variant="outline" className="w-full border-matrix-green text-matrix-green hover:bg-matrix-green/10">
                        Watch Tutorial
                        <ExternalLink className="w-4 h-4 ml-2" />
                      </Button>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </TabsContent>

            <TabsContent value="faq" className="space-y-6">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="space-y-4">
                  {faqs.slice(0, 2).map((faq, index) => (
                    <Card key={index} className="content-card">
                      <CardHeader>
                        <div className="flex justify-between items-start">
                          <CardTitle className="text-lg text-matrix-green">{faq.question}</CardTitle>
                          <Badge variant="outline" className="border-matrix-green/30 text-matrix-green/70 text-xs">
                            {faq.category}
                          </Badge>
                        </div>
                      </CardHeader>
                      <CardContent>
                        <p className="text-matrix-green/80">{faq.answer}</p>
                      </CardContent>
                    </Card>
                  ))}
                </div>
                <div className="space-y-4">
                  {faqs.slice(2).map((faq, index) => (
                    <Card key={index + 2} className="content-card">
                      <CardHeader>
                        <div className="flex justify-between items-start">
                          <CardTitle className="text-lg text-matrix-green">{faq.question}</CardTitle>
                          <Badge variant="outline" className="border-matrix-green/30 text-matrix-green/70 text-xs">
                            {faq.category}
                          </Badge>
                        </div>
                      </CardHeader>
                      <CardContent>
                        <p className="text-matrix-green/80">{faq.answer}</p>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
            </TabsContent>
          </Tabs>

          {/* Contact Support */}
          <Card className="content-card">
            <CardContent className="py-8 text-center">
              <h3 className="text-xl font-bold text-matrix-green mb-2">Need More Help?</h3>
              <p className="text-matrix-green/70 mb-4">
                Can't find what you're looking for? Our support team is here to help.
              </p>
              <Button className="glow-button text-black font-semibold">
                Contact Support
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </>
  );
};

export default Resources;
