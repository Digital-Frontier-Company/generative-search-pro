
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export type ContentBlockMetadata = {
  seoTitle: string;
  metaDescription: string;
  ogTitle: string;
  ogDescription: string;
  twitterTitle: string;
  twitterDescription: string;
  jsonLdSchema: Record<string, any>;
  ctaVariants: string[];
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
      .update({ credits_used: supabase.rpc('increment', { x: 1 }) })
      .eq('user_id', supabase.auth.getUser().then(res => res.data.user?.id));
    
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
    // For now, we'll simulate AI content generation with a mock response
    // In a real implementation, this would call an AI service or edge function
    const mockResponse = {
      title: `The Ultimate Guide to ${request.topic}`,
      content: `
        <h1>The Ultimate Guide to ${request.topic}</h1>
        <p>When it comes to ${request.topic}, many people overlook the most important aspects. This guide will show you exactly what you need to know.</p>
        <h2>Key Points About ${request.topic}</h2>
        <p>Understanding ${request.topic} requires focusing on ${request.keywords.join(', ')}. Let's explore each in detail.</p>
        <h2>Why ${request.topic} Matters</h2>
        <p>In today's competitive environment, mastering ${request.topic} gives you a significant advantage.</p>
        <h2>Expert Tips for ${request.topic}</h2>
        <ul>
          ${request.keywords.map(keyword => `<li>Leverage ${keyword} to maximize results</li>`).join('')}
        </ul>
        <h2>Frequently Asked Questions</h2>
        <h3>How does ${request.topic} impact SEO?</h3>
        <p>${request.topic} directly influences search rankings through semantic relevance and user engagement metrics.</p>
        <h3>What are the best tools for ${request.topic}?</h3>
        <p>Top professionals recommend focused applications that integrate with your existing workflows.</p>
      `,
      metadata: {
        seoTitle: `${request.topic}: The Complete Guide [${new Date().getFullYear()}]`,
        metaDescription: `Master ${request.topic} with our comprehensive guide covering ${request.keywords.slice(0, 3).join(', ')} and more. Expert insights and actionable tips.`,
        ogTitle: `Ultimate ${request.topic} Guide: Expert Strategies & Tips`,
        ogDescription: `Discover proven strategies for ${request.topic} that most experts won't tell you. Click to learn more!`,
        twitterTitle: `${request.topic}: Insider Tips You Need to Know`,
        twitterDescription: `Learn the secrets of ${request.topic} that can transform your results. Comprehensive guide with practical examples.`,
        jsonLdSchema: {
          "@context": "https://schema.org",
          "@type": "FAQPage",
          "mainEntity": [
            {
              "@type": "Question",
              "name": `How does ${request.topic} impact SEO?`,
              "acceptedAnswer": {
                "@type": "Answer",
                "text": `${request.topic} directly influences search rankings through semantic relevance and user engagement metrics.`
              }
            },
            {
              "@type": "Question",
              "name": `What are the best tools for ${request.topic}?`,
              "acceptedAnswer": {
                "@type": "Answer",
                "text": `Top professionals recommend focused applications that integrate with your existing workflows.`
              }
            }
          ]
        },
        ctaVariants: [
          `Ready to master ${request.topic}? Download our free cheatsheet now!`,
          `Want to become a ${request.topic} expert? Join our free webinar this week!`,
          `Struggling with ${request.topic}? Book a free consultation call!`
        ]
      }
    };
    
    // Store the generated content with vector embedding
    // In a real implementation, you would generate the embedding using an AI service
    const { data, error } = await supabase
      .from('content_blocks')
      .insert({
        title: mockResponse.title,
        content: mockResponse.content,
        metadata: mockResponse.metadata,
        generated_at: new Date().toISOString()
      })
      .select()
      .single();
      
    if (error) throw error;
    
    // Update credit usage
    await incrementUserCredits();
    
    return data;
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
    
    return data;
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
    
    return data;
  } catch (error) {
    console.error(`Error fetching content with id ${id}:`, error);
    toast.error('Failed to load content');
    return null;
  }
};
