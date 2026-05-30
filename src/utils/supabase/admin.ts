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
          group_id?: string | null;
          height_cm?: number | null;
          initial_weight_kg?: number | null;
          is_active?: boolean;
          membership_plan_id?: string | null;
          phone?: string | null;
          user_id?: string | null;
        };
        Row: {
          current_weight_kg: number | null;
          date_of_birth: string | null;
          email: string;
          full_name: string;
          goal: string;
          group_id: string | null;
          height_cm: number | null;
          id: string;
          initial_weight_kg: number | null;
          is_active: boolean;
          joined_at: string;
          level: string;
          membership_plan_id: string | null;
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
          membership_plan_id?: string | null;
          start_date: string;
          status?: "active" | "expiring" | "expired";
        };
        Row: {
          id: string;
          created_at: string;
          end_date: string;
          member_id: string;
          membership_plan_id: string | null;
          start_date: string;
          status: "active" | "expiring" | "expired";
        };
        Relationships: [];
        Update: Partial<Database["public"]["Tables"]["memberships"]["Insert"]>;
      };
      membership_plans: {
        Insert: {
          code: string;
          description?: string | null;
          is_active?: boolean;
          lessons_per_month: number;
          name: string;
          sort_order?: number;
        };
        Row: {
          code: string;
          created_at: string;
          description: string | null;
          id: string;
          is_active: boolean;
          lessons_per_month: number;
          name: string;
          sort_order: number;
          updated_at: string;
        };
        Relationships: [];
        Update: Partial<
          Database["public"]["Tables"]["membership_plans"]["Insert"]
        >;
      };
      membership_reminders: {
        Insert: {
          email: string;
          membership_id: string;
          reminder_type: "ended_today" | "deactivation_warning";
          sent_at?: string;
        };
        Row: {
          created_at: string;
          email: string;
          id: string;
          membership_id: string;
          reminder_type: "ended_today" | "deactivation_warning";
          sent_at: string;
        };
        Relationships: [];
        Update: Partial<
          Database["public"]["Tables"]["membership_reminders"]["Insert"]
        >;
      };
      waitlist_entries: {
        Insert: {
          date_of_birth: string;
          email: string;
          full_name: string;
          invited_at?: string | null;
          invited_member_id?: string | null;
          notes?: string | null;
          phone: string;
          preferred_group_id?: string | null;
          status?: "pending" | "invited" | "archived";
        };
        Row: {
          created_at: string;
          date_of_birth: string;
          email: string;
          full_name: string;
          id: string;
          invited_at: string | null;
          invited_member_id: string | null;
          notes: string | null;
          phone: string;
          preferred_group_id: string | null;
          status: "pending" | "invited" | "archived";
          updated_at: string;
        };
        Relationships: [];
        Update: Partial<
          Database["public"]["Tables"]["waitlist_entries"]["Insert"] & {
            updated_at: string;
          }
        >;
      };
      payments: {
        Insert: {
          amount_cop?: number | null;
          confirmed_by?: string | null;
          member_id: string;
          method?: "cash" | "transfer" | "nequi" | "daviplata" | "other";
          notes?: string | null;
          paid_at: string;
          period_end?: string | null;
          period_start?: string | null;
          reviewed_at?: string | null;
          screenshot_url?: string | null;
          source?: "whatsapp" | "front_desk" | "manual";
          status?: "pending" | "approved" | "rejected";
          submitted_by?: string | null;
        };
        Row: {
          amount_cop: number | null;
          confirmed_by: string | null;
          created_at: string;
          id: string;
          member_id: string;
          method: "cash" | "transfer" | "nequi" | "daviplata" | "other";
          notes: string | null;
          paid_at: string;
          period_end: string | null;
          period_start: string | null;
          reviewed_at: string | null;
          screenshot_url: string | null;
          source: "whatsapp" | "front_desk" | "manual";
          status: "pending" | "approved" | "rejected";
          submitted_by: string | null;
        };
        Relationships: [];
        Update: Partial<Database["public"]["Tables"]["payments"]["Insert"]>;
      };
      profiles: {
        Insert: {
          avatar_url?: string | null;
          email: string;
          full_name: string;
          id: string;
          phone?: string | null;
          role?: "admin" | "member";
        };
        Row: {
          avatar_url: string | null;
          email: string;
          full_name: string;
          id: string;
          phone: string | null;
          role: "admin" | "member";
        };
        Relationships: [];
        Update: Partial<
          Database["public"]["Tables"]["profiles"]["Insert"] & {
            updated_at: string;
          }
        >;
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
        Insert: {
          completed_at?: string;
          member_id: string;
          notes?: string | null;
          routine_id?: string | null;
          xp_awarded?: number;
        };
        Row: {
          completed_at: string;
          id: string;
          member_id: string;
          notes: string | null;
          routine_id: string | null;
          xp_awarded: number;
        };
        Relationships: [];
        Update: Partial<Database["public"]["Tables"]["workout_logs"]["Insert"]>;
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
        Insert: {
          arm_cm?: number | null;
          entry_date?: string;
          hip_cm?: number | null;
          leg_cm?: number | null;
          member_id: string;
          photo_url?: string | null;
          waist_cm?: number | null;
          weight_kg?: number | null;
        };
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
        Update: Partial<
          Database["public"]["Tables"]["progress_entries"]["Insert"]
        >;
      };
      training_groups: {
        Insert: {
          capacity: number;
          is_active?: boolean;
          name: string;
          sort_order?: number;
          start_time: string;
        };
        Row: {
          capacity: number;
          created_at: string;
          id: string;
          is_active: boolean;
          name: string;
          sort_order: number;
          start_time: string;
          updated_at: string;
        };
        Relationships: [];
        Update: Partial<
          Database["public"]["Tables"]["training_groups"]["Insert"] & {
            updated_at: string;
          }
        >;
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
    process.env.NEXT_PUBLIC_SUPABASE_URL &&
    process.env.SUPABASE_SERVICE_ROLE_KEY,
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
