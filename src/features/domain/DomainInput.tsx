
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { SmartInput } from "@/components/optimized/SmartInput";
import { Tooltip, TooltipTrigger, TooltipContent, TooltipProvider } from "@/components/ui/tooltip";
import { Search } from "lucide-react";
import { useDomain } from "@/contexts/DomainContext";

interface DomainInputProps {
  onAnalyze: (domain: string) => void;
  loading?: boolean;
}

const DomainInput = ({ onAnalyze, loading = false }: DomainInputProps) => {
  const { defaultDomain } = useDomain();
  const [domain, setDomain] = useState("");

  // Auto-populate with default domain when available
  useEffect(() => {
    if (defaultDomain && !domain) {
      setDomain(defaultDomain);
    }
  }, [defaultDomain, domain]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (domain.trim()) {
      onAnalyze(domain.trim());
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      handleSubmit(e);
    }
  };

  return (
    <div className="max-w-2xl mx-auto mb-8">
      <form onSubmit={handleSubmit} className="flex gap-4">
        <div className="flex-1">
          <SmartInput
            label="Domain"
            name="domain"
            type="text"
            placeholder="e.g., example.com or https://example.com"
            value={domain}
            onChange={setDomain}
            onKeyDown={handleKeyPress as any}
            validationRules={{
              required: true,
              pattern: /^(https?:\/\/)?([\w-]+\.)+[\w-]{2,}(\/.*)?$/i,
            }}
            helpText="We support http(s) and naked domains"
            formName="domain-analyze"
            className="text-base bg-gray-800 border-gray-600 text-white"
            required
          />
        </div>
        <TooltipProvider delayDuration={300}>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button 
                type="submit"
                disabled={loading || !domain.trim()}
                className="min-w-[140px] bg-green-600 hover:bg-green-700"
                aria-label="Analyze the entered domain"
              >
                {loading ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Analyzing...
                  </>
                ) : (
                  <>
                    <Search className="h-4 w-4 mr-2" />
                    Analyze SEO
                  </>
                )}
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              Run a full SEO & AI-visibility scan for this domain
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      </form>
    </div>
  );
};

export default DomainInput;
