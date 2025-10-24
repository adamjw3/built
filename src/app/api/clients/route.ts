import { getSupabaseServer } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  try {
    const supabase = await getSupabaseServer()
    
    // Get the current authenticated user
    const { data: authData, error: authError } = await supabase.auth.getUser()
    
    if (authError || !authData?.user) {
      return NextResponse.json(
        { error: 'You must be logged in to view clients' },
        { status: 401 }
      )
    }
    
    // Get query parameters
    const url = new URL(request.url)
    const sortBy = url.searchParams.get('sortBy') || 'updated_at'
    const order = url.searchParams.get('order') || 'desc'
    const category = url.searchParams.get('category')
    const status = url.searchParams.get('status')
    const search = url.searchParams.get('search')
    
    // Start building the query
    let query = supabase
      .from('clients')
      .select('*')
      // Only fetch clients belonging to the current user
      .eq('user_id', authData.user.id)
    
    // Apply filters if provided
    if (category && category !== 'all') {
      query = query.eq('client_type', category)
    }
    
    if (status && status !== 'all') {
      query = query.eq('status', status)
    }
    
    if (search) {
      query = query.ilike('name', `%${search}%`)
    }
    
    // Apply sorting
    query = query.order(sortBy as any, { ascending: order === 'asc' })
    
    // Execute the query
    const { data, error } = await query
    
    if (error) {
      console.error('Error fetching clients:', error)
      return NextResponse.json(
        { error: error.message },
        { status: 400 }
      )
    }
    
    // Transform data for the table
    const clients = data?.map(client => ({
      id: client.id,
      name: client.name,
      demo: client.name.includes("Demo"),
      lastActivity: formatTimeAgo(client.updated_at),
      lastTraining7d: client.last_training_completion,
      lastTraining30d: client.last_training_30d_completion,
      lastTasks7d: client.last_task_completion,
      category: client.client_type || "Online",
      status: client.status || "Connected",
      avatar: client.avatar_url
    })) || []
    
    return NextResponse.json({ clients })
    
  } catch (error) {
    console.error('Server error fetching clients:', error)
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
        { error: 'You must be logged in to create a client' },
        { status: 401 }
      )
    }
    
    // Get form data from request
    const formData = await request.json()
    
    // Insert client data into Supabase
    const { data: client, error } = await supabase
      .from('clients')
      .insert([
        {
          name: `${formData.firstName} ${formData.lastName}`,
          first_name: formData.firstName,
          last_name: formData.lastName,
          email: formData.email,
          client_type: formData.clientType,
          assigned_to: formData.assignedTo,
          user_id: authData.user.id,
          updated_at: new Date().toISOString()
        },
      ])
      .select()
      .single()
    
    if (error) {
      console.error('Error creating client:', error)
      return NextResponse.json(
        { error: error.message },
        { status: 400 }
      )
    }
    
    // Handle metric preferences if provided
    if (client && formData.metricDefinitions?.length > 0) {
      const orderedMetricIds = formData.orderedMetricIds || formData.metricDefinitions.map(m => m.id)
      console.log("orderedMetricIds", orderedMetricIds)
      const metricPreferencesData = orderedMetricIds.map((metricId, index) => ({
        client_id: client.id,
        metric_id: metricId,
        display_order: index,
        is_visible: true
      }))

      console.log("metricPreferencesData", metricPreferencesData)
      
      const { error: preferencesError } = await supabase
        .from('client_metric_preferences')
        .insert(metricPreferencesData)
      
      if (preferencesError) {
        console.error('Error setting metric preferences:', preferencesError)
        // Continue anyway even if preferences fail
      }
    }
    
    return NextResponse.json({ client })
    
  } catch (error) {
    console.error('Server error creating client:', error)
    return NextResponse.json(
      { error: 'An unexpected error occurred' },
      { status: 500 }
    )
  }
}

// Helper function to format time ago
function formatTimeAgo(dateString: any) {
  if (!dateString) return '';
  
  const now = new Date();
  const date = new Date(dateString);
  const diffTime = Math.abs(now.getTime() - date.getTime());
  const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
  
  if (diffDays === 0) {
    return '1d';
  } else if (diffDays < 30) {
    return `${diffDays}d`;
  } else if (diffDays < 365) {
    return `${Math.floor(diffDays / 30)}m`;
  } else {
    return `${Math.floor(diffDays / 365)}y`;
  }
}