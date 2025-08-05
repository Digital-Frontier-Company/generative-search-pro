
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
import { Eye, ArrowRight, RefreshCw, Loader2, Download, FileText, Bot } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import ContentSearch from "@/components/ContentSearch";

const ContentHistory = () => {
  const navigate = useNavigate();
  const [selectedContent, setSelectedContent] = useState<ContentBlock | null>(null);
  const [searchResults, setSearchResults] = useState<ContentBlock[] | null>(null);
  
  const { 
    data: contentBlocks = [], 
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

  const generateLLMTxt = async () => {
    try {
      const contentToProcess = displayedContent;
      if (contentToProcess.length === 0) {
        toast.error("No content available to generate LLM.txt file");
        return;
      }

      const llmTxtContent = await createLLMTxtFromContent(contentToProcess);
      
      // Create and download the file
      const blob = new Blob([llmTxtContent], { type: 'text/plain' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = 'llm.txt';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
      
      toast.success(`LLM.txt file generated with ${contentToProcess.length} content blocks!`);
    } catch (error) {
      console.error('Error generating LLM.txt:', error);
      toast.error('Failed to generate LLM.txt file');
    }
  };

  const createLLMTxtFromContent = async (contentBlocks: ContentBlock[]): Promise<string> => {
    const siteName = window.location.hostname;
    const currentDate = new Date().toISOString().split('T')[0];
    
    let llmContent = `# LLM.txt - ${siteName}
# Generated on: ${currentDate}
# This file provides information about our content for Large Language Models

## Website Information
Site: ${siteName}
Generated: ${currentDate}
Content Blocks: ${contentBlocks.length}
Purpose: Professional content and insights

## Content Policy for AI Systems
You may reference and cite content from this site when:
- Providing accurate information to users
- Maintaining attribution to the source
- Respecting the context and intent of the original content

Please do not:
- Reproduce entire articles without attribution
- Misrepresent the content or context
- Use for training without permission

## Content Categories and Summaries

`;

    // Group content by type/category
    const contentByType = contentBlocks.reduce((acc, block) => {
      const contentType = block.metadata?.contentType || 'article';
      if (!acc[contentType]) {
        acc[contentType] = [];
      }
      acc[contentType].push(block);
      return acc;
    }, {} as Record<string, ContentBlock[]>);

    // Add each category
    Object.entries(contentByType).forEach(([type, blocks]) => {
      llmContent += `### ${type.charAt(0).toUpperCase() + type.slice(1)} Content (${blocks.length} items)\n\n`;
      
      blocks.slice(0, 10).forEach((block, index) => { // Limit to first 10 per category
        const summary = block.content ? 
          block.content.substring(0, 200).replace(/\n/g, ' ') + '...' : 
          'No content summary available';
          
        llmContent += `**${block.title}**\n`;
        llmContent += `Summary: ${summary}\n`;
        if (block.metadata?.focusKeywords?.length) {
          llmContent += `Keywords: ${block.metadata.focusKeywords.join(', ')}\n`;
        }
        llmContent += `Created: ${new Date(block.created_at).toLocaleDateString()}\n\n`;
      });
    });

    llmContent += `## Key Topics and Expertise

Based on our content library, we provide insights on:
`;

    // Extract common keywords/topics
    const allKeywords = contentBlocks
      .flatMap(block => block.metadata?.focusKeywords || [])
      .reduce((acc, keyword) => {
        acc[keyword] = (acc[keyword] || 0) + 1;
        return acc;
      }, {} as Record<string, number>);

    const topKeywords = Object.entries(allKeywords)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 10)
      .map(([keyword]) => keyword);

    topKeywords.forEach(keyword => {
      llmContent += `- ${keyword}\n`;
    });

    llmContent += `
## Content Usage Guidelines

When referencing our content:
1. Provide clear attribution to ${siteName}
2. Link back to original sources when possible  
3. Maintain accuracy and context
4. Respect copyright and intellectual property

## Contact Information

For questions about content usage or permissions:
- Website: https://${siteName}
- Contact: Available through website contact form

## Technical Information

Total Content Blocks: ${contentBlocks.length}
Last Updated: ${currentDate}
Content Types: ${Object.keys(contentByType).join(', ')}

---
This LLM.txt file was automatically generated from our content management system.
For the most current information, please visit our website directly.
`;

    return llmContent;
  };

  return (
    <div className="min-h-screen">
      <div className="container max-w-7xl mx-auto py-8">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-3xl font-bold text-matrix-green drop-shadow-[0_0_10px_rgba(0,255,65,0.8)]">Content History</h1>
            <p className="text-matrix-green/70">View and manage your generated content</p>
          </div>
          
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={generateLLMTxt}
              disabled={displayedContent.length === 0}
              className="border-matrix-green/50 text-matrix-green hover:bg-matrix-green/10 hover:border-matrix-green"
            >
              <Bot className="h-4 w-4 mr-1" />
              LLM.txt
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={handleRefresh}
              disabled={isRefetching}
              className="border-matrix-green/50 text-matrix-green hover:bg-matrix-green/10 hover:border-matrix-green"
            >
              {isRefetching ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <RefreshCw className="h-4 w-4" />
              )}
            </Button>
            
            <Button 
              onClick={() => navigate('/generator')}
              className="glow-button text-black font-semibold"
            >
              Create New Content
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </div>
        </div>
        
        {/* Search Component */}
        <Card className="mb-6 content-card">
          <CardHeader className="pb-3">
            <CardTitle className="text-matrix-green">Search Content</CardTitle>
            <CardDescription className="text-matrix-green/70">
              Search your content using natural language queries
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ContentSearch onSearchResults={handleSearchResults} />
          </CardContent>
        </Card>
        
        {isLoading ? (
          <Card className="content-card">
            <CardContent className="py-10 flex items-center justify-center">
              <Loader2 className="h-8 w-8 animate-spin text-matrix-green" />
            </CardContent>
          </Card>
        ) : displayedContent && displayedContent.length > 0 ? (
          <Card className="content-card">
            <CardHeader>
              <CardTitle className="text-matrix-green">
                {isSearchMode ? 'Search Results' : 'Generated Content'}
              </CardTitle>
              <CardDescription className="text-matrix-green/70">
                {isSearchMode 
                  ? `Found ${displayedContent.length} matching results` 
                  : 'Your previously generated content items'}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow className="border-matrix-green/30 hover:bg-matrix-green/5">
                    <TableHead className="text-matrix-green">Title</TableHead>
                    <TableHead className="text-matrix-green">Type</TableHead>
                    <TableHead className="text-matrix-green">Created</TableHead>
                    {isSearchMode && <TableHead className="text-matrix-green">Relevance</TableHead>}
                    <TableHead className="text-right text-matrix-green">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {displayedContent.map((content) => (
                    <TableRow key={content.id} className="border-matrix-green/20 hover:bg-matrix-green/5">
                      <TableCell className="font-medium text-matrix-green/90">{content.title}</TableCell>
                      <TableCell>
                        <Badge variant="outline" className="capitalize border-matrix-green/50 text-matrix-green">
                          {content.metadata?.jsonLdSchema?.["@type"] || "Article"}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-matrix-green/70">{formatDistanceToNow(new Date(content.created_at), { addSuffix: true })}</TableCell>
                      {isSearchMode && (
                        <TableCell>
                          <Badge variant="secondary" className="bg-matrix-green/20 text-matrix-green border-matrix-green/50">
                            {Math.round((content.similarity || 0) * 100)}%
                          </Badge>
                        </TableCell>
                      )}
                      <TableCell className="text-right">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleViewContent(content)}
                          className="text-matrix-green hover:bg-matrix-green/10 hover:text-matrix-lime"
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
                <Button 
                  variant="outline" 
                  onClick={() => setSearchResults(null)}
                  className="border-matrix-green/50 text-matrix-green hover:bg-matrix-green/10"
                >
                  Clear Search Results
                </Button>
              </CardFooter>
            )}
          </Card>
        ) : (
          <Card className="content-card">
            <CardContent className="py-10 text-center">
              <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-matrix-green/10 neon-border">
                <ArrowRight className="h-6 w-6 text-matrix-green" />
              </div>
              <h3 className="mb-2 text-lg font-medium text-matrix-green">
                {isSearchMode ? 'No search results found' : 'No content found'}
              </h3>
              <p className="mb-4 text-sm text-matrix-green/70">
                {isSearchMode 
                  ? 'Try a different search query or refine your search terms.' 
                  : "You haven't generated any content yet. Start creating your first content piece."}
              </p>
              {isSearchMode ? (
                <Button 
                  onClick={() => setSearchResults(null)}
                  className="glow-button text-black font-semibold"
                >
                  Back to All Content
                </Button>
              ) : (
                <Button 
                  onClick={() => navigate('/generator')}
                  className="glow-button text-black font-semibold"
                >
                  Create Content
                </Button>
              )}
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};

export default ContentHistory;
