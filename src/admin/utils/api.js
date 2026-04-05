/**
 * API Wrapper with JWT Authentication
 * Automatically attaches Authorization header to requests
 * Handles token refresh and error responses (401/403)
 */

import { clearTokens } from './auth';
import { BACKENDURL as BACKEND_URL } from '../../lib';

/**
 * Enhanced fetch wrapper that:
 * 1. Automatically adds Authorization header with JWT token
 * 2. Handles JSON parsing
 * 3. Handles 401/403 responses by clearing auth and logging out
 * 4. Provides consistent error handling
 */
export async function apiCall(url, options = {}) {
  const token = localStorage.getItem('aToken') || localStorage.getItem('dToken');
  
  // Build headers
  const headers = {
    'Content-Type': 'application/json',
    ...options.headers,
  };

  // Add authorization header if token exists
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  try {
    const response = await fetch(url, {
      ...options,
      headers,
    });

    // Handle 401 Unauthorized - Log out user
    if (response.status === 401) {
      handleAuthError('Session expired. Please login again.');
      return null;
    }

    // Handle 403 Forbidden - Access denied
    if (response.status === 403) {
      handleAuthError('You do not have permission to access this resource.');
      return null;
    }

    // Try to parse response as JSON, fallback to text
    let data;
    const contentType = response.headers.get('content-type');
    
    if (contentType && contentType.includes('application/json')) {
      data = await response.json();
    } else {
      data = await response.text();
    }

    // Handle non-ok responses
    if (!response.ok) {
      throw new Error(
        typeof data === 'string' 
          ? data 
          : data.error || data.message || `HTTP ${response.status}`
      );
    }

    return {
      success: true,
      data: data,
    };

  } catch (error) {
    return {
      success: false,
      error: error.message || 'API request failed',
    };
  }
}

/**
 * GET request helper
 */
export async function apiGet(endpoint) {
  const url = endpoint.startsWith('http') 
    ? endpoint 
    : `${BACKEND_URL}${endpoint}`;
  
  return apiCall(url, {
    method: 'GET',
  });
}

/**
 * POST request helper
 */
export async function apiPost(endpoint, data = {}) {
  const url = endpoint.startsWith('http') 
    ? endpoint 
    : `${BACKEND_URL}${endpoint}`;
  
  return apiCall(url, {
    method: 'POST',
    body: JSON.stringify(data),
  });
}

/**
 * PUT request helper
 */
export async function apiPut(endpoint, data = {}) {
  const url = endpoint.startsWith('http') 
    ? endpoint 
    : `${BACKEND_URL}${endpoint}`;
  
  return apiCall(url, {
    method: 'PUT',
    body: JSON.stringify(data),
  });
}

/**
 * DELETE request helper
 */
export async function apiDelete(endpoint) {
  const url = endpoint.startsWith('http') 
    ? endpoint 
    : `${BACKEND_URL}${endpoint}`;
  
  return apiCall(url, {
    method: 'DELETE',
  });
}

/**
 * Handle authentication errors
 * Dispatches event for app-wide logout (no redirect here, context handles it)
 */
function handleAuthError(message) {
  clearTokens();
  
  // Dispatch custom event for app-wide logout
  // Context will handle the redirect to prevent double-redirects
  window.dispatchEvent(new CustomEvent('auth_error', {
    detail: { message }
  }));
}

/**
 * Get proper API base URL
 */
export function getApiBaseUrl() {
  return BACKEND_URL;
}
