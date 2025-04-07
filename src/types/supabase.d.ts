
export interface ProbationTrainingModule {
  id: string;
  title: string;
  description: string | null;
  video_url: string;
  module_order: number;
  created_at?: string;
}

export interface ProbationTrainingQuestion {
  id: string;
  module_id: string;
  question: string;
  options: string[];
  correct_answer: number;
  question_order: number;
  created_at?: string;
}

export interface UserProbationProgress {
  user_id: string;
  completed: boolean;
  score: number;
  passed: boolean;
  completed_at?: string;
  created_at?: string;
}

// Add to existing types as needed
