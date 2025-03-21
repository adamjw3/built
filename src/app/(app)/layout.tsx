import { redirect } from 'next/navigation'
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar"
import { AppSidebar } from "@/components/app-sidebar"
import { createClient } from '@/lib/supabase/server'

export default async function AppLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  
  const supabase = await createClient()
  const { data, error } = await supabase.auth.getUser()
  if (error || !data?.user) {
    redirect('/login')
  }

  return (
    <SidebarProvider style={{
    "--sidebar-width": "20rem",
    "--sidebar-width-mobile": "20rem",
  }}>
      <AppSidebar />
      <main className='w-full'>
        <SidebarTrigger />
        {children}
      </main>
    </SidebarProvider>
  );
}
