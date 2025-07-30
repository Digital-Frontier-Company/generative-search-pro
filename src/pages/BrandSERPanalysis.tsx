import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { TrendingUp, Search, BarChart3 } from 'lucide-react';

const BrandSERPanalysis = () => {
  return (
    <div className="max-w-6xl mx-auto p-6 space-y-6">
      <div className="text-center">
        <h1 className="text-3xl font-bold text-matrix-green mb-2 flex items-center justify-center gap-2">
          <TrendingUp className="w-8 h-8" />
          Brand SERP Analysis
        </h1>
        <p className="text-muted-foreground">
          Analyze your brand's presence in search engine results pages
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Search className="w-5 h-5" />
            Brand Monitoring Dashboard
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-2 mb-2">
                  <BarChart3 className="w-4 h-4 text-matrix-green" />
                  <span className="text-sm font-medium">Brand Visibility</span>
                </div>
                <div className="text-2xl font-bold text-matrix-green">Coming Soon</div>
                <p className="text-xs text-muted-foreground">Track your brand mentions</p>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-2 mb-2">
                  <TrendingUp className="w-4 h-4 text-matrix-green" />
                  <span className="text-sm font-medium">SERP Position</span>
                </div>
                <div className="text-2xl font-bold text-matrix-green">Coming Soon</div>
                <p className="text-xs text-muted-foreground">Monitor ranking changes</p>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-2 mb-2">
                  <Search className="w-4 h-4 text-matrix-green" />
                  <span className="text-sm font-medium">Competitor Analysis</span>
                </div>
                <div className="text-2xl font-bold text-matrix-green">Coming Soon</div>
                <p className="text-xs text-muted-foreground">Compare with competitors</p>
              </CardContent>
            </Card>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default BrandSERPanalysis;