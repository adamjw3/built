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
 let query = supabase
  .from('exercises')
  .select(`
    body_parts,
    user_exercises!left(
      body_parts,
      user_id
    )
  `)
  .eq('user_exercises.user_id', authData.user.id)

  const { data, error } = await query

   if (error) {
      console.error('Error fetching body parts:', error)
      return NextResponse.json(
        { error: error.message },
        { status: 400 }
      )
    }

  // Process the data to get unique body parts
  const uniqueBodyParts = new Set<string>();

  data?.forEach(exercise => {
    // Add body parts from exercises table
    if (exercise.body_parts) {
      if (Array.isArray(exercise.body_parts)) {
        exercise.body_parts.forEach(item => uniqueBodyParts.add(item));
      } else {
        uniqueBodyParts.add(exercise.body_parts);
      }
    }
    
    // Add body parts from user_exercises
    exercise.user_exercises?.forEach(userExercise => {
      if (userExercise.body_parts) {
        if (Array.isArray(userExercise.body_parts)) {
          userExercise.body_parts.forEach(item => uniqueBodyParts.add(item));
        } else {
          uniqueBodyParts.add(userExercise.body_parts);
        }
      }
    });
  });
    
  // Transform data for the table
  const bodyParts = Array.from(uniqueBodyParts);

  return NextResponse.json(bodyParts); 
    
  } catch (error) {
    console.error('Server error fetching body parts:', error)
    return NextResponse.json(
      { error: 'An unexpected error occurred' },
      { status: 500 }
    )
  }
}