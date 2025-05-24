
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export interface UserDocument {
  id: string;
  user_id: string;
  file_name: string;
  file_path: string;
  file_size: number;
  mime_type: string;
  extracted_content?: string;
  upload_date: string;
  is_active: boolean;
}

export const uploadDocument = async (file: File): Promise<UserDocument | null> => {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      toast.error('Please sign in to upload documents');
      return null;
    }

    // Create a unique file path
    const fileExt = file.name.split('.').pop();
    const fileName = `${Date.now()}-${Math.random().toString(36).substring(2)}.${fileExt}`;
    const filePath = `${user.id}/${fileName}`;

    // Upload file to storage
    const { error: uploadError } = await supabase.storage
      .from('user-documents')
      .upload(filePath, file);

    if (uploadError) {
      console.error('Upload error:', uploadError);
      toast.error('Failed to upload document');
      return null;
    }

    // Save document metadata to database
    const { data, error: dbError } = await supabase
      .from('user_documents')
      .insert({
        user_id: user.id,
        file_name: file.name,
        file_path: filePath,
        file_size: file.size,
        mime_type: file.type,
        is_active: true
      })
      .select()
      .single();

    if (dbError) {
      console.error('Database error:', dbError);
      // Clean up uploaded file if database insert fails
      await supabase.storage.from('user-documents').remove([filePath]);
      toast.error('Failed to save document metadata');
      return null;
    }

    toast.success('Document uploaded successfully');
    return data;
  } catch (error) {
    console.error('Error uploading document:', error);
    toast.error('Failed to upload document');
    return null;
  }
};

export const getUserDocuments = async (): Promise<UserDocument[]> => {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      return [];
    }

    const { data, error } = await supabase
      .from('user_documents')
      .select('*')
      .eq('user_id', user.id)
      .eq('is_active', true)
      .order('upload_date', { ascending: false });

    if (error) {
      console.error('Error fetching documents:', error);
      return [];
    }

    return data || [];
  } catch (error) {
    console.error('Error fetching documents:', error);
    return [];
  }
};

export const deleteDocument = async (documentId: string): Promise<boolean> => {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      toast.error('Please sign in to delete documents');
      return false;
    }

    // Get document info first
    const { data: document, error: fetchError } = await supabase
      .from('user_documents')
      .select('file_path')
      .eq('id', documentId)
      .eq('user_id', user.id)
      .single();

    if (fetchError || !document) {
      toast.error('Document not found');
      return false;
    }

    // Delete from storage
    const { error: storageError } = await supabase.storage
      .from('user-documents')
      .remove([document.file_path]);

    if (storageError) {
      console.error('Storage deletion error:', storageError);
    }

    // Mark as inactive in database
    const { error: dbError } = await supabase
      .from('user_documents')
      .update({ is_active: false })
      .eq('id', documentId)
      .eq('user_id', user.id);

    if (dbError) {
      console.error('Database error:', dbError);
      toast.error('Failed to delete document');
      return false;
    }

    toast.success('Document deleted successfully');
    return true;
  } catch (error) {
    console.error('Error deleting document:', error);
    toast.error('Failed to delete document');
    return false;
  }
};
