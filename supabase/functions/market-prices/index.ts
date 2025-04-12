
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.36.0'
import { corsHeaders } from '../_shared/cors.ts'

const RAPID_API_KEY = Deno.env.get('RAPID_API_KEY')
const SUPABASE_URL = Deno.env.get('SUPABASE_URL')
const SUPABASE_ANON_KEY = Deno.env.get('SUPABASE_ANON_KEY')

// Create a single supabase client for interacting with your database
const supabase = createClient(SUPABASE_URL!, SUPABASE_ANON_KEY!)

Deno.serve(async (req) => {
  // Handle CORS
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    // Fetch market prices from RapidAPI's Agriculture API
    const response = await fetch('https://agriculture-api.p.rapidapi.com/market-prices/India', {
      headers: {
        'X-RapidAPI-Key': RAPID_API_KEY!,
        'X-RapidAPI-Host': 'agriculture-api.p.rapidapi.com'
      }
    })

    if (!response.ok) {
      throw new Error(`API responded with ${response.status}: ${response.statusText}`)
    }

    const data = await response.json()
    
    // Cache the results in Supabase for 6 hours
    const timestamp = new Date().toISOString()
    await supabase
      .from('market_prices_cache')
      .upsert({ 
        id: 'latest',
        data: data,
        updated_at: timestamp
      })
    
    return new Response(
      JSON.stringify({
        data,
        updated_at: timestamp
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200 
      }
    )
  } catch (error) {
    console.error('Error fetching market prices:', error.message)

    // Try to fetch cached data if available
    const { data: cachedData, error: cacheError } = await supabase
      .from('market_prices_cache')
      .select('data, updated_at')
      .eq('id', 'latest')
      .single()
      
    if (cacheError || !cachedData) {
      return new Response(
        JSON.stringify({ error: 'Failed to fetch market prices', details: error.message }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
      )
    }
    
    // Return cached data with flag
    return new Response(
      JSON.stringify({
        data: cachedData.data,
        updated_at: cachedData.updated_at,
        is_cached: true
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200 
      }
    )
  }
})
