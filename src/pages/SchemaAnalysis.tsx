
import SchemaAnalyzer from "@/components/SchemaAnalyzer";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import JsonLdSchema from "@/components/JsonLdSchema";
import { generateArticleSchema } from "@/utils/jsonLdSchemas";
import Breadcrumbs from "@/components/Breadcrumbs";

const SchemaAnalysis = () => {
  return (
    <div className="min-h-screen flex flex-col">
      <JsonLdSchema schema={generateArticleSchema(
        "AI Visibility Score - Analyze Your Website's Structured Data",
        "Analyze and optimize your website's JSON-LD schema markup for better AI search visibility",
        "https://generativesearch.pro/schema-analysis",
        new Date().toISOString()
      )} />
      <Header />
      <Breadcrumbs />
      <main className="flex-1 bg-gray-50">
        <SchemaAnalyzer />
      </main>
      <Footer />
    </div>
  );
};

export default SchemaAnalysis;
