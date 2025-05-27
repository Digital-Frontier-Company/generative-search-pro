
import AISitemapGenerator from "@/components/AISitemapGenerator";
import Header from "@/components/Header";
import Footer from "@/components/Footer";

const AISitemap = () => {
  return (
    <div className="min-h-screen flex flex-col bg-black">
      <Header />
      <main className="flex-1 bg-black">
        <AISitemapGenerator />
      </main>
      <Footer />
    </div>
  );
};

export default AISitemap;
