
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { CheckCircle, Users, Trophy, Shield, Linkedin, Twitter, Mail, ArrowRight } from "lucide-react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { useNavigate } from "react-router-dom";

const About = () => {
  const navigate = useNavigate();

  const teamMembers = [
    {
      name: "Alex Chen",
      role: "Founder & CEO",
      bio: "Former Head of SEO at TechCorp with 8+ years optimizing content for search engines. AI/ML PhD from Stanford.",
      image: "/placeholder.svg",
      linkedin: "#",
      twitter: "#"
    },
    {
      name: "Sarah Martinez",
      role: "VP of Product",
      bio: "Ex-Google Search team member who worked on featured snippets algorithm. 10+ years in search technology.",
      image: "/placeholder.svg",
      linkedin: "#",
      twitter: "#"
    },
    {
      name: "Michael Thompson",
      role: "Head of Engineering",
      bio: "Former Senior Engineer at OpenAI. Specialist in natural language processing and content optimization.",
      image: "/placeholder.svg",
      linkedin: "#",
      twitter: "#"
    }
  ];

  const milestones = [
    {
      year: "2023",
      title: "Company Founded",
      description: "GenerativeSearch.pro launched to pioneer Answer Engine Optimization"
    },
    {
      year: "2024",
      title: "2,500+ Users",
      description: "Reached milestone of serving over 2,500 content creators worldwide"
    },
    {
      year: "2024",
      title: "Industry Recognition",
      description: "Featured in Search Engine Journal as 'Top AEO Tool to Watch'"
    },
    {
      year: "2024",
      title: "Enterprise Launch",
      description: "Launched team collaboration features for agencies and enterprises"
    }
  ];

  const certifications = [
    { name: "SOC 2 Type II", description: "Security & Privacy Compliance" },
    { name: "GDPR Compliant", description: "Data Protection Standards" },
    { name: "SSL Encrypted", description: "Enterprise-Grade Security" },
    { name: "99.9% Uptime", description: "Reliable Service Guarantee" }
  ];

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      
      {/* Hero Section */}
      <section className="py-16 md:py-24 hero-gradient">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center">
            <h1 className="text-4xl md:text-6xl font-bold mb-6 text-matrix-green drop-shadow-[0_0_10px_rgba(0,255,65,0.4)]">
              Pioneering the Future of 
              <span className="gradient-text block">AI Search Optimization</span>
            </h1>
            <p className="text-xl md:text-2xl text-matrix-green/90 mb-8 max-w-3xl mx-auto">
              We're building the tools that help content creators win in the age of AI-powered search engines.
            </p>
            
            {/* Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-12">
              <div className="text-center">
                <div className="text-3xl md:text-4xl font-bold text-matrix-green mb-2">2,500+</div>
                <div className="text-matrix-green/70">Active Users</div>
              </div>
              <div className="text-center">
                <div className="text-3xl md:text-4xl font-bold text-matrix-green mb-2">50K+</div>
                <div className="text-matrix-green/70">Content Pieces Generated</div>
              </div>
              <div className="text-center">
                <div className="text-3xl md:text-4xl font-bold text-matrix-green mb-2">300%</div>
                <div className="text-matrix-green/70">Avg. Snippet Increase</div>
              </div>
              <div className="text-center">
                <div className="text-3xl md:text-4xl font-bold text-matrix-green mb-2">99.9%</div>
                <div className="text-matrix-green/70">Uptime</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Mission Section */}
      <section className="py-16 bg-matrix-dark-gray">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <div className="text-center mb-16">
              <h2 className="text-3xl font-bold mb-6 text-matrix-green">Our Mission</h2>
              <p className="text-xl text-matrix-green/80 leading-relaxed">
                We believe the future of search is conversational and AI-powered. Traditional SEO strategies are becoming obsolete as users increasingly turn to AI assistants for answers. Our mission is to help content creators adapt and thrive in this new landscape by providing cutting-edge Answer Engine Optimization tools.
              </p>
            </div>
            
            <div className="grid md:grid-cols-2 gap-12 items-center">
              <div>
                <h3 className="text-2xl font-bold text-matrix-green mb-4">Why AEO Matters</h3>
                <ul className="space-y-4">
                  <li className="flex items-start">
                    <CheckCircle className="w-6 h-6 text-matrix-green mr-3 flex-shrink-0 mt-1" />
                    <span className="text-matrix-green/80">AI search queries are growing 400% year-over-year</span>
                  </li>
                  <li className="flex items-start">
                    <CheckCircle className="w-6 h-6 text-matrix-green mr-3 flex-shrink-0 mt-1" />
                    <span className="text-matrix-green/80">60% of searches now trigger featured snippets</span>
                  </li>
                  <li className="flex items-start">
                    <CheckCircle className="w-6 h-6 text-matrix-green mr-3 flex-shrink-0 mt-1" />
                    <span className="text-matrix-green/80">Voice search accounts for 35% of all queries</span>
                  </li>
                  <li className="flex items-start">
                    <CheckCircle className="w-6 h-6 text-matrix-green mr-3 flex-shrink-0 mt-1" />
                    <span className="text-matrix-green/80">Traditional SEO rankings are becoming less relevant</span>
                  </li>
                </ul>
              </div>
              <div className="content-card p-8">
                <h4 className="text-xl font-bold text-matrix-green mb-4">Industry Recognition</h4>
                <div className="space-y-4">
                  <div className="flex items-center">
                    <Trophy className="w-5 h-5 text-matrix-lime mr-3" />
                    <span className="text-matrix-green/80">"Top AEO Tool to Watch" - Search Engine Journal</span>
                  </div>
                  <div className="flex items-center">
                    <Trophy className="w-5 h-5 text-matrix-lime mr-3" />
                    <span className="text-matrix-green/80">"Innovation in AI Search" - Content Marketing Institute</span>
                  </div>
                  <div className="flex items-center">
                    <Trophy className="w-5 h-5 text-matrix-lime mr-3" />
                    <span className="text-matrix-green/80">"Best SEO Tool 2024" - Digital Marketing Awards</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Team Section */}
      <section className="py-16 bg-black">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold mb-4 text-matrix-green">Meet Our Team</h2>
            <p className="text-xl text-matrix-green/70 max-w-2xl mx-auto">
              Our team combines deep expertise in search technology, AI, and content optimization to build the future of AEO.
            </p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
            {teamMembers.map((member, index) => (
              <Card key={index} className="content-card">
                <CardHeader className="text-center pb-4">
                  <div className="w-24 h-24 rounded-full bg-matrix-dark-gray border-2 border-matrix-green/30 mx-auto mb-4 flex items-center justify-center">
                    <Users className="w-12 h-12 text-matrix-green" />
                  </div>
                  <CardTitle className="text-matrix-green">{member.name}</CardTitle>
                  <CardDescription className="text-matrix-lime font-medium">{member.role}</CardDescription>
                </CardHeader>
                <CardContent className="text-center">
                  <p className="text-matrix-green/80 mb-6">{member.bio}</p>
                  <div className="flex justify-center space-x-4">
                    <Button variant="ghost" size="sm" className="text-matrix-green hover:text-matrix-lime">
                      <Linkedin className="w-4 h-4" />
                    </Button>
                    <Button variant="ghost" size="sm" className="text-matrix-green hover:text-matrix-lime">
                      <Twitter className="w-4 h-4" />
                    </Button>
                    <Button variant="ghost" size="sm" className="text-matrix-green hover:text-matrix-lime">
                      <Mail className="w-4 h-4" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Company Timeline */}
      <section className="py-16 bg-matrix-dark-gray">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold mb-4 text-matrix-green">Our Journey</h2>
            <p className="text-xl text-matrix-green/70">
              From startup to industry leader in Answer Engine Optimization
            </p>
          </div>
          
          <div className="max-w-4xl mx-auto">
            <div className="space-y-8">
              {milestones.map((milestone, index) => (
                <div key={index} className="flex items-start">
                  <div className="flex-shrink-0 w-20 text-center">
                    <Badge variant="outline" className="border-matrix-green text-matrix-green">
                      {milestone.year}
                    </Badge>
                  </div>
                  <div className="flex-1 ml-6">
                    <h3 className="text-xl font-bold text-matrix-green mb-2">{milestone.title}</h3>
                    <p className="text-matrix-green/80">{milestone.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Security & Compliance */}
      <section className="py-16 bg-black">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold mb-4 text-matrix-green">Security & Compliance</h2>
            <p className="text-xl text-matrix-green/70">
              Enterprise-grade security and compliance standards you can trust
            </p>
          </div>
          
          <div className="grid md:grid-cols-4 gap-8 max-w-6xl mx-auto">
            {certifications.map((cert, index) => (
              <div key={index} className="content-card p-6 text-center">
                <Shield className="w-12 h-12 text-matrix-green mx-auto mb-4" />
                <h3 className="text-lg font-bold text-matrix-green mb-2">{cert.name}</h3>
                <p className="text-matrix-green/70 text-sm">{cert.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 bg-gradient-to-r from-matrix-green to-matrix-lime text-black">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold mb-6">Ready to Join Our Success Story?</h2>
          <p className="text-xl mb-10 max-w-2xl mx-auto">
            Join thousands of content creators who trust GenerativeSearch.pro to optimize their content for AI search engines.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button 
              size="lg" 
              onClick={() => navigate('/auth', { state: { signUp: true } })} 
              className="text-matrix-green bg-black hover:bg-matrix-dark-gray border border-matrix-green text-lg px-8 py-4"
            >
              Start Your Free Trial
              <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
            <Button 
              size="lg" 
              variant="outline"
              className="border-black text-black hover:bg-black/10 text-lg px-8 py-4"
              onClick={() => navigate('/upgrade')}
            >
              View Pricing
            </Button>
          </div>
        </div>
      </section>
      
      <Footer />
    </div>
  );
};

export default About;
