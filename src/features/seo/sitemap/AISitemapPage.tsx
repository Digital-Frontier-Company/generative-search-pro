
import AISitemapGenerator from "@/features/seo/sitemap/AISitemapGenerator";
import Header from "@/components/global/Header";
import Footer from "@/components/global/Footer";

const AISitemap = () => {
  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <div className="flex-1">
        <AISitemapGenerator />
      </div>
      <Footer />
    </div>
  );
};

export default AISitemap;
