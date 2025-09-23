import { serve } from "https://deno.land/std@0.168.0/http/server.ts"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

// Fetch inbound links for a verified site via Bing Webmaster Tools API
// Docs: https://learn.microsoft.com/en-us/bing/webmaster/tools/api-reference
serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const { siteUrl, count = 100 } = await req.json()
    if (!siteUrl) {
      return new Response(JSON.stringify({ error: 'siteUrl is required' }), { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } })
    }

    const apiKey = Deno.env.get('BING_WEBMASTER_API_KEY')
    if (!apiKey) {
      return new Response(JSON.stringify({ error: 'BING_WEBMASTER_API_KEY not configured' }), { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } })
    }

    // Endpoint example (subject to API evolution). For inbound links, Bing provides various link reports.
    // Using a generic sample endpoint here; in real use, pick the exact report you need and paging.
    const endpoint = `https://ssl.bing.com/webmaster/api.svc/json/GetInboundLinks?apikey=${encodeURIComponent(apiKey)}&siteUrl=${encodeURIComponent(siteUrl)}&count=${count}`

    const res = await fetch(endpoint)
    if (!res.ok) {
      const body = await res.text()
      return new Response(JSON.stringify({ error: 'Bing API error', status: res.status, body }), { status: res.status, headers: { ...corsHeaders, 'Content-Type': 'application/json' } })
    }

    const data = await res.json()
    return new Response(JSON.stringify({ success: true, data }), { headers: { ...corsHeaders, 'Content-Type': 'application/json' } })
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } })
  }
})


