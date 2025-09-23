// @ts-expect-error Deno URL import
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
declare const Deno: { env: { get: (k: string) => string | undefined } }

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const { urls, host, key: bodyKey, keyLocation } = await req.json()

    if (!Array.isArray(urls) || urls.length === 0) {
      return new Response(JSON.stringify({ error: 'Provide urls: string[]' }), { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } })
    }

    const key = bodyKey || Deno.env.get('INDEXNOW_KEY')
    if (!key) {
      return new Response(JSON.stringify({ error: 'INDEXNOW_KEY not configured' }), { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } })
    }

    // Derive host if not provided
    const derivedHost = host || new URL(urls[0]).host

    const payload = {
      host: derivedHost,
      key,
      ...(keyLocation ? { keyLocation } : {}),
      urlList: urls,
    }

    const res = await fetch('https://api.indexnow.org/indexnow', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    })

    const text = await res.text()
    return new Response(JSON.stringify({ ok: res.ok, status: res.status, body: text }), {
      status: res.ok ? 200 : res.status,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } })
  }
})


