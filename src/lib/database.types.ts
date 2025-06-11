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
      conversations: {
        Row: {
          id: string
          user_id: string
          title: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          title?: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          title?: string
          created_at?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "conversations_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          }
        ]
      }
      messages: {
        Row: {
          id: number
          conversation_id: string
          role: "user" | "assistant"
          content: string
          created_at: string
        }
        Insert: {
          id?: number
          conversation_id: string
          role: "user" | "assistant"
          content: string
          created_at?: string
        }
        Update: {
          id?: number
          conversation_id?: string
          role?: "user" | "assistant"
          content?: string
          created_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "messages_conversation_id_fkey"
            columns: ["conversation_id"]
            isOneToOne: false
            referencedRelation: "conversations"
            referencedColumns: ["id"]
          }
        ]
      }
      provider_keys: {
        Row: {
          provider: string
          user_id: string
          api_key: string
          created_at: string
        }
        Insert: {
          provider: string
          user_id: string
          api_key: string
          created_at?: string
        }
        Update: {
          provider?: string
          user_id?: string
          api_key?: string
          created_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "provider_keys_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          }
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      role_enum: "user" | "assistant"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}