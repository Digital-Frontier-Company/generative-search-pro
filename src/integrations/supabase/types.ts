export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instanciate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "12.2.3 (519615d)"
  }
  public: {
    Tables: {
      ai_platform_citations: {
        Row: {
          citation_found: boolean | null
          citation_position: number | null
          citation_snippet: string | null
          created_at: string
          domain: string
          id: string
          platforms: Json | null
          query: string
          search_method: string | null
          total_results: number | null
          updated_at: string
          user_id: string
        }
        Insert: {
          citation_found?: boolean | null
          citation_position?: number | null
          citation_snippet?: string | null
          created_at?: string
          domain: string
          id?: string
          platforms?: Json | null
          query: string
          search_method?: string | null
          total_results?: number | null
          updated_at?: string
          user_id: string
        }
        Update: {
          citation_found?: boolean | null
          citation_position?: number | null
          citation_snippet?: string | null
          created_at?: string
          domain?: string
          id?: string
          platforms?: Json | null
          query?: string
          search_method?: string | null
          total_results?: number | null
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
    }
    Functions: {
      add_user_credits: {
        Args: { user_email: string; credit_amount: number }
        Returns: number
      }
      analyze_content_quality: {
        Args: { content_text: string }
        Returns: Json
      }
      analyze_keywords: {
        Args: { content_text: string; target_keyword: string }
        Returns: Json
      }
      check_ai_friendliness: {
        Args: { content_text: string }
        Returns: Json
      }
      get_page_parents: {
        Args: { page_id: number }
        Returns: {
          id: number
          parent_page_id: number
          path: string
          meta: Json
        }[]
      }
      increment_credits: {
        Args: Record<PropertyKey, never> | { user_id: number; amount: number }
        Returns: undefined
      }
      match_content_by_query: {
        Args: {
          query_text: string
          match_threshold?: number
          match_count?: number
        }
        Returns: {
          id: number
          title: string
          content: string
          metadata: Json
          created_at: string
          generated_at: string
          user_id: string
          similarity: number
        }[]
      }
      postgres_fdw_disconnect: {
        Args: { "": string }
        Returns: boolean
      }
      postgres_fdw_disconnect_all: {
        Args: Record<PropertyKey, never>
        Returns: boolean
      }
      postgres_fdw_get_connections: {
        Args: Record<PropertyKey, never>
        Returns: Record<string, unknown>[]
      }
      postgres_fdw_handler: {
        Args: Record<PropertyKey, never>
        Returns: unknown
      }
      set_openai_key: {
        Args: { api_key: string }
        Returns: undefined
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
