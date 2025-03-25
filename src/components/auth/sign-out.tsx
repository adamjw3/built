'use client'

import { SidebarMenuButton } from "@/components/ui/sidebar"
import { useSignOut } from '@/lib/hooks/use-auth'

export function SignOut() {
  const signOut = useSignOut()

  function handleSignOut() {
    signOut.mutate()
  }

  return (
    <SidebarMenuButton onClick={handleSignOut} disabled={signOut.isPending}>
      <span>{signOut.isPending ? "Signing out..." : "Sign out"}</span>
    </SidebarMenuButton>
  )
}