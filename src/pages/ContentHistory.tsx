
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

const ContentHistory = () => {
  const navigate = useNavigate();
  const [selectedContent, setSelectedContent] = useState<ContentBlock | null>(null);
  
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
    toast.success("Content history refreshed");
  };

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
      
      {isLoading ? (
        <Card>
          <CardContent className="py-10 flex items-center justify-center">
            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
          </CardContent>
        </Card>
      ) : contentBlocks && contentBlocks.length > 0 ? (
        <Card>
          <CardHeader>
            <CardTitle>Generated Content</CardTitle>
            <CardDescription>
              Your previously generated content items
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Title</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Created</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {contentBlocks.map((content) => (
                  <TableRow key={content.id}>
                    <TableCell className="font-medium">{content.title}</TableCell>
                    <TableCell>
                      <Badge variant="outline" className="capitalize">
                        {content.metadata?.jsonLdSchema?.["@type"] || "Article"}
                      </Badge>
                    </TableCell>
                    <TableCell>{formatDistanceToNow(new Date(content.created_at), { addSuffix: true })}</TableCell>
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
        </Card>
      ) : (
        <Card>
          <CardContent className="py-10 text-center">
            <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-muted">
              <ArrowRight className="h-6 w-6 text-muted-foreground" />
            </div>
            <h3 className="mb-2 text-lg font-medium">No content found</h3>
            <p className="mb-4 text-sm text-muted-foreground">
              You haven't generated any content yet. Start creating your first content piece.
            </p>
            <Button onClick={() => navigate('/generator')}>
              Create Content
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default ContentHistory;
