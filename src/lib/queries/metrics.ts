// Define metrics queries

export const metricsQueries = {
  // Get client metrics data
  getClientMetrics: async (clientId: string) => {
    const response = await fetch(`/api/clients/${clientId}/metrics`);
    
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || `Failed to fetch metrics for client: ${clientId}`);
    }
    
    return response.json();
  },
  
  // Update metric preferences
  updateMetricPreferences: async (clientId: string, metricsToSave: any[]) => {
    const response = await fetch(`/api/clients/${clientId}/metrics`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ metricsToSave }),
    });
    
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || 'Failed to update metric preferences');
    }
    
    return response.json();
  },
  
  // Add a new metric value
  addMetricValue: async (clientId: string, metricId: string, value: number) => {
    const response = await fetch(`/api/clients/${clientId}/metrics/${metricId}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ value }),
    });
    
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || 'Failed to add metric value');
    }
    
    return response.json();
  },
}