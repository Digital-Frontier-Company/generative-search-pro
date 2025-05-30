
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
    }>;
  } | null;
}

const SEOResults = ({ results }: SEOResultsProps) => {
  if (!results) return null;
  
  return (
    <div className="p-4 bg-gray-50 rounded">
      <h2 className="text-2xl font-bold mb-4">SEO Analysis Results</h2>
      
      {/* Score Display */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-white p-4 rounded shadow">
          <h3 className="font-semibold">Total Score</h3>
          <div className={`text-3xl font-bold ${
            results.scores.total > 80 ? 'text-green-500' : 
            results.scores.total > 60 ? 'text-yellow-500' : 'text-red-500'
          }`}>
            {results.scores.total}/100
          </div>
        </div>
        
        <div className="bg-white p-4 rounded shadow">
          <h3 className="font-semibold">Technical SEO</h3>
          <div className="text-2xl font-bold">{results.scores.technical}/40</div>
        </div>
        
        <div className="bg-white p-4 rounded shadow">
          <h3 className="font-semibold">Page Speed</h3>
          <div className="text-2xl font-bold">{results.scores.speed}/30</div>
        </div>
        
        <div className="bg-white p-4 rounded shadow">
          <h3 className="font-semibold">Backlinks</h3>
          <div className="text-2xl font-bold">{results.scores.backlinks}/30</div>
        </div>
      </div>
      
      {/* Detailed Findings */}
      <div className="bg-white p-4 rounded shadow">
        <h3 className="text-xl font-semibold mb-3">Detailed Findings</h3>
        {results.findings.map((finding, index) => (
          <div key={index} className={`p-2 mb-2 rounded ${
            finding.status === 'good' ? 'bg-green-100' :
            finding.status === 'warning' ? 'bg-yellow-100' : 'bg-red-100'
          }`}>
            <span className="font-medium">{finding.type}:</span> {finding.message}
          </div>
        ))}
      </div>
    </div>
  );
};

export default SEOResults;
