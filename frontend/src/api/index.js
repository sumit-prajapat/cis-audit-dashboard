import axios from 'axios'

// In production (Vercel), set VITE_API_URL to your Railway backend URL
// In development, requests proxy through Vite to localhost:8000
const BASE_URL = import.meta.env.VITE_API_URL || ''

const api = axios.create({
  baseURL: BASE_URL,
  headers: { 'Content-Type': 'application/json' }
})

// Attach JWT token if present
api.interceptors.request.use(config => {
  const token = localStorage.getItem('token')
  if (token) config.headers.Authorization = `Bearer ${token}`
  return config
})

export const getScans       = ()   => api.get('/api/scans')
export const getScan        = (id) => api.get(`/api/scans/${id}`)
export const getDevices     = ()   => api.get('/api/devices')
export const downloadReport = (id) => `${BASE_URL}/api/reports/${id}/pdf`
export const login          = (d)  => api.post('/auth/login', d)
export const register       = (d)  => api.post('/auth/register', d)

export default api