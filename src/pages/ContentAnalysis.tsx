
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import Breadcrumbs from "@/components/Breadcrumbs";
import ContentQualityAnalyzer from "@/components/ContentQualityAnalyzer";

const ContentAnalysis = () => {
  return (
    <div className="min-h-screen flex flex-col bg-black">
      <Header />
      <Breadcrumbs />
      <main className="flex-1 bg-black">
        <div className="container mx-auto px-4 py-8">
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-8">
              <h1 className="text-3xl font-bold mb-4 text-white">Advanced Content Analysis</h1>
              <p className="text-gray-400 mb-8">
                Comprehensive content quality analysis with AI-friendliness scoring and keyword optimization.
              </p>
            </div>
            
            <ContentQualityAnalyzer />
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default ContentAnalysis;
