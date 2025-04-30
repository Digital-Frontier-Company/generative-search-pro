
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Json } from "@/integrations/supabase/types";

export type ContentBlockMetadata = {
  seoTitle?: string;
  metaDescription?: string;
  ogTitle?: string;
  ogDescription?: string;
  twitterTitle?: string;
  twitterDescription?: string;
  jsonLdSchema?: Record<string, any>;
  ctaVariants?: string[];
};

export type ContentBlock = {
  id: number;
  title: string;
  content: string;
  metadata: ContentBlockMetadata;
  created_at: string;
  generated_at: string;
  user_id: string;
};

export type ContentGenerationRequest = {
  topic: string;
  keywords: string[];
  toneStyle?: string;
  targetAudience?: string;
  contentType?: 'blog' | 'article' | 'faq';
};

export const checkUserSubscription = async () => {
  try {
    const { data: subscription, error } = await supabase
      .from('user_subscriptions')
      .select('*')
      .single();
    
    if (error) throw error;
    
    return {
      subscription,
      canGenerate: subscription.subscription_type === 'premium' || subscription.credits_used < subscription.monthly_credits
    };
  } catch (error) {
    console.error('Error checking user subscription:', error);
    toast.error('Failed to check subscription status');
    return { subscription: null, canGenerate: false };
  }
};

export const incrementUserCredits = async () => {
  try {
    const { error } = await supabase
      .from('user_subscriptions')
      .update({ credits_used: supabase.rpc('increment_credits') });
    
    if (error) throw error;
    
    return true;
  } catch (error) {
    console.error('Error incrementing user credits:', error);
    toast.error('Failed to update credit usage');
    return false;
  }
};

export const generateContent = async (request: ContentGenerationRequest) => {
  try {
    toast.info('Generating content...', { duration: 5000 });
    
    // Call our edge function to generate content with OpenAI
    const { data: generatedData, error: functionError } = await supabase.functions.invoke('generate-content', {
      body: request
    });
    
    if (functionError) {
      console.error('Edge function error:', functionError);
      throw new Error('Content generation failed');
    }

    if (!generatedData) {
      throw new Error('No content was generated');
    }
    
    // Store the generated content with vector embedding
    const { data, error } = await supabase
      .from('content_blocks')
      .insert({
        title: generatedData.title,
        content: generatedData.content,
        metadata: generatedData.metadata,
        generated_at: new Date().toISOString()
      })
      .select()
      .single();
      
    if (error) throw error;
    
    // Update credit usage
    await incrementUserCredits();
    
    // Fix the returned data to match ContentBlock type
    const contentBlock: ContentBlock = {
      id: data.id,
      title: data.title,
      content: data.content,
      metadata: data.metadata as ContentBlockMetadata,
      created_at: data.created_at,
      generated_at: data.generated_at,
      user_id: data.user_id || ''
    };
    
    return contentBlock;
  } catch (error) {
    console.error('Error generating content:', error);
    toast.error('Failed to generate content. Please try again.');
    return null;
  }
};

export const getUserContentHistory = async () => {
  try {
    const { data, error } = await supabase
      .from('content_blocks')
      .select('*')
      .order('created_at', { ascending: false });
    
    if (error) throw error;
    
    // Convert data to ContentBlock type
    const contentHistory: ContentBlock[] = data.map(item => ({
      id: item.id,
      title: item.title,
      content: item.content || '',
      metadata: item.metadata as ContentBlockMetadata,
      created_at: item.created_at,
      generated_at: item.generated_at || '',
      user_id: item.user_id || ''
    }));
    
    return contentHistory;
  } catch (error) {
    console.error('Error fetching content history:', error);
    toast.error('Failed to load content history');
    return [];
  }
};

export const getContentBlock = async (id: number) => {
  try {
    const { data, error } = await supabase
      .from('content_blocks')
      .select('*')
      .eq('id', id)
      .single();
    
    if (error) throw error;
    
    // Convert data to ContentBlock type
    const contentBlock: ContentBlock = {
      id: data.id,
      title: data.title,
      content: data.content || '',
      metadata: data.metadata as ContentBlockMetadata,
      created_at: data.created_at,
      generated_at: data.generated_at || '',
      user_id: data.user_id || ''
    };
    
    return contentBlock;
  } catch (error) {
    console.error(`Error fetching content with id ${id}:`, error);
    toast.error('Failed to load content');
    return null;
  }
};
