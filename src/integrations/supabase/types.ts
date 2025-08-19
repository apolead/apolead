export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "12.2.3 (519615d)"
  }
  public: {
    Tables: {
      approved_leads: {
        Row: {
          address: string | null
          city: string | null
          created_at: string | null
          credit_rating: string | null
          download_index: number
          email: string | null
          external_system_id: string | null
          external_system_response: Json | null
          first_name: string | null
          id: string
          ip: string | null
          last_name: string | null
          lead_id_original: string | null
          lead_type: string | null
          phone: string | null
          provider: string | null
          raw_lead_id: string | null
          sent_to_dialer: boolean | null
          source: string | null
          state: string | null
          time_stamp: string | null
          validation_result: Json | null
          zip: string | null
        }
        Insert: {
          address?: string | null
          city?: string | null
          created_at?: string | null
          credit_rating?: string | null
          download_index?: number
          email?: string | null
          external_system_id?: string | null
          external_system_response?: Json | null
          first_name?: string | null
          id?: string
          ip?: string | null
          last_name?: string | null
          lead_id_original?: string | null
          lead_type?: string | null
          phone?: string | null
          provider?: string | null
          raw_lead_id?: string | null
          sent_to_dialer?: boolean | null
          source?: string | null
          state?: string | null
          time_stamp?: string | null
          validation_result?: Json | null
          zip?: string | null
        }
        Update: {
          address?: string | null
          city?: string | null
          created_at?: string | null
          credit_rating?: string | null
          download_index?: number
          email?: string | null
          external_system_id?: string | null
          external_system_response?: Json | null
          first_name?: string | null
          id?: string
          ip?: string | null
          last_name?: string | null
          lead_id_original?: string | null
          lead_type?: string | null
          phone?: string | null
          provider?: string | null
          raw_lead_id?: string | null
          sent_to_dialer?: boolean | null
          source?: string | null
          state?: string | null
          time_stamp?: string | null
          validation_result?: Json | null
          zip?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "approved_leads_raw_lead_id_fkey"
            columns: ["raw_lead_id"]
            isOneToOne: false
            referencedRelation: "raw_leads"
            referencedColumns: ["id"]
          },
        ]
      }
      call_logs: {
        Row: {
          abbreviation: string | null
          address: string | null
          agent_name: string | null
          call_log_id: string | null
          call_notes: string | null
          city: string | null
          consent_date: string | null
          country: string | null
          created_at: string | null
          credit_rating: string | null
          credit_repair: string | null
          email: string | null
          first_name: string | null
          ip: string | null
          jornaya: string | null
          last_name: string | null
          lead_id: string | null
          log_time: string | null
          log_type: string | null
          partner: string | null
          ph_10: string | null
          ph_2: string | null
          ph_3: string | null
          ph_4: string | null
          ph_5: string | null
          ph_6: string | null
          ph_7: string | null
          ph_8: string | null
          ph_9: string | null
          phone: string | null
          recording_end: string | null
          recording_start: string | null
          scheduled_time: string | null
          sent_to: string | null
          state: string | null
          timestamp: string | null
          type: string | null
          zip_code: string | null
        }
        Insert: {
          abbreviation?: string | null
          address?: string | null
          agent_name?: string | null
          call_log_id?: string | null
          call_notes?: string | null
          city?: string | null
          consent_date?: string | null
          country?: string | null
          created_at?: string | null
          credit_rating?: string | null
          credit_repair?: string | null
          email?: string | null
          first_name?: string | null
          ip?: string | null
          jornaya?: string | null
          last_name?: string | null
          lead_id?: string | null
          log_time?: string | null
          log_type?: string | null
          partner?: string | null
          ph_10?: string | null
          ph_2?: string | null
          ph_3?: string | null
          ph_4?: string | null
          ph_5?: string | null
          ph_6?: string | null
          ph_7?: string | null
          ph_8?: string | null
          ph_9?: string | null
          phone?: string | null
          recording_end?: string | null
          recording_start?: string | null
          scheduled_time?: string | null
          sent_to?: string | null
          state?: string | null
          timestamp?: string | null
          type?: string | null
          zip_code?: string | null
        }
        Update: {
          abbreviation?: string | null
          address?: string | null
          agent_name?: string | null
          call_log_id?: string | null
          call_notes?: string | null
          city?: string | null
          consent_date?: string | null
          country?: string | null
          created_at?: string | null
          credit_rating?: string | null
          credit_repair?: string | null
          email?: string | null
          first_name?: string | null
          ip?: string | null
          jornaya?: string | null
          last_name?: string | null
          lead_id?: string | null
          log_time?: string | null
          log_type?: string | null
          partner?: string | null
          ph_10?: string | null
          ph_2?: string | null
          ph_3?: string | null
          ph_4?: string | null
          ph_5?: string | null
          ph_6?: string | null
          ph_7?: string | null
          ph_8?: string | null
          ph_9?: string | null
          phone?: string | null
          recording_end?: string | null
          recording_start?: string | null
          scheduled_time?: string | null
          sent_to?: string | null
          state?: string | null
          timestamp?: string | null
          type?: string | null
          zip_code?: string | null
        }
        Relationships: []
      }
      credit_saint_lead_data: {
        Row: {
          created_at: string | null
          "Date of CLAIM": string | null
          Duration: string | null
          id: number
          "Last contact": string | null
          Phone: string | null
          Received: string | null
          "Spoken O": string | null
          "Spoken P": string | null
          State: string | null
          Status: string | null
          SubID: string | null
          SubID2: string | null
          Timezone: string | null
          Type: string | null
        }
        Insert: {
          created_at?: string | null
          "Date of CLAIM"?: string | null
          Duration?: string | null
          id?: number
          "Last contact"?: string | null
          Phone?: string | null
          Received?: string | null
          "Spoken O"?: string | null
          "Spoken P"?: string | null
          State?: string | null
          Status?: string | null
          SubID?: string | null
          SubID2?: string | null
          Timezone?: string | null
          Type?: string | null
        }
        Update: {
          created_at?: string | null
          "Date of CLAIM"?: string | null
          Duration?: string | null
          id?: number
          "Last contact"?: string | null
          Phone?: string | null
          Received?: string | null
          "Spoken O"?: string | null
          "Spoken P"?: string | null
          State?: string | null
          Status?: string | null
          SubID?: string | null
          SubID2?: string | null
          Timezone?: string | null
          Type?: string | null
        }
        Relationships: []
      }
      duplicate_leads: {
        Row: {
          address: string | null
          city: string | null
          created_at: string | null
          credit_rating: string | null
          duplicate_type: string | null
          email: string | null
          first_name: string | null
          id: string
          ip: string | null
          last_name: string | null
          lead_type: string | null
          original_lead_id: string | null
          phone: string | null
          provider: string | null
          raw_data: Json | null
          source: string | null
          state: string | null
          status: string | null
          time_stamp: string | null
          zip: string | null
        }
        Insert: {
          address?: string | null
          city?: string | null
          created_at?: string | null
          credit_rating?: string | null
          duplicate_type?: string | null
          email?: string | null
          first_name?: string | null
          id?: string
          ip?: string | null
          last_name?: string | null
          lead_type?: string | null
          original_lead_id?: string | null
          phone?: string | null
          provider?: string | null
          raw_data?: Json | null
          source?: string | null
          state?: string | null
          status?: string | null
          time_stamp?: string | null
          zip?: string | null
        }
        Update: {
          address?: string | null
          city?: string | null
          created_at?: string | null
          credit_rating?: string | null
          duplicate_type?: string | null
          email?: string | null
          first_name?: string | null
          id?: string
          ip?: string | null
          last_name?: string | null
          lead_type?: string | null
          original_lead_id?: string | null
          phone?: string | null
          provider?: string | null
          raw_data?: Json | null
          source?: string | null
          state?: string | null
          status?: string | null
          time_stamp?: string | null
          zip?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "duplicate_leads_original_lead_id_fkey"
            columns: ["original_lead_id"]
            isOneToOne: false
            referencedRelation: "raw_leads"
            referencedColumns: ["id"]
          },
        ]
      }
      live_leads: {
        Row: {
          address: string | null
          approved_lead_id: string | null
          city: string | null
          created_at: string | null
          credit_rating: string | null
          download_index: number | null
          email: string | null
          external_system_id: string | null
          external_system_response: Json | null
          first_name: string | null
          id: string | null
          ip: string | null
          last_name: string | null
          lead_id_original: string | null
          lead_type: string | null
          phone: string | null
          provider: string | null
          raw_lead_id: string | null
          sent_to_dialer: boolean | null
          source: string | null
          state: string | null
          time_stamp: string | null
          validation_result: Json | null
          zip: string | null
        }
        Insert: {
          address?: string | null
          approved_lead_id?: string | null
          city?: string | null
          created_at?: string | null
          credit_rating?: string | null
          download_index?: number | null
          email?: string | null
          external_system_id?: string | null
          external_system_response?: Json | null
          first_name?: string | null
          id?: string | null
          ip?: string | null
          last_name?: string | null
          lead_id_original?: string | null
          lead_type?: string | null
          phone?: string | null
          provider?: string | null
          raw_lead_id?: string | null
          sent_to_dialer?: boolean | null
          source?: string | null
          state?: string | null
          time_stamp?: string | null
          validation_result?: Json | null
          zip?: string | null
        }
        Update: {
          address?: string | null
          approved_lead_id?: string | null
          city?: string | null
          created_at?: string | null
          credit_rating?: string | null
          download_index?: number | null
          email?: string | null
          external_system_id?: string | null
          external_system_response?: Json | null
          first_name?: string | null
          id?: string | null
          ip?: string | null
          last_name?: string | null
          lead_id_original?: string | null
          lead_type?: string | null
          phone?: string | null
          provider?: string | null
          raw_lead_id?: string | null
          sent_to_dialer?: boolean | null
          source?: string | null
          state?: string | null
          time_stamp?: string | null
          validation_result?: Json | null
          zip?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "live_leads_approved_lead_id_fkey"
            columns: ["approved_lead_id"]
            isOneToOne: false
            referencedRelation: "approved_leads"
            referencedColumns: ["id"]
          },
        ]
      }
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
      raw_leads: {
        Row: {
          address: string | null
          city: string | null
          created_at: string | null
          credit_rating: string | null
          download_index: number
          email: string | null
          first_name: string | null
          id: string
          ip: string | null
          last_name: string | null
          lead_id_original: string | null
          lead_type: string | null
          phone: string | null
          provider: string | null
          raw_data: Json | null
          source: string | null
          state: string | null
          status: string | null
          time_stamp: string | null
          updated_at: string | null
          zip: string | null
        }
        Insert: {
          address?: string | null
          city?: string | null
          created_at?: string | null
          credit_rating?: string | null
          download_index?: number
          email?: string | null
          first_name?: string | null
          id?: string
          ip?: string | null
          last_name?: string | null
          lead_id_original?: string | null
          lead_type?: string | null
          phone?: string | null
          provider?: string | null
          raw_data?: Json | null
          source?: string | null
          state?: string | null
          status?: string | null
          time_stamp?: string | null
          updated_at?: string | null
          zip?: string | null
        }
        Update: {
          address?: string | null
          city?: string | null
          created_at?: string | null
          credit_rating?: string | null
          download_index?: number
          email?: string | null
          first_name?: string | null
          id?: string
          ip?: string | null
          last_name?: string | null
          lead_id_original?: string | null
          lead_type?: string | null
          phone?: string | null
          provider?: string | null
          raw_data?: Json | null
          source?: string | null
          state?: string | null
          status?: string | null
          time_stamp?: string | null
          updated_at?: string | null
          zip?: string | null
        }
        Relationships: []
      }
      rejected_leads: {
        Row: {
          address: string | null
          approved_lead_id: string | null
          city: string | null
          created_at: string | null
          credit_rating: string | null
          email: string | null
          first_name: string | null
          id: string
          ip: string | null
          last_name: string | null
          lead_type: string | null
          phone: string | null
          provider: string | null
          raw_lead_id: string | null
          rejection_reason: string | null
          source: string | null
          state: string | null
          time_stamp: string | null
          validation_result: Json | null
          zip: string | null
        }
        Insert: {
          address?: string | null
          approved_lead_id?: string | null
          city?: string | null
          created_at?: string | null
          credit_rating?: string | null
          email?: string | null
          first_name?: string | null
          id?: string
          ip?: string | null
          last_name?: string | null
          lead_type?: string | null
          phone?: string | null
          provider?: string | null
          raw_lead_id?: string | null
          rejection_reason?: string | null
          source?: string | null
          state?: string | null
          time_stamp?: string | null
          validation_result?: Json | null
          zip?: string | null
        }
        Update: {
          address?: string | null
          approved_lead_id?: string | null
          city?: string | null
          created_at?: string | null
          credit_rating?: string | null
          email?: string | null
          first_name?: string | null
          id?: string
          ip?: string | null
          last_name?: string | null
          lead_type?: string | null
          phone?: string | null
          provider?: string | null
          raw_lead_id?: string | null
          rejection_reason?: string | null
          source?: string | null
          state?: string | null
          time_stamp?: string | null
          validation_result?: Json | null
          zip?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "rejected_leads_approved_lead_id_fkey"
            columns: ["approved_lead_id"]
            isOneToOne: false
            referencedRelation: "approved_leads"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "rejected_leads_raw_lead_id_fkey"
            columns: ["raw_lead_id"]
            isOneToOne: false
            referencedRelation: "raw_leads"
            referencedColumns: ["id"]
          },
        ]
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
      bytea_to_text: {
        Args: { data: string }
        Returns: string
      }
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
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
      http: {
        Args: { request: Database["public"]["CompositeTypes"]["http_request"] }
        Returns: Database["public"]["CompositeTypes"]["http_response"]
      }
      http_delete: {
        Args:
          | { content: string; content_type: string; uri: string }
          | { uri: string }
        Returns: Database["public"]["CompositeTypes"]["http_response"]
      }
      http_get: {
        Args: { data: Json; uri: string } | { uri: string }
        Returns: Database["public"]["CompositeTypes"]["http_response"]
      }
      http_head: {
        Args: { uri: string }
        Returns: Database["public"]["CompositeTypes"]["http_response"]
      }
      http_header: {
        Args: { field: string; value: string }
        Returns: Database["public"]["CompositeTypes"]["http_header"]
      }
      http_list_curlopt: {
        Args: Record<PropertyKey, never>
        Returns: {
          curlopt: string
          value: string
        }[]
      }
      http_patch: {
        Args: { content: string; content_type: string; uri: string }
        Returns: Database["public"]["CompositeTypes"]["http_response"]
      }
      http_post: {
        Args:
          | { content: string; content_type: string; uri: string }
          | { data: Json; uri: string }
        Returns: Database["public"]["CompositeTypes"]["http_response"]
      }
      http_put: {
        Args: { content: string; content_type: string; uri: string }
        Returns: Database["public"]["CompositeTypes"]["http_response"]
      }
      http_reset_curlopt: {
        Args: Record<PropertyKey, never>
        Returns: boolean
      }
      http_set_curlopt: {
        Args: { curlopt: string; value: string }
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
      text_to_bytea: {
        Args: { data: string }
        Returns: string
      }
      update_billing_information: {
        Args: {
          p_account_holder_name: string
          p_account_number: string
          p_account_type: string
          p_address_line1: string
          p_address_line2: string
          p_bank_name: string
          p_city: string
          p_routing_number: string
          p_ssn_last_four: string
          p_state: string
          p_user_id: string
          p_zip_code: string
        }
        Returns: undefined
      }
      update_onboarding_status: {
        Args: { p_score: number; p_user_id: string }
        Returns: undefined
      }
      update_user_profile: {
        Args: { p_updates: Json; p_user_id: string }
        Returns: undefined
      }
      update_user_profile_direct: {
        Args: { input_updates: Json; input_user_id: string }
        Returns: undefined
      }
      urlencode: {
        Args: { data: Json } | { string: string } | { string: string }
        Returns: string
      }
    }
    Enums: {
      app_role: "agent" | "supervisor" | "admin"
    }
    CompositeTypes: {
      http_header: {
        field: string | null
        value: string | null
      }
      http_request: {
        method: unknown | null
        uri: string | null
        headers: Database["public"]["CompositeTypes"]["http_header"][] | null
        content_type: string | null
        content: string | null
      }
      http_response: {
        status: number | null
        content_type: string | null
        headers: Database["public"]["CompositeTypes"]["http_header"][] | null
        content: string | null
      }
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
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
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
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
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
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
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
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
