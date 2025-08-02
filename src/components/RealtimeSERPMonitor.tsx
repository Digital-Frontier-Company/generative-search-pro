import React, { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { toast } from 'sonner';
import { supabase } from '../integrations/supabase/client';
import { useDomain } from '../contexts/DomainContext';
import { useAuth } from '../contexts/AuthContext';
import { 
  Zap, 
  Bell, 
  RefreshCw,
  Plus,
  Trash2,
  Settings,
  TrendingUp,
  AlertTriangle,
  CheckCircle,
  Clock,
  Target,
  Eye,
  EyeOff,
  Activity
} from 'lucide-react';

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
  query: string;
  domain: string;
  engines: string[];
  changeTypes: string[];
  alertThreshold: 'immediate' | 'hourly' | 'daily';
  isActive: boolean;
  lastChecked: string;
  createdAt: string;
}

interface ChangeLog {
  id: string;
  monitorId: string;
  changeType: string;
  severity: string;
  oldValue: any;
  newValue: any;
  description: string;
  impact: string;
  detectedAt: string;
}

const RealtimeSERPMonitor = () => {
  const { defaultDomain } = useDomain();
  const { user } = useAuth();
  const [query, setQuery] = useState('');
  const [domain, setDomain] = useState('');
  const [loading, setLoading] = useState(false);
  const [monitors, setMonitors] = useState<MonitoringAlert[]>([]);
  const [changes, setChanges] = useState<ChangeLog[]>([]);
  const [liveNotifications, setLiveNotifications] = useState<any[]>([]);
  const [isConnected, setIsConnected] = useState(false);
  
  // Monitor creation form state
  const [selectedEngines, setSelectedEngines] = useState({
    google: true,
    bing: true
  });
  const [selectedChangeTypes, setSelectedChangeTypes] = useState({
    citation_gained: true,
    citation_lost: true,
    position_changed: true,
    ai_answer_changed: false,
    new_sources_added: false
  });
  const [alertThreshold, setAlertThreshold] = useState<'immediate' | 'hourly' | 'daily'>('immediate');

  useEffect(() => {
    if (defaultDomain && !domain) {
      setDomain(defaultDomain);
    }
  }, [defaultDomain, domain]);

  useEffect(() => {
    loadMonitors();
    loadRecentChanges();
    setupRealtimeSubscription();
  }, []);

  const setupRealtimeSubscription = useCallback(() => {
    if (!user) return;

    // Subscribe to real-time notifications
    const subscription = supabase
      .channel('serp-alerts')
      .on('broadcast', { event: 'serp_change' }, (payload) => {
        if (payload.payload.user_id === user.id) {
          handleRealtimeNotification(payload.payload);
        }
      })
      .subscribe((status) => {
        setIsConnected(status === 'SUBSCRIBED');
        if (status === 'SUBSCRIBED') {
          toast.success('Real-time monitoring connected');
        }
      });

    return () => {
      subscription.unsubscribe();
    };
  }, [user]);

  const handleRealtimeNotification = (notification: any) => {
    setLiveNotifications(prev => [notification, ...prev.slice(0, 9)]); // Keep last 10
    
    // Show toast notification
    const { type, severity, data } = notification;
    
    if (type === 'serp_alert') {
      const message = `SERP Alert: ${data.changes.length} changes detected for "${data.query}"`;
      
      if (severity === 'critical') {
        toast.error(message, { duration: 10000 });
      } else if (severity === 'high') {
        toast.warning(message, { duration: 7000 });
      } else {
        toast.info(message);
      }
      
      // Reload data
      loadMonitors();
      loadRecentChanges();
    }
  };

  const loadMonitors = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data, error } = await supabase.functions.invoke('realtime-serp-monitor', {
        body: JSON.stringify({
          action: 'get_alerts',
          user_id: user.id
        })
      });

      if (error) throw error;
      setMonitors(data.monitors || []);
    } catch (error) {
      console.error('Error loading monitors:', error);
    }
  };

  const loadRecentChanges = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data, error } = await supabase.functions.invoke('realtime-serp-monitor', {
        body: JSON.stringify({
          action: 'get_alerts',
          user_id: user.id
        })
      });

      if (error) throw error;
      setChanges(data.changes || []);
    } catch (error) {
      console.error('Error loading changes:', error);
    }
  };

  const createMonitor = async () => {
    if (!query || !domain) {
      toast.error('Please enter both query and domain');
      return;
    }

    try {
      setLoading(true);
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        toast.error('Please sign in to create monitors');
        return;
      }

      const activeEngines = Object.entries(selectedEngines)
        .filter(([_, enabled]) => enabled)
        .map(([engine, _]) => engine);

      const activeChangeTypes = Object.entries(selectedChangeTypes)
        .filter(([_, enabled]) => enabled)
        .map(([type, _]) => type);

      if (activeEngines.length === 0) {
        toast.error('Please select at least one search engine');
        return;
      }

      if (activeChangeTypes.length === 0) {
        toast.error('Please select at least one change type to monitor');
        return;
      }

      const { data, error } = await supabase.functions.invoke('realtime-serp-monitor', {
        body: JSON.stringify({
          action: 'create_monitor',
          query,
          domain: domain.replace(/^https?:\/\//, ''),
          user_id: user.id,
          engines: activeEngines.join(','),
          change_types: activeChangeTypes.join(','),
          alert_threshold: alertThreshold
        })
      });

      if (error) throw error;

      toast.success(`Monitor created for "${query}"`);
      setQuery('');
      loadMonitors();

    } catch (error: unknown) {
      console.error('Monitor creation error:', error);
      const errMessage = error instanceof Error ? error.message : 'Failed to create monitor';
      toast.error(errMessage);
    } finally {
      setLoading(false);
    }
  };

  const toggleMonitor = async (monitorId: string, isActive: boolean) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { error } = await supabase.functions.invoke('realtime-serp-monitor', {
        body: JSON.stringify({
          action: 'update_monitor',
          monitor_id: monitorId,
          user_id: user.id,
          is_active: !isActive
        })
      });

      if (error) throw error;

      toast.success(isActive ? 'Monitor paused' : 'Monitor activated');
      loadMonitors();

    } catch (error: unknown) {
      const errMessage = error instanceof Error ? error.message : 'Failed to update monitor';
      toast.error(errMessage);
    }
  };

  const deleteMonitor = async (monitorId: string) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { error } = await supabase.functions.invoke('realtime-serp-monitor', {
        body: JSON.stringify({
          action: 'delete_monitor',
          monitor_id: monitorId,
          user_id: user.id
        })
      });

      if (error) throw error;

      toast.success('Monitor deleted');
      loadMonitors();

    } catch (error: unknown) {
      const errMessage = error instanceof Error ? error.message : 'Failed to delete monitor';
      toast.error(errMessage);
    }
  };

  const checkAllMonitors = async () => {
    try {
      setLoading(true);
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data, error } = await supabase.functions.invoke('realtime-serp-monitor', {
        body: JSON.stringify({
          action: 'check_changes',
          user_id: user.id
        })
      });

      if (error) throw error;

      const totalChanges = data.totalChanges || 0;
      if (totalChanges > 0) {
        toast.success(`Found ${totalChanges} changes across ${data.monitorsChecked} monitors`);
      } else {
        toast.info(`No changes detected in ${data.monitorsChecked} monitors`);
      }

      loadMonitors();
      loadRecentChanges();

    } catch (error: unknown) {
      const errMessage = error instanceof Error ? error.message : 'Failed to check monitors';
      toast.error(errMessage);
    } finally {
      setLoading(false);
    }
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical': return 'text-red-600 bg-red-50 border-red-200';
      case 'high': return 'text-orange-600 bg-orange-50 border-orange-200';
      case 'medium': return 'text-yellow-600 bg-yellow-50 border-yellow-200';
      case 'low': return 'text-blue-600 bg-blue-50 border-blue-200';
      default: return 'text-gray-600 bg-gray-50 border-gray-200';
    }
  };

  const getSeverityIcon = (severity: string) => {
    switch (severity) {
      case 'critical': return <AlertTriangle className="w-4 h-4" />;
      case 'high': return <TrendingUp className="w-4 h-4" />;
      case 'medium': return <Target className="w-4 h-4" />;
      case 'low': return <CheckCircle className="w-4 h-4" />;
      default: return <Activity className="w-4 h-4" />;
    }
  };

  const getChangeTypeIcon = (type: string) => {
    switch (type) {
      case 'citation_gained': return '🎉';
      case 'citation_lost': return '😞';
      case 'position_changed': return '📈';
      case 'ai_answer_changed': return '📝';
      case 'new_sources_added': return '📚';
      default: return '🔍';
    }
  };

  return (
    <div className="max-w-7xl mx-auto p-6 space-y-6">
      <div className="text-center">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Real-Time SERP Monitor</h1>
        <p className="text-gray-600">
          Get instant notifications when your citations change in AI search results
        </p>
        <div className="flex items-center justify-center gap-2 mt-2">
          <div className={`w-2 h-2 rounded-full ${isConnected ? 'bg-green-500' : 'bg-red-500'}`}></div>
          <span className="text-sm text-gray-500">
            {isConnected ? 'Connected to real-time monitoring' : 'Disconnected'}
          </span>
        </div>
      </div>

      {/* Live Notifications Bar */}
      {liveNotifications.length > 0 && (
        <Card className="border-yellow-200 bg-yellow-50">
          <CardHeader className="pb-2">
            <CardTitle className="text-lg flex items-center gap-2">
              <Bell className="w-5 h-5 text-yellow-600" />
              Live Notifications
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2 max-h-32 overflow-y-auto">
              {liveNotifications.slice(0, 3).map((notification, index) => (
                <div key={index} className="text-sm p-2 bg-white rounded border">
                  <span className="font-medium">{notification.type}:</span> {notification.data?.message || 'New alert received'}
                  <span className="text-xs text-gray-500 ml-2">
                    {new Date(notification.timestamp || Date.now()).toLocaleTimeString()}
                  </span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Create Monitor Section */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Plus className="w-5 h-5" />
            Create SERP Monitor
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-2">Search Query *</label>
              <Input
                placeholder="best project management tools"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Domain *</label>
              <Input
                placeholder="yourdomain.com"
                value={domain}
                onChange={(e) => setDomain(e.target.value)}
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium mb-3">Search Engines</label>
            <div className="grid grid-cols-2 gap-3">
              {Object.entries(selectedEngines).map(([engine, enabled]) => (
                <label key={engine} className="flex items-center space-x-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={enabled}
                    onChange={(e) => setSelectedEngines(prev => ({
                      ...prev,
                      [engine]: e.target.checked
                    }))}
                    className="rounded border-gray-300"
                  />
                  <span className="text-sm capitalize">{engine}</span>
                </label>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium mb-3">Change Types to Monitor</label>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
              {Object.entries(selectedChangeTypes).map(([type, enabled]) => (
                <label key={type} className="flex items-center space-x-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={enabled}
                    onChange={(e) => setSelectedChangeTypes(prev => ({
                      ...prev,
                      [type]: e.target.checked
                    }))}
                    className="rounded border-gray-300"
                  />
                  <span className="text-sm">
                    {getChangeTypeIcon(type)} {type.replace('_', ' ')}
                  </span>
                </label>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Alert Frequency</label>
            <div className="flex gap-3">
              {(['immediate', 'hourly', 'daily'] as const).map((threshold) => (
                <label key={threshold} className="flex items-center space-x-2 cursor-pointer">
                  <input
                    type="radio"
                    name="threshold"
                    value={threshold}
                    checked={alertThreshold === threshold}
                    onChange={(e) => setAlertThreshold(e.target.value as 'immediate' | 'hourly' | 'daily')}
                    className="rounded border-gray-300"
                  />
                  <span className="text-sm capitalize">{threshold}</span>
                </label>
              ))}
            </div>
          </div>

          <Button 
            onClick={createMonitor} 
            disabled={loading || !query || !domain}
            className="w-full"
          >
            {loading ? (
              <>
                <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                Creating Monitor...
              </>
            ) : (
              <>
                <Plus className="w-4 h-4 mr-2" />
                Create SERP Monitor
              </>
            )}
          </Button>
        </CardContent>
      </Card>

      {/* Active Monitors */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span className="flex items-center gap-2">
              <Activity className="w-5 h-5" />
              Active Monitors ({monitors.filter(m => m.isActive).length})
            </span>
            <Button onClick={checkAllMonitors} disabled={loading} variant="outline" size="sm">
              {loading ? (
                <RefreshCw className="w-4 h-4 animate-spin" />
              ) : (
                <>
                  <RefreshCw className="w-4 h-4 mr-1" />
                  Check All
                </>
              )}
            </Button>
          </CardTitle>
        </CardHeader>
        <CardContent>
          {monitors.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <Activity className="w-12 h-12 mx-auto mb-2 opacity-50" />
              <p>No monitors created yet</p>
              <p className="text-sm">Create your first monitor above to start tracking SERP changes</p>
            </div>
          ) : (
            <div className="space-y-3">
              {monitors.map((monitor) => (
                <div key={monitor.id} className={`border rounded-lg p-4 ${monitor.isActive ? 'border-green-200 bg-green-50' : 'border-gray-200 bg-gray-50'}`}>
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <h3 className="font-medium">"{monitor.query}"</h3>
                      <div className="flex items-center gap-4 mt-1">
                        <span className="text-sm text-gray-600">{monitor.domain}</span>
                        <div className="flex gap-1">
                          {monitor.engines.map(engine => (
                            <Badge key={engine} variant="outline" className="text-xs">
                              {engine}
                            </Badge>
                          ))}
                        </div>
                        <Badge variant={monitor.isActive ? "default" : "secondary"}>
                          {monitor.isActive ? 'Active' : 'Paused'}
                        </Badge>
                        <span className="text-xs text-gray-500">
                          {monitor.alertThreshold} alerts
                        </span>
                      </div>
                      <div className="flex items-center gap-2 mt-2">
                        {monitor.changeTypes.map(type => (
                          <span key={type} className="text-xs bg-white px-2 py-1 rounded border">
                            {getChangeTypeIcon(type)} {type.replace('_', ' ')}
                          </span>
                        ))}
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Button
                        onClick={() => toggleMonitor(monitor.id, monitor.isActive)}
                        variant="ghost"
                        size="sm"
                      >
                        {monitor.isActive ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </Button>
                      <Button
                        onClick={() => deleteMonitor(monitor.id)}
                        variant="ghost"
                        size="sm"
                        className="text-red-600 hover:text-red-700"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                  <div className="text-xs text-gray-500 mt-2">
                    Last checked: {new Date(monitor.lastChecked).toLocaleString()}
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Recent Changes */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Zap className="w-5 h-5" />
            Recent Changes ({changes.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          {changes.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <Zap className="w-12 h-12 mx-auto mb-2 opacity-50" />
              <p>No changes detected yet</p>
              <p className="text-sm">Changes will appear here when your monitors detect SERP updates</p>
            </div>
          ) : (
            <div className="space-y-3">
              {changes.slice(0, 10).map((change) => (
                <div key={change.id} className={`border rounded-lg p-4 ${getSeverityColor(change.severity)}`}>
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        {getSeverityIcon(change.severity)}
                        <span className="font-medium capitalize">{change.changeType.replace('_', ' ')}</span>
                        <Badge variant="outline" className={getSeverityColor(change.severity)}>
                          {change.severity}
                        </Badge>
                      </div>
                      <p className="text-sm mb-1">{change.description}</p>
                      <p className="text-xs text-gray-600">{change.impact}</p>
                    </div>
                    <div className="text-xs text-gray-500">
                      <Clock className="w-3 h-3 inline mr-1" />
                      {new Date(change.detectedAt).toLocaleString()}
                    </div>
                  </div>
                  {(change.oldValue !== null || change.newValue !== null) && (
                    <div className="mt-3 pt-3 border-t text-xs">
                      {change.oldValue !== null && (
                        <p><span className="font-medium">Before:</span> {JSON.stringify(change.oldValue)}</p>
                      )}
                      {change.newValue !== null && (
                        <p><span className="font-medium">After:</span> {JSON.stringify(change.newValue)}</p>
                      )}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default RealtimeSERPMonitor;