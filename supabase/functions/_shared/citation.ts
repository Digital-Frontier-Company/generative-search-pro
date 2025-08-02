// Shared helpers for extracting citation information from different search engines
// Keeps Edge Functions small and consistent

export interface CitationExtraction {
  isCited: boolean;
  citationPosition: number | null;
  aiAnswer: string;
  citedSources: any[];
  totalSources: number;
}

/**
 * Google SGE result extractor (serpapi engine=google)
 */
export function extractGoogle(serpData: any, domain: string): CitationExtraction {
  let isCited = false;
  let aiAnswer = '';
  let citedSources: any[] = [];
  let citationPosition: number | null = null;
  let totalSources = 0;

  if (serpData.ai_overview) {
    aiAnswer = serpData.ai_overview.overview || '';
    citedSources = serpData.ai_overview.sources || [];
    totalSources = citedSources.length;

    citedSources.forEach((source: any, index: number) => {
      if (source.link && source.link.includes(domain)) {
        isCited = true;
        if (citationPosition === null) citationPosition = index + 1;
      }
    });

    if (!isCited && aiAnswer.toLowerCase().includes(domain.toLowerCase())) {
      isCited = true;
      citationPosition = citedSources.length + 1;
    }
  }

  return { isCited, citationPosition, aiAnswer, citedSources, totalSources };
}

/**
 * Bing answer box extraction (serpapi engine=bing)
 */
export function extractBing(serpData: any, domain: string): CitationExtraction {
  let isCited = false;
  let aiAnswer = '';
  let citedSources: any[] = [];
  let citationPosition: number | null = null;
  let totalSources = 0;

  if (serpData.answer_box) {
    aiAnswer = serpData.answer_box.answer || serpData.answer_box.snippet || '';
    if (serpData.answer_box.links) citedSources = serpData.answer_box.links;
    totalSources = citedSources.length;

    citedSources.forEach((source: any, index: number) => {
      if (source.link && source.link.includes(domain)) {
        isCited = true;
        if (citationPosition === null) citationPosition = index + 1;
      }
    });

    if (!isCited && aiAnswer.toLowerCase().includes(domain.toLowerCase())) {
      isCited = true;
      citationPosition = citedSources.length + 1;
    }
  }

  return { isCited, citationPosition, aiAnswer, citedSources, totalSources };
}
