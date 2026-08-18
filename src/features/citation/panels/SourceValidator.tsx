import { useState } from "react";
import { Loader2, Link2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { invokeTool, type ToolError } from "@/lib/toolInvoke";
import { toast } from "sonner";

interface ValidatedUrl {
  url: string;
  status: "Live" | "Redirect" | "Broken" | "Error" | "Unknown";
}

const tone: Record<ValidatedUrl["status"], "default" | "secondary" | "destructive" | "outline"> = {
  Live: "default",
  Redirect: "secondary",
  Broken: "destructive",
  Error: "destructive",
  Unknown: "outline",
};

const SourceValidator = () => {
  const [raw, setRaw] = useState("");
  const [loading, setLoading] = useState(false);
  const [rows, setRows] = useState<ValidatedUrl[] | null>(null);
  const [error, setError] = useState<string | null>(null);

  const run = async () => {
    const urls = raw
      .split(/[\n,\s]+/)
      .map((u) => u.trim())
      .filter(Boolean)
      .slice(0, 50);
    if (!urls.length) {
      toast.error("Paste at least one URL.");
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const result = await invokeTool<{ validatedUrls: ValidatedUrl[] }>("validate-cited-sources", { urls });
      setRows(result.validatedUrls ?? []);
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
            <Link2 className="h-4 w-4 text-primary" /> Cited source validator
          </CardTitle>
          <CardDescription>
            Paste the URLs an AI answer cited and confirm they still resolve — dead citations quietly kill answer share.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          <Textarea
            value={raw}
            onChange={(e) => setRaw(e.target.value)}
            placeholder={"https://example.com/page-a\nhttps://example.com/page-b"}
            rows={5}
            aria-label="URLs to validate"
          />
          <Button onClick={run} disabled={loading}>
            {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {loading ? "Validating…" : "Validate URLs"}
          </Button>
        </CardContent>
      </Card>

      {error && (
        <Card className="border-destructive/40">
          <CardContent className="p-4 text-sm text-destructive">{error}</CardContent>
        </Card>
      )}

      {rows && (
        <Card>
          <CardContent className="space-y-2 p-4">
            {rows.map((r) => (
              <div key={r.url} className="flex items-center justify-between gap-3 border-b pb-2 last:border-0 last:pb-0">
                <a className="truncate text-sm underline" href={r.url} target="_blank" rel="noreferrer">
                  {r.url}
                </a>
                <Badge variant={tone[r.status] ?? "outline"}>{r.status}</Badge>
              </div>
            ))}
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default SourceValidator;
