
import { Json } from "@/integrations/supabase/types";

export interface TrainingModule {
  id: string;
  title: string;
  description: string;
  video_url: string;
  has_quiz: boolean;
  module_order: number;
  created_at?: string;
  updated_at?: string;
}

export interface ModuleQuestion {
  id: string;
  module_id: string;
  question: string;
  options: string[];
  correct_answer: number;
  question_order: number;
  created_at?: string;
  updated_at?: string;
}

export interface UserModuleProgress {
  id?: string;
  user_id: string;
  module_id: string;
  completed: boolean;
  score: number;
  passed: boolean;
  completed_at?: string;
  created_at?: string;
  updated_at?: string;
}

export interface IsUserOnProbationResult {
  is_user_on_probation: boolean;
}
