
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export interface UserCreditInfo {
  email: string;
  user_id: string;
  monthly_credits: number;
  credits_used: number;
  remaining_credits: number;
  subscription_type: string;
}

/**
 * Get all users with their credit information
 */
export const getUserCreditsInfo = async (): Promise<UserCreditInfo[]> => {
  try {
    const { data, error } = await supabase
      .from('admin_user_credits')
      .select('*');
    
    if (error) throw error;
    
    return data;
  } catch (error) {
    console.error('Error fetching user credits info:', error);
    toast.error('Failed to load user credits information');
    return [];
  }
};

/**
 * Add credits to a user account
 */
export const addUserCredits = async (userEmail: string, creditAmount: number): Promise<number | null> => {
  try {
    const { data, error } = await supabase
      .rpc('add_user_credits', { 
        user_email: userEmail, 
        credit_amount: creditAmount 
      });
    
    if (error) throw error;
    
    toast.success(`Successfully added ${creditAmount} credits to ${userEmail}`);
    return data;
  } catch (error) {
    console.error('Error adding user credits:', error);
    toast.error('Failed to add credits to user');
    return null;
  }
};
