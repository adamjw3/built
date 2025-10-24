'use client'

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { exercisesQueries } from '@/lib/queries/exercises'
import { useToast } from '@/hooks/use-toast'
import { useRouter } from 'next/navigation'

// Hook to fetch all exercises with optional filtering
export function useExercises(filters = {}) {
  return useQuery({
    queryKey: ['exercises', filters],
    queryFn: () => exercisesQueries.getAllExercises(filters),
  })
}

// Hook to fetch a single exercise by ID
export function useExercise(id: string) {
  return useQuery({
    queryKey: ['exercises', id],
    queryFn: () => exercisesQueries.getExerciseById(id),
    enabled: !!id, // Only run the query if we have an ID
  })
}

export function useEquipment() {
  return useQuery({
    queryKey: ['equipment'],
    queryFn: () => exercisesQueries.getAllExerciseEquipment(),
  })
}

export function useMuscleGroups() {
  return useQuery({
    queryKey: ['muscle-groups'],
    queryFn: () => exercisesQueries.getAllMuscleGroups(),
  })
}

export function useBodyParts() {
  return useQuery({
    queryKey: ['body-parts'],
    queryFn: () => exercisesQueries.getAllBodyParts(),
  })
}

// Hook to create a new exercise
export function useCreateExercise() {
  const { toast } = useToast()
  const queryClient = useQueryClient()
  const router = useRouter()
  
  return useMutation({
    mutationFn: (data: any) => exercisesQueries.createExercise(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['exercises'] })
      toast({
        title: "Success",
        description: "Exercise created successfully",
      })
      router.refresh()
    },
    onError: (error: any) => {
      toast({
        variant: "destructive",
        title: "Error",
        description: error.message || "Failed to create exercise",
      })
    }
  })
}

// Hook to update an exercise
export function useUpdateExercise(id: string) {
  const { toast } = useToast()
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (data: any) => exercisesQueries.updateExercise(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['exercises', id] })
      queryClient.invalidateQueries({ queryKey: ['exercises'] })
      toast({
        title: "Success",
        description: "Exercise updated successfully",
      })
    },
    onError: (error: any) => {
      toast({
        variant: "destructive",
        title: "Error",
        description: error.message || "Failed to update exercise",
      })
    }
  })
}

// Hook to delete an exercise
export function useDeleteExercise() {
  const { toast } = useToast()
  const queryClient = useQueryClient()
  const router = useRouter()

  return useMutation({
    mutationFn: (id: string) => exercisesQueries.deleteExercise(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['exercises'] })
      toast({
        title: "Success",
        description: "Exercise deleted successfully",
      })
      router.refresh()
    },
    onError: (error: any) => {
      toast({
        variant: "destructive",
        title: "Error",
        description: error.message || "Failed to delete exercise",
      })
    }
  })
}