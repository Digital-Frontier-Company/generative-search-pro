
import DomainAnalyzer from "@/components/DomainAnalyzer";
import Header from "@/components/Header";
import Footer from "@/components/Footer";

const DomainAnalysis = () => {
  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1">
        <DomainAnalyzer />
      </main>
      <Footer />
    </div>
  );
};

export default DomainAnalysis;
