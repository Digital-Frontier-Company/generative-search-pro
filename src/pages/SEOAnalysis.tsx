
import SEOAnalyzer from "@/components/SEOAnalyzer";
import Header from "@/components/Header";
import Footer from "@/components/Footer";

const SEOAnalysis = () => {
  return (
    <div className="min-h-screen flex flex-col bg-black">
      <Header />
      <main className="flex-1 bg-black">
        <SEOAnalyzer />
      </main>
      <Footer />
    </div>
  );
};

export default SEOAnalysis;
