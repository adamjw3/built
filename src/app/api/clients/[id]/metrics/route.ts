import { getSupabaseServer } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Await params before using it
    const resolvedParams = await params;
    const clientId = resolvedParams.id;
    const supabase = await getSupabaseServer()
    
    // Get the current authenticated user
    const { data: authData, error: authError } = await supabase.auth.getUser()
    
    if (authError || !authData?.user) {
      return NextResponse.json(
        { error: 'You must be logged in to view metrics' },
        { status: 401 }
      )
    }
    
    // Verify the client belongs to this user
    const { data: clientData, error: clientError } = await supabase
      .from('clients')
      .select('id')
      .eq('id', clientId)
      .eq('user_id', authData.user.id)
      .single()
      
    if (clientError || !clientData) {
      return NextResponse.json(
        { error: 'Client not found or you do not have access' },
        { status: 404 }
      )
    }
    
    // Get client-specific metric preferences
    const { data: clientMetricPreferences } = await supabase
      .from('client_metric_preferences')
      .select('metric_id, display_order, is_visible')
      .eq('client_id', clientId)
      .order('display_order')
    
    // Get all metric definitions
    const { data: metricDefinitions, error: definitionsError } = await supabase
      .from('metric_definitions')
      .select('*')
    
    if (definitionsError || !metricDefinitions) {
      return NextResponse.json(
        { error: 'Failed to load metric definitions' },
        { status: 400 }
      )
    }
    
    // Initialize variables for determining order and visibility
    let metricsToDisplay = metricDefinitions
    let visibleMetricIds = [] as Array<number>
    const orderMap = new Map()
    
    // If we have client preferences, we'll use those to determine which metrics to show and in what order
    if (clientMetricPreferences && clientMetricPreferences.length > 0) {
      // Filter and sort metrics based on client preferences
      visibleMetricIds = clientMetricPreferences
        .filter(pref => pref.is_visible)
        .map(pref => pref.metric_id)
      
      // Create a map for quick lookup of display order
      clientMetricPreferences.forEach(pref => {
        orderMap.set(pref.metric_id, pref.display_order)
      })
      
      // Filter visible metrics and sort by display_order
      metricsToDisplay = metricDefinitions
        .filter(def => visibleMetricIds.includes(def.id))
        .sort((a, b) => {
          const orderA = orderMap.get(a.id) ?? 999
          const orderB = orderMap.get(b.id) ?? 999
          return orderA - orderB
        })
    } else {
      // If no client preferences exist, sort by name (default behavior)
      metricsToDisplay = metricDefinitions.sort((a, b) => a.name.localeCompare(b.name))
    }
    
    // Get the most recent value for each metric for this client
    const metricsData = []
    
    for (const definition of metricsToDisplay) {
      // Get the latest value for this metric
      const { data: latestValue } = await supabase
        .from('client_metrics')
        .select('value, recorded_at')
        .eq('client_id', clientId)
        .eq('metric_id', definition.id)
        .order('recorded_at', { ascending: false })
        .limit(1)
        .single()
      
      // Add to our metrics data array
      metricsData.push({
        id: definition.id,
        name: definition.name,
        value: latestValue?.value ? String(latestValue.value) : null,
        lastUpdate: latestValue?.recorded_at ? new Date(latestValue.recorded_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) : null,
        unit: definition.unit,
        displayOrder: orderMap.get(definition.id) ?? 999
      })
    }

    // Fetch historical data for each visible metric
    const metricsHistoricalData = []
    
    for (const definition of metricsToDisplay) {
      // Get all values for this metric
      const { data: metricValues } = await supabase
        .from('client_metrics')
        .select('value, recorded_at')
        .eq('client_id', clientId)
        .eq('metric_id', definition.id)
        .order('recorded_at', { ascending: true })
      
      if (metricValues && metricValues.length > 0) {
        // Calculate percentage change
        const oldestValue = metricValues[0].value
        const latestValue = metricValues[metricValues.length - 1].value
        const percentChange = oldestValue ? ((latestValue - oldestValue) / oldestValue) * 100 : 0
        
        // Format data for chart
        const formattedData = metricValues.map(item => ({
          date: new Date(item.recorded_at).toISOString().split('T')[0],
          value: item.value
        }))
        
        metricsHistoricalData.push({
          id: definition.id,
          name: definition.name,
          unit: definition.unit,
          data: formattedData,
          percentChange: percentChange.toFixed(2),
          displayOrder: orderMap.get(definition.id) ?? 999  // Store display order for sorting
        })
      } else {
        metricsHistoricalData.push({
          id: definition.id,
          name: definition.name,
          unit: definition.unit,
          data: [],
          percentChange: "0",
          displayOrder: orderMap.get(definition.id) ?? 999  // Store display order for sorting
        })
      }
    }

    // Sort metricsHistoricalData using the stored displayOrder
    metricsHistoricalData.sort((a, b) => a.displayOrder - b.displayOrder)
    
    return NextResponse.json({ 
      metricsData, 
      metricsHistoricalData
    })
    
  } catch (error) {
    console.error('Server error fetching metrics:', error)
    return NextResponse.json(
      { error: 'An unexpected error occurred' },
      { status: 500 }
    )
  }
}

// POST endpoint to update metric preferences
export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const clientId = params.id
    const supabase = await getSupabaseServer()
    
    // Get the current authenticated user
    const { data: authData, error: authError } = await supabase.auth.getUser()
    
    if (authError || !authData?.user) {
      return NextResponse.json(
        { error: 'You must be logged in to update metrics' },
        { status: 401 }
      )
    }
    
    // Verify the client belongs to this user
    const { data: clientData, error: clientError } = await supabase
      .from('clients')
      .select('id')
      .eq('id', clientId)
      .eq('user_id', authData.user.id)
      .single()
      
    if (clientError || !clientData) {
      return NextResponse.json(
        { error: 'Client not found or you do not have access' },
        { status: 404 }
      )
    }
    
    // Get preferences data from request body
    const { metricsToSave } = await request.json()
    
    if (!metricsToSave || !Array.isArray(metricsToSave)) {
      return NextResponse.json(
        { error: 'Invalid metrics data provided' },
        { status: 400 }
      )
    }
    
    // Prepare the data for bulk upsert
    const preferencesData = metricsToSave.map(metric => ({
      client_id: clientId,
      metric_id: metric.id,
      display_order: metric.displayOrder,
      is_visible: metric.isVisible ?? true
    }))
    
    // Delete existing preferences
    const { error: deleteError } = await supabase
      .from('client_metric_preferences')
      .delete()
      .eq('client_id', clientId)
    
    if (deleteError) {
      return NextResponse.json(
        { error: 'Failed to delete existing preferences' },
        { status: 400 }
      )
    }
    
    // Insert new preferences
    const { error: insertError } = await supabase
      .from('client_metric_preferences')
      .insert(preferencesData)
    
    if (insertError) {
      return NextResponse.json(
        { error: 'Failed to update preferences' },
        { status: 400 }
      )
    }
    
    return NextResponse.json({ success: true })
    
  } catch (error) {
    console.error('Server error updating metric preferences:', error)
    return NextResponse.json(
      { error: 'An unexpected error occurred' },
      { status: 500 }
    )
  }
}