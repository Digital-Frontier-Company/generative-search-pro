import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

type Importance = "high" | "medium" | "low";
type Priority = "high" | "medium" | "low";

const STOP_WORDS = new Set([
  "the", "and", "for", "with", "that", "this", "from", "have", "has", "are", "was", "were",
  "you", "your", "our", "their", "its", "into", "when", "what", "which", "will", "can",
  "but", "not", "all", "any", "how", "why", "who", "they", "them", "then", "than", "also",
  "more", "most", "some", "such", "only", "other", "over", "very", "just", "about",
]);

const PREDICATES = [
  "is", "are", "was", "were", "has", "have", "provides", "enables", "supports", "includes",
  "requires", "uses", "improves", "reduces", "creates", "offers", "helps", "allows", "causes",
];

const RELATION_MAP: Record<string, string> = {
  is: "is-a",
  are: "is-a",
  was: "is-a",
  were: "is-a",
  has: "part-of",
  have: "part-of",
  includes: "part-of",
  provides: "enables",
  enables: "enables",
  supports: "enables",
  allows: "enables",
  helps: "enables",
  improves: "causes",
  reduces: "causes",
  causes: "causes",
  creates: "causes",
};

const clamp = (n: number, min = 0, max = 100) => Math.max(min, Math.min(max, Math.round(n)));

const sentencesOf = (text: string) =>
  text
    .replace(/\s+/g, " ")
    .split(/(?<=[.!?])\s+/)
    .map((s) => s.trim())
    .filter((s) => s.length > 15);

const wordsOf = (text: string) =>
  text.toLowerCase().match(/[a-z][a-z'-]{2,}/g) ?? [];

function extractEntities(text: string) {
  const counts = new Map<string, number>();

  // Proper-noun-ish phrases
  const proper = text.match(/\b[A-Z][a-zA-Z0-9]+(?:\s+[A-Z][a-zA-Z0-9]+){0,2}\b/g) ?? [];
  for (const raw of proper) {
    const term = raw.trim();
    if (term.length < 3) continue;
    if (STOP_WORDS.has(term.toLowerCase())) continue;
    counts.set(term, (counts.get(term) ?? 0) + 3);
  }

  // Frequent content words
  for (const word of wordsOf(text)) {
    if (STOP_WORDS.has(word) || word.length < 4) continue;
    counts.set(word, (counts.get(word) ?? 0) + 1);
  }

  return [...counts.entries()]
    .sort((a, b) => b[1] - a[1])
    .slice(0, 25)
    .map(([label, weight]) => ({ label, weight }));
}

function extractTriples(sentences: string[]) {
  const triples: Array<{
    subject: string;
    predicate: string;
    object: string;
    confidence: number;
    context: string;
    importance: Importance;
  }> = [];

  for (const sentence of sentences) {
    const lower = sentence.toLowerCase();
    const predicate = PREDICATES.find((p) => lower.includes(` ${p} `));
    if (!predicate) continue;

    const index = lower.indexOf(` ${predicate} `);
    const subject = sentence.slice(0, index).trim().replace(/^[^A-Za-z0-9]+/, "");
    const object = sentence
      .slice(index + predicate.length + 2)
      .trim()
      .replace(/[.!?]$/, "");

    if (subject.length < 3 || object.length < 3) continue;

    const wordCount = subject.split(" ").length + object.split(" ").length;
    const confidence = clamp(95 - wordCount * 2, 40, 95);
    const importance: Importance = confidence >= 80 ? "high" : confidence >= 60 ? "medium" : "low";

    triples.push({
      subject: subject.split(" ").slice(-6).join(" "),
      predicate,
      object: object.split(" ").slice(0, 12).join(" "),
      confidence,
      context: sentence.slice(0, 180),
      importance,
    });

    if (triples.length >= 30) break;
  }

  return triples;
}

function buildRelationships(triples: ReturnType<typeof extractTriples>) {
  return triples.slice(0, 20).map((t) => ({
    entity1: t.subject,
    entity2: t.object,
    relationship: t.predicate,
    strength: t.confidence,
    type: (RELATION_MAP[t.predicate] ?? "related-to") as
      | "is-a"
      | "part-of"
      | "related-to"
      | "causes"
      | "enables"
      | "competes-with",
  }));
}

function buildStructure(
  content: string,
  sentences: string[],
  entities: Array<{ label: string; weight: number }>,
  triples: ReturnType<typeof extractTriples>,
) {
  const headings = content.match(/^#{1,6}\s.+$|^.{3,80}:\s*$/gm) ?? [];
  const hierarchyDepth = Math.min(6, Math.max(1, new Set(headings.map((h) => (h.match(/^#+/)?.[0].length ?? 2))).size || 1));

  const topEntities = entities.slice(0, 12);
  const clusterSize = Math.max(2, Math.ceil(topEntities.length / 3));
  const semanticClusters = [] as Array<{
    cluster: string;
    entities: string[];
    relationships: number;
    coherence: number;
  }>;

  for (let i = 0; i < topEntities.length; i += clusterSize) {
    const group = topEntities.slice(i, i + clusterSize);
    if (!group.length) continue;
    const labels = group.map((g) => g.label);
    const relationships = triples.filter((t) =>
      labels.some((l) => `${t.subject} ${t.object}`.toLowerCase().includes(l.toLowerCase())),
    ).length;
    semanticClusters.push({
      cluster: labels[0],
      entities: labels,
      relationships,
      coherence: clamp(45 + relationships * 8 + group.length * 4),
    });
  }

  const chunkCount = Math.min(5, Math.max(1, Math.ceil(sentences.length / 6)));
  const chunkSize = Math.ceil(sentences.length / chunkCount) || 1;
  const topicFlow = Array.from({ length: chunkCount }, (_, i) => {
    const chunk = sentences.slice(i * chunkSize, (i + 1) * chunkSize);
    const chunkText = chunk.join(" ");
    const topics = topEntities
      .filter((e) => chunkText.toLowerCase().includes(e.label.toLowerCase()))
      .slice(0, 4)
      .map((e) => e.label);
    const words = wordsOf(chunkText).length || 1;
    return {
      section: `Section ${i + 1}`,
      topics: topics.length ? topics : ["general"],
      semanticDensity: clamp((topics.length / 4) * 100),
      connectionStrength: clamp((chunkText.length / Math.max(words, 1)) * 8),
    };
  });

  const nodes = topEntities.map((e, i) => ({
    id: `n${i}`,
    label: e.label,
    type: /^[A-Z]/.test(e.label) ? "entity" : "concept",
    importance: clamp((e.weight / (topEntities[0]?.weight || 1)) * 100),
  }));

  const nodeId = new Map(nodes.map((n) => [n.label.toLowerCase(), n.id]));
  const edges = triples
    .map((t) => {
      const source = [...nodeId.entries()].find(([label]) => t.subject.toLowerCase().includes(label));
      const target = [...nodeId.entries()].find(([label]) => t.object.toLowerCase().includes(label));
      if (!source || !target || source[1] === target[1]) return null;
      return {
        source: source[1],
        target: target[1],
        relationship: t.predicate,
        weight: t.confidence,
      };
    })
    .filter(Boolean) as Array<{ source: string; target: string; relationship: string; weight: number }>;

  return {
    hierarchyDepth,
    semanticClusters,
    topicFlow,
    knowledgeGraph: { nodes, edges },
  };
}

function buildGaps(params: {
  targetTopic: string;
  content: string;
  entities: Array<{ label: string; weight: number }>;
  triples: unknown[];
  headingCount: number;
}) {
  const gaps: Array<{ gap: string; severity: Priority; impact: string; suggestion: string }> = [];
  const { targetTopic, content, entities, triples, headingCount } = params;

  if (targetTopic && !content.toLowerCase().includes(targetTopic.toLowerCase())) {
    gaps.push({
      gap: `Target topic "${targetTopic}" is never stated explicitly`,
      severity: "high",
      impact: "AI engines cannot confidently attribute this content to the topic.",
      suggestion: `Add an opening sentence that defines ${targetTopic} in plain language.`,
    });
  }

  if (triples.length < 5) {
    gaps.push({
      gap: "Few extractable subject–predicate–object statements",
      severity: "high",
      impact: "Answer engines have little they can quote verbatim.",
      suggestion: "Rewrite key claims as short declarative sentences: X is Y. X enables Z.",
    });
  }

  if (headingCount < 3) {
    gaps.push({
      gap: "Shallow heading structure",
      severity: "medium",
      impact: "Passage retrieval struggles to isolate the relevant chunk.",
      suggestion: "Break the content into question-shaped H2/H3 sections.",
    });
  }

  if (entities.length < 8) {
    gaps.push({
      gap: "Thin entity coverage",
      severity: "medium",
      impact: "Weak topical association in knowledge graphs.",
      suggestion: "Mention related entities, tools, standards and named concepts.",
    });
  }

  if (!/\b\d/.test(content)) {
    gaps.push({
      gap: "No concrete figures or data points",
      severity: "low",
      impact: "Less likely to be cited as a source of fact.",
      suggestion: "Add statistics, dates or measurable outcomes with attribution.",
    });
  }

  return gaps;
}

function buildSuggestions(scores: {
  structureScore: number;
  relationshipScore: number;
  coherenceScore: number;
}) {
  const suggestions: Array<{
    type: "structure" | "relationships" | "entities" | "flow";
    title: string;
    description: string;
    priority: Priority;
    expectedImpact: string;
    implementation: string;
  }> = [];

  if (scores.structureScore < 75) {
    suggestions.push({
      type: "structure",
      title: "Introduce a clear answer-first hierarchy",
      description:
        "Lead each section with a 40–60 word direct answer, then supporting detail.",
      priority: scores.structureScore < 55 ? "high" : "medium",
      expectedImpact: "Higher passage-level retrieval and snippet eligibility.",
      implementation: "Add H2s phrased as questions, followed immediately by the answer paragraph.",
    });
  }

  if (scores.relationshipScore < 75) {
    suggestions.push({
      type: "relationships",
      title: "State entity relationships explicitly",
      description:
        "Replace implicit references with named relationships (X is a type of Y, X requires Z).",
      priority: scores.relationshipScore < 55 ? "high" : "medium",
      expectedImpact: "Stronger knowledge-graph edges and better topical attribution.",
      implementation: "Rewrite pronoun-heavy sentences to repeat the entity name.",
    });
  }

  if (scores.coherenceScore < 75) {
    suggestions.push({
      type: "flow",
      title: "Tighten topical flow between sections",
      description: "Each section should advance one topic instead of revisiting several.",
      priority: "medium",
      expectedImpact: "Reduced semantic drift, cleaner chunk boundaries.",
      implementation: "Group related sentences and add one-line transitions between sections.",
    });
  }

  suggestions.push({
    type: "entities",
    title: "Reinforce the primary entity",
    description:
      "Mention the primary entity in the first sentence, one heading and the conclusion.",
    priority: "low",
    expectedImpact: "More consistent entity association across retrievals.",
    implementation: "Audit the first 100 words and the final paragraph.",
  });

  return suggestions;
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const { content, target_topic = "", user_id } = await req.json();

    if (!content || typeof content !== "string" || content.trim().length < 40) {
      throw new Error("Provide at least a short paragraph of content to analyze");
    }
    if (!user_id) {
      throw new Error("user_id is required");
    }

    const text = content.trim();
    const sentences = sentencesOf(text);
    const entities = extractEntities(text);
    const triples = extractTriples(sentences);
    const entityRelationships = buildRelationships(triples);
    const contentStructure = buildStructure(text, sentences, entities, triples);
    const headingCount = (text.match(/^#{1,6}\s.+$/gm) ?? []).length;

    const avgSentenceLength =
      sentences.reduce((sum, s) => sum + s.split(" ").length, 0) / (sentences.length || 1);

    const structureScore = clamp(
      30 + headingCount * 8 + Math.min(sentences.length, 25) * 1.2 +
        (avgSentenceLength <= 24 ? 12 : 0),
    );
    const relationshipScore = clamp(25 + triples.length * 3 + entityRelationships.length * 2);
    const coherenceScore = clamp(
      35 +
        contentStructure.semanticClusters.reduce((sum, c) => sum + c.coherence, 0) /
          (contentStructure.semanticClusters.length || 1) /
          2.2 +
        (target_topic && text.toLowerCase().includes(String(target_topic).toLowerCase()) ? 10 : 0),
    );
    const overallSemanticScore = clamp(
      structureScore * 0.35 + relationshipScore * 0.35 + coherenceScore * 0.3,
    );

    const analysis = {
      overallSemanticScore,
      structureScore,
      relationshipScore,
      coherenceScore,
      extractedTriples: triples,
      entityRelationships,
      contentStructure,
      semanticGaps: buildGaps({
        targetTopic: String(target_topic || ""),
        content: text,
        entities,
        triples,
        headingCount,
      }),
      optimizationSuggestions: buildSuggestions({
        structureScore,
        relationshipScore,
        coherenceScore,
      }),
      lastAnalyzed: new Date().toISOString(),
    };

    return new Response(JSON.stringify({ success: true, analysis }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Error in analyze-semantic-structure:", error);
    return new Response(
      JSON.stringify({ success: false, error: (error as Error).message }),
      { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } },
    );
  }
});
