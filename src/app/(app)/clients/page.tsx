import { ClientsTable } from '@/components/clients/clients-table'
import { AddClientButton } from '@/components/clients/add-client-button'
import { getSupabaseServer } from '@/lib/supabase/server'
import { dehydrate, HydrationBoundary, QueryClient } from '@tanstack/react-query'
import { clientQueries } from '@/lib/queries/clients'

export default async function ClientsPage() {
  // Initialize React Query client for server
  const queryClient = new QueryClient()
  
  // Prefetch clients data on the server
  await queryClient.prefetchQuery({
    queryKey: ['clients', {}],
    queryFn: () => clientQueries.getAllClients(),
  })
  
  return (
    <div className="container mx-auto p-4">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">All Clients</h1>
        <AddClientButton />
      </div>

      <div className="bg-white rounded-md border">
        {/* Pass the prefetched data to the client component */}
        <HydrationBoundary state={dehydrate(queryClient)}>
          <ClientsTable />
        </HydrationBoundary>
      </div>
    </div>
  )
}