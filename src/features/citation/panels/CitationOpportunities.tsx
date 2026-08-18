import { useState } from "react";
import { Loader2, Target } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useDomain } from "@/contexts/DomainContext";
import { useAuth } from "@/contexts/AuthContext";
import { invokeTool, type ToolError } from "@/lib/toolInvoke";
import { toast } from "sonner";

interface Opportunity {
  query: string;
  citationProbability: number;
  contentGaps: string[];
  competitorAdvantages: string[];
  optimizationActions: string[];
  timeToRank: string;
  difficultyScore: number;
}

interface ScanResponse {
  domain: string;
  opportunities: Opportunity[];
}

const CitationOpportunities = () => {
  const { defaultDomain } = useDomain();
  const { user } = useAuth();
  const [domain, setDomain] = useState(defaultDomain ?? "");
  const [contentUrl, setContentUrl] = useState("");
  const [queries, setQueries] = useState("");
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState<ScanResponse | null>(null);
  const [error, setError] = useState<string | null>(null);

  const run = async () => {
    const target = (domain || defaultDomain || "").trim();
    if (!target) {
      toast.error("Enter a domain to scan.");
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const result = await invokeTool<ScanResponse>("citation-opportunity-scanner", {
        domain: target,
        user_id: user?.id,
        content_url: contentUrl.trim() || undefined,
        target_queries: queries.trim() || undefined,
        analysis_depth: "standard",
      });
      setData(result);
    } catch (e) {
      setError((e as ToolError).message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <Target className="h-4 w-4 text-primary" /> Citation opportunity scanner
          </CardTitle>
          <CardDescription>
            Find the queries where you are closest to being cited, and what stands between you and the citation.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="grid gap-3 sm:grid-cols-2">
            <Input value={domain} onChange={(e) => setDomain(e.target.value)} placeholder="example.com" aria-label="Domain" />
            <Input
              value={contentUrl}
              onChange={(e) => setContentUrl(e.target.value)}
              placeholder="https://example.com/page-to-analyze (optional)"
              aria-label="Page URL"
            />
          </div>
          <Textarea
            value={queries}
            onChange={(e) => setQueries(e.target.value)}
            placeholder="Optional: comma-separated queries to test"
            aria-label="Target queries"
          />
          <Button onClick={run} disabled={loading}>
            {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {loading ? "Scanning…" : "Scan opportunities"}
          </Button>
        </CardContent>
      </Card>

      {error && (
        <Card className="border-destructive/40">
          <CardContent className="p-4 text-sm text-destructive">{error}</CardContent>
        </Card>
      )}

      {data?.opportunities?.map((o) => (
        <Card key={o.query}>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">{o.query}</CardTitle>
            <CardDescription className="flex flex-wrap gap-2 pt-1">
              <Badge variant="secondary">{Math.round(o.citationProbability)}% citation chance</Badge>
              <Badge variant="outline">Difficulty {o.difficultyScore}</Badge>
              <Badge variant="outline">{o.timeToRank}</Badge>
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3 text-sm">
            <Progress value={o.citationProbability} />
            {o.contentGaps?.length ? (
              <div>
                <p className="font-medium">Content gaps</p>
                <ul className="list-disc pl-5 text-muted-foreground">
                  {o.contentGaps.map((g) => <li key={g}>{g}</li>)}
                </ul>
              </div>
            ) : null}
            {o.optimizationActions?.length ? (
              <div>
                <p className="font-medium">Next actions</p>
                <ul className="list-disc pl-5 text-muted-foreground">
                  {o.optimizationActions.map((a) => <li key={a}>{a}</li>)}
                </ul>
              </div>
            ) : null}
          </CardContent>
        </Card>
      ))}
    </div>
  );
};

export default CitationOpportunities;
