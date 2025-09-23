import { supabase } from '@/integrations/supabase/client';

// Analytics data types
export interface AnalyticsQuery {
  user_id: string;
  date_range: '7d' | '30d' | '90d' | '1y';
  metrics?: string[];
  filters?: Record<string, any>;
}

export interface AnalyticsData {
  overview: {
    totalContent: number;
    totalSEOAnalyses: number;
    totalCitationChecks: number;
    avgContentScore: number;
    avgSEOScore: number;
    avgCitationRate: number;
    weeklyGrowth: {
      content: number;
      seo: number;
      citations: number;
    };
  };
  trends: Array<{
    date: string;
    contentGenerated: number;
    seoAnalyses: number;
    citationChecks: number;
    avgSeoScore: number;
    avgAiScore: number;
  }>;
  performance: {
    topContent: Array<{
      id: string;
      title: string;
      type: string;
      seoScore: number;
      aiScore: number;
      engagement: number;
    }>;
    aiEnginePerformance: Array<{
      engine: string;
      citationRate: number;
      averagePosition: number;
      improvement: number;
    }>;
  };
}

export interface ReportConfig {
  title: string;
  description: string;
  date_range: '7d' | '30d' | '90d' | '1y';
  metrics: string[];
  format: 'pdf' | 'csv' | 'json' | 'xlsx';
  scheduled?: boolean;
  frequency?: 'daily' | 'weekly' | 'monthly';
}

class AnalyticsService {
  private cache = new Map<string, { data: any; timestamp: number }>();
  private cacheTimeout = 5 * 60 * 1000; // 5 minutes

  // Get comprehensive analytics overview
  async getAnalyticsOverview(query: AnalyticsQuery): Promise<AnalyticsData> {
    const cacheKey = `overview-${query.user_id}-${query.date_range}`;
    
    // Check cache first
    const cached = this.cache.get(cacheKey);
    if (cached && Date.now() - cached.timestamp < this.cacheTimeout) {
      return cached.data;
    }

    try {
      const { data, error } = await supabase.functions.invoke('get-analytics-overview', {
        body: JSON.stringify(query)
      });

      if (error) throw error;

      // Cache the result
      this.cache.set(cacheKey, { data, timestamp: Date.now() });
      
      return data;
    } catch (error) {
      console.error('Analytics overview error:', error);
      throw error;
    }
  }

  // Get content performance analytics
  async getContentAnalytics(query: AnalyticsQuery) {
    try {
      const { data, error } = await supabase.functions.invoke('get-content-analytics', {
        body: JSON.stringify({
          ...query,
          metrics: [
            'content_generated',
            'content_types',
            'avg_scores',
            'engagement_rates',
            'keyword_performance'
          ]
        })
      });

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Content analytics error:', error);
      throw error;
    }
  }

  // Get SEO performance analytics
  async getSEOAnalytics(query: AnalyticsQuery) {
    try {
      const { data, error } = await supabase.functions.invoke('get-seo-analytics', {
        body: JSON.stringify({
          ...query,
          metrics: [
            'seo_analyses',
            'avg_scores',
            'technical_issues',
            'improvement_trends',
            'competitor_comparisons'
          ]
        })
      });

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('SEO analytics error:', error);
      throw error;
    }
  }

  // Get citation tracking analytics
  async getCitationAnalytics(query: AnalyticsQuery) {
    try {
      const { data, error } = await supabase.functions.invoke('get-citation-analytics', {
        body: JSON.stringify({
          ...query,
          metrics: [
            'citation_checks',
            'citation_rates_by_engine',
            'position_trends',
            'competitor_analysis',
            'alert_performance'
          ]
        })
      });

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Citation analytics error:', error);
      throw error;
    }
  }

  // Get competitive intelligence data
  async getCompetitiveAnalytics(query: AnalyticsQuery & { domains?: string[] }) {
    try {
      const { data, error } = await supabase.functions.invoke('get-competitive-analytics', {
        body: JSON.stringify({
          ...query,
          metrics: [
            'competitor_rankings',
            'content_gaps',
            'citation_share',
            'opportunity_analysis',
            'market_trends'
          ]
        })
      });

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Competitive analytics error:', error);
      throw error;
    }
  }

  // Generate comprehensive report
  async generateReport(config: ReportConfig, userId: string): Promise<Blob> {
    try {
      const { data, error } = await supabase.functions.invoke('generate-analytics-report', {
        body: JSON.stringify({
          ...config,
          user_id: userId,
          timestamp: new Date().toISOString()
        })
      });

      if (error) throw error;

      // Convert response to blob based on format
      let blob: Blob;
      switch (config.format) {
        case 'pdf':
          blob = new Blob([data], { type: 'application/pdf' });
          break;
        case 'csv':
          blob = new Blob([data], { type: 'text/csv' });
          break;
        case 'xlsx':
          blob = new Blob([data], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
          break;
        default:
          blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
      }

      return blob;
    } catch (error) {
      console.error('Report generation error:', error);
      throw error;
    }
  }

  // Export analytics data
  async exportData(format: 'csv' | 'json' | 'xlsx', query: AnalyticsQuery): Promise<Blob> {
    try {
      const data = await this.getAnalyticsOverview(query);
      
      switch (format) {
        case 'csv':
          return this.convertToCSV(data);
        case 'xlsx':
          return this.convertToExcel(data);
        default:
          return new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
      }
    } catch (error) {
      console.error('Export error:', error);
      throw error;
    }
  }

  // Convert data to CSV format
  private convertToCSV(data: any): Blob {
    const csvRows: string[] = [];
    
    // Add overview data
    csvRows.push('Metric,Value');
    csvRows.push(`Total Content,${data.overview.totalContent}`);
    csvRows.push(`Total SEO Analyses,${data.overview.totalSEOAnalyses}`);
    csvRows.push(`Total Citation Checks,${data.overview.totalCitationChecks}`);
    csvRows.push(`Average Content Score,${data.overview.avgContentScore}`);
    csvRows.push(`Average SEO Score,${data.overview.avgSEOScore}`);
    csvRows.push(`Average Citation Rate,${data.overview.avgCitationRate}`);
    
    // Add trend data
    csvRows.push(''); // Empty line separator
    csvRows.push('Date,Content Generated,SEO Analyses,Citation Checks,Avg SEO Score,Avg AI Score');
    
    data.trends.forEach((trend: any) => {
      csvRows.push(`${trend.date},${trend.contentGenerated},${trend.seoAnalyses},${trend.citationChecks},${trend.avgSeoScore},${trend.avgAiScore}`);
    });
    
    const csvContent = csvRows.join('\n');
    return new Blob([csvContent], { type: 'text/csv' });
  }

  // Convert data to Excel format (simplified - would need a proper Excel library)
  private convertToExcel(data: any): Blob {
    // This is a simplified implementation
    // In production, you'd use a library like ExcelJS or SheetJS
    const jsonString = JSON.stringify(data, null, 2);
    return new Blob([jsonString], { type: 'application/json' });
  }

  // Real-time analytics subscription
  async subscribeToRealTimeAnalytics(userId: string, callback: (data: any) => void) {
    return supabase
      .channel(`analytics_${userId}`)
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'content_blocks',
        filter: `user_id=eq.${userId}`
      }, callback)
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'citation_results',
        filter: `user_id=eq.${userId}`
      }, callback)
      .subscribe();
  }

  // Get real-time metrics
  async getRealTimeMetrics(userId: string) {
    try {
      const { data, error } = await supabase.functions.invoke('get-realtime-metrics', {
        body: JSON.stringify({ user_id: userId })
      });

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Real-time metrics error:', error);
      throw error;
    }
  }

  // Performance tracking
  async trackEvent(userId: string, event: string, properties: Record<string, any> = {}) {
    try {
      await supabase.functions.invoke('track-analytics-event', {
        body: JSON.stringify({
          user_id: userId,
          event,
          properties: {
            ...properties,
            timestamp: new Date().toISOString(),
            user_agent: navigator.userAgent,
            url: window.location.href
          }
        })
      });
    } catch (error) {
      console.error('Event tracking error:', error);
    }
  }

  // Clear cache
  clearCache(pattern?: string) {
    if (pattern) {
      for (const key of this.cache.keys()) {
        if (key.includes(pattern)) {
          this.cache.delete(key);
        }
      }
    } else {
      this.cache.clear();
    }
  }

  // Get cached data info
  getCacheInfo() {
    return {
      size: this.cache.size,
      keys: Array.from(this.cache.keys()),
      oldestEntry: Math.min(...Array.from(this.cache.values()).map(v => v.timestamp))
    };
  }
}

// Singleton instance
export const analyticsService = new AnalyticsService();

// Helper functions for analytics calculations
export const calculateGrowth = (current: number, previous: number): number => {
  if (previous === 0) return current > 0 ? 100 : 0;
  return Math.round(((current - previous) / previous) * 100);
};

export const calculateAverage = (values: number[]): number => {
  if (values.length === 0) return 0;
  return Math.round(values.reduce((a, b) => a + b, 0) / values.length);
};

export const formatMetric = (value: number, type: 'percentage' | 'number' | 'currency' = 'number'): string => {
  switch (type) {
    case 'percentage':
      return `${value}%`;
    case 'currency':
      return `$${value.toLocaleString()}`;
    default:
      return value.toLocaleString();
  }
};

export const getDateRange = (range: '7d' | '30d' | '90d' | '1y') => {
  const end = new Date();
  const start = new Date();
  
  switch (range) {
    case '7d':
      start.setDate(start.getDate() - 7);
      break;
    case '30d':
      start.setDate(start.getDate() - 30);
      break;
    case '90d':
      start.setDate(start.getDate() - 90);
      break;
    case '1y':
      start.setFullYear(start.getFullYear() - 1);
      break;
  }
  
  return { start, end };
};
