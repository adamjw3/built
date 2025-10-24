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
    const { data, error } = await supabase
      .from('exercises')
      .select(`
        equipments,
        user_exercises!left(
          equipments,
          user_id
        )
      `)
      .eq('user_exercises.user_id', authData.user.id)
      .range(0, 9999)

    if (error) {
      console.error('Error fetching equipments:', error)
      return NextResponse.json(
        { error: error.message },
        { status: 400 }
      )
    }

    // Collect unique equipment from both exercises and user_exercises
    const uniqueEquipment = new Set<string>()

    data?.forEach(exercise => {
      // Add equipment from exercises table
      exercise.equipments?.forEach((equipment: string) => uniqueEquipment.add(equipment))

      // Add equipment from user_exercises
      exercise.user_exercises?.forEach(userExercise => {
        userExercise.equipments?.forEach((equipment: string) => uniqueEquipment.add(equipment))
      })
    })

    return NextResponse.json(Array.from(uniqueEquipment)) 
    
  } catch (error) {
    console.error('Server error fetching equipments:', error)
    return NextResponse.json(
      { error: 'An unexpected error occurred' },
      { status: 500 }
    )
  }
}
