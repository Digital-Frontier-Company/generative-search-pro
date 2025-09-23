import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

// Simplified component to avoid database schema issues
const EnhancedCitationTracker = () => {
  return (
    <div className="p-6">
      <Card>
        <CardHeader>
          <CardTitle>Enhanced Citation Tracker</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">
            Enhanced citation tracking is currently being updated. Please use the standard Citation Checker for now.
          </p>
        </CardContent>
      </Card>
    </div>
  );
};

export default EnhancedCitationTracker;