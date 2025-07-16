import { serve } from "https://deno.land/std@0.168.0/http/server.ts"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const { urls } = await req.json();
    
    const validationPromises = urls.map(async (url) => {
      try {
        const response = await fetch(url, { method: 'HEAD', redirect: 'manual' });
        let status = 'Unknown';
        if (response.status >= 200 && response.status < 300) {
          status = 'Live';
        } else if (response.status >= 300 && response.status < 400) {
          status = 'Redirect';
        } else if (response.status >= 400) {
          status = 'Broken';
        }
        return { url, status };
      } catch (error) {
        return { url, status: 'Error' };
      }
    });

    const validatedUrls = await Promise.all(validationPromises);

    return new Response(
      JSON.stringify({ validatedUrls }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 400,
    })
  }
}) 