import { useState } from "react";
import { Loader2, Bot, CheckCircle2, XCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useDomain } from "@/contexts/DomainContext";
import { useAuth } from "@/contexts/AuthContext";
import { invokeTool, type ToolError } from "@/lib/toolInvoke";
import { toast } from "sonner";

interface PlatformResult {
  platform: string;
  query: string;
  response: string;
  cited: boolean;
  citationScore: number;
  sources?: string[];
  confidence?: number;
}

interface PlatformResponse {
  query: string;
  domain: string;
  results: PlatformResult[];
  totalCitations: number;
  averageScore: number;
  checkedAt: string;
}

const PLATFORMS = ["chatgpt", "claude", "perplexity"];

const AIPlatformCitations = () => {
  const { defaultDomain } = useDomain();
  const { user } = useAuth();
  const [query, setQuery] = useState("");
  const [domain, setDomain] = useState(defaultDomain ?? "");
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState<PlatformResponse | null>(null);
  const [error, setError] = useState<string | null>(null);

  const run = async () => {
    const target = (domain || defaultDomain || "").trim();
    if (!query.trim() || !target) {
      toast.error("Enter both a query and a domain.");
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const result = await invokeTool<PlatformResponse>("check-ai-platform-citations", {
        query: query.trim(),
        domain: target,
        user_id: user?.id,
        platforms: PLATFORMS.join(","),
        search_method: "direct",
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
            <Bot className="h-4 w-4 text-primary" /> Assistant citation check
          </CardTitle>
          <CardDescription>
            Ask the same question across ChatGPT, Claude and Perplexity and see which of them cite you.
          </CardDescription>
        </CardHeader>
        <CardContent className="grid gap-3 sm:grid-cols-[2fr,1fr,auto]">
          <Input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="e.g. who can haul dirt away in Memphis this week"
            aria-label="Query to test"
          />
          <Input
            value={domain}
            onChange={(e) => setDomain(e.target.value)}
            placeholder="example.com"
            aria-label="Domain"
          />
          <Button onClick={run} disabled={loading}>
            {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {loading ? "Checking…" : "Check platforms"}
          </Button>
        </CardContent>
      </Card>

      {error && (
        <Card className="border-destructive/40">
          <CardContent className="p-4 text-sm text-destructive">{error}</CardContent>
        </Card>
      )}

      {data && (
        <div className="space-y-3">
          <div className="flex flex-wrap gap-2 text-sm text-muted-foreground">
            <Badge variant="secondary">{data.totalCitations} of {data.results.length} cited you</Badge>
            <Badge variant="outline">Avg score {Math.round(data.averageScore)}</Badge>
          </div>
          {data.results.map((r) => (
            <Card key={r.platform}>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm capitalize">{r.platform}</CardTitle>
                {r.cited ? (
                  <span className="flex items-center gap-1 text-xs text-primary">
                    <CheckCircle2 className="h-4 w-4" /> Cited
                  </span>
                ) : (
                  <span className="flex items-center gap-1 text-xs text-muted-foreground">
                    <XCircle className="h-4 w-4" /> Not cited
                  </span>
                )}
              </CardHeader>
              <CardContent className="space-y-2">
                <p className="whitespace-pre-wrap text-sm text-muted-foreground">{r.response}</p>
                {r.sources?.length ? (
                  <ul className="space-y-1 text-xs">
                    {r.sources.map((s) => (
                      <li key={s}>
                        <a className="underline" href={s} target="_blank" rel="noreferrer">
                          {s}
                        </a>
                      </li>
                    ))}
                  </ul>
                ) : null}
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

export default AIPlatformCitations;
