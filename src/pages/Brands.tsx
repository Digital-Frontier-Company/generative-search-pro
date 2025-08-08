import Header from "@/components/Header";
import Footer from "@/components/Footer";
import AnimatedGSPLogo from "@/components/AnimatedGSPLogo";
import LeadCaptureModal from "@/components/landing/LeadCaptureModal";
import JsonLdSchema from "@/components/JsonLdSchema";
import HowItWorksSection from "@/components/landing/HowItWorksSection";
import FeatureComparisonSection from "@/components/landing/FeatureComparisonSection";
import SocialProofSection from "@/components/landing/SocialProofSection";
import TrustSection from "@/components/landing/TrustSection";
import NewsletterSignup from "@/components/landing/NewsletterSignup";
import { Helmet } from "react-helmet-async";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";

const Brands = () => {
  const navigate = useNavigate();
  const schema = {
    "@context": "https://schema.org",
    "@type": "WebPage",
    "name": "AI-Powered Influencer Marketplace for Brands",
    "description": "Partner with vetted creators and boost AI visibility with our analytics and optimization tools.",
    "url": `${window.location.origin}/brands`,
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Helmet>
        <title>AI Influencer Marketplace for Brands | GenerativeSearch.pro</title>
        <meta name="description" content="Find vetted creators, launch AI-optimized campaigns, and boost visibility across search and answer engines." />
        <link rel="canonical" href={`${window.location.origin}/brands`} />
      </Helmet>
      <JsonLdSchema schema={schema} />
      <Header />
      <main className="container mx-auto p-6">
        <section className="mb-12">
          <div className="flex flex-col md:flex-row items-center justify-between">
            <div className="md:w-1/2 mb-8 md:mb-0">
              <div className="mb-6"><AnimatedGSPLogo /></div>
              <h1 className="text-4xl font-bold mb-4 font-orbitron">
                Grow With AI-Optimized Influencer Partnerships
              </h1>
              <p className="text-lg mb-6 text-gray-300">
                Discover aligned creators, track impact, and maximize visibility across AI answer engines and traditional search.
              </p>
              <div className="flex flex-col sm:flex-row gap-4">
                <LeadCaptureModal triggerText="Join as a Brand" title="Join as a Brand" description="Get matched with creators and launch your first AI-optimized campaign." type="trial"/>
                <Button variant="outline" onClick={() => navigate("/influencers")}>For Influencers</Button>
              </div>
            </div>
            <div className="md:w-1/2 flex justify-center">
              <div className="relative w-full max-w-md border border-border rounded-lg p-6 bg-card">
                <h3 className="text-primary font-semibold mb-2">Why brands choose us</h3>
                <ul className="list-disc pl-5 text-muted-foreground space-y-2">
                  <li>AI visibility analytics to measure real impact</li>
                  <li>Semantic matching to find the right creators</li>
                  <li>Zero-click optimization to win in answer engines</li>
                </ul>
              </div>
            </div>
          </div>
        </section>

        <HowItWorksSection />
        <FeatureComparisonSection />
        <SocialProofSection />
        <TrustSection />
        <NewsletterSignup />
      </main>
      <Footer />
    </div>
  );
};

export default Brands;
