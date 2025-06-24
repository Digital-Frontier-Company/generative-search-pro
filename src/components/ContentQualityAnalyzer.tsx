
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { CheckCircle, XCircle, AlertCircle, FileText, Clock, BarChart3, Target, Zap } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface ContentAnalysis {
  word_count: number;
  sentence_count: number;
  paragraph_count: number;
  heading_count: number;
  link_count: number;
  quality_score: number;
  reading_time_minutes: number;
  ai_score: number;
  has_qa_format: boolean;
  has_citations: boolean;
  has_clear_structure: boolean;
  has_bullet_points: boolean;
  avg_paragraph_length: number;
  recommendations: string[];
  keyword_analysis?: {
    density_percent: number;
    keyword_count: number;
    optimal_count: number;
    well_distributed: boolean;
  };
}

const ContentQualityAnalyzer = () => {
  const [content, setContent] = useState("");
  const [targetKeyword, setTargetKeyword] = useState("");
  const [analysis, setAnalysis] = useState<ContentAnalysis | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  const analyzeContent = async () => {
    if (!content.trim()) {
      toast.error("Please enter some content to analyze");
      return;
    }

    setIsAnalyzing(true);
    
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        toast.error('Please sign in to analyze content');
        return;
      }

      // Call our enhanced content analysis function using raw SQL
      const { data: qualityData, error: qualityError } = await supabase
        .rpc('analyze_content_quality' as any, {
          content_text: content
        });

      if (qualityError) throw qualityError;

      // Call AI-friendliness checker using raw SQL
      const { data: aiData, error: aiError } = await supabase
        .rpc('check_ai_friendliness' as any, {
          content_text: content
        });

      if (aiError) throw aiError;

      // Analyze keywords if provided
      let keywordData = null;
      if (targetKeyword.trim()) {
        const { data: kwData, error: kwError } = await supabase
          .rpc('analyze_keywords' as any, {
            content_text: content,
            target_keyword: targetKeyword.trim()
          });
        
        if (kwError) throw kwError;
        keywordData = kwData;
      }

      // Combine all analysis results
      const combinedAnalysis: ContentAnalysis = {
        ...(qualityData as any),
        ...(aiData as any),
        keyword_analysis: keywordData as any
      };

      setAnalysis(combinedAnalysis);
      toast.success("Content analysis completed!");

    } catch (error) {
      console.error('Analysis error:', error);
      toast.error('Analysis failed. Please try again.');
    } finally {
      setIsAnalyzing(false);
    }
  };

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-green-600';
    if (score >= 60) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getScoreLabel = (score: number) => {
    if (score >= 80) return 'Excellent';
    if (score >= 60) return 'Good';
    return 'Needs Work';
  };

  return (
    <div className="space-y-6">
      <Card className="bg-gray-900 border-gray-700">
        <CardHeader>
          <CardTitle className="text-white flex items-center gap-2">
            <FileText className="h-5 w-5" />
            Advanced Content Quality Analyzer
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Content to Analyze
            </label>
            <Textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="Paste your article, blog post, or content here..."
              className="min-h-[200px] bg-gray-800 border-gray-600 text-white"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Target Keyword (Optional)
            </label>
            <input
              type="text"
              value={targetKeyword}
              onChange={(e) => setTargetKeyword(e.target.value)}
              placeholder="Enter target keyword for density analysis"
              className="w-full px-3 py-2 bg-gray-800 border border-gray-600 rounded-md text-white"
            />
          </div>

          <Button 
            onClick={analyzeContent}
            disabled={!content.trim() || isAnalyzing}
            className="w-full bg-green-600 hover:bg-green-700"
          >
            {isAnalyzing ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent mr-2"></div>
                Analyzing Content...
              </>
            ) : (
              <>
                <BarChart3 className="h-4 w-4 mr-2" />
                Analyze Content Quality
              </>
            )}
          </Button>
        </CardContent>
      </Card>

      {analysis && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Quality Score */}
          <Card className="bg-gray-900 border-gray-700">
            <CardHeader>
              <CardTitle className="text-white">Quality Score</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-center">
                <div className={`text-4xl font-bold ${getScoreColor(analysis.quality_score)}`}>
                  {analysis.quality_score}/100
                </div>
                <div className={`text-lg ${getScoreColor(analysis.quality_score)}`}>
                  {getScoreLabel(analysis.quality_score)}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* AI-Friendliness Score */}
          <Card className="bg-gray-900 border-gray-700">
            <CardHeader>
              <CardTitle className="text-white flex items-center gap-2">
                <Zap className="h-5 w-5" />
                AI-Friendliness Score
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-center">
                <div className={`text-4xl font-bold ${getScoreColor(analysis.ai_score)}`}>
                  {analysis.ai_score}/100
                </div>
                <div className={`text-lg ${getScoreColor(analysis.ai_score)}`}>
                  {getScoreLabel(analysis.ai_score)}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Content Statistics */}
          <Card className="bg-gray-900 border-gray-700">
            <CardHeader>
              <CardTitle className="text-white">Content Statistics</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div className="text-gray-300">
                  <span className="font-medium">Words:</span> {analysis.word_count}
                </div>
                <div className="text-gray-300">
                  <span className="font-medium">Sentences:</span> {analysis.sentence_count}
                </div>
                <div className="text-gray-300">
                  <span className="font-medium">Paragraphs:</span> {analysis.paragraph_count}
                </div>
                <div className="text-gray-300">
                  <span className="font-medium">Headings:</span> {analysis.heading_count}
                </div>
                <div className="text-gray-300 flex items-center gap-1">
                  <Clock className="w-3 h-3" />
                  <span>Reading time: {analysis.reading_time_minutes} min</span>
                </div>
                <div className="text-gray-300">
                  <span className="font-medium">Links:</span> {analysis.link_count}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* AI Optimization Checklist */}
          <Card className="bg-gray-900 border-gray-700">
            <CardHeader>
              <CardTitle className="text-white">AI Optimization Checklist</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  {analysis.has_qa_format ? (
                    <CheckCircle className="w-4 h-4 text-green-500" />
                  ) : (
                    <XCircle className="w-4 h-4 text-red-500" />
                  )}
                  <span className="text-gray-300">Q&A Format Present</span>
                </div>
                <div className="flex items-center gap-2">
                  {analysis.has_citations ? (
                    <CheckCircle className="w-4 h-4 text-green-500" />
                  ) : (
                    <XCircle className="w-4 h-4 text-red-500" />
                  )}
                  <span className="text-gray-300">Citations Included</span>
                </div>
                <div className="flex items-center gap-2">
                  {analysis.has_clear_structure ? (
                    <CheckCircle className="w-4 h-4 text-green-500" />
                  ) : (
                    <XCircle className="w-4 h-4 text-red-500" />
                  )}
                  <span className="text-gray-300">Clear Structure</span>
                </div>
                <div className="flex items-center gap-2">
                  {analysis.has_bullet_points ? (
                    <CheckCircle className="w-4 h-4 text-green-500" />
                  ) : (
                    <XCircle className="w-4 h-4 text-red-500" />
                  )}
                  <span className="text-gray-300">Bullet Points/Lists</span>
                </div>
                <div className="flex items-center gap-2">
                  {analysis.avg_paragraph_length < 500 ? (
                    <CheckCircle className="w-4 h-4 text-green-500" />
                  ) : (
                    <XCircle className="w-4 h-4 text-red-500" />
                  )}
                  <span className="text-gray-300">Optimal Paragraph Length</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Keyword Analysis */}
          {analysis.keyword_analysis && (
            <Card className="bg-gray-900 border-gray-700 lg:col-span-2">
              <CardHeader>
                <CardTitle className="text-white flex items-center gap-2">
                  <Target className="h-5 w-5" />
                  Keyword Analysis: "{targetKeyword}"
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-green-500">
                      {analysis.keyword_analysis.keyword_count}
                    </div>
                    <div className="text-sm text-gray-400">Occurrences</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-blue-500">
                      {analysis.keyword_analysis.density_percent}%
                    </div>
                    <div className="text-sm text-gray-400">Density</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-yellow-500">
                      {analysis.keyword_analysis.optimal_count}
                    </div>
                    <div className="text-sm text-gray-400">Optimal Count</div>
                  </div>
                  <div className="text-center">
                    <div className={`text-2xl font-bold ${analysis.keyword_analysis.well_distributed ? 'text-green-500' : 'text-red-500'}`}>
                      {analysis.keyword_analysis.well_distributed ? 'Yes' : 'No'}
                    </div>
                    <div className="text-sm text-gray-400">Well Distributed</div>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Recommendations */}
          <Card className="bg-gray-900 border-gray-700 lg:col-span-2">
            <CardHeader>
              <CardTitle className="text-white flex items-center gap-2">
                <AlertCircle className="h-5 w-5" />
                Recommendations
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2">
                {analysis.recommendations.map((rec, index) => (
                  <li key={index} className="text-gray-300 flex items-start gap-2">
                    <span className="text-yellow-500 mt-1">•</span>
                    {rec}
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
};

export default ContentQualityAnalyzer;
