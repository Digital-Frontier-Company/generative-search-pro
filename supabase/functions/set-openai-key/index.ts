
import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.38.0';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { apiKey } = await req.json();
    
    if (!apiKey) {
      return new Response(JSON.stringify({ error: 'API key is required' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }
    
    // Create a Supabase client with the service role key
    const supabaseUrl = Deno.env.get('SUPABASE_URL') || '';
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') || '';
    
    if (!supabaseUrl || !supabaseServiceKey) {
      return new Response(JSON.stringify({ 
        error: 'Missing Supabase configuration', 
        details: 'Check that SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY are set in the environment.' 
      }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }
    
    const supabase = createClient(supabaseUrl, supabaseServiceKey);
    
    // If we're using the Supabase secrets directly
    if (apiKey === 'using-supabase-secrets') {
      const openaiKey = Deno.env.get('OPENAI_API_KEY');
      
      if (!openaiKey) {
        return new Response(JSON.stringify({ 
          error: 'OpenAI API key not found in Supabase secrets',
          details: 'The OPENAI_API_KEY secret needs to be set in the Supabase dashboard.'
        }), {
          status: 404,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });
      }
      
      // Set the OpenAI API key in the database using the set_openai_key function
      const { data, error } = await supabase.rpc('set_openai_key', {
        api_key: openaiKey
      });
      
      if (error) {
        throw error;
      }
      
      return new Response(JSON.stringify({ 
        success: true, 
        message: 'API key from Supabase secrets set successfully' 
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    } else {
      // Set the user-provided OpenAI API key in the database
      const { data, error } = await supabase.rpc('set_openai_key', {
        api_key: apiKey
      });
      
      if (error) {
        throw error;
      }
      
      return new Response(JSON.stringify({ 
        success: true, 
        message: 'User-provided API key set successfully' 
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }
  } catch (error) {
    console.error('Error setting OpenAI API key:', error);
    return new Response(JSON.stringify({ 
      error: 'Failed to set OpenAI API key', 
      details: error.message 
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  }
});
