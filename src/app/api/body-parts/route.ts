import { getSupabaseServer } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'

export async function GET() {
  try {
    const supabase = await getSupabaseServer()
    
    // Get the current authenticated user
    const { data: authData, error: authError } = await supabase.auth.getUser()
    
    if (authError || !authData?.user) {
      return NextResponse.json(
        { error: 'You must be logged in to view exercises' },
        { status: 401 }
      )
    }
    

    // Get unique body parts from both tables
    const { data, error } = await supabase
      .from('exercises')
      .select(`
        body_parts,
        user_exercises!left(
          body_parts,
          user_id
        )
      `)
      .eq('user_exercises.user_id', authData.user.id)
      .range(0, 9999)

    if (error) {
      console.error('Error fetching body parts:', error)
      return NextResponse.json(
        { error: error.message },
        { status: 400 }
      )
    }

    // Collect unique body parts from both exercises and user_exercises
    const uniqueBodyParts = new Set<string>()

    data?.forEach(exercise => {
      // Add body parts from exercises table
      exercise.body_parts?.forEach((part: string) => uniqueBodyParts.add(part))

      // Add body parts from user_exercises
      exercise.user_exercises?.forEach(userExercise => {
        userExercise.body_parts?.forEach((part: string) => uniqueBodyParts.add(part))
      })
    })

    return NextResponse.json(Array.from(uniqueBodyParts)) 
    
  } catch (error) {
    console.error('Server error fetching body parts:', error)
    return NextResponse.json(
      { error: 'An unexpected error occurred' },
      { status: 500 }
    )
  }
}