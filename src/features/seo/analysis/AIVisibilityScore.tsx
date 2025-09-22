import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

const AIVisibilityScore = () => {
  return (
    <div className="p-6">
      <Card>
        <CardHeader>
          <CardTitle>AI Visibility Score</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">
            AI visibility scoring is being updated. Please check back soon.
          </p>
        </CardContent>
      </Card>
    </div>
  );
};

export default AIVisibilityScore;