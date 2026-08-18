import Header from "@/components/global/Header";
import Footer from "@/components/global/Footer";
import AnimatedGSPLogo from "@/components/global/AnimatedGSPLogo";
import LeadCaptureModal from "@/components/landing/LeadCaptureModal";
import JsonLdSchema from "@/features/schema/JsonLdSchema";
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
        <meta property="og:title" content="AI Influencer Marketplace for Brands" />
        <meta property="og:description" content="Find vetted creators, launch AI-optimized campaigns, and boost visibility across search and answer engines." />
        <meta property="og:type" content="website" />
        <meta property="og:url" content="https://generativesearch.pro/brands" />
        <meta property="og:image" content="https://generativesearch.pro/og-brands.jpg" />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content="AI Influencer Marketplace for Brands" />
        <meta name="twitter:description" content="Find vetted creators, launch AI-optimized campaigns, and boost visibility across search and answer engines." />
        <meta name="twitter:image" content="https://generativesearch.pro/og-brands.jpg" />
      </Helmet>
      <JsonLdSchema schema={schema} />
      <Header />
      <div className="container mx-auto p-6">
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
            <div className="md:w-1/2 flex flex-col items-center gap-6">
              <img
                src="/og-brands.jpg"
                alt="AI influencer marketplace for brands — GenerativeSearch.pro"
                width={1200}
                height={630}
                loading="lazy"
                className="w-full max-w-md rounded-lg border border-border shadow-lg"
              />
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
      </div>
      <Footer />
    </div>
  );
};

export default Brands;
