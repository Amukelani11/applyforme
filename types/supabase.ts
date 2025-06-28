export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      users: {
        Row: {
          id: string
          created_at: string
          full_name: string | null
          email: string
          is_admin: boolean
        }
        Insert: {
          id: string
          created_at?: string
          full_name?: string | null
          email: string
          is_admin?: boolean
        }
        Update: {
          id?: string
          created_at?: string
          full_name?: string | null
          email?: string
          is_admin?: boolean
        }
      }
      documents: {
        Row: {
          id: string
          created_at: string
          user_id: string
          name: string
          type: string
          url: string
        }
        Insert: {
          id?: string
          created_at?: string
          user_id: string
          name: string
          type: string
          url: string
        }
        Update: {
          id?: string
          created_at?: string
          user_id?: string
          name?: string
          type?: string
          url?: string
        }
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
  }
} 