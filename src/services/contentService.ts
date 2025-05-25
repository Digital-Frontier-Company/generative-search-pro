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

// Define the expected response shape from the generate-content function
interface ContentGenerationResponse {
  id: number;
  title: string;
  content: string;
  heroAnswer?: string; 
  metadata: ContentBlockMetadata;
  // other fields if necessary
}

// Type alias for database content block row
type ContentBlockRow = Database['public']['Tables']['content_blocks']['Row'];

// Extended database row type to include the hero_answer field
interface ExtendedContentBlockRow extends ContentBlockRow {
  hero_answer?: string;
}

export const getUserContentHistory = async () => {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      toast.error('Please sign in to view your content history');
      return [];
    }

    const { data, error } = await supabase
      .from('content_blocks')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false });
    
    if (error) throw error;
    
    // Convert data to ContentBlock type
    const contentHistory: ContentBlock[] = (data || []).map((item: any) => ({
      id: item.id,
      title: item.title,
      heroAnswer: item.hero_answer || undefined,
      content: item.content || '',
      metadata: item.metadata as ContentBlockMetadata || {},
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

export const generateContent = async (request: ContentGenerationRequest): Promise<ContentBlock> => {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      toast.error('Please sign in to generate content');
      throw new Error('User not authenticated');
    }

    console.log('Generating content with request:', request);
    
    // Call the Supabase Edge Function to generate content
    const { data, error } = await supabase.functions.invoke<ContentGenerationResponse>('generate-content', {
      body: JSON.stringify({
        ...request,
        user_id: user.id
      })
    });
    
    if (error) {
      console.error('Supabase function error:', error);
      throw error;
    }
    
    if (!data) {
      throw new Error('No data returned from content generation');
    }
    
    console.log('Content generated successfully:', data);
    
    // Format the response into a ContentBlock
    const contentBlock: ContentBlock = {
      id: data.id || Date.now(),
      title: data.title,
      heroAnswer: data.heroAnswer || undefined,
      content: data.content,
      metadata: data.metadata || {},
      created_at: new Date().toISOString(),
      generated_at: new Date().toISOString(),
      user_id: user.id
    };
    
    return contentBlock;
  } catch (error) {
    console.error('Error generating content:', error);
    toast.error('Failed to generate content. Please check your API key configuration.');
    throw error;
  }
};

export const searchContent = async (request: ContentSearchRequest): Promise<ContentBlock[]> => {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      toast.error('Please sign in to search content');
      return [];
    }

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
    const searchResults: ContentBlock[] = (data || []).map((item: any) => ({
      id: item.id,
      title: item.title,
      heroAnswer: item.hero_answer || undefined,
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
