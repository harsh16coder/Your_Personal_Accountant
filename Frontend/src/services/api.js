import axios from 'axios';
import { mockAPI } from './mockData';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000';

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


// Auth API calls
export const register = 
  async (userData) => {
    const response = await api.post('/api/auth/register', userData);
    return response.data;
  };

export const login = 
  async (credentials) => {
    const response = await api.post('/api/auth/login', credentials);
    return response.data;
  };

export const getProfile = async () => {
  const response = await api.get('/api/profile');
  return response.data;
};

export const updateProfile = async (profileData) => {
  const response = await api.put('/api/profile', profileData);
  return response.data;
};

export const getAvailableModels = async () => {
  const response = await api.get('/api/models');
  return response.data;
};

export const resetPassword = async (resetData) => {
  const response = await api.post('/api/auth/reset-password', resetData);
  return response.data;
};

export const getSecretKey = async (passwordData) => {
  const response = await api.post('/api/auth/get-secret-key', passwordData);
  return response.data;
};

// Dashboard API calls
export const getDashboard = 
  async () => {
    const response = await api.get('/api/dashboard');
    return response.data;
  };

// Asset API calls
export const getAssets = 
  async () => {
    const response = await api.get('/api/assets');
    return response.data;
  };

export const createAsset = 
  async (assetData) => {
    const response = await api.post('/api/assets', assetData);
    return response.data;
  };

export const updateAsset = async (assetId, assetData) => {
  const response = await api.put(`/api/assets/${assetId}`, assetData);
  return response.data;
};

export const getAssetTypes = async () => {
  const response = await api.get('/api/assets/types');
  return response.data;
};

export const getTentativeAssets = 
  async () => {
    const response = await api.get('/api/tentative-assets');
    return response.data;
  };

export const createTentativeAsset = async (assetData) => {
  const response = await api.post('/api/tentative-assets', assetData);
  return response.data;
};

// Liability API calls
export const getLiabilities = 
  async () => {
    const response = await api.get('/api/liabilities');
    return response.data;
  };

export const createLiability = 
  async (liabilityData) => {
    const response = await api.post('/api/liabilities', liabilityData);
    return response.data;
  };

export const updateLiability = async (liabilityId, liabilityData) => {
  const response = await api.put(`/api/liabilities/${liabilityId}`, liabilityData);
  return response.data;
};

export const getLiabilityTypes = async () => {
  const response = await api.get('/api/liabilities/types');
  return response.data;
};

export const payInstallment = 
  async (liabilityId) => {
    const response = await api.post(`/api/liabilities/${liabilityId}/pay`);
    return response.data;
  };

export const makeLiabilityPayment = async (liabilityId, paymentData) => {
  const response = await api.post(`/api/liabilities/${liabilityId}/pay`, paymentData);
  return response.data;
};

// Recommendation API calls
export const getRecommendations = 
  async () => {
    const response = await api.get('/api/recommendations');
    return response.data;
  };

// Validate if a sessionId exists on the backend
export async function validateSession(sessionId) {
  try {
    const res = await api.get(`/api/sessions/${encodeURIComponent(sessionId)}/validate`);
    return res.data.valid; // true or false
  } catch (err) {
    console.error("Error validating session:", err);
    return false;
  }
};

// Chatbot API calls
export const createChatSession = 
  async (sessionData) => {
    const response = await api.post('/api/sessions', sessionData);
    return response.data;
  };

export const getChatMessages = 
  async (sessionId) => {
    const response = await api.get(`/api/sessions/${sessionId}/messages`);
    return response.data;
  };

export const sendChatMessage = 
  async (messageData) => {
    const response = await api.post('/api/chat', messageData);
    return response.data;
  };

export const resetConversation = async () => {
  const response = await api.post('/api/chat/reset');
  return response.data;
};

// Get chat history for demo
export const getChatHistory = 
  async () => {
    // Real API would implement this
    return [];
  };

export default api;
