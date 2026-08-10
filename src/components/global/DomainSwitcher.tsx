import { useState } from "react";
import { Check, ChevronsUpDown, Globe, Plus, Star, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Separator } from "@/components/ui/separator";
import { useDomain, cleanDomain, isValidDomain } from "@/contexts/DomainContext";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

const DomainSwitcher = () => {
  const { user } = useAuth();
  const {
    defaultDomain,
    savedDefaultDomain,
    domains,
    setActiveDomain,
    addDomain,
    removeDomain,
    setDefaultDomain,
  } = useDomain();
  const [open, setOpen] = useState(false);
  const [value, setValue] = useState("");

  if (!user) return null;

  const handleAdd = () => {
    if (!isValidDomain(value)) {
      toast.error("Enter a valid domain, e.g. example.com");
      return;
    }
    addDomain(value);
    setValue("");
    toast.success(`Switched to ${cleanDomain(value)}`);
  };

  const makeDefault = async (domain: string) => {
    try {
      await setDefaultDomain(domain);
      toast.success(`${domain} is now your default domain`);
    } catch {
      toast.error("Could not save default domain");
    }
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          size="sm"
          className="h-8 max-w-[220px] justify-between gap-2"
          aria-label="Switch active domain"
        >
          <Globe className="h-3.5 w-3.5 shrink-0 opacity-70" />
          <span className="truncate text-xs">
            {defaultDomain || "No domain set"}
          </span>
          <ChevronsUpDown className="h-3.5 w-3.5 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent align="end" className="w-80 p-2">
        <p className="px-2 pb-2 text-xs font-medium text-muted-foreground">
          Active domain — every tool uses this
        </p>

        <div className="max-h-56 space-y-1 overflow-y-auto">
          {domains.length === 0 && (
            <p className="px-2 py-3 text-xs text-muted-foreground">
              No domains yet. Add your first one below.
            </p>
          )}
          {domains.map((domain) => (
            <div
              key={domain}
              className={cn(
                "group flex items-center gap-1 rounded-md px-2 py-1.5 hover:bg-accent",
                domain === defaultDomain && "bg-accent/60"
              )}
            >
              <button
                type="button"
                onClick={() => {
                  setActiveDomain(domain);
                  setOpen(false);
                }}
                className="flex flex-1 items-center gap-2 text-left text-sm"
              >
                <Check
                  className={cn(
                    "h-3.5 w-3.5",
                    domain === defaultDomain ? "opacity-100" : "opacity-0"
                  )}
                />
                <span className="truncate">{domain}</span>
                {domain === savedDefaultDomain && (
                  <span className="ml-auto text-[10px] uppercase tracking-wide text-muted-foreground">
                    default
                  </span>
                )}
              </button>
              {domain !== savedDefaultDomain && (
                <>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-6 w-6 opacity-0 group-hover:opacity-100"
                    aria-label={`Make ${domain} the default`}
                    onClick={() => makeDefault(domain)}
                  >
                    <Star className="h-3.5 w-3.5" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-6 w-6 opacity-0 group-hover:opacity-100"
                    aria-label={`Remove ${domain}`}
                    onClick={() => removeDomain(domain)}
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </Button>
                </>
              )}
            </div>
          ))}
        </div>

        <Separator className="my-2" />

        <div className="flex items-center gap-2">
          <Input
            value={value}
            onChange={(e) => setValue(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleAdd()}
            placeholder="add example.com"
            className="h-8 text-xs"
          />
          <Button size="icon" className="h-8 w-8" onClick={handleAdd} aria-label="Add domain">
            <Plus className="h-4 w-4" />
          </Button>
        </div>
      </PopoverContent>
    </Popover>
  );
};

export default DomainSwitcher;
