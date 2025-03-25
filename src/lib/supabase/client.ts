import { createBrowserClient } from '@supabase/ssr'
import { useMemo } from 'react'
import { Database, TypedSupabaseClient } from '@/lib/types'

// Singleton pattern to avoid creating multiple clients
let browserClient: TypedSupabaseClient | undefined

function getSupabaseBrowserClient() {
  if (browserClient) {
    return browserClient
  }

  browserClient = createBrowserClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      auth: {
        debug: true
      }
    }
  )

  return browserClient
}

// React hook for client components
export function useSupabaseBrowser() {
  return useMemo(getSupabaseBrowserClient, [])
}

// For backward compatibility with your existing code
export function createClient() {
  return getSupabaseBrowserClient()
}