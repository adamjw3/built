import { TypedSupabaseClient } from '@/lib/types'

// Auth-related query functions
export const authQueries = {
  signIn: (client: TypedSupabaseClient, { email, password }: { email: string; password: string }) => {
    return client.auth.signInWithPassword({
      email,
      password,
    })
  },
  
  signUp: (
    client: TypedSupabaseClient, 
    { 
      email, 
      password, 
      businessName, 
      firstName, 
      lastName 
    }: { 
      email: string; 
      password: string; 
      businessName: string; 
      firstName: string; 
      lastName: string;
    }
  ) => {
    return client.auth.signUp({
      email,
      password,
      options: {
        data: {
          user_type: 'admin',
          business_name: businessName,
          first_name: firstName,
          last_name: lastName,
        }
      }
    })
  },
  
  signOut: (client: TypedSupabaseClient) => {
    return client.auth.signOut()
  },
  
  resetPasswordForEmail: (client: TypedSupabaseClient, email: string, redirectTo: string) => {
    return client.auth.resetPasswordForEmail(email, {
      redirectTo,
    })
  },
  
  updatePassword: (client: TypedSupabaseClient, password: string) => {
    return client.auth.updateUser({
      password
    })
  },
  
  getUser: (client: TypedSupabaseClient) => {
    return client.auth.getUser()
  }
}