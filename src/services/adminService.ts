
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
      console.log("Admin view data found:", viewData);
      // Transform the data to match our interface
      return viewData.map(user => ({
        user_id: user.user_id,
        email: user.email || user.user_id,
        monthly_credits: user.monthly_credits || 0,
        credits_used: user.credits_used || 0,
        remaining_credits: user.remaining_credits || 0,
        subscription_type: user.subscription_type || 'free'
      }));
    }
    
    console.log("No admin view data found, falling back to manual join");
    
    // If the view doesn't exist, fetch users first by direct query
    // Note: We're not using auth_users_view anymore since it's not in the types
    const { data: subscriptionData, error: subError } = await supabase
      .from('user_subscriptions')
      .select('*');
    
    if (subError) {
      console.error("Error fetching user subscriptions:", subError);
      toast.error("Failed to load user subscription information");
      return [];
    }

    if (!subscriptionData || subscriptionData.length === 0) {
      console.log("No user subscription data found");
      return [];
    }
    
    console.log("User subscription data:", subscriptionData);
    
    // Transform the data to match our interface without relying on user emails
    return subscriptionData.map(subscription => {
      return {
        user_id: subscription.user_id,
        email: subscription.user_id, // Use user_id as email since we can't fetch emails directly
        monthly_credits: subscription.monthly_credits || 0,
        credits_used: subscription.credits_used || 0,
        remaining_credits: (subscription.monthly_credits || 0) - (subscription.credits_used || 0),
        subscription_type: subscription.subscription_type || 'free'
      };
    });
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
