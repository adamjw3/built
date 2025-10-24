import { getSupabaseServer } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
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

    // Try to get from user_exercises first
    const { data: userExercise, error: userExerciseError } = await supabase
      .from('user_exercises')
      .select('*')
      .eq('id', params.id)
      .eq('user_id', authData.user.id)
      .single()

    if (userExercise) {
      return NextResponse.json({ exercise: userExercise })
    }

    // If not found in user_exercises, try exercises table
    const { data: exercise, error } = await supabase
      .from('exercises')
      .select('*')
      .eq('id', params.id)
      .single()

    if (error) {
      console.error('Error fetching exercise:', error)
      return NextResponse.json(
        { error: 'Exercise not found' },
        { status: 404 }
      )
    }

    return NextResponse.json({ exercise })

  } catch (error) {
    console.error('Server error fetching exercise:', error)
    return NextResponse.json(
      { error: 'An unexpected error occurred' },
      { status: 500 }
    )
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const supabase = await getSupabaseServer()

    // Get user authentication data
    const { data: authData, error: authError } = await supabase.auth.getUser()

    if (authError || !authData?.user) {
      return NextResponse.json(
        { error: 'You must be logged in to update an exercise' },
        { status: 401 }
      )
    }

    // Get form data from request
    const formData = await request.json()

    // Validate required field
    if (!formData.name?.trim()) {
      return NextResponse.json(
        { error: 'Exercise name is required' },
        { status: 400 }
      )
    }

    // Prepare exercise data
    const exerciseData = {
      name: formData.name.trim(),
      base_exercise_id: formData.base_exercise_id,
      target_muscles: formData.target_muscles,
      body_parts: formData.body_parts,
      equipments: formData.equipments,
      secondary_muscles: formData.secondary_muscles,
      instructions: formData.instructions,
      images: formData.images,
      gif_filename: formData.gif_filename,
      video_url: formData.video_url,
      video_platform: formData.video_platform,
      is_custom: formData.is_custom,
      is_private: formData.is_private,
      updated_at: new Date().toISOString(),
    }

    // Update exercise data in Supabase
    // RLS policy ensures user can only update their own exercises
    const { data: exercise, error } = await supabase
      .from('user_exercises')
      .update(exerciseData)
      .eq('id', params.id)
      .eq('user_id', authData.user.id) // Extra security: ensure user owns this exercise
      .select()
      .single()

    if (error) {
      console.error('Error updating exercise:', error)
      return NextResponse.json(
        { error: error.message },
        { status: 400 }
      )
    }

    if (!exercise) {
      return NextResponse.json(
        { error: 'Exercise not found or you do not have permission to update it' },
        { status: 404 }
      )
    }

    return NextResponse.json({ exercise })

  } catch (error) {
    console.error('Server error updating exercise:', error)
    return NextResponse.json(
      { error: 'An unexpected error occurred' },
      { status: 500 }
    )
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const id = params.id
    const supabase = await getSupabaseServer()

    // Get user authentication data
    const { data: authData, error: authError } = await supabase.auth.getUser()

    if (authError || !authData?.user) {
      return NextResponse.json(
        { error: 'You must be logged in to delete an exercise' },
        { status: 401 }
      )
    }

    // Delete the exercise
    const { error } = await supabase
      .from('user_exercises')
      .delete()
      .eq('id', id)
      .eq('user_id', authData.user.id)

    if (error) {
      console.error('Error deleting exercise:', error)
      return NextResponse.json(
        { error: error.message },
        { status: 400 }
      )
    }

    return NextResponse.json({ success: true })

  } catch (error) {
    console.error('Server error deleting exercise:', error)
    return NextResponse.json(
      { error: 'An unexpected error occurred' },
      { status: 500 }
    )
  }
}
