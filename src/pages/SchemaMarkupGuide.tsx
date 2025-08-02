import Header from "@/components/Header";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowLeft, BookOpen, Code, CheckCircle, TrendingUp } from "lucide-react";
import { useNavigate } from "react-router-dom";

const SchemaMarkupGuide = () => {
  const navigate = useNavigate();

  return (
    <>
      <Header />
      <div className="container mx-auto py-8">
        <div className="max-w-4xl mx-auto space-y-6">
          {/* Header */}
          <div className="flex items-center gap-4 mb-8">
            <Button 
              variant="outline" 
              onClick={() => navigate('/resources')}
              className="border-matrix-green text-matrix-green hover:bg-matrix-green/10"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Resources
            </Button>
          </div>

          {/* Article Header */}
          <Card className="content-card">
            <CardContent className="py-8">
              <div className="space-y-4">
                <div className="flex items-center gap-2 text-matrix-green/70">
                  <BookOpen className="w-4 h-4" />
                  <span>Advanced Guide</span>
                  <span>•</span>
                  <span>25 min read</span>
                </div>
                <h1 className="text-4xl font-bold text-matrix-green">
                  Advanced Schema Markup Strategies: Deep Dive into JSON-LD Implementation and Advanced Structured Data Techniques
                </h1>
                <p className="text-lg text-matrix-green/80">
                  As search engines evolve toward AI-powered understanding and generative search results, the strategic implementation of advanced schema markup has become essential for maintaining visibility.
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Main Content */}
          <Card className="content-card">
            <CardContent className="py-8 prose prose-invert prose-green max-w-none">
              <div className="space-y-8 text-matrix-green/90">
                
                <div>
                  <p>
                    While basic schema implementation can provide foundational benefits, advanced structured data techniques unlock deeper search engine comprehension and prepare your content for the future of AI-driven search experiences.
                  </p>
                </div>

                <div>
                  <h2 className="text-2xl font-bold text-matrix-green mb-4 flex items-center gap-2">
                    <TrendingUp className="w-6 h-6" />
                    Why Advanced Schema Markup Matters in 2025
                  </h2>
                  <p>
                    Schema markup is no longer a "nice-to-have" but an essential part of any SEO strategy, with hundreds of schema types, dozens of Google SERP features and increasing applications in AI and voice search. The landscape has fundamentally shifted—if a machine can't understand your content, it can't rank it — and it certainly won't cite it.
                  </p>
                  
                  <div className="my-6">
                    <h3 className="text-xl font-semibold text-matrix-green mb-3">Key Benefits of Advanced Implementation:</h3>
                    <ul className="space-y-2">
                      <li className="flex items-start gap-2">
                        <CheckCircle className="w-5 h-5 text-matrix-green mt-0.5 flex-shrink-0" />
                        <span><strong>Enhanced AI Comprehension</strong>: LLMs grounded in knowledge graphs achieve 300% higher accuracy compared to those relying solely on unstructured data</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <CheckCircle className="w-5 h-5 text-matrix-green mt-0.5 flex-shrink-0" />
                        <span><strong>Improved Rich Results Eligibility</strong>: Pages that show as rich results have an 82% higher click through rate than non-rich result pages</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <CheckCircle className="w-5 h-5 text-matrix-green mt-0.5 flex-shrink-0" />
                        <span><strong>Future-Proofing</strong>: Schema Markup helps Microsoft's LLMs understand content and prepares your data for emerging AI search platforms</span>
                      </li>
                    </ul>
                  </div>
                </div>

                <div>
                  <h2 className="text-2xl font-bold text-matrix-green mb-4 flex items-center gap-2">
                    <Code className="w-6 h-6" />
                    JSON-LD: The Foundation of Advanced Schema Implementation
                  </h2>
                  
                  <h3 className="text-xl font-semibold text-matrix-green mb-3">Why JSON-LD Dominates</h3>
                  <p>
                    Google recommends using JSON-LD for structured data if your site's setup allows it, as it's the easiest solution for website owners to implement and maintain at scale. JSON-LD (JavaScript Object Notation for Linked Data) offers critical advantages for advanced implementations:
                  </p>
                  
                  <div className="my-6">
                    <h4 className="text-lg font-semibold text-matrix-green mb-3">Architectural Benefits:</h4>
                    <ul className="space-y-2">
                      <li><strong>Separation from HTML</strong>: JSON-LD is not restricted by the content and structure of the HTML, offering greater flexibility</li>
                      <li><strong>Dynamic Content Support</strong>: JSON-LD is perfect for websites with dynamic content or single-page applications since it seamlessly integrates with their structure</li>
                      <li><strong>Scalability</strong>: JSON-LD supports the management of complex, nested structured data, making it ideal for advanced use cases</li>
                    </ul>
                  </div>

                  <h3 className="text-xl font-semibold text-matrix-green mb-3">Basic JSON-LD Implementation Structure</h3>
                  <div className="bg-matrix-dark-gray border border-matrix-green/30 rounded-lg p-4 overflow-x-auto">
                    <pre className="text-sm text-matrix-green">
{`<script type="application/ld+json">
{
  "@context": "https://schema.org",
  "@type": "Organization",
  "@id": "https://example.com/#organization",
  "name": "Your Company Name",
  "url": "https://example.com",
  "logo": "https://example.com/logo.svg",
  "sameAs": [
    "https://twitter.com/yourcompany",
    "https://linkedin.com/company/yourcompany"
  ]
}
</script>`}
                    </pre>
                  </div>
                </div>

                <div>
                  <h2 className="text-2xl font-bold text-matrix-green mb-4">Advanced Schema Markup Techniques</h2>
                  
                  <h3 className="text-xl font-semibold text-matrix-green mb-3">1. Schema Nesting for Complex Relationships</h3>
                  <p>
                    Schema nesting allows for the representation of more complex relationships within structured data. By nesting one schema type within another – such as a Product schema within an Offer schema, further nested within a LocalBusiness schema – it's possible to communicate layered information.
                  </p>
                  
                  <h4 className="text-lg font-semibold text-matrix-green mb-3">Advanced Nested Example - Product Review Article:</h4>
                  <div className="bg-matrix-dark-gray border border-matrix-green/30 rounded-lg p-4 overflow-x-auto mb-4">
                    <pre className="text-sm text-matrix-green">
{`<script type="application/ld+json">
{
  "@context": "https://schema.org",
  "@type": "Article",
  "@id": "https://example.com/article/best-cameras-2025#article",
  "headline": "Best Professional Cameras of 2025",
  "author": {
    "@type": "Person",
    "@id": "https://example.com/authors/jane-smith#person",
    "name": "Jane Smith",
    "jobTitle": "Photography Expert",
    "sameAs": [
      "https://twitter.com/janesmith",
      "https://linkedin.com/in/janesmith"
    ]
  },
  "publisher": {
    "@type": "Organization",
    "@id": "https://example.com/#organization",
    "name": "Camera Review Pro",
    "logo": {
      "@type": "ImageObject",
      "url": "https://example.com/logo.png"
    }
  },
  "mainEntity": {
    "@type": "Product",
    "@id": "https://example.com/products/canon-r5#product",
    "name": "Canon EOS R5",
    "brand": {
      "@type": "Brand",
      "name": "Canon"
    },
    "aggregateRating": {
      "@type": "AggregateRating",
      "ratingValue": "4.8",
      "reviewCount": "127",
      "bestRating": "5",
      "worstRating": "1"
    },
    "offers": {
      "@type": "Offer",
      "price": "3899.00",
      "priceCurrency": "USD",
      "availability": "https://schema.org/InStock",
      "seller": {
        "@type": "Organization",
        "name": "Camera Store Pro"
      }
    }
  }
}
</script>`}
                    </pre>
                  </div>

                  <div className="my-6">
                    <h4 className="text-lg font-semibold text-matrix-green mb-3">Implementation Benefits:</h4>
                    <ul className="space-y-2">
                      <li>This enables search engines to understand not just individual data points but how they are connected, leading to more contextually rich search results</li>
                      <li>It clarifies the relationships and hierarchy between different entities defined on your web page</li>
                    </ul>
                  </div>
                </div>

                <div>
                  <h3 className="text-xl font-semibold text-matrix-green mb-3">2. Entity Relationships with @id References</h3>
                  <p>
                    The @id attribute in JSON-LD structured data is the foundation for creating clear and maintainable internal entity relationships with your schema markup. This technique creates connections between entities across your site.
                  </p>
                  
                  <h4 className="text-lg font-semibold text-matrix-green mb-3">Multi-Entity Connection Example:</h4>
                  <div className="bg-matrix-dark-gray border border-matrix-green/30 rounded-lg p-4 overflow-x-auto mb-4">
                    <pre className="text-sm text-matrix-green">
{`<script type="application/ld+json">
{
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "Organization",
      "@id": "https://example.com/#organization",
      "name": "Digital Marketing Agency",
      "url": "https://example.com",
      "logo": "https://example.com/logo.png",
      "contactPoint": {
        "@type": "ContactPoint",
        "telephone": "+1-555-123-4567",
        "contactType": "customer service"
      }
    },
    {
      "@type": "Service",
      "@id": "https://example.com/services/seo#service",
      "name": "SEO Services",
      "provider": {
        "@id": "https://example.com/#organization"
      },
      "serviceType": "Search Engine Optimization",
      "description": "Comprehensive SEO strategies for businesses"
    },
    {
      "@type": "WebPage",
      "@id": "https://example.com/services/seo#webpage",
      "mainEntity": {
        "@id": "https://example.com/services/seo#service"
      },
      "publisher": {
        "@id": "https://example.com/#organization"
      }
    }
  ]
}
</script>`}
                    </pre>
                  </div>

                  <div className="my-6">
                    <h4 className="text-lg font-semibold text-matrix-green mb-3">Best Practices for @id Implementation:</h4>
                    <ul className="space-y-2">
                      <li>Assign a unique, unchanging @id to each entity and always use that same identifier when referring to it</li>
                      <li>Treat your @id values as permanent labels. Avoid dynamic components (like timestamps) that change on every page load</li>
                    </ul>
                  </div>
                </div>

                <div>
                  <h3 className="text-xl font-semibold text-matrix-green mb-3">3. SameAs Properties for Entity Disambiguation</h3>
                  <p>
                    SameAs schema can be used to help search engines understand that an entity mentioned on one page is the same as an entity mentioned elsewhere. By marking up an entity with SameAs and linking it to trusted external sources, such as Wikidata, Wikipedia or authoritative social media profiles, you enhance entity recognition.
                  </p>
                  
                  <div className="bg-matrix-dark-gray border border-matrix-green/30 rounded-lg p-4 overflow-x-auto mb-4">
                    <pre className="text-sm text-matrix-green">
{`{
  "@type": "Person",
  "name": "Dr. Sarah Johnson",
  "jobTitle": "Chief Technology Officer",
  "sameAs": [
    "https://www.linkedin.com/in/sarahjohnson",
    "https://twitter.com/sarahj_tech",
    "https://en.wikipedia.org/wiki/Sarah_Johnson_(technologist)",
    "https://www.wikidata.org/wiki/Q123456789"
  ]
}`}
                    </pre>
                  </div>
                </div>

                <div>
                  <h2 className="text-2xl font-bold text-matrix-green mb-4">Dynamic Content and Advanced Implementation Strategies</h2>
                  
                  <h3 className="text-xl font-semibold text-matrix-green mb-3">Handling Dynamic Data with JSON-LD</h3>
                  <p>
                    JSON-LD provides flexible integration of structured data into dynamic content. Consider this method if you have websites with constantly updating or changing content.
                  </p>
                  
                  <h4 className="text-lg font-semibold text-matrix-green mb-3">Dynamic Product Data Example:</h4>
                  <div className="bg-matrix-dark-gray border border-matrix-green/30 rounded-lg p-4 overflow-x-auto mb-4">
                    <pre className="text-sm text-matrix-green">
{`<script type="application/ld+json">
{
  "@context": "https://schema.org",
  "@type": "Product",
  "name": "{{product.name}}",
  "sku": "{{product.sku}}",
  "offers": {
    "@type": "Offer",
    "price": "{{product.current_price}}",
    "priceCurrency": "USD",
    "availability": "{{product.availability_status}}",
    "priceValidUntil": "{{product.price_valid_until}}"
  },
  "aggregateRating": {
    "@type": "AggregateRating",
    "ratingValue": "{{product.average_rating}}",
    "reviewCount": "{{product.review_count}}"
  }
}
</script>`}
                    </pre>
                  </div>

                  <div className="my-6">
                    <h4 className="text-lg font-semibold text-matrix-green mb-3">Dynamic Implementation Considerations:</h4>
                    <ul className="space-y-2">
                      <li>JSON-LD should always stay in sync with the current content of the page, even when there are dynamic changes happening</li>
                      <li>Implement server-side rendering or API-driven updates for real-time accuracy</li>
                      <li>Use caching strategies that account for structured data freshness</li>
                    </ul>
                  </div>
                </div>

                <div>
                  <h2 className="text-2xl font-bold text-matrix-green mb-4">AI Search Optimization Through Advanced Schema</h2>
                  
                  <h3 className="text-xl font-semibold text-matrix-green mb-3">Building Content Knowledge Graphs</h3>
                  <p>
                    Implementing nested Schema Markup is crucial for building a robust content knowledge graph. A knowledge graph is a collection of relationships between things, aka "entities," defined using a standardized vocabulary, like Schema.org.
                  </p>
                  
                  <div className="my-6">
                    <h4 className="text-lg font-semibold text-matrix-green mb-3">Entity-Based Search Preparation:</h4>
                    <p>
                      Entity-based search is where search engines prioritize entities – people, places, things and concepts – over individual keywords. Instead of focusing on isolated words and relationships between them, search engines now better understand connections between entities and how they fit into a broader context.
                    </p>
                  </div>
                </div>

                <div>
                  <h3 className="text-xl font-semibold text-matrix-green mb-3">Schema for Voice and AI Search</h3>
                  <p>
                    Optimize your schema implementation for emerging search modalities:
                  </p>
                  
                  <h4 className="text-lg font-semibold text-matrix-green mb-3">FAQ Schema for Voice Search:</h4>
                  <div className="bg-matrix-dark-gray border border-matrix-green/30 rounded-lg p-4 overflow-x-auto mb-4">
                    <pre className="text-sm text-matrix-green">
{`{
  "@context": "https://schema.org",
  "@type": "FAQPage",
  "mainEntity": [
    {
      "@type": "Question",
      "name": "What is advanced schema markup?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "Advanced schema markup involves implementing complex structured data relationships using JSON-LD to help search engines and AI systems better understand content context and entity connections."
      }
    },
    {
      "@type": "Question",
      "name": "How does JSON-LD improve SEO performance?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "JSON-LD provides search engines with explicit structured data that reduces ambiguity and improves content interpretation, leading to enhanced rich results and better AI search visibility."
      }
    }
  ]
}`}
                    </pre>
                  </div>
                </div>

                <div>
                  <h2 className="text-2xl font-bold text-matrix-green mb-4">Implementation Best Practices</h2>
                  
                  <h3 className="text-xl font-semibold text-matrix-green mb-3">Validation and Testing</h3>
                  <div className="my-6">
                    <h4 className="text-lg font-semibold text-matrix-green mb-3">Essential Validation Tools:</h4>
                    <ul className="space-y-2">
                      <li>Use Google's Rich Results Test tool to verify your markup and preview how it might appear in search results</li>
                      <li>Schema Markup Validator for generic validation</li>
                      <li><a href="https://json-ld.org/playground/" className="text-matrix-green underline hover:text-matrix-green/80">JSON-LD Playground</a> for debugging complex structures</li>
                    </ul>
                  </div>
                </div>

                <div>
                  <h3 className="text-xl font-semibold text-matrix-green mb-3">Security Considerations</h3>
                  <p>
                    The following snippet uses JSON.stringify, which does not sanitize malicious strings used in XSS injection. To prevent this type of vulnerability, you can scrub HTML tags from the JSON-LD payload, for example, by replacing the character, &lt;, with its unicode equivalent, \\u003c.
                  </p>
                  
                  <h4 className="text-lg font-semibold text-matrix-green mb-3">Secure Implementation Example:</h4>
                  <div className="bg-matrix-dark-gray border border-matrix-green/30 rounded-lg p-4 overflow-x-auto mb-4">
                    <pre className="text-sm text-matrix-green">
{`// Sanitize data before JSON-LD output
function sanitizeForJsonLd(str) {
  return str
    .replace(/</g, '\\\\u003c')
    .replace(/>/g, '\\\\u003e')
    .replace(/"/g, '\\\\"');
}`}
                    </pre>
                  </div>
                </div>

                <div>
                  <h3 className="text-xl font-semibold text-matrix-green mb-3">Content Alignment Requirements</h3>
                  <p>
                    Search engines compare Schema markups information with the page content. If they don't match, search engines will not consider your structured data and could also penalize you. Ensure your structured data accurately reflects visible page content.
                  </p>
                </div>

                <div>
                  <h2 className="text-2xl font-bold text-matrix-green mb-4">Conclusion</h2>
                  <p>
                    Advanced schema markup implementation through JSON-LD represents a fundamental shift toward semantic web optimization. Schema Markup gives SEOs the tools to articulate relationships, create meaningful connections between entities, and future-proof their organizations' data. This is more than optimization—it's building a data-driven foundation for the future of search and AI.
                  </p>
                  
                  <p>
                    The organizations that invest in sophisticated structured data strategies today will maintain competitive advantages as search engines continue evolving toward AI-driven understanding. By implementing these advanced techniques, you're not just optimizing for current search algorithms—you're building the foundation for next-generation search experiences.
                  </p>
                  
                  <div className="my-6">
                    <h3 className="text-xl font-semibold text-matrix-green mb-3">Key Takeaways:</h3>
                    <ul className="space-y-2">
                      <li className="flex items-start gap-2">
                        <CheckCircle className="w-5 h-5 text-matrix-green mt-0.5 flex-shrink-0" />
                        <span>JSON-LD provides the flexibility needed for complex schema implementations</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <CheckCircle className="w-5 h-5 text-matrix-green mt-0.5 flex-shrink-0" />
                        <span>Entity relationships and nested schemas improve search engine comprehension</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <CheckCircle className="w-5 h-5 text-matrix-green mt-0.5 flex-shrink-0" />
                        <span>Proper validation and content alignment are essential for success</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <CheckCircle className="w-5 h-5 text-matrix-green mt-0.5 flex-shrink-0" />
                        <span>Advanced schema strategies prepare content for AI search evolution</span>
                      </li>
                    </ul>
                  </div>
                  
                  <p>
                    Start with foundational implementations and gradually build toward more sophisticated entity relationships and dynamic content handling. The investment in advanced schema markup pays dividends in improved search visibility, rich results eligibility, and future-proofing your content for the AI search landscape.
                  </p>
                  
                  <div className="my-8 p-6 bg-matrix-green/10 border border-matrix-green/30 rounded-lg">
                    <p className="italic text-matrix-green">
                      Ready to implement advanced schema markup for your organization? Start with a comprehensive audit of your current structured data implementation and identify opportunities for enhanced entity relationships and JSON-LD optimization.
                    </p>
                  </div>
                </div>

              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </>
  );
};

export default SchemaMarkupGuide;