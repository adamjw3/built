import { SupabaseClient } from '@supabase/supabase-js'

// This is a placeholder for your database schema types.
// You should replace this with actual types generated from your Supabase schema
// using the Supabase CLI: supabase gen types typescript --linked > lib/types.ts
export type Database = any

// Typed Supabase client to be used throughout the application
export type TypedSupabaseClient = SupabaseClient<Database>