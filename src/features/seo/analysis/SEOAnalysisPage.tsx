
import SEOAnalyzer from "@/components/SEOAnalyzer";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import Breadcrumbs from "@/components/Breadcrumbs";

const SEOAnalysis = () => {
  console.log('SEOAnalysis component rendering');
  
  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <Breadcrumbs />
      <main className="flex-1">
        <SEOAnalyzer />
      </main>
      <Footer />
    </div>
  );
};

export default SEOAnalysis;
