
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Loader2, Download, Copy, Globe } from 'lucide-react';
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

      if (error) throw error;

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
    if (!sitemap) return;

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
                  <h4 className="font-semibold mb-2 text-matrix-green">How to implement this AI sitemap:</h4>
                  <ol className="list-decimal list-inside space-y-2 text-sm text-matrix-green/70">
                    <li>Download the JSON file using the button above</li>
                    <li>Upload it to your website's root directory as <code className="bg-secondary px-1 rounded text-matrix-green">ai-sitemap.json</code></li>
                    <li>Add the following line to your robots.txt file:</li>
                  </ol>
                  <div className="mt-3 p-3 bg-secondary rounded-md border border-border">
                    <code className="text-sm text-matrix-green">
                      # AI Sitemap<br/>
                      Sitemap: {sitemap.site}/ai-sitemap.json
                    </code>
                    <Button 
                      variant="outline" 
                      size="sm" 
                      className="ml-2 border-matrix-green/30 text-matrix-green hover:bg-matrix-green/10"
                      onClick={() => copyToClipboard(`# AI Sitemap\nSitemap: ${sitemap.site}/ai-sitemap.json`)}
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
