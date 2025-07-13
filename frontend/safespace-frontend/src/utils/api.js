import axios from 'axios';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:3001';
const FASTAPI_BASE_URL = process.env.REACT_APP_FASTAPI_URL || 'http://localhost:8000';

// Create axios instances
export const nodeAPI = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: true, // For HttpOnly cookies
});

export const fastAPI = axios.create({
  baseURL: FASTAPI_BASE_URL,
});

// Add response interceptor for error handling
nodeAPI.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Redirect to login on 401
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// Location service using IPInfo API
export const getLocationFromIP = async () => {
  try {
    const response = await axios.get('https://ipinfo.io/json');
    return {
      city: response.data.city,
      region: response.data.region,
      country: response.data.country,
      coordinates: response.data.loc ? response.data.loc.split(',').map(Number) : null,
    };
  } catch (error) {
    console.error('Failed to get location from IP:', error);
    return {
      city: 'Delhi', // Default fallback
      region: 'Delhi',
      country: 'IN',
      coordinates: [28.6139, 77.2090], // Delhi coordinates
    };
  }
};

// Get threats data from FastAPI
export const getThreats = async (location = null) => {
  try {
    const params = location ? { location } : {};
    const response = await fastAPI.get('/api/threats', { params });
    return response.data;
  } catch (error) {
    console.error('Failed to fetch threats:', error);
    throw error;
  }
};

// Get threat details with AI advice
export const getThreatDetails = async (threatId) => {
  try {
    const response = await fastAPI.get(`/api/threats/${threatId}`);
    return response.data;
  } catch (error) {
    console.error('Failed to fetch threat details:', error);
    throw error;
  }
};

// Authentication APIs (Node.js backend)
export const loginUser = async (email, password) => {
  try {
    const response = await nodeAPI.post('/auth/login', { email, password });
    return response.data;
  } catch (error) {
    console.error('Login failed:', error);
    throw error;
  }
};

export const registerUser = async (name, email, password) => {
  try {
    const response = await nodeAPI.post('/auth/register', { name, email, password });
    return response.data;
  } catch (error) {
    console.error('Registration failed:', error);
    throw error;
  }
};

export const logoutUser = async () => {
  try {
    const response = await nodeAPI.post('/auth/logout');
    return response.data;
  } catch (error) {
    console.error('Logout failed:', error);
    throw error;
  }
};

export const getCurrentUser = async () => {
  try {
    const response = await nodeAPI.get('/auth/me');
    return response.data;
  } catch (error) {
    console.error('Failed to get current user:', error);
    throw error;
  }
};

// Save threat to user's favorites
export const saveThreat = async (threatId) => {
  try {
    const response = await nodeAPI.post('/api/saved-threats', { threatId });
    return response.data;
  } catch (error) {
    console.error('Failed to save threat:', error);
    throw error;
  }
};

// Get user's saved threats
export const getSavedThreats = async () => {
  try {
    const response = await nodeAPI.get('/api/saved-threats');
    return response.data;
  } catch (error) {
    console.error('Failed to fetch saved threats:', error);
    throw error;
  }
};

// Update notification preferences
export const updateNotificationSettings = async (settings) => {
  try {
    const response = await nodeAPI.put('/api/notifications/settings', { settings });
    return response.data;
  } catch (error) {
    console.error('Failed to update notification settings:', error);
    throw error;
  }
};

const apiService = {
  nodeAPI,
  fastAPI,
  getLocationFromIP,
  getThreats,
  getThreatDetails,
  loginUser,
  registerUser,
  logoutUser,
  getCurrentUser,
  saveThreat,
  getSavedThreats,
  updateNotificationSettings,
};

export default apiService;
