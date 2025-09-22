import Header from "@/components/global/Header";
import Footer from "@/components/global/Footer";
import AnimatedGSPLogo from "@/components/global/AnimatedGSPLogo";
import LeadCaptureModal from "@/components/landing/LeadCaptureModal";
import JsonLdSchema from "@/features/schema/JsonLdSchema";
import HowItWorksSection from "@/components/landing/HowItWorksSection";
import SocialProofSection from "@/components/landing/SocialProofSection";
import TrustSection from "@/components/landing/TrustSection";
import NewsletterSignup from "@/components/landing/NewsletterSignup";
import { Helmet } from "react-helmet-async";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";

const Influencers = () => {
  const navigate = useNavigate();
  const schema = {
    "@context": "https://schema.org",
    "@type": "WebPage",
    "name": "AI Influencer Marketplace for Creators",
    "description": "Monetize your influence with AI-optimized campaigns and transparent analytics.",
    "url": `${window.location.origin}/influencers`,
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Helmet>
        <title>AI Marketplace for Creators | Monetize Your Influence</title>
        <meta name="description" content="Get brand deals, align with the right campaigns, and showcase results with AI-powered analytics." />
        <link rel="canonical" href={`${window.location.origin}/influencers`} />
      </Helmet>
      <JsonLdSchema schema={schema} />
      <Header />
      <main className="container mx-auto p-6">
        <section className="mb-12">
          <div className="flex flex-col md:flex-row items-center justify-between">
            <div className="md:w-1/2 mb-8 md:mb-0">
              <div className="mb-6"><AnimatedGSPLogo /></div>
              <h1 className="text-4xl font-bold mb-4 font-orbitron">
                Monetize Your Influence with AI
              </h1>
              <p className="text-lg mb-6 text-gray-300">
                Get matched with aligned brands, track performance, and grow your personal brand with AI visibility.
              </p>
              <div className="flex flex-col sm:flex-row gap-4">
                <LeadCaptureModal triggerText="Join as an Influencer" title="Join as an Influencer" description="Tell us your handle and niche to get started." type="trial" persona="influencer"/>
                <Button variant="outline" onClick={() => navigate("/brands")}>For Brands</Button>
              </div>
            </div>
            <div className="md:w-1/2 flex justify-center">
              <div className="relative w-full max-w-md border border-border rounded-lg p-6 bg-card">
                <h3 className="text-primary font-semibold mb-2">Why creators love us</h3>
                <ul className="list-disc pl-5 text-muted-foreground space-y-2">
                  <li>Brand alignment and fair compensation</li>
                  <li>Transparent performance analytics</li>
                  <li>Content guidance for AI answer engines</li>
                </ul>
              </div>
            </div>
          </div>
        </section>

        <HowItWorksSection />
        <SocialProofSection />
        <TrustSection />
        <NewsletterSignup />
      </main>
      <Footer />
    </div>
  );
};

export default Influencers;
