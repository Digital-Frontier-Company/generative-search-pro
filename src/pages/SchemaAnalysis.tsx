
import SchemaAnalyzer from "@/components/SchemaAnalyzer";
import Header from "@/components/Header";
import Footer from "@/components/Footer";

const SchemaAnalysis = () => {
  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1 bg-gray-50">
        <SchemaAnalyzer />
      </main>
      <Footer />
    </div>
  );
};

export default SchemaAnalysis;
