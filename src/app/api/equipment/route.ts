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
    

// Get unique equipment from both tables
 let query = supabase
  .from('exercises')
  .select(`
    equipments,
    user_exercises!left(
      equipments,
      user_id
    )
  `)
  .eq('user_exercises.user_id', authData.user.id)

  const { data, error } = await query

   if (error) {
      console.error('Error fetching equipments:', error)
      return NextResponse.json(
        { error: error.message },
        { status: 400 }
      )
    }

  // Process the data to get unique equipment
  const uniqueEquipment = new Set<string>();

  data?.forEach(exercise => {
    // Add equipment from exercises table
    if (exercise.equipments) {
      if (Array.isArray(exercise.equipments)) {
        exercise.equipments.forEach(item => uniqueEquipment.add(item));
      } else {
        uniqueEquipment.add(exercise.equipments);
      }
    }
    
    // Add equipment from user_exercises
    exercise.user_exercises?.forEach(userExercise => {
      if (userExercise.equipments) {
        if (Array.isArray(userExercise.equipments)) {
          userExercise.equipments.forEach(item => uniqueEquipment.add(item));
        } else {
          uniqueEquipment.add(userExercise.equipments);
        }
      }
    });
  });
    
  // Transform data for the table
  const equipments = Array.from(uniqueEquipment);

  console.log("data", data)

  console.log("equipments", equipments)

  return NextResponse.json(equipments); 
    
  } catch (error) {
    console.error('Server error fetching equipments:', error)
    return NextResponse.json(
      { error: 'An unexpected error occurred' },
      { status: 500 }
    )
  }
}
