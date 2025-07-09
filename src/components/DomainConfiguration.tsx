import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Globe, Save, X } from 'lucide-react';
import { toast } from 'sonner';
import { useDomain } from '@/contexts/DomainContext';

const DomainConfiguration = () => {
  const { defaultDomain, setDefaultDomain, isLoading } = useDomain();
  const [domain, setDomain] = useState(defaultDomain || '');
  const [isSaving, setIsSaving] = useState(false);

  const validateDomain = (domain: string) => {
    const domainRegex = /^(?:https?:\/\/)?(?:www\.)?([a-zA-Z0-9-]+\.)+[a-zA-Z]{2,}$/;
    return domainRegex.test(domain);
  };

  const cleanDomain = (domain: string) => {
    return domain.replace(/^https?:\/\//, '').replace(/^www\./, '').replace(/\/$/, '');
  };

  const handleSave = async () => {
    if (!domain.trim()) {
      toast.error('Please enter a domain');
      return;
    }

    if (!validateDomain(domain)) {
      toast.error('Please enter a valid domain (e.g., example.com)');
      return;
    }

    setIsSaving(true);
    try {
      const cleanedDomain = cleanDomain(domain);
      await setDefaultDomain(cleanedDomain);
      setDomain(cleanedDomain);
      toast.success('Default domain saved successfully!');
    } catch (error) {
      toast.error('Failed to save default domain');
    } finally {
      setIsSaving(false);
    }
  };

  const handleClear = async () => {
    setIsSaving(true);
    try {
      await setDefaultDomain(null);
      setDomain('');
      toast.success('Default domain cleared');
    } catch (error) {
      toast.error('Failed to clear default domain');
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-center">
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Globe className="h-5 w-5" />
          Default Domain Configuration
        </CardTitle>
        <CardDescription>
          Set a default domain that will be automatically used across all SEO analysis tools. 
          You can always override this for individual analyses.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="domain">Default Domain</Label>
          <Input
            id="domain"
            type="text"
            placeholder="Enter domain (e.g., example.com)"
            value={domain}
            onChange={(e) => setDomain(e.target.value)}
            disabled={isSaving}
          />
          <p className="text-sm text-muted-foreground">
            Enter without http:// or www. (e.g., example.com)
          </p>
        </div>

        <div className="flex gap-3">
          <Button 
            onClick={handleSave} 
            disabled={isSaving || !domain.trim()}
            className="flex-1"
          >
            {isSaving ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                Saving...
              </>
            ) : (
              <>
                <Save className="h-4 w-4 mr-2" />
                Save Domain
              </>
            )}
          </Button>
          
          {defaultDomain && (
            <Button 
              variant="outline" 
              onClick={handleClear}
              disabled={isSaving}
            >
              <X className="h-4 w-4 mr-2" />
              Clear
            </Button>
          )}
        </div>

        {defaultDomain && (
          <div className="p-3 bg-muted rounded-lg">
            <p className="text-sm">
              <strong>Current default:</strong> {defaultDomain}
            </p>
            <p className="text-xs text-muted-foreground mt-1">
              This domain will be pre-filled in all analysis tools
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default DomainConfiguration;