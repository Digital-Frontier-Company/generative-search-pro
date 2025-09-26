import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';

type ChangeItem = {
  type: string;
  severity: string;
  description: string;
  impact: string;
};

const RealtimeSERPMonitor = () => {
  const [query, setQuery] = useState('');
  const [domain, setDomain] = useState('');
  const [engines, setEngines] = useState('google,bing');
  const [monitorId, setMonitorId] = useState<string | null>(null);
  const [creating, setCreating] = useState(false);
  const [checking, setChecking] = useState(false);
  const [results, setResults] = useState<{ monitorId: string; changes: ChangeItem[] }[]>([]);
  const [initialSnapshot, setInitialSnapshot] = useState<any>(null);

  const createMonitor = async () => {
    if (!query || !domain) {
      toast.error('Enter both query and domain');
      return;
    }
    setCreating(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        toast.error('Please sign in');
        return;
      }
      const { data, error } = await supabase.functions.invoke('realtime-serp-monitor', {
        body: {
          action: 'create_monitor',
          query,
          domain: domain.replace(/^https?:\/\//, ''),
          user_id: user.id,
          engines,
          change_types: 'citation_gained,citation_lost,position_changed,ai_answer_changed,new_sources_added',
          alert_threshold: 'immediate'
        }
      });
      if (error) throw error;
      setMonitorId(data.monitorId);
      setInitialSnapshot(data.initialSnapshot);
      toast.success('Monitor created');
    } catch (e: any) {
      toast.error(e?.message || 'Failed to create monitor (check SERPAPI_KEY)');
    } finally {
      setCreating(false);
    }
  };

  const checkNow = async () => {
    if (!monitorId) {
      toast.error('Create a monitor first');
      return;
    }
    setChecking(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        toast.error('Please sign in');
        return;
      }
      const { data, error } = await supabase.functions.invoke('realtime-serp-monitor', {
        body: { action: 'check_changes', monitor_id: monitorId, user_id: user.id }
      });
      if (error) throw error;
      setResults(data.results || []);
      toast.success('Checked for changes');
    } catch (e: any) {
      toast.error(e?.message || 'Check failed');
    } finally {
      setChecking(false);
    }
  };

  return (
    <div className="p-6 space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Realtime SERP Monitor</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid md:grid-cols-3 gap-3">
            <div>
              <label className="text-sm block mb-1">Query</label>
              <Input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="best crm for startups" />
            </div>
            <div>
              <label className="text-sm block mb-1">Domain</label>
              <Input value={domain} onChange={(e) => setDomain(e.target.value)} placeholder="example.com" />
            </div>
            <div>
              <label className="text-sm block mb-1">Engines</label>
              <Input value={engines} onChange={(e) => setEngines(e.target.value)} placeholder="google,bing" />
            </div>
          </div>
          <div className="flex gap-3">
            <Button onClick={createMonitor} disabled={creating}>{creating ? 'Creating…' : 'Create Monitor'}</Button>
            <Button onClick={checkNow} disabled={!monitorId || checking} variant="outline">{checking ? 'Checking…' : 'Check Now'}</Button>
          </div>
          {monitorId && (
            <div className="text-sm text-muted-foreground">Monitor ID: <code>{monitorId}</code></div>
          )}
        </CardContent>
      </Card>

      {initialSnapshot && (
        <Card>
          <CardHeader>
            <CardTitle>Initial Snapshot</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-sm">
            <div>Engine: <Badge variant="secondary">{initialSnapshot.engine}</Badge></div>
            <div>Cited Sources: {initialSnapshot.totalSources}</div>
            <div>Citation Position: {initialSnapshot.citationPosition ?? '—'}</div>
            <div>Organic Positions: {initialSnapshot.organicPositions?.join(', ') || '—'}</div>
          </CardContent>
        </Card>
      )}

      {results.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Recent Changes</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {results.map((r) => (
                <div key={r.monitorId} className="border rounded p-3">
                  <div className="mb-2 text-sm">Monitor: <code>{r.monitorId}</code> — {r.changes.length} change(s)</div>
                  <div className="space-y-2">
                    {r.changes.map((c, i) => (
                      <div key={i} className="flex items-center justify-between text-sm">
                        <div>
                          <Badge className="mr-2" variant={c.severity === 'critical' ? 'destructive' : 'secondary'}>{c.severity}</Badge>
                          {c.type}: {c.description}
                        </div>
                        <div className="text-muted-foreground">{c.impact}</div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default RealtimeSERPMonitor;