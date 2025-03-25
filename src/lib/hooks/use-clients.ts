'use client'

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { clientQueries } from '@/lib/queries/clients'
import { useToast } from '@/hooks/use-toast'
import { useRouter } from 'next/navigation'

// Hook to fetch all clients with optional filtering
export function useClients(filters = {}) {
  return useQuery({
    queryKey: ['clients', filters],
    queryFn: () => clientQueries.getAllClients(filters),
  })
}

// Hook to fetch a single client by ID
export function useClient(id: string) {
  return useQuery({
    queryKey: ['clients', id],
    queryFn: () => clientQueries.getClientById(id),
    enabled: !!id, // Only run the query if we have an ID
  })
}

// Hook to create a new client
export function useCreateClient() {
  const { toast } = useToast()
  const queryClient = useQueryClient()
  const router = useRouter()
  
  return useMutation({
    mutationFn: (data: any) => clientQueries.createClient(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['clients'] })
      toast({
        title: "Success",
        description: "Client created successfully",
      })
      router.refresh()
    },
    onError: (error: any) => {
      toast({
        variant: "destructive",
        title: "Error",
        description: error.message || "Failed to create client",
      })
    }
  })
}

// Hook to update a client
export function useUpdateClient(id: string) {
  const { toast } = useToast()
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: (data: any) => clientQueries.updateClient(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['clients', id] })
      queryClient.invalidateQueries({ queryKey: ['clients'] })
      toast({
        title: "Success",
        description: "Client updated successfully",
      })
    },
    onError: (error: any) => {
      toast({
        variant: "destructive",
        title: "Error",
        description: error.message || "Failed to update client",
      })
    }
  })
}

// Hook to delete a client
export function useDeleteClient() {
  const { toast } = useToast()
  const queryClient = useQueryClient()
  const router = useRouter()
  
  return useMutation({
    mutationFn: (id: string) => clientQueries.deleteClient(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['clients'] })
      toast({
        title: "Success",
        description: "Client deleted successfully",
      })
      router.refresh()
    },
    onError: (error: any) => {
      toast({
        variant: "destructive",
        title: "Error",
        description: error.message || "Failed to delete client",
      })
    }
  })
}

// Hook to perform bulk actions on clients
export function useClientActions() {
  const { toast } = useToast()
  const queryClient = useQueryClient()
  const router = useRouter()
  
  const deleteClients = useMutation({
    mutationFn: (ids: string[]) => clientQueries.deleteClients(ids),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['clients'] })
      toast({
        title: "Success",
        description: "Clients deleted successfully",
      })
      router.refresh()
    },
    onError: (error: any) => {
      toast({
        variant: "destructive",
        title: "Error",
        description: error.message || "Failed to delete clients",
      })
    }
  })
  
  const archiveClients = useMutation({
    mutationFn: (ids: string[]) => clientQueries.updateClientsStatus(ids, 'Archive'),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['clients'] })
      toast({
        title: "Success",
        description: "Clients archived successfully",
      })
      router.refresh()
    },
    onError: (error: any) => {
      toast({
        variant: "destructive",
        title: "Error",
        description: error.message || "Failed to archive clients",
      })
    }
  })
  
  return {
    deleteClients,
    archiveClients
  }
}