'use client'
import { createBrowserClient } from '@supabase/ssr'
import { useRouter } from 'next/navigation'
import { useToast } from "@/hooks/use-toast"

import {
  SidebarMenuButton
} from "@/components/ui/sidebar"

export function SignOut() {
  const router = useRouter()
  const { toast } = useToast()
  
  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )

  async function handleSignOut() {
    try {
      const { error } = await supabase.auth.signOut()
      if (error) {
        toast({
          variant: "destructive",
          title: "Error",
          description: "Failed to sign out"
        })
        return
      }
      router.push('/login')
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Something went wrong"
      })
    }
  }

   return (
      <SidebarMenuButton onClick={handleSignOut}>
        <span>Sign out</span>
      </SidebarMenuButton>
   )
}