import axios from 'axios';
import { mockAPI } from './mockData';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000';
const USE_MOCK_DATA = process.env.REACT_APP_USE_MOCK === 'true' || true; // Use mock data by default

// Create axios instance with default config
const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add auth token to requests
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('access_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Handle auth errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('access_token');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// Helper function to decide between mock and real API
const selectAPI = (mockFunction, realFunction) => {
  return USE_MOCK_DATA ? mockFunction : realFunction;
};

// Auth API calls
export const register = USE_MOCK_DATA ? 
  mockAPI.register : 
  async (userData) => {
    const response = await api.post('/api/auth/register', userData);
    return response.data;
  };

export const login = USE_MOCK_DATA ? 
  mockAPI.login : 
  async (credentials) => {
    const response = await api.post('/api/auth/login', credentials);
    return response.data;
  };

export const resetPassword = async (resetData) => {
  const response = await api.post('/api/auth/reset-password', resetData);
  return response.data;
};

export const getProfile = async () => {
  const response = await api.get('/api/auth/profile');
  return response.data;
};

export const updateProfile = async (profileData) => {
  const response = await api.put('/api/auth/profile', profileData);
  return response.data;
};

// Dashboard API calls
export const getDashboard = USE_MOCK_DATA ? 
  mockAPI.getDashboard : 
  async () => {
    const response = await api.get('/api/dashboard');
    return response.data;
  };

// Asset API calls
export const getAssets = USE_MOCK_DATA ? 
  mockAPI.getAssets : 
  async () => {
    const response = await api.get('/api/assets');
    return response.data;
  };

export const createAsset = USE_MOCK_DATA ? 
  mockAPI.createAsset : 
  async (assetData) => {
    const response = await api.post('/api/assets', assetData);
    return response.data;
  };

export const getTentativeAssets = USE_MOCK_DATA ? 
  mockAPI.getTentativeAssets : 
  async () => {
    const response = await api.get('/api/tentative-assets');
    return response.data;
  };

export const createTentativeAsset = async (assetData) => {
  const response = await api.post('/api/tentative-assets', assetData);
  return response.data;
};

// Liability API calls
export const getLiabilities = USE_MOCK_DATA ? 
  mockAPI.getLiabilities : 
  async () => {
    const response = await api.get('/api/liabilities');
    return response.data;
  };

export const createLiability = USE_MOCK_DATA ? 
  mockAPI.createLiability : 
  async (liabilityData) => {
    const response = await api.post('/api/liabilities', liabilityData);
    return response.data;
  };

export const payInstallment = USE_MOCK_DATA ? 
  mockAPI.payInstallment : 
  async (liabilityId) => {
    const response = await api.post(`/api/liabilities/${liabilityId}/pay`);
    return response.data;
  };

// Recommendation API calls
export const getRecommendations = USE_MOCK_DATA ? 
  mockAPI.getRecommendations : 
  async () => {
    const response = await api.get('/api/recommendations');
    return response.data;
  };

// Chatbot API calls
export const sendChatMessage = USE_MOCK_DATA ? 
  mockAPI.sendChatMessage : 
  async (messageData) => {
    const response = await api.post('/api/chat/', messageData);
    return response.data;
  };

export const resetConversation = async () => {
  const response = await api.post('/api/chat/reset');
  return response.data;
};

// Get chat history for demo
export const getChatHistory = USE_MOCK_DATA ? 
  mockAPI.getChatHistory : 
  async () => {
    // Real API would implement this
    return [];
  };

export default api;