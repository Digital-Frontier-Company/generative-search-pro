
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
        <h1 className="text-3xl font-bold mb-2">AI Sitemap Generator</h1>
        <p className="text-gray-600">
          Generate an AI-optimized sitemap that helps search engines understand your content for better AI search visibility.
        </p>
      </div>

      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Generate AI Sitemap</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-2">Website Domain</label>
              <Input
                placeholder="Enter your domain (e.g., example.com or https://example.com)"
                value={domain}
                onChange={(e) => setDomain(e.target.value)}
              />
            </div>
            <Button onClick={generateSitemap} disabled={loading} className="w-full">
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
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                AI Sitemap Overview
                <div className="flex gap-2">
                  <Button variant="outline" size="sm" onClick={downloadSitemap}>
                    <Download className="w-4 h-4 mr-1" />
                    Download JSON
                  </Button>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={() => copyToClipboard(JSON.stringify(sitemap, null, 2))}
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
                  <h4 className="font-semibold text-sm mb-1">Website</h4>
                  <p className="text-gray-700">{sitemap.site}</p>
                </div>
                <div>
                  <h4 className="font-semibold text-sm mb-1">Pages Found</h4>
                  <Badge variant="secondary">{sitemap.pageCount} pages</Badge>
                </div>
                <div>
                  <h4 className="font-semibold text-sm mb-1">Generated</h4>
                  <p className="text-gray-500 text-sm">
                    {new Date(sitemap.generatedOn).toLocaleString()}
                  </p>
                </div>
                <div>
                  <h4 className="font-semibold text-sm mb-1">AI Policy</h4>
                  <p className="text-gray-500 text-sm">{sitemap.aiPolicy}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Implementation Instructions */}
          <Card>
            <CardHeader>
              <CardTitle>Implementation Instructions</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="bg-blue-50 p-4 rounded-lg">
                  <h4 className="font-semibold mb-2">How to implement this AI sitemap:</h4>
                  <ol className="list-decimal list-inside space-y-2 text-sm">
                    <li>Download the JSON file using the button above</li>
                    <li>Upload it to your website's root directory as <code className="bg-gray-200 px-1 rounded">ai-sitemap.json</code></li>
                    <li>Add the following line to your robots.txt file:</li>
                  </ol>
                  <div className="mt-3 p-3 bg-gray-100 rounded-md">
                    <code className="text-sm">
                      # AI Sitemap<br/>
                      Sitemap: {sitemap.site}/ai-sitemap.json
                    </code>
                    <Button 
                      variant="outline" 
                      size="sm" 
                      className="ml-2"
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
          <Card>
            <CardHeader>
              <CardTitle>Page Analysis</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {sitemap.pages.map((page, index) => (
                  <div key={index} className="border rounded-lg p-4">
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex-1">
                        <h4 className="font-semibold text-sm">{page.title}</h4>
                        <p className="text-xs text-gray-500 mb-2">{page.url}</p>
                        <p className="text-sm text-gray-700 mb-2">{page.summary}</p>
                      </div>
                      <Badge variant="outline" className="ml-2">
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
                      <span className="text-xs text-gray-500">
                        Updated: {page.lastModified}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* JSON Preview */}
          <Card>
            <CardHeader>
              <CardTitle>JSON Preview</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="bg-gray-50 p-4 rounded-lg max-h-96 overflow-y-auto">
                <pre className="text-xs">
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
