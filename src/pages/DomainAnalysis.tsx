
import DomainAnalyzer from "@/components/DomainAnalyzer";
import Header from "@/components/Header";
import Footer from "@/components/Footer";

const DomainAnalysis = () => {
  return (
    <div className="min-h-screen flex flex-col bg-black">
      <Header />
      <main className="flex-1 bg-black">
        <DomainAnalyzer />
      </main>
      <Footer />
    </div>
  );
};

export default DomainAnalysis;
