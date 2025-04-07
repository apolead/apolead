
import { Json } from '@/integrations/supabase/types';

export interface ProbationTrainingModule {
  id: string;
  title: string;
  description: string | null;
  video_url: string;
  module_order: number;
  created_at?: string | null;
}

export interface ProbationTrainingQuestion {
  id: string;
  question: string;
  options: string[];
  correct_answer: number;
  module_id: string;
  question_order: number;
  created_at?: string | null;
}

export interface UserProbationProgress {
  id?: string;
  user_id: string;
  module_id: string;
  completed: boolean;
  passed: boolean | null;
  score: number | null;
  created_at?: string;
  updated_at?: string;
}
