
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
      heroAnswer: item.heroAnswer || undefined,  // Add heroAnswer field
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
