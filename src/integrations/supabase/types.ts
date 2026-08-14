export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "12.2.3 (519615d)"
  }
  public: {
    Tables: {
      account_members: {
        Row: {
          account_id: string
          created_at: string
          role: string
          user_id: string
        }
        Insert: {
          account_id: string
          created_at?: string
          role?: string
          user_id: string
        }
        Update: {
          account_id?: string
          created_at?: string
          role?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "account_members_account_id_fkey"
            columns: ["account_id"]
            isOneToOne: false
            referencedRelation: "accounts"
            referencedColumns: ["id"]
          },
        ]
      }
      accounts: {
        Row: {
          created_at: string
          id: string
          name: string
        }
        Insert: {
          created_at?: string
          id?: string
          name: string
        }
        Update: {
          created_at?: string
          id?: string
          name?: string
        }
        Relationships: []
      }
      ai_platform_citations: {
        Row: {
          average_confidence: number | null
          average_score: number | null
          created_at: string
          domain: string
          id: string
          platforms: Json | null
          query: string
          results: Json | null
          search_method: string | null
          total_citations: number | null
          updated_at: string
          user_id: string
        }
        Insert: {
          average_confidence?: number | null
          average_score?: number | null
          created_at?: string
          domain: string
          id?: string
          platforms?: Json | null
          query: string
          results?: Json | null
          search_method?: string | null
          total_citations?: number | null
          updated_at?: string
          user_id: string
        }
        Update: {
          average_confidence?: number | null
          average_score?: number | null
          created_at?: string
          domain?: string
          id?: string
          platforms?: Json | null
          query?: string
          results?: Json | null
          search_method?: string | null
          total_citations?: number | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      ai_sitemaps: {
        Row: {
          domain: string
          email: string | null
          generated_at: string | null
          id: number
          page_count: number | null
          sitemap_data: Json | null
          user_id: string | null
        }
        Insert: {
          domain: string
          email?: string | null
          generated_at?: string | null
          id?: number
          page_count?: number | null
          sitemap_data?: Json | null
          user_id?: string | null
        }
        Update: {
          domain?: string
          email?: string | null
          generated_at?: string | null
          id?: number
          page_count?: number | null
          sitemap_data?: Json | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "ai_sitemaps_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "admin_user_credits"
            referencedColumns: ["user_id"]
          },
        ]
      }
      analytics_events: {
        Row: {
          created_at: string
          event: string
          id: string
          properties: Json
          user_id: string
        }
        Insert: {
          created_at?: string
          event: string
          id?: string
          properties?: Json
          user_id: string
        }
        Update: {
          created_at?: string
          event?: string
          id?: string
          properties?: Json
          user_id?: string
        }
        Relationships: []
      }
      brands: {
        Row: {
          account_id: string
          aliases: string[]
          category_id: string | null
          created_at: string
          domain: string | null
          id: string
          is_client: boolean
          name: string
        }
        Insert: {
          account_id: string
          aliases?: string[]
          category_id?: string | null
          created_at?: string
          domain?: string | null
          id?: string
          is_client?: boolean
          name: string
        }
        Update: {
          account_id?: string
          aliases?: string[]
          category_id?: string | null
          created_at?: string
          domain?: string | null
          id?: string
          is_client?: boolean
          name?: string
        }
        Relationships: [
          {
            foreignKeyName: "brands_account_id_fkey"
            columns: ["account_id"]
            isOneToOne: false
            referencedRelation: "accounts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "brands_category_id_fkey"
            columns: ["category_id"]
            isOneToOne: false
            referencedRelation: "categories"
            referencedColumns: ["id"]
          },
        ]
      }
      categories: {
        Row: {
          account_id: string
          created_at: string
          description: string | null
          id: string
          name: string
        }
        Insert: {
          account_id: string
          created_at?: string
          description?: string | null
          id?: string
          name: string
        }
        Update: {
          account_id?: string
          created_at?: string
          description?: string | null
          id?: string
          name?: string
        }
        Relationships: [
          {
            foreignKeyName: "categories_account_id_fkey"
            columns: ["account_id"]
            isOneToOne: false
            referencedRelation: "accounts"
            referencedColumns: ["id"]
          },
        ]
      }
      citation_checks: {
        Row: {
          ai_answer: string | null
          checked_at: string | null
          citation_position: number | null
          cited_sources: Json | null
          competitor_analysis: Json | null
          competitors_found: Json | null
          confidence_score: number | null
          domain: string
          email: string | null
          engine: string | null
          id: number
          improvement_areas: Json | null
          is_cited: boolean | null
          query: string
          query_complexity: string | null
          recommendations: string | null
          total_sources: number | null
          user_id: string | null
        }
        Insert: {
          ai_answer?: string | null
          checked_at?: string | null
          citation_position?: number | null
          cited_sources?: Json | null
          competitor_analysis?: Json | null
          competitors_found?: Json | null
          confidence_score?: number | null
          domain: string
          email?: string | null
          engine?: string | null
          id?: number
          improvement_areas?: Json | null
          is_cited?: boolean | null
          query: string
          query_complexity?: string | null
          recommendations?: string | null
          total_sources?: number | null
          user_id?: string | null
        }
        Update: {
          ai_answer?: string | null
          checked_at?: string | null
          citation_position?: number | null
          cited_sources?: Json | null
          competitor_analysis?: Json | null
          competitors_found?: Json | null
          confidence_score?: number | null
          domain?: string
          email?: string | null
          engine?: string | null
          id?: number
          improvement_areas?: Json | null
          is_cited?: boolean | null
          query?: string
          query_complexity?: string | null
          recommendations?: string | null
          total_sources?: number | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "citation_checks_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "admin_user_credits"
            referencedColumns: ["user_id"]
          },
        ]
      }
      citations: {
        Row: {
          anchor_context: string | null
          created_at: string
          domain: string
          id: string
          rank: number | null
          run_id: string
          source_id: string | null
          url: string
        }
        Insert: {
          anchor_context?: string | null
          created_at?: string
          domain: string
          id?: string
          rank?: number | null
          run_id: string
          source_id?: string | null
          url: string
        }
        Update: {
          anchor_context?: string | null
          created_at?: string
          domain?: string
          id?: string
          rank?: number | null
          run_id?: string
          source_id?: string | null
          url?: string
        }
        Relationships: [
          {
            foreignKeyName: "citations_run_id_fkey"
            columns: ["run_id"]
            isOneToOne: false
            referencedRelation: "runs"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "citations_source_id_fkey"
            columns: ["source_id"]
            isOneToOne: false
            referencedRelation: "sources"
            referencedColumns: ["id"]
          },
        ]
      }
      competitor_analyses: {
        Row: {
          analysis_queries: Json | null
          backlink_gaps: Json | null
          competitor_analyses: Json | null
          competitor_domains: Json | null
          content_gaps: Json | null
          created_at: string
          gap_opportunities: Json | null
          id: string
          keyword_gaps: Json | null
          performance_comparison: Json | null
          recommendations: Json | null
          updated_at: string
          user_domain: string
          user_id: string
        }
        Insert: {
          analysis_queries?: Json | null
          backlink_gaps?: Json | null
          competitor_analyses?: Json | null
          competitor_domains?: Json | null
          content_gaps?: Json | null
          created_at?: string
          gap_opportunities?: Json | null
          id?: string
          keyword_gaps?: Json | null
          performance_comparison?: Json | null
          recommendations?: Json | null
          updated_at?: string
          user_domain: string
          user_id: string
        }
        Update: {
          analysis_queries?: Json | null
          backlink_gaps?: Json | null
          competitor_analyses?: Json | null
          competitor_domains?: Json | null
          content_gaps?: Json | null
          created_at?: string
          gap_opportunities?: Json | null
          id?: string
          keyword_gaps?: Json | null
          performance_comparison?: Json | null
          recommendations?: Json | null
          updated_at?: string
          user_domain?: string
          user_id?: string
        }
        Relationships: []
      }
      compliance_checks: {
        Row: {
          ai_policy_status: string | null
          checked_at: string | null
          compliance_score: number | null
          domain: string
          id: number
          meta_tags_status: string | null
          recommendations: Json | null
          robots_txt_status: string | null
          user_id: string | null
        }
        Insert: {
          ai_policy_status?: string | null
          checked_at?: string | null
          compliance_score?: number | null
          domain: string
          id?: number
          meta_tags_status?: string | null
          recommendations?: Json | null
          robots_txt_status?: string | null
          user_id?: string | null
        }
        Update: {
          ai_policy_status?: string | null
          checked_at?: string | null
          compliance_score?: number | null
          domain?: string
          id?: number
          meta_tags_status?: string | null
          recommendations?: Json | null
          robots_txt_status?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "compliance_checks_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "admin_user_credits"
            referencedColumns: ["user_id"]
          },
        ]
      }
      content_blocks: {
        Row: {
          content: string | null
          created_at: string | null
          generated_at: string | null
          hero_answer: string | null
          id: number
          metadata: Json | null
          title: string
          user_id: string | null
        }
        Insert: {
          content?: string | null
          created_at?: string | null
          generated_at?: string | null
          hero_answer?: string | null
          id?: number
          metadata?: Json | null
          title: string
          user_id?: string | null
        }
        Update: {
          content?: string | null
          created_at?: string | null
          generated_at?: string | null
          hero_answer?: string | null
          id?: number
          metadata?: Json | null
          title?: string
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "content_blocks_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "admin_user_credits"
            referencedColumns: ["user_id"]
          },
        ]
      }
      documents: {
        Row: {
          content: string | null
          email: string | null
          id: number
          metadata: Json | null
          user_id: string | null
        }
        Insert: {
          content?: string | null
          email?: string | null
          id?: number
          metadata?: Json | null
          user_id?: string | null
        }
        Update: {
          content?: string | null
          email?: string | null
          id?: number
          metadata?: Json | null
          user_id?: string | null
        }
        Relationships: []
      }
      harness_alerts: {
        Row: {
          detected_at: string
          id: string
          message: string
          panel_id: string | null
          resolved_at: string | null
          severity: string
        }
        Insert: {
          detected_at?: string
          id?: string
          message: string
          panel_id?: string | null
          resolved_at?: string | null
          severity: string
        }
        Update: {
          detected_at?: string
          id?: string
          message?: string
          panel_id?: string | null
          resolved_at?: string | null
          severity?: string
        }
        Relationships: [
          {
            foreignKeyName: "harness_alerts_panel_id_fkey"
            columns: ["panel_id"]
            isOneToOne: false
            referencedRelation: "prompt_panels"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "harness_alerts_panel_id_fkey"
            columns: ["panel_id"]
            isOneToOne: false
            referencedRelation: "v_answer_share_daily"
            referencedColumns: ["panel_id"]
          },
        ]
      }
      interventions: {
        Row: {
          account_id: string
          brand_id: string
          created_at: string
          description: string
          expected_lag_days: number
          id: string
          shipped_at: string
          source_id: string | null
          target_url: string | null
          type: string
        }
        Insert: {
          account_id: string
          brand_id: string
          created_at?: string
          description: string
          expected_lag_days?: number
          id?: string
          shipped_at: string
          source_id?: string | null
          target_url?: string | null
          type: string
        }
        Update: {
          account_id?: string
          brand_id?: string
          created_at?: string
          description?: string
          expected_lag_days?: number
          id?: string
          shipped_at?: string
          source_id?: string | null
          target_url?: string | null
          type?: string
        }
        Relationships: [
          {
            foreignKeyName: "interventions_account_id_fkey"
            columns: ["account_id"]
            isOneToOne: false
            referencedRelation: "accounts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "interventions_brand_id_fkey"
            columns: ["brand_id"]
            isOneToOne: false
            referencedRelation: "brands"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "interventions_brand_id_fkey"
            columns: ["brand_id"]
            isOneToOne: false
            referencedRelation: "v_answer_share_daily"
            referencedColumns: ["brand_id"]
          },
          {
            foreignKeyName: "interventions_source_id_fkey"
            columns: ["source_id"]
            isOneToOne: false
            referencedRelation: "sources"
            referencedColumns: ["id"]
          },
        ]
      }
      mentions: {
        Row: {
          brand_id: string
          created_at: string
          id: string
          is_endorsed: boolean
          position: number | null
          run_id: string
          sentiment: string | null
          verbatim: string | null
        }
        Insert: {
          brand_id: string
          created_at?: string
          id?: string
          is_endorsed?: boolean
          position?: number | null
          run_id: string
          sentiment?: string | null
          verbatim?: string | null
        }
        Update: {
          brand_id?: string
          created_at?: string
          id?: string
          is_endorsed?: boolean
          position?: number | null
          run_id?: string
          sentiment?: string | null
          verbatim?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "mentions_brand_id_fkey"
            columns: ["brand_id"]
            isOneToOne: false
            referencedRelation: "brands"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "mentions_brand_id_fkey"
            columns: ["brand_id"]
            isOneToOne: false
            referencedRelation: "v_answer_share_daily"
            referencedColumns: ["brand_id"]
          },
          {
            foreignKeyName: "mentions_run_id_fkey"
            columns: ["run_id"]
            isOneToOne: false
            referencedRelation: "runs"
            referencedColumns: ["id"]
          },
        ]
      }
      methodology_config: {
        Row: {
          key: string
          rationale: string | null
          value: number
        }
        Insert: {
          key: string
          rationale?: string | null
          value: number
        }
        Update: {
          key?: string
          rationale?: string | null
          value?: number
        }
        Relationships: []
      }
      nods_page: {
        Row: {
          checksum: string | null
          email: string | null
          id: number
          meta: Json | null
          parent_page_id: number | null
          path: string
          source: string | null
          type: string | null
          user_id: string | null
        }
        Insert: {
          checksum?: string | null
          email?: string | null
          id?: number
          meta?: Json | null
          parent_page_id?: number | null
          path: string
          source?: string | null
          type?: string | null
          user_id?: string | null
        }
        Update: {
          checksum?: string | null
          email?: string | null
          id?: number
          meta?: Json | null
          parent_page_id?: number | null
          path?: string
          source?: string | null
          type?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "nods_page_parent_page_id_fkey"
            columns: ["parent_page_id"]
            isOneToOne: false
            referencedRelation: "nods_page"
            referencedColumns: ["id"]
          },
        ]
      }
      nods_page_section: {
        Row: {
          content: string | null
          heading: string | null
          id: number
          page_id: number
          slug: string | null
          token_count: number | null
          user_id: string | null
        }
        Insert: {
          content?: string | null
          heading?: string | null
          id?: number
          page_id: number
          slug?: string | null
          token_count?: number | null
          user_id?: string | null
        }
        Update: {
          content?: string | null
          heading?: string | null
          id?: number
          page_id?: number
          slug?: string | null
          token_count?: number | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "nods_page_section_page_id_fkey"
            columns: ["page_id"]
            isOneToOne: false
            referencedRelation: "nods_page"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "nods_page_section_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "admin_user_credits"
            referencedColumns: ["user_id"]
          },
        ]
      }
      opportunity_scans: {
        Row: {
          created_at: string
          domain: string
          high_potential_count: number | null
          id: string
          low_potential_count: number | null
          medium_potential_count: number | null
          opportunities: Json | null
          scan_type: string | null
          total_opportunities: number | null
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          domain: string
          high_potential_count?: number | null
          id?: string
          low_potential_count?: number | null
          medium_potential_count?: number | null
          opportunities?: Json | null
          scan_type?: string | null
          total_opportunities?: number | null
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          domain?: string
          high_potential_count?: number | null
          id?: string
          low_potential_count?: number | null
          medium_potential_count?: number | null
          opportunities?: Json | null
          scan_type?: string | null
          total_opportunities?: number | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      profiles: {
        Row: {
          avatar_url: string | null
          created_at: string | null
          default_domain: string | null
          email: string | null
          full_name: string | null
          id: string
          preferences: Json | null
          updated_at: string | null
          user_id: string | null
        }
        Insert: {
          avatar_url?: string | null
          created_at?: string | null
          default_domain?: string | null
          email?: string | null
          full_name?: string | null
          id: string
          preferences?: Json | null
          updated_at?: string | null
          user_id?: string | null
        }
        Update: {
          avatar_url?: string | null
          created_at?: string | null
          default_domain?: string | null
          email?: string | null
          full_name?: string | null
          id?: string
          preferences?: Json | null
          updated_at?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "profiles_id_fkey"
            columns: ["id"]
            isOneToOne: true
            referencedRelation: "admin_user_credits"
            referencedColumns: ["user_id"]
          },
        ]
      }
      prompt_panels: {
        Row: {
          account_id: string
          brand_id: string
          generated_at: string
          id: string
          rationale: string | null
          status: string
          version: number
        }
        Insert: {
          account_id: string
          brand_id: string
          generated_at?: string
          id?: string
          rationale?: string | null
          status?: string
          version?: number
        }
        Update: {
          account_id?: string
          brand_id?: string
          generated_at?: string
          id?: string
          rationale?: string | null
          status?: string
          version?: number
        }
        Relationships: [
          {
            foreignKeyName: "prompt_panels_account_id_fkey"
            columns: ["account_id"]
            isOneToOne: false
            referencedRelation: "accounts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "prompt_panels_brand_id_fkey"
            columns: ["brand_id"]
            isOneToOne: false
            referencedRelation: "brands"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "prompt_panels_brand_id_fkey"
            columns: ["brand_id"]
            isOneToOne: false
            referencedRelation: "v_answer_share_daily"
            referencedColumns: ["brand_id"]
          },
        ]
      }
      prompts: {
        Row: {
          created_at: string
          id: string
          intent_stage: string
          is_active: boolean
          panel_id: string
          prompt_class: string
          tags: string[]
          text: string
        }
        Insert: {
          created_at?: string
          id?: string
          intent_stage: string
          is_active?: boolean
          panel_id: string
          prompt_class: string
          tags?: string[]
          text: string
        }
        Update: {
          created_at?: string
          id?: string
          intent_stage?: string
          is_active?: boolean
          panel_id?: string
          prompt_class?: string
          tags?: string[]
          text?: string
        }
        Relationships: [
          {
            foreignKeyName: "prompts_panel_id_fkey"
            columns: ["panel_id"]
            isOneToOne: false
            referencedRelation: "prompt_panels"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "prompts_panel_id_fkey"
            columns: ["panel_id"]
            isOneToOne: false
            referencedRelation: "v_answer_share_daily"
            referencedColumns: ["panel_id"]
          },
        ]
      }
      runs: {
        Row: {
          cost_usd: number | null
          error_message: string | null
          id: string
          latency_ms: number | null
          model: string
          output_tokens: number | null
          prompt_id: string
          prompt_tokens: number | null
          provider: string
          raw_response: string | null
          replicate_idx: number
          response_json: Json | null
          run_at: string
          run_date: string | null
          status: string
        }
        Insert: {
          cost_usd?: number | null
          error_message?: string | null
          id?: string
          latency_ms?: number | null
          model: string
          output_tokens?: number | null
          prompt_id: string
          prompt_tokens?: number | null
          provider: string
          raw_response?: string | null
          replicate_idx?: number
          response_json?: Json | null
          run_at?: string
          run_date?: string | null
          status?: string
        }
        Update: {
          cost_usd?: number | null
          error_message?: string | null
          id?: string
          latency_ms?: number | null
          model?: string
          output_tokens?: number | null
          prompt_id?: string
          prompt_tokens?: number | null
          provider?: string
          raw_response?: string | null
          replicate_idx?: number
          response_json?: Json | null
          run_at?: string
          run_date?: string | null
          status?: string
        }
        Relationships: [
          {
            foreignKeyName: "runs_prompt_id_fkey"
            columns: ["prompt_id"]
            isOneToOne: false
            referencedRelation: "prompts"
            referencedColumns: ["id"]
          },
        ]
      }
      schema_analyses: {
        Row: {
          ai_visibility_score: number | null
          created_at: string | null
          existing_schema: Json | null
          id: number
          status: string | null
          suggested_patches: Json | null
          updated_at: string | null
          url: string
          user_id: string | null
        }
        Insert: {
          ai_visibility_score?: number | null
          created_at?: string | null
          existing_schema?: Json | null
          id?: number
          status?: string | null
          suggested_patches?: Json | null
          updated_at?: string | null
          url: string
          user_id?: string | null
        }
        Update: {
          ai_visibility_score?: number | null
          created_at?: string | null
          existing_schema?: Json | null
          id?: number
          status?: string | null
          suggested_patches?: Json | null
          updated_at?: string | null
          url?: string
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "schema_analyses_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "admin_user_credits"
            referencedColumns: ["user_id"]
          },
        ]
      }
      scores_daily: {
        Row: {
          answer_share: number
          brand_id: string
          ci_high: number
          ci_low: number
          computed_at: string
          date: string
          is_reliable: boolean
          model: string
          n_mentions: number
          n_runs: number
          panel_id: string
          prompt_class: string
        }
        Insert: {
          answer_share: number
          brand_id: string
          ci_high: number
          ci_low: number
          computed_at?: string
          date: string
          is_reliable?: boolean
          model: string
          n_mentions: number
          n_runs: number
          panel_id: string
          prompt_class: string
        }
        Update: {
          answer_share?: number
          brand_id?: string
          ci_high?: number
          ci_low?: number
          computed_at?: string
          date?: string
          is_reliable?: boolean
          model?: string
          n_mentions?: number
          n_runs?: number
          panel_id?: string
          prompt_class?: string
        }
        Relationships: [
          {
            foreignKeyName: "scores_daily_brand_id_fkey"
            columns: ["brand_id"]
            isOneToOne: false
            referencedRelation: "brands"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "scores_daily_brand_id_fkey"
            columns: ["brand_id"]
            isOneToOne: false
            referencedRelation: "v_answer_share_daily"
            referencedColumns: ["brand_id"]
          },
          {
            foreignKeyName: "scores_daily_panel_id_fkey"
            columns: ["panel_id"]
            isOneToOne: false
            referencedRelation: "prompt_panels"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "scores_daily_panel_id_fkey"
            columns: ["panel_id"]
            isOneToOne: false
            referencedRelation: "v_answer_share_daily"
            referencedColumns: ["panel_id"]
          },
        ]
      }
      seo_analyses: {
        Row: {
          accessibility_score: number | null
          ai_optimization_score: number | null
          analysis_data: Json | null
          backlink_score: number | null
          cache_key: string | null
          competitor_comparison: Json | null
          created_at: string | null
          dashboard_content: string | null
          dashboard_generated_at: string | null
          domain: string
          heading_structure: Json | null
          id: string
          meta_description: Json | null
          performance_score: number | null
          recommendations: Json | null
          schema_count: number | null
          status: string | null
          technical_score: number | null
          total_score: number | null
          updated_at: string | null
          user_id: string | null
        }
        Insert: {
          accessibility_score?: number | null
          ai_optimization_score?: number | null
          analysis_data?: Json | null
          backlink_score?: number | null
          cache_key?: string | null
          competitor_comparison?: Json | null
          created_at?: string | null
          dashboard_content?: string | null
          dashboard_generated_at?: string | null
          domain: string
          heading_structure?: Json | null
          id?: string
          meta_description?: Json | null
          performance_score?: number | null
          recommendations?: Json | null
          schema_count?: number | null
          status?: string | null
          technical_score?: number | null
          total_score?: number | null
          updated_at?: string | null
          user_id?: string | null
        }
        Update: {
          accessibility_score?: number | null
          ai_optimization_score?: number | null
          analysis_data?: Json | null
          backlink_score?: number | null
          cache_key?: string | null
          competitor_comparison?: Json | null
          created_at?: string | null
          dashboard_content?: string | null
          dashboard_generated_at?: string | null
          domain?: string
          heading_structure?: Json | null
          id?: string
          meta_description?: Json | null
          performance_score?: number | null
          recommendations?: Json | null
          schema_count?: number | null
          status?: string | null
          technical_score?: number | null
          total_score?: number | null
          updated_at?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "seo_analyses_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "admin_user_credits"
            referencedColumns: ["user_id"]
          },
        ]
      }
      sources: {
        Row: {
          accessibility: string | null
          account_id: string
          category_id: string | null
          created_at: string
          domain: string
          id: string
          notes: string | null
          source_type: string | null
        }
        Insert: {
          accessibility?: string | null
          account_id: string
          category_id?: string | null
          created_at?: string
          domain: string
          id?: string
          notes?: string | null
          source_type?: string | null
        }
        Update: {
          accessibility?: string | null
          account_id?: string
          category_id?: string | null
          created_at?: string
          domain?: string
          id?: string
          notes?: string | null
          source_type?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "sources_account_id_fkey"
            columns: ["account_id"]
            isOneToOne: false
            referencedRelation: "accounts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "sources_category_id_fkey"
            columns: ["category_id"]
            isOneToOne: false
            referencedRelation: "categories"
            referencedColumns: ["id"]
          },
        ]
      }
      subscribers: {
        Row: {
          created_at: string
          email: string
          id: string
          is_trial: boolean | null
          stripe_customer_id: string | null
          subscribed: boolean
          subscription_end: string | null
          subscription_tier: string | null
          trial_end: string | null
          updated_at: string
          user_id: string | null
        }
        Insert: {
          created_at?: string
          email: string
          id?: string
          is_trial?: boolean | null
          stripe_customer_id?: string | null
          subscribed?: boolean
          subscription_end?: string | null
          subscription_tier?: string | null
          trial_end?: string | null
          updated_at?: string
          user_id?: string | null
        }
        Update: {
          created_at?: string
          email?: string
          id?: string
          is_trial?: boolean | null
          stripe_customer_id?: string | null
          subscribed?: boolean
          subscription_end?: string | null
          subscription_tier?: string | null
          trial_end?: string | null
          updated_at?: string
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "subscribers_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "admin_user_credits"
            referencedColumns: ["user_id"]
          },
        ]
      }
      technical_findings: {
        Row: {
          analysis_id: string | null
          created_at: string | null
          finding_type: string | null
          id: string
          message: string | null
          status: string | null
          url: string | null
        }
        Insert: {
          analysis_id?: string | null
          created_at?: string | null
          finding_type?: string | null
          id?: string
          message?: string | null
          status?: string | null
          url?: string | null
        }
        Update: {
          analysis_id?: string | null
          created_at?: string | null
          finding_type?: string | null
          id?: string
          message?: string | null
          status?: string | null
          url?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "technical_findings_analysis_id_fkey"
            columns: ["analysis_id"]
            isOneToOne: false
            referencedRelation: "seo_analyses"
            referencedColumns: ["id"]
          },
        ]
      }
      user_documents: {
        Row: {
          extracted_content: string | null
          file_name: string
          file_path: string
          file_size: number
          id: string
          is_active: boolean | null
          mime_type: string
          upload_date: string | null
          user_id: string
        }
        Insert: {
          extracted_content?: string | null
          file_name: string
          file_path: string
          file_size: number
          id?: string
          is_active?: boolean | null
          mime_type: string
          upload_date?: string | null
          user_id: string
        }
        Update: {
          extracted_content?: string | null
          file_name?: string
          file_path?: string
          file_size?: number
          id?: string
          is_active?: boolean | null
          mime_type?: string
          upload_date?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_documents_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "admin_user_credits"
            referencedColumns: ["user_id"]
          },
        ]
      }
      user_subscriptions: {
        Row: {
          created_at: string | null
          credits_used: number
          id: string
          is_trial: boolean | null
          monthly_credits: number
          stripe_customer_id: string | null
          stripe_subscription_id: string | null
          subscription_end_date: string | null
          subscription_start_date: string | null
          subscription_tier: string | null
          subscription_type: string
          trial_end: string | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          created_at?: string | null
          credits_used?: number
          id?: string
          is_trial?: boolean | null
          monthly_credits?: number
          stripe_customer_id?: string | null
          stripe_subscription_id?: string | null
          subscription_end_date?: string | null
          subscription_start_date?: string | null
          subscription_tier?: string | null
          subscription_type?: string
          trial_end?: string | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          created_at?: string | null
          credits_used?: number
          id?: string
          is_trial?: boolean | null
          monthly_credits?: number
          stripe_customer_id?: string | null
          stripe_subscription_id?: string | null
          subscription_end_date?: string | null
          subscription_start_date?: string | null
          subscription_tier?: string | null
          subscription_type?: string
          trial_end?: string | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_subscriptions_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: true
            referencedRelation: "admin_user_credits"
            referencedColumns: ["user_id"]
          },
        ]
      }
      voice_citations: {
        Row: {
          assistant_platform: string
          citation_context: string | null
          citation_position: number | null
          confidence_score: number | null
          created_at: string
          domain: string
          id: string
          is_cited: boolean | null
          query: string
          response_text: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          assistant_platform: string
          citation_context?: string | null
          citation_position?: number | null
          confidence_score?: number | null
          created_at?: string
          domain: string
          id?: string
          is_cited?: boolean | null
          query: string
          response_text?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          assistant_platform?: string
          citation_context?: string | null
          citation_position?: number | null
          confidence_score?: number | null
          created_at?: string
          domain?: string
          id?: string
          is_cited?: boolean | null
          query?: string
          response_text?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
    }
    Views: {
      admin_user_credits: {
        Row: {
          credits_used: number | null
          email: string | null
          monthly_credits: number | null
          remaining_credits: number | null
          subscription_type: string | null
          user_id: string | null
        }
        Relationships: []
      }
      v_answer_share_daily: {
        Row: {
          answer_share: number | null
          brand_id: string | null
          ci_high: number | null
          ci_low: number | null
          date: string | null
          is_reliable: boolean | null
          model: string | null
          n_mentions: number | null
          n_runs: number | null
          panel_id: string | null
          prompt_class: string | null
        }
        Relationships: []
      }
    }
    Functions: {
      add_user_credits: {
        Args: { credit_amount: number; user_email: string }
        Returns: number
      }
      analyze_content_quality: { Args: { content_text: string }; Returns: Json }
      analyze_keywords: {
        Args: { content_text: string; target_keyword: string }
        Returns: Json
      }
      answer_share_window: {
        Args: {
          p_brand_id: string
          p_end_date?: string
          p_model?: string
          p_prompt_class?: string
          p_window_days?: number
        }
        Returns: {
          answer_share: number
          brand_id: string
          ci_high: number
          ci_low: number
          is_reliable: boolean
          model: string
          n_mentions: number
          n_runs: number
          prompt_class: string
          reliability_note: string
          window_end: string
          window_start: string
        }[]
      }
      check_ai_friendliness: { Args: { content_text: string }; Returns: Json }
      check_harness_health: { Args: never; Returns: number }
      citation_stability: {
        Args: {
          p_end_date?: string
          p_panel_id: string
          p_window_days?: number
        }
        Returns: {
          date_a: string
          date_b: string
          jaccard: number
          overlap_count: number
          union_count: number
          within_expected_band: boolean
        }[]
      }
      current_account_ids: { Args: never; Returns: string[] }
      get_page_parents: {
        Args: { page_id: number }
        Returns: {
          id: number
          meta: Json
          parent_page_id: number
          path: string
        }[]
      }
      increment_credits:
        | { Args: never; Returns: undefined }
        | { Args: { amount: number; user_id: number }; Returns: undefined }
      match_content_by_query: {
        Args: {
          match_count?: number
          match_threshold?: number
          query_text: string
        }
        Returns: {
          content: string
          created_at: string
          generated_at: string
          id: number
          metadata: Json
          similarity: number
          title: string
          user_id: string
        }[]
      }
      methodology_value: { Args: { p_key: string }; Returns: number }
      postgres_fdw_disconnect: { Args: { "": string }; Returns: boolean }
      postgres_fdw_disconnect_all: { Args: never; Returns: boolean }
      postgres_fdw_get_connections: {
        Args: never
        Returns: Record<string, unknown>[]
      }
      postgres_fdw_handler: { Args: never; Returns: unknown }
      refresh_scores_daily: { Args: { p_date?: string }; Returns: number }
      set_openai_key: { Args: { api_key: string }; Returns: undefined }
      show_limit: { Args: never; Returns: number }
      show_trgm: { Args: { "": string }; Returns: string[] }
      source_graph: {
        Args: {
          p_client_domain?: string
          p_end_date?: string
          p_panel_id: string
          p_window_days?: number
        }
        Returns: {
          accessibility: string
          citation_count: number
          client_present: boolean
          cumulative_share: number
          distinct_prompts: number
          distinct_runs: number
          domain: string
          leverage_rank: number
          share_of_citations: number
          source_id: string
          source_type: string
        }[]
      }
      wilson_interval: {
        Args: { successes: number; trials: number; z?: number }
        Returns: {
          ci_high: number
          ci_low: number
          point: number
        }[]
      }
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {},
  },
} as const
