
// JSON-LD Schema utilities for SEO and AI optimization
export interface OrganizationSchema {
  "@context": "https://schema.org";
  "@type": "Organization";
  name: string;
  description: string;
  url: string;
  logo: string;
  sameAs: string[];
  contactPoint: {
    "@type": "ContactPoint";
    telephone?: string;
    email: string;
    contactType: "customer service";
  };
}

export interface ArticleSchema {
  "@context": "https://schema.org";
  "@type": "Article" | "BlogPosting";
  headline: string;
  description: string;
  author: {
    "@type": "Organization";
    name: string;
    url: string;
  };
  publisher: {
    "@type": "Organization";
    name: string;
    url: string;
    logo: {
      "@type": "ImageObject";
      url: string;
    };
  };
  datePublished: string;
  dateModified: string;
  mainEntityOfPage: {
    "@type": "WebPage";
    "@id": string;
  };
  image?: {
    "@type": "ImageObject";
    url: string;
  };
}

export interface FAQSchema {
  "@context": "https://schema.org";
  "@type": "FAQPage";
  mainEntity: Array<{
    "@type": "Question";
    name: string;
    acceptedAnswer: {
      "@type": "Answer";
      text: string;
    };
  }>;
}

export interface WebPageSchema {
  "@context": "https://schema.org";
  "@type": "WebPage";
  name: string;
  description: string;
  url: string;
  mainEntity: {
    "@type": "Organization";
    name: string;
  };
}

export interface SoftwareApplicationSchema {
  "@context": "https://schema.org";
  "@type": "SoftwareApplication";
  name: string;
  description: string;
  url: string;
  applicationCategory: "WebApplication";
  operatingSystem: "Web Browser";
  offers: {
    "@type": "Offer";
    price: string;
    priceCurrency: "USD";
    availability: "https://schema.org/InStock";
  };
  author: {
    "@type": "Organization";
    name: string;
  };
}

// Base organization data
export const getOrganizationSchema = (): OrganizationSchema => ({
  "@context": "https://schema.org",
  "@type": "Organization",
  name: "GenerativeSearch.pro",
  description: "AI-powered content generation platform for Answer Engine Optimization (AEO). Create SEO-optimized content that ranks in featured snippets and AI answer boxes.",
  url: "https://generativesearch.pro",
  logo: "https://generativesearch.pro/lovable-uploads/06f84961-215a-4c1a-855e-bd2ba1c43691.png",
  sameAs: [
    "https://github.com/frontieraeo",
    "https://twitter.com/frontieraeo"
  ],
  contactPoint: {
    "@type": "ContactPoint",
    email: "contact@frontieraeo.com",
    contactType: "customer service"
  }
});

// Homepage schema
export const getHomepageSchema = (): (OrganizationSchema | WebPageSchema | SoftwareApplicationSchema)[] => [
  getOrganizationSchema(),
  {
    "@context": "https://schema.org",
    "@type": "WebPage",
    name: "GenerativeSearch.pro - AI Content Generator for Answer Engine Optimization",
    description: "Generate optimized content for AI answer engines and featured snippets. Improve visibility with structured data and AEO best practices.",
    url: "https://generativesearch.pro",
    mainEntity: {
      "@type": "Organization",
      name: "GenerativeSearch.pro"
    }
  },
  {
    "@context": "https://schema.org",
    "@type": "SoftwareApplication",
    name: "GenerativeSearch.pro AEO Generator",
    description: "AI-powered content generation platform that creates SEO-optimized content specifically structured for AI answer engines and featured snippets.",
    url: "https://generativesearch.pro",
    applicationCategory: "WebApplication",
    operatingSystem: "Web Browser",
    offers: {
      "@type": "Offer",
      price: "0",
      priceCurrency: "USD",
      availability: "https://schema.org/InStock"
    },
    author: {
      "@type": "Organization",
      name: "FrontierAEO"
    }
  }
];

// FAQ schema for homepage
export const getHomepageFAQSchema = (): FAQSchema => ({
  "@context": "https://schema.org",
  "@type": "FAQPage",
  mainEntity: [
    {
      "@type": "Question",
      name: "What is Answer Engine Optimization (AEO)?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "AEO is a strategy that focuses on optimizing content specifically for AI-powered answer engines and featured snippets. Unlike traditional SEO that aims for general rankings, AEO targets the specific formats and structures that help content get selected for direct answers in search results."
      }
    },
    {
      "@type": "Question",
      name: "How does FrontierAEO differ from regular SEO tools?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "FrontierAEO is specifically designed to optimize content for AI answers and featured snippets. It generates structured content that includes metadata, schema markup, FAQs, and other components that help search engines understand and prioritize your content for direct answers."
      }
    },
    {
      "@type": "Question",
      name: "Do I need technical knowledge to use FrontierAEO?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "No technical knowledge is required. Our tool generates ready-to-use HTML and structured data that you can simply copy and paste into your content management system or website."
      }
    },
    {
      "@type": "Question",
      name: "How many content pieces can I generate with the free tier?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "The free tier allows you to generate 5 content pieces per month. For unlimited generations and additional features, you can upgrade to our Premium plan at any time."
      }
    }
  ]
});

// Generic article schema generator
export const generateArticleSchema = (
  title: string,
  description: string,
  url: string,
  publishDate: string,
  modifiedDate?: string
): ArticleSchema => ({
  "@context": "https://schema.org",
  "@type": "Article",
  headline: title,
  description: description,
  author: {
    "@type": "Organization",
    name: "GenerativeSearch.pro",
    url: "https://generativesearch.pro"
  },
  publisher: {
    "@type": "Organization",
    name: "GenerativeSearch.pro",
    url: "https://generativesearch.pro",
    logo: {
      "@type": "ImageObject",
      url: "https://generativesearch.pro/lovable-uploads/06f84961-215a-4c1a-855e-bd2ba1c43691.png"
    }
  },
  datePublished: publishDate,
  dateModified: modifiedDate || publishDate,
  mainEntityOfPage: {
    "@type": "WebPage",
    "@id": url
  }
});
