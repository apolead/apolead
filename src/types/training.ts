
import { Json } from "@/integrations/supabase/types";

export interface TrainingModule {
  id: string;
  title: string;
  description: string | null;
  video_url: string;
  module_order: number;
  has_quiz: boolean;
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
  score?: number | null;
  passed?: boolean | null;
  answers?: Record<string, number> | null;
  started_at?: string;
  completed_at?: string | null;
}
