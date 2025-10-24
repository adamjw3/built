// Define queries

export interface Exercise {
  id: string;
  name: string;
  target_muscles?: string;
  body_parts?: string;
  equipments?: string;
  secondary_muscles?: string;
  instructions?: string;
  images?: string[];
  gif_filename?: string;
  video_url?: string;
  video_platform?: string;
  is_custom?: boolean;
  is_private?: boolean;
  is_user_exercise?: boolean;
  exercise_id?: string;
  base_exercise_id?: string;
  user_id?: string;
  created_at?: string;
  updated_at?: string;
}

interface ExerciseFilters {
  sortBy?: string;
  order?: 'asc' | 'desc';
  equipments?: string;
  target_muscles?: string;
  body_parts?: string;
  status?: string;
  search?: string;
  is_custom?: string;
}

export const exercisesQueries = {
  getAllExercises: async (filters: ExerciseFilters = {}) => {
    const queryParams = new URLSearchParams();
    if (filters.sortBy) queryParams.append('sortBy', filters.sortBy);
    if (filters.order) queryParams.append('order', filters.order);
    if (filters.equipments) queryParams.append('equipments', filters.equipments);
    if (filters.target_muscles) queryParams.append('target_muscles', filters.target_muscles);
    if (filters.body_parts) queryParams.append('body_parts', filters.body_parts);
    if (filters.status) queryParams.append('status', filters.status);
    if (filters.search) queryParams.append('search', filters.search);
    if (filters.is_custom) queryParams.append('is_custom', filters.is_custom);
    
    const queryString = queryParams.toString();
    const endpoint = `/api/exercises${queryString ? `?${queryString}` : ''}`;
    
    const response = await fetch(endpoint);

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || 'Failed to fetch exercises');
    }
    
    return response.json();
  },

  getAllExerciseEquipment: async () => {
    const response = await fetch(`/api/equipment`);

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || 'Failed to fetch equipment');
    }
    
    return response.json();
  },

  getAllMuscleGroups: async () => {
    const response = await fetch(`/api/muscle-groups`);

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || 'Failed to fetch muscle groups');
    }
    
    return response.json();
  },

  getAllBodyParts: async () => {
    const response = await fetch(`/api/body-parts`);

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || 'Failed to fetch body parts');
    }
    
    return response.json();
  },
  
  // Get a single client by ID
  getExerciseById: async (id: string) => {
    const response = await fetch(`/api/exercises/${id}`);
    
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || `Failed to fetch exercise with ID: ${id}`);
    }
    
    return response.json();
  },
  
  // Create a new client
  createExercise: async (exerciseData: any) => {
    const response = await fetch('/api/exercises', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(exerciseData),
    });
    
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || 'Failed to create exercise');
    }
    
    return response.json();
  },
  
  updateExercise: async (id: string, clientData: any) => {
    const response = await fetch(`/api/exercises/${id}`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(clientData),
    });
    
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || `Failed to update exercise with ID: ${id}`);
    }
    
    return response.json();
  },
  
  deleteExercise: async (id: string) => {
    const response = await fetch(`/api/exercises/${id}`, {
      method: 'DELETE',
    });
    
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || `Failed to delete exercise with ID: ${id}`);
    }
    
    return response.json();
  }
}