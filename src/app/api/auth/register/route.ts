import { getSupabaseServer } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  try {
    const { email, password, businessName, firstName, lastName } = await request.json()
    
    const supabase = await getSupabaseServer()
    
    // Detailed logging for debugging
    console.log('Starting user registration for:', email)
    
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          business_name: businessName,
          first_name: firstName,
          last_name: lastName,
          user_type: 'coach'
        }
      }
    })
    
    if (error) {
      console.error('Registration error:', error)
      return NextResponse.json(
        { error: error.message || 'Registration failed' },
        { status: 400 }
      )
    }
    
    console.log('User registration successful:', data.user?.id)
    
    // If successful, return the user data
    return NextResponse.json({ 
      user: data.user,
      session: data.session 
    })
    
  } catch (error) {
    console.error('Server error during registration:', error)
    return NextResponse.json(
      { error: 'An unexpected error occurred' },
      { status: 500 }
    )
  }
}