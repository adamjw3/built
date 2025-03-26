import { MetricsPageClient } from '@/components/clients/metrics/metrics-page'
import { Suspense } from 'react'
import { getSupabaseServer } from '@/lib/supabase/server'
import { dehydrate, HydrationBoundary, QueryClient } from '@tanstack/react-query'
import { metricsQueries } from '@/lib/queries/metrics'

export default async function MetricPage({ params }: { params: { id: string } }) {
  
  const resolvedParams = await params;
  const clientId = resolvedParams.id;
  
  // Initialize React Query client
  const queryClient = new QueryClient()
  
  // Prefetch metrics data on the server
  await queryClient.prefetchQuery({
    queryKey: ['clients', clientId, 'metrics'],
    queryFn: () => metricsQueries.getClientMetrics(clientId),
  })
  
  return (
    <Suspense fallback={<div>Loading metrics...</div>}>
      <HydrationBoundary state={dehydrate(queryClient)}>
        <MetricsPageClient clientId={clientId} />
      </HydrationBoundary>
    </Suspense>
  )
}