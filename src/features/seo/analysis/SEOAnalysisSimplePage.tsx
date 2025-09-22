import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Globe, Search, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import Header from "@/components/global/Header";
import Footer from "@/components/global/Footer";
import SEODashboard from "@/features/dashboard/SEODashboard";

const SEOAnalysisSimple = () => {
  const [domain, setDomain] = useState("");
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState<any>(null);

  const analyzeDomain = async () => {
    if (!domain.trim()) {
      toast.error("Please enter a domain to analyze");
      return;
    }

    // Validate domain format
    const domainRegex = /^(?:https?:\/\/)?(?:www\.)?([a-zA-Z0-9-]+\.)+[a-zA-Z]{2,}$/;
    if (!domainRegex.test(domain)) {
      toast.error("Please enter a valid domain (e.g., example.com)");
      return;
    }

    setLoading(true);
    setResults(null);

    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        toast.error('Please sign in to analyze SEO');
        return;
      }

      console.log('Starting SEO analysis for:', domain);
      
      const { data, error } = await supabase.functions.invoke('analyze-seo', {
        body: JSON.stringify({
          domain: domain.trim(),
          user_id: user.id
        })
      });
      
      if (error) {
        console.error('SEO analysis error:', error);
        throw error;
      }
      
      console.log('Raw response data:', data);
      setResults(data);
      toast.success("SEO analysis completed!");
      
    } catch (error) {
      console.error('Error analyzing SEO:', error);
      toast.error('Failed to analyze SEO. Please check the URL and try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      analyzeDomain();
    }
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1">
        <div className="container mx-auto px-4 py-8">
          <div className="max-w-4xl mx-auto">
            <div className="text-center mb-8">
              <h1 className="text-3xl font-bold mb-4 text-white">SEO Analysis Tool</h1>
              <p className="text-gray-400 mb-8">
                Comprehensive SEO analysis including technical aspects, meta tags, performance, and backlinks.
              </p>
            </div>

            <Card className="mb-8 bg-gray-900 border-gray-700">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-white">
                  <Globe className="h-5 w-5" />
                  Analyze Website SEO
                </CardTitle>
                <CardDescription className="text-gray-400">
                  Enter a domain to perform comprehensive SEO analysis
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex gap-4">
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
                    onClick={analyzeDomain}
                    disabled={loading || !domain.trim()}
                    className="min-w-[120px] bg-green-600 hover:bg-green-700"
                  >
                    {loading ? (
                      <>
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        Analyzing...
                      </>
                    ) : (
                      <>
                        <Search className="h-4 w-4 mr-2" />
                        Analyze SEO
                      </>
                    )}
                  </Button>
                </div>
              </CardContent>
            </Card>

            {loading && (
              <div className="text-center p-8">
                <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-green-500 mx-auto"></div>
                <p className="mt-4 text-white">Analyzing domain...</p>
              </div>
            )}

            {results && (
              <SEODashboard analysis={results.analysis} />
            )}
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default SEOAnalysisSimple;