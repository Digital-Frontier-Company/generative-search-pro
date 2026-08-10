import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Search, ArrowRight, Globe } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { TOOLS, TOOL_CATEGORIES, type ToolDefinition } from "@/config/tools";
import { useDomain } from "@/contexts/DomainContext";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

const statusLabel: Record<ToolDefinition["status"], string> = {
  live: "",
  beta: "Beta",
  "coming-soon": "Coming soon",
};

const ToolsHubPage = () => {
  const navigate = useNavigate();
  const { defaultDomain } = useDomain();
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState<string>("all");

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return TOOLS.filter((tool) => {
      const matchesCategory = category === "all" || tool.category === category;
      const matchesQuery =
        !q ||
        tool.title.toLowerCase().includes(q) ||
        tool.description.toLowerCase().includes(q) ||
        tool.outcome.toLowerCase().includes(q);
      return matchesCategory && matchesQuery;
    });
  }, [query, category]);

  const open = (tool: ToolDefinition) => {
    if (tool.status === "coming-soon") {
      toast.info(`${tool.title} isn't available yet.`);
      return;
    }
    if (tool.usesDomain && !defaultDomain) {
      toast.error("Set an active domain first using the switcher in the top bar.");
      return;
    }
    navigate(tool.path, { state: { domain: defaultDomain } });
  };

  return (
    <div className="container mx-auto max-w-6xl px-4 py-8">
      <header className="mb-6 space-y-2">
        <h1 className="text-3xl font-semibold tracking-tight">Tools</h1>
        <p className="text-sm text-muted-foreground">
          Every analysis, optimization and research tool in one place.
          {defaultDomain ? (
            <span className="ml-1 inline-flex items-center gap-1">
              Running against <Globe className="h-3 w-3" />
              <span className="font-medium text-foreground">{defaultDomain}</span>.
            </span>
          ) : (
            <span className="ml-1">Set an active domain in the top bar to get started.</span>
          )}
        </p>
      </header>

      <div className="mb-6 space-y-3">
        <div className="relative">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search tools…"
            className="pl-9"
            aria-label="Search tools"
          />
        </div>
        <div className="flex flex-wrap gap-2">
          <Button
            variant={category === "all" ? "default" : "outline"}
            size="sm"
            onClick={() => setCategory("all")}
          >
            All ({TOOLS.length})
          </Button>
          {TOOL_CATEGORIES.map((cat) => (
            <Button
              key={cat.id}
              variant={category === cat.id ? "default" : "outline"}
              size="sm"
              onClick={() => setCategory(cat.id)}
            >
              {cat.label}
            </Button>
          ))}
        </div>
      </div>

      {filtered.length === 0 ? (
        <Card className="border-dashed">
          <CardContent className="py-12 text-center text-sm text-muted-foreground">
            No tools match “{query}”.
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-10">
          {TOOL_CATEGORIES.filter((cat) =>
            filtered.some((tool) => tool.category === cat.id)
          ).map((cat) => (
            <section key={cat.id}>
              <h2 className="text-lg font-medium">{cat.label}</h2>
              <p className="mb-4 text-sm text-muted-foreground">{cat.description}</p>
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {filtered
                  .filter((tool) => tool.category === cat.id)
                  .map((tool) => (
                    <Card
                      key={tool.id}
                      role="button"
                      tabIndex={0}
                      onClick={() => open(tool)}
                      onKeyDown={(e) => e.key === "Enter" && open(tool)}
                      className={cn(
                        "group cursor-pointer transition-all hover:-translate-y-0.5 hover:border-primary/50 hover:shadow-lg",
                        tool.status === "coming-soon" && "opacity-60"
                      )}
                    >
                      <CardContent className="space-y-3 p-5">
                        <div className="flex items-start justify-between gap-2">
                          <span className="rounded-lg bg-primary/10 p-2 text-primary">
                            <tool.icon className="h-5 w-5" />
                          </span>
                          <div className="flex items-center gap-1">
                            {tool.usesDomain && (
                              <span
                                className={cn(
                                  "h-2 w-2 rounded-full",
                                  defaultDomain ? "bg-emerald-500" : "bg-amber-500"
                                )}
                                title={defaultDomain ? "Domain ready" : "Needs a domain"}
                              />
                            )}
                            {statusLabel[tool.status] && (
                              <Badge variant="secondary" className="text-[10px]">
                                {statusLabel[tool.status]}
                              </Badge>
                            )}
                          </div>
                        </div>
                        <div>
                          <h3 className="font-medium">{tool.title}</h3>
                          <p className="text-sm text-muted-foreground">{tool.description}</p>
                        </div>
                        <p className="text-xs text-muted-foreground">{tool.outcome}</p>
                        <span className="inline-flex items-center text-xs font-medium text-primary opacity-0 transition-opacity group-hover:opacity-100">
                          Open <ArrowRight className="ml-1 h-3 w-3" />
                        </span>
                      </CardContent>
                    </Card>
                  ))}
              </div>
            </section>
          ))}
        </div>
      )}
    </div>
  );
};

export default ToolsHubPage;
