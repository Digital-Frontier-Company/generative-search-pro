import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createSecureHandler, validateInput, commonSchemas, validateEnvVars } from "../_shared/security.ts";
import { getCached, setCached, generateCacheKey, withPerformanceMonitoring, retryWithBackoff } from "../_shared/performance.ts";

validateEnvVars(['SUPABASE_URL', 'SUPABASE_SERVICE_ROLE_KEY']);

interface SERPSnapshot {
  query: string;
  domain: string;
  engine: 'google' | 'bing';
  aiAnswer: string;
  citedSources: any[];
  citationPosition: number | null;
  totalSources: number;
  organicPositions: number[];
  featuredSnippet: any;
  timestamp: string;
  checksum: string;
}

interface SERPChange {
  type: 'citation_gained' | 'citation_lost' | 'position_changed' | 'ai_answer_changed' | 'new_sources_added';
  severity: 'low' | 'medium' | 'high' | 'critical';
  oldValue: any;
  newValue: any;
  description: string;
  impact: string;
}

interface MonitoringAlert {
  id: string;
  userId: string;
  query: string;
  domain: string;
  engines: string[];
  changeTypes: string[];
  alertThreshold: 'immediate' | 'hourly' | 'daily';
  isActive: boolean;
  lastChecked: string;
  lastSnapshot?: SERPSnapshot;
}

const secureHandler = createSecureHandler(
  async (req: Request, user: any) => {
    const body = await req.json();
    const action = body.action || 'check_changes';

    switch (action) {
      case 'create_monitor':
        return await createMonitor(body, user);
      case 'check_changes':
        return await checkSERPChanges(body, user);
      case 'get_alerts':
        return await getActiveAlerts(body, user);
      case 'update_monitor':
        return await updateMonitor(body, user);
      case 'delete_monitor':
        return await deleteMonitor(body, user);
      default:
        throw new Error('Invalid action');
    }
  },
  {
    requireAuth: true,
    rateLimit: { requests: 60, windowMs: 3600000 }, // 60 requests per hour
    maxRequestSize: 20480,
    allowedOrigins: ['*']
  }
);

async function createMonitor(body: any, user: any) {
  const validated = validateInput(body, {
    query: { ...commonSchemas.query, maxLength: 300 },
    domain: commonSchemas.domain,
    user_id: commonSchemas.userId,
    engines: { type: 'string' as const, required: false }, // comma-separated
    change_types: { type: 'string' as const, required: false }, // comma-separated
    alert_threshold: { type: 'string' as const, required: false }
  });

  const {
    query,
    domain,
    user_id,
    engines = 'google,bing',
    change_types = 'citation_gained,citation_lost,position_changed',
    alert_threshold = 'immediate'
  } = validated;

  const monitorId = crypto.randomUUID();
  const engineList = engines.split(',').map((e: string) => e.trim());
  const changeTypeList = change_types.split(',').map((t: string) => t.trim());

  // Take initial SERP snapshot
  const initialSnapshot = await takeSERPSnapshot(query, domain, engineList[0] as 'google' | 'bing');

  const monitorData = {
    id: monitorId,
    user_id,
    query,
    domain,
    engines: engineList,
    change_types: changeTypeList,
    alert_threshold,
    is_active: true,
    created_at: new Date().toISOString(),
    last_checked: new Date().toISOString(),
    last_snapshot: initialSnapshot
  };

  // Store in database
  const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
  const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;

  await fetch(`${supabaseUrl}/rest/v1/serp_monitors`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${supabaseKey}`,
      'Content-Type': 'application/json',
      'apikey': supabaseKey,
    },
    body: JSON.stringify(monitorData),
  });

  // Send WebSocket notification
  await sendWebSocketNotification(user_id, {
    type: 'monitor_created',
    data: {
      monitorId,
      query,
      domain,
      message: `Real-time monitoring started for "${query}"`
    }
  });

  return new Response(JSON.stringify({
    success: true,
    monitorId,
    initialSnapshot,
    message: 'SERP monitor created successfully'
  }), {
    headers: { 'Content-Type': 'application/json' }
  });
}

async function checkSERPChanges(body: any, user: any) {
  const validated = validateInput(body, {
    monitor_id: { type: 'string' as const, required: false },
    user_id: commonSchemas.userId
  });

  const { monitor_id, user_id } = validated;

  const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
  const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;

  // Get active monitors
  let query = `${supabaseUrl}/rest/v1/serp_monitors?user_id=eq.${user_id}&is_active=eq.true`;
  if (monitor_id) {
    query += `&id=eq.${monitor_id}`;
  }

  const monitorsResponse = await fetch(query, {
    headers: {
      'Authorization': `Bearer ${supabaseKey}`,
      'apikey': supabaseKey,
    },
  });

  const monitors = await monitorsResponse.json();
  const changeResults = [];

  for (const monitor of monitors) {
    try {
      const changes = await checkMonitorForChanges(monitor);
      changeResults.push({
        monitorId: monitor.id,
        query: monitor.query,
        domain: monitor.domain,
        changes: changes.length,
        details: changes
      });

      // If changes detected, send notifications
      if (changes.length > 0) {
        await handleSERPChanges(monitor, changes);
      }

      // Update last_checked timestamp
      await fetch(`${supabaseUrl}/rest/v1/serp_monitors?id=eq.${monitor.id}`, {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${supabaseKey}`,
          'Content-Type': 'application/json',
          'apikey': supabaseKey,
        },
        body: JSON.stringify({
          last_checked: new Date().toISOString()
        }),
      });

    } catch (error) {
      console.error(`Error checking monitor ${monitor.id}:`, error);
    }

    // Rate limiting between monitor checks
    await new Promise(resolve => setTimeout(resolve, 1500));
  }

  return new Response(JSON.stringify({
    success: true,
    monitorsChecked: monitors.length,
    totalChanges: changeResults.reduce((sum, r) => sum + r.changes, 0),
    results: changeResults
  }), {
    headers: { 'Content-Type': 'application/json' }
  });
}

async function takeSERPSnapshot(query: string, domain: string, engine: 'google' | 'bing'): Promise<SERPSnapshot> {
  const serpApiKey = Deno.env.get('SERPAPI_KEY');
  
  if (!serpApiKey) {
    throw new Error('SERPAPI_KEY not configured');
  }

  try {
    const engineParam = engine === 'google' ? 'google' : 'bing';
    const serpUrl = `https://serpapi.com/search.json?engine=${engineParam}&q=${encodeURIComponent(query)}&api_key=${serpApiKey}&gl=us&hl=en`;
    
    const response = await retryWithBackoff(async () => {
      const res = await fetch(serpUrl);
      if (!res.ok) throw new Error(`SERP API error: ${res.status}`);
      return res.json();
    }, 3, 1000, 5000);

    // Extract data based on engine
    let aiAnswer = '';
    let citedSources: any[] = [];
    let citationPosition: number | null = null;
    let totalSources = 0;
    let organicPositions: number[] = [];
    let featuredSnippet = null;

    if (engine === 'google' && response.ai_overview) {
      aiAnswer = response.ai_overview.overview || '';
      citedSources = response.ai_overview.sources || [];
      totalSources = citedSources.length;

      citedSources.forEach((source: any, index: number) => {
        if (source.link && source.link.includes(domain)) {
          citationPosition = index + 1;
        }
      });
    }

    if (engine === 'bing' && response.ai_answer) {
      aiAnswer = response.ai_answer.answer || '';
      citedSources = response.ai_answer.sources || [];
      totalSources = citedSources.length;
    }

    // Check organic results
    if (response.organic_results) {
      response.organic_results.forEach((result: any, index: number) => {
        if (result.link && result.link.includes(domain)) {
          organicPositions.push(index + 1);
        }
      });
    }

    // Check featured snippet
    if (response.featured_snippet && response.featured_snippet.link?.includes(domain)) {
      featuredSnippet = response.featured_snippet;
    }

    const snapshot: SERPSnapshot = {
      query,
      domain,
      engine,
      aiAnswer,
      citedSources,
      citationPosition,
      totalSources,
      organicPositions,
      featuredSnippet,
      timestamp: new Date().toISOString(),
      checksum: generateSnapshotChecksum(aiAnswer, JSON.stringify(citedSources), JSON.stringify(organicPositions))
    };

    return snapshot;

  } catch (error) {
    console.error('SERP snapshot failed:', error);
    throw error;
  }
}

async function checkMonitorForChanges(monitor: MonitoringAlert): Promise<SERPChange[]> {
  const changes: SERPChange[] = [];
  
  for (const engine of monitor.engines) {
    try {
      const newSnapshot = await takeSERPSnapshot(monitor.query, monitor.domain, engine as 'google' | 'bing');
      const oldSnapshot = monitor.lastSnapshot;

      if (!oldSnapshot) {
        // First check, update snapshot and continue
        await updateMonitorSnapshot(monitor.id, newSnapshot);
        continue;
      }

      // Compare snapshots for changes
      const detectedChanges = compareSnapshots(oldSnapshot, newSnapshot, monitor.changeTypes);
      changes.push(...detectedChanges);

      // Update snapshot if changes detected
      if (detectedChanges.length > 0) {
        await updateMonitorSnapshot(monitor.id, newSnapshot);
      }

    } catch (error) {
      console.error(`Error checking ${engine} for monitor ${monitor.id}:`, error);
    }
  }

  return changes;
}

function compareSnapshots(oldSnapshot: SERPSnapshot, newSnapshot: SERPSnapshot, changeTypes: string[]): SERPChange[] {
  const changes: SERPChange[] = [];

  // Citation gained/lost
  if (changeTypes.includes('citation_gained') || changeTypes.includes('citation_lost')) {
    const oldCited = oldSnapshot.citationPosition !== null;
    const newCited = newSnapshot.citationPosition !== null;

    if (!oldCited && newCited) {
      changes.push({
        type: 'citation_gained',
        severity: 'high',
        oldValue: null,
        newValue: newSnapshot.citationPosition,
        description: `Gained citation at position #${newSnapshot.citationPosition}`,
        impact: 'Positive: Your content is now being cited in AI answers'
      });
    } else if (oldCited && !newCited) {
      changes.push({
        type: 'citation_lost',
        severity: 'critical',
        oldValue: oldSnapshot.citationPosition,
        newValue: null,
        description: `Lost citation (was at position #${oldSnapshot.citationPosition})`,
        impact: 'Negative: Your content is no longer being cited'
      });
    }
  }

  // Position changes
  if (changeTypes.includes('position_changed')) {
    if (oldSnapshot.citationPosition && newSnapshot.citationPosition && 
        oldSnapshot.citationPosition !== newSnapshot.citationPosition) {
      const improvement = oldSnapshot.citationPosition > newSnapshot.citationPosition;
      changes.push({
        type: 'position_changed',
        severity: improvement ? 'medium' : 'high',
        oldValue: oldSnapshot.citationPosition,
        newValue: newSnapshot.citationPosition,
        description: `Citation position changed from #${oldSnapshot.citationPosition} to #${newSnapshot.citationPosition}`,
        impact: improvement ? 'Positive: Better citation position' : 'Negative: Lower citation position'
      });
    }
  }

  // AI answer changes
  if (changeTypes.includes('ai_answer_changed')) {
    if (oldSnapshot.aiAnswer !== newSnapshot.aiAnswer) {
      const answerLengthChange = newSnapshot.aiAnswer.length - oldSnapshot.aiAnswer.length;
      changes.push({
        type: 'ai_answer_changed',
        severity: 'medium',
        oldValue: oldSnapshot.aiAnswer.substring(0, 100),
        newValue: newSnapshot.aiAnswer.substring(0, 100),
        description: `AI answer content changed (${answerLengthChange > 0 ? '+' : ''}${answerLengthChange} chars)`,
        impact: 'Monitor: AI answer content has been updated'
      });
    }
  }

  // New sources added
  if (changeTypes.includes('new_sources_added')) {
    if (newSnapshot.totalSources > oldSnapshot.totalSources) {
      changes.push({
        type: 'new_sources_added',
        severity: 'low',
        oldValue: oldSnapshot.totalSources,
        newValue: newSnapshot.totalSources,
        description: `${newSnapshot.totalSources - oldSnapshot.totalSources} new sources added to AI answer`,
        impact: 'Monitor: More sources are being referenced'
      });
    }
  }

  return changes;
}

async function handleSERPChanges(monitor: MonitoringAlert, changes: SERPChange[]) {
  const criticalChanges = changes.filter(c => c.severity === 'critical');
  const highPriorityChanges = changes.filter(c => c.severity === 'high');

  // Send immediate WebSocket notifications for critical/high priority changes
  if (criticalChanges.length > 0 || highPriorityChanges.length > 0) {
    await sendWebSocketNotification(monitor.userId, {
      type: 'serp_alert',
      severity: criticalChanges.length > 0 ? 'critical' : 'high',
      data: {
        monitorId: monitor.id,
        query: monitor.query,
        domain: monitor.domain,
        changes: [...criticalChanges, ...highPriorityChanges],
        totalChanges: changes.length,
        timestamp: new Date().toISOString()
      }
    });
  }

  // Store change log in database
  await storeSERPChanges(monitor.id, changes);

  // Send email notifications based on threshold and severity
  if (monitor.alertThreshold === 'immediate' && (criticalChanges.length > 0 || highPriorityChanges.length > 0)) {
    await sendEmailAlert(monitor, changes);
  }
}

async function sendWebSocketNotification(userId: string, notification: any) {
  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;

    // Use Supabase Realtime to send notification
    await fetch(`${supabaseUrl}/rest/v1/rpc/send_realtime_notification`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${supabaseKey}`,
        'Content-Type': 'application/json',
        'apikey': supabaseKey,
      },
      body: JSON.stringify({
        user_id: userId,
        notification_type: notification.type,
        payload: notification
      }),
    }).catch(err => console.error('WebSocket notification failed:', err));

  } catch (error) {
    console.error('WebSocket notification error:', error);
  }
}

async function storeSERPChanges(monitorId: string, changes: SERPChange[]) {
  const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
  const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;

  for (const change of changes) {
    await fetch(`${supabaseUrl}/rest/v1/serp_change_logs`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${supabaseKey}`,
        'Content-Type': 'application/json',
        'apikey': supabaseKey,
      },
      body: JSON.stringify({
        monitor_id: monitorId,
        change_type: change.type,
        severity: change.severity,
        old_value: change.oldValue,
        new_value: change.newValue,
        description: change.description,
        impact: change.impact,
        detected_at: new Date().toISOString()
      }),
    }).catch(err => console.error('Change log storage failed:', err));
  }
}

async function sendEmailAlert(monitor: MonitoringAlert, changes: SERPChange[]) {
  const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
  const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;

  const emailData = {
    user_id: monitor.userId,
    email_type: 'serp_alert',
    subject: `SERP Alert: ${changes.length} changes detected for "${monitor.query}"`,
    data: {
      query: monitor.query,
      domain: monitor.domain,
      changes,
      monitorId: monitor.id
    }
  };

  await fetch(`${supabaseUrl}/functions/v1/send-signup-emails`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${supabaseKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(emailData),
  }).catch(err => console.error('Email alert failed:', err));
}

async function updateMonitorSnapshot(monitorId: string, snapshot: SERPSnapshot) {
  const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
  const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;

  await fetch(`${supabaseUrl}/rest/v1/serp_monitors?id=eq.${monitorId}`, {
    method: 'PATCH',
    headers: {
      'Authorization': `Bearer ${supabaseKey}`,
      'Content-Type': 'application/json',
      'apikey': supabaseKey,
    },
    body: JSON.stringify({
      last_snapshot: snapshot,
      last_checked: new Date().toISOString()
    }),
  }).catch(err => console.error('Snapshot update failed:', err));
}

async function getActiveAlerts(body: any, user: any) {
  const validated = validateInput(body, {
    user_id: commonSchemas.userId
  });

  const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
  const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;

  // Get active monitors
  const monitorsResponse = await fetch(`${supabaseUrl}/rest/v1/serp_monitors?user_id=eq.${validated.user_id}&is_active=eq.true`, {
    headers: {
      'Authorization': `Bearer ${supabaseKey}`,
      'apikey': supabaseKey,
    },
  });

  const monitors = await monitorsResponse.json();

  // Get recent changes
  const changesResponse = await fetch(`${supabaseUrl}/rest/v1/serp_change_logs?monitor_id=in.(${monitors.map((m: any) => m.id).join(',')})&order=detected_at.desc&limit=50`, {
    headers: {
      'Authorization': `Bearer ${supabaseKey}`,
      'apikey': supabaseKey,
    },
  });

  const recentChanges = await changesResponse.json();

  return new Response(JSON.stringify({
    activeMonitors: monitors.length,
    recentChanges: recentChanges.length,
    monitors,
    changes: recentChanges
  }), {
    headers: { 'Content-Type': 'application/json' }
  });
}

async function updateMonitor(body: any, user: any) {
  const validated = validateInput(body, {
    monitor_id: { type: 'string' as const, required: true },
    user_id: commonSchemas.userId,
    is_active: { type: 'boolean' as const, required: false },
    alert_threshold: { type: 'string' as const, required: false },
    change_types: { type: 'string' as const, required: false }
  });

  const { monitor_id, user_id, ...updates } = validated;

  const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
  const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;

  await fetch(`${supabaseUrl}/rest/v1/serp_monitors?id=eq.${monitor_id}&user_id=eq.${user_id}`, {
    method: 'PATCH',
    headers: {
      'Authorization': `Bearer ${supabaseKey}`,
      'Content-Type': 'application/json',
      'apikey': supabaseKey,
    },
    body: JSON.stringify(updates),
  });

  return new Response(JSON.stringify({
    success: true,
    message: 'Monitor updated successfully'
  }), {
    headers: { 'Content-Type': 'application/json' }
  });
}

async function deleteMonitor(body: any, user: any) {
  const validated = validateInput(body, {
    monitor_id: { type: 'string' as const, required: true },
    user_id: commonSchemas.userId
  });

  const { monitor_id, user_id } = validated;

  const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
  const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;

  await fetch(`${supabaseUrl}/rest/v1/serp_monitors?id=eq.${monitor_id}&user_id=eq.${user_id}`, {
    method: 'DELETE',
    headers: {
      'Authorization': `Bearer ${supabaseKey}`,
      'apikey': supabaseKey,
    },
  });

  return new Response(JSON.stringify({
    success: true,
    message: 'Monitor deleted successfully'
  }), {
    headers: { 'Content-Type': 'application/json' }
  });
}

function generateSnapshotChecksum(...inputs: string[]): string {
  const combined = inputs.join('|');
  // Simple checksum for change detection
  let hash = 0;
  for (let i = 0; i < combined.length; i++) {
    const char = combined.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash; // Convert to 32bit integer
  }
  return hash.toString(36);
}

serve(secureHandler);