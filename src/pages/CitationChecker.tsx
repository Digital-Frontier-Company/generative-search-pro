
import CitationChecker from "@/components/CitationChecker";
import Header from "@/components/Header";
import Footer from "@/components/Footer";

const CitationCheckerPage = () => {
  return (
    <div className="min-h-screen flex flex-col bg-black">
      <Header />
      <main className="flex-1 bg-black">
        <CitationChecker />
      </main>
      <Footer />
    </div>
  );
};

export default CitationCheckerPage;
