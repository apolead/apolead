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
      onboarding_questions: {
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
      probation_training_modules: {
        Row: {
          created_at: string | null
          description: string | null
          id: string
          module_order: number
          title: string
          video_url: string
        }
        Insert: {
          created_at?: string | null
          description?: string | null
          id?: string
          module_order: number
          title: string
          video_url: string
        }
        Update: {
          created_at?: string | null
          description?: string | null
          id?: string
          module_order?: number
          title?: string
          video_url?: string
        }
        Relationships: []
      }
      probation_training_questions: {
        Row: {
          correct_answer: number
          created_at: string | null
          id: string
          module_id: string | null
          options: Json
          question: string
          question_order: number
        }
        Insert: {
          correct_answer: number
          created_at?: string | null
          id?: string
          module_id?: string | null
          options: Json
          question: string
          question_order: number
        }
        Update: {
          correct_answer?: number
          created_at?: string | null
          id?: string
          module_id?: string | null
          options?: Json
          question?: string
          question_order?: number
        }
        Relationships: [
          {
            foreignKeyName: "probation_training_questions_module_id_fkey"
            columns: ["module_id"]
            isOneToOne: false
            referencedRelation: "probation_training_modules"
            referencedColumns: ["id"]
          },
        ]
      }
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
      user_probation_progress: {
        Row: {
          completed: boolean | null
          created_at: string | null
          id: string
          module_id: string
          passed: boolean | null
          score: number | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          completed?: boolean | null
          created_at?: string | null
          id?: string
          module_id: string
          passed?: boolean | null
          score?: number | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          completed?: boolean | null
          created_at?: string | null
          id?: string
          module_id?: string
          passed?: boolean | null
          score?: number | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_probation_progress_module_id_fkey"
            columns: ["module_id"]
            isOneToOne: false
            referencedRelation: "probation_training_modules"
            referencedColumns: ["id"]
          },
        ]
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
          communication_rating: string | null
          complete_training: boolean | null
          cpu_type: string | null
          created_at: string | null
          credentials: string | null
          day_hours: Json | null
          do_not_call_policy_acknowledged: boolean | null
          eligible_for_training: boolean | null
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
          onboarding_completed: boolean | null
          onboarding_date: string | null
          onboarding_score: number | null
          personal_statement: string | null
          policy_acknowledged_at: string | null
          policy_acknowledgment_name: string | null
          probation_training_completed: boolean | null
          probation_training_passed: boolean | null
          quiz_passed: boolean | null
          quiz_score: number | null
          ram_amount: string | null
          routing_number: string | null
          sales_company: string | null
          sales_experience: boolean | null
          sales_months: string | null
          sales_product: string | null
          sales_skills: string | null
          sales_training_watched: boolean | null
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
          telemarketing_policy_acknowledged: boolean | null
          training_video_watched: boolean | null
          updated_at: string | null
          usa_credit_score_watched: boolean | null
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
          communication_rating?: string | null
          complete_training?: boolean | null
          cpu_type?: string | null
          created_at?: string | null
          credentials?: string | null
          day_hours?: Json | null
          do_not_call_policy_acknowledged?: boolean | null
          eligible_for_training?: boolean | null
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
          onboarding_completed?: boolean | null
          onboarding_date?: string | null
          onboarding_score?: number | null
          personal_statement?: string | null
          policy_acknowledged_at?: string | null
          policy_acknowledgment_name?: string | null
          probation_training_completed?: boolean | null
          probation_training_passed?: boolean | null
          quiz_passed?: boolean | null
          quiz_score?: number | null
          ram_amount?: string | null
          routing_number?: string | null
          sales_company?: string | null
          sales_experience?: boolean | null
          sales_months?: string | null
          sales_product?: string | null
          sales_skills?: string | null
          sales_training_watched?: boolean | null
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
          telemarketing_policy_acknowledged?: boolean | null
          training_video_watched?: boolean | null
          updated_at?: string | null
          usa_credit_score_watched?: boolean | null
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
          communication_rating?: string | null
          complete_training?: boolean | null
          cpu_type?: string | null
          created_at?: string | null
          credentials?: string | null
          day_hours?: Json | null
          do_not_call_policy_acknowledged?: boolean | null
          eligible_for_training?: boolean | null
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
          onboarding_completed?: boolean | null
          onboarding_date?: string | null
          onboarding_score?: number | null
          personal_statement?: string | null
          policy_acknowledged_at?: string | null
          policy_acknowledgment_name?: string | null
          probation_training_completed?: boolean | null
          probation_training_passed?: boolean | null
          quiz_passed?: boolean | null
          quiz_score?: number | null
          ram_amount?: string | null
          routing_number?: string | null
          sales_company?: string | null
          sales_experience?: boolean | null
          sales_months?: string | null
          sales_product?: string | null
          sales_skills?: string | null
          sales_training_watched?: boolean | null
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
          telemarketing_policy_acknowledged?: boolean | null
          training_video_watched?: boolean | null
          updated_at?: string | null
          usa_credit_score_watched?: boolean | null
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
        Args: { user_id: string }
        Returns: string
      }
      get_user_credentials: {
        Args: { user_id: string }
        Returns: string
      }
      get_user_profile: {
        Args: { user_id: string }
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
          communication_rating: string | null
          complete_training: boolean | null
          cpu_type: string | null
          created_at: string | null
          credentials: string | null
          day_hours: Json | null
          do_not_call_policy_acknowledged: boolean | null
          eligible_for_training: boolean | null
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
          onboarding_completed: boolean | null
          onboarding_date: string | null
          onboarding_score: number | null
          personal_statement: string | null
          policy_acknowledged_at: string | null
          policy_acknowledgment_name: string | null
          probation_training_completed: boolean | null
          probation_training_passed: boolean | null
          quiz_passed: boolean | null
          quiz_score: number | null
          ram_amount: string | null
          routing_number: string | null
          sales_company: string | null
          sales_experience: boolean | null
          sales_months: string | null
          sales_product: string | null
          sales_skills: string | null
          sales_training_watched: boolean | null
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
          telemarketing_policy_acknowledged: boolean | null
          training_video_watched: boolean | null
          updated_at: string | null
          usa_credit_score_watched: boolean | null
          user_id: string
          zip_code: string | null
        }[]
      }
      get_user_profile_direct: {
        Args: { input_user_id: string }
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
          communication_rating: string | null
          complete_training: boolean | null
          cpu_type: string | null
          created_at: string | null
          credentials: string | null
          day_hours: Json | null
          do_not_call_policy_acknowledged: boolean | null
          eligible_for_training: boolean | null
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
          onboarding_completed: boolean | null
          onboarding_date: string | null
          onboarding_score: number | null
          personal_statement: string | null
          policy_acknowledged_at: string | null
          policy_acknowledgment_name: string | null
          probation_training_completed: boolean | null
          probation_training_passed: boolean | null
          quiz_passed: boolean | null
          quiz_score: number | null
          ram_amount: string | null
          routing_number: string | null
          sales_company: string | null
          sales_experience: boolean | null
          sales_months: string | null
          sales_product: string | null
          sales_skills: string | null
          sales_training_watched: boolean | null
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
          telemarketing_policy_acknowledged: boolean | null
          training_video_watched: boolean | null
          updated_at: string | null
          usa_credit_score_watched: boolean | null
          user_id: string
          zip_code: string | null
        }[]
      }
      get_user_role: {
        Args: { user_id: string }
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
        Args: { profile_user_id: string }
        Returns: boolean
      }
      is_supervisor: {
        Args: { check_user_id: string }
        Returns: boolean
      }
      is_user_on_probation: {
        Args: { input_user_id: string }
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
      update_onboarding_status: {
        Args: { p_user_id: string; p_score: number }
        Returns: undefined
      }
      update_user_profile: {
        Args: { p_user_id: string; p_updates: Json }
        Returns: undefined
      }
      update_user_profile_direct: {
        Args: { input_user_id: string; input_updates: Json }
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

type DefaultSchema = Database[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
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
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
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
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
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
    | { schema: keyof Database },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof Database },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends { schema: keyof Database }
  ? Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {
      app_role: ["agent", "supervisor", "admin"],
    },
  },
} as const
