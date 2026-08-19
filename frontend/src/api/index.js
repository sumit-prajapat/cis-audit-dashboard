import axios from 'axios'
import { clearAuthStorage, normalizeApiError } from '../services/apiClient'

const BASE_URL = import.meta.env.VITE_API_URL || ''

// Debug logging in development
if (!import.meta.env.VITE_API_URL) {
  console.warn('⚠️ VITE_API_URL is not set. API requests may fail.')
  console.warn('Expected: https://mk1311-cis-audit-api.hf.space')
  console.warn('Current BASE_URL:', BASE_URL || '(empty)')
}

const AUTH_STORAGE_KEYS = ['access_token', 'token', 'refresh_token', 'csrf_token', 'user']

const api = axios.create({
  baseURL: BASE_URL,
  withCredentials: true,
  headers: { 'Content-Type': 'application/json' }
})

api.interceptors.request.use(config => {
  const token = localStorage.getItem('access_token') || localStorage.getItem('token')
  if (token) config.headers.Authorization = `Bearer ${token}`

  if (['post', 'put', 'patch', 'delete'].includes((config.method || '').toLowerCase())) {
    const csrfToken = localStorage.getItem('csrf_token')
    if (csrfToken) config.headers['X-CSRF-Token'] = csrfToken
  }

  return config
})

api.interceptors.response.use(
  res => res,
  async err => {
    const originalRequest = err.config || {}

    if (err.response?.status === 401 && !originalRequest._retry && !(originalRequest.url || '').includes('/auth/')) {
      originalRequest._retry = true

      try {
        const csrfToken = localStorage.getItem('csrf_token')
        const refreshToken = localStorage.getItem('refresh_token')
        const refreshResponse = await axios.post(
          `${BASE_URL}/auth/refresh`,
          refreshToken ? { refresh_token: refreshToken } : {},
          { withCredentials: true, headers: csrfToken ? { 'X-CSRF-Token': csrfToken } : {} }
        )

        const { access_token, csrf_token, refresh_token } = refreshResponse.data
        localStorage.setItem('access_token', access_token)
        localStorage.setItem('token', access_token)
        if (csrf_token) localStorage.setItem('csrf_token', csrf_token)
        if (refresh_token) localStorage.setItem('refresh_token', refresh_token)

        originalRequest.headers = originalRequest.headers || {}
        originalRequest.headers.Authorization = `Bearer ${access_token}`
        if (csrf_token) originalRequest.headers['X-CSRF-Token'] = csrf_token
        return api(originalRequest)
      } catch (refreshError) {
        clearAuthStorage()
        window.location.href = '/login'
        return Promise.reject(refreshError)
      }
    }

    return Promise.reject(err)
  }
)

export const extractApiErrorMessage = (error) => normalizeApiError(error)

export const readStoredUser = () => {
  try {
    return JSON.parse(localStorage.getItem('user') || '{}') || {}
  } catch {
    localStorage.removeItem('user')
    return {}
  }
}

export const hasAuthToken = () => Boolean(localStorage.getItem('access_token') || localStorage.getItem('token'))

export const persistAuth = (data = {}) => {
  if (data.access_token) {
    localStorage.setItem('access_token', data.access_token)
    localStorage.setItem('token', data.access_token)
  }
  if (data.refresh_token) localStorage.setItem('refresh_token', data.refresh_token)
  if (data.csrf_token) localStorage.setItem('csrf_token', data.csrf_token)
  localStorage.setItem('user', JSON.stringify({
    ...readStoredUser(),
    ...data,
  }))
}

export const clearSession = () => {
  AUTH_STORAGE_KEYS.forEach(key => localStorage.removeItem(key))
}

export const refreshSession = async () => {
  const refreshToken = localStorage.getItem('refresh_token')
  const response = await api.post('/auth/refresh', refreshToken ? { refresh_token: refreshToken } : {})
  persistAuth(response.data)
  return response.data
}

export const register = d => api.post('/auth/register', d)
export const login = d => api.post('/auth/login', new URLSearchParams(d), {
  headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
})
export const getMe = () => api.get('/auth/me')

export const getScans = () => api.get('/api/scans')
export const getScan = id => api.get(`/api/scans/${id}`)
export const getDevices = () => api.get('/api/devices')
export const downloadReport = id => `${BASE_URL}/api/reports/${id}/pdf`

export const getOrg = () => api.get('/orgs/me')
export const updateOrg = body => api.put('/orgs/me', body)
export const inviteMember = body => api.post('/orgs/invite', body)
export const getInvite = token => api.get(`/orgs/invite/${token}`)
export const acceptInvite = (token, body) => api.post(`/orgs/invite/${token}/accept`, body)
export const revokeInvite = inviteId => api.delete(`/orgs/invite/${inviteId}`)
export const removeMember = userId => api.delete(`/orgs/members/${userId}`)
export const changeMemberRole = (userId, role) => api.put(`/orgs/members/${userId}/role`, { role })

export const getBillingStatus = () => api.get('/billing/status')
export const createCheckout = plan => api.post(`/billing/checkout?plan=${plan}`)
export const createPortal = () => api.post('/billing/portal')

export const logout = () => api.post('/auth/logout')

export default api
