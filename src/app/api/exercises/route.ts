import { getSupabaseServer } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
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
    
    // Get query parameters
    const url = new URL(request.url)
    const sortBy = url.searchParams.get('sortBy') || 'updated_at'
    const order = url.searchParams.get('order') || 'desc'
    const equipments = url.searchParams.get('equipments')
    const target_muscles = url.searchParams.get('target_muscles')
    const body_parts = url.searchParams.get('body_parts')
    const status = url.searchParams.get('status')
    const search = url.searchParams.get('search')
    const is_custom = url.searchParams.get('is_custom')
    
    // First query: Get all exercises (no filters yet)
    const exercisesQuery = supabase
      .from('exercises')
      .select('*')
    
    // Second query: Get user_exercises for current user
    const userExercisesQuery = supabase
      .from('user_exercises')
      .select('*')
      .eq('user_id', authData.user.id)
    
    // Execute both queries in parallel
    const [exercisesResult, userExercisesResult] = await Promise.all([
      exercisesQuery,
      userExercisesQuery
    ])
    
    if (exercisesResult.error) {
      console.error('Error fetching exercises:', exercisesResult.error)
      return NextResponse.json(
        { error: exercisesResult.error.message },
        { status: 400 }
      )
    }
    
    if (userExercisesResult.error) {
      console.error('Error fetching user exercises:', userExercisesResult.error)
      return NextResponse.json(
        { error: userExercisesResult.error.message },
        { status: 400 }
      )
    }
    
    // Combine all exercises from both tables into one dataset
    const allExercises = [
      // Add all exercises from exercises table (mark as non-custom)
      ...(exercisesResult.data || []).map(exercise => ({
        ...exercise,
        is_custom: false,
        is_user_exercise: false
      })),
      // Add all user_exercises from current user (transform to match exercise structure)
      ...(userExercisesResult.data || []).map(userExercise => ({
        ...userExercise,
        // Mark this as a user exercise for identification
        is_user_exercise: true,
        // Use the user exercise ID as the main ID
        exercise_id: userExercise.id,
        // Keep original exercise reference if it exists
        base_exercise_id: userExercise.base_exercise_id || userExercise.exercise_id,
        // Ensure is_custom is set (default to true for user exercises if not specified)
        is_custom: userExercise.is_custom !== undefined ? userExercise.is_custom : true
      }))
    ]
    
    let exercises = allExercises
    
    console.log(`Total exercises from exercises table: ${exercisesResult.data?.length || 0}`)
    console.log(`Total user_exercises: ${userExercisesResult.data?.length || 0}`)
    console.log(`Total combined exercises: ${exercises.length}`)
    console.log('Combined exercises:', exercises.map(e => ({ id: e.id, name: e.name, is_user_exercise: e.is_user_exercise })))
    
    // Apply filters on merged data
    if (equipments && equipments !== 'all') {
      exercises = exercises.filter(exercise => 
        exercise.equipments?.includes(equipments)
      )
    }
    
    if (target_muscles && target_muscles !== 'all') {
      exercises = exercises.filter(exercise => 
        exercise.target_muscles?.includes(target_muscles)
      )
    }
    
    if (body_parts && body_parts !== 'all') {
      exercises = exercises.filter(exercise => 
        exercise.body_parts?.includes(body_parts)
      )
    }
    
    if (status && status !== 'all') {
      exercises = exercises.filter(exercise => exercise.status === status)
    }
    
    if (search) {
      const terms = search.split(' ').filter(term => term.trim().length > 0)
      if (terms.length > 0) {
        exercises = exercises.filter(exercise => {
          return terms.every(term => 
            exercise.name?.toLowerCase().includes(term.toLowerCase())
          )
        })
      }
    }
    
    if (is_custom && is_custom !== 'all') {
      const isCustomBool = is_custom === 'true'
      exercises = exercises.filter(exercise => exercise.is_custom === isCustomBool)
    }
    
    // Apply sorting
    exercises.sort((a, b) => {
      const aValue = a[sortBy as keyof typeof a]
      const bValue = b[sortBy as keyof typeof b]
      
      if (aValue === null || aValue === undefined) return 1
      if (bValue === null || bValue === undefined) return -1
      
      // Special handling for boolean fields like is_custom
      if (sortBy === 'is_custom') {
        // Convert boolean to number for proper sorting (false = 0, true = 1)
        const aNum = aValue ? 1 : 0
        const bNum = bValue ? 1 : 0
        return order === 'asc' ? aNum - bNum : bNum - aNum
      }
      
      if (aValue < bValue) return order === 'asc' ? -1 : 1
      if (aValue > bValue) return order === 'asc' ? 1 : -1
      return 0
    })
    
    return NextResponse.json({ exercises })
    
  } catch (error) {
    console.error('Server error fetching exercises:', error)
    return NextResponse.json(
      { error: 'An unexpected error occurred' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const supabase = await getSupabaseServer()
    
    // Get user authentication data
    const { data: authData, error: authError } = await supabase.auth.getUser()
    
    if (authError || !authData?.user) {
      return NextResponse.json(
        { error: 'You must be logged in to create a exercise' },
        { status: 401 }
      )
    }
    
    // Get form data from request
    const formData = await request.json()

    // Validate required fields
    if (!formData.name?.trim()) {
      return NextResponse.json(
        { error: 'Exercise name is required' },
        { status: 400 }
      )
    }

    const exerciseData = {
      user_id: authData.user.id,
      name: formData.name.trim(),
      base_exercise_id: formData.base_exercise_id,
      target_muscles: formData.target_muscles,
      body_parts: formData.body_parts,
      equipments: formData.equipments,
      secondary_muscles: formData.secondary_muscles,
      instructions: formData.instructions,
      gif_filename: formData.gif_filename,
      video_url: formData.video_url,
      video_platform: formData.video_platform,
      is_custom: formData.is_custom,
      is_private: formData.is_private
    }
    
    // Insert client data into Supabase
    const { data: exercise, error } = await supabase
      .from('user_exercises')
      .insert(exerciseData)
      .select()
      .single()
    
    if (error) {
      console.error('Error creating exercise:', error)
      return NextResponse.json(
        { error: error.message },
        { status: 400 }
      )
    }
    
    return NextResponse.json({ exercise }, { status: 201 })

  } catch (error) {
    console.error('Server error creating exercise:', error)
    return NextResponse.json(
      { error: 'An unexpected error occurred' },
      { status: 500 }
    )
  }
}