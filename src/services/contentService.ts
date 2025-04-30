import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

// Types
export interface ContentBlockMetadata {
  seoTitle?: string;
  metaDescription?: string;
  ogTitle?: string;
  ogDescription?: string;
  twitterTitle?: string;
  twitterDescription?: string;
  jsonLdSchema?: Record<string, any>;
  ctaVariants?: string[];
  schemaWarnings?: string[];
  schemaRecommendations?: string[];
}

export interface ContentBlock {
  id: string | number;
  title: string;
  heroAnswer?: string;
  content: string;
  metadata: ContentBlockMetadata;
  created_at: string;
  generated_at?: string;
  user_id?: string;
  similarity?: number;  // For search results
}

export interface ContentGenerationRequest {
  topic: string;
  keywords: string[];
  contentType: 'blog' | 'article' | 'faq';
  toneStyle: string;
}

export interface ContentSearchRequest {
  query: string;
  threshold?: number;
  limit?: number;
}

export interface SubscriptionData {
  canGenerate: boolean;
  subscription?: {
    subscription_type: string;
    monthly_credits: number;
    credits_used: number;
    subscription_end_date?: string;
  };
}

// Define the expected response shape from the generate-content function
interface ContentGenerationResponse {
  id: number;
  title: string;
  content: string;
  heroAnswer?: string; // Added heroAnswer as optional
  metadata: ContentBlockMetadata;
  // other fields if necessary
}

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
      heroAnswer: item.hero_answer || undefined,  // Map from database field name
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

export const checkUserSubscription = async (): Promise<SubscriptionData> => {
  try {
    const { data: user } = await supabase.auth.getUser();
    
    if (!user.user) {
      return { canGenerate: false };
    }
    
    // Fetch user subscription data
    const { data, error } = await supabase
      .from('user_subscriptions')
      .select('*')
      .eq('user_id', user.user.id)
      .single();
    
    if (error) {
      console.error('Error fetching subscription:', error);
      return { canGenerate: false };
    }
    
    // Check if user can generate content based on subscription
    const isPremium = data.subscription_type === 'premium';
    const hasCreditsLeft = data.credits_used < data.monthly_credits;
    
    return {
      canGenerate: isPremium || hasCreditsLeft,
      subscription: {
        subscription_type: data.subscription_type,
        monthly_credits: data.monthly_credits,
        credits_used: data.credits_used,
        subscription_end_date: data.subscription_end_date
      }
    };
  } catch (error) {
    console.error('Error checking subscription:', error);
    return { canGenerate: false };
  }
};

export const generateContent = async (request: ContentGenerationRequest): Promise<ContentBlock> => {
  try {
    // Call the Supabase Edge Function to generate content
    const { data, error } = await supabase.functions.invoke<ContentGenerationResponse>('generate-content', {
      body: JSON.stringify(request)
    });
    
    if (error) throw error;
    
    // Format the response into a ContentBlock
    const contentBlock: ContentBlock = {
      id: data.id || Date.now(),
      title: data.title,
      heroAnswer: data.heroAnswer || undefined, // Now TypeScript knows this property can exist
      content: data.content,
      metadata: data.metadata || {},
      created_at: new Date().toISOString(),
      generated_at: new Date().toISOString()
    };
    
    return contentBlock;
  } catch (error) {
    console.error('Error generating content:', error);
    toast.error('Failed to generate content');
    throw error;
  }
};

export const searchContent = async (request: ContentSearchRequest): Promise<ContentBlock[]> => {
  try {
    // Call the Supabase function to search content
    const { data, error } = await supabase.functions.invoke('match-content-by-query', {
      body: JSON.stringify({
        query: request.query,
        threshold: request.threshold || 0.5,
        limit: request.limit || 10
      })
    });
    
    if (error) throw error;
    
    // Format the response into ContentBlock array
    const searchResults: ContentBlock[] = data.map((item: any) => ({
      id: item.id,
      title: item.title,
      heroAnswer: item.hero_answer || undefined, // Handle hero_answer field from database results
      content: item.content,
      metadata: item.metadata || {},
      created_at: item.created_at,
      similarity: item.similarity,
      user_id: item.user_id
    }));
    
    return searchResults;
  } catch (error) {
    console.error('Error searching content:', error);
    toast.error('Failed to search content');
    return [];
  }
};
