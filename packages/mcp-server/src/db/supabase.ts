import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config({ path: '../../.env' });

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  throw new Error('Missing Supabase environment variables');
}

export const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

export type Database = {
  public: {
    Tables: {
      warehouses: {
        Row: {
          id: string;
          code: string;
          name: string;
          address: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: Omit<Database['public']['Tables']['warehouses']['Row'], 'id' | 'created_at' | 'updated_at'>;
        Update: Partial<Database['public']['Tables']['warehouses']['Insert']>;
      };
      products: {
        Row: {
          id: string;
          sku: string;
          name: string;
          description: string | null;
          category: string | null;
          unit: string;
          weight: number | null;
          volume: number | null;
          barcode: string | null;
          min_stock: number;
          max_stock: number;
          is_active: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: Omit<Database['public']['Tables']['products']['Row'], 'id' | 'created_at' | 'updated_at'>;
        Update: Partial<Database['public']['Tables']['products']['Insert']>;
      };
      inventory: {
        Row: {
          id: string;
          product_id: string;
          location_id: string;
          quantity: number;
          lot_number: string | null;
          expiry_date: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: Omit<Database['public']['Tables']['inventory']['Row'], 'id' | 'created_at' | 'updated_at'>;
        Update: Partial<Database['public']['Tables']['inventory']['Insert']>;
      };
    };
  };
};