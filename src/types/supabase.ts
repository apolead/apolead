
import { Json } from "@/integrations/supabase/types";

export interface ITrainingModulesTable {
  id: string;
  title: string;
  description: string | null;
  video_url: string;
  has_quiz: boolean;
  module_order: number;
  created_at?: string;
}

export interface IModuleQuestionsTable {
  id: string;
  module_id: string;
  question: string;
  options: string[];
  correct_answer: number;
  question_order: number;
  created_at?: string;
}

export interface IUserModuleProgressTable {
  user_id: string;
  module_id: string;
  completed: boolean;
  score: number;
  passed: boolean;
  completed_at?: string;
  created_at?: string;
}

// Define RPC function types
export interface SupabaseRpcFunctions {
  get_application_status: (args: { user_id: string }) => Promise<string>;
  get_user_credentials: (args: { user_id: string }) => Promise<string>;
  get_user_profile: (args: { user_id: string }) => Promise<any>;
  get_user_profile_direct: (args: { input_user_id: string }) => Promise<any>;
  get_user_role: (args: { user_id: string }) => Promise<any>;
  has_role: (args: { _user_id: string; _role: string }) => Promise<boolean>;
  is_profile_owner: (args: { profile_user_id: string }) => Promise<boolean>;
  is_supervisor: (args: { check_user_id: string }) => Promise<boolean>;
  is_user_on_probation: (args: { input_user_id: string }) => Promise<boolean>;
  update_billing_information: (args: any) => Promise<void>;
  update_onboarding_status: (args: { p_user_id: string; p_score: number }) => Promise<void>;
  update_user_profile: (args: { p_user_id: string; p_updates: any }) => Promise<void>;
  update_user_profile_direct: (args: { input_user_id: string; input_updates: any }) => Promise<void>;
}
