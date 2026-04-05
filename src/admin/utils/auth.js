/**
 * JWT Token Management Utilities
 * Handles token storage, retrieval, and clearing
 */

const decodeTokenPayload = (token) => {
  try {
    if (!token || typeof token !== 'string') return null;
    const parts = token.split('.');
    if (parts.length !== 3) return null;
    const payload = atob(parts[1].replace(/-/g, '+').replace(/_/g, '/'));
    return JSON.parse(payload);
  } catch {
    return null;
  }
};

// Get the appropriate token based on role (aToken or dToken)
export const getToken = () => {
  const aToken = localStorage.getItem('aToken');
  const dToken = localStorage.getItem('dToken');
  const pToken = localStorage.getItem('pToken') || localStorage.getItem('token');
  return aToken || dToken || pToken || null;
};

// Get token by specific role
export const getTokenByRole = (role) => {
  if (role === 'ADMIN') {
    return localStorage.getItem('aToken') || null;
  } else if (role === 'DOCTOR') {
    return localStorage.getItem('dToken') || null;
  } else if (role === 'PATIENT') {
    return localStorage.getItem('pToken') || localStorage.getItem('token') || null;
  }
  return null;
};

// Set token based on role
export const setToken = (role, token) => {
  if (!token) return;
  
  if (role === 'ADMIN') {
    localStorage.setItem('aToken', token);
  } else if (role === 'DOCTOR') {
    localStorage.setItem('dToken', token);
  } else if (role === 'PATIENT') {
    localStorage.setItem('pToken', token);
    localStorage.removeItem('token');
  }
};

// Clear all authentication tokens
export const clearTokens = () => {
  localStorage.removeItem('aToken');
  localStorage.removeItem('dToken');
  localStorage.removeItem('pToken');
  localStorage.removeItem('token');
};

// Clear specific role token
export const clearTokenByRole = (role) => {
  if (role === 'ADMIN') {
    localStorage.removeItem('aToken');
  } else if (role === 'DOCTOR') {
    localStorage.removeItem('dToken');
  } else if (role === 'PATIENT') {
    localStorage.removeItem('pToken');
    localStorage.removeItem('token');
  }
};

// Check if user is authenticated
export const isAuthenticated = () => {
  return !!(
    localStorage.getItem('aToken') ||
    localStorage.getItem('dToken') ||
    localStorage.getItem('pToken') ||
    localStorage.getItem('token')
  );
};

// Get current user role based on available token
export const getCurrentRole = () => {
  if (localStorage.getItem('aToken')) return 'ADMIN';
  if (localStorage.getItem('dToken')) return 'DOCTOR';
  if (localStorage.getItem('pToken') || localStorage.getItem('token')) return 'PATIENT';
  return null;
};

export const getCurrentToken = () => {
  if (localStorage.getItem('aToken')) return localStorage.getItem('aToken');
  if (localStorage.getItem('dToken')) return localStorage.getItem('dToken');
  if (localStorage.getItem('pToken')) return localStorage.getItem('pToken');
  if (localStorage.getItem('token')) return localStorage.getItem('token');
  return null;
};

export const getRoleFromToken = (token) => {
  const payload = decodeTokenPayload(token);
  return payload?.role || null;
};

export const isTokenExpired = (token) => {
  const payload = decodeTokenPayload(token);
  if (!payload || !payload.exp) return true;
  return Date.now() >= payload.exp * 1000;
};
