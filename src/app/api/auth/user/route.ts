import { getSupabaseServer } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  try {
    const supabase = await getSupabaseServer()
    
    const { data, error } = await supabase.auth.getUser()
    
    if (error) {
      console.error('Get user error:', error)
      return NextResponse.json(
        { error: error.message },
        { status: 400 }
      )
    }
    
    return NextResponse.json({ 
      user: data.user
    })
    
  } catch (error) {
    console.error('Server error getting user:', error)
    return NextResponse.json(
      { error: 'An unexpected error occurred' },
      { status: 500 }
    )
  }
}