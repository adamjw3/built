'use client'

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { metricsQueries } from '@/lib/queries/metrics'
import { useToast } from '@/hooks/use-toast'
import { useRouter } from 'next/navigation'

// Hook to fetch metrics for a client
export function useClientMetrics(clientId: string) {
  return useQuery({
    queryKey: ['clients', clientId, 'metrics'],
    queryFn: () => metricsQueries.getClientMetrics(clientId),
    enabled: !!clientId, // Only run the query if we have a clientId
  })
}

// Hook to update metric preferences
export function useUpdateMetricPreferences(clientId: string) {
  const { toast } = useToast()
  const queryClient = useQueryClient()
  const router = useRouter()
  
  return useMutation({
    mutationFn: (metricsToSave: any[]) => 
      metricsQueries.updateMetricPreferences(clientId, metricsToSave),
    onSuccess: () => {
      // Invalidate and refetch metrics
      queryClient.invalidateQueries({ queryKey: ['clients', clientId, 'metrics'] })
      toast({
        title: "Success",
        description: "Metric preferences updated successfully",
      })
      router.refresh()
    },
    onError: (error: any) => {
      toast({
        variant: "destructive",
        title: "Error",
        description: error.message || "Failed to update metric preferences",
      })
    }
  })
}

// Hook to add a new metric value
export function useAddMetricValue(clientId: string) {
  const { toast } = useToast()
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: ({ metricId, value }: { metricId: string, value: number }) => 
      metricsQueries.addMetricValue(clientId, metricId, value),
    onSuccess: () => {
      // Invalidate and refetch metrics
      queryClient.invalidateQueries({ queryKey: ['clients', clientId, 'metrics'] })
      toast({
        title: "Success",
        description: "Metric value added successfully",
      })
    },
    onError: (error: any) => {
      toast({
        variant: "destructive",
        title: "Error",
        description: error.message || "Failed to add metric value",
      })
    }
  })
}