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
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    
    // Get all active monitoring entries that need to be checked
    const monitoringResponse = await fetch(`${supabaseUrl}/rest/v1/citation_monitoring?is_active=eq.true&select=*`, {
      headers: {
        'Authorization': `Bearer ${supabaseKey}`,
        'apikey': supabaseKey,
      },
    })
    
    if (!monitoringResponse.ok) {
      throw new Error('Failed to fetch monitoring entries')
    }
    
    const monitoringEntries = await monitoringResponse.json()
    
    let checkedCount = 0
    let statusChanges = 0
    
    // Process each monitoring entry
    for (const entry of monitoringEntries) {
      try {
        // Check if it's time to check this entry based on frequency
        const shouldCheck = shouldCheckEntry(entry)
        
        if (!shouldCheck) continue
        
        // Perform citation check
        const citationResult = await performCitationCheck(entry.query, entry.domain, entry.user_id)
        
        if (citationResult) {
          checkedCount++
          
          // Check if status changed
          const statusChanged = entry.last_citation_status !== citationResult.isCited
          if (statusChanged) {
            statusChanges++
            
            // Send notification if alerts are enabled
            if (entry.alert_on_change) {
              await sendStatusChangeNotification(entry, citationResult)
            }
          }
          
          // Update monitoring entry
          await fetch(`${supabaseUrl}/rest/v1/citation_monitoring?id=eq.${entry.id}`, {
            method: 'PATCH',
            headers: {
              'Authorization': `Bearer ${supabaseKey}`,
              'Content-Type': 'application/json',
              'apikey': supabaseKey,
            },
            body: JSON.stringify({
              last_checked_at: new Date().toISOString(),
              last_citation_status: citationResult.isCited
            }),
          })
        }
        
        // Add delay to avoid rate limiting
        await new Promise(resolve => setTimeout(resolve, 2000))
        
      } catch (error) {
        console.error(`Error checking entry ${entry.id}:`, error)
      }
    }
    
    return new Response(
      JSON.stringify({
        success: true,
        message: `Automated monitoring completed`,
        stats: {
          totalEntries: monitoringEntries.length,
          checkedCount,
          statusChanges
        }
      }),
      { 
        headers: { 
          ...corsHeaders, 
          'Content-Type': 'application/json' 
        } 
      }
    )
    
  } catch (error) {
    console.error('Automated monitoring error:', error)
    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        status: 500,
        headers: { 
          ...corsHeaders, 
          'Content-Type': 'application/json' 
        } 
      }
    )
  }
})

function shouldCheckEntry(entry) {
  if (!entry.last_checked_at) return true
  
  const lastChecked = new Date(entry.last_checked_at)
  const now = new Date()
  const hoursSinceLastCheck = (now.getTime() - lastChecked.getTime()) / (1000 * 60 * 60)
  
  switch (entry.check_frequency) {
    case 'daily':
      return hoursSinceLastCheck >= 24
    case 'weekly':
      return hoursSinceLastCheck >= 168 // 24 * 7
    case 'monthly':
      return hoursSinceLastCheck >= 720 // 24 * 30
    default:
      return hoursSinceLastCheck >= 24
  }
}

async function performCitationCheck(query, domain, userId) {
  try {
    const serpApiKey = Deno.env.get('SERPAPI_KEY')
    
    if (!serpApiKey) {
      console.log('SerpApi key not configured, skipping check')
      return null
    }
    
    const serpApiUrl = `https://serpapi.com/search.json?engine=google&q=${encodeURIComponent(query)}&api_key=${serpApiKey}&gl=us&hl=en`
    
    const serpResponse = await fetch(serpApiUrl)
    const serpData = await serpResponse.json()
    
    let isCited = false
    let aiAnswer = ''
    let citedSources = []
    let citationPosition = null
    
    if (serpData.ai_overview) {
      aiAnswer = serpData.ai_overview.overview || ''
      citedSources = serpData.ai_overview.sources || []
      
      citedSources.forEach((source, index) => {
        if (source.link && source.link.includes(domain)) {
          isCited = true
          citationPosition = index + 1
        }
      })
      
      if (!isCited && aiAnswer.toLowerCase().includes(domain.toLowerCase())) {
        isCited = true
        citationPosition = citedSources.length + 1
      }
    }
    
    // Store the check result
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    
    await fetch(`${supabaseUrl}/rest/v1/citation_checks`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${supabaseKey}`,
        'Content-Type': 'application/json',
        'apikey': supabaseKey,
      },
      body: JSON.stringify({
        user_id: userId,
        query,
        domain,
        is_cited: isCited,
        ai_answer: aiAnswer,
        cited_sources: citedSources,
        citation_position: citationPosition,
        total_sources: citedSources.length,
        confidence_score: isCited ? 75 : 25, // Simplified scoring for monitoring
        query_complexity: 'medium' // Default for monitoring
      }),
    })
    
    return {
      isCited,
      citationPosition,
      aiAnswer,
      citedSources
    }
    
  } catch (error) {
    console.error('Citation check error:', error)
    return null
  }
}

async function sendStatusChangeNotification(entry, result) {
  try {
    // Get user email for notification
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    
    const userResponse = await fetch(`${supabaseUrl}/auth/v1/admin/users/${entry.user_id}`, {
      headers: {
        'Authorization': `Bearer ${supabaseKey}`,
        'apikey': supabaseKey,
      },
    })
    
    if (!userResponse.ok) return
    
    const userData = await userResponse.json()
    const userEmail = userData.email
    
    if (!userEmail) return
    
    // Send email notification (you would integrate with your email service here)
    console.log(`Notification: Citation status changed for "${entry.query}" - Now ${result.isCited ? 'CITED' : 'NOT CITED'}`)
    
    // You could integrate with services like:
    // - SendGrid
    // - Resend
    // - AWS SES
    // - Or store notifications in a table for in-app notifications
    
    // For now, we'll create a simple notification record
    await fetch(`${supabaseUrl}/rest/v1/notifications`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${supabaseKey}`,
        'Content-Type': 'application/json',
        'apikey': supabaseKey,
      },
      body: JSON.stringify({
        user_id: entry.user_id,
        type: 'citation_status_change',
        title: `Citation Status Changed`,
        message: `Your domain citation status changed for query "${entry.query}". It is now ${result.isCited ? 'cited' : 'not cited'}.`,
        data: {
          query: entry.query,
          domain: entry.domain,
          is_cited: result.isCited,
          citation_position: result.citationPosition
        },
        read: false
      }),
    }).catch(err => console.log('Notification storage failed:', err))
    
  } catch (error) {
    console.error('Notification error:', error)
  }
} 