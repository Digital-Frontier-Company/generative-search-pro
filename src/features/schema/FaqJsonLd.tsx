import JsonLdSchema from "@/features/schema/JsonLdSchema";
import { buildFaqSchema, type FaqItem } from "@/utils/jsonLdSchemas";

interface FaqJsonLdProps {
  /** Question/answer pairs rendered on the page. */
  faqs: FaqItem[] | undefined | null;
  /** Maximum number of entries to emit (Google renders a limited set). */
  limit?: number;
}

/**
 * Emits a schema.org FAQPage JSON-LD block for a rendered FAQ section so
 * search engines can surface rich FAQ results. Renders nothing when there
 * is no valid question/answer pair.
 */
const FaqJsonLd = ({ faqs, limit }: FaqJsonLdProps) => {
  const schema = buildFaqSchema(faqs, limit);
  if (!schema) return null;
  return <JsonLdSchema schema={schema} />;
};

export default FaqJsonLd;
