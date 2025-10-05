// Authentication utilities for JWT token handling

// Simple JWT decoder (no verification - server handles that)
export const decodeToken = (token) => {
  try {
    const base64Url = token.split('.')[1];
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const jsonPayload = decodeURIComponent(
      atob(base64)
        .split('')
        .map(function (c) {
          return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
        })
        .join('')
    );
    return JSON.parse(jsonPayload);
  } catch (error) {
    console.error('Error decoding token:', error);
    return null;
  }
};

// Get current user ID from stored token
export const getCurrentUserId = () => {
  const token = localStorage.getItem('access_token');
  if (!token) return null;
  
  const decoded = decodeToken(token);
  return decoded?.user_id || null;
};

// Check if user is authenticated
export const isAuthenticated = () => {
  const token = localStorage.getItem('access_token');
  if (!token) return false;
  
  const decoded = decodeToken(token);
  if (!decoded) {
    // If token can't be decoded, remove it
    localStorage.removeItem('access_token');
    return false;
  }
  
  // Check if token is expired
  const currentTime = Date.now() / 1000;
  if (decoded.exp <= currentTime) {
    // Token is expired, remove it
    localStorage.removeItem('access_token');
    return false;
  }
  
  return true;
};

// Get current user info from stored token
export const getCurrentUser = () => {
  const token = localStorage.getItem('access_token');
  if (!token) return null;
  
  const decoded = decodeToken(token);
  if (!decoded) return null;
  
  return {
    user_id: decoded.user_id,
    exp: decoded.exp,
    iat: decoded.iat
  };
};

// Clear authentication data
export const clearAuth = () => {
  localStorage.removeItem('access_token');
  localStorage.removeItem('chatSessionId');
};