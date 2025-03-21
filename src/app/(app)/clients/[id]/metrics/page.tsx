// app/clients/[id]/metrics/page.tsx

import { createClient } from '@/lib/supabase/server'
import { MetricsPageClient } from '@/components/clients/metrics/metrics-page'
import { Suspense } from 'react'

export default async function MetricPage({ params }: { params: { id: string } }) {
  const supabase = await createClient()
  const resolvedParams = await params
  const id = resolvedParams.id

  // First check for client-specific metric preferences
  const { data: clientMetricPreferences } = await supabase
    .from('client_metric_preferences')
    .select('metric_id, display_order, is_visible')
    .eq('client_id', id)
    .order('display_order')
  
  // Get all metric definitions
  const { data: metricDefinitions } = await supabase
    .from('metric_definitions')
    .select('*')
  
  if (!metricDefinitions) {
    return <div>Failed to load metrics</div>
  }
  
  // Initialize variables for determining order and visibility
  let metricsToDisplay = metricDefinitions;
  let visibleMetricIds = [] as Array<number>
  const orderMap = new Map();
  
  // If we have client preferences, we'll use those to determine which metrics to show and in what order
  if (clientMetricPreferences && clientMetricPreferences.length > 0) {
    // Filter and sort metrics based on client preferences
    visibleMetricIds = clientMetricPreferences
      .filter(pref => pref.is_visible)
      .map(pref => pref.metric_id);
    
    // Create a map for quick lookup of display order
    clientMetricPreferences.forEach(pref => {
      orderMap.set(pref.metric_id, pref.display_order);
    });
    
    // Filter visible metrics and sort by display_order
    metricsToDisplay = metricDefinitions
      .filter(def => visibleMetricIds.includes(def.id))
      .sort((a, b) => {
        const orderA = orderMap.get(a.id) ?? 999;
        const orderB = orderMap.get(b.id) ?? 999;
        return orderA - orderB;
      });
  } else {
    // If no client preferences exist, sort by name (default behavior)
    metricsToDisplay = metricDefinitions.sort((a, b) => a.name.localeCompare(b.name));
  }
  
  // Get the most recent value for each metric for this client
  const metricsData = [];
  
  for (const definition of metricsToDisplay) {
    // Get the latest value for this metric
    const { data: latestValue } = await supabase
      .from('client_metrics')
      .select('value, recorded_at')
      .eq('client_id', id)
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
      unit: definition.unit
    })
  }

  // Fetch historical data for each visible metric
  const metricsHistoricalData = [];
  
  for (const definition of metricsToDisplay) {
    // Get all values for this metric
    const { data: metricValues } = await supabase
      .from('client_metrics')
      .select('value, recorded_at')
      .eq('client_id', id)
      .eq('metric_id', definition.id)
      .order('recorded_at', { ascending: true })
    
    if (metricValues && metricValues.length > 0) {
      // Calculate percentage change
      const oldestValue = metricValues[0].value;
      const latestValue = metricValues[metricValues.length - 1].value;
      const percentChange = oldestValue ? ((latestValue - oldestValue) / oldestValue) * 100 : 0;
      
      // Format data for chart
      const formattedData = metricValues.map(item => ({
        date: new Date(item.recorded_at).toISOString().split('T')[0],
        value: item.value
      }));
      
      metricsHistoricalData.push({
        id: definition.id,
        name: definition.name,
        unit: definition.unit,
        data: formattedData,
        percentChange: percentChange.toFixed(2),
        displayOrder: orderMap.get(definition.id) ?? 999  // Store display order for sorting
      });
    } else {
      metricsHistoricalData.push({
        id: definition.id,
        name: definition.name,
        unit: definition.unit,
        data: [],
        percentChange: "0",
        displayOrder: orderMap.get(definition.id) ?? 999  // Store display order for sorting
      });
    }
  }

  // Sort metricsHistoricalData using the stored displayOrder
  metricsHistoricalData.sort((a, b) => a.displayOrder - b.displayOrder);

  return (
    <Suspense fallback={<div>Loading metrics...</div>}>
      <MetricsPageClient 
        metricsData={metricsData} 
        metricsHistoricalData={metricsHistoricalData} 
        clientId={id} 
      />
    </Suspense>
  )
}