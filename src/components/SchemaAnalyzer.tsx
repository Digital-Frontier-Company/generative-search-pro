
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Loader2, Copy, CheckCircle, AlertCircle, ExternalLink } from 'lucide-react';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';

interface SchemaAnalysis {
  aiVisibilityScore: number;
  missingSchemas: string[];
  suggestedPatches: any[];
  recommendations: string[];
  existingSchema: any;
  url: string;
}

const SchemaAnalyzer = () => {
  const [url, setUrl] = useState('');
  const [loading, setLoading] = useState(false);
  const [analysis, setAnalysis] = useState<SchemaAnalysis | null>(null);
  const [error, setError] = useState<string | null>(null);

  const analyzeSchema = async () => {
    if (!url.trim()) {
      toast.error('Please enter a URL to analyze');
      return;
    }

    try {
      setLoading(true);
      setError(null);
      setAnalysis(null);

      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        toast.error('Please sign in to analyze schemas');
        return;
      }

      // Validate and format URL
      let formattedUrl = url.trim();
      if (!formattedUrl.startsWith('http://') && !formattedUrl.startsWith('https://')) {
        formattedUrl = `https://${formattedUrl}`;
      }

      console.log('Invoking schema analysis for:', formattedUrl);

      const { data, error: functionError } = await supabase.functions.invoke('analyze-schema-patch', {
        body: JSON.stringify({
          url: formattedUrl,
          user_id: user.id
        })
      });

      console.log('Function response:', data);

      if (functionError) {
        console.error('Function error:', functionError);
        throw new Error(functionError.message || 'Failed to analyze schema');
      }

      if (data?.error) {
        throw new Error(data.error);
      }

      if (data?.analysis) {
        setAnalysis(data.analysis);
        toast.success('Schema analysis completed successfully!');
      } else {
        throw new Error('No analysis data received');
      }
    } catch (error) {
      console.error('Schema analysis error:', error);
      const errorMessage = error instanceof Error ? error.message : 'Failed to analyze schema. Please try again.';
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = (content: string) => {
    navigator.clipboard.writeText(content);
    toast.success('Copied to clipboard!');
  };

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-green-400';
    if (score >= 60) return 'text-yellow-400';
    return 'text-red-400';
  };

  const getScoreBadgeVariant = (score: number) => {
    if (score >= 80) return 'default';
    if (score >= 60) return 'secondary';
    return 'destructive';
  };

  return (
    <div className="container mx-auto p-6 max-w-4xl bg-black min-h-screen">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2 text-matrix-green">Schema Patch Generator</h1>
        <p className="text-matrix-green/70">
          Analyze your website's structured data and get AI-powered recommendations for better search visibility.
        </p>
      </div>

      <Card className="mb-6 bg-matrix-dark-gray border-matrix-green/30">
        <CardHeader>
          <CardTitle className="text-matrix-green">Analyze Website Schema</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex gap-4">
            <Input
              placeholder="Enter website URL (e.g., example.com or https://example.com)"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              className="flex-1 bg-black border-matrix-green/30 text-matrix-green placeholder:text-matrix-green/50"
              onKeyPress={(e) => e.key === 'Enter' && !loading && analyzeSchema()}
            />
            <Button 
              onClick={analyzeSchema} 
              disabled={loading}
              className="glow-button text-black font-semibold"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Analyzing...
                </>
              ) : (
                'Analyze Schema'
              )}
            </Button>
          </div>
          
          {error && (
            <div className="mt-4 p-3 bg-red-900/30 border border-red-500/50 rounded-md">
              <div className="flex items-center gap-2">
                <AlertCircle className="w-4 h-4 text-red-400" />
                <span className="text-red-400 text-sm">{error}</span>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {analysis && (
        <div className="space-y-6">
          {/* AI Visibility Score */}
          <Card className="bg-matrix-dark-gray border-matrix-green/30">
            <CardHeader>
              <CardTitle className="flex items-center justify-between text-matrix-green">
                AI Visibility Score
                <Badge variant={getScoreBadgeVariant(analysis.aiVisibilityScore)} className="text-black">
                  {analysis.aiVisibilityScore}/100
                </Badge>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-2 mb-4">
                {analysis.aiVisibilityScore >= 80 ? (
                  <CheckCircle className="w-5 h-5 text-green-400" />
                ) : (
                  <AlertCircle className="w-5 h-5 text-yellow-400" />
                )}
                <span className={`font-semibold ${getScoreColor(analysis.aiVisibilityScore)}`}>
                  {analysis.aiVisibilityScore >= 80 
                    ? 'Excellent AI search optimization!' 
                    : analysis.aiVisibilityScore >= 60 
                    ? 'Good foundation, room for improvement' 
                    : 'Needs significant optimization for AI search'
                  }
                </span>
              </div>
              
              {analysis.missingSchemas && analysis.missingSchemas.length > 0 && (
                <div className="mb-4">
                  <h4 className="font-semibold mb-2 text-matrix-green">Missing Schema Types:</h4>
                  <div className="flex flex-wrap gap-2">
                    {analysis.missingSchemas.map((schema, index) => (
                      <Badge key={index} variant="outline" className="border-matrix-green/50 text-matrix-green">
                        {schema}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Existing Schema */}
          {analysis.existingSchema && analysis.existingSchema.totalSchemas > 0 && (
            <Card className="bg-matrix-dark-gray border-matrix-green/30">
              <CardHeader>
                <CardTitle className="text-matrix-green">Current Schema Markup</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <p className="text-sm text-matrix-green/70">
                    Found {analysis.existingSchema.totalSchemas} existing schema(s)
                  </p>
                  {analysis.existingSchema.jsonLd && analysis.existingSchema.jsonLd.length > 0 && (
                    <div>
                      <h4 className="font-semibold text-sm text-matrix-green">JSON-LD Schemas:</h4>
                      <div className="bg-black p-3 rounded-md max-h-40 overflow-y-auto border border-matrix-green/30">
                        <pre className="text-xs text-matrix-green/80">
                          {JSON.stringify(analysis.existingSchema.jsonLd, null, 2)}
                        </pre>
                      </div>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Suggested Patches */}
          {analysis.suggestedPatches && analysis.suggestedPatches.length > 0 && (
            <Card className="bg-matrix-dark-gray border-matrix-green/30">
              <CardHeader>
                <CardTitle className="text-matrix-green">Suggested Schema Patches</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {analysis.suggestedPatches.map((patch, index) => (
                    <div key={index} className="border border-matrix-green/30 rounded-lg p-4 bg-black/50">
                      <div className="flex items-center justify-between mb-2">
                        <h4 className="font-semibold text-matrix-green">
                          {patch['@type'] || `Schema Patch ${index + 1}`}
                        </h4>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => copyToClipboard(JSON.stringify(patch, null, 2))}
                          className="border-matrix-green/50 text-matrix-green hover:bg-matrix-green/10"
                        >
                          <Copy className="w-4 h-4 mr-1" />
                          Copy
                        </Button>
                      </div>
                      <div className="bg-black p-3 rounded-md border border-matrix-green/30">
                        <pre className="text-xs overflow-x-auto text-matrix-green/80">
                          {JSON.stringify(patch, null, 2)}
                        </pre>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Recommendations */}
          {analysis.recommendations && analysis.recommendations.length > 0 && (
            <Card className="bg-matrix-dark-gray border-matrix-green/30">
              <CardHeader>
                <CardTitle className="text-matrix-green">AI Optimization Recommendations</CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2">
                  {analysis.recommendations.map((rec, index) => (
                    <li key={index} className="flex items-start gap-2">
                      <span className="w-2 h-2 rounded-full bg-matrix-green mt-2 flex-shrink-0"></span>
                      <span className="text-sm text-matrix-green/80">{rec}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          )}
        </div>
      )}
    </div>
  );
};

export default SchemaAnalyzer;
