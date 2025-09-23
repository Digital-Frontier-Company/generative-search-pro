import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

const VoiceSearchMonitor = () => {
  return (
    <div className="p-6">
      <Card>
        <CardHeader>
          <CardTitle>Voice Search Monitor</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">
            Voice search monitoring is being updated. Please check back soon.
          </p>
        </CardContent>
      </Card>
    </div>
  );
};

export default VoiceSearchMonitor;