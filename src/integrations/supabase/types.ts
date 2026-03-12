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
      categories: {
        Row: {
          id: string
          value: string
          label: string
          subtitle: string
          icon: string
          sort_order: number
          created_at: string
        }
        Insert: {
          id?: string
          value: string
          label: string
          subtitle?: string
          icon?: string
          sort_order?: number
          created_at?: string
        }
        Update: {
          id?: string
          value?: string
          label?: string
          subtitle?: string
          icon?: string
          sort_order?: number
          created_at?: string
        }
        Relationships: []
      }
      photos: {
        Row: {
          aspect_ratio: string | null
          category: string | null
          created_at: string
          featured: boolean | null
          id: string
          image_url: string
          section: string | null
          sort_order: number | null
          title: string | null
        }
        Insert: {
          aspect_ratio?: string | null
          category?: string | null
          created_at?: string
          featured?: boolean | null
          id?: string
          image_url: string
          section?: string | null
          sort_order?: number | null
          title?: string | null
        }
        Update: {
          aspect_ratio?: string | null
          category?: string | null
          created_at?: string
          featured?: boolean | null
          id?: string
          image_url?: string
          section?: string | null
          sort_order?: number | null
          title?: string | null
        }
        Relationships: []
      }
      videos: {
        Row: {
          id: string
          title: string | null
          video_url: string
          thumbnail_url: string | null
          section: string | null
          category: string | null
          sort_order: number | null
          created_at: string
        }
        Insert: {
          id?: string
          title?: string | null
          video_url: string
          thumbnail_url?: string | null
          section?: string | null
          category?: string | null
          sort_order?: number | null
          created_at?: string
        }
        Update: {
          id?: string
          title?: string | null
          video_url?: string
          thumbnail_url?: string | null
          section?: string | null
          category?: string | null
          sort_order?: number | null
          created_at?: string
        }
        Relationships: []
      }
      page_content: {
        Row: {
          id: string
          key: string
          value: string
          updated_at: string
        }
        Insert: {
          id?: string
          key: string
          value?: string
          updated_at?: string
        }
        Update: {
          id?: string
          key?: string
          value?: string
          updated_at?: string
        }
        Relationships: []
      }
      page_sections: {
        Row: {
          id: string
          section_key: string
          label: string
          sort_order: number
          visible: boolean
        }
        Insert: {
          id?: string
          section_key: string
          label: string
          sort_order?: number
          visible?: boolean
        }
        Update: {
          id?: string
          section_key?: string
          label?: string
          sort_order?: number
          visible?: boolean
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
