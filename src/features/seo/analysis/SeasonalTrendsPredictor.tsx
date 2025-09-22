import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

const SeasonalTrendsPredictor = () => {
  return (
    <div className="p-6">
      <Card>
        <CardHeader>
          <CardTitle>Seasonal Trends Predictor</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">
            Seasonal trends prediction is being updated. Please check back soon.
          </p>
        </CardContent>
      </Card>
    </div>
  );
};

export default SeasonalTrendsPredictor;