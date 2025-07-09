import React from 'react';
import Markdown from 'markdown-to-jsx';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

interface SEODashboardProps {
  analysis: {
    dashboard_content?: string;
    analysis_data?: any;
    total_score?: number;
    technical_score?: number;
    performance_score?: number;
    backlink_score?: number;
    domain: string;
  };
}

const SEODashboard: React.FC<SEODashboardProps> = ({ analysis }) => {
  if (!analysis.dashboard_content) {
    // Fallback to basic display if no dashboard content
    return (
      <Card className="bg-gray-900 border-gray-700">
        <CardHeader>
          <CardTitle className="text-white flex items-center gap-2">
            📊 SEO Analysis Results for {analysis.domain}
          </CardTitle>
        </CardHeader>
        <CardContent className="text-white space-y-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-green-400">
                {analysis.total_score || 0}
              </div>
              <div className="text-sm text-gray-400">Total Score</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-400">
                {analysis.technical_score || 0}
              </div>
              <div className="text-sm text-gray-400">Technical</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-purple-400">
                {analysis.performance_score || 0}
              </div>
              <div className="text-sm text-gray-400">Performance</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-orange-400">
                {analysis.backlink_score || 0}
              </div>
              <div className="text-sm text-gray-400">Backlinks</div>
            </div>
          </div>
          <div className="bg-gray-800 p-4 rounded">
            <p className="text-gray-300">
              Dashboard generation in progress or unavailable. Raw analysis data available.
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  // Custom markdown components with dark theme styling
  const markdownOptions = {
    overrides: {
      h1: {
        props: {
          className: 'text-3xl font-bold text-white mb-6 border-b border-gray-600 pb-2'
        }
      },
      h2: {
        props: {
          className: 'text-2xl font-semibold text-white mt-8 mb-4 flex items-center gap-2'
        }
      },
      h3: {
        props: {
          className: 'text-xl font-medium text-white mt-6 mb-3'
        }
      },
      table: {
        props: {
          className: 'w-full border-collapse bg-gray-800 rounded-lg overflow-hidden mb-6'
        }
      },
      thead: {
        props: {
          className: 'bg-gray-700'
        }
      },
      th: {
        props: {
          className: 'px-4 py-3 text-left text-sm font-semibold text-gray-200 border-b border-gray-600'
        }
      },
      td: {
        props: {
          className: 'px-4 py-3 text-sm text-gray-300 border-b border-gray-700'
        }
      },
      tr: {
        props: {
          className: 'hover:bg-gray-700/50 transition-colors'
        }
      },
      p: {
        props: {
          className: 'text-gray-300 mb-4 leading-relaxed'
        }
      },
      strong: {
        props: {
          className: 'text-white font-semibold'
        }
      },
      ul: {
        props: {
          className: 'list-disc list-inside text-gray-300 space-y-2 mb-4'
        }
      },
      li: {
        props: {
          className: 'leading-relaxed'
        }
      },
      hr: {
        props: {
          className: 'border-gray-600 my-8'
        }
      },
      em: {
        props: {
          className: 'text-gray-400 text-sm'
        }
      }
    }
  };

  return (
    <div className="bg-gray-900 border border-gray-700 rounded-lg">
      <div className="p-6">
        <div className="markdown-content">
          <Markdown options={markdownOptions}>
            {analysis.dashboard_content}
          </Markdown>
        </div>
      </div>
    </div>
  );
};

export default SEODashboard;