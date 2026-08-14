
import SEOAnalyzer from "@/features/seo/analysis/SEOAnalyzer";
import Header from "@/components/global/Header";
import Footer from "@/components/global/Footer";
import Breadcrumbs from "@/components/global/Breadcrumbs";

const SEOAnalysis = () => {
  console.log('SEOAnalysis component rendering');
  
  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <Breadcrumbs />
      <div className="flex-1">
        <SEOAnalyzer />
      </div>
      <Footer />
    </div>
  );
};

export default SEOAnalysis;
