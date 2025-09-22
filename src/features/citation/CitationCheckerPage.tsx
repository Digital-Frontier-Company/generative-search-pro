
import CitationChecker from "@/features/citation/CitationChecker";
import Header from "@/components/global/Header";
import Footer from "@/components/global/Footer";

const CitationCheckerPage = () => {
  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1">
        <CitationChecker />
      </main>
      <Footer />
    </div>
  );
};

export default CitationCheckerPage;
