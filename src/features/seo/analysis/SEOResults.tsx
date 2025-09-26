
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CheckCircle, AlertCircle, XCircle } from "lucide-react";

interface SEOResultsProps {
  results: {
    scores: {
      total: number;
      technical: number;
      speed: number;
      backlinks: number;
    };
    findings: Array<{
      type: string;
      status: string;
      message: string;
      url?: string;
    }>;
  } | null;
}

const SEOResults = ({ results }: SEOResultsProps) => {
  console.log('SEOResults received:', results);
  
  if (!results) {
    return null;
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'good':
        return <CheckCircle className="h-5 w-5 text-green-500" />;
      case 'warning':
        return <AlertCircle className="h-5 w-5 text-yellow-500" />;
      case 'error':
        return <XCircle className="h-5 w-5 text-red-500" />;
      default:
        return <AlertCircle className="h-5 w-5 text-gray-500" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'good':
        return 'bg-green-900/20 border-green-500/20';
      case 'warning':
        return 'bg-yellow-900/20 border-yellow-500/20';
      case 'error':
        return 'bg-red-900/20 border-red-500/20';
      default:
        return 'bg-gray-900/20 border-gray-500/20';
    }
  };

  const getScoreColor = (score: number) => {
    if (score > 80) return 'text-green-500';
    if (score > 60) return 'text-yellow-500';
    return 'text-red-500';
  };
  
  return (
    <div className="space-y-6">
      <Card className="bg-gray-900 border-gray-700">
        <CardHeader>
          <CardTitle className="text-white">SEO Analysis Results</CardTitle>
        </CardHeader>
        <CardContent>
          {/* Score Display */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
            <div className="bg-gray-800 p-6 rounded-lg border border-gray-600">
              <h3 className="font-semibold text-gray-300 mb-2">Total Score</h3>
              <div className={`text-3xl font-bold ${getScoreColor(results.scores.total)}`}>
                {results.scores.total}/100
              </div>
            </div>
            
            <div className="bg-gray-800 p-6 rounded-lg border border-gray-600">
              <h3 className="font-semibold text-gray-300 mb-2">Technical SEO</h3>
              <div className="text-2xl font-bold text-white">{results.scores.technical}/40</div>
            </div>
            
            <div className="bg-gray-800 p-6 rounded-lg border border-gray-600">
              <h3 className="font-semibold text-gray-300 mb-2">Page Speed</h3>
              <div className="text-2xl font-bold text-white">{results.scores.speed}/30</div>
            </div>
            
            <div className="bg-gray-800 p-6 rounded-lg border border-gray-600">
              <h3 className="font-semibold text-gray-300 mb-2">Backlinks</h3>
              <div className="text-2xl font-bold text-white">{results.scores.backlinks}/30</div>
            </div>
          </div>
          
          {/* Detailed Findings */}
          <div className="bg-gray-800 p-6 rounded-lg border border-gray-600">
            <h3 className="text-xl font-semibold mb-4 text-white">Detailed Findings</h3>
            {results.findings && results.findings.length > 0 ? (
              <div className="space-y-3">
                {results.findings.map((finding, index) => (
                  <div 
                    key={index} 
                    className={`p-4 rounded-lg border ${getStatusColor(finding.status)}`}
                  >
                    <div className="flex items-start gap-3">
                      {getStatusIcon(finding.status)}
                      <div className="flex-1">
                        <span className="font-medium text-white capitalize">
                          {finding.type ? finding.type.replace(/_/g, ' ') : 'Unknown'}:
                        </span>
                        <span className="ml-2 text-gray-300">{finding.message}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center text-gray-400 py-8">
                <p>No detailed findings available</p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default SEOResults;
