import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://sktusfnbidiexiwpyfwz.supabase.co'
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InNrdHVzZm5iaWRpZXhpd3B5Znd6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDk4NzM5NjUsImV4cCI6MjA2NTQ0OTk2NX0.DNqn3eFyKdNYgJ84uAtD7K-uj00VMCrTOCUxkH0tFlU'

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

export type Database = {
  public: {
    Tables: {
      warehouses: {
        Row: {
          id: string
          code: string
          name: string
          address: string | null
          created_at: string
          updated_at: string
        }
        Insert: Omit<Database['public']['Tables']['warehouses']['Row'], 'id' | 'created_at' | 'updated_at'>
        Update: Partial<Database['public']['Tables']['warehouses']['Insert']>
      }
      locations: {
        Row: {
          id: string
          warehouse_id: string
          code: string
          zone: string | null
          aisle: string | null
          rack: string | null
          level: string | null
          bin: string | null
          capacity: number
          is_active: boolean
          created_at: string
        }
        Insert: Omit<Database['public']['Tables']['locations']['Row'], 'id' | 'created_at'>
        Update: Partial<Database['public']['Tables']['locations']['Insert']>
      }
      products: {
        Row: {
          id: string
          sku: string
          name: string
          description: string | null
          category: string | null
          unit: string
          weight: number | null
          volume: number | null
          barcode: string | null
          min_stock: number
          max_stock: number
          is_active: boolean
          created_at: string
          updated_at: string
        }
        Insert: Omit<Database['public']['Tables']['products']['Row'], 'id' | 'created_at' | 'updated_at'>
        Update: Partial<Database['public']['Tables']['products']['Insert']>
      }
      inventory: {
        Row: {
          id: string
          product_id: string
          location_id: string
          quantity: number
          lot_number: string | null
          expiry_date: string | null
          created_at: string
          updated_at: string
        }
        Insert: Omit<Database['public']['Tables']['inventory']['Row'], 'id' | 'created_at' | 'updated_at'>
        Update: Partial<Database['public']['Tables']['inventory']['Insert']>
      }
      inventory_movements: {
        Row: {
          id: string
          product_id: string
          from_location_id: string | null
          to_location_id: string | null
          quantity: number
          movement_type: 'IN' | 'OUT' | 'TRANSFER' | 'ADJUST'
          reference_type: string | null
          reference_id: string | null
          reason: string | null
          performed_by: string | null
          created_at: string
        }
        Insert: Omit<Database['public']['Tables']['inventory_movements']['Row'], 'id' | 'created_at'>
        Update: Partial<Database['public']['Tables']['inventory_movements']['Insert']>
      }
    }
  }
}