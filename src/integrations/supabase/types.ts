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
          monthly_credits: number
          stripe_customer_id: string | null
          stripe_subscription_id: string | null
          subscription_end_date: string | null
          subscription_start_date: string | null
          subscription_type: string
          updated_at: string | null
          user_id: string
        }
        Insert: {
          created_at?: string | null
          credits_used?: number
          id?: string
          monthly_credits?: number
          stripe_customer_id?: string | null
          stripe_subscription_id?: string | null
          subscription_end_date?: string | null
          subscription_start_date?: string | null
          subscription_type?: string
          updated_at?: string | null
          user_id: string
        }
        Update: {
          created_at?: string | null
          credits_used?: number
          id?: string
          monthly_credits?: number
          stripe_customer_id?: string | null
          stripe_subscription_id?: string | null
          subscription_end_date?: string | null
          subscription_start_date?: string | null
          subscription_type?: string
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
      binary_quantize: {
        Args: { "": string } | { "": unknown }
        Returns: unknown
      }
      get_openai_embedding: {
        Args: { query_text: string }
        Returns: string
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
