import Header from '@/components/Header';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Copy, Check } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useState } from 'react';

const SchemaMarkupGuide = () => {
  const navigate = useNavigate();
  const [copiedCode, setCopiedCode] = useState<string | null>(null);

  const copyToClipboard = async (code: string, id: string) => {
    try {
      await navigator.clipboard.writeText(code);
      setCopiedCode(id);
      setTimeout(() => setCopiedCode(null), 2000);
    } catch (err) {
      console.error('Failed to copy code:', err);
    }
  };

  const CodeBlock = ({ code, id }: { code: string; id: string }) => (
    <div className="relative">
      <pre className="bg-muted/50 p-4 rounded-lg overflow-x-auto text-sm">
        <code>{code}</code>
      </pre>
      <Button
        size="sm"
        variant="ghost"
        className="absolute top-2 right-2"
        onClick={() => copyToClipboard(code, id)}
      >
        {copiedCode === id ? (
          <Check className="h-4 w-4" />
        ) : (
          <Copy className="h-4 w-4" />
        )}
      </Button>
    </div>
  );

  return (
    <>
      <Header />
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <Button
          variant="ghost"
          onClick={() => navigate('/resources')}
          className="mb-6"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Resources
        </Button>

        <Card>
          <CardContent className="p-8">
            <article className="prose prose-invert max-w-none">
              <h1 className="text-4xl font-bold mb-6">
                Advanced Schema Markup Strategies: Deep Dive into JSON-LD Implementation and Advanced Structured Data Techniques
              </h1>

              <p className="text-lg text-muted-foreground mb-8">
                As search engines evolve toward AI-powered understanding and generative search results, the strategic implementation of advanced schema markup has become essential for maintaining visibility. While basic schema implementation can provide foundational benefits, advanced structured data techniques unlock deeper search engine comprehension and prepare your content for the future of AI-driven search experiences.
              </p>

              <h2 className="text-2xl font-semibold mt-8 mb-4">Why Advanced Schema Markup Matters in 2025</h2>
              
              <p>
                Schema markup is no longer a "nice-to-have" but an essential part of any SEO strategy, with hundreds of schema types, dozens of Google SERP features and increasing applications in AI and voice search. The landscape has fundamentally shifted—if a machine can't understand your content, it can't rank it — and it certainly won't cite it.
              </p>

              <div className="bg-primary/10 p-6 rounded-lg my-6">
                <h3 className="font-semibold mb-4">Key Benefits of Advanced Implementation:</h3>
                <ul className="space-y-2">
                  <li><strong>Enhanced AI Comprehension:</strong> LLMs grounded in knowledge graphs achieve 300% higher accuracy compared to those relying solely on unstructured data</li>
                  <li><strong>Improved Rich Results Eligibility:</strong> Pages that show as rich results have an 82% higher click through rate than non-rich result pages</li>
                  <li><strong>Future-Proofing:</strong> Schema Markup helps Microsoft's LLMs understand content and prepares your data for emerging AI search platforms</li>
                </ul>
              </div>

              <h2 className="text-2xl font-semibold mt-8 mb-4">JSON-LD: The Foundation of Advanced Schema Implementation</h2>

              <h3 className="text-xl font-semibold mt-6 mb-3">Why JSON-LD Dominates</h3>
              
              <p>
                Google recommends using JSON-LD for structured data if your site's setup allows it, as it's the easiest solution for website owners to implement and maintain at scale. JSON-LD (JavaScript Object Notation for Linked Data) offers critical advantages for advanced implementations:
              </p>

              <div className="bg-secondary/20 p-6 rounded-lg my-6">
                <h4 className="font-semibold mb-3">Architectural Benefits:</h4>
                <ul className="space-y-2">
                  <li><strong>Separation from HTML:</strong> JSON-LD is not restricted by the content and structure of the HTML, offering greater flexibility</li>
                  <li><strong>Dynamic Content Support:</strong> JSON-LD is perfect for websites with dynamic content or single-page applications since it seamlessly integrates with their structure</li>
                  <li><strong>Scalability:</strong> JSON-LD supports the management of complex, nested structured data, making it ideal for advanced use cases</li>
                </ul>
              </div>

              <h3 className="text-xl font-semibold mt-6 mb-3">Basic JSON-LD Implementation Structure</h3>

              <CodeBlock
                id="basic-jsonld"
                code={`<script type="application/ld+json">
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
              />

              <h2 className="text-2xl font-semibold mt-8 mb-4">Advanced Schema Markup Techniques</h2>

              <h3 className="text-xl font-semibold mt-6 mb-3">1. Schema Nesting for Complex Relationships</h3>
              
              <p>
                Schema nesting allows for the representation of more complex relationships within structured data. By nesting one schema type within another – such as a Product schema within an Offer schema, further nested within a LocalBusiness schema – it's possible to communicate layered information.
              </p>

              <h4 className="font-semibold mt-4 mb-3">Advanced Nested Example - Product Review Article:</h4>

              <CodeBlock
                id="nested-schema"
                code={`<script type="application/ld+json">
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
              />

              <div className="bg-accent/10 p-4 rounded-lg my-6">
                <h4 className="font-semibold mb-2">Implementation Benefits:</h4>
                <ul className="space-y-1">
                  <li>• This enables search engines to understand not just individual data points but how they are connected, leading to more contextually rich search results</li>
                  <li>• It clarifies the relationships and hierarchy between different entities defined on your web page</li>
                </ul>
              </div>

              <h3 className="text-xl font-semibold mt-6 mb-3">2. Entity Relationships with @id References</h3>
              
              <p>
                The @id attribute in JSON-LD structured data is the foundation for creating clear and maintainable internal entity relationships with your schema markup. This technique creates connections between entities across your site.
              </p>

              <h4 className="font-semibold mt-4 mb-3">Multi-Entity Connection Example:</h4>

              <CodeBlock
                id="entity-relationships"
                code={`<script type="application/ld+json">
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
              />

              <div className="bg-primary/10 p-4 rounded-lg my-6">
                <h4 className="font-semibold mb-2">Best Practices for @id Implementation:</h4>
                <ul className="space-y-1">
                  <li>• Assign a unique, unchanging @id to each entity and always use that same identifier when referring to it</li>
                  <li>• Treat your @id values as permanent labels. Avoid dynamic components (like timestamps) that change on every page load</li>
                </ul>
              </div>

              <h3 className="text-xl font-semibold mt-6 mb-3">3. SameAs Properties for Entity Disambiguation</h3>
              
              <p>
                SameAs schema can be used to help search engines understand that an entity mentioned on one page is the same as an entity mentioned elsewhere. By marking up an entity with SameAs and linking it to trusted external sources, such as Wikidata, Wikipedia or authoritative social media profiles, you enhance entity recognition.
              </p>

              <CodeBlock
                id="sameas-example"
                code={`{
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
              />

              <h2 className="text-2xl font-semibold mt-8 mb-4">Dynamic Content and Advanced Implementation Strategies</h2>

              <h3 className="text-xl font-semibold mt-6 mb-3">Handling Dynamic Data with JSON-LD</h3>
              
              <p>
                JSON-LD provides flexible integration of structured data into dynamic content. Consider this method if you have websites with constantly updating or changing content.
              </p>

              <h4 className="font-semibold mt-4 mb-3">Dynamic Product Data Example:</h4>

              <CodeBlock
                id="dynamic-content"
                code={`<script type="application/ld+json">
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
              />

              <div className="bg-secondary/20 p-4 rounded-lg my-6">
                <h4 className="font-semibold mb-2">Dynamic Implementation Considerations:</h4>
                <ul className="space-y-1">
                  <li>• JSON-LD should always stay in sync with the current content of the page, even when there are dynamic changes happening</li>
                  <li>• Implement server-side rendering or API-driven updates for real-time accuracy</li>
                  <li>• Use caching strategies that account for structured data freshness</li>
                </ul>
              </div>

              <h2 className="text-2xl font-semibold mt-8 mb-4">AI Search Optimization Through Advanced Schema</h2>

              <h3 className="text-xl font-semibold mt-6 mb-3">Building Content Knowledge Graphs</h3>
              
              <p>
                Implementing nested Schema Markup is crucial for building a robust content knowledge graph. A knowledge graph is a collection of relationships between things, aka "entities," defined using a standardized vocabulary, like Schema.org.
              </p>

              <div className="bg-accent/10 p-6 rounded-lg my-6">
                <h4 className="font-semibold mb-3">Entity-Based Search Preparation:</h4>
                <p>
                  Entity-based search is where search engines prioritize entities – people, places, things and concepts – over individual keywords. Instead of focusing on isolated words and relationships between them, search engines now better understand connections between entities and how they fit into a broader context.
                </p>
              </div>

              <h3 className="text-xl font-semibold mt-6 mb-3">Schema for Voice and AI Search</h3>
              
              <p>Optimize your schema implementation for emerging search modalities:</p>

              <h4 className="font-semibold mt-4 mb-3">FAQ Schema for Voice Search:</h4>

              <CodeBlock
                id="faq-schema"
                code={`{
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
              />

              <h2 className="text-2xl font-semibold mt-8 mb-4">Implementation Best Practices</h2>

              <h3 className="text-xl font-semibold mt-6 mb-3">Validation and Testing</h3>

              <div className="bg-primary/10 p-6 rounded-lg my-6">
                <h4 className="font-semibold mb-3">Essential Validation Tools:</h4>
                <ul className="space-y-2">
                  <li>• Use Google's Rich Results Test tool to verify your markup and preview how it might appear in search results</li>
                  <li>• Schema Markup Validator for generic validation</li>
                  <li>• <a href="https://json-ld.org/playground/" className="text-primary hover:underline" target="_blank" rel="noopener noreferrer">JSON-LD Playground</a> for debugging complex structures</li>
                </ul>
              </div>

              <h3 className="text-xl font-semibold mt-6 mb-3">Security Considerations</h3>
              
              <p>
                The following snippet uses JSON.stringify, which does not sanitize malicious strings used in XSS injection. To prevent this type of vulnerability, you can scrub HTML tags from the JSON-LD payload, for example, by replacing the character, &lt;, with its unicode equivalent, \\u003c.
              </p>

              <h4 className="font-semibold mt-4 mb-3">Secure Implementation Example:</h4>

              <CodeBlock
                id="security-example"
                code={`// Sanitize data before JSON-LD output
function sanitizeForJsonLd(str) {
  return str
    .replace(/</g, '\\\\u003c')
    .replace(/>/g, '\\\\u003e')
    .replace(/"/g, '\\\\"');
}`}
              />

              <h3 className="text-xl font-semibold mt-6 mb-3">Content Alignment Requirements</h3>
              
              <p>
                Search engines compare Schema markups information with the page content. If they don't match, search engines will not consider your structured data and could also penalize you. Ensure your structured data accurately reflects visible page content.
              </p>

              <h2 className="text-2xl font-semibold mt-8 mb-4">Advanced Schema Types for Competitive Advantage</h2>

              <h3 className="text-xl font-semibold mt-6 mb-3">Local Business with Enhanced Services</h3>

              <CodeBlock
                id="local-business"
                code={`{
  "@context": "https://schema.org",
  "@type": ["LocalBusiness", "ProfessionalService"],
  "@id": "https://example.com/#business",
  "name": "Advanced Digital Marketing Agency",
  "hasOfferCatalog": {
    "@type": "OfferCatalog",
    "name": "Digital Marketing Services",
    "itemListElement": [
      {
        "@type": "Offer",
        "itemOffered": {
          "@type": "Service",
          "name": "Schema Markup Implementation",
          "serviceType": "Technical SEO"
        }
      }
    ]
  },
  "geo": {
    "@type": "GeoCoordinates",
    "latitude": "40.7128",
    "longitude": "-74.0060"
  },
  "areaServed": {
    "@type": "State",
    "name": "New York"
  }
}`}
              />

              <h3 className="text-xl font-semibold mt-6 mb-3">Event with Rich Attendee Data</h3>

              <CodeBlock
                id="event-schema"
                code={`{
  "@context": "https://schema.org",
  "@type": "Event",
  "name": "Advanced Schema Markup Workshop",
  "startDate": "2025-09-15T09:00:00-05:00",
  "endDate": "2025-09-15T17:00:00-05:00",
  "eventStatus": "https://schema.org/EventScheduled",
  "eventAttendanceMode": "https://schema.org/OfflineEventAttendanceMode",
  "location": {
    "@type": "Place",
    "name": "Digital Marketing Conference Center",
    "address": {
      "@type": "PostalAddress",
      "streetAddress": "123 Marketing Ave",
      "addressLocality": "New York",
      "addressRegion": "NY",
      "postalCode": "10001"
    }
  },
  "organizer": {
    "@type": "Organization",
    "@id": "https://example.com/#organization"
  },
  "offers": {
    "@type": "Offer",
    "price": "299",
    "priceCurrency": "USD",
    "availability": "https://schema.org/InStock",
    "validFrom": "2025-03-01T00:00:00-05:00"
  }
}`}
              />

              <h2 className="text-2xl font-semibold mt-8 mb-4">Future-Proofing Your Schema Strategy</h2>

              <h3 className="text-xl font-semibold mt-6 mb-3">Preparing for AI Integration</h3>
              
              <p>
                By optimizing pages and using Schema Markup to define relationships between entities on your site, you're creating a reusable semantic data layer. This data layer supports traditional search but also prepares your data to be re-used to get insights into your content structure and strategy.
              </p>

              <div className="bg-secondary/20 p-6 rounded-lg my-6">
                <h4 className="font-semibold mb-3">Strategic Considerations:</h4>
                <ul className="space-y-2">
                  <li>• Modern LLMs are increasingly capable of leveraging structured data sources like JSON-LD Schema Markup, especially when paired with reasoning models, retrieval-based architectures and knowledge graphs</li>
                  <li>• Build comprehensive entity relationships that support both current search engines and future AI applications</li>
                  <li>• Focus on semantic accuracy over keyword optimization</li>
                </ul>
              </div>

              <h3 className="text-xl font-semibold mt-6 mb-3">Monitoring and Maintenance</h3>

              <div className="bg-accent/10 p-6 rounded-lg my-6">
                <h4 className="font-semibold mb-3">Ongoing Schema Management:</h4>
                <ul className="space-y-2">
                  <li>• Regular validation checks using automated tools</li>
                  <li>• Content-schema alignment audits</li>
                  <li>• Performance monitoring through Search Console structured data reports</li>
                  <li>• Updates for new schema.org vocabulary releases</li>
                </ul>
              </div>

              <h2 className="text-2xl font-semibold mt-8 mb-4">Implementation Roadmap</h2>

              <div className="grid md:grid-cols-2 gap-6 my-8">
                <div className="bg-primary/10 p-6 rounded-lg">
                  <h4 className="font-semibold mb-3">Phase 1: Foundation (Weeks 1-2)</h4>
                  <ol className="space-y-1 list-decimal list-inside">
                    <li>Audit existing schema implementation</li>
                    <li>Implement core JSON-LD structures (Organization, WebSite, WebPage)</li>
                    <li>Establish @id patterns for entity consistency</li>
                  </ol>
                </div>

                <div className="bg-secondary/20 p-6 rounded-lg">
                  <h4 className="font-semibold mb-3">Phase 2: Enhancement (Weeks 3-4)</h4>
                  <ol className="space-y-1 list-decimal list-inside">
                    <li>Add nested schema relationships</li>
                    <li>Implement dynamic content handling</li>
                    <li>Create entity connections with @id references</li>
                  </ol>
                </div>

                <div className="bg-accent/10 p-6 rounded-lg">
                  <h4 className="font-semibold mb-3">Phase 3: Optimization (Weeks 5-6)</h4>
                  <ol className="space-y-1 list-decimal list-inside">
                    <li>Add advanced schema types (Events, Products, Services)</li>
                    <li>Implement FAQ and HowTo schemas for voice search</li>
                    <li>Establish comprehensive validation workflows</li>
                  </ol>
                </div>

                <div className="bg-primary/10 p-6 rounded-lg">
                  <h4 className="font-semibold mb-3">Phase 4: Scale and Monitor (Ongoing)</h4>
                  <ol className="space-y-1 list-decimal list-inside">
                    <li>Automate schema generation for new content</li>
                    <li>Monitor performance impacts</li>
                    <li>Iterate based on search engine feedback</li>
                  </ol>
                </div>
              </div>

              <h2 className="text-2xl font-semibold mt-8 mb-4">Conclusion</h2>
              
              <p>
                Advanced schema markup implementation through JSON-LD represents a fundamental shift toward semantic web optimization. Schema Markup gives SEOs the tools to articulate relationships, create meaningful connections between entities, and future-proof their organizations' data. This is more than optimization—it's building a data-driven foundation for the future of search and AI.
              </p>

              <p>
                The organizations that invest in sophisticated structured data strategies today will maintain competitive advantages as search engines continue evolving toward AI-driven understanding. By implementing these advanced techniques, you're not just optimizing for current search algorithms—you're building the foundation for next-generation search experiences.
              </p>

              <div className="bg-primary/10 p-6 rounded-lg my-8">
                <h3 className="font-semibold mb-4">Key Takeaways:</h3>
                <ul className="space-y-2">
                  <li>• JSON-LD provides the flexibility needed for complex schema implementations</li>
                  <li>• Entity relationships and nested schemas improve search engine comprehension</li>
                  <li>• Proper validation and content alignment are essential for success</li>
                  <li>• Advanced schema strategies prepare content for AI search evolution</li>
                </ul>
              </div>

              <p>
                Start with foundational implementations and gradually build toward more sophisticated entity relationships and dynamic content handling. The investment in advanced schema markup pays dividends in improved search visibility, rich results eligibility, and future-proofing your content for the AI search landscape.
              </p>

              <hr className="my-8" />

              <p className="text-muted-foreground italic">
                <em>Ready to implement advanced schema markup for your organization? Start with a comprehensive audit of your current structured data implementation and identify opportunities for enhanced entity relationships and JSON-LD optimization.</em>
              </p>
            </article>
          </CardContent>
        </Card>
      </div>
    </>
  );
};

export default SchemaMarkupGuide;