import { serve } from "https://deno.land/std@0.168.0/http/server.ts"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

const apiKey = "AIzaSyCXwMlmt4FAdlQGtuUSppht2awWR6Z2B9c"

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const { url } = await req.json();
    const api_url = `https://www.googleapis.com/pagespeedonline/v5/runPagespeed?url=${encodeURIComponent(url)}&key=${apiKey}&category=PERFORMANCE`;

    const response = await fetch(api_url);
    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error.message);
    }

    const lighthouseResult = data.lighthouseResult;
    const coreWebVitals = {
      lcp: lighthouseResult.audits['largest-contentful-paint'].displayValue,
      fid: lighthouseResult.audits['max-potential-fid'].displayValue,
      cls: lighthouseResult.audits['cumulative-layout-shift'].displayValue,
    };

    return new Response(
      JSON.stringify({ coreWebVitals }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 400,
    })
  }
}) 