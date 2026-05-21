import { createClient, type SupabaseClient } from "@supabase/supabase-js";

type Database = {
  public: {
    Tables: {
      members: {
        Insert: {
          current_weight_kg?: number | null;
          date_of_birth?: string | null;
          email: string;
          full_name: string;
          goal: string;
          height_cm?: number | null;
          initial_weight_kg?: number | null;
          phone?: string | null;
          user_id?: string | null;
        };
        Row: {
          current_weight_kg: number | null;
          email: string;
          full_name: string;
          goal: string;
          id: string;
          initial_weight_kg: number | null;
          is_active: boolean;
          joined_at: string;
          phone: string | null;
        };
        Relationships: [];
        Update: Partial<Database["public"]["Tables"]["members"]["Insert"]>;
      };
      memberships: {
        Insert: never;
        Row: {
          end_date: string;
          member_id: string;
          start_date: string;
          status: "active" | "expiring" | "expired";
        };
        Relationships: [];
        Update: never;
      };
      payments: {
        Insert: never;
        Row: {
          amount_cop: number;
          paid_at: string;
        };
        Relationships: [];
        Update: never;
      };
      profiles: {
        Insert: {
          email: string;
          full_name: string;
          id: string;
          phone?: string | null;
          role?: "admin" | "member";
        };
        Row: {
          email: string;
          full_name: string;
          id: string;
          phone: string | null;
          role: "admin" | "member";
        };
        Relationships: [];
        Update: Partial<Database["public"]["Tables"]["profiles"]["Insert"]>;
      };
      routine_assignments: {
        Insert: never;
        Row: {
          is_current: boolean;
          member_id: string;
          routine_id: string;
        };
        Relationships: [];
        Update: never;
      };
      routines: {
        Insert: never;
        Row: {
          day_name: string;
          id: string;
          name: string;
        };
        Relationships: [];
        Update: never;
      };
      workout_logs: {
        Insert: never;
        Row: {
          completed_at: string;
          member_id: string;
        };
        Relationships: [];
        Update: never;
      };
    };
    Views: Record<string, never>;
    Functions: Record<string, never>;
    Enums: Record<string, never>;
    CompositeTypes: Record<string, never>;
  };
};

type SupabaseAdminClient = SupabaseClient<Database>;

let adminClient: SupabaseAdminClient | null = null;

export function hasSupabaseAdminConfig() {
  return Boolean(
    process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.SUPABASE_SERVICE_ROLE_KEY,
  );
}

export function createAdminClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl || !serviceRoleKey) {
    throw new Error("Missing Supabase admin environment variables.");
  }

  if (!adminClient) {
    adminClient = createClient<Database>(supabaseUrl, serviceRoleKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    });
  }

  return adminClient;
}
