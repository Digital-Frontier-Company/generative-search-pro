import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Loader2, Copy, CheckCircle, AlertCircle } from 'lucide-react';
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

  const analyzeSchema = async () => {
    if (!url) {
      toast.error('Please enter a URL to analyze');
      return;
    }

    try {
      setLoading(true);
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        toast.error('Please sign in to analyze schemas');
        return;
      }

      const { data, error } = await supabase.functions.invoke('analyze-schema-patch', {
        body: JSON.stringify({
          url: url.startsWith('http') ? url : `https://${url}`,
          user_id: user.id
        })
      });

      if (error) throw error;

      if (data.analysis) {
        setAnalysis(data.analysis);
        toast.success('Schema analysis completed!');
      }
    } catch (error) {
      console.error('Schema analysis error:', error);
      toast.error('Failed to analyze schema. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = (content: string) => {
    navigator.clipboard.writeText(content);
    toast.success('Copied to clipboard!');
  };

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-green-600';
    if (score >= 60) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getScoreBadgeVariant = (score: number) => {
    if (score >= 80) return 'default';
    if (score >= 60) return 'secondary';
    return 'destructive';
  };

  return (
    <div className="container mx-auto p-6 max-w-4xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Schema Patch Generator</h1>
        <p className="text-gray-600">
          Analyze your website's structured data and get AI-powered recommendations for better search visibility.
        </p>
      </div>

      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Analyze Website Schema</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex gap-4">
            <Input
              placeholder="Enter website URL (e.g., example.com or https://example.com)"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              className="flex-1"
            />
            <Button onClick={analyzeSchema} disabled={loading}>
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
        </CardContent>
      </Card>

      {analysis && (
        <div className="space-y-6">
          {/* AI Visibility Score */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                AI Visibility Score
                <Badge variant={getScoreBadgeVariant(analysis.aiVisibilityScore)}>
                  {analysis.aiVisibilityScore}/100
                </Badge>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-2 mb-4">
                {analysis.aiVisibilityScore >= 80 ? (
                  <CheckCircle className="w-5 h-5 text-green-600" />
                ) : (
                  <AlertCircle className="w-5 h-5 text-yellow-600" />
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
                  <h4 className="font-semibold mb-2">Missing Schema Types:</h4>
                  <div className="flex flex-wrap gap-2">
                    {analysis.missingSchemas.map((schema, index) => (
                      <Badge key={index} variant="outline">{schema}</Badge>
                    ))}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Existing Schema */}
          {analysis.existingSchema && analysis.existingSchema.totalSchemas > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>Current Schema Markup</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <p className="text-sm text-gray-600">
                    Found {analysis.existingSchema.totalSchemas} existing schema(s)
                  </p>
                  {analysis.existingSchema.jsonLd && analysis.existingSchema.jsonLd.length > 0 && (
                    <div>
                      <h4 className="font-semibold text-sm">JSON-LD Schemas:</h4>
                      <div className="bg-gray-50 p-3 rounded-md max-h-40 overflow-y-auto">
                        <pre className="text-xs">
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
            <Card>
              <CardHeader>
                <CardTitle>Suggested Schema Patches</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {analysis.suggestedPatches.map((patch, index) => (
                    <div key={index} className="border rounded-lg p-4">
                      <div className="flex items-center justify-between mb-2">
                        <h4 className="font-semibold">
                          {patch['@type'] || `Schema Patch ${index + 1}`}
                        </h4>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => copyToClipboard(JSON.stringify(patch, null, 2))}
                        >
                          <Copy className="w-4 h-4 mr-1" />
                          Copy
                        </Button>
                      </div>
                      <div className="bg-gray-50 p-3 rounded-md">
                        <pre className="text-xs overflow-x-auto">
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
            <Card>
              <CardHeader>
                <CardTitle>AI Optimization Recommendations</CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2">
                  {analysis.recommendations.map((rec, index) => (
                    <li key={index} className="flex items-start gap-2">
                      <span className="w-2 h-2 rounded-full bg-blue-500 mt-2 flex-shrink-0"></span>
                      <span className="text-sm">{rec}</span>
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
