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
        
        // Perform citation checks for both engines
        const engines = ['google', 'bing']
        let citationResult = null
        
        for (const engine of engines) {
          const result = await performCitationCheck(entry.query, entry.domain, entry.user_id, engine)
          if (result) {
            citationResult = result
            // Store the first successful result for status comparison
            if (!citationResult) citationResult = result
          }
          
          // Add delay between engine checks
          await new Promise(resolve => setTimeout(resolve, 1000))
        }
        
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

async function performCitationCheck(query, domain, userId, engine = 'google') {
  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    
    // Call the appropriate Edge Function instead of duplicating logic
    const functionName = engine === 'google' ? 'check-sge-citation' : 'check-bing-citation'
    
    const response = await fetch(`${supabaseUrl}/functions/v1/${functionName}`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${supabaseKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        query,
        domain,
        user_id: userId,
        include_competitor_analysis: false,
        include_improvement_suggestions: false
      }),
    })
    
    if (!response.ok) {
      console.error(`${functionName} failed: ${response.status}`)
      return null
    }
    
    const result = await response.json()
    
    return {
      isCited: result.isCited || result.is_cited,
      citationPosition: result.citationPosition || result.citation_position,
      aiAnswer: result.aiAnswer || result.ai_answer,
      citedSources: result.citedSources || result.cited_sources || [],
      engine: result.engine || engine
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