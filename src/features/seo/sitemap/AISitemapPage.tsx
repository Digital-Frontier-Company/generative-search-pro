
import AISitemapGenerator from "@/features/seo/sitemap/AISitemapGenerator";
import Header from "@/components/global/Header";
import Footer from "@/components/global/Footer";

const AISitemap = () => {
  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1">
        <AISitemapGenerator />
      </main>
      <Footer />
    </div>
  );
};

export default AISitemap;
