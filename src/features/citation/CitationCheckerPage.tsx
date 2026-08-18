import { useState } from "react";
import { Helmet } from "react-helmet-async";
import { useSearchParams } from "react-router-dom";
import { Quote } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import Header from "@/components/global/Header";
import CitationChecker from "@/features/citation/CitationChecker";
import CitationMonitoringDashboard from "@/features/citation/CitationMonitoringDashboard";
import CitationAttributionTracker from "@/features/citation/CitationAttributionTracker";
import MultiLanguageCitationMonitor from "@/features/citation/MultiLanguageCitationMonitor";
import AIPlatformCitations from "@/features/citation/panels/AIPlatformCitations";
import VoiceCitations from "@/features/citation/panels/VoiceCitations";
import CitationOpportunities from "@/features/citation/panels/CitationOpportunities";
import SourceValidator from "@/features/citation/panels/SourceValidator";

const TABS = [
  { value: "check", label: "Check a query" },
  { value: "platforms", label: "AI platforms" },
  { value: "voice", label: "Voice" },
  { value: "monitoring", label: "Monitoring" },
  { value: "attribution", label: "Attribution" },
  { value: "languages", label: "Languages" },
  { value: "opportunities", label: "Opportunities" },
  { value: "sources", label: "Source validator" },
];

const CitationCheckerPage = () => {
  const [params, setParams] = useSearchParams();
  const initial = TABS.some((t) => t.value === params.get("tab")) ? params.get("tab")! : "check";
  const [tab, setTab] = useState(initial);

  const onChange = (value: string) => {
    setTab(value);
    const next = new URLSearchParams(params);
    next.set("tab", value);
    setParams(next, { replace: true });
  };

  return (
    <>
      <Helmet>
        <title>Citation Hub: Track AI Citations & Answer Sources</title>
        <meta
          name="description"
          content="One place for every AI citation workflow: query checks, ChatGPT/Claude/Perplexity coverage, voice assistants, monitoring, attribution, languages, opportunities and source validation."
        />
        <link rel="canonical" href="https://generativesearch.pro/citation-checker" />
      </Helmet>
      <Header />
      <div className="container mx-auto max-w-6xl space-y-6 px-4 py-8">
        <header className="space-y-2">
          <div className="flex items-center gap-3">
            <Quote className="h-6 w-6 text-primary" />
            <h1 className="text-2xl font-semibold tracking-tight">Citation Hub</h1>
          </div>
          <p className="max-w-3xl text-sm text-muted-foreground">
            Every citation capability in one place — check a single query, compare assistants and voice
            platforms, monitor coverage over time, trace attribution and language coverage, hunt
            opportunities, and validate the sources AI answers point at.
          </p>
        </header>

        <Tabs value={tab} onValueChange={onChange} className="w-full">
          <TabsList className="flex h-auto w-full flex-wrap justify-start gap-1">
            {TABS.map((t) => (
              <TabsTrigger key={t.value} value={t.value}>
                {t.label}
              </TabsTrigger>
            ))}
          </TabsList>

          <TabsContent value="check" className="mt-6">
            <CitationChecker />
          </TabsContent>
          <TabsContent value="platforms" className="mt-6">
            <AIPlatformCitations />
          </TabsContent>
          <TabsContent value="voice" className="mt-6">
            <VoiceCitations />
          </TabsContent>
          <TabsContent value="monitoring" className="mt-6">
            <CitationMonitoringDashboard />
          </TabsContent>
          <TabsContent value="attribution" className="mt-6">
            <CitationAttributionTracker />
          </TabsContent>
          <TabsContent value="languages" className="mt-6">
            <MultiLanguageCitationMonitor />
          </TabsContent>
          <TabsContent value="opportunities" className="mt-6">
            <CitationOpportunities />
          </TabsContent>
          <TabsContent value="sources" className="mt-6">
            <SourceValidator />
          </TabsContent>
        </Tabs>
      </div>
    </>
  );
};

export default CitationCheckerPage;
