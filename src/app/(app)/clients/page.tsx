import { createClient } from '@/lib/supabase/server'
import { ClientsTable } from '@/components/clients/clients-table'
import { AddClientButton } from '@/components/clients/add-client-button'

export default async function ClientsPage() {
  const supabase = await createClient()
  
  // Fetch clients 
  const { data: clientsData, error } = await supabase
    .from('clients')
    .select('*')
    .order('updated_at', { ascending: false })
  
  if (error) {
    console.error(error)
    return <div>Failed to load clients</div>
  }
  
  // Transform data for the table
  const clients = clientsData?.map(client => ({
    id: client.id,
    name: client.name,
    demo: client.name.includes("Demo"),
    lastActivity: formatTimeAgo(client.updated_at),
    lastTraining7d: client.last_training_completion,
    lastTraining30d: client.last_training_30d_completion,
    lastTasks7d: client.last_task_completion,
    category: client.client_type || "Online",
    status: client.status || "Connected",
    avatar: client.avatar_url
  })) || []

  return (
    <div className="container mx-auto p-4">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">All Clients ({clients.length})</h1>
        <AddClientButton />
      </div>

      <div className="bg-white rounded-md border">
        <ClientsTable initialClients={clients} />
      </div>
    </div>
  )
}

// Helper function to format time ago
function formatTimeAgo(dateString) {
  if (!dateString) return '';
  
  const now = new Date();
  const date = new Date(dateString);
  const diffTime = Math.abs(now.getTime() - date.getTime());
  const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
  
  if (diffDays === 0) {
    return '1d';
  } else if (diffDays < 30) {
    return `${diffDays}d`;
  } else if (diffDays < 365) {
    return `${Math.floor(diffDays / 30)}m`;
  } else {
    return `${Math.floor(diffDays / 365)}y`;
  }
}