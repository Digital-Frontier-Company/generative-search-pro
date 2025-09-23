import { serve } from "https://deno.land/std@0.168.0/http/server.ts"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

type Edge = { from: string; to: string }

function pageRank(nodes: string[], edges: Edge[], iterations = 20, damping = 0.85): Record<string, number> {
  const ranks: Record<string, number> = {}
  const outCounts: Record<string, number> = {}
  const inEdges: Record<string, string[]> = {}

  const n = nodes.length
  nodes.forEach(nid => { ranks[nid] = 1 / n; outCounts[nid] = 0; inEdges[nid] = [] })
  edges.forEach(e => { outCounts[e.from] = (outCounts[e.from] || 0) + 1; inEdges[e.to].push(e.from) })

  for (let i = 0; i < iterations; i++) {
    const newRanks: Record<string, number> = {}
    nodes.forEach(node => {
      let sum = 0
      for (const incoming of inEdges[node]) {
        sum += (ranks[incoming] || 0) / (outCounts[incoming] || 1)
      }
      newRanks[node] = (1 - damping) / n + damping * sum
    })
    Object.assign(ranks, newRanks)
  }
  return ranks
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const { nodes, edges, iterations, damping } = await req.json()
    if (!Array.isArray(nodes) || !Array.isArray(edges)) {
      return new Response(JSON.stringify({ error: 'Provide nodes: string[] and edges: {from,to}[]' }), { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } })
    }
    const ranks = pageRank(nodes, edges, iterations ?? 20, damping ?? 0.85)
    return new Response(JSON.stringify({ success: true, ranks }), { headers: { ...corsHeaders, 'Content-Type': 'application/json' } })
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } })
  }
})


