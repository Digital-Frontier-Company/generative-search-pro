
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export interface UserCreditInfo {
  user_id: string;
  email: string;
  monthly_credits: number;
  credits_used: number;
  remaining_credits: number;
  subscription_type: string;
}

// Fetch all users' credit information
export const getUserCreditsInfo = async (): Promise<UserCreditInfo[]> => {
  try {
    // First try to get from the admin_user_credits view which has aggregated data
    const { data: viewData, error: viewError } = await supabase
      .from('admin_user_credits')
      .select('*');
    
    if (viewData && viewData.length > 0) {
      // Transform the data to match our interface
      return viewData.map(user => ({
        user_id: user.user_id,
        email: user.email,
        monthly_credits: user.monthly_credits || 0,
        credits_used: user.credits_used || 0,
        remaining_credits: user.remaining_credits || 0,
        subscription_type: user.subscription_type || 'free'
      }));
    }
    
    // If the view doesn't exist or returns no data, fall back to joining tables manually
    const { data, error } = await supabase
      .from('user_subscriptions')
      .select(`
        user_id,
        monthly_credits,
        credits_used,
        subscription_type,
        auth.users!user_subscriptions_user_id_fkey (email)
      `);
    
    if (error) {
      console.error("Error fetching user credits info:", error);
      toast.error("Failed to load user information");
      return [];
    }
    
    // Transform the joined data to match our interface
    return (data || []).map(user => ({
      user_id: user.user_id,
      email: user.users?.email || 'Unknown email',
      monthly_credits: user.monthly_credits,
      credits_used: user.credits_used,
      remaining_credits: user.monthly_credits - user.credits_used,
      subscription_type: user.subscription_type
    }));
  } catch (error) {
    console.error("Unexpected error in getUserCreditsInfo:", error);
    toast.error("An unexpected error occurred while loading user data");
    return [];
  }
};

// Add credits to a user
export const addUserCredits = async (email: string, amount: number): Promise<boolean> => {
  try {
    const { data, error } = await supabase.functions.invoke('add-credits', {
      body: { email, credits: amount }
    });

    if (error) {
      console.error("Error adding credits:", error);
      toast.error("Failed to add credits: " + error.message);
      return false;
    }
    
    toast.success(`Successfully added ${amount} credits to ${email}`);
    return true;
  } catch (error) {
    console.error("Unexpected error in addUserCredits:", error);
    toast.error("An unexpected error occurred while adding credits");
    return false;
  }
};
