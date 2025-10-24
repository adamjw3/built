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
 let query = supabase
  .from('exercises')
  .select(`
    target_muscles,
    user_exercises!left(
      target_muscles,
      user_id
    )
  `)
  .eq('user_exercises.user_id', authData.user.id)

  const { data, error } = await query

   if (error) {
      console.error('Error fetching muscle groups:', error)
      return NextResponse.json(
        { error: error.message },
        { status: 400 }
      )
    }

  // Process the data to get unique muscle groups
  const uniqueMuscleGroups = new Set<string>();

  data?.forEach(exercise => {
    // Add muscle groups from exercises table
    if (exercise.target_muscles) {
      if (Array.isArray(exercise.target_muscles)) {
        exercise.target_muscles.forEach(item => uniqueMuscleGroups.add(item));
      } else {
        uniqueMuscleGroups.add(exercise.target_muscles);
      }
    }
    
    // Add muscle groups from user_exercises
    exercise.user_exercises?.forEach(userExercise => {
      if (userExercise.target_muscles) {
        if (Array.isArray(userExercise.target_muscles)) {
          userExercise.target_muscles.forEach(item => uniqueMuscleGroups.add(item));
        } else {
          uniqueMuscleGroups.add(userExercise.target_muscles);
        }
      }
    });
  });
    
  // Transform data for the table
  const muscleGroups = Array.from(uniqueMuscleGroups);

  return NextResponse.json(muscleGroups); 
    
  } catch (error) {
    console.error('Server error fetching muscle groups:', error)
    return NextResponse.json(
      { error: 'An unexpected error occurred' },
      { status: 500 }
    )
  }
}