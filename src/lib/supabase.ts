import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables')
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

export type Database = {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string
          email: string
          full_name: string
          role: 'organizer' | 'admin'
          created_at: string
          updated_at: string
        }
        Insert: {
          id: string
          email: string
          full_name: string
          role?: 'organizer' | 'admin'
          created_at?: string
          updated_at?: string
        }
        Update: {
          full_name?: string
          role?: 'organizer' | 'admin'
          updated_at?: string
        }
      }
      events: {
        Row: {
          id: string
          title: string
          description: string
          location: string
          date: string
          time: string
          price: number
          max_tickets: number
          available_tickets: number
          image_url: string
          status: 'pending' | 'approved' | 'rejected'
          organizer_id: string
          created_at: string
          updated_at: string
        }
        Insert: {
          title: string
          description: string
          location: string
          date: string
          time: string
          price: number
          max_tickets: number
          available_tickets: number
          image_url: string
          status?: 'pending' | 'approved' | 'rejected'
          organizer_id: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          title?: string
          description?: string
          location?: string
          date?: string
          time?: string
          price?: number
          max_tickets?: number
          available_tickets?: number
          image_url?: string
          status?: 'pending' | 'approved' | 'rejected'
          updated_at?: string
        }
      }
      tickets: {
        Row: {
          id: string
          event_id: string
          buyer_email: string
          buyer_name: string
          quantity: number
          total_price: number
          payment_status: 'pending' | 'completed' | 'failed'
          payment_method: 'mtn_momo' | 'visa'
          qr_code: string
          created_at: string
        }
        Insert: {
          event_id: string
          buyer_email: string
          buyer_name: string
          quantity: number
          total_price: number
          payment_status?: 'pending' | 'completed' | 'failed'
          payment_method: 'mtn_momo' | 'visa'
          qr_code: string
          created_at?: string
        }
        Update: {
          payment_status?: 'pending' | 'completed' | 'failed'
        }
      }
    }
  }
}