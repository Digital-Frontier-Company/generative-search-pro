
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
  console.log("getUserCreditsInfo: Starting to fetch user credit information...");
  
  try {
    // First try to get from the admin_user_credits view which has aggregated data
    console.log("getUserCreditsInfo: Attempting to fetch from admin_user_credits view...");
    const { data: viewData, error: viewError } = await supabase
      .from('admin_user_credits')
      .select('*');
    
    console.log("getUserCreditsInfo: admin_user_credits query result:", { viewData, viewError });
    
    if (viewData && viewData.length > 0) {
      console.log("Admin view data found:", viewData);
      // Transform the data to match our interface
      const transformedData = viewData.map(user => ({
        user_id: user.user_id,
        email: user.email || user.user_id,
        monthly_credits: user.monthly_credits || 0,
        credits_used: user.credits_used || 0,
        remaining_credits: user.remaining_credits || 0,
        subscription_type: user.subscription_type || 'free'
      }));
      console.log("getUserCreditsInfo: Returning transformed admin view data:", transformedData);
      return transformedData;
    }
    
    console.log("No admin view data found, falling back to user_subscriptions table");
    
    // Fallback to user_subscriptions table
    console.log("getUserCreditsInfo: Fetching from user_subscriptions table...");
    const { data: subscriptionData, error: subError } = await supabase
      .from('user_subscriptions')
      .select('*');
    
    console.log("getUserCreditsInfo: user_subscriptions query result:", { subscriptionData, subError });
    
    if (subError) {
      console.error("Error fetching user subscriptions:", subError);
      toast.error("Failed to load user subscription information: " + subError.message);
      return [];
    }

    if (!subscriptionData || subscriptionData.length === 0) {
      console.log("No user subscription data found - this might be normal if no users have signed up yet");
      toast.warning("No user data found. Make sure users have signed up and have subscription records.");
      return [];
    }
    
    console.log("User subscription data found:", subscriptionData);
    
    // Transform the data to match our interface
    const transformedData = subscriptionData.map(subscription => {
      const remaining = (subscription.monthly_credits || 0) - (subscription.credits_used || 0);
      return {
        user_id: subscription.user_id,
        email: subscription.user_id, // Use user_id as email since we can't fetch emails directly without a proper view
        monthly_credits: subscription.monthly_credits || 0,
        credits_used: subscription.credits_used || 0,
        remaining_credits: Math.max(0, remaining), // Ensure remaining credits is never negative
        subscription_type: subscription.subscription_type || 'free'
      };
    });
    
    console.log("getUserCreditsInfo: Returning transformed subscription data:", transformedData);
    return transformedData;
    
  } catch (error) {
    console.error("Unexpected error in getUserCreditsInfo:", error);
    toast.error("An unexpected error occurred while loading user data: " + (error as Error).message);
    return [];
  }
};

// Add credits to a user
export const addUserCredits = async (email: string, amount: number): Promise<boolean> => {
  console.log(`addUserCredits: Adding ${amount} credits to user ${email}`);
  
  try {
    const { data, error } = await supabase.functions.invoke('add-credits', {
      body: { email, credits: amount }
    });

    if (error) {
      console.error("Error adding credits:", error);
      toast.error("Failed to add credits: " + error.message);
      return false;
    }
    
    console.log("Credits added successfully:", data);
    toast.success(`Successfully added ${amount} credits to ${email}`);
    return true;
  } catch (error) {
    console.error("Unexpected error in addUserCredits:", error);
    toast.error("An unexpected error occurred while adding credits: " + (error as Error).message);
    return false;
  }
};
