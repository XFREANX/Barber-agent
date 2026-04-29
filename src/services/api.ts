const API_URL = 'http://localhost:5000/api';

export const fetchServices = async () => {
  try {
    const response = await fetch(`${API_URL}/services`);
    const data = await response.json();
    if (data.success) {
      return data.data;
    }
    throw new Error(data.error || 'Failed to fetch services');
  } catch (error) {
    console.error('Error fetching services:', error);
    throw error;
  }
};

export const fetchBarbers = async () => {
  try {
    const response = await fetch(`${API_URL}/barbers`);
    const data = await response.json();
    if (data.success) {
      return data.data;
    }
    throw new Error(data.error || 'Failed to fetch barbers');
  } catch (error) {
    console.error('Error fetching barbers:', error);
    throw error;
  }
};
