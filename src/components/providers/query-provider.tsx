'use client'

import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { useState } from 'react'

export function ReactQueryProvider({ children }: { children: React.ReactNode }) {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            staleTime: 60 * 1000, // 1 minute before data is considered stale
            refetchOnWindowFocus: false, // Disable automatic refetching when window gains focus
          },
        },
      })
  )
  
  return <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
}