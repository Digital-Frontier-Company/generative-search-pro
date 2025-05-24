import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export interface UserInfo {
  user_id: string;
  email: string;
  created_at: string;
}

// Fetch all users from auth
export const getAllUsers = async (): Promise<UserInfo[]> => {
  console.log("getAllUsers: Starting to fetch all users...");
  
  try {
    const { data, error } = await supabase.auth.admin.listUsers();
    
    if (error) {
      console.error("Error fetching users:", error);
      toast.error("Failed to load users: " + error.message);
      return [];
    }

    if (!data || !data.users || data.users.length === 0) {
      console.log("No users found");
      toast.warning("No users found in the system.");
      return [];
    }
    
    console.log("Users found:", data.users);
    
    // Transform the data to match our interface
    const transformedData = data.users.map(user => ({
      user_id: user.id,
      email: user.email || user.id,
      created_at: user.created_at || new Date().toISOString()
    }));
    
    console.log("getAllUsers: Returning transformed user data:", transformedData);
    return transformedData;
    
  } catch (error) {
    console.error("Unexpected error in getAllUsers:", error);
    toast.error("An unexpected error occurred while loading user data: " + (error as Error).message);
    return [];
  }
};

// Send notification to a user (placeholder function)
export const sendNotificationToUser = async (email: string, message: string): Promise<boolean> => {
  console.log(`sendNotificationToUser: Sending notification to ${email}: ${message}`);
  
  try {
    // This is a placeholder - in a real app you might send an email or push notification
    console.log("Notification sent successfully");
    toast.success(`Notification sent to ${email}`);
    return true;
  } catch (error) {
    console.error("Unexpected error in sendNotificationToUser:", error);
    toast.error("An unexpected error occurred while sending notification: " + (error as Error).message);
    return false;
  }
};
