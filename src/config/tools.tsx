import {
  BarChart3,
  Globe,
  Shield,
  CheckSquare,
  Map,
  FileText,
  Microscope,
  History,
  Eye,
  Zap,
  Search,
  Brain,
  Mic,
  Crown,
  Swords,
  LayoutTemplate,
  Rocket,
  type LucideIcon,
} from "lucide-react";

export type ToolStatus = "live" | "beta" | "coming-soon";

export type ToolCategoryId =
  | "visibility"
  | "technical"
  | "content"
  | "research"
  | "getting-started";

export interface ToolCategory {
  id: ToolCategoryId;
  label: string;
  description: string;
}

export interface ToolDefinition {
  id: string;
  title: string;
  description: string;
  /** What the user actually gets out of it — shown on the hub card. */
  outcome: string;
  path: string;
  category: ToolCategoryId;
  icon: LucideIcon;
  usesDomain: boolean;
  status: ToolStatus;
  /** Show in the sidebar (the hub always lists everything). */
  inSidebar?: boolean;
}

export const TOOL_CATEGORIES: ToolCategory[] = [
  {
    id: "getting-started",
    label: "Getting Started",
    description: "Set up your site and get a baseline read on visibility.",
  },
  {
    id: "visibility",
    label: "AI Visibility & Citations",
    description:
      "Track where ChatGPT, Perplexity, Gemini and AI Overviews mention you.",
  },
  {
    id: "technical",
    label: "Technical & Structure",
    description: "Make your site crawlable, parseable and citable by AI engines.",
  },
  {
    id: "content",
    label: "Content & Answers",
    description: "Create and optimize content designed to be quoted.",
  },
  {
    id: "research",
    label: "Research & Competition",
    description: "Understand intent, competitors and where the gaps are.",
  },
];

export const TOOLS: ToolDefinition[] = [
  // Getting started
  {
    id: "onboarding",
    title: "Setup & Onboarding",
    description: "Configure your domain, market and goals in a few steps.",
    outcome: "A configured workspace and a starting optimization plan.",
    path: "/tso-onboarding",
    category: "getting-started",
    icon: Rocket,
    usesDomain: false,
    status: "live",
    inSidebar: true,
  },
  {
    id: "templates",
    title: "Business Templates",
    description: "Pre-built optimization playbooks by business type.",
    outcome: "A tailored checklist of the tools and tactics that fit you.",
    path: "/business-type-templates",
    category: "getting-started",
    icon: LayoutTemplate,
    usesDomain: false,
    status: "live",
  },

  // Visibility
  {
    id: "ai-visibility",
    title: "AI Visibility Tracker",
    description: "Monitor how often AI engines surface your brand.",
    outcome: "A visibility score per AI platform, tracked over time.",
    path: "/ai-visibility-tracker",
    category: "visibility",
    icon: Eye,
    usesDomain: true,
    status: "live",
    inSidebar: true,
  },
  {
    id: "citations",
    title: "Citation Checker",
    description: "Check whether AI answers cite your pages for key queries.",
    outcome: "Query-by-query citation results with the URLs that won.",
    path: "/citation-checker",
    category: "visibility",
    icon: CheckSquare,
    usesDomain: true,
    status: "live",
    inSidebar: true,
  },
  {
    id: "authority",
    title: "Authority Tracker",
    description: "Track brand mentions and authority signals across the web.",
    outcome: "An authority trend line plus the sources driving it.",
    path: "/authority-tracker",
    category: "visibility",
    icon: Crown,
    usesDomain: true,
    status: "live",
  },
  {
    id: "zero-click",
    title: "Zero-Click Optimizer",
    description: "Optimize passages for snippets and AI answer boxes.",
    outcome: "Rewritten passages ready to be lifted into an answer.",
    path: "/zero-click-optimizer",
    category: "visibility",
    icon: Zap,
    usesDomain: false,
    status: "live",
  },
  {
    id: "voice",
    title: "Voice Search Optimizer",
    description: "Tune content for spoken, conversational queries.",
    outcome: "Voice-ready question/answer pairs and gaps to fill.",
    path: "/voice-search-optimizer",
    category: "visibility",
    icon: Mic,
    usesDomain: false,
    status: "live",
  },

  // Technical
  {
    id: "seo-analysis",
    title: "SEO Analysis",
    description: "Full technical and on-page audit of your domain.",
    outcome: "Scored findings across technical, speed and backlinks.",
    path: "/seo-analysis",
    category: "technical",
    icon: BarChart3,
    usesDomain: true,
    status: "live",
    inSidebar: true,
  },
  {
    id: "ai-readiness",
    title: "AI Readiness",
    description: "Assess how well AI crawlers can access and parse your site.",
    outcome: "A readiness score with blocking issues ranked by impact.",
    path: "/technical-ai-readiness",
    category: "technical",
    icon: Shield,
    usesDomain: true,
    status: "live",
    inSidebar: true,
  },
  {
    id: "schema",
    title: "Schema Analysis",
    description: "Validate and generate structured data markup.",
    outcome: "Validation errors plus copy-paste JSON-LD fixes.",
    path: "/schema-analysis",
    category: "technical",
    icon: Shield,
    usesDomain: true,
    status: "live",
  },
  {
    id: "sitemap",
    title: "AI Sitemap",
    description: "Generate sitemaps and llms.txt for AI crawlers.",
    outcome: "Downloadable sitemap and AI crawler directives.",
    path: "/ai-sitemap",
    category: "technical",
    icon: Map,
    usesDomain: true,
    status: "live",
  },
  {
    id: "semantic",
    title: "Semantic Analyzer",
    description: "Extract entities, relationships and topical structure.",
    outcome: "A knowledge graph of your content plus semantic gaps.",
    path: "/semantic-analyzer",
    category: "technical",
    icon: Brain,
    usesDomain: false,
    status: "live",
  },

  // Content
  {
    id: "generator",
    title: "Content Generator",
    description: "Generate answer-engine-optimized content.",
    outcome: "Draft content structured for AI extraction.",
    path: "/generator",
    category: "content",
    icon: FileText,
    usesDomain: false,
    status: "live",
    inSidebar: true,
  },
  {
    id: "content-analysis",
    title: "Content Analysis",
    description: "Score existing content for AI answerability.",
    outcome: "Quality scores and prioritized rewrite suggestions.",
    path: "/content-analysis",
    category: "content",
    icon: Microscope,
    usesDomain: false,
    status: "live",
  },
  {
    id: "history",
    title: "Content History",
    description: "Everything you've generated, in one place.",
    outcome: "Searchable archive of past outputs.",
    path: "/history",
    category: "content",
    icon: History,
    usesDomain: false,
    status: "live",
    inSidebar: true,
  },

  // Research
  {
    id: "domain-analysis",
    title: "Domain Analysis",
    description: "Keyword footprint and performance for any domain.",
    outcome: "Ranking keywords, volumes and estimated traffic.",
    path: "/domain-analysis",
    category: "research",
    icon: Globe,
    usesDomain: true,
    status: "live",
    inSidebar: true,
  },
  {
    id: "intent",
    title: "Intent Research",
    description: "Map the questions real users ask AI engines.",
    outcome: "Intent clusters with content angles for each.",
    path: "/intent-driven-research",
    category: "research",
    icon: Search,
    usesDomain: false,
    status: "live",
  },
  {
    id: "competitive",
    title: "Competitive AI Analysis",
    description: "See who AI engines cite instead of you, and why.",
    outcome: "Competitor citation share and the gaps to attack.",
    path: "/competitive-ai-analysis",
    category: "research",
    icon: Swords,
    usesDomain: true,
    status: "live",
    inSidebar: true,
  },
];

export const getToolsByCategory = (category: ToolCategoryId) =>
  TOOLS.filter((tool) => tool.category === category);

export const getToolByPath = (path: string) =>
  TOOLS.find((tool) => tool.path === path);

export const SIDEBAR_TOOLS = TOOLS.filter((tool) => tool.inSidebar);
