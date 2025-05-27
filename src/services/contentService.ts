import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import type { Database } from '@/integrations/supabase/types';

// Types
export interface ContentBlockMetadata {
  title?: string;
  description?: string;
  keywords?: string[];
  schema?: any;
  faqs?: Array<{
    question: string;
    answer: string;
  }>;
}

export interface ContentBlock {
  id: number;
  title: string;
  content: string;
  hero_answer?: string;
  metadata: ContentBlockMetadata;
  created_at: string;
  generated_at: string;
  user_id: string;
}

type ContentBlockRow = Database['public']['Tables']['content_blocks']['Row'];

interface ExtendedContentBlockRow extends Omit<ContentBlockRow, 'hero_answer'> {
  hero_answer?: string;
}

// Function to fetch all content blocks for a user
export const fetchContentBlocks = async (userId: string): Promise<ContentBlock[]> => {
  try {
    const { data, error } = await supabase
      .from('content_blocks')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching content blocks:', error);
      toast.error('Failed to load content history.');
      return [];
    }

    // Map the Supabase data to the ContentBlock type
    const contentBlocks: ContentBlock[] = data.map((block: any) => ({
      id: block.id,
      title: block.title,
      content: block.content,
      hero_answer: block.hero_answer,
      metadata: block.metadata || {},
      created_at: block.created_at,
      generated_at: block.generated_at,
      user_id: block.user_id,
    }));

    return contentBlocks;
  } catch (error) {
    console.error('Error fetching content blocks:', error);
    toast.error('Failed to load content history.');
    return [];
  }
};

// Function to create a new content block
export const createContentBlock = async (
  title: string,
  content: string,
  hero_answer: string | undefined,
  metadata: ContentBlockMetadata,
  userId: string
): Promise<ContentBlock | null> => {
  try {
    const { data, error } = await supabase
      .from('content_blocks')
      .insert([
        {
          title,
          content,
          hero_answer,
          metadata,
          user_id: userId,
          generated_at: new Date().toISOString(),
        },
      ])
      .select('*')
      .single();

    if (error) {
      console.error('Error creating content block:', error);
      toast.error('Failed to generate content. Please try again.');
      return null;
    }

    // Map the Supabase data to the ContentBlock type
    const contentBlock: ContentBlock = {
      id: data.id,
      title: data.title,
      content: data.content,
      hero_answer: data.hero_answer,
      metadata: data.metadata || {},
      created_at: data.created_at,
      generated_at: data.generated_at,
      user_id: data.user_id,
    };

    toast.success('Content generated successfully!');
    return contentBlock;
  } catch (error) {
    console.error('Error creating content block:', error);
    toast.error('Failed to generate content. Please try again.');
    return null;
  }
};

// Function to update an existing content block
export const updateContentBlock = async (
  id: number,
  title: string,
  content: string,
  hero_answer: string | undefined,
  metadata: ContentBlockMetadata
): Promise<ContentBlock | null> => {
  try {
    const { data, error } = await supabase
      .from('content_blocks')
      .update({ title, content, hero_answer, metadata })
      .eq('id', id)
      .select('*')
      .single();

    if (error) {
      console.error('Error updating content block:', error);
      toast.error('Failed to update content. Please try again.');
      return null;
    }

    // Map the Supabase data to the ContentBlock type
    const contentBlock: ContentBlock = {
      id: data.id,
      title: data.title,
      content: data.content,
      hero_answer: data.hero_answer,
      metadata: data.metadata || {},
      created_at: data.created_at,
      generated_at: data.generated_at,
      user_id: data.user_id,
    };

    toast.success('Content updated successfully!');
    return contentBlock;
  } catch (error) {
    console.error('Error updating content block:', error);
    toast.error('Failed to update content. Please try again.');
    return null;
  }
};

// Function to delete a content block
export const deleteContentBlock = async (id: number): Promise<boolean> => {
  try {
    const { error } = await supabase.from('content_blocks').delete().eq('id', id);

    if (error) {
      console.error('Error deleting content block:', error);
      toast.error('Failed to delete content. Please try again.');
      return false;
    }

    toast.success('Content deleted successfully!');
    return true;
  } catch (error) {
    console.error('Error deleting content block:', error);
    toast.error('Failed to delete content. Please try again.');
    return false;
  }
};
