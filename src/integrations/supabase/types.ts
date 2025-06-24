export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  public: {
    Tables: {
      ai_sitemaps: {
        Row: {
          domain: string
          generated_at: string | null
          id: number
          page_count: number | null
          sitemap_data: Json | null
          user_id: string | null
        }
        Insert: {
          domain: string
          generated_at?: string | null
          id?: number
          page_count?: number | null
          sitemap_data?: Json | null
          user_id?: string | null
        }
        Update: {
          domain?: string
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
          cited_sources: Json | null
          domain: string
          id: number
          is_cited: boolean | null
          query: string
          recommendations: string | null
          user_id: string | null
        }
        Insert: {
          ai_answer?: string | null
          checked_at?: string | null
          cited_sources?: Json | null
          domain: string
          id?: number
          is_cited?: boolean | null
          query: string
          recommendations?: string | null
          user_id?: string | null
        }
        Update: {
          ai_answer?: string | null
          checked_at?: string | null
          cited_sources?: Json | null
          domain?: string
          id?: number
          is_cited?: boolean | null
          query?: string
          recommendations?: string | null
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
      company: {
        Row: {
          attrs: Json | null
          created_at: string | null
          id: string | null
          updated_at: string | null
        }
        Insert: {
          attrs?: Json | null
          created_at?: string | null
          id?: string | null
          updated_at?: string | null
        }
        Update: {
          attrs?: Json | null
          created_at?: string | null
          id?: string | null
          updated_at?: string | null
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
      contacts: {
        Row: {
          attrs: Json | null
          created_at: string | null
          updated_at: string | null
        }
        Insert: {
          attrs?: Json | null
          created_at?: string | null
          updated_at?: string | null
        }
        Update: {
          attrs?: Json | null
          created_at?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
      content_blocks: {
        Row: {
          content: string | null
          content_embedding: string | null
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
          content_embedding?: string | null
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
          content_embedding?: string | null
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
          embedding: string | null
          id: number
          metadata: Json | null
        }
        Insert: {
          content?: string | null
          embedding?: string | null
          id?: number
          metadata?: Json | null
        }
        Update: {
          content?: string | null
          embedding?: string | null
          id?: number
          metadata?: Json | null
        }
        Relationships: []
      }
      nods_page: {
        Row: {
          checksum: string | null
          id: number
          meta: Json | null
          parent_page_id: number | null
          path: string
          source: string | null
          type: string | null
        }
        Insert: {
          checksum?: string | null
          id?: number
          meta?: Json | null
          parent_page_id?: number | null
          path: string
          source?: string | null
          type?: string | null
        }
        Update: {
          checksum?: string | null
          id?: number
          meta?: Json | null
          parent_page_id?: number | null
          path?: string
          source?: string | null
          type?: string | null
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
          embedding: string | null
          heading: string | null
          id: number
          page_id: number
          slug: string | null
          token_count: number | null
        }
        Insert: {
          content?: string | null
          embedding?: string | null
          heading?: string | null
          id?: number
          page_id: number
          slug?: string | null
          token_count?: number | null
        }
        Update: {
          content?: string | null
          embedding?: string | null
          heading?: string | null
          id?: number
          page_id?: number
          slug?: string | null
          token_count?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "nods_page_section_page_id_fkey"
            columns: ["page_id"]
            isOneToOne: false
            referencedRelation: "nods_page"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          avatar_url: string | null
          created_at: string | null
          email: string | null
          full_name: string | null
          id: string
          preferences: Json | null
          updated_at: string | null
        }
        Insert: {
          avatar_url?: string | null
          created_at?: string | null
          email?: string | null
          full_name?: string | null
          id: string
          preferences?: Json | null
          updated_at?: string | null
        }
        Update: {
          avatar_url?: string | null
          created_at?: string | null
          email?: string | null
          full_name?: string | null
          id?: string
          preferences?: Json | null
          updated_at?: string | null
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
          analysis_data: Json | null
          backlink_score: number | null
          created_at: string | null
          domain: string
          id: string
          performance_score: number | null
          status: string | null
          technical_score: number | null
          total_score: number | null
          updated_at: string | null
          user_id: string | null
        }
        Insert: {
          analysis_data?: Json | null
          backlink_score?: number | null
          created_at?: string | null
          domain: string
          id?: string
          performance_score?: number | null
          status?: string | null
          technical_score?: number | null
          total_score?: number | null
          updated_at?: string | null
          user_id?: string | null
        }
        Update: {
          analysis_data?: Json | null
          backlink_score?: number | null
          created_at?: string | null
          domain?: string
          id?: string
          performance_score?: number | null
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
      binary_quantize: {
        Args: { "": string } | { "": unknown }
        Returns: unknown
      }
      check_ai_friendliness: {
        Args: { content_text: string }
        Returns: Json
      }
      get_openai_embedding: {
        Args: { query_text: string }
        Returns: string
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
      halfvec_avg: {
        Args: { "": number[] }
        Returns: unknown
      }
      halfvec_out: {
        Args: { "": unknown }
        Returns: unknown
      }
      halfvec_send: {
        Args: { "": unknown }
        Returns: string
      }
      halfvec_typmod_in: {
        Args: { "": unknown[] }
        Returns: number
      }
      hnsw_bit_support: {
        Args: { "": unknown }
        Returns: unknown
      }
      hnsw_halfvec_support: {
        Args: { "": unknown }
        Returns: unknown
      }
      hnsw_sparsevec_support: {
        Args: { "": unknown }
        Returns: unknown
      }
      hnswhandler: {
        Args: { "": unknown }
        Returns: unknown
      }
      increment_credits: {
        Args: Record<PropertyKey, never> | { user_id: number; amount: number }
        Returns: undefined
      }
      ivfflat_bit_support: {
        Args: { "": unknown }
        Returns: unknown
      }
      ivfflat_halfvec_support: {
        Args: { "": unknown }
        Returns: unknown
      }
      ivfflathandler: {
        Args: { "": unknown }
        Returns: unknown
      }
      l2_norm: {
        Args: { "": unknown } | { "": unknown }
        Returns: number
      }
      l2_normalize: {
        Args: { "": string } | { "": unknown } | { "": unknown }
        Returns: unknown
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
      match_documents: {
        Args: { query_embedding: string; match_count?: number; filter?: Json }
        Returns: {
          id: number
          content: string
          metadata: Json
          similarity: number
        }[]
      }
      match_page_sections: {
        Args: {
          embedding: string
          match_threshold: number
          match_count: number
          min_content_length: number
        }
        Returns: {
          id: number
          page_id: number
          slug: string
          heading: string
          content: string
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
      sparsevec_out: {
        Args: { "": unknown }
        Returns: unknown
      }
      sparsevec_send: {
        Args: { "": unknown }
        Returns: string
      }
      sparsevec_typmod_in: {
        Args: { "": unknown[] }
        Returns: number
      }
      vector_avg: {
        Args: { "": number[] }
        Returns: string
      }
      vector_dims: {
        Args: { "": string } | { "": unknown }
        Returns: number
      }
      vector_norm: {
        Args: { "": string }
        Returns: number
      }
      vector_out: {
        Args: { "": string }
        Returns: unknown
      }
      vector_send: {
        Args: { "": string }
        Returns: string
      }
      vector_typmod_in: {
        Args: { "": unknown[] }
        Returns: number
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

type DefaultSchema = Database[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
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
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
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
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
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
    | { schema: keyof Database },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof Database },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends { schema: keyof Database }
  ? Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {},
  },
} as const
