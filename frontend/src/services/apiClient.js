import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || '';

// Debug logging
if (!import.meta.env.VITE_API_URL) {
  console.warn('⚠️ VITE_API_URL is not set. API requests may fail.')
  console.warn('Expected: https://mk1311-cis-audit-api.hf.space')
}

const apiClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: 30000,
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
  },
});

apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('access_token') || localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    if (['post', 'put', 'patch', 'delete'].includes((config.method || '').toLowerCase())) {
      const csrfToken = localStorage.getItem('csrf_token');
      if (csrfToken) {
        config.headers['X-CSRF-Token'] = csrfToken;
      }
    }

    return config;
  },
  (error) => Promise.reject(error)
);

apiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config || {};

    if (error.response?.status === 401 && !originalRequest._retry && !(originalRequest.url || '').includes('/auth/')) {
      originalRequest._retry = true;

      try {
        const csrfToken = localStorage.getItem('csrf_token');
        const refreshToken = localStorage.getItem('refresh_token');
        const response = await axios.post(
          `${API_BASE_URL}/auth/refresh`,
          refreshToken ? { refresh_token: refreshToken } : {},
          {
            withCredentials: true,
            headers: csrfToken ? { 'X-CSRF-Token': csrfToken } : {},
          }
        );

        const { access_token, csrf_token, refresh_token } = response.data;
        localStorage.setItem('access_token', access_token);
        localStorage.setItem('token', access_token);
        if (refresh_token) {
          localStorage.setItem('refresh_token', refresh_token);
        }
        if (csrf_token) {
          localStorage.setItem('csrf_token', csrf_token);
        }

        originalRequest.headers = originalRequest.headers || {};
        originalRequest.headers.Authorization = `Bearer ${access_token}`;
        if (csrf_token) {
          originalRequest.headers['X-CSRF-Token'] = csrf_token;
        }
        return apiClient(originalRequest);
      } catch (refreshError) {
        clearAuthStorage();
        window.location.href = '/login';
        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  }
);

const requestCache = new Map();
const CACHE_DURATION = 5 * 60 * 1000;

const FIELD_LABELS = {
  email: 'Email',
  username: 'Email',
  password: 'Password',
  full_name: 'Full name',
  org_name: 'Organization name',
  remember_me: 'Remember me',
  token: 'Token',
};

const formatValidationMessage = (item) => {
  const fieldKey = Array.isArray(item?.loc) ? item.loc[item.loc.length - 1] : null;
  const fieldLabel = FIELD_LABELS[fieldKey] || (fieldKey ? fieldKey.replace(/_/g, ' ').replace(/\b\w/g, (char) => char.toUpperCase()) : 'This field');
  const message = String(item?.msg || '').trim();

  if (item?.type === 'missing' || /Field required/i.test(message)) {
    return `${fieldLabel} is required.`;
  }

  if (/valid email address/i.test(message)) {
    return 'Email must be a valid email address.';
  }

  if (/at least\s+\d+/i.test(message) && fieldLabel === 'Password') {
    return message.endsWith('.') ? message : `${message}.`;
  }

  return message ? (message.endsWith('.') ? message : `${message}.`) : 'Please check the highlighted fields.';
};

export const normalizeApiError = (error) => {
  const detail = error?.response?.data?.detail;
  if (typeof detail === 'string') return detail;
  if (Array.isArray(detail)) {
    return detail.map((item) => formatValidationMessage(item)).join(' ');
  }
  if (detail && typeof detail === 'object') {
    if (detail.message) return detail.message;
    return Object.values(detail).map((value) => String(value)).join(', ');
  }
  if (error?.response?.data?.error?.message) return error.response.data.error.message;
  return error?.message || 'An unexpected error occurred';
};

export const apiGet = async (url, options = {}) => {
  const cacheKey = `${url}${JSON.stringify(options)}`;
  const cached = requestCache.get(cacheKey);

  if (cached && Date.now() - cached.timestamp < CACHE_DURATION) {
    return cached.data;
  }

  try {
    const response = await apiClient.get(url, options);
    requestCache.set(cacheKey, {
      data: response.data,
      timestamp: Date.now(),
    });
    return response.data;
  } catch (error) {
    handleApiError(error);
    throw error;
  }
};

export const apiPost = async (url, data, options = {}) => {
  try {
    const response = await apiClient.post(url, data, options);
    requestCache.clear();
    return response.data;
  } catch (error) {
    handleApiError(error);
    throw error;
  }
};

export const apiPut = async (url, data, options = {}) => {
  try {
    const response = await apiClient.put(url, data, options);
    requestCache.clear();
    return response.data;
  } catch (error) {
    handleApiError(error);
    throw error;
  }
};

export const apiDelete = async (url, options = {}) => {
  try {
    const response = await apiClient.delete(url, options);
    requestCache.clear();
    return response.data;
  } catch (error) {
    handleApiError(error);
    throw error;
  }
};

export const clearAuthStorage = () => {
  localStorage.removeItem('access_token');
  localStorage.removeItem('token');
  localStorage.removeItem('refresh_token');
  localStorage.removeItem('csrf_token');
  localStorage.removeItem('user');
};

const handleApiError = (error) => {
  if (error.response) {
    console.error('API Error:', {
      status: error.response.status,
      data: error.response.data,
    });
  } else if (error.request) {
    console.error('Network Error:', error.message);
  } else {
    console.error('Error:', error.message);
  }
};

export default apiClient;
