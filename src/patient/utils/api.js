/**
 * Patient API Wrapper with Optional JWT Authentication
 * Automatically attaches Authorization header if patient is logged in
 * Handles token refresh and error responses (401/403)
 */

import { clearTokens } from '../../admin/utils/auth';
import { BACKENDURL as BACKEND_URL } from '../../lib';

/**
 * Enhanced fetch wrapper for patient APIs
 * Similar to admin API wrapper but optional JWT
 */
export async function patientApiCall(url, options = {}) {
  const token = localStorage.getItem('pToken') || localStorage.getItem('token');
  const useAuth = options.useAuth !== false;
  
  // Build headers
  const headers = {
    'Content-Type': 'application/json',
    ...options.headers,
  };

  // Add authorization header if token exists (for authenticated patient endpoints)
  if (token && useAuth) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  try {
    const response = await fetch(url, {
      ...options,
      headers,
    });

    // Handle 401 Unauthorized
    if (response.status === 401) {
      if (!token) {
        return {
          success: false,
          error: 'Unauthorized',
          status: 401,
        };
      }
      handleAuthError('Session expired. Please login again.');
      return null;
    }

    // Handle 403 Forbidden
    if (response.status === 403) {
      if (!token) {
        return {
          success: false,
          error: 'Forbidden',
          status: 403,
        };
      }
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
          : data.message || `HTTP ${response.status}`
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
 * GET request helper for patient APIs
 */
export async function patientApiGet(endpoint, options = {}) {
  const url = endpoint.startsWith('http') 
    ? endpoint 
    : `${BACKEND_URL}${endpoint}`;
  
  return patientApiCall(url, {
    method: 'GET',
    ...options,
  });
}

/**
 * POST request helper for patient APIs
 */
export async function patientApiPost(endpoint, data = {}, options = {}) {
  const url = endpoint.startsWith('http') 
    ? endpoint 
    : `${BACKEND_URL}${endpoint}`;
  
  return patientApiCall(url, {
    method: 'POST',
    body: JSON.stringify(data),
    ...options,
  });
}

/**
 * PUT request helper for patient APIs
 */
export async function patientApiPut(endpoint, data = {}, options = {}) {
  const url = endpoint.startsWith('http')
    ? endpoint
    : `${BACKEND_URL}${endpoint}`;

  return patientApiCall(url, {
    method: 'PUT',
    body: JSON.stringify(data),
    ...options,
  });
}

/**
 * DELETE request helper for patient APIs
 */
export async function patientApiDelete(endpoint, options = {}) {
  const url = endpoint.startsWith('http')
    ? endpoint
    : `${BACKEND_URL}${endpoint}`;

  return patientApiCall(url, {
    method: 'DELETE',
    ...options,
  });
}

/**
 * File download helper for patient APIs
 */
export async function patientApiDownload(endpoint) {
  const token = localStorage.getItem('pToken') || localStorage.getItem('token');
  const url = endpoint.startsWith('http')
    ? endpoint
    : `${BACKEND_URL}${endpoint}`;

  const response = await fetch(url, {
    method: 'GET',
    headers: token ? { Authorization: `Bearer ${token}` } : {},
  });

  if (response.status === 401 || response.status === 403) {
    handleAuthError(response.status === 401
      ? 'Session expired. Please login again.'
      : 'You do not have permission to access this resource.');
    return null;
  }

  if (!response.ok) {
    const text = await response.text();
    throw new Error(text || `HTTP ${response.status}`);
  }

  return response.blob();
}

/**
 * Handle authentication errors
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
export function getPatientApiBaseUrl() {
  return BACKEND_URL;
}
