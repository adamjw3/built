// Define client queries

interface ClientFilters {
  sortBy?: string;
  order?: 'asc' | 'desc';
  category?: string;
  status?: string;
  search?: string;
}

export const clientQueries = {
  // Get all clients with optional filtering
  getAllClients: async (filters: ClientFilters = {}) => {
    const queryParams = new URLSearchParams();
    
    // Add filters to query params
    if (filters.sortBy) queryParams.append('sortBy', filters.sortBy);
    if (filters.order) queryParams.append('order', filters.order);
    if (filters.category) queryParams.append('category', filters.category);
    if (filters.status) queryParams.append('status', filters.status);
    if (filters.search) queryParams.append('search', filters.search);
    
    const queryString = queryParams.toString();
    const endpoint = `/api/clients${queryString ? `?${queryString}` : ''}`;
    
    const response = await fetch(endpoint);
    
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || 'Failed to fetch clients');
    }
    
    return response.json();
  },
  
  // Get a single client by ID
  getClientById: async (id: string) => {
    const response = await fetch(`/api/clients/${id}`);
    
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || `Failed to fetch client with ID: ${id}`);
    }
    
    return response.json();
  },
  
  // Create a new client
  createClient: async (clientData: any) => {
    const response = await fetch('/api/clients', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(clientData),
    });
    
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || 'Failed to create client');
    }
    
    return response.json();
  },
  
  // Update a client
  updateClient: async (id: string, clientData: any) => {
    const response = await fetch(`/api/clients/${id}`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(clientData),
    });
    
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || `Failed to update client with ID: ${id}`);
    }
    
    return response.json();
  },
  
  // Delete a client
  deleteClient: async (id: string) => {
    const response = await fetch(`/api/clients/${id}`, {
      method: 'DELETE',
    });
    
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || `Failed to delete client with ID: ${id}`);
    }
    
    return response.json();
  },
  
  // Delete multiple clients
  deleteClients: async (ids: string[]) => {
    // Since we don't have a bulk delete endpoint, we'll delete them one by one
    const results = await Promise.all(
      ids.map(id => clientQueries.deleteClient(id))
    );
    
    return results;
  },
  
  // Update status for multiple clients
  updateClientsStatus: async (ids: string[], status: string) => {
    // Since we don't have a bulk update endpoint, we'll update them one by one
    const results = await Promise.all(
      ids.map(id => clientQueries.updateClient(id, { status }))
    );
    
    return results;
  }
}