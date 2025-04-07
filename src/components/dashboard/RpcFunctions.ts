
interface IsUserOnProbationResult {
  is_user_on_probation: boolean;
}

export const checkUserProbationStatus = async (userId: string) => {
  try {
    const { data, error } = await supabase.rpc('is_user_on_probation', {
      input_user_id: userId
    });
    
    if (error) throw error;
    
    return !!data;
  } catch (error) {
    console.error("Error checking probation status:", error);
    return false;
  }
};
