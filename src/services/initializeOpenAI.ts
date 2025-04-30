
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export const initializeOpenAIKey = async () => {
  try {
    // We're using the already stored OPENAI_API_KEY from the Supabase secrets
    const { data, error } = await supabase.functions.invoke('set-openai-key', {
      body: { apiKey: 'using-supabase-secrets' }
    });
    
    if (error) {
      console.error('Failed to initialize OpenAI key:', error);
      toast.error('Failed to initialize OpenAI integration. Some features may not work properly.');
      return false;
    }
    
    console.log('OpenAI API key initialized for database functions');
    return true;
  } catch (error) {
    console.error('Error initializing OpenAI key:', error);
    toast.error('Error initializing OpenAI integration. Please try again later.');
    return false;
  }
};
