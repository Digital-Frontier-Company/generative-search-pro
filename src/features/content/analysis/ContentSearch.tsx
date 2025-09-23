
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { ContentSearchRequest, ContentBlock, searchContent } from "@/services/contentService";
import { SearchIcon, Loader2 } from "lucide-react";
import { toast } from "sonner";

interface ContentSearchProps {
  onSearchResults?: (results: ContentBlock[]) => void;
}

const ContentSearch = ({ onSearchResults }: ContentSearchProps) => {
  const [query, setQuery] = useState("");
  const [isSearching, setIsSearching] = useState(false);

  const handleSearch = async () => {
    if (!query.trim()) {
      toast.error("Please enter a search query");
      return;
    }

    setIsSearching(true);

    try {
      const request: ContentSearchRequest = {
        query: query.trim(),
        threshold: 0.5,
        limit: 10
      };

      const results = await searchContent(request);
      
      if (onSearchResults) {
        onSearchResults(results);
      }
      
      if (results.length === 0) {
        toast.info("No matching content found");
      } else {
        toast.success(`Found ${results.length} matching results`);
      }
    } catch (error) {
      console.error("Error during search:", error);
      toast.error("Search failed. Please try again.");
    } finally {
      setIsSearching(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      handleSearch();
    }
  };

  return (
    <div className="flex items-center space-x-2">
      <div className="relative flex-1">
        <Input
          placeholder="Search your content..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onKeyDown={handleKeyPress}
          className="pr-8"
        />
        {isSearching && (
          <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
            <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
          </div>
        )}
      </div>
      <Button 
        onClick={handleSearch} 
        disabled={isSearching || !query.trim()}
      >
        <SearchIcon className="h-4 w-4 mr-2" />
        Search
      </Button>
    </div>
  );
};

export default ContentSearch;
