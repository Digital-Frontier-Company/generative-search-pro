-- Security and Performance Improvements Migration
-- Created: 2025-01-16
-- Purpose: Enhance database security, performance, and add comprehensive indexing

-- =============================================================================
-- SECURITY IMPROVEMENTS
-- =============================================================================

-- Enable Row Level Security on all user tables if not already enabled
ALTER TABLE IF EXISTS citation_checks ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS citation_monitoring ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS seo_analyses ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS content_blocks ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS subscribers ENABLE ROW LEVEL SECURITY;

-- Create comprehensive RLS policies for citation_checks
DROP POLICY IF EXISTS "Users can view own citation checks" ON citation_checks;
DROP POLICY IF EXISTS "Users can insert own citation checks" ON citation_checks;
DROP POLICY IF EXISTS "Users can update own citation checks" ON citation_checks;
DROP POLICY IF EXISTS "Users can delete own citation checks" ON citation_checks;

CREATE POLICY "citation_checks_select_policy" ON citation_checks
    FOR SELECT USING (
        auth.uid() = user_id OR 
        auth.jwt() ->> 'role' = 'service_role'
    );

CREATE POLICY "citation_checks_insert_policy" ON citation_checks
    FOR INSERT WITH CHECK (
        auth.uid() = user_id AND
        user_id IS NOT NULL
    );

CREATE POLICY "citation_checks_update_policy" ON citation_checks
    FOR UPDATE USING (
        auth.uid() = user_id
    ) WITH CHECK (
        auth.uid() = user_id AND
        user_id IS NOT NULL
    );

CREATE POLICY "citation_checks_delete_policy" ON citation_checks
    FOR DELETE USING (
        auth.uid() = user_id
    );

-- Create secure policies for seo_analyses
DROP POLICY IF EXISTS "Users can view own seo analyses" ON seo_analyses;
DROP POLICY IF EXISTS "Users can insert own seo analyses" ON seo_analyses;

CREATE POLICY "seo_analyses_select_policy" ON seo_analyses
    FOR SELECT USING (
        auth.uid() = user_id OR 
        auth.jwt() ->> 'role' = 'service_role'
    );

CREATE POLICY "seo_analyses_insert_policy" ON seo_analyses
    FOR INSERT WITH CHECK (
        auth.uid() = user_id AND
        user_id IS NOT NULL
    );

-- Secure subscribers table
DROP POLICY IF EXISTS "Users can view own subscription" ON subscribers;
DROP POLICY IF EXISTS "Users can update own subscription" ON subscribers;

CREATE POLICY "subscribers_select_policy" ON subscribers
    FOR SELECT USING (
        auth.uid() = user_id OR 
        auth.jwt() ->> 'role' = 'service_role'
    );

CREATE POLICY "subscribers_update_policy" ON subscribers
    FOR UPDATE USING (
        auth.uid() = user_id
    ) WITH CHECK (
        auth.uid() = user_id
    );

-- =============================================================================
-- PERFORMANCE IMPROVEMENTS - INDEXING
-- =============================================================================

-- Citation checks performance indexes
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_citation_checks_user_created 
    ON citation_checks(user_id, created_at DESC);

CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_citation_checks_domain_query 
    ON citation_checks(domain, query);

CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_citation_checks_cited_status 
    ON citation_checks(is_cited, checked_at DESC);

CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_citation_checks_confidence_score 
    ON citation_checks(confidence_score DESC) 
    WHERE confidence_score IS NOT NULL;

CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_citation_checks_query_complexity 
    ON citation_checks(query_complexity, checked_at DESC);

-- Citation monitoring performance indexes
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_citation_monitoring_user_active 
    ON citation_monitoring(user_id, is_active) 
    WHERE is_active = true;

CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_citation_monitoring_frequency_check 
    ON citation_monitoring(check_frequency, last_checked_at) 
    WHERE is_active = true;

CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_citation_monitoring_domain 
    ON citation_monitoring(domain, is_active);

-- SEO analyses performance indexes
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_seo_analyses_user_created 
    ON seo_analyses(user_id, created_at DESC);

CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_seo_analyses_domain 
    ON seo_analyses(domain, created_at DESC);

CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_seo_analyses_total_score 
    ON seo_analyses(total_score DESC) 
    WHERE total_score IS NOT NULL;

-- Content blocks performance indexes
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_content_blocks_user_created 
    ON content_blocks(user_id, created_at DESC);

CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_content_blocks_type 
    ON content_blocks(content_type, created_at DESC);

-- Subscribers performance indexes
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_subscribers_email_unique 
    ON subscribers(email) 
    WHERE email IS NOT NULL;

CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_subscribers_user_subscribed 
    ON subscribers(user_id, subscribed) 
    WHERE subscribed = true;

CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_subscribers_stripe_customer 
    ON subscribers(stripe_customer_id) 
    WHERE stripe_customer_id IS NOT NULL;

-- =============================================================================
-- QUERY OPTIMIZATION FUNCTIONS
-- =============================================================================

-- Function to get user citation statistics with optimized query
CREATE OR REPLACE FUNCTION get_user_citation_stats(target_user_id UUID)
RETURNS TABLE (
    total_checks BIGINT,
    successful_citations BIGINT,
    success_rate NUMERIC,
    avg_confidence NUMERIC,
    unique_domains BIGINT,
    recent_checks BIGINT
) 
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
    RETURN QUERY
    WITH user_stats AS (
        SELECT 
            COUNT(*) as total,
            COUNT(*) FILTER (WHERE is_cited = true) as cited,
            AVG(confidence_score) as avg_conf,
            COUNT(DISTINCT domain) as domains,
            COUNT(*) FILTER (WHERE checked_at > NOW() - INTERVAL '7 days') as recent
        FROM citation_checks 
        WHERE user_id = target_user_id
    )
    SELECT 
        total,
        cited,
        CASE 
            WHEN total > 0 THEN ROUND((cited::NUMERIC / total::NUMERIC) * 100, 2)
            ELSE 0
        END,
        ROUND(avg_conf, 2),
        domains,
        recent
    FROM user_stats;
END;
$$;

-- Function to get trending queries with performance optimization
CREATE OR REPLACE FUNCTION get_trending_queries(days_back INTEGER DEFAULT 7, limit_count INTEGER DEFAULT 10)
RETURNS TABLE (
    query TEXT,
    check_count BIGINT,
    success_rate NUMERIC,
    avg_confidence NUMERIC
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
    RETURN QUERY
    SELECT 
        cc.query,
        COUNT(*) as check_count,
        ROUND((COUNT(*) FILTER (WHERE cc.is_cited = true)::NUMERIC / COUNT(*)::NUMERIC) * 100, 2) as success_rate,
        ROUND(AVG(cc.confidence_score), 2) as avg_confidence
    FROM citation_checks cc
    WHERE cc.checked_at > NOW() - INTERVAL '1 day' * days_back
    GROUP BY cc.query
    HAVING COUNT(*) >= 2
    ORDER BY check_count DESC, success_rate DESC
    LIMIT limit_count;
END;
$$;

-- =============================================================================
-- SECURITY FUNCTIONS
-- =============================================================================

-- Function to validate and sanitize domain input
CREATE OR REPLACE FUNCTION validate_domain(input_domain TEXT)
RETURNS TEXT
LANGUAGE plpgsql
IMMUTABLE
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
    -- Remove protocol and www
    input_domain := LOWER(TRIM(input_domain));
    input_domain := REGEXP_REPLACE(input_domain, '^https?://', '', 'i');
    input_domain := REGEXP_REPLACE(input_domain, '^www\.', '', 'i');
    input_domain := REGEXP_REPLACE(input_domain, '/.*$', '');
    
    -- Validate domain format
    IF NOT input_domain ~ '^[a-z0-9]([a-z0-9-]{0,61}[a-z0-9])?(\.[a-z0-9]([a-z0-9-]{0,61}[a-z0-9])?)*$' THEN
        RAISE EXCEPTION 'Invalid domain format: %', input_domain;
    END IF;
    
    -- Check length
    IF LENGTH(input_domain) > 255 THEN
        RAISE EXCEPTION 'Domain too long: %', input_domain;
    END IF;
    
    RETURN input_domain;
END;
$$;

-- Function to validate query input
CREATE OR REPLACE FUNCTION validate_query(input_query TEXT)
RETURNS TEXT
LANGUAGE plpgsql
IMMUTABLE
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
    -- Trim and validate
    input_query := TRIM(input_query);
    
    IF LENGTH(input_query) = 0 THEN
        RAISE EXCEPTION 'Query cannot be empty';
    END IF;
    
    IF LENGTH(input_query) > 500 THEN
        RAISE EXCEPTION 'Query too long (max 500 characters)';
    END IF;
    
    -- Remove potentially harmful content
    input_query := REGEXP_REPLACE(input_query, '<[^>]*>', '', 'g');
    input_query := REGEXP_REPLACE(input_query, 'javascript:', '', 'gi');
    
    RETURN input_query;
END;
$$;

-- =============================================================================
-- PERFORMANCE MONITORING
-- =============================================================================

-- Create performance monitoring table
CREATE TABLE IF NOT EXISTS performance_metrics (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    operation_name TEXT NOT NULL,
    duration_ms NUMERIC NOT NULL,
    success BOOLEAN NOT NULL DEFAULT true,
    error_message TEXT,
    metadata JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Index for performance metrics
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_performance_metrics_operation_created 
    ON performance_metrics(operation_name, created_at DESC);

CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_performance_metrics_duration 
    ON performance_metrics(duration_ms DESC);

-- Function to record performance metrics
CREATE OR REPLACE FUNCTION record_performance_metric(
    operation_name TEXT,
    duration_ms NUMERIC,
    success BOOLEAN DEFAULT true,
    error_message TEXT DEFAULT NULL,
    metadata JSONB DEFAULT '{}'::jsonb
)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
    INSERT INTO performance_metrics (operation_name, duration_ms, success, error_message, metadata)
    VALUES (operation_name, duration_ms, success, error_message, metadata);
    
    -- Clean up old metrics (keep only last 30 days)
    DELETE FROM performance_metrics 
    WHERE created_at < NOW() - INTERVAL '30 days';
END;
$$;

-- =============================================================================
-- CACHE MANAGEMENT
-- =============================================================================

-- Create cache table for frequently accessed data
CREATE TABLE IF NOT EXISTS cache_entries (
    cache_key TEXT PRIMARY KEY,
    data JSONB NOT NULL,
    expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Index for cache cleanup
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_cache_entries_expires 
    ON cache_entries(expires_at);

-- Function to get cached data
CREATE OR REPLACE FUNCTION get_cached_data(key TEXT)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    result JSONB;
BEGIN
    SELECT data INTO result
    FROM cache_entries
    WHERE cache_key = key AND expires_at > NOW();
    
    RETURN result;
END;
$$;

-- Function to set cached data
CREATE OR REPLACE FUNCTION set_cached_data(key TEXT, data JSONB, ttl_seconds INTEGER DEFAULT 300)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
    INSERT INTO cache_entries (cache_key, data, expires_at)
    VALUES (key, data, NOW() + INTERVAL '1 second' * ttl_seconds)
    ON CONFLICT (cache_key) 
    DO UPDATE SET 
        data = EXCLUDED.data,
        expires_at = EXCLUDED.expires_at,
        created_at = NOW();
END;
$$;

-- Function to clean expired cache entries
CREATE OR REPLACE FUNCTION cleanup_expired_cache()
RETURNS INTEGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    deleted_count INTEGER;
BEGIN
    DELETE FROM cache_entries WHERE expires_at <= NOW();
    GET DIAGNOSTICS deleted_count = ROW_COUNT;
    RETURN deleted_count;
END;
$$;

-- =============================================================================
-- AUTOMATED CLEANUP PROCEDURES
-- =============================================================================

-- Create a cleanup function that runs periodically
CREATE OR REPLACE FUNCTION automated_cleanup()
RETURNS TEXT
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    cleanup_report TEXT := '';
    cache_cleaned INTEGER;
    old_citations INTEGER;
    old_analyses INTEGER;
BEGIN
    -- Clean expired cache
    SELECT cleanup_expired_cache() INTO cache_cleaned;
    cleanup_report := cleanup_report || 'Cleaned ' || cache_cleaned || ' expired cache entries. ';
    
    -- Clean old citation checks (keep last 90 days)
    DELETE FROM citation_checks WHERE checked_at < NOW() - INTERVAL '90 days';
    GET DIAGNOSTICS old_citations = ROW_COUNT;
    cleanup_report := cleanup_report || 'Removed ' || old_citations || ' old citation checks. ';
    
    -- Clean old SEO analyses (keep last 60 days)
    DELETE FROM seo_analyses WHERE created_at < NOW() - INTERVAL '60 days';
    GET DIAGNOSTICS old_analyses = ROW_COUNT;
    cleanup_report := cleanup_report || 'Removed ' || old_analyses || ' old SEO analyses. ';
    
    -- Update statistics
    ANALYZE citation_checks;
    ANALYZE citation_monitoring;
    ANALYZE seo_analyses;
    ANALYZE cache_entries;
    
    cleanup_report := cleanup_report || 'Updated table statistics.';
    
    RETURN cleanup_report;
END;
$$;

-- =============================================================================
-- GRANTS AND PERMISSIONS
-- =============================================================================

-- Grant necessary permissions to authenticated users
GRANT USAGE ON SCHEMA public TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON citation_checks TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON citation_monitoring TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON seo_analyses TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON content_blocks TO authenticated;
GRANT SELECT, UPDATE ON subscribers TO authenticated;

-- Grant execute permissions on functions
GRANT EXECUTE ON FUNCTION get_user_citation_stats(UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION get_trending_queries(INTEGER, INTEGER) TO authenticated;
GRANT EXECUTE ON FUNCTION validate_domain(TEXT) TO authenticated;
GRANT EXECUTE ON FUNCTION validate_query(TEXT) TO authenticated;
GRANT EXECUTE ON FUNCTION get_cached_data(TEXT) TO authenticated;
GRANT EXECUTE ON FUNCTION set_cached_data(TEXT, JSONB, INTEGER) TO authenticated;

-- Service role permissions
GRANT ALL ON ALL TABLES IN SCHEMA public TO service_role;
GRANT ALL ON ALL FUNCTIONS IN SCHEMA public TO service_role;

-- =============================================================================
-- COMMENTS AND DOCUMENTATION
-- =============================================================================

COMMENT ON TABLE performance_metrics IS 'Stores performance monitoring data for Edge Functions';
COMMENT ON TABLE cache_entries IS 'Application-level cache for frequently accessed data';

COMMENT ON FUNCTION get_user_citation_stats(UUID) IS 'Returns comprehensive citation statistics for a user';
COMMENT ON FUNCTION get_trending_queries(INTEGER, INTEGER) IS 'Returns trending search queries with performance metrics';
COMMENT ON FUNCTION validate_domain(TEXT) IS 'Validates and sanitizes domain input';
COMMENT ON FUNCTION validate_query(TEXT) IS 'Validates and sanitizes search query input';
COMMENT ON FUNCTION automated_cleanup() IS 'Performs automated database cleanup and maintenance';

-- =============================================================================
-- FINAL OPTIMIZATIONS
-- =============================================================================

-- Update table statistics for better query planning
ANALYZE citation_checks;
ANALYZE citation_monitoring;
ANALYZE seo_analyses;
ANALYZE content_blocks;
ANALYZE subscribers;

-- Set up automatic statistics collection
ALTER TABLE citation_checks SET (autovacuum_analyze_scale_factor = 0.05);
ALTER TABLE citation_monitoring SET (autovacuum_analyze_scale_factor = 0.1);
ALTER TABLE seo_analyses SET (autovacuum_analyze_scale_factor = 0.1);

COMMIT; 