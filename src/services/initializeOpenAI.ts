
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export const initializeOpenAIKey = async () => {
  try {
    console.log('Initializing OpenAI key...');
    
    // Call the set-openai-key function to ensure the key is properly configured
    const { data, error } = await supabase.functions.invoke('set-openai-key', {
      body: { apiKey: 'using-supabase-secrets' }
    });
    
    if (error) {
      console.error('Failed to initialize OpenAI key:', error);
      toast.error('Failed to initialize OpenAI integration. Please check your API key configuration.');
      return false;
    }
    
    console.log('OpenAI API key initialized successfully:', data);
    toast.success('OpenAI integration initialized successfully!');
    return true;
  } catch (error) {
    console.error('Error initializing OpenAI key:', error);
    toast.error('Error initializing OpenAI integration. Please try again later.');
    return false;
  }
};
