
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { 
  Card, 
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle 
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { ContentBlock, getUserContentHistory } from "@/services/contentService";
import { formatDistanceToNow } from "date-fns";
import { Eye, ArrowRight, RefreshCw, Loader2 } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import ContentSearch from "@/components/ContentSearch";

const ContentHistory = () => {
  const navigate = useNavigate();
  const [selectedContent, setSelectedContent] = useState<ContentBlock | null>(null);
  const [searchResults, setSearchResults] = useState<ContentBlock[] | null>(null);
  
  const { 
    data: contentBlocks, 
    isLoading, 
    refetch,
    isRefetching
  } = useQuery({
    queryKey: ['contentHistory'],
    queryFn: getUserContentHistory
  });
  
  const handleViewContent = (content: ContentBlock) => {
    setSelectedContent(content);
    // In a full implementation, this would navigate to a content view page
    // navigate(`/content/${content.id}`);
    toast.info("Content preview not implemented yet. This would navigate to a dedicated content view page.");
  };
  
  const handleRefresh = () => {
    refetch();
    setSearchResults(null);
    toast.success("Content history refreshed");
  };

  const handleSearchResults = (results: ContentBlock[]) => {
    setSearchResults(results);
  };

  const displayedContent = searchResults || contentBlocks;
  const isSearchMode = searchResults !== null;

  return (
    <div className="container max-w-7xl mx-auto py-8">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold">Content History</h1>
          <p className="text-muted-foreground">View and manage your generated content</p>
        </div>
        
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={handleRefresh}
            disabled={isRefetching}
          >
            {isRefetching ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <RefreshCw className="h-4 w-4" />
            )}
          </Button>
          
          <Button onClick={() => navigate('/generator')}>
            Create New Content
            <ArrowRight className="ml-2 h-4 w-4" />
          </Button>
        </div>
      </div>
      
      {/* Search Component */}
      <Card className="mb-6">
        <CardHeader className="pb-3">
          <CardTitle>Search Content</CardTitle>
          <CardDescription>
            Search your content using natural language queries
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ContentSearch onSearchResults={handleSearchResults} />
        </CardContent>
      </Card>
      
      {isLoading ? (
        <Card>
          <CardContent className="py-10 flex items-center justify-center">
            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
          </CardContent>
        </Card>
      ) : displayedContent && displayedContent.length > 0 ? (
        <Card>
          <CardHeader>
            <CardTitle>
              {isSearchMode ? 'Search Results' : 'Generated Content'}
            </CardTitle>
            <CardDescription>
              {isSearchMode 
                ? `Found ${displayedContent.length} matching results` 
                : 'Your previously generated content items'}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Title</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Created</TableHead>
                  {isSearchMode && <TableHead>Relevance</TableHead>}
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {displayedContent.map((content) => (
                  <TableRow key={content.id}>
                    <TableCell className="font-medium">{content.title}</TableCell>
                    <TableCell>
                      <Badge variant="outline" className="capitalize">
                        {content.metadata?.jsonLdSchema?.["@type"] || "Article"}
                      </Badge>
                    </TableCell>
                    <TableCell>{formatDistanceToNow(new Date(content.created_at), { addSuffix: true })}</TableCell>
                    {isSearchMode && (
                      <TableCell>
                        <Badge variant="secondary">
                          {Math.round((content.similarity || 0) * 100)}%
                        </Badge>
                      </TableCell>
                    )}
                    <TableCell className="text-right">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleViewContent(content)}
                      >
                        <Eye className="h-4 w-4 mr-2" />
                        View
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
          {isSearchMode && (
            <CardFooter>
              <Button variant="outline" onClick={() => setSearchResults(null)}>
                Clear Search Results
              </Button>
            </CardFooter>
          )}
        </Card>
      ) : (
        <Card>
          <CardContent className="py-10 text-center">
            <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-muted">
              <ArrowRight className="h-6 w-6 text-muted-foreground" />
            </div>
            <h3 className="mb-2 text-lg font-medium">
              {isSearchMode ? 'No search results found' : 'No content found'}
            </h3>
            <p className="mb-4 text-sm text-muted-foreground">
              {isSearchMode 
                ? 'Try a different search query or refine your search terms.' 
                : "You haven't generated any content yet. Start creating your first content piece."}
            </p>
            {isSearchMode ? (
              <Button onClick={() => setSearchResults(null)}>
                Back to All Content
              </Button>
            ) : (
              <Button onClick={() => navigate('/generator')}>
                Create Content
              </Button>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default ContentHistory;
