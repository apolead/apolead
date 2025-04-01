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
      quiz_questions: {
        Row: {
          correct_answer: number
          created_at: string | null
          id: string
          options: Json
          question: string
          updated_at: string | null
        }
        Insert: {
          correct_answer: number
          created_at?: string | null
          id?: string
          options: Json
          question: string
          updated_at?: string | null
        }
        Update: {
          correct_answer?: number
          created_at?: string | null
          id?: string
          options?: Json
          question?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      user_applications: {
        Row: {
          accepted_terms: boolean | null
          application_date: string | null
          application_status: string | null
          available_days: string[] | null
          available_hours: string[] | null
          birth_day: string | null
          check_emails: boolean | null
          complete_training: boolean | null
          cpu_type: string | null
          created_at: string | null
          day_hours: Json | null
          email: string
          first_name: string
          gov_id_image: string | null
          gov_id_number: string | null
          has_headset: boolean | null
          has_quiet_place: boolean | null
          id: string
          last_name: string
          login_discord: boolean | null
          meet_obligation: boolean | null
          personal_statement: string | null
          ram_amount: string | null
          sales_company: string | null
          sales_experience: boolean | null
          sales_months: string | null
          sales_product: string | null
          service_company: string | null
          service_experience: boolean | null
          service_months: string | null
          service_product: string | null
          solve_problems: boolean | null
          speed_test: string | null
          system_settings: string | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          accepted_terms?: boolean | null
          application_date?: string | null
          application_status?: string | null
          available_days?: string[] | null
          available_hours?: string[] | null
          birth_day?: string | null
          check_emails?: boolean | null
          complete_training?: boolean | null
          cpu_type?: string | null
          created_at?: string | null
          day_hours?: Json | null
          email: string
          first_name: string
          gov_id_image?: string | null
          gov_id_number?: string | null
          has_headset?: boolean | null
          has_quiet_place?: boolean | null
          id?: string
          last_name: string
          login_discord?: boolean | null
          meet_obligation?: boolean | null
          personal_statement?: string | null
          ram_amount?: string | null
          sales_company?: string | null
          sales_experience?: boolean | null
          sales_months?: string | null
          sales_product?: string | null
          service_company?: string | null
          service_experience?: boolean | null
          service_months?: string | null
          service_product?: string | null
          solve_problems?: boolean | null
          speed_test?: string | null
          system_settings?: string | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          accepted_terms?: boolean | null
          application_date?: string | null
          application_status?: string | null
          available_days?: string[] | null
          available_hours?: string[] | null
          birth_day?: string | null
          check_emails?: boolean | null
          complete_training?: boolean | null
          cpu_type?: string | null
          created_at?: string | null
          day_hours?: Json | null
          email?: string
          first_name?: string
          gov_id_image?: string | null
          gov_id_number?: string | null
          has_headset?: boolean | null
          has_quiet_place?: boolean | null
          id?: string
          last_name?: string
          login_discord?: boolean | null
          meet_obligation?: boolean | null
          personal_statement?: string | null
          ram_amount?: string | null
          sales_company?: string | null
          sales_experience?: boolean | null
          sales_months?: string | null
          sales_product?: string | null
          service_company?: string | null
          service_experience?: boolean | null
          service_months?: string | null
          service_product?: string | null
          solve_problems?: boolean | null
          speed_test?: string | null
          system_settings?: string | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      user_onboarding: {
        Row: {
          created_at: string | null
          final_quiz_passed: boolean | null
          id: string
          interview_scheduled: boolean | null
          quiz_score: number | null
          training_completed: boolean | null
          updated_at: string | null
          user_id: string
          welcome_completed: boolean | null
        }
        Insert: {
          created_at?: string | null
          final_quiz_passed?: boolean | null
          id?: string
          interview_scheduled?: boolean | null
          quiz_score?: number | null
          training_completed?: boolean | null
          updated_at?: string | null
          user_id: string
          welcome_completed?: boolean | null
        }
        Update: {
          created_at?: string | null
          final_quiz_passed?: boolean | null
          id?: string
          interview_scheduled?: boolean | null
          quiz_score?: number | null
          training_completed?: boolean | null
          updated_at?: string | null
          user_id?: string
          welcome_completed?: boolean | null
        }
        Relationships: []
      }
      user_profiles: {
        Row: {
          accepted_terms: boolean | null
          account_holder_name: string | null
          account_number: string | null
          account_type: string | null
          address_line1: string | null
          address_line2: string | null
          agent_id: string | null
          agent_standing: string | null
          application_date: string | null
          application_status: string | null
          available_days: string[] | null
          available_hours: string[] | null
          bank_name: string | null
          birth_day: string | null
          check_emails: boolean | null
          city: string | null
          complete_training: boolean | null
          cpu_type: string | null
          created_at: string | null
          credentials: string | null
          day_hours: Json | null
          email: string
          first_name: string
          gov_id_image: string | null
          gov_id_number: string | null
          has_headset: boolean | null
          has_quiet_place: boolean | null
          id: string
          last_name: string
          lead_source: string | null
          login_discord: boolean | null
          meet_obligation: boolean | null
          personal_statement: string | null
          quiz_passed: boolean | null
          quiz_score: number | null
          ram_amount: string | null
          routing_number: string | null
          sales_company: string | null
          sales_experience: boolean | null
          sales_months: string | null
          sales_product: string | null
          service_company: string | null
          service_experience: boolean | null
          service_months: string | null
          service_product: string | null
          solve_problems: boolean | null
          speed_test: string | null
          ssn_last_four: string | null
          start_date: string | null
          state: string | null
          supervisor_notes: string | null
          system_settings: string | null
          training_video_watched: boolean | null
          updated_at: string | null
          user_id: string
          zip_code: string | null
        }
        Insert: {
          accepted_terms?: boolean | null
          account_holder_name?: string | null
          account_number?: string | null
          account_type?: string | null
          address_line1?: string | null
          address_line2?: string | null
          agent_id?: string | null
          agent_standing?: string | null
          application_date?: string | null
          application_status?: string | null
          available_days?: string[] | null
          available_hours?: string[] | null
          bank_name?: string | null
          birth_day?: string | null
          check_emails?: boolean | null
          city?: string | null
          complete_training?: boolean | null
          cpu_type?: string | null
          created_at?: string | null
          credentials?: string | null
          day_hours?: Json | null
          email: string
          first_name: string
          gov_id_image?: string | null
          gov_id_number?: string | null
          has_headset?: boolean | null
          has_quiet_place?: boolean | null
          id?: string
          last_name: string
          lead_source?: string | null
          login_discord?: boolean | null
          meet_obligation?: boolean | null
          personal_statement?: string | null
          quiz_passed?: boolean | null
          quiz_score?: number | null
          ram_amount?: string | null
          routing_number?: string | null
          sales_company?: string | null
          sales_experience?: boolean | null
          sales_months?: string | null
          sales_product?: string | null
          service_company?: string | null
          service_experience?: boolean | null
          service_months?: string | null
          service_product?: string | null
          solve_problems?: boolean | null
          speed_test?: string | null
          ssn_last_four?: string | null
          start_date?: string | null
          state?: string | null
          supervisor_notes?: string | null
          system_settings?: string | null
          training_video_watched?: boolean | null
          updated_at?: string | null
          user_id: string
          zip_code?: string | null
        }
        Update: {
          accepted_terms?: boolean | null
          account_holder_name?: string | null
          account_number?: string | null
          account_type?: string | null
          address_line1?: string | null
          address_line2?: string | null
          agent_id?: string | null
          agent_standing?: string | null
          application_date?: string | null
          application_status?: string | null
          available_days?: string[] | null
          available_hours?: string[] | null
          bank_name?: string | null
          birth_day?: string | null
          check_emails?: boolean | null
          city?: string | null
          complete_training?: boolean | null
          cpu_type?: string | null
          created_at?: string | null
          credentials?: string | null
          day_hours?: Json | null
          email?: string
          first_name?: string
          gov_id_image?: string | null
          gov_id_number?: string | null
          has_headset?: boolean | null
          has_quiet_place?: boolean | null
          id?: string
          last_name?: string
          lead_source?: string | null
          login_discord?: boolean | null
          meet_obligation?: boolean | null
          personal_statement?: string | null
          quiz_passed?: boolean | null
          quiz_score?: number | null
          ram_amount?: string | null
          routing_number?: string | null
          sales_company?: string | null
          sales_experience?: boolean | null
          sales_months?: string | null
          sales_product?: string | null
          service_company?: string | null
          service_experience?: boolean | null
          service_months?: string | null
          service_product?: string | null
          solve_problems?: boolean | null
          speed_test?: string | null
          ssn_last_four?: string | null
          start_date?: string | null
          state?: string | null
          supervisor_notes?: string | null
          system_settings?: string | null
          training_video_watched?: boolean | null
          updated_at?: string | null
          user_id?: string
          zip_code?: string | null
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      get_application_status: {
        Args: {
          user_id: string
        }
        Returns: string
      }
      get_user_credentials: {
        Args: {
          user_id: string
        }
        Returns: string
      }
      get_user_profile: {
        Args: {
          user_id: string
        }
        Returns: {
          accepted_terms: boolean | null
          account_holder_name: string | null
          account_number: string | null
          account_type: string | null
          address_line1: string | null
          address_line2: string | null
          agent_id: string | null
          agent_standing: string | null
          application_date: string | null
          application_status: string | null
          available_days: string[] | null
          available_hours: string[] | null
          bank_name: string | null
          birth_day: string | null
          check_emails: boolean | null
          city: string | null
          complete_training: boolean | null
          cpu_type: string | null
          created_at: string | null
          credentials: string | null
          day_hours: Json | null
          email: string
          first_name: string
          gov_id_image: string | null
          gov_id_number: string | null
          has_headset: boolean | null
          has_quiet_place: boolean | null
          id: string
          last_name: string
          lead_source: string | null
          login_discord: boolean | null
          meet_obligation: boolean | null
          personal_statement: string | null
          quiz_passed: boolean | null
          quiz_score: number | null
          ram_amount: string | null
          routing_number: string | null
          sales_company: string | null
          sales_experience: boolean | null
          sales_months: string | null
          sales_product: string | null
          service_company: string | null
          service_experience: boolean | null
          service_months: string | null
          service_product: string | null
          solve_problems: boolean | null
          speed_test: string | null
          ssn_last_four: string | null
          start_date: string | null
          state: string | null
          supervisor_notes: string | null
          system_settings: string | null
          training_video_watched: boolean | null
          updated_at: string | null
          user_id: string
          zip_code: string | null
        }[]
      }
      get_user_profile_direct: {
        Args: {
          input_user_id: string
        }
        Returns: {
          accepted_terms: boolean | null
          account_holder_name: string | null
          account_number: string | null
          account_type: string | null
          address_line1: string | null
          address_line2: string | null
          agent_id: string | null
          agent_standing: string | null
          application_date: string | null
          application_status: string | null
          available_days: string[] | null
          available_hours: string[] | null
          bank_name: string | null
          birth_day: string | null
          check_emails: boolean | null
          city: string | null
          complete_training: boolean | null
          cpu_type: string | null
          created_at: string | null
          credentials: string | null
          day_hours: Json | null
          email: string
          first_name: string
          gov_id_image: string | null
          gov_id_number: string | null
          has_headset: boolean | null
          has_quiet_place: boolean | null
          id: string
          last_name: string
          lead_source: string | null
          login_discord: boolean | null
          meet_obligation: boolean | null
          personal_statement: string | null
          quiz_passed: boolean | null
          quiz_score: number | null
          ram_amount: string | null
          routing_number: string | null
          sales_company: string | null
          sales_experience: boolean | null
          sales_months: string | null
          sales_product: string | null
          service_company: string | null
          service_experience: boolean | null
          service_months: string | null
          service_product: string | null
          solve_problems: boolean | null
          speed_test: string | null
          ssn_last_four: string | null
          start_date: string | null
          state: string | null
          supervisor_notes: string | null
          system_settings: string | null
          training_video_watched: boolean | null
          updated_at: string | null
          user_id: string
          zip_code: string | null
        }[]
      }
      get_user_role: {
        Args: {
          user_id: string
        }
        Returns: Database["public"]["Enums"]["app_role"]
      }
      has_role: {
        Args: {
          _user_id: string
          _role: Database["public"]["Enums"]["app_role"]
        }
        Returns: boolean
      }
      is_profile_owner: {
        Args: {
          profile_user_id: string
        }
        Returns: boolean
      }
      is_supervisor: {
        Args: {
          check_user_id: string
        }
        Returns: boolean
      }
      update_billing_information: {
        Args: {
          p_user_id: string
          p_bank_name: string
          p_account_number: string
          p_routing_number: string
          p_account_holder_name: string
          p_account_type: string
          p_address_line1: string
          p_address_line2: string
          p_city: string
          p_state: string
          p_zip_code: string
          p_ssn_last_four: string
        }
        Returns: undefined
      }
      update_user_profile: {
        Args: {
          p_user_id: string
          p_updates: Json
        }
        Returns: undefined
      }
      update_user_profile_direct: {
        Args: {
          input_user_id: string
          input_updates: Json
        }
        Returns: undefined
      }
    }
    Enums: {
      app_role: "agent" | "supervisor" | "admin"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type PublicSchema = Database[Extract<keyof Database, "public">]

export type Tables<
  PublicTableNameOrOptions extends
    | keyof (PublicSchema["Tables"] & PublicSchema["Views"])
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof (Database[PublicTableNameOrOptions["schema"]]["Tables"] &
        Database[PublicTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? (Database[PublicTableNameOrOptions["schema"]]["Tables"] &
      Database[PublicTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : PublicTableNameOrOptions extends keyof (PublicSchema["Tables"] &
        PublicSchema["Views"])
    ? (PublicSchema["Tables"] &
        PublicSchema["Views"])[PublicTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  PublicTableNameOrOptions extends
    | keyof PublicSchema["Tables"]
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? Database[PublicTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : PublicTableNameOrOptions extends keyof PublicSchema["Tables"]
    ? PublicSchema["Tables"][PublicTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  PublicTableNameOrOptions extends
    | keyof PublicSchema["Tables"]
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? Database[PublicTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : PublicTableNameOrOptions extends keyof PublicSchema["Tables"]
    ? PublicSchema["Tables"][PublicTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  PublicEnumNameOrOptions extends
    | keyof PublicSchema["Enums"]
    | { schema: keyof Database },
  EnumName extends PublicEnumNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = PublicEnumNameOrOptions extends { schema: keyof Database }
  ? Database[PublicEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : PublicEnumNameOrOptions extends keyof PublicSchema["Enums"]
    ? PublicSchema["Enums"][PublicEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof PublicSchema["CompositeTypes"]
    | { schema: keyof Database },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends { schema: keyof Database }
  ? Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof PublicSchema["CompositeTypes"]
    ? PublicSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never
