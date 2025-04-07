
import { supabase } from '@/integrations/supabase/client';
import { additionalTrainingModules, additionalTrainingQuestions } from '@/hooks/useAdditionalTrainingData';

export const loadAdditionalTrainingData = async () => {
  // Check if data already exists
  const { data: existingModules } = await supabase
    .from('probation_training_modules')
    .select('id')
    .limit(1);
  
  if (existingModules && existingModules.length > 0) {
    console.log('Additional training data already exists in the database');
    return;
  }
  
  console.log('Loading additional training data into the database...');
  
  // Insert modules
  const { error: modulesError } = await supabase
    .from('probation_training_modules')
    .insert(additionalTrainingModules);
  
  if (modulesError) {
    console.error('Error inserting modules:', modulesError);
    return;
  }
  
  // Insert questions
  const { error: questionsError } = await supabase
    .from('probation_training_questions')
    .insert(additionalTrainingQuestions);
  
  if (questionsError) {
    console.error('Error inserting questions:', questionsError);
    return;
  }
  
  console.log('Successfully loaded additional training data');
};
