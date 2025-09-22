import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

const OpportunityScanner = () => {
  return (
    <div className="p-6">
      <Card>
        <CardHeader>
          <CardTitle>Opportunity Scanner</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">
            Opportunity scanning is being updated. Please check back soon.
          </p>
        </CardContent>
      </Card>
    </div>
  );
};

export default OpportunityScanner;