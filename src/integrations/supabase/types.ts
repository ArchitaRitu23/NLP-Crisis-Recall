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
    PostgrestVersion: "14.1"
  }
  public: {
    Tables: {
      analyses: {
        Row: {
          analysis_method: Database["public"]["Enums"]["analysis_method"] | null
          components: Json | null
          created_at: string | null
          defect_confidence: number | null
          defect_present: boolean | null
          feedback_id: string | null
          id: string
          matched_keywords: Json | null
          rationale: string | null
          risk_score: number | null
          safety_confidence: number | null
          safety_risk: Database["public"]["Enums"]["safety_risk_level"] | null
          sentiment: Database["public"]["Enums"]["sentiment_type"]
          sentiment_confidence: number | null
        }
        Insert: {
          analysis_method?:
            | Database["public"]["Enums"]["analysis_method"]
            | null
          components?: Json | null
          created_at?: string | null
          defect_confidence?: number | null
          defect_present?: boolean | null
          feedback_id?: string | null
          id?: string
          matched_keywords?: Json | null
          rationale?: string | null
          risk_score?: number | null
          safety_confidence?: number | null
          safety_risk?: Database["public"]["Enums"]["safety_risk_level"] | null
          sentiment: Database["public"]["Enums"]["sentiment_type"]
          sentiment_confidence?: number | null
        }
        Update: {
          analysis_method?:
            | Database["public"]["Enums"]["analysis_method"]
            | null
          components?: Json | null
          created_at?: string | null
          defect_confidence?: number | null
          defect_present?: boolean | null
          feedback_id?: string | null
          id?: string
          matched_keywords?: Json | null
          rationale?: string | null
          risk_score?: number | null
          safety_confidence?: number | null
          safety_risk?: Database["public"]["Enums"]["safety_risk_level"] | null
          sentiment?: Database["public"]["Enums"]["sentiment_type"]
          sentiment_confidence?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "analyses_feedback_id_fkey"
            columns: ["feedback_id"]
            isOneToOne: false
            referencedRelation: "feedback_items"
            referencedColumns: ["id"]
          },
        ]
      }
      feedback_items: {
        Row: {
          created_at: string | null
          id: string
          original_text: string
          product_name: string | null
          source: string | null
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          id?: string
          original_text: string
          product_name?: string | null
          source?: string | null
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          id?: string
          original_text?: string
          product_name?: string | null
          source?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
      report_items: {
        Row: {
          analysis_id: string | null
          created_at: string | null
          id: string
          report_id: string | null
        }
        Insert: {
          analysis_id?: string | null
          created_at?: string | null
          id?: string
          report_id?: string | null
        }
        Update: {
          analysis_id?: string | null
          created_at?: string | null
          id?: string
          report_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "report_items_analysis_id_fkey"
            columns: ["analysis_id"]
            isOneToOne: false
            referencedRelation: "analyses"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "report_items_report_id_fkey"
            columns: ["report_id"]
            isOneToOne: false
            referencedRelation: "reports"
            referencedColumns: ["id"]
          },
        ]
      }
      reports: {
        Row: {
          average_risk_score: number | null
          completed_at: string | null
          created_at: string | null
          high_risk_count: number | null
          id: string
          name: string
          status: string | null
          total_items: number | null
        }
        Insert: {
          average_risk_score?: number | null
          completed_at?: string | null
          created_at?: string | null
          high_risk_count?: number | null
          id?: string
          name: string
          status?: string | null
          total_items?: number | null
        }
        Update: {
          average_risk_score?: number | null
          completed_at?: string | null
          created_at?: string | null
          high_risk_count?: number | null
          id?: string
          name?: string
          status?: string | null
          total_items?: number | null
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      analysis_method: "rules" | "llm" | "hybrid"
      safety_risk_level: "none" | "low" | "medium" | "high"
      sentiment_type: "positive" | "neutral" | "negative"
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
    Enums: {
      analysis_method: ["rules", "llm", "hybrid"],
      safety_risk_level: ["none", "low", "medium", "high"],
      sentiment_type: ["positive", "neutral", "negative"],
    },
  },
} as const
