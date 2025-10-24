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
    

    // Get unique muscle groups from both tables
    const { data, error } = await supabase
      .from('exercises')
      .select(`
        target_muscles,
        user_exercises!left(
          target_muscles,
          user_id
        )
      `)
      .eq('user_exercises.user_id', authData.user.id)
      .range(0, 9999)

    if (error) {
      console.error('Error fetching muscle groups:', error)
      return NextResponse.json(
        { error: error.message },
        { status: 400 }
      )
    }

    // Collect unique muscle groups from both exercises and user_exercises
    const uniqueMuscleGroups = new Set<string>()

    data?.forEach(exercise => {
      // Add muscle groups from exercises table
      exercise.target_muscles?.forEach((muscle: string) => uniqueMuscleGroups.add(muscle))

      // Add muscle groups from user_exercises
      exercise.user_exercises?.forEach(userExercise => {
        userExercise.target_muscles?.forEach((muscle: string) => uniqueMuscleGroups.add(muscle))
      })
    })

    return NextResponse.json(Array.from(uniqueMuscleGroups)) 
    
  } catch (error) {
    console.error('Server error fetching muscle groups:', error)
    return NextResponse.json(
      { error: 'An unexpected error occurred' },
      { status: 500 }
    )
  }
}