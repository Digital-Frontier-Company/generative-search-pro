
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search } from "lucide-react";

interface DomainInputProps {
  onAnalyze: (domain: string) => void;
  loading?: boolean;
}

const DomainInput = ({ onAnalyze, loading = false }: DomainInputProps) => {
  const [domain, setDomain] = useState("");

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
          <Input
            type="text"
            placeholder="Enter domain (e.g., example.com or https://example.com)"
            value={domain}
            onChange={(e) => setDomain(e.target.value)}
            onKeyDown={handleKeyPress}
            className="text-base bg-gray-800 border-gray-600 text-white"
            disabled={loading}
          />
        </div>
        <Button 
          type="submit"
          disabled={loading || !domain.trim()}
          className="min-w-[120px] bg-green-600 hover:bg-green-700"
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
      </form>
    </div>
  );
};

export default DomainInput;
