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
          is_active?: boolean;
          phone?: string | null;
          user_id?: string | null;
        };
        Row: {
          current_weight_kg: number | null;
          date_of_birth: string | null;
          email: string;
          full_name: string;
          goal: string;
          height_cm: number | null;
          id: string;
          initial_weight_kg: number | null;
          is_active: boolean;
          joined_at: string;
          level: string;
          phone: string | null;
          streak_days: number;
          user_id: string | null;
          xp: number;
        };
        Relationships: [];
        Update: Partial<
          Database["public"]["Tables"]["members"]["Insert"] & {
            is_active: boolean;
            joined_at: string;
            level: string;
            streak_days: number;
            updated_at: string;
            xp: number;
          }
        >;
      };
      memberships: {
        Insert: {
          end_date: string;
          member_id: string;
          start_date: string;
          status?: "active" | "expiring" | "expired";
        };
        Row: {
          id: string;
          created_at: string;
          end_date: string;
          member_id: string;
          start_date: string;
          status: "active" | "expiring" | "expired";
        };
        Relationships: [];
        Update: Partial<Database["public"]["Tables"]["memberships"]["Insert"]>;
      };
      payments: {
        Insert: {
          amount_cop: number;
          member_id: string;
          method?: "cash" | "transfer" | "nequi" | "daviplata" | "other";
          notes?: string | null;
          paid_at: string;
          period_end: string;
          period_start: string;
          source?: "whatsapp" | "front_desk" | "manual";
        };
        Row: {
          amount_cop: number;
          id: string;
          member_id: string;
          method: "cash" | "transfer" | "nequi" | "daviplata" | "other";
          notes: string | null;
          paid_at: string;
          period_end: string;
          period_start: string;
          source: "whatsapp" | "front_desk" | "manual";
        };
        Relationships: [];
        Update: Partial<Database["public"]["Tables"]["payments"]["Insert"]>;
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
          id: string;
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
          coach_notes: string | null;
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
          id: string;
          member_id: string;
          notes: string | null;
          routine_id: string | null;
          xp_awarded: number;
        };
        Relationships: [];
        Update: never;
      };
      achievements: {
        Insert: never;
        Row: {
          id: string;
          member_id: string;
          title: string;
          unlocked_at: string;
          xp_awarded: number;
        };
        Relationships: [];
        Update: never;
      };
      exercises: {
        Insert: never;
        Row: {
          coach_note: string | null;
          id: string;
          load: string | null;
          media_url: string | null;
          name: string;
          reps: string;
          routine_id: string;
          sets: string;
          sort_order: number;
        };
        Relationships: [];
        Update: never;
      };
      progress_entries: {
        Insert: never;
        Row: {
          arm_cm: number | null;
          created_at: string;
          entry_date: string;
          hip_cm: number | null;
          id: string;
          leg_cm: number | null;
          member_id: string;
          photo_url: string | null;
          waist_cm: number | null;
          weight_kg: number | null;
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
