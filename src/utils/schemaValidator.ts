
import Ajv from "ajv";

// Initialize AJV validator
const ajv = new Ajv({
  allErrors: true, // Show all errors instead of stopping at the first one
  strict: false, // Allow additional properties
});

// Define the base JSON-LD schema structure
const jsonLdBaseSchema = {
  type: "object",
  required: ["@context", "@type"],
  properties: {
    "@context": { type: "string", enum: ["https://schema.org"] },
    "@type": { type: "string" },
    // Common properties that most schema types should have
    "name": { type: "string" },
    "description": { type: "string" },
    "url": { type: "string" },
  },
  additionalProperties: true, // Allow additional properties based on the specific schema type
};

// Define specific schema types we validate
const articleSchema = {
  ...jsonLdBaseSchema,
  properties: {
    ...jsonLdBaseSchema.properties,
    "@type": { type: "string", enum: ["Article", "BlogPosting", "NewsArticle"] },
    "headline": { type: "string" },
    "author": {
      oneOf: [
        { type: "string" },
        {
          type: "object",
          properties: {
            "@type": { type: "string", enum: ["Person", "Organization"] },
            "name": { type: "string" },
          },
          required: ["@type", "name"],
        },
      ],
    },
    "datePublished": { type: "string", format: "date-time" },
    "publisher": {
      type: "object",
      properties: {
        "@type": { type: "string", enum: ["Organization"] },
        "name": { type: "string" },
      },
      required: ["@type", "name"],
    },
    "image": { 
      oneOf: [
        { type: "string" },
        { 
          type: "object",
          properties: {
            "@type": { type: "string", enum: ["ImageObject"] },
            "url": { type: "string" },
          },
          required: ["@type", "url"],
        },
      ],
    },
  },
  required: ["@context", "@type", "headline"],
};

const faqSchema = {
  ...jsonLdBaseSchema,
  properties: {
    ...jsonLdBaseSchema.properties,
    "@type": { type: "string", enum: ["FAQPage"] },
    "mainEntity": {
      type: "array",
      items: {
        type: "object",
        properties: {
          "@type": { type: "string", enum: ["Question"] },
          "name": { type: "string" },
          "acceptedAnswer": {
            type: "object",
            properties: {
              "@type": { type: "string", enum: ["Answer"] },
              "text": { type: "string" },
            },
            required: ["@type", "text"],
          },
        },
        required: ["@type", "name", "acceptedAnswer"],
      },
    },
  },
  required: ["@context", "@type", "mainEntity"],
};

// Pre-compile validators for better performance
const articleValidator = ajv.compile(articleSchema);
const faqValidator = ajv.compile(faqSchema);

/**
 * Validate JSON-LD schema based on its type
 * @param schema The JSON-LD schema to validate
 * @returns An object containing validation result and any errors
 */
export function validateJsonLdSchema(schema: Record<string, any>): { 
  isValid: boolean; 
  errors: string[] | null;
  schemaType: string | null;
} {
  if (!schema || typeof schema !== "object") {
    return { 
      isValid: false, 
      errors: ["Invalid schema: must be an object"], 
      schemaType: null 
    };
  }

  const schemaType = schema["@type"];
  if (!schemaType) {
    return { 
      isValid: false, 
      errors: ["Schema is missing @type property"],
      schemaType: null
    };
  }

  let valid = false;
  let validator;

  // Select appropriate validator based on schema type
  if (["Article", "BlogPosting", "NewsArticle"].includes(schemaType)) {
    validator = articleValidator;
  } else if (schemaType === "FAQPage") {
    validator = faqValidator;
  } else {
    // For other schema types, do basic validation
    const basicValidator = ajv.compile(jsonLdBaseSchema);
    validator = basicValidator;
  }

  // Validate the schema
  valid = validator(schema);
  
  // Format and return any errors
  if (!valid && validator.errors) {
    const errorMessages = validator.errors.map(error => 
      `${error.instancePath} ${error.message}`
    );
    return { isValid: false, errors: errorMessages, schemaType };
  }

  return { isValid: true, errors: null, schemaType };
}

/**
 * Checks if a generated schema meets our minimum requirements
 * @param schema The JSON-LD schema to check
 * @param contentType The type of content being validated (blog, article, faq)
 */
export function validateContentSchema(
  schema: Record<string, any>, 
  contentType: 'blog' | 'article' | 'faq'
): { 
  isValid: boolean; 
  recommendations: string[] | null;
} {
  const { isValid, errors, schemaType } = validateJsonLdSchema(schema);
  
  if (!isValid) {
    return { 
      isValid: false, 
      recommendations: errors
    };
  }
  
  const recommendations: string[] = [];
  
  // Content-specific recommendations
  if (contentType === 'faq' && schemaType !== 'FAQPage') {
    recommendations.push("For FAQ content, use FAQPage schema type");
  }
  
  if (['blog', 'article'].includes(contentType) && 
      !['Article', 'BlogPosting', 'NewsArticle'].includes(schemaType as string)) {
    recommendations.push(`For ${contentType} content, use Article, BlogPosting, or NewsArticle schema types`);
  }
  
  // Check for common enhancements
  if (['Article', 'BlogPosting', 'NewsArticle'].includes(schemaType as string)) {
    if (!schema.author) recommendations.push("Add author information to improve schema");
    if (!schema.datePublished) recommendations.push("Add publication date to improve schema");
    if (!schema.image) recommendations.push("Add image to improve schema visibility");
  }
  
  return {
    isValid: true,
    recommendations: recommendations.length > 0 ? recommendations : null
  };
}
