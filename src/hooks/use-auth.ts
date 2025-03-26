'use client'

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useRouter } from 'next/navigation'
import { useToast } from '@/hooks/use-toast'

// Hook for login functionality
export function useLogin() {
  const router = useRouter()
  const { toast } = useToast()
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: async ({ email, password }: { email: string; password: string }) => {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      })
      
      const data = await response.json()
      
      if (!response.ok) {
        throw new Error(data.error || 'Failed to sign in')
      }
      
      return data
    },
    onSuccess: () => {
      // Invalidate and refetch relevant queries
      queryClient.invalidateQueries({ queryKey: ['user'] })
      router.push('/clients')
      router.refresh()
    },
    onError: (error: any) => {
      toast({
        variant: "destructive",
        title: "Error",
        description: error.message || "Failed to sign in",
      })
    }
  })
}

// Hook for registration functionality
export function useRegister() {
  const router = useRouter()
  const { toast } = useToast()
  
  return useMutation({
    mutationFn: async (values: { 
      email: string; 
      password: string; 
      businessName: string; 
      firstName: string; 
      lastName: string;
    }) => {
      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(values),
      })
      
      const data = await response.json()
      
      if (!response.ok) {
        throw new Error(data.error || 'Failed to create account')
      }
      
      return data
    },
    onSuccess: (data) => {
      const emailConfirmRequired = !data.session
      
      toast({
        title: "Registration successful",
        description: emailConfirmRequired 
          ? "Please check your email to verify your account." 
          : "Your account has been created successfully.",
      })
      
      router.push('/login')
    },
    onError: (error: any) => {
      toast({
        variant: "destructive",
        title: "Error",
        description: error.message || "Failed to create account",
      })
    }
  })
}

// Hook for sign out functionality
export function useSignOut() {
  const router = useRouter()
  const { toast } = useToast()
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: async () => {
      const response = await fetch('/api/auth/signout', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        }
      })
      
      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.error || 'Failed to sign out')
      }
      
      return { success: true }
    },
    onSuccess: () => {
      // Clear all query cache on sign out
      queryClient.clear()
      router.push('/login')
    },
    onError: (error: any) => {
      toast({
        variant: "destructive",
        title: "Error",
        description: error.message || "Failed to sign out",
      })
    }
  })
}

// Hook for forgot password functionality
export function useForgotPassword() {
  const router = useRouter()
  const { toast } = useToast()
  
  return useMutation({
    mutationFn: async (email: string) => {
      const redirectTo = `${window.location.origin}/reset-password`
      
      const response = await fetch('/api/auth/reset-password', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, redirectTo }),
      })
      
      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.error || 'Failed to send reset link')
      }
      
      return { success: true }
    },
    onSuccess: () => {
      toast({
        title: "Check your email",
        description: "A password reset link has been sent to your email",
      })
      router.push('/login')
    },
    onError: (error: any) => {
      toast({
        variant: "destructive",
        title: "Error",
        description: error.message || "Failed to send reset link",
      })
    }
  })
}

// Hook for reset password functionality
export function useResetPassword() {
  const router = useRouter()
  const { toast } = useToast()
  
  return useMutation({
    mutationFn: async (password: string) => {
      const response = await fetch('/api/auth/update-password', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ password }),
      })
      
      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.error || 'Failed to update password')
      }
      
      return { success: true }
    },
    onSuccess: () => {
      toast({
        title: "Password updated",
        description: "Your password has been successfully updated",
      })
      router.push('/login')
    },
    onError: (error: any) => {
      toast({
        variant: "destructive",
        title: "Error",
        description: error.message || "Failed to update password",
      })
    }
  })
}

// Hook to get current user data
export function useUser() {
  return useQuery({
    queryKey: ['user'],
    queryFn: async () => {
      const response = await fetch('/api/auth/user')
      
      if (!response.ok) {
        throw new Error('Failed to fetch user')
      }
      
      const data = await response.json()
      return data
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
  })
}