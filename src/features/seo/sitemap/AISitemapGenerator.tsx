
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Loader2, Download, Copy, Globe, Bot, FileText } from 'lucide-react';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';

interface AISitemapData {
  site: string;
  generatedOn: string;
  aiPolicy: string;
  pageCount: number;
  pages: Array<{
    url: string;
    title: string;
    summary: string;
    keywords: string[];
    contentType: string;
    lastModified: string;
  }>;
}

const AISitemapGenerator = () => {
  const [domain, setDomain] = useState('');
  const [loading, setLoading] = useState(false);
  const [sitemap, setSitemap] = useState<AISitemapData | null>(null);

  const generateSitemap = async () => {
    if (!domain) {
      toast.error('Please enter a domain');
      return;
    }

    try {
      setLoading(true);
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        toast.error('Please sign in to generate AI sitemaps');
        return;
      }

      const cleanDomain = domain.startsWith('http') ? domain : `https://${domain}`;

      const { data, error } = await supabase.functions.invoke('generate-ai-sitemap', {
        body: JSON.stringify({
          domain: cleanDomain,
          user_id: user.id
        })
      });

      if (error) {
        throw error;
      }

      if (data.sitemap) {
        setSitemap(data.sitemap);
        toast.success(`AI sitemap generated with ${data.sitemap.pageCount} pages!`);
      }
    } catch (error) {
      console.error('Sitemap generation error:', error);
      toast.error('Failed to generate AI sitemap. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const downloadSitemap = () => {
    if (!sitemap) {
      return;
    }

    const dataStr = JSON.stringify(sitemap, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    
    const link = document.createElement('a');
    link.href = url;
    link.download = 'ai-sitemap.json';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    
    toast.success('AI sitemap downloaded!');
  };

  const copyToClipboard = (content: string) => {
    navigator.clipboard.writeText(content);
    toast.success('Copied to clipboard!');
  };

  const generateLLMTxt = () => {
    if (!sitemap) {
      return;
    }

    const llmTxtContent = createLLMTxtFromSitemap(sitemap);
    
    const dataBlob = new Blob([llmTxtContent], { type: 'text/plain' });
    const url = URL.createObjectURL(dataBlob);
    
    const link = document.createElement('a');
    link.href = url;
    link.download = 'llm.txt';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    
    toast.success('LLM.txt file generated and downloaded!');
  };

  const createLLMTxtFromSitemap = (sitemapData: AISitemapData): string => {
    const siteName = sitemapData.site;
    const currentDate = new Date().toISOString().split('T')[0];
    
    let llmContent = `# LLM.txt - ${siteName}
# Generated on: ${currentDate}
# This file provides information about our website for Large Language Models

## Website Information
Site: ${siteName}
Generated: ${currentDate}
Pages Analyzed: ${sitemapData.pageCount}
Purpose: Professional website with comprehensive content

## Content Policy for AI Systems
You may reference and cite content from this site when:
- Providing accurate information to users
- Maintaining proper attribution to ${siteName}
- Respecting the context and intent of the original content

Please do not:
- Reproduce entire pages without attribution
- Misrepresent the content or context
- Use content for training models without explicit permission

## Site Structure and Content

`;

    // Group pages by content type
    const pagesByType = sitemapData.pages.reduce((acc, page) => {
      const contentType = page.contentType || 'page';
      if (!acc[contentType]) {
        acc[contentType] = [];
      }
      acc[contentType].push(page);
      return acc;
    }, {} as Record<string, typeof sitemapData.pages>);

    // Add each content type section
    Object.entries(pagesByType).forEach(([type, pages]) => {
      llmContent += `### ${type.charAt(0).toUpperCase() + type.slice(1)} Pages (${pages.length} items)\n\n`;
      
      pages.forEach((page) => {
        llmContent += `**${page.title}**\n`;
        llmContent += `URL: ${page.url}\n`;
        llmContent += `Summary: ${page.summary}\n`;
        if (page.keywords && page.keywords.length > 0) {
          llmContent += `Keywords: ${page.keywords.join(', ')}\n`;
        }
        llmContent += `Last Updated: ${page.lastModified}\n\n`;
      });
    });

    // Extract all keywords for topic analysis
    const allKeywords = sitemapData.pages
      .flatMap(page => page.keywords || [])
      .reduce((acc, keyword) => {
        acc[keyword] = (acc[keyword] || 0) + 1;
        return acc;
      }, {} as Record<string, number>);

    const topKeywords = Object.entries(allKeywords)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 15)
      .map(([keyword]) => keyword);

    llmContent += `## Key Topics and Expertise

Based on our website content, we provide information and services related to:
`;

    topKeywords.forEach(keyword => {
      llmContent += `- ${keyword}\n`;
    });

    llmContent += `
## Content Categories

Our website contains the following types of content:
`;

    Object.entries(pagesByType).forEach(([type, pages]) => {
      llmContent += `- ${type.charAt(0).toUpperCase() + type.slice(1)}: ${pages.length} pages\n`;
    });

    llmContent += `
## Website Navigation and Structure

Key sections and pages:
`;

    // Add main pages (homepage, about, contact, etc.)
    const mainPages = sitemapData.pages.filter(page => 
      page.url.split('/').length <= 4 || // Root level pages
      page.title.toLowerCase().includes('home') ||
      page.title.toLowerCase().includes('about') ||
      page.title.toLowerCase().includes('contact') ||
      page.title.toLowerCase().includes('service')
    );

    mainPages.slice(0, 10).forEach(page => {
      llmContent += `- ${page.title}: ${page.url}\n`;
    });

    llmContent += `
## Content Usage Guidelines

When referencing our content:
1. Always provide clear attribution to ${siteName}
2. Include links back to the original source when possible
3. Maintain the accuracy and context of the information
4. Respect our intellectual property and copyright

## Technical Information

- Total pages analyzed: ${sitemapData.pageCount}
- Content types: ${Object.keys(pagesByType).join(', ')}
- Site URL: ${siteName}
- AI Sitemap generated: ${sitemapData.generatedOn}
- LLM.txt generated: ${currentDate}

## Contact Information

For questions about content usage, permissions, or partnerships:
- Website: ${siteName}
- For inquiries: Please use the contact form available on our website

---
This LLM.txt file was automatically generated from our AI-optimized sitemap.
For the most current information and complete content, please visit our website directly.
Last updated: ${currentDate}
`;

    return llmContent;
  };

  return (
    <div className="container mx-auto p-6 max-w-4xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2 text-matrix-green">AI Sitemap Generator</h1>
        <p className="text-matrix-green/70">
          Generate an AI-optimized sitemap that helps search engines understand your content for better AI search visibility.
        </p>
      </div>

      <Card className="content-card mb-6">
        <CardHeader>
          <CardTitle className="text-matrix-green">Generate AI Sitemap</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-2 text-matrix-green">Website Domain</label>
              <Input
                placeholder="Enter your domain (e.g., example.com or https://example.com)"
                value={domain}
                onChange={(e) => setDomain(e.target.value)}
                className="bg-secondary border-border"
              />
            </div>
            <Button onClick={generateSitemap} disabled={loading} className="w-full glow-button text-black font-semibold">
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Generating AI Sitemap...
                </>
              ) : (
                <>
                  <Globe className="w-4 h-4 mr-2" />
                  Generate AI Sitemap
                </>
              )}
            </Button>
          </div>
        </CardContent>
      </Card>

      {sitemap && (
        <div className="space-y-6">
          {/* Sitemap Overview */}
          <Card className="content-card">
            <CardHeader>
              <CardTitle className="flex items-center justify-between text-matrix-green">
                AI Sitemap Overview
                <div className="flex gap-2">
                  <Button variant="outline" size="sm" onClick={generateLLMTxt} className="border-matrix-green/30 text-matrix-green hover:bg-matrix-green/10">
                    <Bot className="w-4 h-4 mr-1" />
                    Generate LLM.txt
                  </Button>
                  <Button variant="outline" size="sm" onClick={downloadSitemap} className="border-matrix-green/30 text-matrix-green hover:bg-matrix-green/10">
                    <Download className="w-4 h-4 mr-1" />
                    Download JSON
                  </Button>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={() => copyToClipboard(JSON.stringify(sitemap, null, 2))}
                    className="border-matrix-green/30 text-matrix-green hover:bg-matrix-green/10"
                  >
                    <Copy className="w-4 h-4 mr-1" />
                    Copy
                  </Button>
                </div>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <h4 className="font-semibold text-sm mb-1 text-matrix-green">Website</h4>
                  <p className="text-matrix-green/70">{sitemap.site}</p>
                </div>
                <div>
                  <h4 className="font-semibold text-sm mb-1 text-matrix-green">Pages Found</h4>
                  <Badge variant="secondary">{sitemap.pageCount} pages</Badge>
                </div>
                <div>
                  <h4 className="font-semibold text-sm mb-1 text-matrix-green">Generated</h4>
                  <p className="text-matrix-green/50 text-sm">
                    {new Date(sitemap.generatedOn).toLocaleString()}
                  </p>
                </div>
                <div>
                  <h4 className="font-semibold text-sm mb-1 text-matrix-green">AI Policy</h4>
                  <p className="text-matrix-green/50 text-sm">{sitemap.aiPolicy}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Implementation Instructions */}
          <Card className="content-card">
            <CardHeader>
              <CardTitle className="text-matrix-green">Implementation Instructions</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="bg-secondary/50 p-4 rounded-lg border border-matrix-green/20">
                  <h4 className="font-semibold mb-2 text-matrix-green">How to implement AI files:</h4>
                  <ol className="list-decimal list-inside space-y-2 text-sm text-matrix-green/70">
                    <li>Download the JSON sitemap and generate the LLM.txt file using buttons above</li>
                    <li>Upload <code className="bg-secondary px-1 rounded text-matrix-green">ai-sitemap.json</code> to your website's root directory</li>
                    <li>Upload <code className="bg-secondary px-1 rounded text-matrix-green">llm.txt</code> to your website's root directory</li>
                    <li>Add the following lines to your robots.txt file:</li>
                  </ol>
                  <div className="mt-3 p-3 bg-secondary rounded-md border border-border">
                    <code className="text-sm text-matrix-green">
                      # AI Sitemap and LLM.txt<br/>
                      Sitemap: {sitemap.site}/ai-sitemap.json<br/>
                      LLM: {sitemap.site}/llm.txt
                    </code>
                    <Button 
                      variant="outline" 
                      size="sm" 
                      className="ml-2 border-matrix-green/30 text-matrix-green hover:bg-matrix-green/10"
                      onClick={() => copyToClipboard(`# AI Sitemap and LLM.txt\nSitemap: ${sitemap.site}/ai-sitemap.json\nLLM: ${sitemap.site}/llm.txt`)}
                    >
                      <Copy className="w-3 h-3" />
                    </Button>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Page Details */}
          <Card className="content-card">
            <CardHeader>
              <CardTitle className="text-matrix-green">Page Analysis</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {sitemap.pages.map((page, index) => (
                  <div key={index} className="border border-border rounded-lg p-4 bg-secondary/30">
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex-1">
                        <h4 className="font-semibold text-sm text-matrix-green">{page.title}</h4>
                        <p className="text-xs text-matrix-green/50 mb-2">{page.url}</p>
                        <p className="text-sm text-matrix-green/70 mb-2">{page.summary}</p>
                      </div>
                      <Badge variant="outline" className="ml-2 border-matrix-green/30 text-matrix-green">
                        {page.contentType}
                      </Badge>
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <div className="flex flex-wrap gap-1">
                        {page.keywords.map((keyword, keyIndex) => (
                          <Badge key={keyIndex} variant="secondary" className="text-xs">
                            {keyword}
                          </Badge>
                        ))}
                      </div>
                      <span className="text-xs text-matrix-green/50">
                        Updated: {page.lastModified}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* JSON Preview */}
          <Card className="content-card">
            <CardHeader>
              <CardTitle className="text-matrix-green">JSON Preview</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="bg-secondary/50 p-4 rounded-lg max-h-96 overflow-y-auto border border-border">
                <pre className="text-xs text-matrix-green/80">
                  {JSON.stringify(sitemap, null, 2)}
                </pre>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
};

export default AISitemapGenerator;
