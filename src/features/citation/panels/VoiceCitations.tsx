import { useState } from "react";
import { Loader2, Mic, CheckCircle2, XCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useDomain } from "@/contexts/DomainContext";
import { useAuth } from "@/contexts/AuthContext";
import { invokeTool, type ToolError } from "@/lib/toolInvoke";
import { toast } from "sonner";

interface VoiceResult {
  platform: string;
  response: string;
  cited: boolean;
  citationScore: number;
  sources?: string[];
}

interface VoiceResponse {
  query: string;
  domain: string;
  results: VoiceResult[];
  totalCitations: number;
  averageScore: number;
}

const VoiceCitations = () => {
  const { defaultDomain } = useDomain();
  const { user } = useAuth();
  const [query, setQuery] = useState("");
  const [domain, setDomain] = useState(defaultDomain ?? "");
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState<VoiceResponse | null>(null);
  const [error, setError] = useState<string | null>(null);

  const run = async () => {
    const target = (domain || defaultDomain || "").trim();
    if (!query.trim() || !target) {
      toast.error("Enter both a spoken question and a domain.");
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const result = await invokeTool<VoiceResponse>("check-voice-citations", {
        query: query.trim(),
        domain: target,
        user_id: user?.id,
        platforms: "google_assistant,alexa,siri",
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
            <Mic className="h-4 w-4 text-primary" /> Voice assistant citations
          </CardTitle>
          <CardDescription>
            Check whether Google Assistant, Alexa and Siri read out an answer sourced from your site.
          </CardDescription>
        </CardHeader>
        <CardContent className="grid gap-3 sm:grid-cols-[2fr,1fr,auto]">
          <Input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="e.g. hey Google, who removes dirt in Memphis"
            aria-label="Spoken query"
          />
          <Input
            value={domain}
            onChange={(e) => setDomain(e.target.value)}
            placeholder="example.com"
            aria-label="Domain"
          />
          <Button onClick={run} disabled={loading}>
            {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {loading ? "Checking…" : "Check voice"}
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
          <Badge variant="secondary">{data.totalCitations} of {data.results.length} assistants cited you</Badge>
          {data.results.map((r) => (
            <Card key={r.platform}>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm capitalize">{r.platform.replace(/_/g, " ")}</CardTitle>
                {r.cited ? (
                  <CheckCircle2 className="h-4 w-4 text-primary" />
                ) : (
                  <XCircle className="h-4 w-4 text-muted-foreground" />
                )}
              </CardHeader>
              <CardContent>
                <p className="whitespace-pre-wrap text-sm text-muted-foreground">{r.response}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

export default VoiceCitations;
