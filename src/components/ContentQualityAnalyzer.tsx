
import React, { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';

// Step 1: Define clear types for what we expect to receive
interface ContentQualityResult {
  word_count: number;
  sentence_count: number;
  paragraph_count: number;
  heading_count: number;
  link_count: number;
  quality_score: number;
  reading_time_minutes: number;
}

interface AIFriendlinessResult {
  ai_score: number;
  has_qa_format: boolean;
  has_citations: boolean;
  has_clear_structure: boolean;
  has_bullet_points: boolean;
  avg_paragraph_length: number;
  recommendations: string[];
}

interface KeywordAnalysisResult {
  total_words: number;
  keyword_count: number;
  density_percent: number;
  optimal_count: number;
  first_occurrence: number;
  last_occurrence: number;
  well_distributed: boolean;
}

// Step 2: Define the overall analysis state
interface AnalysisResults {
  contentQuality: ContentQualityResult | null;
  aiFriendliness: AIFriendlinessResult | null;
  keywordAnalysis: KeywordAnalysisResult | null;
  isLoading: boolean;
  error: string | null;
}

const ContentQualityAnalyzer: React.FC = () => {

  // State with proper typing
  const [content, setContent] = useState<string>('');
  const [keyword, setKeyword] = useState<string>('');
  const [results, setResults] = useState<AnalysisResults>({
    contentQuality: null,
    aiFriendliness: null,
    keywordAnalysis: null,
    isLoading: false,
    error: null
  });

  // Step 3: Helper function to safely handle RPC calls
  const safelyCallRPC = async <T,>(
    functionName: 'analyze_content_quality' | 'check_ai_friendliness' | 'analyze_keywords', 
    params: Record<string, unknown>
  ): Promise<T | null> => {
    try {
      const { data, error } = await supabase.rpc(functionName as any, params);
      
      if (error) {
        console.error(`Error calling ${functionName}:`, error);
        throw new Error(error.message);
      }
      
      // This is the key: we explicitly cast the result to our expected type
      return data as T;
    } catch (err) {
      console.error(`Failed to call ${functionName}:`, err);
      throw err;
    }
  };

  const analyzeContent = async () => {
    if (!content.trim()) {
      setResults(prev => ({ ...prev, error: 'Please enter some content to analyze' }));
      return;
    }

    setResults(prev => ({ ...prev, isLoading: true, error: null }));

    try {
      // Step 4: Call each RPC function with proper typing
      const [contentQualityData, aiFriendlinessData, keywordData] = await Promise.all([
        safelyCallRPC<ContentQualityResult>('analyze_content_quality', { 
          content_text: content 
        }),
        safelyCallRPC<AIFriendlinessResult>('check_ai_friendliness', { 
          content_text: content 
        }),
        keyword.trim() 
          ? safelyCallRPC<KeywordAnalysisResult>('analyze_keywords', { 
              content_text: content,
              target_keyword: keyword 
            })
          : null
      ]);

      // Update state with results
      setResults({
        contentQuality: contentQualityData,
        aiFriendliness: aiFriendlinessData,
        keywordAnalysis: keywordData,
        isLoading: false,
        error: null
      });

    } catch (error) {
      console.error('Analysis failed:', error);
      setResults(prev => ({
        ...prev,
        isLoading: false,
        error: error instanceof Error ? error.message : 'Analysis failed'
      }));
    }
  };

  // Helper function to get quality score color
  const getScoreColor = (score: number): string => {
    if (score >= 80) return 'text-green-600';
    if (score >= 60) return 'text-yellow-600';
    return 'text-red-600';
  };

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      <div className="bg-white rounded-lg shadow-lg p-6">
        <h2 className="text-2xl font-bold mb-6 text-gray-800">
          Content Quality Analyzer
        </h2>
        
        {/* Input Section */}
        <div className="space-y-4 mb-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Content to Analyze
            </label>
            <textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="Paste your content here..."
              className="w-full h-32 p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Target Keyword (Optional)
            </label>
            <input
              type="text"
              value={keyword}
              onChange={(e) => setKeyword(e.target.value)}
              placeholder="Enter keyword for density analysis..."
              className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          
          <button
            onClick={analyzeContent}
            disabled={results.isLoading || !content.trim()}
            className="w-full bg-blue-600 text-white py-3 px-4 rounded-md hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
          >
            {results.isLoading ? 'Analyzing...' : 'Analyze Content'}
          </button>
        </div>

        {/* Error Display */}
        {results.error && (
          <div className="bg-red-50 border border-red-200 rounded-md p-4 mb-6">
            <p className="text-red-800">{results.error}</p>
          </div>
        )}

        {/* Results Section */}
        {(results.contentQuality || results.aiFriendliness || results.keywordAnalysis) && (
          <div className="space-y-6">
            {/* Content Quality Results */}
            {results.contentQuality && (
              <div className="bg-gray-50 rounded-lg p-6">
                <h3 className="text-xl font-semibold mb-4 text-gray-800">
                  Content Quality Analysis
                </h3>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  <div className="bg-white p-4 rounded-md">
                    <p className="text-sm text-gray-600">Word Count</p>
                    <p className="text-2xl font-bold text-blue-600">
                      {results.contentQuality.word_count}
                    </p>
                  </div>
                  <div className="bg-white p-4 rounded-md">
                    <p className="text-sm text-gray-600">Quality Score</p>
                    <p className={`text-2xl font-bold ${getScoreColor(results.contentQuality.quality_score)}`}>
                      {results.contentQuality.quality_score}/100
                    </p>
                  </div>
                  <div className="bg-white p-4 rounded-md">
                    <p className="text-sm text-gray-600">Reading Time</p>
                    <p className="text-2xl font-bold text-gray-700">
                      {results.contentQuality.reading_time_minutes} min
                    </p>
                  </div>
                  <div className="bg-white p-4 rounded-md">
                    <p className="text-sm text-gray-600">Sentences</p>
                    <p className="text-2xl font-bold text-gray-700">
                      {results.contentQuality.sentence_count}
                    </p>
                  </div>
                  <div className="bg-white p-4 rounded-md">
                    <p className="text-sm text-gray-600">Paragraphs</p>
                    <p className="text-2xl font-bold text-gray-700">
                      {results.contentQuality.paragraph_count}
                    </p>
                  </div>
                  <div className="bg-white p-4 rounded-md">
                    <p className="text-sm text-gray-600">Headings</p>
                    <p className="text-2xl font-bold text-gray-700">
                      {results.contentQuality.heading_count}
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* AI Friendliness Results */}
            {results.aiFriendliness && (
              <div className="bg-gray-50 rounded-lg p-6">
                <h3 className="text-xl font-semibold mb-4 text-gray-800">
                  AI-Friendliness Analysis
                </h3>
                <div className="mb-4">
                  <p className="text-sm text-gray-600 mb-2">AI Score</p>
                  <p className={`text-3xl font-bold ${getScoreColor(results.aiFriendliness.ai_score)}`}>
                    {results.aiFriendliness.ai_score}/100
                  </p>
                </div>
                
                <div className="grid grid-cols-2 gap-4 mb-4">
                  <div className="flex items-center space-x-2">
                    <span className={`w-3 h-3 rounded-full ${results.aiFriendliness.has_qa_format ? 'bg-green-500' : 'bg-red-500'}`}></span>
                    <span className="text-sm">Q&A Format</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <span className={`w-3 h-3 rounded-full ${results.aiFriendliness.has_citations ? 'bg-green-500' : 'bg-red-500'}`}></span>
                    <span className="text-sm">Citations</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <span className={`w-3 h-3 rounded-full ${results.aiFriendliness.has_clear_structure ? 'bg-green-500' : 'bg-red-500'}`}></span>
                    <span className="text-sm">Clear Structure</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <span className={`w-3 h-3 rounded-full ${results.aiFriendliness.has_bullet_points ? 'bg-green-500' : 'bg-red-500'}`}></span>
                    <span className="text-sm">Bullet Points</span>
                  </div>
                </div>

                {results.aiFriendliness.recommendations.length > 0 && (
                  <div>
                    <p className="text-sm font-medium text-gray-700 mb-2">Recommendations:</p>
                    <ul className="list-disc list-inside space-y-1">
                      {results.aiFriendliness.recommendations.map((rec, index) => (
                        <li key={index} className="text-sm text-gray-600">{rec}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            )}

            {/* Keyword Analysis Results */}
            {results.keywordAnalysis && keyword && (
              <div className="bg-gray-50 rounded-lg p-6">
                <h3 className="text-xl font-semibold mb-4 text-gray-800">
                  Keyword Analysis: "{keyword}"
                </h3>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  <div className="bg-white p-4 rounded-md">
                    <p className="text-sm text-gray-600">Density</p>
                    <p className="text-2xl font-bold text-blue-600">
                      {results.keywordAnalysis.density_percent}%
                    </p>
                  </div>
                  <div className="bg-white p-4 rounded-md">
                    <p className="text-sm text-gray-600">Count</p>
                    <p className="text-2xl font-bold text-gray-700">
                      {results.keywordAnalysis.keyword_count}
                    </p>
                  </div>
                  <div className="bg-white p-4 rounded-md">
                    <p className="text-sm text-gray-600">Optimal Count</p>
                    <p className="text-2xl font-bold text-gray-700">
                      {results.keywordAnalysis.optimal_count}
                    </p>
                  </div>
                  <div className="bg-white p-4 rounded-md col-span-2 md:col-span-3">
                    <p className="text-sm text-gray-600 mb-2">Distribution</p>
                    <p className={`font-medium ${results.keywordAnalysis.well_distributed ? 'text-green-600' : 'text-yellow-600'}`}>
                      {results.keywordAnalysis.well_distributed ? 'Well Distributed' : 'Could Be Better Distributed'}
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default ContentQualityAnalyzer;
