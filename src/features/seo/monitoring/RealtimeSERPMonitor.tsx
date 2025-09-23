import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

const RealtimeSERPMonitor = () => {
  return (
    <div className="p-6">
      <Card>
        <CardHeader>
          <CardTitle>Realtime SERP Monitor</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">
            Realtime SERP monitoring is being updated. Please check back soon.
          </p>
        </CardContent>
      </Card>
    </div>
  );
};

export default RealtimeSERPMonitor;