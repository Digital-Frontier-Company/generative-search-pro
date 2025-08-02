import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createSecureHandler, validateInput, commonSchemas, validateEnvVars } from "../_shared/security.ts";
import { getCached, setCached, generateCacheKey, withPerformanceMonitoring } from "../_shared/performance.ts";

validateEnvVars(['SUPABASE_URL', 'SUPABASE_SERVICE_ROLE_KEY', 'OPENAI_API_KEY']);

interface SchemaMarkup {
  type: string;
  schema: any;
  jsonLd: string;
  microdata?: string;
  benefits: string[];
  implementation: string[];
}

const secureHandler = createSecureHandler(
  async (req: Request, user: any) => {
    const body = await req.json();
    const validated = validateInput(body, {
      content: { type: 'string' as const, required: true, minLength: 100, maxLength: 20000 },
      content_type: { type: 'string' as const, required: true }, // article, faq, howto, recipe, product, event, organization
      domain: commonSchemas.domain,
      user_id: commonSchemas.userId,
      page_url: { type: 'url' as const, required: false },
      additional_data: { type: 'string' as const, required: false } // JSON string with extra data
    });

    const {
      content,
      content_type,
      domain,
      user_id,
      page_url,
      additional_data
    } = validated;

    console.log('Generating schema markup for:', { content_type, domain });

    const cacheKey = generateCacheKey('schema-gen', content_type, content.substring(0, 200), domain);
    const cached = getCached(cacheKey);
    if (cached) {
      return new Response(JSON.stringify(cached), {
        headers: { 'Content-Type': 'application/json' }
      });
    }

    const generateSchema = withPerformanceMonitoring(async () => {
      const parsedAdditionalData = additional_data ? JSON.parse(additional_data) : {};
      
      // Extract content information
      const contentInfo = extractContentInfo(content, page_url);
      
      // Generate schema based on content type
      const schemas: SchemaMarkup[] = [];
      
      switch (content_type) {
        case 'article':
          schemas.push(await generateArticleSchema(contentInfo, domain, parsedAdditionalData));
          break;
        case 'faq':
          schemas.push(await generateFAQSchema(contentInfo, domain, parsedAdditionalData));
          break;
        case 'howto':
          schemas.push(await generateHowToSchema(contentInfo, domain, parsedAdditionalData));
          break;
        case 'recipe':
          schemas.push(await generateRecipeSchema(contentInfo, domain, parsedAdditionalData));
          break;
        case 'product':
          schemas.push(await generateProductSchema(contentInfo, domain, parsedAdditionalData));
          break;
        case 'event':
          schemas.push(await generateEventSchema(contentInfo, domain, parsedAdditionalData));
          break;
        case 'organization':
          schemas.push(await generateOrganizationSchema(contentInfo, domain, parsedAdditionalData));
          break;
        default:
          schemas.push(await generateGenericSchema(contentInfo, domain, content_type));
      }
      
      // Always add breadcrumb schema if URL provided
      if (page_url) {
        schemas.push(generateBreadcrumbSchema(page_url, domain));
      }
      
      // Add organization schema for authority
      schemas.push(generateWebsiteSchema(domain));
      
      return {
        content_type,
        domain,
        page_url,
        schemas,
        combinedJsonLd: schemas.map(s => s.jsonLd).join(',\n'),
        totalSchemas: schemas.length,
        generatedAt: new Date().toISOString()
      };
    }, 'schema-generation');

    const results = await generateSchema();

    // Store in database
    const storeResults = withPerformanceMonitoring(async () => {
      const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
      const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;

      const dbPayload = {
        user_id,
        content_type,
        domain,
        page_url,
        schemas: results.schemas,
        combined_json_ld: results.combinedJsonLd,
        total_schemas: results.totalSchemas,
        generated_at: results.generatedAt
      };

      await fetch(`${supabaseUrl}/rest/v1/schema_generations`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${supabaseKey}`,
          'Content-Type': 'application/json',
          'apikey': supabaseKey,
        },
        body: JSON.stringify(dbPayload),
      }).catch(err => console.error('DB insert failed:', err));

      return results;
    }, 'schema-db-store');

    const finalResults = await storeResults();
    setCached(cacheKey, finalResults, 3600000); // 1 hour cache

    return new Response(JSON.stringify(finalResults), {
      headers: { 'Content-Type': 'application/json' }
    });
  },
  {
    requireAuth: true,
    rateLimit: { requests: 50, windowMs: 3600000 }, // 50 requests per hour
    maxRequestSize: 51200, // 50KB max
    allowedOrigins: ['*']
  }
);

function extractContentInfo(content: string, pageUrl?: string) {
  const lines = content.split('\n').filter(line => line.trim());
  const title = lines[0] || 'Untitled';
  
  // Extract headings
  const headings = content.match(/#{1,6}\s+(.+)/g) || [];
  
  // Extract questions and answers for FAQ
  const qaPattern = /(?:Q:|Question:|A:|Answer:)\s*(.+)/gi;
  const qaMatches = content.match(qaPattern) || [];
  
  // Extract steps for how-to
  const stepPattern = /(?:\d+\.|Step\s+\d+:)\s*(.+)/gi;
  const steps = content.match(stepPattern) || [];
  
  // Estimate reading time
  const wordCount = content.split(/\s+/).length;
  const readingTime = Math.ceil(wordCount / 200); // 200 words per minute
  
  return {
    title: title.replace(/^#+\s*/, ''),
    content,
    headings: headings.map(h => h.replace(/^#+\s*/, '')),
    qaItems: qaMatches,
    steps: steps.map(s => s.replace(/^\d+\.\s*|^Step\s+\d+:\s*/i, '')),
    wordCount,
    readingTime,
    pageUrl,
    summary: content.substring(0, 160) + (content.length > 160 ? '...' : '')
  };
}

async function generateArticleSchema(contentInfo: any, domain: string, additionalData: any = {}): Promise<SchemaMarkup> {
  const schema = {
    "@context": "https://schema.org",
    "@type": "Article",
    "headline": contentInfo.title,
    "description": contentInfo.summary,
    "author": {
      "@type": "Organization",
      "name": domain,
      "url": `https://${domain}`
    },
    "publisher": {
      "@type": "Organization",
      "name": domain,
      "url": `https://${domain}`,
      "logo": {
        "@type": "ImageObject",
        "url": `https://${domain}/logo.png`
      }
    },
    "datePublished": additionalData.datePublished || new Date().toISOString().split('T')[0],
    "dateModified": additionalData.dateModified || new Date().toISOString().split('T')[0],
    "wordCount": contentInfo.wordCount,
    "timeRequired": `PT${contentInfo.readingTime}M`,
    "url": contentInfo.pageUrl || `https://${domain}`,
    "mainEntityOfPage": {
      "@type": "WebPage",
      "@id": contentInfo.pageUrl || `https://${domain}`
    }
  };

  if (additionalData.image) {
    schema["image"] = {
      "@type": "ImageObject",
      "url": additionalData.image,
      "width": additionalData.imageWidth || 1200,
      "height": additionalData.imageHeight || 630
    };
  }

  return {
    type: 'Article',
    schema,
    jsonLd: JSON.stringify(schema, null, 2),
    benefits: [
      'Improves article visibility in search results',
      'Enables rich snippets with author and publish date',
      'Helps AI understand content structure',
      'Increases click-through rates'
    ],
    implementation: [
      'Add to <head> section of your page',
      'Ensure all URLs are absolute',
      'Include high-quality featured image',
      'Keep headline under 110 characters'
    ]
  };
}

async function generateFAQSchema(contentInfo: any, domain: string, additionalData: any = {}): Promise<SchemaMarkup> {
  // Extract Q&A pairs using AI if not manually provided
  let qaItems = additionalData.qaItems || [];
  
  if (qaItems.length === 0 && contentInfo.qaItems.length > 0) {
    // Try to pair questions and answers
    const questions = contentInfo.qaItems.filter((item: string) => 
      item.toLowerCase().startsWith('q:') || item.toLowerCase().startsWith('question:')
    );
    const answers = contentInfo.qaItems.filter((item: string) => 
      item.toLowerCase().startsWith('a:') || item.toLowerCase().startsWith('answer:')
    );
    
    qaItems = questions.map((q: string, i: number) => ({
      question: q.replace(/^(Q:|Question:)\s*/i, ''),
      answer: answers[i] ? answers[i].replace(/^(A:|Answer:)\s*/i, '') : 'Answer not found'
    }));
  }

  const schema = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    "mainEntity": qaItems.map((qa: any) => ({
      "@type": "Question",
      "name": qa.question,
      "acceptedAnswer": {
        "@type": "Answer",
        "text": qa.answer
      }
    }))
  };

  return {
    type: 'FAQPage',
    schema,
    jsonLd: JSON.stringify(schema, null, 2),
    benefits: [
      'Eligible for FAQ rich snippets',
      'Can appear in voice search results',
      'Increases SERP real estate',
      'Helps with featured snippet eligibility'
    ],
    implementation: [
      'Structure content with clear Q&A format',
      'Keep questions concise and searchable',
      'Provide complete answers',
      'Include 3-10 FAQ items for best results'
    ]
  };
}

async function generateHowToSchema(contentInfo: any, domain: string, additionalData: any = {}): Promise<SchemaMarkup> {
  const steps = additionalData.steps || contentInfo.steps.slice(0, 20); // Limit to 20 steps
  
  const schema = {
    "@context": "https://schema.org",
    "@type": "HowTo",
    "name": contentInfo.title,
    "description": contentInfo.summary,
    "totalTime": additionalData.totalTime || `PT${contentInfo.readingTime * 2}M`,
    "estimatedCost": {
      "@type": "MonetaryAmount",
      "currency": "USD",
      "value": additionalData.estimatedCost || "0"
    },
    "supply": additionalData.supplies || [],
    "tool": additionalData.tools || [],
    "step": steps.map((step: string, index: number) => ({
      "@type": "HowToStep",
      "position": index + 1,
      "name": `Step ${index + 1}`,
      "text": step,
      "url": `${contentInfo.pageUrl || `https://${domain}`}#step${index + 1}`
    }))
  };

  if (additionalData.image) {
    schema["image"] = additionalData.image;
  }

  return {
    type: 'HowTo',
    schema,
    jsonLd: JSON.stringify(schema, null, 2),
    benefits: [
      'Eligible for How-to rich snippets',
      'Shows step-by-step instructions in search',
      'Great for voice search optimization',
      'Increases tutorial content visibility'
    ],
    implementation: [
      'Structure content with numbered steps',
      'Include estimated time and costs',
      'Add supply/tool lists if applicable',
      'Use clear step-by-step format'
    ]
  };
}

async function generateRecipeSchema(contentInfo: any, domain: string, additionalData: any = {}): Promise<SchemaMarkup> {
  const schema = {
    "@context": "https://schema.org",
    "@type": "Recipe",
    "name": contentInfo.title,
    "description": contentInfo.summary,
    "author": {
      "@type": "Person",
      "name": additionalData.authorName || domain
    },
    "cookTime": additionalData.cookTime || "PT30M",
    "prepTime": additionalData.prepTime || "PT15M",
    "totalTime": additionalData.totalTime || "PT45M",
    "recipeYield": additionalData.recipeYield || "4 servings",
    "recipeCategory": additionalData.recipeCategory || "Main Course",
    "recipeCuisine": additionalData.recipeCuisine || "American",
    "recipeIngredient": additionalData.ingredients || [],
    "recipeInstructions": (additionalData.instructions || contentInfo.steps).map((instruction: string, index: number) => ({
      "@type": "HowToStep",
      "name": `Step ${index + 1}`,
      "text": instruction
    })),
    "nutrition": additionalData.nutrition || {
      "@type": "NutritionInformation",
      "calories": "200 calories"
    }
  };

  if (additionalData.image) {
    schema["image"] = additionalData.image;
  }

  return {
    type: 'Recipe',
    schema,
    jsonLd: JSON.stringify(schema, null, 2),
    benefits: [
      'Eligible for recipe rich snippets',
      'Shows cooking time and ingredients',
      'Appears in recipe search results',
      'Great for food blog SEO'
    ],
    implementation: [
      'Include complete ingredient list',
      'Add cooking and prep times',
      'Structure instructions clearly',
      'Include nutritional information'
    ]
  };
}

async function generateProductSchema(contentInfo: any, domain: string, additionalData: any = {}): Promise<SchemaMarkup> {
  const schema = {
    "@context": "https://schema.org",
    "@type": "Product",
    "name": contentInfo.title,
    "description": contentInfo.summary,
    "brand": {
      "@type": "Brand",
      "name": additionalData.brandName || domain
    },
    "offers": {
      "@type": "Offer",
      "price": additionalData.price || "0.00",
      "priceCurrency": additionalData.currency || "USD",
      "availability": "https://schema.org/InStock",
      "seller": {
        "@type": "Organization",
        "name": domain
      }
    }
  };

  if (additionalData.image) {
    schema["image"] = additionalData.image;
  }

  if (additionalData.reviews) {
    schema["aggregateRating"] = {
      "@type": "AggregateRating",
      "ratingValue": additionalData.ratingValue || "5",
      "reviewCount": additionalData.reviewCount || "1"
    };
  }

  return {
    type: 'Product',
    schema,
    jsonLd: JSON.stringify(schema, null, 2),
    benefits: [
      'Eligible for product rich snippets',
      'Shows price and availability',
      'Displays product ratings',
      'Improves ecommerce SEO'
    ],
    implementation: [
      'Include accurate pricing',
      'Add product images',
      'Include review ratings',
      'Specify availability status'
    ]
  };
}

async function generateEventSchema(contentInfo: any, domain: string, additionalData: any = {}): Promise<SchemaMarkup> {
  const schema = {
    "@context": "https://schema.org",
    "@type": "Event",
    "name": contentInfo.title,
    "description": contentInfo.summary,
    "startDate": additionalData.startDate || new Date().toISOString(),
    "endDate": additionalData.endDate,
    "location": additionalData.location || {
      "@type": "Place",
      "name": "Online",
      "address": "Virtual Event"
    },
    "organizer": {
      "@type": "Organization",
      "name": domain,
      "url": `https://${domain}`
    },
    "eventStatus": "https://schema.org/EventScheduled",
    "eventAttendanceMode": additionalData.attendanceMode || "https://schema.org/OnlineEventAttendanceMode"
  };

  if (additionalData.offers) {
    schema["offers"] = {
      "@type": "Offer",
      "price": additionalData.price || "0",
      "priceCurrency": additionalData.currency || "USD",
      "availability": "https://schema.org/InStock"
    };
  }

  return {
    type: 'Event',
    schema,
    jsonLd: JSON.stringify(schema, null, 2),
    benefits: [
      'Eligible for event rich snippets',
      'Shows date and location in search',
      'Improves local event visibility',
      'Can appear in Google Events'
    ],
    implementation: [
      'Include accurate date and time',
      'Specify event location',
      'Add ticket pricing if applicable',
      'Include organizer information'
    ]
  };
}

async function generateOrganizationSchema(contentInfo: any, domain: string, additionalData: any = {}): Promise<SchemaMarkup> {
  const schema = {
    "@context": "https://schema.org",
    "@type": "Organization",
    "name": additionalData.organizationName || domain,
    "url": `https://${domain}`,
    "logo": additionalData.logo || `https://${domain}/logo.png`,
    "description": contentInfo.summary,
    "contactPoint": {
      "@type": "ContactPoint",
      "telephone": additionalData.phone || "",
      "contactType": "customer service",
      "email": additionalData.email || `contact@${domain}`
    },
    "address": additionalData.address || {
      "@type": "PostalAddress",
      "addressCountry": "US"
    },
    "sameAs": additionalData.socialProfiles || []
  };

  return {
    type: 'Organization',
    schema,
    jsonLd: JSON.stringify(schema, null, 2),
    benefits: [
      'Establishes business authority',
      'Improves local SEO',
      'Shows contact information',
      'Links social media profiles'
    ],
    implementation: [
      'Include complete contact information',
      'Add social media profiles',
      'Include business address',
      'Add logo and business description'
    ]
  };
}

async function generateGenericSchema(contentInfo: any, domain: string, contentType: string): Promise<SchemaMarkup> {
  const schema = {
    "@context": "https://schema.org",
    "@type": "WebPage",
    "name": contentInfo.title,
    "description": contentInfo.summary,
    "url": contentInfo.pageUrl || `https://${domain}`,
    "isPartOf": {
      "@type": "WebSite",
      "name": domain,
      "url": `https://${domain}`
    },
    "mainEntity": {
      "@type": "Thing",
      "name": contentInfo.title,
      "description": contentInfo.summary
    }
  };

  return {
    type: 'WebPage',
    schema,
    jsonLd: JSON.stringify(schema, null, 2),
    benefits: [
      'Basic structured data for any content',
      'Helps search engines understand page',
      'Improves content categorization',
      'Foundation for SEO'
    ],
    implementation: [
      'Add to any web page',
      'Include accurate page title',
      'Provide good meta description',
      'Link to parent website'
    ]
  };
}

function generateBreadcrumbSchema(pageUrl: string, domain: string): SchemaMarkup {
  const url = new URL(pageUrl);
  const pathSegments = url.pathname.split('/').filter(segment => segment);
  
  const listItems = [
    {
      "@type": "ListItem",
      "position": 1,
      "name": "Home",
      "item": `https://${domain}`
    }
  ];

  let currentPath = '';
  pathSegments.forEach((segment, index) => {
    currentPath += '/' + segment;
    listItems.push({
      "@type": "ListItem",
      "position": index + 2,
      "name": segment.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase()),
      "item": `https://${domain}${currentPath}`
    });
  });

  const schema = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    "itemListElement": listItems
  };

  return {
    type: 'BreadcrumbList',
    schema,
    jsonLd: JSON.stringify(schema, null, 2),
    benefits: [
      'Shows breadcrumb navigation in search',
      'Improves site structure understanding',
      'Helps users navigate back',
      'Better UX in search results'
    ],
    implementation: [
      'Add to every page with navigation path',
      'Ensure URLs are correct',
      'Keep breadcrumb text descriptive',
      'Match actual site navigation'
    ]
  };
}

function generateWebsiteSchema(domain: string): SchemaMarkup {
  const schema = {
    "@context": "https://schema.org",
    "@type": "WebSite",
    "name": domain,
    "url": `https://${domain}`,
    "potentialAction": {
      "@type": "SearchAction",
      "target": {
        "@type": "EntryPoint",
        "urlTemplate": `https://${domain}/search?q={search_term_string}`
      },
      "query-input": "required name=search_term_string"
    }
  };

  return {
    type: 'WebSite',
    schema,
    jsonLd: JSON.stringify(schema, null, 2),
    benefits: [
      'Enables sitelinks search box',
      'Establishes website identity',
      'Improves brand recognition',
      'May show search box in results'
    ],
    implementation: [
      'Add to homepage and main pages',
      'Include working search functionality',
      'Use consistent domain name',
      'Link to actual search page'
    ]
  };
}

serve(secureHandler);