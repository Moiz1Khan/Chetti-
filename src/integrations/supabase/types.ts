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
    PostgrestVersion: "14.4"
  }
  public: {
    Tables: {
      api_keys: {
        Row: {
          created_at: string
          id: string
          key_hash: string
          key_prefix: string
          last_used_at: string | null
          name: string
          revoked: boolean
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          key_hash: string
          key_prefix: string
          last_used_at?: string | null
          name?: string
          revoked?: boolean
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          key_hash?: string
          key_prefix?: string
          last_used_at?: string | null
          name?: string
          revoked?: boolean
          user_id?: string
        }
        Relationships: []
      }
      chatbot_knowledge: {
        Row: {
          chatbot_id: string
          created_at: string
          id: string
          knowledge_id: string
        }
        Insert: {
          chatbot_id: string
          created_at?: string
          id?: string
          knowledge_id: string
        }
        Update: {
          chatbot_id?: string
          created_at?: string
          id?: string
          knowledge_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "chatbot_knowledge_chatbot_id_fkey"
            columns: ["chatbot_id"]
            isOneToOne: false
            referencedRelation: "chatbots"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "chatbot_knowledge_knowledge_id_fkey"
            columns: ["knowledge_id"]
            isOneToOne: false
            referencedRelation: "knowledge_base"
            referencedColumns: ["id"]
          },
        ]
      }
      chatbot_settings: {
        Row: {
          avatar_emoji: string | null
          avatar_icon: string | null
          avatar_type: string | null
          avatar_url: string | null
          background_image_url: string | null
          background_theme: string | null
          bubble_style: string | null
          chatbot_id: string
          created_at: string
          domain_whitelist: string[] | null
          embed_enabled: boolean
          font_family: string | null
          font_size: string | null
          id: string
          idle_message: string | null
          idle_timeout_seconds: number | null
          is_public: boolean
          lead_capture_enabled: boolean | null
          primary_color: string | null
          quick_replies: string[] | null
          show_bot_name: boolean | null
          updated_at: string
          welcome_message: string | null
        }
        Insert: {
          avatar_emoji?: string | null
          avatar_icon?: string | null
          avatar_type?: string | null
          avatar_url?: string | null
          background_image_url?: string | null
          background_theme?: string | null
          bubble_style?: string | null
          chatbot_id: string
          created_at?: string
          domain_whitelist?: string[] | null
          embed_enabled?: boolean
          font_family?: string | null
          font_size?: string | null
          id?: string
          idle_message?: string | null
          idle_timeout_seconds?: number | null
          is_public?: boolean
          lead_capture_enabled?: boolean | null
          primary_color?: string | null
          quick_replies?: string[] | null
          show_bot_name?: boolean | null
          updated_at?: string
          welcome_message?: string | null
        }
        Update: {
          avatar_emoji?: string | null
          avatar_icon?: string | null
          avatar_type?: string | null
          avatar_url?: string | null
          background_image_url?: string | null
          background_theme?: string | null
          bubble_style?: string | null
          chatbot_id?: string
          created_at?: string
          domain_whitelist?: string[] | null
          embed_enabled?: boolean
          font_family?: string | null
          font_size?: string | null
          id?: string
          idle_message?: string | null
          idle_timeout_seconds?: number | null
          is_public?: boolean
          lead_capture_enabled?: boolean | null
          primary_color?: string | null
          quick_replies?: string[] | null
          show_bot_name?: boolean | null
          updated_at?: string
          welcome_message?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "chatbot_settings_chatbot_id_fkey"
            columns: ["chatbot_id"]
            isOneToOne: true
            referencedRelation: "chatbots"
            referencedColumns: ["id"]
          },
        ]
      }
      chatbots: {
        Row: {
          created_at: string
          description: string | null
          id: string
          max_tokens: number | null
          model: string | null
          name: string
          status: boolean
          system_prompt: string | null
          temperature: number | null
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          id?: string
          max_tokens?: number | null
          model?: string | null
          name: string
          status?: boolean
          system_prompt?: string | null
          temperature?: number | null
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          description?: string | null
          id?: string
          max_tokens?: number | null
          model?: string | null
          name?: string
          status?: boolean
          system_prompt?: string | null
          temperature?: number | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      knowledge_base: {
        Row: {
          chatbot_id: string | null
          created_at: string
          file_name: string
          file_type: string
          file_url: string | null
          id: string
          source_content: string | null
          status: string | null
          user_id: string
        }
        Insert: {
          chatbot_id?: string | null
          created_at?: string
          file_name: string
          file_type: string
          file_url?: string | null
          id?: string
          source_content?: string | null
          status?: string | null
          user_id: string
        }
        Update: {
          chatbot_id?: string | null
          created_at?: string
          file_name?: string
          file_type?: string
          file_url?: string | null
          id?: string
          source_content?: string | null
          status?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "knowledge_base_chatbot_id_fkey"
            columns: ["chatbot_id"]
            isOneToOne: false
            referencedRelation: "chatbots"
            referencedColumns: ["id"]
          },
        ]
      }
      knowledge_chunks: {
        Row: {
          chunk_index: number
          content: string
          created_at: string
          id: string
          knowledge_id: string
          token_count: number | null
          user_id: string
        }
        Insert: {
          chunk_index?: number
          content: string
          created_at?: string
          id?: string
          knowledge_id: string
          token_count?: number | null
          user_id: string
        }
        Update: {
          chunk_index?: number
          content?: string
          created_at?: string
          id?: string
          knowledge_id?: string
          token_count?: number | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "knowledge_chunks_knowledge_id_fkey"
            columns: ["knowledge_id"]
            isOneToOne: false
            referencedRelation: "knowledge_base"
            referencedColumns: ["id"]
          },
        ]
      }
      leads: {
        Row: {
          chatbot_id: string
          created_at: string
          email: string
          id: string
          name: string | null
        }
        Insert: {
          chatbot_id: string
          created_at?: string
          email: string
          id?: string
          name?: string | null
        }
        Update: {
          chatbot_id?: string
          created_at?: string
          email?: string
          id?: string
          name?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "leads_chatbot_id_fkey"
            columns: ["chatbot_id"]
            isOneToOne: false
            referencedRelation: "chatbots"
            referencedColumns: ["id"]
          },
        ]
      }
      messages: {
        Row: {
          chatbot_id: string
          content: string
          created_at: string
          feedback: string | null
          id: string
          reactions: string[] | null
          role: string
          session_id: string
          sources: Json | null
          user_id: string
        }
        Insert: {
          chatbot_id: string
          content: string
          created_at?: string
          feedback?: string | null
          id?: string
          reactions?: string[] | null
          role: string
          session_id?: string
          sources?: Json | null
          user_id: string
        }
        Update: {
          chatbot_id?: string
          content?: string
          created_at?: string
          feedback?: string | null
          id?: string
          reactions?: string[] | null
          role?: string
          session_id?: string
          sources?: Json | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "messages_chatbot_id_fkey"
            columns: ["chatbot_id"]
            isOneToOne: false
            referencedRelation: "chatbots"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          created_at: string
          email: string | null
          full_name: string | null
          id: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          email?: string | null
          full_name?: string | null
          id: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          email?: string | null
          full_name?: string | null
          id?: string
          updated_at?: string
        }
        Relationships: []
      }
      usage: {
        Row: {
          chatbot_id: string | null
          created_at: string
          date: string
          id: string
          messages_used: number
          user_id: string
        }
        Insert: {
          chatbot_id?: string | null
          created_at?: string
          date?: string
          id?: string
          messages_used?: number
          user_id: string
        }
        Update: {
          chatbot_id?: string | null
          created_at?: string
          date?: string
          id?: string
          messages_used?: number
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "usage_chatbot_id_fkey"
            columns: ["chatbot_id"]
            isOneToOne: false
            referencedRelation: "chatbots"
            referencedColumns: ["id"]
          },
        ]
      }
      user_roles: {
        Row: {
          created_at: string
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
      search_knowledge_chunks: {
        Args: {
          p_knowledge_ids?: string[]
          p_limit?: number
          p_query: string
          p_user_id: string
        }
        Returns: {
          chunk_index: number
          content: string
          id: string
          knowledge_id: string
          rank: number
        }[]
      }
    }
    Enums: {
      app_role: "admin" | "moderator" | "user"
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
      app_role: ["admin", "moderator", "user"],
    },
  },
} as const
