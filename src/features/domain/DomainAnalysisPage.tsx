
import DomainAnalyzer from "@/features/domain/DomainAnalyzer";
import Header from "@/components/global/Header";
import Footer from "@/components/global/Footer";

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
